// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';

var _ = require('lodash');

var sessionTokenHeader = 'x-tidepool-session-token';
var tokenLocalKey = 'authToken';

function defaultProperty(obj, property, defaultValue) {
  if (obj[property] == null) {
    obj[property] = defaultValue;
  }
  return obj;
}

function requireProperty(objectName, obj, property) {
  var value = obj[property];
  if (value == null) {
    throw new Error('Property [' + property + '] required on ' + objectName);
  }
  return value;
}

var requireConfig = requireProperty.bind(null, 'config');
var requireDep = requireProperty.bind(null, 'deps');

module.exports = function (config, deps) {
  var myToken = null;
  var myUserId = null;

  // This is a 'version' counter for the number of times we've logged in.
  // It is used to invalidate stale attempts at refreshing a token
  var loginVersion = 0;

  //Status Codes
  var STATUS_BAD_REQUEST = 400;
  var STATUS_UNAUTHORIZED = 401;

  var superagent = requireDep(deps, 'superagent');
  var log = requireDep(deps, 'log');
  var localStore = requireDep(deps, 'localStore');

  config = _.clone(config);
  defaultProperty(config, 'tokenRefreshInterval', 10 * 60 * 1000); // 10 minutes
  requireConfig(config, 'host');
  requireConfig(config, 'metricsSource');
  requireConfig(config, 'metricsVersion');
  // now clean up source so that it doesn't have any dashes
  // this way, the first dash in the eventname will be the separator for the source
  config.metricsSource = config.metricsSource.replace(/-/g, ' ');


  /*
   Make the URL
   */
  function makeUrl(path, extra) {
    var result = config.host + path;
    if (extra) {
      result += '/' + extra;
    }
    return result;
  }

  /*
   Handle an HTTP error (status code !== 2xx)
   Create an error object and pass it to callback
   */
  function handleHttpError(res, cb) {
    var err = {status: res.status, body: res.body};
    return cb(err);
  }

  /**
   * Refresh a users token
   *
   * @param token a user token
   * @returns {cb}  cb(err, response)
   * @param cb
   */
  function refreshUserToken(token, cb) {
    superagent.get(makeUrl('/auth/login'))
      .set(sessionTokenHeader, token)
      .end(
      function (err, res) {
        if (err) {
          return cb(err, null);
        }

        if (res.status !== 200) {
          return handleHttpError(res, cb);
        }

        return cb(null, {userid: res.body.userid, token: res.headers[sessionTokenHeader]});
      });
  }

  function saveSession(newUserId, newToken, options) {
    options = options || {};
    myToken = newToken;
    myUserId = newUserId;

    // Store and increment the loginVersion.  This is a mechanism to nullify any refreshSession calls that
    // are waiting for their timeout to run.
    var currVersion = ++loginVersion;

    if (newToken == null) {
      localStore.removeItem(tokenLocalKey);
      log.info('Destroyed local session');
      return;
    }

    log.info('Session saved');

    if (options.remember) {
      localStore.setItem(tokenLocalKey, newToken);
      log.info('Saved session locally');
    }

    var refreshSession = function() {
      if (myToken == null || currVersion !== loginVersion) {
        log.info('Stopping session token refresh for version', currVersion);
        return;
      }

      log.info('Refreshing session token');
      refreshUserToken(myToken, function(err, data) {
        var hasNewSession = data && data.userid && data.token;
        if (err || !hasNewSession) {
          log.warn('Failed refreshing session token', err);
          saveSession(null, null);
        } else {
          saveSession(data.userid, data.token, options);
        }
      });
    };

    setTimeout(refreshSession, config.tokenRefreshInterval);
  }

  function destroySession() {
    return saveSession(null, null);
  }

  function isLoggedIn() {
    return myToken != null;
  }

  function getUserId() {
    return myUserId;
  }

  function getUploadUrl() {
    if (config.uploadApi == null || myToken == null) {
      return null;
    }
    return config.uploadApi + '?token=' + myToken;
  }

  function withToken(sadCb, happyCb) {
    if (! isLoggedIn()) {
      return sadCb({status: STATUS_UNAUTHORIZED, body: 'User is not logged in, you must log in to do this operation'});
    } else {
      return happyCb(myToken);
    }
  }

  /*
   * do a GET with the stored token
   *
   * @param path path to resource
   * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
   *  e.g. { 200: function(res){ return res.body.messages; } }
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function doGetWithToken(path, codes, cb) {
    //if the cb is not defined and the codes param is a function then set that
    //to be the cb
    if (cb == null && typeof(codes) === 'function') {
      cb = codes;
      codes = {
        200: function(res) { return res.body; }
      };
    }

    return withToken(cb, function(token) {
      superagent
        .get(makeUrl(path))
        .set(sessionTokenHeader, token)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }

          if (_.has(codes, res.status)) {
            var handler = codes[res.status];
            if (typeof(handler) === 'function') {
              return cb(null, handler(res));
            } else {
              return cb(null, handler);
            }
          }

          return handleHttpError(res, cb);
        });
    });
  }

  /*
   * do a POST with the stored token
   *
   * @param path path to resource
   * @param data to send
   * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
   *  e.g. { 201: function(res){ return res.body.id; } }
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function doPostWithToken(path, data, codes, cb) {
    if (cb == null && typeof(codes) === 'function') {
      cb = codes;
      codes = {
        200: function(res) { return res.body; }
      };
    }

    return withToken(cb, function(token) {
      superagent
        .post(makeUrl(path))
        .send(data)
        .set(sessionTokenHeader, token)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }

          if (_.has(codes, res.status)) {
            var handler = codes[res.status];
            if (typeof(handler) === 'function') {
              return cb(null, handler(res));
            } else {
              return cb(null, handler);
            }
          }

          return handleHttpError(res, cb);
        });
    });
  }

  /*
   * do a PUT with the stored token
   *
   * @param path path to resource
   * @param data to send
   * @param codes (optional) defaults to { 200: function(res){ return res.body; }}
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function doPutWithToken(path, data, codes, cb) {
    if (cb == null && typeof(codes) === 'function') {
      cb = codes;
      codes = {
        200: function(res) { return res.body; }
      };
    }

    return withToken(cb, function(token) {
      superagent
        .put(makeUrl(path))
        .send(data)
        .set(sessionTokenHeader, token)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }

          if (_.has(codes, res.status)) {
            var handler = codes[res.status];
            if (typeof(handler) === 'function') {
              return cb(null, handler(res));
            } else {
              return cb(null, handler);
            }
          }

          return handleHttpError(res, cb);
        });
    });
  }

  function assertArgumentsSize(argumentsObj, length) {
    if (argumentsObj.length !== length) {
      throw new Error('Expected arguments to be length ' + length + ' but was ' + argumentsObj.length);
    }
  }

  return {
    /**
     * Initialize client
     *
     * @param cb
     */
    initialize: function(cb) {
      myToken = localStore.getItem(tokenLocalKey);

      if (myToken == null) {
        log.info('No local session found');
        return cb();
      }

      refreshUserToken(myToken, function(err, data) {
        var hasNewSession = data && data.userid && data.token;

        if (err || !hasNewSession) {
          log.info('Local session invalid', err, data);
          saveSession(null, null);
          return cb();
        }

        log.info('Loaded local session');
        saveSession(data.userid, data.token, {remember:true});
        cb(null, {userid: data.userid, token: data.token});
      });
    },
    /**
     * Login user to the Tidepool platform
     *
     * @param user object with a username and password to login
     * @param options (optional) object with `remember` boolean attribute
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    login: function (user, options, cb) {
      if (user.username == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'Must specify a username' });
      }
      if (user.password == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'Must specify a password' });
      }

      options = options || {};
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      superagent
        .post(makeUrl('/auth/login', user.longtermkey))
        .auth(user.username, user.password)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err, null);
          }

          if (res.status !== 200) {
            return handleHttpError(res, cb);
          }

          var theUserId = res.body.userid;
          var theToken = res.headers[sessionTokenHeader];

          saveSession(theUserId, theToken, options);
          return cb(null,{userid: theUserId, user: res.body});
        });
    },
    /**
     * Signup user to the Tidepool platform
     *
     * @param user object with a username and password
     * @param options (optional) object with `remember` boolean attribute
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    signup: function (user, options, cb) {
      if (user.username == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'Must specify a username' });
      }
      if (user.password == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'Must specify a password' });
      }

      options = options || {};
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      var newUser = _.pick(user, 'username', 'password', 'emails');

      superagent
        .post(makeUrl('/auth/user'))
        .send(newUser)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }
          var theUserId = res.body.userid;
          var theToken = res.headers[sessionTokenHeader];

          saveSession(theUserId, theToken, options);
          return cb(null,res.body);
        });

    },
    /**
     * Logout user
     *
     * @returns {cb}  cb(err, response)
     */
    logout: function (cb) {
      assertArgumentsSize(arguments, 1);

      if (! this.isLoggedIn()) {
        setTimeout(function(){ cb(null, {}); }, 0);
      }

      var onSuccess=function(res){
        saveSession(null, null);
        return res.body;
      };

      doPostWithToken(
        '/auth/logout',
        {},
        {200: onSuccess},
        cb
      );
    },
    /**
     * Tells if the current client is logged in
     *
     * @returns {boolean} true if logged in
     */
    isLoggedIn: isLoggedIn,
    /**
     * Returns the logged in user's id
     *
     * @returns {String} userid or null if not logged in
     */
    getUserId: getUserId,
    /**
     * Destroy user session (in-memory and stored in browser)
     */
    destroySession: destroySession,
    /**
    * Url used for uploads to the platform
    *
    * @returns {String} url for uploads
    */
    getUploadUrl: getUploadUrl,
    /**
     * Get current user account info
     *
     * @returns {cb}  cb(err, response)
     */
    getCurrentUser: function (cb) {
      assertArgumentsSize(arguments, 1);

      doGetWithToken('/auth/user', cb);
    },
    /**
     * Post something to metrics.
     * This call never errors, so the callback is optional; it will be called if supplied.
     * This call also doesn't wait for the metrics call to return but returns immediately,
     * so if the metrics site is down you won't know it.
     * This call automatically adds a property client: true to the property list.
     *
     * @param eventname  String name of event to post to kissmetrics
     * @param properties Object list of key/value pairs to post as properties.
     * @param cb If provided, is called without arguments after posting; this call never errors, so callback is optional.
     * @returns {cb}  cb()
     */
    trackMetric: function (eventname, properties, cb) {
      properties = _.assign({}, properties);
      properties.sourceVersion = config.metricsVersion;

      var doNothingCB = function() {
        if (cb) {
          cb();
        }
      };

      if (!eventname) {
        eventname = 'generic';
      }

      withToken(
        doNothingCB,
        function(token){
          superagent
            .get(makeUrl('/metrics/thisuser/' + config.metricsSource + ' - ' + eventname))
            .set(sessionTokenHeader, token)
            .query(properties)
            .end(doNothingCB);
        }
      );
    },
    /**
     * Post an application error so that it can be logged
     *
     * This call never errors, so the callback is optional; it will be called if supplied.
     * This call also doesn't wait for the call to return but returns immediately.
     *
     * This call automatically adds a property client: true to the property list.
     *
     * @param error Object the error that will be logged
     * @param message String an optional message
     * @param properties Object list of key/value pairs to post as properties.
     * @param cb If provided, is called without arguments after posting; this call never errors, so callback is optional.
     * @returns {cb}  cb()
     */
    logAppError: function (error, message, properties, cb) {
      properties = _.assign({}, properties);
      properties.sourceVersion = config.metricsVersion;
      properties.error = error;

      if(message){
        properties.message = message;
      }

      var eventname = 'application error';

      var doNothingCB = function() {
        if (cb) {
          cb();
        }
      };

      withToken(
        doNothingCB,
        function(token){
          superagent
            .get(makeUrl('/metrics/thisuser/' + config.metricsSource + ' - ' + eventname))
            .set(sessionTokenHeader, token)
            .query(properties)
            .end(doNothingCB);
        }
      );
    },
    /**
     * Update current user account info
     *
     * @param {Object} user object with account info
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    updateCurrentUser: function (user, cb) {
      assertArgumentsSize(arguments, 2);
      var updateData = {
        updates: _.pick(user, 'username', 'password', 'emails')
      };

      doPutWithToken('/auth/user', updateData, cb);
    },
    /**
     * Add a new or update an existing profile for a user
     *
     * @param {String} userId id of the user you are updating the profile of
     * @param {Object} profile object
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    addOrUpdateProfile: function (userId, profile, cb) {
      assertArgumentsSize(arguments, 3);

      doPutWithToken(
        '/metadata/' + userId + '/profile',
        profile,
        cb
      );
    },
    /**
     * Find a users profile
     *
     * @param {String} userId id of the user you are finding the profile of
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    findProfile: function (userId, cb) {
      if (userId == null) {
        return cb({ status : STATUS_BAD_REQUEST,  message: 'Must specify a userId' });
      }
      assertArgumentsSize(arguments, 2);

      doGetWithToken('/metadata/' + userId + '/profile', cb);
    },
    /**
     * Get the users 'team'
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getTeamMembers: function (userId, cb) {
      if (userId == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'Must specify a userId' });
      }
      assertArgumentsSize(arguments, 2);

      doGetWithToken(
        '/access/' + userId,
        {200: function(res){ return res.body; }, 404: null},
        cb
      );
    },
    /**
     * Get the users 'patients'
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getViewableUsers: function (userId, cb) {
      if (userId == null) {
        return cb({ status : STATUS_BAD_REQUEST,  message: 'Must specify a userId' });
      }
      assertArgumentsSize(arguments, 2);

      doGetWithToken(
        '/access/groups/' + userId,
        { 200: function(res){ return res.body; }, 404: null },
        cb
      );
    },
    /**
     * Sets the access permissions for a specific user on the group for the currently logged in user
     *
     * @param userId - userId to have access permissions set for
     * @param permissions - permissions to set
     * @param cb - function(err, perms), called with error if exists and permissions as updated
     */
    setAccessPermissions: function(userId, permissions, cb) {
      if (userId == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'Must specify a userId'});
      }

      doPostWithToken(
        '/access/' + getUserId() + '/' + userId,
        permissions,
        cb
      );
    },
    /**
     * Get the access permissions for the currently logged in user
     *
     * @param cb - function(err, perms), called with error if exists and permissions as found
     */
    getAccessPermissions: function(cb) {
      assertArgumentsSize(arguments, 1);

      var userId = getUserId();

      if (userId == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'userId not set'});
      }

      doGetWithToken(
        '/access/' + userId,
        { 200: function(res){ return res.body; }, 404: null },
        cb
      );
    },
    /**
     * Get the listed users public info
     *
     * @param {Array} patientIds array of id's that we want the public info for
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getPatientsInfo: function (patientIds, cb) {
      if (patientIds == null) {
        return cb({ status : STATUS_BAD_REQUEST, message: 'Must specify a patientIds' });
      }
      assertArgumentsSize(arguments, 2);

      var idList = _(patientIds).uniq().join(',');

      doGetWithToken(
        '/metadata/publicinfo?users=' + idList,
        { 200: function(res){ return res.body; }, 404: null },
        cb
      );
    },
    /**
     * Get raw device data for the user
     *
     * @param {String} userId of the user to get the device data for
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getDeviceDataForUser: function (userId, cb) {
      assertArgumentsSize(arguments, 2);

      doGetWithToken(
        '/data/' + userId,
        { 200: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Get messages for a team between the given dates
     *
     * @param {String} userId of the user to get the messages for
     * @param {Object} options
     * @param {String} options.start [start=''] the start date is optional
     * @param {String} options.end [end=''] the end date is optional
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getAllMessagesForUser: function (userId, options, cb) {
      assertArgumentsSize(arguments, 3);

      options = options || {};
      var start = options.start || '';
      var end = options.end || '';

      doGetWithToken(
        '/message/all/' + userId + '?starttime=' + start + '&endtime=' + end,
        { 200: function(res){ return res.body.messages; }, 404: [] },
        cb
      );
    },
    /**
     * Get all notes within a specified date range
     *
     * @param {String} userId of the user to get the notes for
     * @param {Object} options
     * @param {String} options.start [start=''] the start date is optional
     * @param {String} options.end [end=''] the end date is optional
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getNotesForUser: function (userId, options, cb) {
      assertArgumentsSize(arguments, 3);

      options = options || {};
      var start = options.start || '';
      var end = options.end || '';

      doGetWithToken(
        '/message/notes/' + userId + '?starttime=' + start + '&endtime=' + end,
        { 200: function(res){ return res.body.messages; }, 404: [] },
        cb
      );
    },
    /**
     * Reply to a specfic message thread
     *
     * @param {Object} comment on the message thread
     * @param {String} comment.timestamp
     * @param {String} comment.messagetext
     * @param {String} comment.groupid
     * @param {String} comment.userid
     * @param {String} comment.parentmessage
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    replyToMessageThread: function (comment, cb) {
      assertArgumentsSize(arguments, 2);

      doPostWithToken(
        '/message/reply/' + comment.parentmessage,
        {message: comment},
        { 201: function(res){ return res.body.id; }},
        cb
      );
    },
    /**
     * Start a new message thread
     *
     * @param {Object} message that is the start of a new thread
     * @param {String} message.messagetext
     * @param {String} message.timestamp
     * @param {String} message.groupid
     * @param {String} message.userid
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    startMessageThread: function (message, cb) {
      assertArgumentsSize(arguments, 2);

      doPostWithToken(
        '/message/send/' + message.groupid,
        { message: message },
        { 201: function(res){ return res.body.id; }},
        cb
      );

    },
    /**
     * Get a specific message thread
     *
     * @param {String} messageId of the root message
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getMessageThread: function (messageId, cb) {
      assertArgumentsSize(arguments, 2);

      doGetWithToken(
        '/message/thread/' + messageId,
        { 200: function(res){ return res.body.messages; }, 404: [] },
        cb
      );
    },
    /**
     * Edit an existing message
     *
     * @param {Object} edits for an existing message
     * @param {String} edits.id of the message to edit
     * @param {String} edits.messagetext [messagetext=''] updated text
     * @param {String} edits.timestamp [timestamp=''] updated timestamp
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    editMessage: function (edits, cb) {
      assertArgumentsSize(arguments, 2);

      if( _.isEmpty(edits.id) ){
        return cb({ status : STATUS_BAD_REQUEST, message:'You must specify the edits.id'});
      }
      if( _.isEmpty(edits.timestamp) && _.isEmpty(edits.messagetext) ){
        return cb({ status : STATUS_BAD_REQUEST, message: 'You must specify one or both of edits.messagetext, edits.timestamp'});
      }

      doPutWithToken(
        '/message/edit/' + edits.id,
        {message: edits},
        cb
      );
    },
    /**
     * Get the invites sent
     *
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    invitesSent: function (inviterId, cb) {
      assertArgumentsSize(arguments, 2);
      doGetWithToken(
        '/confirm/invite/'+inviterId,
        { 200: function(res){ return res.body; }, 204: function(res){ return res.body; } },
        cb
      );
    },
    /**
     * Get the invites recieved
     *
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    invitesRecieved: function (cb) {
      assertArgumentsSize(arguments, 1);


      //get the invites and then attach the inviters profile to the invite
      var self = this;
      //findProfile
      var onSuccess=function(res){
        var invites = res.body;
        var resolved = [];

        return _(invites).forEach(function(invite) {
          console.log(invite.creatorId);
          self.findProfile(invite.creatorId,function(err,profile){
            if (_.isEmpty(profile)===false){
              invite.creator = profile;
            }
            resolved.push(invite);
          });
        });
      };


      this.getCurrentUser(function(err,details){

        if(_.isEmpty(err)){

          var email = details.emails[0];

          if(_.isEmpty(email)){
            return cb({ status : STATUS_BAD_REQUEST, message: 'user details not found'});
          }else{
            doGetWithToken(
              encodeURI('/confirm/invitations/'+email),
              { 200: onSuccess, 204: function(res){ return res.body; } },
              cb
            );
          }
        }
        return cb(err,[]);
      });

    },
    /**
     * Invite a user
     *
     * @param {String} email - email of the user to invite
     * @param {Object} permissions - permissions to be given
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    inviteUser: function (email,permissions, inviterId, cb) {
      assertArgumentsSize(arguments, 4);

      var details = { 'email':email,'permissions': permissions };

      doPostWithToken(
        '/confirm/send/invite/'+inviterId,
        details,
        cb
      );
    },
    /**
     * Accept the invite
     *
     * @param {String} inviteId
     * @param {String} inviteeId - id of the user who was invited
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    acceptInvite: function (inviteId, inviteeId ,inviterId, cb) {
      assertArgumentsSize(arguments, 4);

      doPutWithToken(
        '/confirm/accept/invite/'+ inviteeId +'/'+ inviterId,
        {'key':inviteId},
        cb
      );
    },
    /**
     * Dismiss the invite
     *
     * @param {String} inviteId
     * @param {String} inviteeId - id of the user who was invited
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    dismissInvite: function (inviteId, inviteeId ,inviterId, cb) {
      assertArgumentsSize(arguments, 4);

      doPutWithToken(
        '/confirm/dismiss/invite/'+ inviteeId +'/'+ inviterId,
        {'key':inviteId},
        { 204: function(res){ return res.body; }},
        cb
      );
    },
    /**
     * Remove the invite
     *
     * @param {String} email - email of the user to remove
     * @param {String} inviterId - id of the user that send the invite
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    removeInvite: function (email, inviterId, cb) {
      assertArgumentsSize(arguments, 3);

      doPutWithToken(
        '/confirm/'+inviterId+'/invited/'+email,
        null,
        cb
      );
    }
  };
};
