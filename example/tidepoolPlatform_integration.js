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
    emails :['fake@user.com'],
    fullname : 'Jamie T1d',
    shortname : 'Jamie',
    publicbio : 'To live is the rarest thing in the world. Most people exist, that is all.'
  };

  var careTeamMember = {
    id : null,
    token : null ,
    username : 'dr fake',
    password : 'fak3U53r',
    emails :['dr.fake@user.com'],
    fullname : 'Dr Doogie Howser ',
    shortname : 'Doogie',
    publicbio : 'A teenage physician who also faces the problems of being a normal teenager'
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

  describe('sets up the profiles',function(){

    it('for mrT1', function(done) {
      this.timeout(5000);
      platform.addOrUpdateProfile(mrT1, mrT1.token, function(error,added){
        expect(error).to.not.exist;
        expect(added).to.be.true;
        done();
      });
    });

    it('for mrT1 we can get the profile', function(done) {
      this.timeout(5000);
      platform.findProfile(mrT1.id, mrT1.token, function(error,profile){
        expect(error).to.not.exist;
        expect(profile).to.be.exist;

        expect(profile.fullname).to.equal(mrT1.fullname);
        expect(profile.shortname).to.equal(mrT1.shortname);
        expect(profile.publicbio).to.equal(mrT1.publicbio);
        done();
      });
    });

    it('for careTeamMember', function(done) {
      this.timeout(5000);
      platform.addOrUpdateProfile(careTeamMember, careTeamMember.token, function(error,added){
        expect(error).to.not.exist;
        expect(added).to.be.true;
        done();
      });
    });

    it('for careTeamMember we can get the profile', function(done) {
      this.timeout(5000);
      platform.findProfile(careTeamMember.id, careTeamMember.token, function(error,profile){
        expect(error).to.not.exist;
        expect(profile).to.be.exist;

        expect(profile.fullname).to.equal(careTeamMember.fullname);
        expect(profile.shortname).to.equal(careTeamMember.shortname);
        expect(profile.publicbio).to.equal(careTeamMember.publicbio);
        done();
      });
    });

  });

  describe('get the team for mrT1',function(){

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

  describe('messaging for mrT1',function(){

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
        expect(data.length).to.be.at.least(2);
        done();
      });
    });

    it('allows mrT1 to get just the parent messages for his team ', function(done) {

      platform.getNotesForTeam(mrT1TeamId, mrT1.token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;

        for (var i = data.length - 1; i >= 0; i--) {
          expect(data[i].parentmessage).to.not.exist;
        }

        done();
      });
    });

  });

  describe('mrT1 sets up his team',function(){

    it('and invites careTeamMember to the team', function(done) {
      this.timeout(10000);

      platform.inviteToJoinTeam(mrT1.id, careTeamMember.id, mrT1.token, function(error,updates){
        if(error){
          throw error;
        }
        expect(updates.inviter.invited.members).to.include(careTeamMember.id);
        expect(updates.invitee.invitedby.members).to.include(mrT1.id);
        done();
      });
    });

    it('careTeamMember accepts the invite to join the team of mrT1', function(done) {
      this.timeout(10000);

      platform.acceptInviteToJoinTeam(mrT1.id, careTeamMember.id, careTeamMember.token, function(error,updates){
        if(error){
          throw error;
        }
        expect(updates.inviter.team.members).to.include(careTeamMember.id);
        expect(updates.invitee.patients.members).to.include(mrT1.id);
        done();
      });

    });
  });

});