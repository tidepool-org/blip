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

describe('platform client', function() {

  var platform;

  var mrT1 = {
    id : null,
    token: null,
    username : 'fake',
    password : 'fak3U53r',
    emails :['fake@user.com']
  };

  var careTeamMember = {
    id : null,
    token : null ,
    username : 'dr fake',
    password : 'fak3U53r',
    emails :['dr.fake@user.com']
  };

  var createUser=function(userToAdd,cb){
    //try login first then create user if error
    platform.login(userToAdd,function(error,data){
      if(data && data.userid){
        userToAdd.id = data.userid;
        userToAdd.token = data.token;
      }
      if(error){
        platform.signUp(userToAdd,function(error,data){
          if(error){
            return cb(error,null);
          }
          userToAdd.id = data.userid;
          userToAdd.token = data.token;
          return cb(null,userToAdd);
        });
      }
      return cb(null,userToAdd);
    });
  };

  var addUserTeamGroup=function(userThatOwnsTeam,membersToAdd,cb){
    platform.addGroupForUser(userThatOwnsTeam.id, { members : membersToAdd}, 'team', userThatOwnsTeam.token ,function(error,data){
      cb(error,data);
    });
  };

  before(function(done){
    this.timeout(5000);
    platform = require('../index')('https://devel-api.tidepool.io',superagent);

    createUser(mrT1,function(error,data){
      if(error){
        throw error;
      }
      mrT1 = data;
      //done();
      createUser(careTeamMember,function(error,data){
        if(error){
          throw error;
        }
        careTeamMember = data;
        done();
      });
    });

  });

  it('logs in mrT1', function(done) {
    this.timeout(5000);
    platform.login(mrT1,function(error,data){
      expect(error).to.not.exist;
      expect(data).to.exist;
      done();
    });
  });

  describe('get the team for mrT1',function(){

    before(function(done){
      this.timeout(5000);
      var members = [mrT1.id];
      addUserTeamGroup(mrT1,members,function(error,data){
        if(error){
          throw error;
        }
        done();
      });

    });

    it('returns the team group for mrT1', function(done) {

      this.timeout(5000);

      platform.getGroupForUser(mrT1.id,'team', mrT1.token, function(error,team){
        expect(error).to.not.exist;
        expect(team).to.exist;
        expect(team.members).to.exist;
        expect(team.members).to.be.a('array');
        expect(team.id).to.exist;
        done();
      });
    });

  });

  describe('messaging for mrT1',function(){

    var groupId;

    before(function(done){

      this.timeout(5000);
      var members = [mrT1.id];
      addUserTeamGroup(mrT1,members,function(error,data){
        if(error){
          throw error;
        }
        groupId = data;
        done();
      });

    });

    it('mrT1 adds a note and then comments on it, then get the whole thread', function(done) {

      this.timeout(5000);

      var message = {
        userid : mrT1.id,
        groupid : groupId,
        timestamp : new Date().toISOString(),
        messagetext : 'In three words I can sum up everything I have learned about life: it goes on.'
      };
      //add note
      platform.startMessageThread(groupId, message, mrT1.token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;

        var messageId = data;

        var comment = {
          userid : mrT1.id,
          groupid : groupId,
          timestamp : new Date().toISOString(),
          messagetext : 'Good point bro!'
        };
        //comment on the note
        platform.replyToMessageThread(messageId,comment, mrT1.token, function(error,data){

          expect(error).to.not.exist;
          expect(data).to.exist;

          //get the whole thread
          platform.getMessageThread(messageId, mrT1.token, function(error,data){
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

    it('get all messages for the team of mrT1 for the last two weeks', function(done) {
      var twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);
      var today = new Date();

      platform.getAllMessagesForTeam(groupId, twoWeeksAgo, today, mrT1.token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;
        expect(data.length).to.equal(2);
        done();
      });
    });

  });

  describe('groups for careTeamMember add mrT1 to patients',function(){

    var mrT1TeamId;

    before(function(done){
      this.timeout(5000);
      platform.getGroupForUser(mrT1.id,'team', mrT1.token, function(error,team){
        mrT1TeamId = team.id;
        done();
      });

    });

    it('mrT1 adds careTeamMember to the team', function(done) {
      this.timeout(5000);

      platform.addUserToGroup(mrT1TeamId, careTeamMember.id, mrT1.token, function(error,team){
        if(error){
          throw error;
        }

        platform.getGroupForUser(mrT1.id,'team', mrT1.token, function(error,team){
          expect(error).to.not.exist;
          expect(team).to.exist;
          expect(team.members).to.include(careTeamMember.id);
          expect(team.members).to.include(mrT1.id);
          done();
        });
      });
    });

    it('mrT1 removes careTeamMember from the team', function(done) {
      this.timeout(5000);
      platform.removeUserFromGroup(mrT1TeamId, careTeamMember.id, mrT1.token, function(error,team){
        if(error){
          throw error;
        }

        platform.getGroupForUser(mrT1.id,'team', mrT1.token, function(error,team){
          expect(error).to.not.exist;
          expect(team).to.exist;
          expect(team.members).to.not.include(careTeamMember.id);
          expect(team.members).to.include(mrT1.id);
          done();
        });
      });
    });

  });

});