import _ from 'lodash';
import sinon from 'sinon';
import { expect } from 'chai';

import api from '../../../../app/core/api';

describe('api', () => {
  const currentUserId = 'a1b2c3';
  let tidepool;

  before(() => {
    tidepool = {
      findProfile: sinon.stub(),
      findConsents: sinon.stub().callsArgWith(1, null),
      getUserId: sinon.stub().returns(currentUserId),
      getCurrentUser: sinon.stub(),
      getAssociatedUsersDetails: sinon.stub(),
      addOrUpdateSettings: sinon.stub(),
      addOrUpdateProfile: sinon.stub(),
    };

    api.__Rewire__('tidepool', tidepool);
  });

  beforeEach(() => {
    tidepool.getUserId.resetHistory();
    tidepool.getCurrentUser.resetHistory();
    tidepool.getAssociatedUsersDetails.resetHistory();
    tidepool.findProfile.resetHistory();
    tidepool.findConsents.resetHistory();
    tidepool.addOrUpdateSettings.resetHistory();
    tidepool.addOrUpdateProfile.resetHistory();
  });

  after(() => {
    api.__ResetDependency__('tidepool');
  });

  describe('user', () => {
    describe('get', () => {
      /** @type {sinon.SinonStub} */
      let preferencesStub;
      /** @type {sinon.SinonStub} */
      let settingsStub;
      /** @type {sinon.SinonStub} */
      let consentsStub;

      before(() => {
        preferencesStub = sinon.stub(api.metadata.preferences, 'get');
        settingsStub = sinon.stub(api.metadata.settings, 'get');
        consentsStub = sinon.stub(api.metadata.consents, 'get');
      });

      beforeEach(() => {
        preferencesStub.resetHistory();
        settingsStub.resetHistory();
        consentsStub.resetHistory();
      });

      after(() => {
        preferencesStub.restore();
        settingsStub.restore();
        consentsStub.restore();
      });

      it('should fetch the current logged-in user account, preferences, profile, settings and consents', () => {
        const user = {
          userid: currentUserId,
        };
        const profile = {
          firstName: 'a',
          lastName: 'b',
          fullName: 'ab',
        };
        const preferences = {
          displayLanguageCode: 'en',
        };
        const consents = {
          yourLoopsData: {
            date: '2020-11-03T15:30:41.035Z',
            value: true,
          },
        };
        const settings = {
          country: 'FR',
        };
        tidepool.getCurrentUser.callsArgWith(0, null, _.cloneDeep(user));
        tidepool.findProfile.callsArgWith(1, null, profile);
        preferencesStub.callsArgWith(1, null, preferences);
        settingsStub.callsArgWith(1, null, settings);
        consentsStub.callsArgWith(1, null, consents);

        const cb = sinon.spy();
        api.user.get(cb);

        sinon.assert.calledOnce(tidepool.getCurrentUser);
        sinon.assert.calledOnce(tidepool.getUserId);

        sinon.assert.calledOnce(tidepool.findProfile);
        sinon.assert.calledWith(tidepool.findProfile, currentUserId);

        sinon.assert.calledOnce(preferencesStub);
        sinon.assert.calledWith(preferencesStub, currentUserId);

        sinon.assert.calledOnce(settingsStub);
        sinon.assert.calledWith(settingsStub, currentUserId);

        sinon.assert.calledOnce(consentsStub);
        sinon.assert.calledWith(consentsStub, currentUserId);

        expect(cb.calledOnce).to.be.true;
        const cbArgs = cb.getCall(0).args;
        const expectArgs = [null, {
          ...user,
          settings,
          profile,
          preferences,
          consents,
        }];
        expect(cbArgs, JSON.stringify({ cbArgs, expectArgs })).to.be.deep.equal(expectArgs);
      });

      it('should fetch the current logged-in user settings when a patient profile is returned', () => {
        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
        });
        tidepool.findProfile.callsArgWith(1, null, { patient: { fullName: 'Jenny Doe' } });
        preferencesStub.callsArgWith(1, null);
        settingsStub.callsArgWith(1, null);

        api.user.get(_.noop);
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
        const profile = {
          patient: {
            fullName: 'Jenny Doe'
          }
        };
        const preferences = {
          displayLanguageCode: 'en',
        };

        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
        });

        tidepool.findProfile.callsArgWith(1, null, profile);
        preferencesStub.callsArgWith(1, null, preferences);
        settingsStub.callsArgWith(1, null, { country: 'DE' });
        consentsStub.callsArgWith(1, null, {});

        const cb = sinon.stub();

        api.user.get(cb);
        sinon.assert.calledOnce(cb);
        const expectArgs = [null, {
          permissions: { root: {} },
          preferences,
          profile,
          settings: { country: 'DE' },
          userid: currentUserId,
        }];
        const cbArgs = cb.getCall(0).args;
        expect(cbArgs, JSON.stringify([expectArgs, cbArgs])).to.be.deep.equal(expectArgs);
      });

      it('should return a non-patient account object with merged preferences, profile and settings', () => {
        tidepool.getCurrentUser.callsArgWith(0, null, {
          userid: currentUserId,
        });

        tidepool.findProfile.callsArgWith(1, null, { fullName: 'Doctor Jay' });
        tidepool.addOrUpdateSettings.callsArgWith(2, null);

        preferencesStub.callsArgWith(1, null, undefined);
        settingsStub.callsArgWith(1, null, undefined);

        const cb = sinon.stub();
        api.user.get(cb);

        sinon.assert.calledOnce(tidepool.addOrUpdateSettings);
        sinon.assert.calledWith(tidepool.addOrUpdateSettings, currentUserId, { country: 'FR' });
        sinon.assert.calledOnce(cb);
        sinon.assert.calledWith(cb, null, {
          // preferences: {},
          profile: { fullName: 'Doctor Jay' },
          settings: { country: 'FR' },
          userid: currentUserId,
        });
      });
    });

    describe('getAssociatedAccounts', () => {
      it('should call `tidepool.getAssociatedUsersDetails` with the current userId', () => {
        api.user.getAssociatedAccounts(_.noop);
        sinon.assert.calledOnce(tidepool.getAssociatedUsersDetails);
        sinon.assert.calledWith(tidepool.getAssociatedUsersDetails, currentUserId);
      });

      it('should call back with an error if `tidepool.getAssociatedUsersDetails` fails', () => {
        tidepool.getAssociatedUsersDetails.callsArgWith(1, 'error');
        const cb = sinon.stub();
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
        settingsStub.restore();
      });

      it('should call `tidepool.findProfile` with the provided userId', () => {
        api.patient.get('12345', _.noop);
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
