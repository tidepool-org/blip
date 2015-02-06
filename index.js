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
var async = require('async');

var id = require('./lib/id.js');

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

  var common = require('./lib/common.js')(config, deps);
  var confirm = require('./confirm.js')(
    common,
    {superagent:superagent, findProfile: findProfile}
  );

  /**
   * Refresh a users token
   *
   * @param token a user token
   * @returns {cb}  cb(err, response)
   * @param cb
   */
  function refreshUserToken(token, cb) {
    superagent.get(common.makeAPIUrl('/auth/login'))
      .set(common.SESSION_TOKEN_HEADER, token)
      .end(
      function (err, res) {
        if (err) {
          return cb(err, null);
        }
        if (res.status !== 200) {
          return common.handleHttpError(res, cb);
        }

        return cb(null, {userid: res.body.userid, token: res.headers[common.SESSION_TOKEN_HEADER]});
      });
  }

  function saveSession(newUserId, newToken, options) {
    options = options || {};
    myToken = newToken;
    common.syncToken(myToken);
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

  function findProfile(userId, cb) {
    if (userId == null) {
      return cb({ status : common.STATUS_BAD_REQUEST,  message: 'Must specify a userId' });
    }
    common.assertArgumentsSize(arguments, 2);
    common.doGetWithToken('/metadata/' + userId + '/profile', cb);
  }

  return {
    /**
     * Initialize client
     *
     * @param cb
     */
    initialize: function(cb) {

      myToken = localStore.getItem(tokenLocalKey);
      common.syncToken(myToken);

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
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a username' });
      }
      if (user.password == null) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a password' });
      }

      options = options || {};
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      superagent
        .post(common.makeAPIUrl('/auth/login', user.longtermkey))
        .auth(user.username, user.password)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err, null);
          }

          if (res.status !== 200) {
            return common.handleHttpError(res, cb);
          }

          var theUserId = res.body.userid;
          var theToken = res.headers[common.SESSION_TOKEN_HEADER];

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
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a username' });
      }
      if (user.password == null) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a password' });
      }

      options = options || {};
      if (typeof options === 'function') {
        cb = options;
        options = {};
      }

      var newUser = _.pick(user, 'username', 'password', 'emails');

      superagent
        .post(common.makeAPIUrl('/auth/user'))
        .send(newUser)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }
          var theUserId = res.body.userid;
          var theToken = res.headers[common.SESSION_TOKEN_HEADER];

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
      common.assertArgumentsSize(arguments, 1);

      if (! this.isLoggedIn()) {
        setTimeout(function(){ cb(null, {}); }, 0);
      }

      var onSuccess=function(res){
        saveSession(null, null);
        return res.body;
      };

      common.doPostWithToken(
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
    getUploadUrl: common.getUploadUrl,
    /**
     * Get current user account info
     *
     * @returns {cb}  cb(err, response)
     */
    getCurrentUser: function (cb) {
      common.assertArgumentsSize(arguments, 1);
      common.doGetWithToken('/auth/user', cb);
    },
    setApiHost: common.setApiHost,
    setUploadHost: common.setUploadHost,
    setBlipHost: common.setBlipHost,
     makeBlipUrl: common.makeBlipUrl,
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

      common.serviceCallChecks(
        doNothingCB,
        function(token){
          superagent
            .get(common.makeAPIUrl('/metrics/thisuser/' + config.metricsSource + ' - ' + eventname))
            .set(common.SESSION_TOKEN_HEADER, token)
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

      common.serviceCallChecks(
        doNothingCB,
        function(token){
          superagent
            .get(common.makeAPIUrl('/metrics/thisuser/' + config.metricsSource + ' - ' + eventname))
            .set(common.SESSION_TOKEN_HEADER, token)
            .query(properties)
            .end(doNothingCB);
        }
      );
    },
    /**
     * Create a child account for the logged in user
     *
     * @param profile {Object} profile for account that is being created for
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    createChildAccount: function (profile,cb) {

      if (_.isEmpty(profile.fullName)) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a fullName' });
      }

      var childUser = { username: profile.fullName };
      // create an child account to attach to ours
      function createChildAccount(next){
        superagent
         .post(common.makeAPIUrl('/auth/childuser'))
         .send(childUser)
         .end(
         function (err, res) {
          if (err != null) {
            return next(err);
          }
          if(res.status === 201){
            childUser.id = res.body.userid;
            childUser.token = res.headers[common.SESSION_TOKEN_HEADER];
            return next(null,{userid:res.body.userid});
          }
          return next({status:res.status,message:res.error});
        });
      }
      //add a profile name to the child account
      function createChildProfile(next){
        superagent
          .put(common.makeAPIUrl('/metadata/'+ childUser.id + '/profile'))
          .send(profile)
          .set(common.SESSION_TOKEN_HEADER, childUser.token)
          .end(
            function (err, res) {
              if (err != null) {
                return next(err);
              }
              if(res.status === 200){
                return next(null,res.body);
              }
              return next({status:res.status,message:res.error});
            });
      }
      //give the parent account admin perms on the child account
      function giveRootPermsOnChild(next){
        superagent
          .post(common.makeAPIUrl('/access/'+ childUser.id + '/' +getUserId()))
          .send({admin: {}})
          .set(common.SESSION_TOKEN_HEADER, childUser.token)
          .end(
            function (err, res) {
              if (err != null) {
                return cb(err);
              }
              if(res.status === 200){
                return next(null,res.body);
              }
              return next({status:res.status,message:res.error});
            });
      }

      async.series([
        createChildAccount,
        createChildProfile,
        giveRootPermsOnChild
      ], function(err, results) {
        if(_.isEmpty(err)){

          var acct = {
            userid: results[0].userid,
            profile: results[1]
          };
          return cb(null,acct);
        }
        return cb(err);
      });
    },
    /**
     * Update current user account info
     *
     * @param {Object} user object with account info
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    updateCurrentUser: function (user, cb) {
      common.assertArgumentsSize(arguments, 2);
      var updateData = {
        updates: _.pick(user, 'username', 'password', 'emails')
      };

      common.doPutWithToken('/auth/user', updateData, cb);
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
      common.assertArgumentsSize(arguments, 3);

      common.doPutWithToken(
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
    findProfile: findProfile,
    /**
     * Get the users 'team'
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getTeamMembers: function (userId, cb) {
      if (userId == null) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a userId' });
      }
      common.assertArgumentsSize(arguments, 2);

      common.doGetWithToken(
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
        return cb({ status : common.STATUS_BAD_REQUEST,  message: 'Must specify a userId' });
      }
      common.assertArgumentsSize(arguments, 2);

      common.doGetWithToken(
        '/access/groups/' + userId,
        { 200: function(res){ return res.body; }, 404: null },
        cb
      );
    },
    /**
     * Get the users 'patients' to whom he can upload to.
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getUploadGroups: function (userId, cb) {
      common.assertArgumentsSize(arguments, 2);
      common.doGetWithToken(
        '/access/groups/' + userId,
        { 200: function(res){
          var groups = res.body;

          var filter = {};

          for(var i in groups) {
            var group = groups[i];

            if (group.root || group.upload) {
              filter[i] = group;
            }
          }
          return filter;
        }, 404: null },
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
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a userId'});
      }

      common.doPostWithToken(
        '/access/' + getUserId() + '/' + userId,
        permissions,
        cb
      );
    },
    /**
     * Sets the access permissions for a specific user on the given group
     *
     * @param groupId - the groupId we are setting user permissions on
     * @param userId - userId to have access permissions set for
     * @param permissions - permissions to set
     * @param cb - function(err, perms), called with error if exists and permissions as updated
     */
    setAccessPermissionsOnGroup: function(groupId, userId, permissions, cb) {
      common.assertArgumentsSize(arguments, 4);

      common.doPostWithToken(
        '/access/' + groupId + '/' + userId,
        permissions,
        cb
      );
    },
    /**
     * Get the access permissions for a specific user on the given group
     *
     * @param groupId - the groupId we want permissions for
     * @param userId - userId that has those permissions
     * @param cb - function(err, perms), called with error if exists and permissions object
     */
    getAccessPermissionsForGroup: function(groupId, userId, cb) {
      common.assertArgumentsSize(arguments, 3);

      common.doGetWithToken(
        '/access/' + groupId + '/' + userId,
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
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'Must specify a patientIds' });
      }
      common.assertArgumentsSize(arguments, 2);

      var idList = _(patientIds).uniq().join(',');

      common.doGetWithToken(
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
      common.assertArgumentsSize(arguments, 2);

      common.doGetWithToken(
        '/data/' + userId,
        { 200: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Upload device data for the logged in user
     *
     * @param {Object} data to be uploaded
     * @param (optional) string groupId for which to upload data
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    uploadDeviceDataForUser: function (data, groupId, cb) {

      if (_.isEmpty(common.getUploadUrl())) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'The upload api needs to be configured' });
      }

      var dataUploadUrl;

      if (typeof groupId === 'function') {
        common.assertArgumentsSize(arguments, 2);
        cb = groupId;
        groupId = null;
        dataUploadUrl = common.makeUploadUrl('/data');
      } else {
        common.assertArgumentsSize(arguments, 3);
        dataUploadUrl = common.makeUploadUrl('/data/'+groupId);
      }

       superagent
        .post(dataUploadUrl)
        .send(data)
        .set(common.SESSION_TOKEN_HEADER, myToken)
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }

          if (res.status !== 200) {
            return cb({
              error: 'Request failed with statusCode ' + res.status,
              code: res.statusCode,
              message: res.body
            });
          }
          return cb(null,res.body);
        });
    },
    /**
     * Start an device upload session by generating an uploadMeta record
     *
     * @param {Object} sessionInfo to initialise the upload session
     * @param cb
     * @returns {cb}  cb(err, uploadMeta)
     */
    startUploadSession: function (sessionInfo,  cb) {
      common.assertArgumentsSize(arguments, 2);

      var fields = ['version', 'deviceTags', 'deviceManufacturers',
                    'deviceModel', 'deviceSerialNumber', 'deviceId'];

      _.each(fields, function(field) {
        if (!_.has(sessionInfo, field)) {
          return cb({ status : common.STATUS_BAD_REQUEST, message: 'sessionInfo is missing "' + field +'"' });
        }
      });

      if (_.isEmpty(sessionInfo.start) || _.isEmpty(sessionInfo.tzName)) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'sessionInfo must contain both tzName and start' });
      }

      try {

        var uploadMeta = _.pick(sessionInfo, fields);
        uploadMeta.type = 'upload';
        uploadMeta.time = sessionInfo.start;
        uploadMeta.timezone = sessionInfo.tzName;
        uploadMeta.uploadId = id.generateId([sessionInfo.deviceId, sessionInfo.start]);
        uploadMeta.byUser = myUserId;
        // this is to permit us to continue to identify carelink data
        if (sessionInfo.source) {
          uploadMeta.source = sessionInfo.source;
        }

        return cb(null,uploadMeta);

      } catch (error) {
        return cb(error);
      }
    },
    /**
     * Upload carelink data for the logged in user
     *
     * @param {Object} formData for the carelink upload
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    uploadCarelinkDataForUser: function (formData, cb) {
      common.assertArgumentsSize(arguments, 2);

      //waiting for our task to finish
      function waitForSyncTaskWithIdToFinish(syncTaskId,callback){

        // Polling frequency, in milliseconds
        var pollingInterval = 3 * 1000;

        // When to give up, in milliseconds
        var pollingTimeout = 5 * 60 * 1000;
        var pollingTimedOut = false;

        setTimeout(function () {
          pollingTimedOut = true;
        }, pollingTimeout);

        // Start long-polling
        log.info('Starting sync task long polling with id', syncTaskId);
        (function poll(done) {
          setTimeout(function () {

            superagent
              .get(common.makeUploadUrl('/v1/synctasks/' + syncTaskId))
              .set(common.SESSION_TOKEN_HEADER, myToken)
              .end(
                function (err, res) {
                  if (!_.isEmpty(err)) {
                    log.info('Sync failed', JSON.stringify(err));
                    return done(err);
                  }

                  if (res.status !== 200) {
                    return common.handleHttpError(res, done);
                  }

                  var syncTask = res.body;
                  log.info('Sync task poll complete', syncTask);

                  if (syncTask.status === 'error') {
                    return done({message: 'Sync task failed', error: syncTask.error});
                  }

                  if (syncTask.status === 'success') {
                    log.info('Carelink download success');
                    return done(null, syncTask);
                  }

                  poll(done);
              });
          }, pollingInterval);
        }(callback));
      }
       //download the file and returns its contents
       superagent
        .post(common.makeUploadUrl('/v1/device/upload/cl'))
        .send(formData)
        .type('form')
        .set(common.SESSION_TOKEN_HEADER, myToken)
        .end(
        function (err, res) {
          if (!_.isEmpty(err)) {
            log.info('Upload Failed');
            return cb(err);
          }

          if (res.status !== 200) {
            log.info('Upload Failed');
            return common.handleHttpError(res, cb);
          }

          var syncTask = res.body;
          var syncTaskId = syncTask._id;

          if (!syncTaskId) {
            log.info('Upload Failed');
            return cb({message: 'No sync task id'});
          }

          waitForSyncTaskWithIdToFinish(syncTaskId,function(err,data){
            if (!_.isEmpty(err)) {
              log.info('Return failure from uploadCarelinkDataForUser');
              return cb(err);
            }
            return cb(null,data);
          });

        });
    },
    /**
     * Upload carelink data for the logged in user
     *
     * @param {string} dataId for the carelink upload
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getCarelinkData: function (dataId, cb) {
      common.assertArgumentsSize(arguments, 2);

       //get the contents of the carelink csv file
       superagent
        .get(common.makeUploadUrl('/v1/device/data/' + dataId))
        .set(common.SESSION_TOKEN_HEADER, myToken)
        .end(
        function (err, res) {
          if (err) {
            return cb(err);
          }

          if (res.status !== 200) {
            return common.handleHttpError(res, cb);
          }

          return cb(null, res.text);
        });
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
      common.assertArgumentsSize(arguments, 3);

      options = options || {};
      var start = options.start || '';
      var end = options.end || '';

      common.doGetWithToken(
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
      common.assertArgumentsSize(arguments, 3);

      options = options || {};
      var start = options.start || '';
      var end = options.end || '';

      common.doGetWithToken(
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
      common.assertArgumentsSize(arguments, 2);

      common.doPostWithToken(
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
      common.assertArgumentsSize(arguments, 2);

      common.doPostWithToken(
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
      common.assertArgumentsSize(arguments, 2);

      common.doGetWithToken(
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
      common.assertArgumentsSize(arguments, 2);

      if( _.isEmpty(edits.id) ){
        return cb({ status : common.STATUS_BAD_REQUEST, message:'You must specify the edits.id'});
      }
      if( _.isEmpty(edits.timestamp) && _.isEmpty(edits.messagetext) ){
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'You must specify one or both of edits.messagetext, edits.timestamp'});
      }

      common.doPutWithToken(
        '/message/edit/' + edits.id,
        {message: edits},
        cb
      );
    },
    /**
     * Signup
     */
    signupStart: confirm.signupStart,
    signupConfirm: confirm.signupConfirm,
    signupResend: confirm.signupResend,
    signupCancel: confirm.signupCancel,
    /**
     * Invites
     */
    invitesSent: confirm.invitesSent,
    invitesReceived: confirm.invitesReceived,
    inviteUser: confirm.inviteUser,
    acceptInvite: confirm.acceptInvite,
    dismissInvite: confirm.dismissInvite,
    removeInvite: confirm.removeInvite,
    /**
     * Password reset
     */
    requestPasswordReset: confirm.requestPasswordReset,
    confirmPasswordReset: confirm.confirmPasswordReset
  };
};
