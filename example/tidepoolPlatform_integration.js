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
    platform = require('../index')('http://localhost:8009',superagent);

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
    var noteToAddId;
    var noteToAdd;
    var commentOnNote;

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

    it('allows mrT1 to add a note', function(done) {

      this.timeout(5000);

      noteToAdd = {
        userid : mrT1.id,
        groupid : mrT1TeamId,
        timestamp : new Date().toISOString(),
        messagetext : 'In three words I can sum up everything I have learned about life: it goes on.'
      };

      //add note
      platform.startMessageThread(mrT1TeamId, noteToAdd, mrT1.token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;
        noteToAddId = data;
        done();
      });
    });

    it('and add a comment on the note', function(done) {

      this.timeout(5000);
      //comment on the note
      commentOnNote = {
        userid : mrT1.id,
        groupid : mrT1TeamId,
        timestamp : new Date().toISOString(),
        messagetext : 'Good point bro!'
      };

      platform.replyToMessageThread(noteToAddId,commentOnNote, mrT1.token, function(error,data){

        expect(error).to.not.exist;
        expect(data).to.exist;
        done();
      });
    });

    it('and then get the whole thread', function(done) {

      this.timeout(5000);

      platform.getMessageThread(noteToAddId, mrT1.token, function(error,data){
        expect(error).to.not.exist;
        expect(data).to.exist;
        expect(data.length).to.equal(2);
        var firstMessage = data[0];
        var secondMessage = data[1];

        expect(firstMessage.groupid).to.equal(mrT1TeamId);
        expect(secondMessage.groupid).to.equal(mrT1TeamId);
        expect(firstMessage.parentmessage).to.not.exist;
        expect(firstMessage.messagetext).to.equal(noteToAdd.messagetext);
        expect(secondMessage.parentmessage).to.equal(firstMessage.id);
        expect(secondMessage.messagetext).to.equal(commentOnNote.messagetext);
        done();
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

  describe('mrT1 groups',function(){

    it('has a team', function(done) {
      this.timeout(5000);

      platform.getUsersTeam(mrT1.id, mrT1.token, function(error,team){
        if(error){
          throw error;
        }
        expect(error).to.not.exist;
        expect(team).to.exist;
        expect(team.members).to.exist;
        expect(team.members).to.be.a('array');
        expect(team.id).to.exist;
        done();
      });
    });

    it('has patients', function(done) {
      this.timeout(5000);

      platform.getUsersPatients(mrT1.id, mrT1.token, function(error,patients){
        if(error){
          throw error;
        }
        expect(error).to.not.exist;
        expect(patients).to.exist;
        expect(patients.members).to.exist;
        expect(patients.members).to.be.a('array');
        expect(patients.id).to.exist;
        done();
      });
    });

    it('has invited', function(done) {
      this.timeout(5000);

      platform.getInvitesToTeam(mrT1.id, mrT1.token, function(error,invites){
        if(error){
          throw error;
        }
        expect(error).to.not.exist;
        expect(invites).to.exist;
        expect(invites.members).to.exist;
        expect(invites.members).to.be.a('array');
        expect(invites.id).to.exist;
        done();
      });
    });
  });

  describe('careTeamMember groups',function(){

    it('has a team', function(done) {
      this.timeout(5000);

      platform.getUsersTeam(careTeamMember.id, careTeamMember.token, function(error,team){
        if(error){
          throw error;
        }
        expect(error).to.not.exist;
        expect(team).to.exist;
        expect(team.members).to.exist;
        expect(team.members).to.be.a('array');
        expect(team.id).to.exist;
        done();
      });
    });

    it('has patients', function(done) {
      this.timeout(5000);

      platform.getUsersPatients(careTeamMember.id, careTeamMember.token, function(error,patients){
        if(error){
          throw error;
        }
        expect(error).to.not.exist;
        expect(patients).to.exist;
        expect(patients.members).to.exist;
        expect(patients.members).to.be.a('array');
        expect(patients.id).to.exist;
        done();
      });
    });

    it('has invited', function(done) {
      this.timeout(5000);

      platform.getInvitesToTeam(careTeamMember.id, careTeamMember.token, function(error,invites){
        if(error){
          throw error;
        }
        expect(error).to.not.exist;
        expect(invites).to.exist;
        expect(invites.members).to.exist;
        expect(invites.members).to.be.a('array');
        expect(invites.id).to.exist;
        done();
      });
    });
  });

  describe('groups managment for mrT1 ',function(){

    it('allows him to invite another user to join the team', function(done) {
      this.timeout(5000);

      platform.inviteToJoinTeam(mrT1.id, careTeamMember.id, mrT1.token, function(error,team){
        if(error){
          throw error;
        }
        platform.getInvitesToTeam(mrT1.id, mrT1.token, function(error,invites){
          if(error){
            throw error;
          }
          expect(invites.members).to.include(careTeamMember.id);
          done();
        });
      });
    });

    it('which means the invited user is added to his team when they accept an invite', function(done) {
      this.timeout(5000);

      platform.acceptInviteToJoinTeam(mrT1.id, careTeamMember.id, mrT1.token, function(error,team){
        if(error){
          throw error;
        }
        platform.getUsersTeam(mrT1.id, mrT1.token, function(error,team){
          if(error){
            throw error;
          }
          expect(team.members).to.include(careTeamMember.id);
          done();
        });
      });
    });

    it('is added to careTeamMember patients list', function(done) {
      this.timeout(5000);

      platform.addToPatients(mrT1.id, careTeamMember.id, careTeamMember.token, function(error,team){
        if(error){
          throw error;
        }
        platform.getUsersPatients(careTeamMember.id, careTeamMember.token, function(error,patients){
          if(error){
            throw error;
          }
          expect(patients.members).to.include(mrT1.id);
          done();
        });
      });
    });

  });

  describe('careTeamMember',function(){

    var careTeamMembersPatients;
    var mrT1sTeam;
    var notesForThePatientMrT1;

    it('can get the patients and mrT1 is included', function(done) {
      this.timeout(5000);
      platform.getUsersPatients(careTeamMember.id, careTeamMember.token, function(error,patients){
        expect(patients.members).to.exist;
        expect(patients.members).to.include(mrT1.id);
        careTeamMembersPatients = patients;
        done();
      });
    });

    it('mrT1 gets his team and careTeamMember is included', function(done) {
      this.timeout(5000);
      platform.getUsersTeam(mrT1.id, mrT1.token, function(error,team){
        expect(team.members).to.exist;
        expect(team.members).to.include(careTeamMember.id);
        mrT1sTeam = team;
        done();
      });
    });

    it('can get the team for mrT1 and is included in the members', function(done) {
      this.timeout(5000);
      platform.getUsersTeam(mrT1.id,careTeamMember.token,function(error,patientsTeam){
        expect(patientsTeam.members).to.include(careTeamMember.id);
        done();
      });
    });

    it('can get the notes for the team of mrT1', function(done) {
      this.timeout(5000);
      platform.getNotesForTeam(mrT1sTeam.id,careTeamMember.token,function(error,patientsNotes){
        expect(patientsNotes).to.exist;
        expect(patientsNotes).to.have.length.above(1);
        notesForThePatientMrT1 = patientsNotes;
        done();
      });
    });

    it('can see the notes for patient mrT1 are the same as he sees', function(done) {
      this.timeout(5000);
      platform.getNotesForTeam(mrT1sTeam.id,mrT1.token,function(error,mrT1TeamNotes){
        expect(mrT1TeamNotes).to.exist;
        expect(mrT1TeamNotes).to.have.length.above(1);
        expect(mrT1TeamNotes).that.deep.equals(notesForThePatientMrT1);
        done();
      });
    });
  });
});
