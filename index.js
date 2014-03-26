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
var _ = (typeof window !== 'undefined') ? window._ : require('lodash');
var async = (typeof window !== 'undefined') ? window.async : require('async');

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
    refreshUserToken : function(token,newUserid,cb){
      superagent.get(makeUrl('/auth/login'))
        .set(sessionTokenHeader, token)
        .end(
        function(err, res){
          if (err) {
            return cb(err,null);
          }

          if (res.status === 200) {
            cb(null,{userid:newUserid,token:res.headers[sessionTokenHeader]});
          } else {
            cb({message:'Unknown response when refreshing token' + res.status},null);
          }
        });
    },

    createUserGroup: createUserGroup,

    getUsersTeam : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      findOrAddUserGroup(userId,'team',token, cb);
    },
    getUsersPatients : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      findOrAddUserGroup(userId,'patients',token, cb);
    },
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
    getInvitesToTeam : function(userId, token,cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      findOrAddUserGroup(userId,'invited',token, cb);
    },
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
