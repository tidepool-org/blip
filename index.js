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

// Until we bundle into distribution file properly with UMD
// Workaround to grab dependency from global `window` object if available
// and not call `require`
var _ = (typeof window !== 'undefined' && typeof window._ !== 'undefined') ? window._ : require('lodash');
var async = (typeof window !== 'undefined' && typeof window.async !== 'undefined') ? window.async : require('async');

var sessionTokenHeader = 'x-tidepool-session-token';

function defaultProperty(obj, property, defaultValue) {
  if (obj[property] == null) {
    obj[property] = defaultValue;
  }
  return obj;
}

function requireConfig(obj, property) {
  if (obj[property] == null) {
    throw new Error('Property[' + property + '] required on config');
  }
}

module.exports = function (config, superagent, log) {
  var myToken = null;
  var myUserId = null;

  config = _.clone(config);
  defaultProperty(config, 'tokenRefreshInterval', 10 * 60 * 1000); // 10 minutes
  requireConfig(config, 'host');

  /*
   Make the URL
   */
  function makeUrl(path) {
    return config.host + path;
  }

  /*
   Return the id of the group type for the given user
   (e.g. team, invited, invitedby, patients)
   */
  function getUserGroupId(userId, groupType, token, cb) {
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }

    superagent
      .get(makeUrl('/metadata/' + userId + '/groups'))
      .set(sessionTokenHeader, token)
      .end(function (error, res) {
        if (error) {
          return cb(error);
        }

        if (res.status === 404) {
          return cb(null, null);
        }

        if (res.status !== 200) {
          return handleHttpError(res, cb);
        }

        cb(null, res.body[groupType]);
      });
  }

  /*
   Return the user group (e.g. team, invited, patients) asked for.
   If the group does not exist an empty one is created.
   */
  function findOrAddUserGroup(userId, groupType, token, cb) {
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }
    async.waterfall(
      [
        function (callback) {
          //find users groups
          getUserGroupId(userId, groupType, token, function (error, groupId) {
            callback(error, groupId);
          });
        },
        function (groupId, callback) {
          //find users groups
          if (groupId == null) {
            createUserGroup(userId, groupType, token, function (error, groupId) {
              callback(error, groupId);
            });
          } else {
            callback(null, groupId);
          }
        },
        function (groupId, callback) {
          if (!groupId) {
            return callback(null, null);
          }

          //find the requested group
          superagent
            .get(makeUrl('/group/' + groupId + '/members'))
            .set(sessionTokenHeader, token)
            .end(function (error, res) {
              if (error) {
                return callback(error);
              }

              if (res.status !== 200) {
                return handleHttpError(res, callback);
              }

              var group = {
                id: groupId,
                members: res.body.members
              };
              callback(null, group);
            });
        }
      ],
      function (err, result) {
        return cb(err, result);
      });
  }

  /*
   Create the user group (e.g. team, invited, patients ...) asked for and link to the user.
   */
  function createUserGroup(userId, groupType, token, cb) {
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }
    async.waterfall(
      [
        function (callback) {
          //add the empty group
          superagent
            .post(makeUrl('/group'))
            .set(sessionTokenHeader, token)
            .send({ group: { members: [] }})
            .end(function (err, res) {
              if (err != null) {
                return callback(err, null);
              }

              if (res.status !== 201) {
                return handleHttpError(res, callback);
              }

              callback(null, res.body.id);
            });
        },
        function (groupId, callback) {
          //get all groups associated with the user
          superagent
            .get(makeUrl('/metadata/' + userId + '/groups'))
            .set(sessionTokenHeader, token)
            .end(function (err, res) {
              callback(err, groupId, res.body);
            });
        },
        function (groupId, existingGroups, callback) {
          //add new group type to the users groups

          if (existingGroups == null) {
            existingGroups = {};
          }

          existingGroups[groupType] = groupId;

          superagent
            .post(makeUrl('/metadata/' + userId + '/groups'))
            .set(sessionTokenHeader, token)
            .send(existingGroups)
            .end(function (err, res) {
              if (err != null) {
                return callback(err);
              }

              if (res.status !== 200) {
                return handleHttpError(res, callback);
              }

              callback(null, groupId);
            });
        }
      ],
      function (err, result) {
        return cb(err, result);
      });
  }

  /*
   Add a member to the user group (e.g. team, invited, patients ...)
   */
  function addMemberToUserGroup(groupId, memberId, token, cb) {
    if (groupId == null) {
      return cb({ message: 'Must specify a groupId' });
    }
    if (memberId == null) {
      return cb({ message: 'Must specify a memberId to add' });
    }

    superagent
      .put(makeUrl('/group/' + groupId + '/user'))
      .set(sessionTokenHeader, token)
      .send({userid: memberId})
      .end(function (err, res) {
        if (err != null) {
          return cb(err, null);
        }

        if (res.status !== 200) {
          return handleHttpError(res, cb);
        }

        cb(null, res.body);
      });
  }

  /*
   Handle an HTTP error (status code !== 2xx)
   Create an error object and pass it to callback
   */
  function handleHttpError(res, cb) {
    var err = {status: res.status, body: res.body};
    cb(err);
  }

  /**
   * Refresh a users token
   *
   * @param token a user token
   * @param userId id of the user we are doing the token refresh for
   * @returns {cb}  cb(err, response)
   * @param cb
   */
  function refreshUserToken(token, userId, cb) {
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

        cb(null, {userid: userId, token: res.headers[sessionTokenHeader]});
      });
  }

  function saveSession(newUserId, newToken) {
    myToken = newToken;
    myUserId = newUserId;

    if (newToken == null) {
      return;
    }

    log.info('Session saved');

    var refreshSession = function() {
      if (myToken == null || newUserId !== myUserId) {
        log.info('Stopping session token refresh');
        return;
      }

      log.info('Refreshing session token');
      refreshUserToken(myToken, newUserId, function(err, data) {
        var hasNewSession = data && data.userid && data.token;
        if (err || !hasNewSession) {
          log.warn('Failed refreshing session token', err);
          saveSession(null, null);
        } else {
          saveSession(data.userid, data.token);
        }
      });
    };

    setTimeout(refreshSession, config.tokenRefreshInterval);
  }

  function isLoggedIn() {
    return myToken != null;
  }

  function withToken(sadCb, happyCb) {
    if (! isLoggedIn()) {
      return sadCb(new Error('User is not logged in, you must log in to do this operation'));
    } else {
      return happyCb(myToken);
    }
  }

  function assertArgumentsSize(argumentsObj, length) {
    if (argumentsObj.length !== length) {
      throw new Error('Expected arguments to be length ' + length + ' but was ' + argumentsObj.length);
    }
  }

  return {
    /**
     * Login user to the Tidepool platform
     *
     * @param user object with a username and password to login
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    login: function (user, cb) {
      if (user.username == null) {
        return cb({ message: 'Must specify an username' });
      }
      if (user.password == null) {
        return cb({ message: 'Must specify a password' });
      }

      superagent
        .post(makeUrl('/auth/login'))
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

          saveSession(theUserId, theToken);

          cb(null, {userid: theUserId, user: res.body});
        });
    },
    /**
     * Signup user to the Tidepool platform
     *
     * @param user object with a username and password
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    signup: function (user, cb) {
      if (user.username == null) {
        return cb({ message: 'Must specify an username' });
      }
      if (user.password == null) {
        return cb({ message: 'Must specify a password' });
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

          if (res.status !== 201) {
            return handleHttpError(res, cb);
          }

          var theUserId = res.body.userid;
          var theToken = res.headers[sessionTokenHeader];

          saveSession(theUserId, theToken);

          cb(null, res.body);
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

      withToken(
        cb,
        function(token) {
          superagent
            .post(makeUrl('/auth/logout'))
            .set(sessionTokenHeader, token)
            .end(
            function (err, res) {
              if (err != null) {
                return cb(err);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              saveSession(null, null);
              cb(null, res.body);
            });
        }
      );
    },
    /**
     * Tells if the current client is logged in
     *
     * @returns {boolean} true if logged in
     */
    isLoggedIn: isLoggedIn,
    /**
     * Get current user account info
     *
     * @returns {cb}  cb(err, response)
     */
    getCurrentUser: function (cb) {
      assertArgumentsSize(arguments, 1);

      withToken(
        cb,
        function(token) {
          superagent
            .get(makeUrl('/auth/user'))
            .set(sessionTokenHeader, token)
            .end(
            function (err, res) {
              if (err != null) {
                cb(err);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body);
            });
        });
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
    doMetrics: function (eventname, properties, cb) {
      var props = { client: true };
      var doNothingCB = function() {
        if (cb) {
          cb();
        }
      };

      _.merge(props, properties);
      if (!eventname) {
        eventname = 'generic';
      }

      withToken(
        doNothingCB,
        function(token){
          superagent
            .get(makeUrl('/metrics/thisuser/' + eventname))
            .set(sessionTokenHeader, token)
            .send(props);
          doNothingCB();
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

      withToken(
        cb,
        function(token){
          superagent
            .put(makeUrl('/auth/user'))
            .set(sessionTokenHeader, token)
            .send(updateData)
            .end(
            function (err, res) {
              if (err != null) {
                cb(err);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body);
            });
        }
      );
    },
    /**
     * Add a new or update an existing profile for a user
     *
     * @param {Object} user object with profile info and `id` attribute
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    addOrUpdateProfile: function (user, cb) {
      if (user.id == null) {
        return cb({ message: 'Must specify an id' });
      }
      assertArgumentsSize(arguments, 2);

      var userProfile = _.omit(user, 'id', 'username', 'password', 'emails');

      withToken(
        cb,
        function(token) {
          superagent
            .put(makeUrl('/metadata/' + user.id + '/profile'))
            .set(sessionTokenHeader, token)
            .send(userProfile)
            .end(
            function (err, res) {
              if (err != null) {
                return cb(err);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body);
            });
        }
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
        return cb({ message: 'Must specify a userId' });
      }
      assertArgumentsSize(arguments, 2);

      withToken(
        cb,
        function(token) {
          superagent
            .get(makeUrl('/metadata/' + userId + '/profile'))
            .set(sessionTokenHeader, token)
            .end(
            function (err, res) {
              if (err != null) {
                cb(err);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body);
            });
        }
      );
    },
    /**
     * Create the required group type for a user
     *
     * @param {String} userId id of the user
     * @param {String} groupType name of the type of group we are creating e.g. team
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    createUserGroup: function(userId, groupType, cb) {
      assertArgumentsSize(arguments, 3);

      withToken(
        cb,
        function(token) {
          createUserGroup(userId, groupType, token, cb);
        }
      );
    },
    /**
     * Get the users 'team'
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getUsersTeam: function (userId, cb) {
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      assertArgumentsSize(arguments, 2);

      withToken(
        cb,
        function(token) {
          findOrAddUserGroup(userId, 'team', token, cb);
        }
      );
    },
    /**
     * Get the users 'patients'
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getUsersPatients: function (userId, cb) {
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      assertArgumentsSize(arguments, 2);

      withToken(
        cb,
        function(token) {
          findOrAddUserGroup(userId, 'patients', token, cb);
        }
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
        return cb({ message: 'Must specify a patientIds' });
      }
      assertArgumentsSize(arguments, 2);

      var idList = _(patientIds).uniq().join(',');

      withToken(
        cb,
        function(token) {
          superagent
            .get(makeUrl('/metadata/publicinfo?users=' + idList))
            .set(sessionTokenHeader, token)
            .end(
            function (error, res) {

              if (error != null) {
                return cb(error, null);
              }

              if (res.status === 404) {
                // there are no patients for those ids
                return cb(null, null);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body);
            });
        }
      );
    },
    /**
     * Get the users who have been invited to join the team
     *
     * @param {String} userId id of the user
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getInvitesToTeam: function (userId, cb) {
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      assertArgumentsSize(arguments, 2);

      withToken(
        cb,
        function(token) {
          findOrAddUserGroup(userId, 'invited', token, cb);
        }
      );
    },
    /**
     * Invite a user to join the 'team'
     *
     * @param {String} inviterId id of the user who is inviting
     * @param {String} inviteeId id of the user who is being invited
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    inviteToJoinTeam: function (inviterId, inviteeId, cb) {
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }
      assertArgumentsSize(arguments, 3);

      this.getInvitesToTeam(inviterId, function (error, invited) {
        if (_.contains(invited.members, inviteeId)) {
          //console.log('invite already exists');
          return cb(error, invited);
        } else {
          //console.log('add the invite');
          withToken(
            cb,
            function(token) {
              addMemberToUserGroup(invited.id, inviteeId, token, cb);
            }
          );
        }
      });
    },
    /**
     * Accept an invite to join a users 'team'
     *
     * @param {String} inviterId id of the user who is inviting
     * @param {String} inviteeId id of the user who is being invited
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    acceptInviteToJoinTeam: function (inviterId, inviteeId, cb) {
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }
      assertArgumentsSize(arguments, 3);

      this.getUsersTeam(inviterId, function (error, team) {
        if (_.contains(team.members, inviteeId)) {
          //console.log('already a team member');
          return cb(error, team);
        } else {
          withToken(
            cb,
            function(token) {
              addMemberToUserGroup(team.id, inviteeId, token, cb);
            }
          );
          //console.log('add to team');
        }
      });
    },
    /**
     * Add the user to the patients list
     *
     * @param {String} inviterId id of the user who is inviting
     * @param {String} inviteeId id of the user who is being invited
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    addToPatients: function (inviterId, inviteeId, cb) {
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }
      assertArgumentsSize(arguments, 3);

      this.getUsersPatients(inviteeId, function (error, patients) {
        if (_.contains(patients.members, inviterId)) {
          //console.log('already a patient');
          return cb(error, patients);
        } else {
          //console.log('add as a patient');
          withToken(
            cb,
            function(token) {
              addMemberToUserGroup(patients.id, inviterId, token, cb);
            }
          );
        }
      });
    },
    /**
     * Get messages for a team between the given dates
     *
     * @param {String} userId of the user to get the messages for
     * @param {Object} dates
     * @param {String} dates.start [start=''] the start date is optional
     * @param {String} dates.end [end=''] the end date is optional
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getAllMessagesForUser: function (userId, dates, cb) {
      assertArgumentsSize(arguments, 3);

      dates = dates || {};
      var start = dates.start || '';
      var end = dates.end || '';

      withToken(
        cb,
        function(token) {
          superagent
            .get(makeUrl('/message/all/' + userId + '?starttime=' + start + '&endtime=' + end))
            .set(sessionTokenHeader, token)
            .end(
            function (err, res) {
              if (err != null) {
                return cb(err, null);
              }

              if (res.status === 404) {
                // there are no messages for that group
                return cb(null, []);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body.messages);
            });
        }
      );
    },
    /**
     * Get all notes within a specified date range
     *
     * @param {String} userId of the user to get the notes for
     * @param {Object} dates
     * @param {String} dates.start [start=''] the start date is optional
     * @param {String} dates.end [end=''] the end date is optional
     * @param cb
     * @returns {cb}  cb(err, response)
     */
    getNotesForUser: function (userId, dates, cb) {
      assertArgumentsSize(arguments, 3);

      dates = dates || {};
      var start = dates.start || '';
      var end = dates.end || '';

      withToken(
        cb,
        function(token) {
          superagent
            .get(makeUrl('/message/notes/' + userId + '?starttime=' + start + '&endtime=' + end))
            .set(sessionTokenHeader, token)
            .end(
            function (err, res) {
              if (err != null) {
                return cb(err, null);
              }

              if (res.status === 404) {
                // there are no messages for that group
                return cb(null, []);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body.messages);
            });
        }
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

      withToken(
        cb,
        function(token) {
          superagent
            .post(makeUrl('/message/reply/' + comment.parentmessage))
            .set(sessionTokenHeader, token)
            .send({message: comment})
            .end(
            function (err, res) {
              if (err != null) {
                return cb(err, null);
              }

              if (res.status !== 201) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body.id);
            });
        }
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

      withToken(
        cb,
        function(token) {
          superagent
            .post(makeUrl('/message/send/' + message.groupid))
            .set(sessionTokenHeader, token)
            .send({message: message})
            .end(
            function (err, res) {
              if (err != null) {
                return cb(err, null);
              }

              if (res.status !== 201) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body.id);
            });
        }
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

      withToken(
        cb,
        function(token) {
          superagent
            .get(makeUrl('/message/thread/' + messageId))
            .set(sessionTokenHeader, token)
            .end(
            function (err, res) {
              if (err != null) {
                return cb(err, null);
              }

              if (res.status !== 200) {
                return handleHttpError(res, cb);
              }

              cb(null, res.body.messages);
            });
        }
      );
    }
  };
};
