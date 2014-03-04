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

  before(function(done){
    this.timeout(5000);
    platform = require('../index')('https://devel-api.tidepool.io',superagent);

    createUser(mrT1,function(error,data){
      if(error){
        throw error;
      }
      mrT1 = data;
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

  describe.skip('get the team for mrT1',function(){

    it('returns the team group for mrT1', function(done) {

      this.timeout(5000);

      platform.getUsersTeam(mrT1.id, mrT1.token, function(error,team){
        expect(error).to.not.exist;
        expect(team).to.exist;
        expect(team.members).to.exist;
        expect(team.members).to.be.a('array');
        expect(team.id).to.exist;
        done();
      });
    });

  });

  describe.skip('messaging for mrT1',function(){

    var mrT1TeamId;

    before(function(done){

      this.timeout(5000);
      platform.getUsersTeam(mrT1.id, mrT1.token, function(error,team){
        if(error){
          throw error;
        }
        mrT1TeamId = team.id;
        done();
      });
    });

    it('allows mrT1 to add a note and then comments on it, then get the whole thread', function(done) {

      this.timeout(5000);

      var message = {
        userid : mrT1.id,
        groupid : mrT1TeamId,
        timestamp : new Date().toISOString(),
        messagetext : 'In three words I can sum up everything I have learned about life: it goes on.'
      };
      //add note
      platform.startMessageThread(mrT1TeamId, message, mrT1.token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;

        var messageId = data;

        var comment = {
          userid : mrT1.id,
          groupid : mrT1TeamId,
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

            expect(firstMessage.groupid).to.equal(mrT1TeamId);
            expect(secondMessage.groupid).to.equal(mrT1TeamId);
            expect(firstMessage.parentmessage).to.not.exist;
            expect(firstMessage.messagetext).to.equal(message.messagetext);
            expect(secondMessage.parentmessage).to.equal(firstMessage.id);
            expect(secondMessage.messagetext).to.equal(comment.messagetext);
            done();
          });

        });

      });
    });

    it('allows mrT1 to get all messages for his team for the last two weeks', function(done) {
      var twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate()-14);
      var today = new Date();

      platform.getAllMessagesForTeam(mrT1TeamId, twoWeeksAgo, today, mrT1.token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;
        console.log('messages ',data);
        done();
      });
    });

  });

  describe('mrT1 sets up his team',function(){

    var mrT1TeamId;

    before(function(done){
      this.timeout(5000);
      platform.getUsersTeam(mrT1.id, mrT1.token, function(error,team){
        mrT1TeamId = team.id;
        done();
      });
    });

    it('and invites careTeamMember to the team', function(done) {
      this.timeout(5000);

      platform.getUsersGroups(careTeamMember.id,careTeamMember.token);
      
      platform.getUsersGroups(mrT1.id,mrT1.token);

      platform.inviteToJoinTeam(careTeamMember.id, mrT1.id, mrT1.token, function(error,groups){
        if(error){
          throw error;
        }
        console.log('invited to join: ',groups);
        done();
      });
    });

    it.skip('careTeamMember is now in the team of mrT1 and adds a note for mrT1', function(done) {
      done();
    });

  });

});