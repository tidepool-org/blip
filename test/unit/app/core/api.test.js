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

  before(() => {
    tidepool = {
      findProfile: sinon.stub(),
      getUserId: sinon.stub().returns(currentUserId),
      getCurrentUser: sinon.stub(),
      getAssociatedUsersDetails: sinon.stub(),
      findProfile: sinon.stub(),
    };

    api.__Rewire__('tidepool', tidepool)
  });

  beforeEach(() => {
    tidepool.findProfile.resetHistory();
    tidepool.getUserId.resetHistory();
    tidepool.getCurrentUser.resetHistory();
    tidepool.getAssociatedUsersDetails.resetHistory();
    tidepool.findProfile.resetHistory();
  });

  after(() => {
    api.__ResetDependency__('tidepool');
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
  });
});
