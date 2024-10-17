/* global sinon */
/* global chai */
/* global describe */
/* global it */
/* global before */
/* global beforeEach */
/* global after */
/* global afterEach */

import api from '../../../../app/core/api';
import _ from 'lodash';

const noop = _.noop;
const currentUserId = 'a1b2c3';

describe('api', () => {
  let tidepool;
  let rollbar;

  before(() => {
    tidepool = {
      findProfile: sinon.stub(),
      getUserId: sinon.stub().returns(currentUserId),
      getCurrentUser: sinon.stub(),
      getAssociatedUsersDetails: sinon.stub(),
      updateCustodialUser: sinon.stub(),
      updateCurrentUser: sinon.stub(),
      addOrUpdateProfile: sinon.stub(),
      addOrUpdatePreferences: sinon.stub(),
      signupStart: sinon.stub(),
      login: sinon.stub().callsArgWith(2, null, { userid: currentUserId }),
      logout: sinon.stub().callsArgWith(0, null),
      destroySession: sinon.stub(),
      isLoggedIn: sinon.stub(),
      logAppError: sinon.stub(),
      getPrescriptionsForClinic: sinon.stub(),
      createPrescription: sinon.stub(),
      createPrescriptionRevision: sinon.stub(),
      deletePrescription: sinon.stub(),
      getClinics: sinon.stub(),
      createClinic: sinon.stub(),
      getClinic: sinon.stub(),
      updateClinic: sinon.stub(),
      getCliniciansFromClinic: sinon.stub(),
      getClinician: sinon.stub(),
      updateClinician: sinon.stub(),
      deleteClinicianFromClinic: sinon.stub(),
      getPatientsForClinic: sinon.stub(),
      createCustodialAccount: sinon.stub(),
      getPatientFromClinic: sinon.stub(),
      createClinicCustodialAccount: sinon.stub(),
      updateClinicPatient: sinon.stub(),
      inviteClinician: sinon.stub(),
      getClinicianInvite: sinon.stub(),
      resendClinicianInvite: sinon.stub(),
      deleteClinicianInvite: sinon.stub(),
      getPatientInvites: sinon.stub(),
      acceptPatientInvitation: sinon.stub(),
      updatePatientPermissions: sinon.stub(),
      getClinicsForPatient: sinon.stub(),
      getClinicianInvites: sinon.stub(),
      acceptClinicianInvite: sinon.stub(),
      dismissClinicianInvite: sinon.stub(),
      getClinicsForClinician: sinon.stub(),
      inviteClinic: sinon.stub(),
      resendInvite: sinon.stub(),
      deletePatientFromClinic: sinon.stub(),
      deletePatientInvitation: sinon.stub(),
      getClinicByShareCode: sinon.stub(),
      triggerInitialClinicMigration: sinon.stub(),
      sendPatientUploadReminder: sinon.stub(),
      sendPatientDexcomConnectRequest: sinon.stub(),
      createClinicPatientTag: sinon.stub(),
      updateClinicPatientTag: sinon.stub(),
      deleteClinicPatientTag: sinon.stub(),
      getPatientsForTideDashboard: sinon.stub(),
      getPatientsForRpmReport: sinon.stub(),
      saveSession: sinon.stub(),
      getClinicPatientCount: sinon.stub(),
      getClinicPatientCountSettings: sinon.stub(),
      setClinicPatientLastReviewed: sinon.stub(),
      revertClinicPatientLastReviewed: sinon.stub(),
    };

    rollbar = {
      configure: sinon.stub(),
      error: sinon.stub(),
    }

    api.__Rewire__('tidepool', tidepool);
    api.__Rewire__('rollbar', rollbar);
  });

  beforeEach(() => {
    tidepool.findProfile.resetHistory();
    tidepool.getUserId.resetHistory();
    tidepool.getCurrentUser.resetHistory();
    tidepool.getAssociatedUsersDetails.resetHistory();
    tidepool.findProfile.resetHistory();
    tidepool.updateCustodialUser.resetHistory();
    tidepool.updateCurrentUser.resetHistory();
    tidepool.addOrUpdateProfile.resetHistory();
    tidepool.addOrUpdatePreferences.resetHistory();
    tidepool.signupStart.resetHistory();
    tidepool.login.resetHistory();
    tidepool.logout.resetHistory();
    tidepool.destroySession.resetHistory();
    tidepool.isLoggedIn.resetHistory();
    tidepool.logAppError.resetHistory();
    tidepool.getPrescriptionsForClinic.resetHistory();
    tidepool.createPrescription.resetHistory();
    tidepool.createPrescriptionRevision.resetHistory();
    tidepool.deletePrescription.resetHistory();
    tidepool.getClinics.resetHistory();
    tidepool.createClinic.resetHistory();
    tidepool.getClinic.resetHistory();
    tidepool.updateClinic.resetHistory();
    tidepool.getCliniciansFromClinic.resetHistory();
    tidepool.getClinician.resetHistory();
    tidepool.updateClinician.resetHistory();
    tidepool.deleteClinicianFromClinic.resetHistory();
    tidepool.getPatientsForClinic.resetHistory();
    tidepool.createCustodialAccount.resetHistory();
    tidepool.getPatientFromClinic.resetHistory();
    tidepool.createClinicCustodialAccount.resetHistory();
    tidepool.updateClinicPatient.resetHistory();
    tidepool.inviteClinician.resetHistory();
    tidepool.getClinicianInvite.resetHistory();
    tidepool.resendClinicianInvite.resetHistory();
    tidepool.deleteClinicianInvite.resetHistory();
    tidepool.getPatientInvites.resetHistory();
    tidepool.acceptPatientInvitation.resetHistory();
    tidepool.updatePatientPermissions.resetHistory();
    tidepool.getClinicsForPatient.resetHistory();
    tidepool.getClinicianInvites.resetHistory();
    tidepool.acceptClinicianInvite.resetHistory();
    tidepool.dismissClinicianInvite.resetHistory();
    tidepool.getClinicsForClinician.resetHistory();
    tidepool.resendInvite.resetHistory();
    tidepool.deletePatientFromClinic.resetHistory();
    tidepool.deletePatientInvitation.resetHistory();
    tidepool.getClinicByShareCode.resetHistory();
    tidepool.triggerInitialClinicMigration.resetHistory();
    tidepool.sendPatientUploadReminder.resetHistory();
    tidepool.sendPatientDexcomConnectRequest.resetHistory();
    tidepool.createClinicPatientTag.resetHistory();
    tidepool.updateClinicPatientTag.resetHistory();
    tidepool.deleteClinicPatientTag.resetHistory();
    tidepool.getPatientsForTideDashboard.resetHistory();
    tidepool.getPatientsForRpmReport.resetHistory();
    tidepool.saveSession.resetHistory();
    tidepool.getClinicPatientCount.resetHistory();
    tidepool.getClinicPatientCountSettings.resetHistory();
    tidepool.setClinicPatientLastReviewed.resetHistory();
    tidepool.revertClinicPatientLastReviewed.resetHistory();

    rollbar.configure.resetHistory();
    rollbar.error.resetHistory();
  });

  after(() => {
    api.__ResetDependency__('tidepool');
    api.__ResetDependency__('rollbar');
  });

  describe('user', () => {
    describe('get', () => {
      let preferencesStub;
      let settingsStub;

      before(() => {
        preferencesStub = sinon.stub(api.metadata.preferences, 'get');
        settingsStub = sinon.stub(api.metadata.settings, 'get');
      });

      beforeEach(() => {
        preferencesStub.resetHistory();
        settingsStub.resetHistory();
      });

      after(() => {
        preferencesStub.restore()
        settingsStub.restore()
      });

      it('should fetch the current logged-in user account, preferences, and profile, but no settings if no patient profile is returned', () => {
        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
        });
        tidepool.findProfile.callsArgWith(1, null);
        preferencesStub.callsArgWith(1, null);
        settingsStub.callsArgWith(1, null);

        api.user.get(noop);
        sinon.assert.calledOnce(tidepool.getCurrentUser);
        sinon.assert.calledOnce(tidepool.getUserId);

        sinon.assert.calledOnce(tidepool.findProfile);
        sinon.assert.calledWith(tidepool.findProfile, currentUserId);

        sinon.assert.calledOnce(preferencesStub);
        sinon.assert.calledWith(preferencesStub, currentUserId);

        sinon.assert.notCalled(settingsStub);
      });

      it('should fetch the current logged-in user settings when a patient profile is returned', () => {
        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
        });
        tidepool.findProfile.callsArgWith(1, null, { patient: { fullName: 'Jenny Doe' } });
        preferencesStub.callsArgWith(1, null);
        settingsStub.callsArgWith(1, null);

        api.user.get(noop);
        sinon.assert.calledOnce(tidepool.getCurrentUser);
        sinon.assert.calledOnce(tidepool.getUserId);

        sinon.assert.calledOnce(tidepool.findProfile);
        sinon.assert.calledWith(tidepool.findProfile, currentUserId);

        sinon.assert.calledOnce(preferencesStub);
        sinon.assert.calledWith(preferencesStub, currentUserId);

        sinon.assert.calledOnce(settingsStub);
        sinon.assert.calledWith(settingsStub, currentUserId);
      });

      it('should call back with an error if `tidepool.getCurrentUser` fails', () => {
        const cb = sinon.stub();
        tidepool.getCurrentUser.callsArgWith(0, 'user error');

        api.user.get(cb);

        sinon.assert.calledWith(cb, 'user error');
      });

      it('should call back with an error if `tidepool.findProfile` fails', () => {
        const cb = sinon.stub();
        tidepool.getCurrentUser.callsArgWith(0, null);
        tidepool.findProfile.callsArgWith(1, 'profile error');

        api.user.get(cb);

        sinon.assert.calledWith(cb, 'profile error');
      });

      it('should call back with an error if `api.metadata.preferences.get` fails', () => {
        const cb = sinon.stub();
        tidepool.getCurrentUser.callsArgWith(0, null);
        tidepool.findProfile.callsArgWith(1, null);
        api.metadata.preferences.get.callsArgWith(1, 'preferences error');

        api.user.get(cb);

        sinon.assert.calledWith(cb, 'preferences error');
      });

      it('should call back with an error if `api.metadata.settings.get` fails', () => {
        const cb = sinon.stub();
        tidepool.getCurrentUser.callsArgWith(0, null);
        tidepool.findProfile.callsArgWith(1, null, { patient: { fullName: 'Jenny Doe' } });
        api.metadata.preferences.get.callsArgWith(1, null);
        api.metadata.settings.get.callsArgWith(1, 'settings error');

        api.user.get(cb);

        sinon.assert.calledWith(cb, 'settings error');
      });

      it('should return a patient account object with merged preferences, and profile, and root permissions, and settings', () => {
        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
        });

        tidepool.findProfile.callsArgWith(1, null, { patient: { fullName: 'Jenny Doe' } });

        preferencesStub.callsArgWith(1, null, 'prefs');
        settingsStub.callsArgWith(1, null, 'settings');

        const cb = sinon.stub();

        api.user.get(cb);
        sinon.assert.calledOnce(cb);
        sinon.assert.calledWith(cb, null, {
          permissions: { root: {  } },
          preferences: 'prefs',
          profile: { patient: { fullName: 'Jenny Doe' } },
          settings: 'settings',
          userid: currentUserId,
        });
      });

      it('should return a non-patient account object with merged preferences, and profile', () => {
        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
        });

        tidepool.findProfile.callsArgWith(1, null, { fullName: 'Doctor Jay' });

        preferencesStub.callsArgWith(1, null, 'prefs');
        settingsStub.callsArgWith(1, null, 'settings');

        const cb = sinon.stub();

        api.user.get(cb);
        sinon.assert.calledOnce(cb);
        sinon.assert.calledWith(cb, null, {
          preferences: 'prefs',
          profile: { fullName: 'Doctor Jay' },
          userid: currentUserId,
        });
      });

      it('should set the user config in Rollbar', () => {
        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
          username: 'user@account.com',
        });

        tidepool.findProfile.callsArgWith(1, null, { fullName: 'Doctor Jay' });

        preferencesStub.callsArgWith(1, null, 'prefs');
        settingsStub.callsArgWith(1, null, 'settings');

        const cb = sinon.stub();

        api.user.get(cb);

        sinon.assert.calledOnce(rollbar.configure);
        sinon.assert.calledWith(rollbar.configure, {
          payload: {
            person: {
              id: currentUserId,
              email: 'user@account.com',
              username: 'user@account.com',
            },
          },
        });
      });
    });

    describe('put', () => {
      before(() => {
        tidepool.updateCurrentUser.callsArgWith(1, null, {
          username: 'awesomeUsername2',
        });
        tidepool.addOrUpdateProfile.callsArgWith(2, null, {
          here: 'be more dragons',
        });
        tidepool.addOrUpdatePreferences.callsArgWith(2, null, {
          stuff: 'they really like',
        });
      });

      beforeEach(() => {
        tidepool.updateCurrentUser.resetHistory();
        tidepool.addOrUpdateProfile.resetHistory();
        tidepool.addOrUpdatePreferences.resetHistory();
      });

      after(() => {
        tidepool.updateCurrentUser.reset();
        tidepool.addOrUpdateProfile.reset();
        tidepool.addOrUpdatePreferences.reset();
      });

      it('should update account, profile and preferences', () => {
        const cb = sinon.stub();

        api.user.put(
          {
            userid: 'bestUserIdEver',
            username: 'awesomeUsername',
            password: 'rockinPassword',
            emails: ['awesomeUsername'],
            profile: {
              here: 'be dragons',
            },
            preferences: {
              stuff: 'they like',
            },
          },
          cb
        );

        sinon.assert.calledWith(tidepool.updateCurrentUser, {
          username: 'awesomeUsername',
          password: 'rockinPassword',
          emails: ['awesomeUsername'],
        });
        sinon.assert.calledWith(tidepool.addOrUpdateProfile, 'bestUserIdEver', {
          here: 'be dragons',
        });
        sinon.assert.calledWith(
          tidepool.addOrUpdatePreferences,
          'bestUserIdEver',
          { stuff: 'they like' }
        );
        sinon.assert.calledWith(cb, null, {
          username: 'awesomeUsername2',
          profile: {
            here: 'be more dragons',
          },
          preferences: {
            stuff: 'they really like',
          },
        });
      });

      it('should only make user update call if necessary', () => {
        const cb = sinon.stub();

        api.user.put(
          {
            userid: 'bestUserIdEver',
            profile: {
              here: 'be dragons',
            },
            preferences: {
              stuff: 'they like',
            },
          },
          cb
        );

        sinon.assert.notCalled(tidepool.updateCurrentUser);
        sinon.assert.calledWith(tidepool.addOrUpdateProfile, 'bestUserIdEver', {
          here: 'be dragons',
        });
        sinon.assert.calledWith(
          tidepool.addOrUpdatePreferences,
          'bestUserIdEver',
          { stuff: 'they like' }
        );
        sinon.assert.calledWith(cb, null, {
          profile: {
            here: 'be more dragons',
          },
          preferences: {
            stuff: 'they really like',
          },
        });
      });
    });

    describe('getAssociatedAccounts', () => {
      it('should call `tidepool.getAssociatedUsersDetails` with the current userId', () => {
        api.user.getAssociatedAccounts(noop);
        sinon.assert.calledOnce(tidepool.getAssociatedUsersDetails);
        sinon.assert.calledWith(tidepool.getAssociatedUsersDetails, currentUserId);
      });

      it('should call back with an error if `tidepool.getAssociatedUsersDetails` fails', () => {
        tidepool.getAssociatedUsersDetails.callsArgWith(1, 'error');
        const cb = sinon.stub()
        api.user.getAssociatedAccounts(cb);
        sinon.assert.calledWith(cb, 'error');
      });

      it('should call back with associated accounts grouped as patient, care team, and data donation accounts', () => {
        const accounts = [
          { userid: '1', username: 'bigdata@tidepool.org' },
          { userid: '2', username: 'bigdata+foo@tidepool.org' },
          { userid: '3', username: 'patient1@tidepool.org', trustorPermissions: { view: {} } },
          { userid: '4', username: 'patient2@tidepool.org', trustorPermissions: { view: {} }, trusteePermissions: { view: {}, upload: {} } },
          { userid: '5', username: 'careteam1@tidepool.org', trusteePermissions: { view: {}, upload: {} } },
          { userid: '6', username: 'missing_permissions@tidepool.org' },
        ];

        tidepool.getAssociatedUsersDetails.callsArgWith(1, null, accounts);
        const cb = sinon.stub();

        api.user.getAssociatedAccounts(cb);

        sinon.assert.calledWith(cb, null, {
          patients: [
            { userid: '3', username: 'patient1@tidepool.org', permissions: { view: {} } },
            { userid: '4', username: 'patient2@tidepool.org', permissions: { view: {} } },
          ],
          dataDonationAccounts: [
            { userid: '1', email: 'bigdata@tidepool.org', status: 'confirmed' },
            { userid: '2', email: 'bigdata+foo@tidepool.org', status: 'confirmed' },
          ],
          careTeam: [
            { userid: '4', username: 'patient2@tidepool.org', permissions: { view: {}, upload: {} } },
            { userid: '5', username: 'careteam1@tidepool.org', permissions: { view: {}, upload: {} } },
          ],
        });
      });
    });

    describe('createCustodialAccount', () => {
      it('should call tidepool.createCustodialAccount with the appropriate args', () => {
        const cb = sinon.stub();
        api.user.createCustodialAccount({new: 'patient'}, cb);
        sinon.assert.calledWith(tidepool.createCustodialAccount, {new: 'patient'}, cb);
      });
    });

    describe('login', () => {
      const cb = sinon.stub();
      const user = {
        username: 'user@account.com',
      };

      afterEach(() => {
        cb.resetHistory();
      });

      it('should set the user config in Rollbar', () => {
        api.user.login(user, cb);

        sinon.assert.calledOnce(rollbar.configure);
        sinon.assert.calledWith(rollbar.configure, {
          payload: {
            person: {
              id: currentUserId,
              email: 'user@account.com',
              username: 'user@account.com',
            },
          },
        });
      });

      it('should not attempt to login a user who is already logged in', () => {
        tidepool.isLoggedIn.returns(true);
        sinon.assert.notCalled(tidepool.isLoggedIn);
        api.user.login(user, cb);
        sinon.assert.calledOnce(tidepool.isLoggedIn);
        sinon.assert.notCalled(tidepool.login);
        sinon.assert.calledOnce(cb);
        tidepool.isLoggedIn.resetBehavior();
      });
    });

    describe('logout', () => {
      it('should clear the user config in Rollbar', () => {
        const cb = sinon.stub();

        api.user.logout(cb);

        sinon.assert.calledOnce(rollbar.configure);
        sinon.assert.calledWith(rollbar.configure, {
          payload: {
            person: null,
          },
        });
      });
    });

    describe('saveSession', () => {
      const cb = sinon.stub();
      const userId = 'userID123';
      const token = 'sessionToken';
      const options = { some: 'option' };

      it('should set the appropriate session information', () => {
        api.user.saveSession(userId, token, options, cb);
        sinon.assert.calledOnce(tidepool.saveSession);
        sinon.assert.calledWith(
          tidepool.saveSession,
          userId,
          token,
          options
        );
      });

      it('should allow omitting options', () => {
        api.user.saveSession(userId, token, cb);
        sinon.assert.calledOnce(tidepool.saveSession);
        sinon.assert.calledWith(tidepool.saveSession, userId, token, {});
      });
    });
  });

  describe('patient', () => {
    describe('get', () => {
      let settingsStub;

      before(() => {
        settingsStub = sinon.stub(api.metadata.settings, 'get');
      });

      beforeEach(() => {
        settingsStub.resetHistory();
      });

      after(() => {
        settingsStub.restore()
      });

      it('should call `tidepool.findProfile` with the provided userId', () => {
        api.patient.get('12345', noop);
        sinon.assert.calledOnce(tidepool.findProfile);
        sinon.assert.calledWith(tidepool.findProfile, '12345');
      });

      it('should call back with an error if `tidepool.findProfile` fails', () => {
        const cb = sinon.stub();
        tidepool.findProfile.callsArgWith(1, 'error');

        api.patient.get('12345', cb);

        sinon.assert.calledWith(cb, 'error');
      });

      it('should not call back with a 404 error if `tidepool.findProfile` fails with a 404 status', () => {
        const cb = sinon.stub();
        tidepool.findProfile.callsArgWith(1, { status: 404 });

        api.patient.get('12345', cb);

        sinon.assert.calledWith(cb, { response: 'Not found', status: 404 });
      });

      it('should call back with a patient with profile and settings data', () => {
        const cb = sinon.stub();
        tidepool.findProfile.callsArgWith(1, null, { patient: { fullName: 'Jenny Doe' } });
        settingsStub.callsArgWith(1, null, 'settings');

        api.patient.get('12345', cb);

        sinon.assert.calledWith(cb, null, {
          userid: '12345',
          profile: { patient: { fullName: 'Jenny Doe' } },
          settings: 'settings',
        });
      });
    });

    describe('put', () => {
      it('should call `tidepool.addOrUpdateProfile` if patient is current user', () => {
        const cb = sinon.stub();
        const patient = {
          userid: currentUserId,
          profile: {
            patient: {
              fullName: 'Jenny Doe'
            },
          },
        };
        api.patient.put(patient, cb);
        sinon.assert.calledOnce(tidepool.addOrUpdateProfile);
        sinon.assert.calledWith(tidepool.addOrUpdateProfile, currentUserId, {
          patient: {
            fullName: 'Jenny Doe'
          },
        });
      });

      it('should call `tidepool.addOrUpdateProfile` if patient is not current user but email not updated', () => {
        const cb = sinon.stub();
        const patient = {
          userid: 'abc1234',
          profile: {
            patient: {
              fullName: 'Jenny Doe'
            },
            emails: ['jdoe2@example.com']
          },
          emails: ['jdoe2@example.com']
        };
        tidepool.findProfile.callsArgWith(1, null, patient.profile);
        api.patient.put(patient, cb);
        sinon.assert.calledOnce(tidepool.findProfile);
        sinon.assert.calledWith(tidepool.findProfile, 'abc1234');
        sinon.assert.calledOnce(tidepool.addOrUpdateProfile);
        sinon.assert.calledWith(tidepool.addOrUpdateProfile, 'abc1234', {
          patient: {
            fullName: 'Jenny Doe'
          },
          emails: ['jdoe2@example.com']
        });
      });

      it('should call `updateCustodialUser`, `addOrUpdateProfile` and `signupStart` if patient is not current user and email updated', () => {
        const cb = sinon.stub();
        const patient = {
          userid: 'abc1234',
          profile: {
            patient: {
              fullName: 'Jenny Doe'
            },
            emails: ['jdoe2@example.com']
          },
          emails: ['jdoe2@example.com']
        };
        const oldPatient = {
          userid: 'abc1234',
          profile: {
            patient: {
              fullName: 'Jenny Doe'
            },
            emails: ['jdoe@example.com']
          },
          emails: ['jdoe@example.com']
        }
        tidepool.findProfile.callsArgWith(1, null, oldPatient.profile);
        tidepool.updateCustodialUser.callsArgWith(2, null, 1);
        tidepool.addOrUpdateProfile.callsArgWith(2, null, 1);
        api.patient.put(patient, cb);
        sinon.assert.calledOnce(tidepool.findProfile);
        sinon.assert.calledWith(tidepool.findProfile, 'abc1234');
        sinon.assert.calledOnce(tidepool.updateCustodialUser);
        sinon.assert.calledWith(tidepool.updateCustodialUser, {username: 'jdoe2@example.com', emails: ['jdoe2@example.com']}, 'abc1234');
        sinon.assert.calledOnce(tidepool.addOrUpdateProfile);
        sinon.assert.calledWith(tidepool.addOrUpdateProfile, 'abc1234', {
          patient: {
            fullName: 'Jenny Doe'
          },
          emails: ['jdoe2@example.com']
        });
        sinon.assert.calledOnce(tidepool.signupStart);
        sinon.assert.calledWith(tidepool.signupStart, 'abc1234');
      });
    });
  });

  describe('errors', () => {
    describe('log', () => {
      it('should log an error to Rollbar', () => {
        const error = 'error';
        api.errors.log(error);
        sinon.assert.calledOnce(rollbar.error);
        sinon.assert.calledWith(rollbar.error, error);
      });

      it('should log an error to Tidepool backend', () => {
        const error = 'error';
        const message = 'message';
        const properties = 'properties';
        const cb = sinon.stub();
        api.errors.log(error, message, properties, cb);
        sinon.assert.calledOnce(tidepool.logAppError);
        sinon.assert.calledWith(tidepool.logAppError, error, message, properties, cb);
      });

      it('should log the originalError from an error object', () => {
        const originalError = new Error('original');
        const error = { originalError, other: 'property' };
        api.errors.log(error);
        sinon.assert.calledOnce(rollbar.error);
        sinon.assert.calledWith(rollbar.error, originalError, { displayError: { other: 'property' }});
      });
    });
  });


  describe('prescription', () => {
    describe('getAllForClinic', () => {
      it('should call tidepool.getPrescriptionsForClinic with the appropriate args', () => {
        const cb = sinon.stub();
        api.prescription.getAllForClinic('clinicId', { foo: 'bar' } ,cb);
        sinon.assert.calledWith(tidepool.getPrescriptionsForClinic, 'clinicId', { foo: 'bar' }, cb);
      });
    });

    describe('create', () => {
      it('should call tidepool.createPrescription with the appropriate args', () => {
        const cb = sinon.stub();
        api.prescription.create({ foo: 'bar' }, cb);
        sinon.assert.calledWith(tidepool.createPrescription, { foo: 'bar' }, cb);
      });
    });

    describe('createRevision', () => {
      it('should call tidepool.createPrescriptionRevision with the appropriate args', () => {
        const cb = sinon.stub();
        api.prescription.createRevision({ foo: 'bar' }, 'id', cb);
        sinon.assert.calledWith(tidepool.createPrescriptionRevision, { foo: 'bar' }, 'id', cb);
      });
    });

    describe('delete', () => {
      it('should call tidepool.deletePrescription with the appropriate args', () => {
        const cb = sinon.stub();
        api.prescription.delete('id', cb);
        sinon.assert.calledWith(tidepool.deletePrescription, 'id', cb);
      });
    });
  });

  describe('clinics', () => {
    describe('getAll', () => {
      it('should call tidepool.getClinics with the appropriate args', () => {
        const cb = sinon.stub();
        api.clinics.getAll({clinicId: 'clinicId'}, cb);
        sinon.assert.calledWith(tidepool.getClinics, {clinicId: 'clinicId'}, cb);
      });
    });
    describe('create', () => {
      it('should call tidepool.createClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinic = {clinic:'clinic'};
        api.clinics.create(clinic, cb);
        sinon.assert.calledWith(tidepool.createClinic, clinic, cb);
      });
    });
    describe('get', () => {
      it('should call tidepool.getClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        api.clinics.get(clinicId, cb);
        sinon.assert.calledWith(tidepool.getClinic, clinicId, cb);
      });
    });
    describe('update', () => {
      it('should call tidepool.updateClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const updates = {new:'update'};
        api.clinics.update(clinicId, updates, cb);
        sinon.assert.calledWith(tidepool.updateClinic, clinicId, updates, cb);
      });
    });
    describe('getCliniciansFromClinic', () => {
      it('should call tidepool.getCliniciansFromClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const options = {};
        api.clinics.getCliniciansFromClinic(clinicId, options, cb);
        sinon.assert.calledWith(tidepool.getCliniciansFromClinic, clinicId, options, cb);
      });
    });
    describe('getClinician', () => {
      it('should call tidepool.getClinician with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const clinicianId = 'clinicianId';
        api.clinics.getClinician(clinicId, clinicianId, cb);
        sinon.assert.calledWith(tidepool.getClinician, clinicId, clinicianId, cb);
      });
    });
    describe('updateClinician', () => {
      it('should call tidepool.updateClinician with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const clinicianId = 'clinicianId';
        const updates = {new: 'update'};
        api.clinics.updateClinician(clinicId, clinicianId, updates, cb);
        sinon.assert.calledWith(tidepool.updateClinician, clinicId, clinicianId, updates, cb);
      });
    });
    describe('deleteClinicianFromClinic', () => {
      it('should call tidepool.deleteClinicianFromClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const clinicianId = 'clinicianId';
        api.clinics.deleteClinicianFromClinic(clinicId, clinicianId, cb);
        sinon.assert.calledWith(tidepool.deleteClinicianFromClinic, clinicId, clinicianId, cb);
      });
    });
    describe('getPatientsForClinic', () => {
      it('should call tidepool.getPatientsForClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        api.clinics.getPatientsForClinic(clinicId, cb);
        sinon.assert.calledWith(tidepool.getPatientsForClinic, clinicId, cb);
      });
    });
    describe('getPatientFromClinic', () => {
      it('should call tidepool.getPatientFromClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const patientId = 'patientId';
        api.clinics.getPatientFromClinic(clinicId, patientId, cb);
        sinon.assert.calledWith(tidepool.getPatientFromClinic, clinicId, patientId, cb);
      });
    });
    describe('createClinicCustodialAccount', () => {
      it('should call tidepool.createClinicCustodialAccount with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const patient = { new: 'patient' };
        api.clinics.createClinicCustodialAccount(clinicId, patient, cb);
        sinon.assert.calledWith(tidepool.createClinicCustodialAccount, clinicId, patient, cb);
      });
    });
    describe('updateClinicPatient', () => {
      it('should call tidepool.updateClinicPatient with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const patientId = 'patientId';
        const updates = {new:'update'};
        api.clinics.updateClinicPatient(clinicId, patientId, updates, cb);
        sinon.assert.calledWith(tidepool.updateClinicPatient, clinicId, patientId, updates, cb);
      });
    });
    describe('inviteClinician', () => {
      it('should call tidepool.inviteClinician with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const clinician = 'clinician';
        api.clinics.inviteClinician(clinicId, clinician, cb);
        sinon.assert.calledWith(tidepool.inviteClinician, clinicId, clinician, cb);
      });
    });
    describe('getClinicianInvite', () => {
      it('should call tidepool.getClinicianInvite with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const inviteId = 'inviteId';
        api.clinics.getClinicianInvite(clinicId, inviteId, cb);
        sinon.assert.calledWith(tidepool.getClinicianInvite, clinicId, inviteId, cb);
      });
    });
    describe('resendClinicianInvite', () => {
      it('should call tidepool.resendClinicianInvite with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const inviteId = 'inviteId';
        api.clinics.resendClinicianInvite(clinicId, inviteId, cb);
        sinon.assert.calledWith(tidepool.resendClinicianInvite, clinicId, inviteId, cb);
      });
    });
    describe('deleteClinicianInvite', () => {
      it('should call tidepool.deleteClinicianInvite with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const inviteId = 'inviteId';
        api.clinics.deleteClinicianInvite(clinicId, inviteId, cb);
        sinon.assert.calledWith(tidepool.deleteClinicianInvite, clinicId, inviteId, cb);
      });
    });
    describe('getPatientInvites', () => {
      it('should call tidepool.getPatientInvites with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        api.clinics.getPatientInvites(clinicId, cb);
        sinon.assert.calledWith(tidepool.getPatientInvites, clinicId, cb);
      });
    });
    describe('acceptPatientInvitation', () => {
      it('should call tidepool.acceptPatientInvitation with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const inviteId = 'inviteId';
        api.clinics.acceptPatientInvitation(clinicId, inviteId, cb);
        sinon.assert.calledWith(tidepool.acceptPatientInvitation, clinicId, inviteId, cb);
      });
    });
    describe('updatePatientPermissions', () => {
      it('should call tidepool.updatePatientPermissions with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const patientId = 'patientId';
        const permissions = {view:{}};
        api.clinics.updatePatientPermissions(clinicId, patientId, permissions, cb);
        sinon.assert.calledWith(tidepool.updatePatientPermissions, clinicId, patientId, permissions, cb);
      });
    });
    describe('getClinicsForPatient', () => {
      it('should call tidepool.getClinicsForPatient with the appropriate args', () => {
        const cb = sinon.stub();
        const userId = 'userId';
        const options = {};
        api.clinics.getClinicsForPatient(userId, options, cb);
        sinon.assert.calledWith(tidepool.getClinicsForPatient, userId, options, cb);
      });
    });
    describe('getClinicianInvites', () => {
      it('should call tidepool.getClinicianInvites with the appropriate args', () => {
        const cb = sinon.stub();
        const userId = 'userId';
        api.clinics.getClinicianInvites(userId, cb);
        sinon.assert.calledWith(tidepool.getClinicianInvites, userId, cb);
      });
    });
    describe('acceptClinicianInvite', () => {
      it('should call tidepool.acceptClinicianInvite with the appropriate args', () => {
        const cb = sinon.stub();
        const userId = 'userId';
        const inviteId = 'inviteId'
        api.clinics.acceptClinicianInvite(userId, inviteId, cb);
        sinon.assert.calledWith(tidepool.acceptClinicianInvite, userId, inviteId, cb);
      });
    });
    describe('dismissClinicianInvite', () => {
      it('should call tidepool.dismissClinicianInvite with the appropriate args', () => {
        const cb = sinon.stub();
        const userId = 'userId';
        const inviteId = 'inviteId'
        api.clinics.dismissClinicianInvite(userId, inviteId, cb);
        sinon.assert.calledWith(tidepool.dismissClinicianInvite, userId, inviteId, cb);
      });
    });
    describe('getClinicsForClinician', () => {
      it('should call tidepool.getClinicsForClinician with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicianId = 'clinicianId';
        const options = {};
        api.clinics.getClinicsForClinician(clinicianId, options, cb);
        sinon.assert.calledWith(tidepool.getClinicsForClinician, clinicianId, options, cb);
      });
    });
    describe('inviteClinic', () => {
      it('should call tidepool.inviteClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const shareCode = 'shareCode';
        const permissions = { view: {}, upload: {} };
        const patientId = 'patientId';
        api.clinics.inviteClinic(shareCode, permissions, patientId, cb);
        sinon.assert.calledWith(tidepool.inviteClinic, shareCode, permissions, patientId, cb);
      });
    });
    describe('invitation.resend', () => {
      it('should call tidepool.resendInvite with the appropriate args', () => {
        const cb = sinon.stub();
        const inviteId = 'inviteId';
        api.invitation.resend(inviteId, cb);
        sinon.assert.calledWith(tidepool.resendInvite, inviteId, cb);
      });
    });
    describe('clinics.deletePatientFromClinic', () => {
      it('should call tidepool.deletePatientFromClinic with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const patientId = 'patientId';
        api.clinics.deletePatientFromClinic(clinicId, patientId, cb);
        sinon.assert.calledWith(tidepool.deletePatientFromClinic, clinicId, patientId, cb);
      });
    });
    describe('clinics.deletePatientInvitation', () => {
      it('should call tidepool.deletePatientInvitation with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId';
        const inviteId = 'inviteId';
        api.clinics.deletePatientInvitation(clinicId, inviteId, cb);
        sinon.assert.calledWith(tidepool.deletePatientInvitation, clinicId, inviteId, cb);
      });
    });
    describe('clinics.getClinicByShareCode', () => {
      it('should call tidepool.getClinicByShareCode with the appropriate args', () => {
        const cb = sinon.stub();
        const shareCode = 'shareCode';
        api.clinics.getClinicByShareCode(shareCode, cb);
        sinon.assert.calledWith(tidepool.getClinicByShareCode, shareCode, cb);
      });
    });
    describe('clinics.triggerInitialClinicMigration', () => {
      it('should call tidepool.triggerInitialClinicMigration with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        api.clinics.triggerInitialClinicMigration(clinicId, cb);
        sinon.assert.calledWith(tidepool.triggerInitialClinicMigration, clinicId, cb);
      });
    });
    describe('clinics.sendPatientUploadReminder', () => {
      it('should call tidepool.sendPatientUploadReminder with the appropriate args', () => {
        const cb = sinon.stub();
        const patientId = 'patientId123';
        const clinicId = 'clinicId123';
        api.clinics.sendPatientUploadReminder(clinicId, patientId, cb);
        sinon.assert.calledWith(tidepool.sendPatientUploadReminder, clinicId, patientId, cb);
      });
    });
    describe('clinics.sendPatientDexcomConnectRequest', () => {
      it('should call tidepool.sendPatientDexcomConnectRequest with the appropriate args', () => {
        const cb = sinon.stub();
        const patientId = 'patientId123';
        const clinicId = 'clinicId123';
        api.clinics.sendPatientDexcomConnectRequest(clinicId, patientId, cb);
        sinon.assert.calledWith(tidepool.sendPatientDexcomConnectRequest, clinicId, patientId, cb);
      });
    });
    describe('clinics.createClinicPatientTag', () => {
      it('should call tidepool.createClinicPatientTag with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        const patientTag = { name: 'patientTag123' };
        api.clinics.createClinicPatientTag(clinicId, patientTag, cb);
        sinon.assert.calledWith(tidepool.createClinicPatientTag, clinicId, patientTag, cb);
      });
    });
    describe('clinics.updateClinicPatientTag', () => {
      it('should call tidepool.updateClinicPatientTag with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        const patientTagId = 'patientTagId123';
        const patientTag = { name: 'patientTag123' };
        api.clinics.updateClinicPatientTag(clinicId, patientTagId, patientTag, cb);
        sinon.assert.calledWith(tidepool.updateClinicPatientTag, clinicId, patientTagId, patientTag, cb);
      });
    });
    describe('clinics.deleteClinicPatientTag', () => {
      it('should call tidepool.deleteClinicPatientTag with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        const patientTagId = 'patientTagId123';
        api.clinics.deleteClinicPatientTag(clinicId, patientTagId, cb);
        sinon.assert.calledWith(tidepool.deleteClinicPatientTag, clinicId, patientTagId, cb);
      });
    });
    describe('clinics.getPatientsForTideDashboard', () => {
      it('should call tidepool.getPatientsForTideDashboard with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        const options = 'options123';
        api.clinics.getPatientsForTideDashboard(clinicId, options, cb);
        sinon.assert.calledWith(tidepool.getPatientsForTideDashboard, clinicId, options, cb);
      });
    });
    describe('clinics.getPatientsForRpmReport', () => {
      it('should call tidepool.getPatientsForRpmReport with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        const options = 'options123';
        api.clinics.getPatientsForRpmReport(clinicId, options, cb);
        sinon.assert.calledWith(tidepool.getPatientsForRpmReport, clinicId, options, cb);
      });
    });
    describe('clinics.getClinicPatientCount', () => {
      it('should call tidepool.getClinicPatientCount with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        api.clinics.getClinicPatientCount(clinicId, cb);
        sinon.assert.calledWith(tidepool.getClinicPatientCount, clinicId, cb);
      });
    });
    describe('clinics.getClinicPatientCountSettings', () => {
      it('should call tidepool.getClinicPatientCountSettings with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        api.clinics.getClinicPatientCountSettings(clinicId, cb);
        sinon.assert.calledWith(tidepool.getClinicPatientCountSettings, clinicId, cb);
      });
    });
    describe('clinics.setClinicPatientLastReviewed', () => {
      it('should call tidepool.setClinicPatientLastReviewed with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        api.clinics.setClinicPatientLastReviewed(clinicId, cb);
        sinon.assert.calledWith(tidepool.setClinicPatientLastReviewed, clinicId, cb);
      });
    });
    describe('clinics.revertClinicPatientLastReviewed', () => {
      it('should call tidepool.revertClinicPatientLastReviewed with the appropriate args', () => {
        const cb = sinon.stub();
        const clinicId = 'clinicId123';
        api.clinics.revertClinicPatientLastReviewed(clinicId, cb);
        sinon.assert.calledWith(tidepool.revertClinicPatientLastReviewed, clinicId, cb);
      });
    });
  });
});
