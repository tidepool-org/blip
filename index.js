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
          //find
          superagent
            .get(makeUrl('/metadata/' + userId + '/groups'))
            .set(sessionTokenHeader, token)
            .end(function(err, res){
              callback(err, res.body);
            });
        },
        function(existingGroups, callback){
          if(existingGroups[groupType]){
            console.log('we found the group? ',groupType);
            callback(null,existingGroups[groupType]);
          }else{
            console.log('we need to create the group? ',groupType);
            createUserGroup(userId,groupType,existingGroups,token,callback);
          }
        },
        function(groupId, callback){

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

        console.log('the existing groups ',existingGroups);

        existingGroups[groupType] = groupId;
        console.log('the existing groups now ',existingGroups);

        superagent
          .post(makeUrl('/metadata/' + userId + '/groups'))
          .set(sessionTokenHeader, token)
          .send(existingGroups)
          .end(function(err, res){

              console.log('result of adding to metadata ',res.body);
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
    getUsersGroups : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      //find
      superagent
        .get(makeUrl('/metadata/' + userId + '/groups'))
        .set(sessionTokenHeader, token)
        .end(function(err, res){
          console.log('current group types: ',res.body);
          //return cb(err, res.body);
        });
    },
    getUsersTeam : function(userId, token, cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }

      async.waterfall([
        function(callback){
          getUserGroup(userId,'team',token, callback);
        },
        function(team, callback){
          if(_.contains(team.members,userId)){
            callback(null,team);
          }else{
            addMemberToUserGroup(team.id,userId,token,callback);
          }
        }
      ], function (err, team) {
        return cb(err,team);
      });
    },
    inviteToJoinTeam : function(invitedUser, invitedByUser, token,cb){
      if (invitedUser == null) {
        return cb({ message: 'Must specify a invitedUser' });
      }
      if (invitedByUser == null) {
        return cb({ message: 'Must specify a invitedByUser' });
      }

      async.auto({
        getInviteGroup: function(callback){
          getUserGroup(invitedByUser,'invited',token,callback);
        },
        getInvitedByGroup: function(callback){
          getUserGroup(invitedUser,'invitedby',token, callback);
        },
        addToInvited: ['getInviteGroup', function(callback,results){
          //console.log('getInviteGroup: ',results);
          var inviteGroup = results.getInviteGroup;
          addMemberToUserGroup(inviteGroup.id,invitedUser,token,callback);
        }],
        recordWhoInvited: ['getInvitedByGroup', function(callback, results){
          //console.log('getInvitedByGroup: ',results);
          var invitedByGroup = results.getInvitedByGroup;
          addMemberToUserGroup(invitedByGroup.id,invitedByUser,token,callback);
        }],
        inviteProcessComplete: ['addToInvited','recordWhoInvited', function(callback, results){
          console.log('inviteProcessComplete Results: ',results);
          return cb(null,results);
        }]
      });

      /*async.parallel({
        sendInvite: function(callback){
          getUserGroup(invitedByUser,'invited',token,function(error,invitedGroup){
            addMemberToUserGroup(invitedGroup.id,invitedUser,token,function(error,invited){
              callback(error,invited);
            });
          });
        },
        addInvite: function(callback){
          getUserGroup(invitedUser,'invitedby',token,function(error,invitedByGroup){
            addMemberToUserGroup(invitedByGroup.id,invitedByUser,token,function(error,invitedBy){
              callback(error,invitedBy);
            });
          });
        }
      },
      function(error, results) {
          console.log('inviteToJoinTeam Error: ',error);
          console.log('inviteToJoinTeam Results: ',results);
          return cb(error,results);
      });
      */
    },
    acceptInviteToJoinTeam : function(invitedUser,token,cb){
      if (invitedUser == null) {
        return cb({ message: 'Must specify a invitedUser' });
      }

      async.auto({
        get_team: function(callback){
          getUserGroup(invitedUser,'team',token,callback);
        },
        get_patients: function(callback){
          getUserGroup(invitedUser,'patients',token, callback);
        },
        add_to_team: ['get_invite', function(callback, results){
          var teamGroup = results.get_team;
          addMemberToUserGroup(teamGroup.id,invitedUser,token,callback);
        }],
        add_to_patients: ['get_patients', function(callback, results){
          var patientsGroup = results.get_patients;
          addMemberToUserGroup(patientsGroup.id,invitedUser,token,callback);
        }],
        acceptance_complete: ['add_to_team','add_to_patients', function(callback, results){
          console.log('acceptInviteToJoinTeam Error: ',error);
          console.log('acceptInviteToJoinTeam Results: ',results);
          return cb(error,results);
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