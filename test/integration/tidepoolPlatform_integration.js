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
var expect = require('salinity').expect;
var superagent = require('superagent');

var platform = require('../../index.js');
var myLocalStore = require('./mockedLocalStorage')();
var pjson = require('../../package.json');

describe('platform client', function () {

  /**
   * Timeout is used when running against the deployed services
   */
  this.timeout(10000);

  var pwdClient = null;
  var memberClient = null;

  /*
   * Represents a 'Person With Data' as used in the tests
   *
   * This will typically be a diabetic :)
   */
  var a_PWD = {
    id: null,
    token: null,
    username: 'a_PWD@user.com',
    password: 'a_PWD',
    emails: ['a_PWD@user.com'],
    profile: {fullName: 'Jamie'}
  };

  /*
   * Represents a member of a team that has no data themselves as such but has explicitly
   * been given access to the team of someone that has diabetes and is a `pwd`
   *
   * Use cases include:
   *
   * - parent of someone with diabeties
   * - dr or another health professional
   */
  var a_Member = {
    id: null,
    token: null,
    username: 'team@member.com',
    password: 'teammember',
    emails: ['team@member.com'],
    profile: {fullName: 'Dr Doogie'}
  };

  function createClient(user, loginOpts, mockedLocalStore ,cb) {
    var myLog = { info: console.log, warn: console.log };

    mockedLocalStore = mockedLocalStore || myLocalStore;

    var client = platform(
      { host: 'https://devel-api.tidepool.io',
        metricsSource : pjson.name,
        metricsVersion : pjson.version
      },
      { superagent : superagent,
        log : myLog,
        localStore : mockedLocalStore }
    );

    loginOpts = loginOpts || {};

    return client.login(user,loginOpts,function (error, data) {
      if (data && data.userid) {
        user.id = data.userid;
      }

      if (error) {
        return client.signup(user, function (error, data) {
          if (error) {
            return cb(error, null);
          }
          user.id = data.userid;
          return cb(null, client);
        });
      } else {
        return cb(null, client);
      }
    });
  }

  before(function (done) {

    var noLoginOpts = {};

    async.parallel(
      [
        createClient.bind(null, a_PWD,noLoginOpts,myLocalStore),
        createClient.bind(null, a_Member,noLoginOpts,myLocalStore)
      ],
      function(err, clients) {
        if (err != null) {
          return done(err);
        }
        pwdClient = clients[0];
        memberClient = clients[1];
        done();
      }
    );
  });

  /*
   * Lets be good and logout
   */
  after(function (done) {
    async.parallel(
      [
        function(callback){ pwdClient.logout(callback); },
        function(callback){ memberClient.logout(callback); }
      ],
      function(err, clients) {
        if (err != null) {
          return done(err);
        }
        done();
      }
    );
  });

  describe('on initialization', function () {
    it('when the remember flag is true the user stays logged in', function (done) {

      var store = require('./mockedLocalStorage')();

      var refreshOnlyUser = {
        username: 'dummy@user.com',
        password: 'tesT1n3',
        emails: ['dummy@user.com']
      };

      createClient(refreshOnlyUser, {remember:true}, store, function(error,loggedIn){

        expect(error).to.not.exist;

        loggedIn.initialize(function(){
          expect(loggedIn.isLoggedIn()).to.be.true;
          //'refresh' again for good measure
          loggedIn.initialize(function(){
            expect(loggedIn.isLoggedIn()).to.be.true;
            done();
          });
        });

      });
    });
    it('when the remember flag is false the user does NOT stay logged in', function (done) {

      createClient(a_PWD, {remember:false}, require('./mockedLocalStorage')(),function(error,loggedIn){

        expect(error).to.not.exist;

        loggedIn.initialize(function(){
          expect(loggedIn.isLoggedIn()).to.be.false;
          done();
        });

      });
    });
    it('when the remember flag is not set the user does NOT stay logged in', function (done) {

      createClient(a_PWD, {} , require('./mockedLocalStorage')(), function(error,loggedIn){

        expect(error).to.not.exist;

        loggedIn.initialize(function(){
          expect(loggedIn.isLoggedIn()).to.be.false;
          done();
        });

      });
    });
  });

  describe('allows applications too', function () {
    var defaulted = null;
    it('track metrics to tidepool', function (done) {

      createClient(a_PWD, defaulted, defaulted,function(error,loggedInApp){

        expect(error).to.not.exist;
        loggedInApp.trackMetric('Platform Client Metrics Test',defaulted,done);

      });
    });
    it('log errors to tidepool', function (done) {

      createClient(a_PWD, defaulted , defaulted, function(error,loggedInApp){

        expect(error).to.not.exist;
        var appErrorToLog = new Error('Error From Platform Client Tests');
        loggedInApp.logAppError(appErrorToLog,'an error? what!',defaulted,done);

      });
    });
  });

  describe('handles user profiles', function () {
    it('so we can add or update the logged in users profile', function (done) {
      //add or update for both our users
      async.parallel([
        pwdClient.addOrUpdateProfile.bind(null, a_PWD.id, a_PWD.profile),
        memberClient.addOrUpdateProfile.bind(null, a_Member.id, a_Member.profile)
      ],
        function(err, profiles) {
          if (err != null) {
            return done(err);
          }
          done();
        }
      );
    });
    it('get another users public profile', function (done) {
      //logged in as a_PWD you can get the profile for a_Member
      pwdClient.findProfile(a_Member.id, function (error, profile) {
        expect(error).to.not.exist;

        expect(profile).to.exist;
        expect(profile.fullName).to.equal(a_Member.profile.fullName);
        expect(profile).to.not.have.property('password');
        expect(profile).to.not.have.property('username');

        done();
      });
    });
    it('get the logged in users profile', function (done) {
      //logged in as a_Member you can get your profile
      memberClient.findProfile(a_Member.id, function (error, profile) {
        expect(error).to.not.exist;

        expect(profile).to.be.exist;
        expect(profile.fullName).to.equal(a_Member.profile.fullName);
        expect(profile).to.not.have.property('password');
        expect(profile).to.not.have.property('username');
        done();
      });
    });
  });

  describe('handles messages', function () {
    var noteToAddId;
    var noteToAdd;
    var commentOnNote;

    /*
     * Give a_Memeber to a_PWD for these tests
     */
    before(function (done) {
      pwdClient.setAccessPermissions(a_Member.id, {view: {}}, function(err, permissions) {
        expect(permissions).to.deep.equal({view: {}});
        done(err);
      });
    });

    /*
     * Revoke a_Memeber permissons to a_PWD after these tests
     */
    after(function (done) {
      pwdClient.setAccessPermissions(a_Member.id, null, function(err, permissions) {
        expect(permissions).to.be.empty;
        done(err);
      });
    });

    it('so a_PWD can add a note that goes to the team also', function (done) {

      noteToAdd = {
        userid: a_PWD.id,
        groupid: a_PWD.id,
        timestamp: new Date().toISOString(),
        messagetext: 'In three words I can sum up everything I have learned about life: it goes on.'
      };

      //add note
      pwdClient.startMessageThread(noteToAdd, function (error, added) {
        expect(error).to.not.exist;
        expect(added).to.exist;
        noteToAddId = added;
        done();
      });
    });
    it('and a_Member can comment on the note', function (done) {

      //comment on the note
      commentOnNote = {
        userid: a_Member.id,
        groupid: a_PWD.id,
        parentmessage : noteToAddId,
        timestamp: new Date().toISOString(),
        messagetext: 'Good point bro!'
      };

      memberClient.replyToMessageThread(commentOnNote, function (error, replied) {
        expect(error).to.not.exist;
        expect(replied).to.exist;
        done();
      });
    });
    it('and a_Member can also start a thread for a_PWD', function (done) {

      //comment on the note
      var noteFromAMember = {
        userid: a_Member.id,
        groupid: a_PWD.id,
        timestamp: new Date().toISOString(),
        messagetext: 'Just a note to say you should consider ....'
      };

      memberClient.startMessageThread(noteFromAMember, function(error,added){
        expect(error).to.not.exist;
        expect(added).to.exist;
        done();
      });
    });
    it('a_PWD can get a message thread', function (done) {
      pwdClient.getMessageThread(noteToAddId, function (error, data) {
        expect(error).to.not.exist;
        expect(data).to.exist;
        expect(data.length).to.equal(2);

        var note = _.filter(data, function(message) {
          return (!message.parentmessage);
        });
        var comment = _.filter(data, function(message) {
          return (message.parentmessage);
        });
        expect(comment.parentmessage).to.equal(note.id);
        done();
      });
    });
    it('a_Member can get message in a date range for a_PWD', function (done) {

      var twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      var dates = {
        start: twoWeeksAgo ,
        end : new Date()
      };

      memberClient.getAllMessagesForUser(a_PWD.id, dates, function (error, data) {

        expect(error).to.not.exist;
        expect(data).to.exist;
        expect(data.length).to.be.at.least(2);
        done();
      });
    });
    it('a_PWD can get all notes (i.e. no comments)', function (done) {

      pwdClient.getNotesForUser(a_PWD.id, null, function (error, data) {

        expect(error).to.not.exist;
        expect(data).to.exist;

        for (var i = data.length - 1; i >= 0; i--) {
          expect(data[i].parentmessage).to.not.exist;
        }

        done();
      });
    });
    it('a user can edit the content of their note', function (done) {

      var noteToAdd = {
        userid: a_PWD.id,
        groupid: a_PWD.id,
        timestamp: new Date().toISOString(),
        messagetext: 'we will update this'
      };

      //add note
      pwdClient.startMessageThread(noteToAdd, function (error, added) {
        expect(error).to.not.exist;
        expect(added).to.exist;

        var edits = {
          id: added.id,
          messagetext : 'we have updated'
        };

        pwdClient.editMessage(edits, function (error, update) {

          expect(error).to.not.exist;
          expect(update).to.exist;
          expect(update._id).to.equal(added);
          expect(update.messagetext).to.equal(edits.messagetext);
          done();
        });
      });
    });
    it('a user can edit the time of their note', function (done) {

      var noteToAdd = {
        userid: a_PWD.id,
        groupid: a_PWD.id,
        timestamp: new Date().toISOString(),
        messagetext: 'a random note - we will update the time'
      };

      //add note
      pwdClient.startMessageThread(noteToAdd, function (error, added) {
        expect(error).to.not.exist;
        expect(added).to.exist;

        var edits = {
          id: added.id,
          timestamp : new Date().toISOString()
        };

        pwdClient.editMessage(edits, function (error, update) {

          expect(error).to.not.exist;
          expect(update).to.exist;
          expect(update._id).to.equal(added);
          expect(update.timestamp).to.equal(edits.timestamp);
          done();
        });
      });
    });
    it('an edit with nothing to update is rejected', function (done) {
      pwdClient.editMessage({}, function (error, update) {
        expect(error).to.exist;
        expect(error.message).to.exist;
        expect(update).to.not.exist;
        done();
      });
    });
  });

  describe('handles team permissions', function () {

    var careTeamViewable;
    var pwdsTeam;
    var notesForThePatientpwd;

    it('so we can give a_Member permisson to view a_PWD', function(done){
      pwdClient.setAccessPermissions(a_Member.id, {view: {}}, function(err, permissions) {
        expect(permissions).to.deep.equal({view: {}});
        done(err);
      });
    });

    it('so a_Member has a_PWD as a viewable user', function (done) {
      memberClient.getViewableUsers(a_Member.id, function (error, viewableUsers) {
        var expectation = {};
        expectation[a_Member.id] = {root: {}};
        expectation[a_PWD.id] = {view: {}};
        expect(viewableUsers).to.deep.equal(expectation);

        careTeamViewable = viewableUsers;
        done(error);
      });
    });

    it('and a_PWD has a_Member included in the team ', function (done) {
      pwdClient.getTeamMembers(a_PWD.id, function (error, team) {
        var expectation = {};
        expectation[a_PWD.id] = {root: {}};
        expectation[a_Member.id] = {view: {}};

        expect(team).to.deep.equal(expectation);
        pwdsTeam = team;
        done(error);
      });
    });

    it('but a_Member cannot see the other team members for a_PWD', function (done) {
      memberClient.getTeamMembers(a_PWD.id, function (error, patientsTeam) {
        expect(error).to.deep.equal({ status: 401, body: 'These are not the droids you are looking for.' });
        done();
      });
    });

    it('a_Member can see the messages for a_PWD', function (done) {
      pwdClient.getNotesForUser(a_PWD.id, null, function (error, patientsNotes) {
        expect(patientsNotes).to.exist;
        expect(patientsNotes).to.have.length.above(0);
        notesForThePatientpwd = patientsNotes;
        done();
      });
    });

    it('a_Member sees the messages as a_PWD sees them', function (done) {
      memberClient.getNotesForUser(a_PWD.id, null, function (error, pwdTeamNotes) {
        expect(pwdTeamNotes).to.exist;
        expect(pwdTeamNotes).to.have.length.above(0);
        expect(pwdTeamNotes).that.deep.equals(notesForThePatientpwd);
        done();
      });
    });

    it('a_PWD can remove the permissions for a_Member', function(done) {
      pwdClient.setAccessPermissions(a_Member.id, null, function(err, perms){
        expect(perms).to.be.empty;
        done(err);
      });
    });
  });
});
