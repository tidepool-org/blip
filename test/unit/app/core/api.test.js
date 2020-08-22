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
      findProfile: sinon.stub(),
      updateCustodialUser: sinon.stub(),
      addOrUpdateProfile: sinon.stub(),
      signupStart: sinon.stub(),
      login: sinon.stub().callsArgWith(2, null, { userid: currentUserId }),
      logout: sinon.stub().callsArgWith(0, null),
      destroySession: sinon.stub(),
      isLoggedIn: sinon.stub(),
      logAppError: sinon.stub(),
      getPrescriptions: sinon.stub(),
      createPrescription: sinon.stub(),
      createPrescriptionRevision: sinon.stub(),
      deletePrescription: sinon.stub(),
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
    tidepool.addOrUpdateProfile.resetHistory();
    tidepool.signupStart.resetHistory();
    tidepool.login.resetHistory();
    tidepool.logout.resetHistory();
    tidepool.destroySession.resetHistory();
    tidepool.isLoggedIn.resetHistory();
    tidepool.logAppError.resetHistory();
    tidepool.getPrescriptions.resetHistory();
    tidepool.createPrescription.resetHistory();
    tidepool.createPrescriptionRevision.resetHistory();
    tidepool.deletePrescription.resetHistory();

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
          { userid: '4', username: 'patient2@tidepool.org', trustorPermissions: { view: {} } },
          { userid: '5', username: 'careteam1@tidepool.org', trusteePermissions: { view: {}, upload: {} } },
          { userid: '6', username: 'missing_permissions@tidepool.org' },
        ];

        tidepool.getAssociatedUsersDetails.callsArgWith(1, null, accounts);
        const cb = sinon.stub()

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
            { userid: '5', username: 'careteam1@tidepool.org', permissions: { view: {}, upload: {} } },
          ],
        });
      });
    });

    describe('login', () => {
      it('should set the user config in Rollbar', () => {
        const cb = sinon.stub();
        const user = {
          username: 'user@account.com',
        }

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
    describe('getAll', () => {
      it('should call tidepool.getPrescriptions with the appropriate args', () => {
        const cb = sinon.stub();
        api.prescription.getAll(cb);
        sinon.assert.calledWith(tidepool.getPrescriptions, cb);
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
});
