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
const { v4: uuidv4 } = require('uuid');

var id = require('./lib/id.js');

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

  var superagent = requireDep(deps, 'superagent');
  var log = requireDep(deps, 'log');

  config = _.clone(config);
  requireConfig(config, 'host');
  requireConfig(config, 'metricsSource');
  requireConfig(config, 'metricsVersion');
  // now clean up source so that it doesn't have any dashes
  // this way, the first dash in the eventname will be the separator for the source
  config.metricsSource = config.metricsSource.replace(/-/g, ' ');

  var common = require('./lib/common.js')(config, deps);
  var confirm = require('./confirm.js')( common, {superagent:superagent, findProfile: findProfile});
  var user = require('./user.js')( common, config, deps);

  /**
   * Add a new or update an existing metadata for a user
   *
   * @param {String} userId id of the user you are updating the profile of
   * @param {Object} payload object
   * @param {String} type the type of metadata collection (e.g., preferences, profile, or settings)
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function addOrUpdateMetadata(userId, payload, type, cb) {
    if (userId == null) {
      return cb({ status : common.STATUS_BAD_REQUEST,  message: 'Must specify a userId' });
    }

    common.assertArgumentsSize(arguments, 4);
    common.doPutWithToken(
      '/metadata/' + userId + '/' + type,
      payload,
      cb
    );
  }

  /**
   * Find a user's metadata collection
   *
   * @param {String} userId id of the user you are finding the preferences of
   * @param {String} type the type of metadata collection (e.g., preferences, profile, or settings)
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function findMetadata(userId, type, cb) {
    if (userId == null) {
      return cb({ status : common.STATUS_BAD_REQUEST,  message: 'Must specify a userId' });
    }
    common.assertArgumentsSize(arguments, 3);
    common.doGetWithToken('/metadata/' + userId + '/' + type, cb);
  }

  /**
   * Find a user's profile
   *
   * @param {String} userId id of the user you are finding the profile of
   * @param cb
   * @returns {cb}  cb(err, response)
   */
  function findProfile (userId, cb) {
    findMetadata(userId, 'profile', cb);
  }

  /**
   * format error with response body and session token
   *
   * @param {Error} err with the response body
   * @returns {Error}
   */
  function formatError (err) {
    if (err.response && err.response.body) {
      var error = err.response.body;
      error.sessionToken = user.getUserToken();
      return error;
    }
    return err;
  }

  return {
    /**
     * Do any requied initialization
     */
    initialize: function(cb){
      return user.initialize(cb);
    },
    /**
    * Url used for uploads to the platform
    *
    * @returns {String} url for uploads
    */
    getUploadUrl: common.getUploadUrl,
    hasDataHost: common.hasDataHost,
    setApiHost: common.setApiHost,
    setUploadHost: common.setUploadHost,
    setDataHost: common.setDataHost,
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
            .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
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
            .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
            .query(properties)
            .end(doNothingCB);
        }
      );
    },
    /**
     * Add a new or update an existing preferences for a user
     *
     * @param {String} userId id of the user you are updating the preferences of
     * @param {Object} preferences object
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    addOrUpdatePreferences: function (userId, preferences, cb) {
      addOrUpdateMetadata(userId, preferences, 'preferences', cb);
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
      addOrUpdateMetadata(userId, profile, 'profile', cb);
    },
    /**
     * Add a new or update an existing settings for a user
     *
     * @param {String} userId id of the user you are updating the settings of
     * @param {Object} settings object
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    addOrUpdateSettings: function (userId, settings, cb) {
      addOrUpdateMetadata(userId, settings, 'settings', cb);
    },
    /**
     * Find a user's preferences
     *
     * @param {String} userId id of the user you are finding the preferences of
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    findPreferences: function (userId, cb) {
      findMetadata(userId, 'preferences', cb);
    },
    /**
     * Find a user's profile
     *
     * @param {String} userId id of the user you are finding the profile of
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    findProfile: findProfile,
    /**
     * Find a user's settings
     *
     * @param {String} userId id of the user you are finding the settings of
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    findSettings: function (userId, cb) {
      findMetadata(userId, 'settings', cb);
    },
    /**
     * Find a user's consents
     *
     * @param {string} userId id of the user you are finding the consents of
     * @param {(err, response) => void} cb
     */
    findConsents: (userId, cb) => {
      findMetadata(userId, 'consents', cb);
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
     * Get the users 'patients' and their associated data
     * includes profile, permissions and metadata
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getAssociatedUsersDetails: function (userId, cb) {
      if (userId == null) {
        return cb({ status : common.STATUS_BAD_REQUEST,  message: 'Must specify a userId' });
      }
      common.assertArgumentsSize(arguments, 2);

      common.doGetWithToken(
        '/metadata/users/' + userId + '/users',
        { 200: function(res){ return res.body; }, 404: null },
        cb
      );
    },
    /**
     * Get the users 'patients' and their associated data
     * includes profile, permissions and metadata
     *
     * @param {Object} options
     * @param {String} options.userIds list of userids
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getUsersTir: function (userIds, cb) {

      userIds = userIds || [];

      var users = userIds.join(',');
      common.doGetWithToken(
        `/compute/tir?userIds=${users}`,
        { 200: function(res){ return res.body; }, 404: {}, 403: {} },
        cb
      );
    },
    /**
     * Get the users 'patients' to whom they can upload for.
     *
     * @param {String} userId of the user
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
        '/access/' + user.getUserId() + '/' + userId,
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

      var idList = _.uniq(patientIds).join(',');

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
     * @param {Object} options for the query
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getDeviceDataForUser: function (userId, options, cb) {
      common.assertArgumentsSize(arguments, 3);

      var allowedParams = [
        'carelink',
        'dexcom',
        'medtronic',
        'startDate',
        'endDate',
        'latest',
        'type',
        'uploadId',
        'deviceId',
        'subType',
      ];

      // Generate url with any valid provided params
      var url = common.appendUrlParamsFromOptions('/data/' + userId, options, allowedParams);

      common.doGetWithToken(
        url,
        { 200: function(res){ return res.body; }, 404: [] },
        cb
      );
    },
    /**
     * Check the expected minimum versions for uploading
     *
     * @param cb
     * @returns {cb}  cb(err, response)
     * e.g.  {versions: {schema: 3, uploaderMinimum: '0.333.0'}}
     */
    checkUploadVersions: function (cb) {
      common.assertArgumentsSize(arguments, 1);
      superagent
        .get(common.makeUploadUrl('/info'))
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }
          return cb(null,res.body);
        });
    },
    /**
     * Get server time
     *
     * @param cb
     * @returns {cb} cb(err, response)
     */
    getTime: function (cb) {
      superagent
        .get(common.makeDataUrl('/v1/time'))
        .end(
        function (err, res) {
          if (err != null) {
            return cb(err);
          }
          return cb(null,res.body);
        });
    },
    /**
     * Get the data sources for a given user
     *
     * @param {String} userId of the user to get the data sources for
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getDataSourcesForUser: function(userId, cb) {
      common.assertArgumentsSize(arguments, 2);

      common.doGetWithToken(
        '/v1/users/' + userId + '/data_sources',
        { 200: function(res) { return res.body; } },
        cb
      );
    },
    /**
     * Create a dataset for the given user
     *
     * @param {String} userId of the user to create the dataset for
     * @param {Object} info for the dataset
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    createDatasetForUser: function (userId, info, cb) {
      common.assertArgumentsSize(arguments, 3);

      if (!common.hasDataHost()) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'The data host needs to be configured' });
      }

       superagent
        .post(common.makeDataUrl('/v1/users/' + userId + '/datasets'))
        .send(info)
        .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
        .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
        .end(
        function (err, res) {
          if (err != null) {
            if (err.status !== 201) {
              return cb(formatError(err));
            }
            return cb(err);
          } else if (res.error === true) {
            if(_.isObject(res.body)) {
              return cb(res.body); // for our custom error arrays
            } else {
              return cb(res.error);
            }
          } else if (res.status !== 201) {
            return cb(new Error('Unexpected HTTP response: ' + res.status));
          }

          return cb(null, res.body);
        });
    },
    /**
     * Finalize the given dataset (close and post-process)
     *
     * @param {String} datasetId of the dataset to finalize
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    finalizeDataset: function (datasetId, cb) {
      common.assertArgumentsSize(arguments, 2);

      if (!common.hasDataHost()) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'The data host needs to be configured' });
      }

       superagent
        .put(common.makeDataUrl('/v1/datasets/' + datasetId))
        .send({dataState: 'closed'})
        .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
        .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
        .end(
        function (err, res) {

          if (err != null) {
            if (err.status !== 200) {
              return cb(formatError(err));
            }
            return cb(err);
          } else if (res.status !== 200) {
            return cb(res.body);
          }

          return cb();
        });
    },
    /**
     * Add data to the given dataset
     *
     * @param {String} datasetId of the dataset to add data
     * @param {Object} data to be added
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    addDataToDataset: function (datasetId, data, cb) {
      common.assertArgumentsSize(arguments, 3);

      if (!common.hasDataHost()) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'The data host needs to be configured' });
      }

       superagent
        .post(common.makeDataUrl('/v1/datasets/' + datasetId + '/data'))
        .send(data)
        .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
        .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
        .end(
        function (err, res) {

          if (err != null) {
            if (err.status !== 200) {
              return cb(formatError(err));
            }
            return cb(err);
          } else if (res.status !== 200) {
            return cb(res.body);
          }

          return cb(null,res.body);

        });
    },
    /**
     * Upload device data for the given user
     *
     * @param {String} userId of the user to get the device data for
     * @param {Object} data to be uploaded
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    uploadDeviceDataForUser: function (userId, data, cb) {
      common.assertArgumentsSize(arguments, 3);

      if (_.isEmpty(common.getUploadUrl())) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'The upload api needs to be configured' });
      }

       superagent
        .post(common.makeUploadUrl('/data/'+userId))
        .send(data)
        .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
        .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
        .end(
        function (err, res) {

          if (err != null) {
            if (err.status !== 200) {
              return cb((err.response && err.response.body) || err);
            }
            return cb(err);
          } else if (res.status !== 200) {
            return cb(res.body);
          }

          return cb(null,res.body);

        });
    },
    /**
     * Upload blob data for the given user
     *
     * @param {String} userId of the user to get the device data for
     * @param {Object} blob to be uploaded
     * @param {String} contentType of blob, e.g. 'application/json'
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    uploadBlobForUser: function (userId, blob, contentType, digest, cb) {
      common.assertArgumentsSize(arguments, 5);

      if (!common.hasDataHost()) {
      return cb({ status : common.STATUS_BAD_REQUEST, message: 'The data host needs to be configured' });
      }

      superagent
      .post(common.makeAPIUrl('/v1/users/' + userId + '/blobs'))
      .send(blob)
      .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
      .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
      .set(common.DIGEST_HEADER, digest)
      .type(contentType)
      .end(
      function (err, res) {
       if (err != null) {
         if (err.status !== 201) {
           return cb(formatError(err));
         }
         return cb(err);
       } else if (res.error === true) {
         return cb(res.error);
       } else if (res.status !== 201) {
         return cb(new Error('Unexpected HTTP response: ' + res.status));
       }

       return cb(null, res.body);
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
        uploadMeta.byUser = user.getUserId();
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
              .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
              .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
              .end(
                function (err, res) {
                  if (!_.isEmpty(err)) {
                    err.body = (err.response && err.response.body) || '';
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
        .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
        .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
        .end(
        function (err, res) {
          if (!_.isEmpty(err)) {
            err.body = (err.response && err.response.body) || '';
            log.info('Upload Failed');
            return cb(err);
          }

          if (res.status !== 200) {
            log.info('Upload Failed');
            return common.handleHttpError(res, cb);
          }

          var syncTask = res.body;
          var syncTaskId = syncTask.id;

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
        .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
        .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
        .end(
        function (err, res) {
          if (err) {
            err.body = (err.response && err.response.body) || '';
            return cb(err);
          }

          if (res.status !== 200) {
            return common.handleHttpError(res, cb);
          }

          return cb(null, res.text);
        });
    },
    /**
     * Get upload records for the given user and device
     *
     * @param {String} userId of the user
     * @param {String} deviceId of the device
     * @param {String} size of the array to return
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getUploadRecordsForDevice: function (userId, deviceId, size, cb) {
      common.assertArgumentsSize(arguments, 4);

      if (!common.hasDataHost()) {
        return cb({ status : common.STATUS_BAD_REQUEST, message: 'The data host needs to be configured' });
      }

       superagent
        .get(common.makeDataUrl('/v1/users/' + userId + '/data_sets?deviceId=' + deviceId + '&size=' + size))
        .set(common.SESSION_TOKEN_HEADER, user.getUserToken())
        .set(common.TRACE_SESSION_HEADER, common.getSessionTrace())
        .end(
          function (err, res) {
            if (err) {
              err.body = (err.response && err.response.body) || '';
              return cb(err);
            }

            if (res.status !== 200) {
              return common.handleHttpError(res, cb);
            }
            return cb(null, res.body);
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
        { message: _.assign(comment, {guid: uuidv4()}) },
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
        { message: _.assign(message, {guid: uuidv4()}) },
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
     * Get URL for data export for a given user
     *
     * @param {String} userId of the user to get data for
     * @param {String} loggedInUserId the userId of the logged in user
     * @param {Object} options
     * @param {String} options.format 'json'|'excel'
     * @param {String} options.startDate
     * @param {String} options.endDate
     * @param cb
     * @returns {cb} cb(err, response)
     */
    getExportDataURL: function (userId, loggedInUserId, options, cb){
      common.assertArgumentsSize(arguments, 4);
      user.createRestrictedTokenForUser(loggedInUserId, {}, function(err, response){
        if (err) {
          cb(err);
        }
        // eslint-disable-next-line camelcase
        options.restricted_token = response.id;
        var URL = common.makeExportUrl(userId, options);
        cb(null, URL);
      });
    },
    /**
     * User
     */
    acceptTerms: user.acceptTerms,
    createCustodialAccount: user.createCustodialAccount,
    destroySession: user.destroySession,
    getCurrentUser: user.getCurrentUser,
    getUserId: user.getUserId,
    isLoggedIn: user.isLoggedIn,
    login: user.login,
    oauthLogin: user.oauthLogin,
    logout: user.logout,
    signup: user.signup,
    updateCurrentUser: user.updateCurrentUser,
    updateCustodialUser: user.updateCustodialUser,
    createRestrictedTokenForUser: user.createRestrictedTokenForUser,
    createOAuthProviderAuthorization: user.createOAuthProviderAuthorization,
    deleteOAuthProviderAuthorization: user.deleteOAuthProviderAuthorization,
    /**
     * Signup
     */
    signupStart: confirm.signupStart,
    signupConfirm: confirm.signupConfirm,
    custodialSignupConfirm: confirm.custodialSignupConfirm,
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
