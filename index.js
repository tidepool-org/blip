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

module.exports = function(host, superagent) {
  var sessionTokenHeader = 'x-tidepool-session-token';
  
  function makeUrl(path) {
    return host + path;
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
    getGroupForUser: function (userId,groupType,token,cb){
      superagent
      .get(makeUrl('/metadata/' + userId + '/groups'))
      .set(sessionTokenHeader, token)
      .end(
        function(err, res){
          if (err != null) {
            return cb(err,null);
          }

          if (res.status !== 200) {
            return cb({ message: 'Unknown response code from metadata ' + res.status });
          } else {
            if (res.body == null || res.body.groupType == null) {
              return cb(null, []);
            }

            var groupId = res.body.groupType;

            superagent
            .get(makeUrl('/group/' + groupId + '/members'))
            .set(sessionTokenHeader, token)
            .end(
              function(membersErr, membersResult){
                if (membersErr != null) {
                  return cb(membersErr);
                }

                if (membersResult.status === 200) {
                  var group = {
                    id: groupId,
                    members: membersResult.body.members
                  };
                  return cb(null, group);
                }
                else {
                  return cb({ message: 'Unknown response code from groups ' + res.status });
                }
              });
          }
        });
    },
    addGroupForUser : function(userId,groupMembers,groupType,token,cb){
      if (userId == null) {
        return cb({ message: 'Must specify a userId' });
      }
      if (groupType == null) {
        return cb({ message: 'Must specify a groupType' });
      }
      if (groupMembers == null) {
        return cb({ message: 'Must specify groupMembers' });
      }

      superagent
        .post(makeUrl('/group'))
        .set(sessionTokenHeader, token)
        .send({group:groupMembers})
        .end(function(err, res){
          if (err != null) {
            return cb(err,null);
          }

          if (res.status !== 201) {
            return cb({ message: 'Unknown response code from groups ' + res.status });
          }
          var groupId = res.body.id;
          superagent
            .post(makeUrl('/metadata/' + userId + '/groups'))
            .set(sessionTokenHeader, token)
            .send({groupType:groupId})
            .end(function(metaDataErr, metaDataRes){
              if (metaDataErr != null) {
                return cb(metaDataErr);
              }
              if (res.status !== 201) {
                return cb({ message: 'Unknown response code from metadata ' + res.status });
              }
              return cb(null,groupId);
            });
        });
    },
    getUserTeamAndMessages :function(userId,token,cb){
      return cb(null,null);
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