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

module.exports = function(host, superagent) {
  var sessionTokenHeader = 'x-tidepool-session-token';

  /*
    Make the URL
  */
  function makeUrl(path) {
    return host + path;
  }
  /*
    Return the id of the group type for the given user
    (e.g. team, invited, invitedby, patients)
  */
  function getUserGroupId (userId,groupType,token,cb){
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }

    superagent
    .get(makeUrl('/metadata/' + userId + '/groups'))
    .set(sessionTokenHeader, token)
    .end(function(error, res){
      if(error){
        cb(error);
      } else if (res.status === 404) {
        cb(null,null);
      } else if(res.status === 200) {
        cb(null,res.body[groupType]);
      } else {
        cb({ message: 'Unknown response code from groups ' + res.status });
      }
    });
  }
  /*
    Return the user group (e.g. team, invited, patients) asked for.
    If the group does not exist an empty one is created.
  */
  function findOrAddUserGroup(userId,groupType,token,cb){
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }
    async.waterfall([
      function(callback){
        //find users groups
        getUserGroupId(userId,groupType,token,function(error,groupId){
          callback(error,groupId);
        });
      },
      function(groupId,callback){
        //find users groups
        if(groupId == null){
          createUserGroup(userId,groupType,token,function(error,groupId){
            callback(error,groupId);
          });
        }else{
          callback(null,groupId);
        }
      },
      function(groupId, callback){
        //find the requested group
        if(groupId){
          superagent
            .get(makeUrl('/group/' + groupId + '/members'))
            .set(sessionTokenHeader, token)
            .end(function(error, res){

              if(error){
                callback(error);
              } else if (res.status !== 200) {
                callback({ message: 'Unknown response code from groups ' + res.status });
              } else {
                var group = {
                  id: groupId,
                  members: res.body.members
                };
                callback(null,group);
              }
            });
        } else {
          callback(null,null);
        }
      }
    ],
    function (err, result) {
      return cb(err,result);
    });
  }
  /*
    Create the user group (e.g. team, invited, patients ...) asked for and link to the user.
  */
  function createUserGroup(userId,groupType,token,cb){
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }
    async.waterfall([
      function(callback){
        //add the empty group
        superagent
          .post(makeUrl('/group'))
          .set(sessionTokenHeader, token)
          .send({ group : { members : [] }})
          .end(function(err, res){
            if (err != null) {
              callback(err,null);
            } else if (res.status !== 201) {
              callback({ message: 'Unknown response code from groups ' + res.status });
            }
            callback(null,res.body.id);
          });
      },
      function(groupId, callback){
        //get all groups associated with the user
        superagent
          .get(makeUrl('/metadata/' + userId + '/groups'))
          .set(sessionTokenHeader, token)
          .end(function(err, res){
            callback(err, groupId, res.body);
          });
      },
      function(groupId, existingGroups, callback){
        //add new group type to the users groups

        if(existingGroups == null) {
          existingGroups = {};
        }

        existingGroups[groupType] = groupId;

        superagent
          .post(makeUrl('/metadata/' + userId + '/groups'))
          .set(sessionTokenHeader, token)
          .send(existingGroups)
          .end(function(err, res){

              if (err != null) {
                callback(err);
              } else if (res.status !== 200) {
                callback({ message: 'Unknown response code from metadata ' + res.status });
              }
              callback(null,groupId);
            });
      }
    ],
    function (err, result) {
      return cb(err,result);
    });
  }
  /*
    Add a member to the user group (e.g. team, invited, patients ...)
  */
  function addMemberToUserGroup(groupId,memberId,token,cb){
    if (groupId == null) {
      return cb({ message: 'Must specify a groupId' });
    }
    if (memberId == null) {
      return cb({ message: 'Must specify a memberId to add' });
    }

    superagent
      .put(makeUrl('/group/' + groupId + '/user'))
      .set(sessionTokenHeader, token)
      .send({userid : memberId})
      .end(function(err, res){
        if (err != null) {
          cb(err,null);
        } else if (res.status !== 200) {
          cb({ message: 'Unknown response code from groups ' + res.status });
        } else {
          cb(null,res.body);
        }
      });
  }
  return {
    /**
     * Login user to the Tidepool platform
     *
     * @param user object with a username and password to login
     * @returns {cb}  cb(err, response)
     */
    login: function(user, cb){
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
        function(err, res) {
          if (err != null) {
            return cb(err,null);
          }

          if (res.status === 200) {
            cb(null,{userid:res.body.userid,token:res.headers[sessionTokenHeader],user:res.body});
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    },
    /**
     * Signup user to the Tidepool platform
     *
     * @param user object with a username and password
     * @returns {cb}  cb(err, response)
     */
    signUp: function(user, cb){
      if (user.username == null) {
        return cb({ message: 'Must specify an username' });
      }
      if (user.password == null) {
        return cb({ message: 'Must specify a password' });
      }

      var userApiUser = _.assign({}, _.pick(user, 'username', 'password'), { emails: [user.username] });

      superagent
      .post(makeUrl('/auth/user'))
      .send(userApiUser)
      .end(
      function(err, res){
        if (err != null) {
          return cb(err);
        }

        if (res.status === 201) {
          cb(null,{userid:res.body.userid,token:res.headers[sessionTokenHeader]});
        } else if (res.status === 401) {
          cb({ message: 'Unauthorized' });
        } else {
          cb({ message: 'Unknown response code ' + res.status });
        }
      });
    },
    /**
     * Add a new or update an existing profile for a user
     *
     * @param user object with a username and password
     * @param token a user token
     * @returns {cb}  cb(err, response)
     */
    addOrUpdateProfile : function(user, token, cb){
      if (user.fullname == null) {
        return cb({ message: 'Must specify an fullname' });
      }
      if (user.shortname == null) {
        return cb({ message: 'Must specify an shortname' });
      }
      if (user.id == null) {
        return cb({ message: 'Must specify an id' });
      }

      var userProfile = _.assign({}, _.pick(user, 'fullname', 'shortname', 'publicbio'));

      superagent
      .put(makeUrl('/metadata/' + user.id + '/profile'))
      .set(sessionTokenHeader, token)
      .send(userProfile)
      .end(
      function(err, res){
        if (err != null) {
          return cb(err);
        }

        if (res.status === 200) {
          cb(null,true);
        } else if (res.status === 401) {
          cb({ message: 'Unauthorized' });
        } else {
          cb({ message: 'Unknown response code ' + res.status });
        }
      });
    },
    /**
     * Find a users profile
     *
     * @param userId of the user you are finding the profile of
     * @param token a user token
     * @returns {cb}  cb(err, response)
     */
    findProfile : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }

      superagent
      .get(makeUrl('/metadata/' + userId + '/profile'))
      .set(sessionTokenHeader, token)
      .end(
      function(err, res){
        if (err != null) {
          cb(err);
        } else if (res.status === 200) {
          cb(null,res.body);
        } else if (res.status === 401) {
          cb({ message: 'Unauthorized' });
        } else {
          cb({ message: 'Unknown response code ' + res.status });
        }
      });
    },
    /**
     * Refresh a users token
     *
     * @param token a user token
     * @param userId id of the user we are doing the token refresh for
     * @returns {cb}  cb(err, response)
     */
    refreshUserToken : function(token,userId,cb){
      superagent.get(makeUrl('/auth/login'))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res){
          if (err) {
            return cb(err,null);
          }

          if (res.status === 200) {
            cb(null,{userid:userId,token:res.headers[sessionTokenHeader]});
          } else {
            cb({message:'Unknown response when refreshing token' + res.status},null);
          }
        });
    },
    /**
     * Create the required group type for a user
     *
     * @param userId id of the user
     * @param groupType name of the type of group we are creating e.g. team
     * @param token id of the user we are doing the token refresh for
     * @returns {cb}  cb(err, response)
     */
    createUserGroup: createUserGroup,
    /**
     * Get the users 'team'
     *
     * @param userId id of the user
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    getUsersTeam : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      findOrAddUserGroup(userId,'team',token, cb);
    },
    /**
     * Get the users 'patients'
     *
     * @param userId id of the user
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    getUsersPatients : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      findOrAddUserGroup(userId,'patients',token, cb);
    },
    /**
     * Get the listed users public info
     *
     * @param patientIds array of id's that we want the public info for
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    getPatientsInfo : function(patientIds, token, cb){
      if (patientIds == null) {
        return cb({ message: 'Must specify a patientIds' });
      }

      var idList = _(patientIds).uniq().join(',');

      superagent
        .get(makeUrl('/metadata/publicinfo?users='+idList))
        .set(sessionTokenHeader, token)
        .end(
        function(error, res) {

          if (error != null) {
            return cb(error,null);
          }
          if (res.status === 200) {
            cb(null, res.body);
          } else if (res.status === 404) {
            //just so happens there are no messages
            cb(null, null);
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    },
    /**
     * Get the users who have been invited to join the team
     *
     * @param userId id of the user
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    getInvitesToTeam : function(userId, token,cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      findOrAddUserGroup(userId,'invited',token, cb);
    },
    /**
     * Invite a user to join the 'team'
     *
     * @param inviterId id of the user who is inviting
     * @param inviteeId id of the user who is being invited
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    inviteToJoinTeam : function(inviterId, inviteeId, token,cb){
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }

      this.getInvitesToTeam(inviterId,token,function(error,invited){
        if(_.contains(invited.members, inviteeId)){
          //console.log('invite already exists');
          return cb(error,invited);
        }else{
          //console.log('add the invite');
          addMemberToUserGroup(invited.id,inviteeId,token, function(error, updatedInvited){
            return cb(error,updatedInvited);
          });
        }
      });
    },
    /**
     * Accept an invite to join a users 'team'
     *
     * @param inviterId id of the user who is inviting
     * @param inviteeId id of the user who is being invited
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    acceptInviteToJoinTeam : function(inviterId, inviteeId, token, cb){
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }

      this.getUsersTeam(inviterId,token,function(error,team){
        if(_.contains(team.members, inviteeId)){
          //console.log('already a team member');
          return cb(error,team);
        }else{
          //console.log('add to team');
          addMemberToUserGroup(team.id,inviteeId,token, function(error, updatedTeam){
            return cb(error,updatedTeam);
          });
        }
      });
    },
    /**
     * Add the user to the patients list
     *
     * @param inviterId id of the user who is inviting
     * @param inviteeId id of the user who is being invited
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    addToPatients : function(inviterId, inviteeId, token, cb){
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }

      this.getUsersPatients(inviteeId,token,function(error,patients){
        if(_.contains(patients.members, inviterId)){
          //console.log('already a patient');
          return cb(error,patients);
        }else{
          //console.log('add as a patient');
          addMemberToUserGroup(patients.id,inviterId,token, function(error, updatedPatients){
            return cb(error,updatedPatients);
          });
        }
      });
    },
    /**
     * Get messages for a team between the given dates
     *
     * @param groupId of the team to get the messages for
     * @param start date
     * @param end date
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    getAllMessagesForTeam : function(groupId, start, end, token, cb){
      superagent
        .get(makeUrl('/message/all/'+groupId+'?starttime='+start+'&endtime='+end))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res) {

          if (err != null) {
            return cb(err,null);
          }
          if (res.status === 200) {
            cb(null, res.body.messages);
          } else if (res.status === 404) {
            //just so happens there are no messages
            cb(null, []);
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    },
    /**
     * Get all notes for a team
     *
     * @param groupId of the team to get the messages for
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    getNotesForTeam : function(groupId, token, cb){
      superagent
        .get(makeUrl('/message/notes/'+groupId))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res) {

          if (err != null) {
            return cb(err,null);
          }
          if (res.status === 200) {
            cb(null, res.body.messages);
          } else if (res.status === 404) {
            //just so happens there are no messages
            cb(null, []);
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    },
    /**
     * Reply to a specfic message thread
     *
     * @param messageId of the root message
     * @param comment on the message thread
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    replyToMessageThread : function(messageId,comment,token,cb){
      superagent
        .post(makeUrl('/message/reply/'+messageId))
        .set(sessionTokenHeader, token)
        .send({message:comment})
        .end(
        function(err, res) {
          if (err != null) {
            return cb(err,null);
          }

          if (res.status === 201) {
            cb(null, res.body.id);
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    },
    /**
     * Start a new message thread
     *
     * @param groupId of the team the message is for
     * @param message that is the start of a new thread
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    startMessageThread : function(groupId,message,token,cb){

      superagent
        .post(makeUrl('/message/send/'+groupId))
        .set(sessionTokenHeader, token)
        .send({message:message})
        .end(
        function(err, res) {
          if (err != null) {
            return cb(err,null);
          }

          if (res.status === 201) {
            cb(null, res.body.id);
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    },
    /**
     * Get a specific message thread
     *
     * @param messageId of the root message
     * @param token of the user
     * @returns {cb}  cb(err, response)
     */
    getMessageThread : function(messageId,token,cb){
      superagent
        .get(makeUrl('/message/thread/'+messageId))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res) {
          if (err != null) {
            return cb(err,null);
          }

          if (res.status === 200) {
            cb(null, res.body.messages);
          } else if (res.status === 401) {
            cb({ message: 'Unauthorized' });
          } else {
            cb({ message: 'Unknown status code ' + res.status });
          }
        });
    }
  };
};
