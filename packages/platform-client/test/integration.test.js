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

const chai = require('chai');
var _ = require('lodash');
var async = require('async');
var superagent = require('superagent');
const fetch = require('node-fetch');
var storage = require('../lib/inMemoryStorage');

var platform = require('../index.js');
var pjson = require('../package.json');

const { expect } = chai;

describe('platform client', function () {

  // @ts-ignore
  global.fetch = fetch;

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
  var aPWD = {
    id: null,
    token: null,
    username: 'a_PWD@user.com',
    password: 'a_PWD',
    emails: ['a_PWD@user.com'],
    profile: {fullName: 'Jamie'},
    preferences: {
      display: 'some',
    },
    settings: {
      siteChangeSource: 'cannulaPrime',
    },
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
  var aMember = {
    id: null,
    token: null,
    username: 'test+platform-client+integration@tidepool.org',
    password: 'teammember',
    emails: ['test+platform-client+integration@tidepool.org'],
    profile: {fullName: 'Dr Doogie'},
    preferences: {
      display: 'all',
    },
    settings: {
      siteChangeSource: 'tubingPrime',
    },
  };

  function createClient(localStore, cb) {
    var myLog = { info: console.log, warn: console.log };

    var client = platform(
      {
        host: 'https://dev-api.tidepool.org',
        metricsSource : pjson.name,
        metricsVersion : pjson.version
      },
      {
        superagent : superagent,
        log : myLog,
        localStore: localStore == null ? storage() : localStore
      }
    );

    client.initialize(function(err){
      return cb(err, client);
    });
  }

  function createClientWithUser(user, loginOpts, mockedLocalStore ,cb) {
    return createClient(mockedLocalStore, function(err, client){
      if (err != null) {
        return cb(err);
      }

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
    });
  }

  before(function (done) {

    var noLoginOpts = {};

    async.parallel(
      [createClientWithUser.bind(null, aPWD,noLoginOpts,storage()), createClientWithUser.bind(null, aMember,noLoginOpts,storage())],
      function(err, clients) {
        expect(err).to.not.exist;
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
      [function(callback){ pwdClient.logout(callback); }, function(callback){ memberClient.logout(callback); }],
      function(err, clients) {
        expect(err).to.not.exist;
        done();
      }
      );
  });

  describe('on initialization', function () {
    it('when the remember flag is true the user stays logged in', function (done) {

      var store = storage();

      var refreshOnlyUser = {
        username: 'dummy@user.com',
        password: 'tesT1n3',
        emails: ['dummy@user.com']
      };

      createClientWithUser(refreshOnlyUser, {remember:true}, store, function(error, loggedIn){
        expect(error).to.not.exist;
        expect(loggedIn.isLoggedIn()).to.be.true;
        console.log('first logged in');

        createClient(store, function(err, client) {
          expect(err).to.not.exist;

          expect(client.isLoggedIn()).to.be.true;
          console.log('second logged in');
          createClient(store, function(err, anotherClient){
            expect(err).to.not.exist;
            expect(anotherClient.isLoggedIn()).to.be.true;
            console.log('thirdlogged in');
            done();
          });
        });
      });
    });
    it('when the remember flag is false the user does NOT stay logged in', function (done) {

      createClientWithUser(aPWD, {remember:false}, storage(),function(error,loggedIn){

        expect(error).to.not.exist;

        loggedIn.initialize(function(){
          expect(loggedIn.isLoggedIn()).to.be.false;
          done();
        });

      });
    });
    it('when the remember flag is not set the user does NOT stay logged in', function (done) {

      createClientWithUser(aPWD, {} , storage(), function(error,loggedIn){

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

      createClientWithUser(aPWD, defaulted, defaulted,function(error,loggedInApp){

        expect(error).to.not.exist;
        loggedInApp.trackMetric('Platform Client Metrics Test',defaulted,done);

      });
    });
    it('log errors to tidepool', function (done) {

      createClientWithUser(aPWD, defaulted , defaulted, function(error,loggedInApp){

        expect(error).to.not.exist;
        var appErrorToLog = new Error('Error From Platform Client Tests');
        loggedInApp.logAppError(appErrorToLog,'an error? what!',defaulted,done);

      });
    });
  });
  describe('handles user profiles', function () {
    it('so we can add or update the logged in users profile', function (done) {
    //add or update for both our users
      async.parallel(
        [pwdClient.addOrUpdateProfile.bind(null, aPWD.id, aPWD.profile), memberClient.addOrUpdateProfile.bind(null, aMember.id, aMember.profile)],
        function(err, profiles) {
          expect(err).to.not.exist;
          done();
        }
      );
    });
    it('get another users public profile', function (done) {
      //logged in as a_PWD you can get the profile for a_Member
      pwdClient.findProfile(aMember.id, function (error, profile) {
        expect(error).to.include({ status: 401, body: 'Unauthorized' });
        done();
      });
    });
    it('get the logged in users profile', function (done) {
      //logged in as a_Member you can get your profile
      memberClient.findProfile(aMember.id, function (error, profile) {
        expect(error).to.not.exist;

        expect(profile).to.be.exist;
        expect(profile.fullName).to.equal(aMember.profile.fullName);
        expect(profile).to.not.have.property('password');
        expect(profile).to.not.have.property('username');
        done();
      });
    });
  });
  describe('handles user preferences', function () {
    it('so we can add or update the logged in user\'s preferences', function (done) {
    //add or update for both our users
      async.parallel(
        [pwdClient.addOrUpdatePreferences.bind(null, aPWD.id, aPWD.preferences), memberClient.addOrUpdatePreferences.bind(null, aMember.id, aMember.preferences)],
        function(err, preferences) {
          expect(err).to.not.exist;
          done();
        }
      );
    });
    it('get another user\'s public preferences', function (done) {
      //logged in as a_PWD you can get the profile for a_Member
      pwdClient.findPreferences(aMember.id, function (error, settings) {
        expect(error).to.include({ status: 401, body: 'Unauthorized' });
        done();
      });
    });
    it('get the logged in user\'s preferences', function (done) {
      //logged in as a_Member you can get your profile
      memberClient.findPreferences(aMember.id, function (error, preferences) {
        expect(error).to.not.exist;

        expect(preferences).to.be.exist;
        expect(preferences.display).to.equal(aMember.preferences.display);
        done();
      });
    });
  });
  describe('handles user settings', function () {
    it('so we can add or update the logged in user\'s settings', function (done) {
    //add or update for both our users
      async.parallel(
        [pwdClient.addOrUpdateSettings.bind(null, aPWD.id, aPWD.settings), memberClient.addOrUpdateSettings.bind(null, aMember.id, aMember.settings)],
        function(err, settings) {
          expect(err).to.not.exist;
          done();
        }
      );
    });
    it('get another user\'s public settings', function (done) {
      //logged in as a_PWD you can get the profile for a_Member
      pwdClient.findSettings(aMember.id, function (error, settings) {
        expect(error).to.include({ status: 401, body: 'Unauthorized' });
        done();
      });
    });
    it('get the logged in user\'s settings', function (done) {
      //logged in as a_Member you can get your profile
      memberClient.findSettings(aMember.id, function (error, settings) {
        expect(error).to.not.exist;

        expect(settings).to.be.exist;
        expect(settings.siteChangeSource).to.equal(aMember.settings.siteChangeSource);
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
      pwdClient.setAccessPermissions(aMember.id, {view: {}}, function(err, permissions) {
        expect(err).to.not.exist;
        expect(permissions).to.deep.equal({view: {}});
        done();
      });
    });

    /*
    * Revoke a_Member permissons to a_PWD after these tests
    */
    after(function (done) {
      pwdClient.setAccessPermissions(aMember.id, null, function(err, permissions) {
        expect(err).to.not.exist;
        expect(permissions).to.not.exist;
        done();
      });
    });

    it('so a_PWD can add a note that goes to the team also', function (done) {

      noteToAdd = {
        userid: aPWD.id,
        groupid: aPWD.id,
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
        userid: aMember.id,
        groupid: aPWD.id,
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
        userid: aMember.id,
        groupid: aPWD.id,
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

      memberClient.getAllMessagesForUser(aPWD.id, dates, function (error, data) {

        expect(error).to.not.exist;
        expect(data).to.exist;
        expect(data.length).to.be.at.least(2);
        done();
      });
    });
    it('a_PWD can get all notes (i.e. no comments)', function (done) {

      pwdClient.getNotesForUser(aPWD.id, null, function (error, data) {

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
        userid: aPWD.id,
        groupid: aPWD.id,
        timestamp: new Date().toISOString(),
        messagetext: 'we will update this'
      };

      //add note
      pwdClient.startMessageThread(noteToAdd, function (error, addedId) {
        expect(error).to.not.exist;
        expect(addedId).to.exist;
        var edits = {
          id: addedId,
          messagetext : 'we have updated'
        };

        pwdClient.editMessage(edits, function (error, update) {
          expect(error).to.not.exist;
          expect(update).to.exist;
          done();
        });
      });
    });
    it('a user can edit the time of their note', function (done) {

      var noteToAdd = {
        userid: aPWD.id,
        groupid: aPWD.id,
        timestamp: new Date().toISOString(),
        messagetext: 'a random note - we will update the time'
      };

      //add note
      pwdClient.startMessageThread(noteToAdd, function (error, addedId) {
        expect(error).to.not.exist;
        expect(addedId).to.exist;
        var edits = {
          id: addedId,
          timestamp : new Date().toISOString()
        };

        pwdClient.editMessage(edits, function (error, update) {
          expect(error).to.not.exist;
          expect(update).to.exist;
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
      pwdClient.setAccessPermissions(aMember.id, {view: {}}, function(err, permissions) {
        expect(err).to.not.exist;
        expect(permissions).to.deep.equal({view: {}});
        done();
      });
    });

    it('so a_Member has a_PWD as a viewable user', function (done) {
      memberClient.getViewableUsers(aMember.id, function (error, viewableUsers) {
        expect(error).to.not.exist;
        expect(viewableUsers).to.exist;
        careTeamViewable = viewableUsers;
        done();
      });
    });

    it('and a_PWD has a_Member included in the team ', function (done) {
      pwdClient.getTeamMembers(aPWD.id, function (error, team) {
        expect(error).to.not.exist;
        var expectation = {};
        expectation[aPWD.id] = {root: {}};
        expectation[aMember.id] = {view: {}};

        expect(team).to.deep.equal(expectation);
        pwdsTeam = team;
        done();
      });
    });

    it('but a_Member cannot see the other team members for a_PWD', function (done) {
      memberClient.getTeamMembers(aPWD.id, function (error, patientsTeam) {
        expect(error).to.include({ status: 401, body: 'Unauthorized' });
        done();
      });
    });

    it('a_Member can see the messages for a_PWD', function (done) {
      pwdClient.getNotesForUser(aPWD.id, null, function (error, patientsNotes) {
        expect(patientsNotes).to.exist;
        expect(patientsNotes).to.have.length.above(0);
        notesForThePatientpwd = patientsNotes;
        done();
      });
    });

    it('a_Member sees the messages as a_PWD sees them', function (done) {
      memberClient.getNotesForUser(aPWD.id, null, function (error, pwdTeamNotes) {
        expect(pwdTeamNotes).to.exist;
        expect(pwdTeamNotes).to.have.length.above(0);
        expect(pwdTeamNotes).that.deep.equals(notesForThePatientpwd);
        done();
      });
    });

    it('a_PWD can remove the permissions for a_Member', function(done) {
      pwdClient.setAccessPermissions(aMember.id, null, function(err, permissions) {
        expect(err).to.not.exist;
        expect(permissions).to.not.exist;
        done();
      });
    });
  });
  describe('allows us to reset a users password', function () {
    /* for pw reset with legit email*/
    var pwResetUsr = {
      id: null,
      token: null,
      username: 'noreply+pwreset@tidepool.org',
      password: 'noreply',
      emails: ['noreply+pwreset@tidepool.org'],
      profile: {fullName: 'Platform Client Password Reset'}
    };
    var pwResetClient;

    before(function (done) {
      console.log('doing reset setup ...');
      createClientWithUser(pwResetUsr, {}, storage() ,function(err,client){
        expect(err).to.not.exist;
        expect(client).to.exist;
        pwResetClient = client;
        done();
      });
    });
    it('so we can request the pw if forgotten - no info', function(done) {
      pwResetClient.requestPasswordReset(aMember.emails[0], true, 'en', function(err) {
        if (_.isEmpty(err)) {
          done();
        } else {
          console.log('requestPasswordReset err:', err);
          done(err);
        }
      }, false);
    });
    it('so we can request the pw if forgotten - with info', function(done) {
      pwResetClient.requestPasswordReset(aMember.emails[0], true, 'en', function(err) {
        if (_.isEmpty(err)) {
          done();
        } else {
          console.log('requestPasswordReset err:', err);
          done(err);
        }
      });
    });
    it('a pw confirmation will be rejected without all the required details', function(done){
      var payload = {key:'i-dont-know',email:'nan@nan.org'};

      pwResetClient.confirmPasswordReset(payload, function(err) {
        expect(err).to.exist;
        expect(err.status).to.equal(400);
        expect(err.body).to.equal('payload requires object with `key`, `email`, `password`');
        done();
      });
    });
    it('a pw confirmation will not be found without a valid key and email', function(done){
      var payload = {key:'i-dont-know',email:'nan@nan.org',password:'an3w1n3'};

      pwResetClient.confirmPasswordReset(payload, function(err) {
        expect(err).to.exist;
        expect(err.status).to.equal(404);
        done();
      });
    });
  });
  describe('handles updating the user', function () {
    it('so we can change the users email', function (done) {

      function rollbackUserUpdate(errorToCheck, cb){
        if(_.isEmpty(errorToCheck) || errorToCheck.status === 409 ) {
          var resetUpdate = {username : pwdClient.username};
          pwdClient.updateCurrentUser(resetUpdate, function(cleanupError){
            expect(cleanupError).to.not.exist;
            if(cb){
              return cb();
            }
          });
        } else {
          expect(errorToCheck).to.not.exist;
        }
      }


      var updatesToApply = {username:'b_PWD@user.com'};
      pwdClient.updateCurrentUser(updatesToApply, function(error){

        if(error){ rollbackUserUpdate(error); }

        pwdClient.getCurrentUser(function(error2, details){
          expect(error2).to.not.exist;
          expect(details.username).to.equal(updatesToApply.username);
          rollbackUserUpdate(null,done());
        });
      });
    });
    it('so we can accept the T&C', function (done) {
      var termsToApply = { termsAccepted : '2015-12-31T23:59:59-08:00'};
      pwdClient.updateCurrentUser(termsToApply, function(error){
        expect(error).to.not.exist;
        pwdClient.getCurrentUser(function(error2, details){
          expect(error2).to.not.exist;
          done();
        });
      });
    });
  });
  describe.skip('handles connections to OAuth providers for the user', function () {
    var dataSourceFilter = {
      type: 'oauth',
      name: 'dexcom',
    };
    it('using a restricted token', function (done) {
      pwdClient.createRestrictedTokenForUser(
        aPWD.id,
        dataSourceFilter, function(error, restrictedToken){
          expect(error).to.not.exist;
          expect(restrictedToken).to.exist;
        }
      );
    });

    it('adding an OAuth provider authorization', function (done) {
      pwdClient.createRestrictedTokenForUser(
        aPWD.id,
        dataSourceFilter, function(error, restrictedToken){
          expect(error).to.not.exist;
          expect(restrictedToken).to.exist;
          pwdClient.createOAuthProviderAuthorization(
            dataSourceFilter.name,
            restrictedToken, function(error, authorizationURL){
              expect(error).to.not.exist;
              expect(authorizationURL).to.exist;
            }
          );
        }
      );
    });

    it('removing an OAuth provider authorization', function (done) {
      pwdClient.deleteOAuthProviderAuthorization(
        dataSourceFilter.name, function(error, details){
          expect(error).to.not.exist;
          expect(details).to.exist;
        }
      );
    });

  });
  describe.skip('handles invites', function () {
    /*
     * For the tests we are donig this one way
     * Cleanup each time
     */
    beforeEach(function (done) {
      //get all that I have sent and remove them
      async.parallel(
      [function(callback){
        memberClient.invitesSent(aMember.id, function(err, sent) {
            _.forEach(sent, function(invite) {
              console.log('memberClient cleanup invite ',invite.email);
              memberClient.removeInvite(invite.email, aMember.id, function(err,resp){});
            });
            callback();
          });
      },
      function(callback){
        pwdClient.invitesSent(aPWD.id, function(err, sent) {
          _.forEach(sent, function(invite) {
            console.log('pwdClient cleanup invite ',invite.email);
            pwdClient.removeInvite(invite.email, aPWD.id, function(err,resp){});
          });
          callback();
        });
      }],
      function(err, clients) {
        done();
      });
    });
    //skipped as we require an email for sending of the invites for these integration tests.
    it('so we can invite a_Member to be on the team of a_PWD', function(done){
      pwdClient.inviteUser(aMember.emails[0], {view: {}}, aPWD.id, function(err, invite) {
        //might be dup but just ensure we have an invite to accept
        memberClient.invitesReceived(aMember.id, function(err, received) {
          expect(received).to.have.length.above(0);
          memberClient.acceptInvite(received[0].key, aMember.id, aPWD.id, function(err, accept) {
            expect(err).to.not.exist;
            done();
          });
        });
      });
    });
    it('a_Member can dismiss an the invite from a_PWD', function(done){
      pwdClient.inviteUser(aMember.emails[0], {view: {}}, aPWD.id, function(err, invite) {
        //might be dup but just ensure we have an invite to dismiss
        memberClient.invitesReceived(aMember.id, function(err, received) {
          expect(received).to.have.length.above(0);
          memberClient.dismissInvite(received[0].key, aMember.id, aPWD.id,function(err, dismiss) {
            expect(err).to.not.exist;
            done();
          });
        });
      });
    });
    it('a_Member can see the invites they have sent', function(done){
      memberClient.invitesSent(aMember.id, function(err, sent) {
        expect(err).to.not.exist;
        expect(sent).to.have.length.above(0);
        //test what we can see
        expect(sent[0]).to.not.be.empty;
        expect(sent[0]).to.have.keys('key', 'type','email','context','creatorId','created');
        done();
      });
    });
    it('a_Member can see the invites they have received', function(done){
      pwdClient.inviteUser(aMember.emails[0], {view: {}}, aPWD.id, function(err, invite) {
        memberClient.invitesReceived(aMember.id, function(err, received) {
          expect(err).to.not.exist;
          expect(received).to.not.be.empty;
          //test what we can see
          expect(received[0]).to.not.be.empty;
          expect(received[0]).to.have.keys('key', 'type', 'email','context','creator','created');
          done();
        });
      });
    });
    it('a_PWD can cancel an invite they sent to a_Member', function(done){
      memberClient.inviteUser(aPWD.emails[0], {view: {}}, aMember.id, function(err, invite) {
        pwdClient.removeInvite(aMember.emails[0], aPWD.id, function(err,resp){
          expect(err).to.not.exist;
          done();
        });
      });
    });
  });
  //skipped until deployed to devel
  describe.skip('handles signup flow', function () {

    /* for signup flow with legit email*/
    var signUpUsr = {
      id: null,
      token: null,
      username: 'noreply+signup@tidepool.org',
      password: 'noreply',
      emails: ['noreply+signup@tidepool.org'],
      roles: ['clinic'],
      profile: {fullName: 'Platform Client Signup'}
    };

    var signupClient;
    var signupConfirmation;

    before(function (done) {
      console.log('doing signup setup ...');
      createClientWithUser(signUpUsr, {}, storage() ,function(err,client){
        console.log('## setup err ',err);
        signupClient = client;
        signupClient.signupCancel(signUpUsr.id, function(err, canceled) {
          //expect(err).to.not.exist;
          console.log('## canceled err ',err);
          console.log('## canceled ',canceled);
          done();
        });
      });
    });
    it('so we can signup a new user', function(done){
      signupClient.signupStart(signUpUsr.id, 'en', function(err, signup) {
        console.log('## sent err ',err);
        signupConfirmation = signup;
        console.log('## sent ',signup);
        //expect(signupConfirmation).to.exist;
        done();
      });
    });
    it('the user can resend the signup', function(done){
      signupClient.signupResend(signUpUsr.id, 'en', function(err, resent) {
        console.log('## resent err ',err);
        signupConfirmation = resent;
        console.log('## resent ',resent);
        done();
      });
    });
    it('the user can confirm signing up', function(done){
      signupClient.signupConfirm(signUpUsr.id, signupConfirmation.key, function(err, confirmed) {
        console.log('## confrim err ',err);
        console.log('## confrim ',confirmed);
        expect(confirmed).to.exist;
        done();
      });
    });
  });
});
