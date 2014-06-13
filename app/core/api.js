/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

// Wrapper around the Tidepool client library

var _ = window._;
var async = window.async;
var bows = window.bows;
var config = window.config;
var moment = window.moment;
var Rx = window.Rx;
var tidepool = window.tidepool;

// devicedata just registers stuff on the Rx prototype,
// so we are doing this for the side-effects
var deviceData = require('./lib/devicedata');
var migrations = require('./lib/apimigrations');

var api = {
  log: bows('Api')
};

api.init = function(cb) {
  var tidepoolLog = bows('Tidepool');
  tidepool = tidepool({
    host: config.API_HOST,
    uploadApi: config.UPLOAD_API,
    log: {
      warn: tidepoolLog,
      info: tidepoolLog,
      debug: tidepoolLog
    },
    localStore: window.localStorage,
    metricsSource: 'blip',
    metricsVersion: config.VERSION
  });

  api.tidepool = tidepool;

  tidepool.initialize(function() {
    api.log('Initialized');
    cb();
  });
};

// ----- User -----

api.user = {};

api.user.isAuthenticated = function() {
  return tidepool.isLoggedIn();
};

api.user.login = function(user, options, cb) {
  api.log('POST /user/login');

  options = options || {};
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  tidepool.login(user, options, function(err, data) {
    if (err) {
      return cb(err);
    }

    cb();
  });
};

api.user.signup = function(user, cb) {
  api.log('POST /user');

  var newAccount = accountFromUser(user);
  var newProfile = profileFromUser(user);

  // First, create user account
  tidepool.signup(newAccount, function(err, account) {
    if (err) {
      return cb(err);
    }

    var userId = account.userid;

    // Then, add additional user info (full name, etc.) to profile
    newProfile.id = userId;
    tidepool.addOrUpdateProfile(newProfile, function(err, results) {
      if (err) {
        return cb(err);
      }

      cb(null, userFromAccountAndProfile(
        {
          account: account,
          profile: results
        }
      ));
    });
  });
};

api.user.logout = function(cb) {
  api.log('POST /user/logout');

  if (!api.user.isAuthenticated()) {
    return;
  }

  tidepool.logout(function(err) {
    if (err) {
      return cb(err);
    }

    cb();
  });
};

api.user.destroySession = function() {
  tidepool.destroySession();
};

api.user.get = function(cb) {
  api.log('GET /user');

  var userId = tidepool.getUserId();

  // Fetch user account data (username, etc.)...
  var getAccount = tidepool.getCurrentUser.bind(tidepool);

  // ...and user profile information (full name, etc.)
  var getProfile = function(cb) {
    tidepool.findProfile(userId, function(err, profile) {
      if (err) {
        return cb(err);
      }

      var migration = migrations.profileFullName;
      if (migration.isRequired(profile)) {
        api.log('Migrating and saving user [' + userId + '] profile to "fullName"');
        profile = migration.migrate(profile);
        profile.id = userId;
        return tidepool.addOrUpdateProfile(profile, cb);
      }

      return cb(null, profile);
    });
  };

  async.parallel({
    account: getAccount,
    profile: getProfile
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    cb(null, userFromAccountAndProfile(results));
  });
};

api.user.put = function(user, cb) {
  api.log('PUT /user');

  async.parallel({
    account: tidepool.updateCurrentUser.bind(tidepool, accountFromUser(user)),
    profile: tidepool.addOrUpdateProfile.bind(tidepool, profileFromUser(user))
  },
  function(err, results) {
    if (err) {
      return cb(err);
    }

    cb(null, userFromAccountAndProfile(results));
  });
};

function accountFromUser(user) {
  var account = _.pick(user, 'username', 'password');

  if (account.username) {
    account.emails = [user.username];
  }

  return account;
}

function profileFromUser(user) {
  var profile = _.omit(user, 'username', 'password', 'emails');
  return profile;
}

function userFromAccountAndProfile(results) {
  var account = results.account;
  var profile = results.profile;

  var user = _.assign({}, profile, {
    id: account.userid,
    username: account.username
  });

  // If user profile has patient data, just give the "patient id"
  // (which is the same as the userid for this backend)
  if (user.patient != null) {
    user.patient = {id: user.id};
  }

  return user;
}

// ----- Patient -----

api.patient = {};

function patientFromUserProfile(profile) {
  // Merge user profile attributes with patient
  var patient = profile && profile.patient;
  if (!patient) {
    return;
  }

  patient.fullName = profile.fullName;
  return patient;
}

function getUserProfile(userId, cb) {

  tidepool.findProfile(userId, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var migration = migrations.profileFullName;
    if (migration.isRequired(profile)) {
      api.log('Migrating user [' + userId + '] profile to "fullName"');
      profile = migration.migrate(profile);
    }

    profile.id = userId;
    return cb(null, profile);
  });
}

function getPatientProfile(patientId, cb) {
  return getUserProfile(patientId, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var patient = patientFromUserProfile(profile);
    if (!patient) {
      return cb();
    }

    patient.id = patientId;
    return cb(null, patient);
  });
}

api.patient.get = function(patientId, cb) {
  api.log('GET /patients/' + patientId);

  var userId = tidepool.getUserId();

  getPatientProfile(patientId, function(err, patient) {
    if (err) {
      return cb(err);
    }

    if (!patient) {
      // No patient profile for this user yet, return "not found"
      return cb({status: 404, response: 'Not found'});
    }

    // If this is not the current user's patient, we're done
    if (patientId !== userId) {
      return cb(null, patient);
    }

    // Fetch the patient's team
    tidepool.getTeamMembers(userId, function(err, teamMembers) {
      if (err != null) {
        return cb(err);
      }

      if (teamMembers == null) {
        return cb(null, patient);
      }

      async.map(Object.keys(_.omit(teamMembers, userId)), getUserProfile, function(err, people) {
        // Filter any people ids that returned nothing
        people = _.filter(people);
        patient.team = people;
        return cb(null, patient);
      });
    });
  });
};

api.patient.post = function(patient, cb) {
  api.log('POST /patients');
  var patientId = tidepool.getUserId();

  // First, create patient profile for user
  // For this backend, patient data is contained in the `patient`
  // attribute of the user's profile
  patient = _.omit(patient, 'fullName');
  var profile = {id: patientId, patient: patient};
  tidepool.addOrUpdateProfile(profile, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var patient = patientFromUserProfile(profile);
    patient.id = patientId;
    patient.team = [];
    cb(null, patient);
  });
};

api.patient.put = function(patientId, patient, cb) {
  api.log('PUT /patients/' + patientId);

  // Hang on to team, add back after update
  var team = patient.team;

  // Don't save info already in user's profile, or team
  patient = _.omit(patient, 'id', 'fullName', 'team');

  var profile = {id: patientId, patient: patient};
  tidepool.addOrUpdateProfile(profile, function(err, profile) {
    if (err) {
      return cb(err);
    }

    var patient = patientFromUserProfile(profile);
    patient.id = patientId;
    if (team) {
      patient.team = team;
    }

    return cb(null, patient);
  });
};

// Get all patient profiles in current user's "patients" group
api.patient.getAll = function(cb) {
  api.log('GET /patients');

  var userId = tidepool.getUserId();

  // First, get a list of of patient ids in user's "patients" group
  tidepool.getViewableUsers(userId, function(err, users) {
    if (err!= null) {
      return cb(err);
    }

    if (users == null) {
      return cb(null, []);
    }

    // Second, get the patient profile info for each patient id
    async.map(Object.keys(_.omit(users, userId)), getPatientProfile, function(err, patients) {
      if (err != null) {
        api.log('Error when fetching profiles for viewable users', userId, err);
      }
      // Filter any patient ids that returned nothing
      return cb(null, _.filter(patients));
    });
  });
};

// ----- Team data -----
api.team = {};

//Get all messages for the given thread
api.team.getMessageThread = function(messageId,cb){
  api.log('GET /message/thread');

  tidepool.getMessageThread(messageId, function(error,messages){
    if(error){
      return cb(error);
    }

    messages = _.sortBy(messages, 'timestamp');

    return cb(null,messages);
  });
};

//Get all notes (parent messages) for the given team
api.team.getNotes = function(userId,cb){
  api.log('GET /message/notes');

  //at present we are not using the date range
  var dateRange = null;

  tidepool.getNotesForUser(userId, dateRange, function(error,messages){
    if(error){
      return cb(error);
    }
    //transform so that they are how Tideline renders them
    messages = _.map(messages, function(message) {
      return {
        utcTime : message.timestamp,
        messageText : message.messagetext,
        parentMessage : message.parentmessage,
        type: 'message',
        id: message.id
      };
    });
    return cb(null,messages);
  });
};

//Add a comment
api.team.replyToMessageThread = function(message,cb){
  api.log('POST /message/reply');

  tidepool.replyToMessageThread(message, function(error,replyId){
    if (error) {
      return cb(error);
    }
    cb(null, replyId);
  });
};

//New message
api.team.startMessageThread = function(message,cb){
  api.log('POST /message/send');

  tidepool.startMessageThread(message, function(error,messageId){
    if (error) {
      return cb(error);
    }
    cb(null, messageId);
  });
};

// ----- Patient data -----

api.patientData = {};

api.patientData.get = function(patientId, cb) {
  api.log('GET /data/' + patientId);

  tidepool.getDeviceDataForUser(patientId, function(err, data) {
    if (err) {
      return cb(err);
    }

    var now = Date.now();
    window.inData = data;
    Rx.Observable.fromArray(data)
      .map(function(e){
             if (e.time != null) {
               if (e.timezoneOffset == null) {
                 e.deviceTime = moment.utc(e.time).format('YYYY-MM-DDTHH:mm:ss');
               } else {
                 // Moment timezone offsets are the number of minutes to add to the *local* time to make UTC,
                 // which is backwards from what we do (and the sign on the UTC timezone offset)
                 e.deviceTime = moment(e.time).zone(-e.timezoneOffset).format('YYYY-MM-DDTHH:mm:ss');
               }
             }
             return e;
           })
      .map(function(e){
                 if (e.time != null) {
                   if (e.type === 'cbg' || e.type === 'smbg') {
                     return _.assign({}, e, {value: e.value * 18.01559});
                   }
                 }
                 return e;
               })
      .tidepoolConvertBasal()
      .tidepoolConvertBolus()
      .tidepoolConvertWizard()
      .toArray()
      .subscribe(function(data) {
                   api.log('Processing completed in ' + (Date.now() - now) + ' millis.');
                   window.theData = data;
                   cb(null, data);
                 },
                 cb);
  });
};

// ----- Upload -----

api.getUploadUrl = function() {
  return tidepool.getUploadUrl();
};

// ----- Metrics -----

api.metrics = {};

api.metrics.track = function(eventName, properties, cb) {
  api.log('GET /metrics/' + window.encodeURIComponent(eventName));

  return tidepool.trackMetric(eventName, properties, cb);
};

// ----- Errors -----

api.errors = {};

api.errors.log = function(error, message, properties) {
  api.log('POST /errors');

  return tidepool.logAppError(error, message, properties);
};

module.exports = api;
