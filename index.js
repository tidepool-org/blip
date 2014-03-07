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

module.exports = function(host, superagent) {
  var sessionTokenHeader = 'x-tidepool-session-token';

  /*
    Make the URL
  */
  function makeUrl(path) {
    return host + path;
  }
  /*
    Return the user group (e.g. team, invited, patients) asked for.
    If the group does not exist an empty one is created.
  */
  function getUserGroup(userId,groupType,token,cb){
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }
    async.waterfall([
        function(callback){
          //find users groups
          superagent
            .get(makeUrl('/metadata/' + userId + '/groups'))
            .set(sessionTokenHeader, token)
            .end(function(err, res){
              callback(err, res.body);
            });
        },
        function(existingGroups, callback){
          //check
          if(existingGroups[groupType]){
            callback(null,existingGroups[groupType]);
          }else{
            createUserGroup(userId,groupType,existingGroups,token,callback);
          }
        },
        function(groupId, callback){
          //find the requested group
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
        }
      ],
      function (err, result) {
        return cb(err,result);
      });
  }
  /*
    Create the user group (e.g. team, invited, patients ...) asked for and link to the user.
  */
  function createUserGroup(userId,groupType,existingGroups,token,cb){
    if (userId == null) {
      return cb({ message: 'Must specify a userId' });
    }
    if (groupType == null) {
      return cb({ message: 'Must specify a groupType' });
    }
    async.waterfall([
      function(callback){
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
          return cb(err,null);
        } else if (res.status !== 200) {
          return cb({ message: 'Unknown response code from groups ' + res.status });
        }
        return cb(null,res.body);
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
          return cb(err);
        }

        if (res.status === 200) {
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
    getUsersTeam : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      getUserGroup(userId,'team',token, cb);
    },
    getUsersPatients : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      getUserGroup(userId,'patients',token, cb);
    },
    getInvitesToTeam : function(userId, token,cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      getUserGroup(userId,'invited',token, cb);
    },
    getInvitesForTeams : function(userId, token,cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      getUserGroup(userId,'invitedby',token, cb);
    },
    inviteToJoinTeam : function(inviterId, inviteeId, token,cb){
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }

      async.auto({
        getInviteGroup: function(callback){
          getUserGroup(inviterId,'invited',token,callback);
        },
        getInvitedByGroup: function(callback){
          getUserGroup(inviteeId,'invitedby',token, callback);
        },
        addToInvited: ['getInviteGroup', function(callback,results){
          var inviteGroup = results.getInviteGroup;
          addMemberToUserGroup(inviteGroup.id,inviteeId,token,callback);
        }],
        recordWhoInvited: ['getInvitedByGroup', function(callback, results){
          var invitedByGroup = results.getInvitedByGroup;
          addMemberToUserGroup(invitedByGroup.id,inviterId,token,callback);
        }],
        inviteProcessComplete: ['addToInvited','recordWhoInvited', function(callback, results){

          var updates = {
            inviter : {
              id : inviterId,
              invited : results.addToInvited.group
            },
            invitee : {
              id : inviteeId,
              invitedby : results.recordWhoInvited.group
            }
          };
          return cb(null,updates);
        }]
      });
    },
    acceptInviteToJoinTeam : function(inviterId, inviteeId, token, cb){
      if (inviterId == null) {
        return cb({ message: 'Must specify a inviterId' });
      }
      if (inviteeId == null) {
        return cb({ message: 'Must specify a inviteeId' });
      }

      var self = this;

      async.auto({
        getInviterTeam: function(callback){
          self.getUsersTeam(inviterId,token,callback);
        },
        getInviteePatients: function(callback){
          self.getUsersPatients(inviteeId,token,callback);
        },
        joinTeam: ['getInviterTeam', function(callback,results){
          var team = results.getInviterTeam;
          addMemberToUserGroup(team.id,inviteeId,token,callback);
        }],
        updatePatients: ['getInviteePatients', function(callback, results){
          var patients = results.getInviteePatients;
          addMemberToUserGroup(patients.id,inviterId,token,callback);
        }],
        inviteProcessComplete: ['joinTeam','updatePatients', function(callback, results){

          var updates = {
            inviter : {
              id : inviterId,
              team : results.joinTeam.group
            },
            invitee : {
              id : inviteeId,
              patients : results.updatePatients.group
            }
          };
          return cb(null,updates);
        }]
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