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
var expect = require('salinity').expect;
var superagent = require('superagent');

var token;
var userId;

describe('platform client', function() {

  var platform;
  var user = {
      username : 'fake',
      password : 'fak3U53r',
      emails :['fake@user.com']
    };

  var saveSession=function(newUserid,newToken){
    // just as we would in the app
    token = newToken;
    userId = newUserid;

    if (newToken != null) {
      setTimeout(
        function(){
          if (token == null || newUserid !== userId) {
            return;
          }
          platform.refreshUserToken(token,newUserid,function(error,sessionData){
            saveSession(sessionData.userid,sessionData.token);
          });
        },
        10 * 60 * 1000
      );
    }
  };

  var createUser=function(cb){
    //try login first then create user if error
    platform.login(user,function(error,data){
      if(data && data.userid){
        userId = data.userid;
        saveSession(data.userid,data.token);
      }
      if(error){
        platform.signUp(user,cb);
      }
      cb(null,null);
    });
  };

  var addUserTeamGroup=function(cb){
    platform.addGroupForUser(userId, { members : [userId]}, 'team', token ,function(error,data){
      cb(error,data);
    });
  };

  before(function(done){

    platform = require('../index')('https://devel-api.tidepool.io',superagent);

    createUser(function(error,data){
      if(error){
        throw error;
      }
      done();
    });

  });

  it('logs in user', function(done) {
    platform.login(user,function(error,data){
      saveSession(data.userid,data.token);
      expect(error).to.not.exist;
      expect(data).to.exist;
      done();
    });
  });

  describe('get team',function(){

    before(function(done){

      addUserTeamGroup(function(error,data){
        if(error){
          throw error;
        }
        done();
      });

    });

    it('returns the team group asked for', function(done) {

      this.timeout(5000);

      platform.getGroupForUser(userId,'team',token, function(error,team){
        expect(error).to.not.exist;
        expect(team).to.exist;
        expect(team.members).to.exist;
        expect(team.members).to.be.a('array');
        expect(team.id).to.exist;
        done();
      });
    });

  });

  describe('messages',function(){

    var groupId;

    before(function(done){

      addUserTeamGroup(function(error,data){
        if(error){
          throw error;
        }
        groupId = data;
        done();
      });

    });

    it('add a note and then comment on it, then get the whole thread', function(done) {

      this.timeout(5000);

      var message = {
        userid : userId,
        groupid : groupId,
        timestamp : new Date().toISOString(),
        messagetext : 'In three words I can sum up everything I have learned about life: it goes on.'
      };
      //add note
      platform.startMessageThread(groupId, message, token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;

        var messageId = data;

        var comment = {
          userid : userId,
          groupid : groupId,
          timestamp : new Date().toISOString(),
          messagetext : 'Good point bro!'
        };
        //comment on the note
        platform.replyToMessageThread(messageId,comment, token, function(error,data){

          expect(error).to.not.exist;
          expect(data).to.exist;

          //get the whole thread
          platform.getMessageThread(messageId, token, function(error,data){
            expect(error).to.not.exist;
            expect(data).to.exist;
            expect(data.length).to.equal(2);
            var firstMessage = data[0];
            var secondMessage = data[1];

            expect(firstMessage.groupid).to.equal(groupId);
            expect(secondMessage.groupid).to.equal(groupId);
            expect(firstMessage.parentmessage).to.not.exist;
            expect(firstMessage.messagetext).to.equal(message.messagetext);
            expect(secondMessage.parentmessage).to.equal(firstMessage.id);
            expect(secondMessage.messagetext).to.equal(comment.messagetext);
            done();
          });

        });

      });
    });

    it('all messages for the group from the last two weeks', function(done) {
      var twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);
      var today = new Date();

      platform.getAllMessagesForTeam(groupId, twoWeeksAgo, today, token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;
        expect(data.length).to.equal(2);
        done();
      });
    });

  });

});