/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';

import utils from '../../app/core/utils';

import {
  requireAuth,
  requireAuthAndNoPatient,
  requireNoAuth,
  requireNotVerified,
  onUploaderPasswordReset,
  ensureNoAuth,
  requireSupportedBrowser,
} from '../../app/routes';

import config from '../../app/config';

var expect = chai.expect;

function routeAction(path, routeState) {
  return {
    type: '@@router/CALL_HISTORY_METHOD',
    payload: { args: [].slice.call(arguments), method: 'push' },
  };
}

describe('routes', () => {
  const mockStore = configureStore([thunk]);

  const defaultWorkingState = {
    inProgress: false,
    completed: null,
    notification: null,
  };

  const completedWorkingState = {
    inProgress: false,
    completed: true,
    notification: null,
  };

  let dispatch = sinon.stub().callsFake((arg) => {
    if (_.isFunction(arg)) {
      arg(dispatch);
    }
  });

  let cb = sinon.stub();

  beforeEach(() => {
    dispatch.resetHistory();
    cb.resetHistory();
  });

  describe('requireSupportedBrowser', () => {
    let next = sinon.stub().returns( (dispatch) => {} );

    afterEach(()=>{
      next.resetHistory();
    });

    it('should not redirect and call cb when isSupportedBrowser is true', () => {
      sinon.stub(utils, 'isSupportedBrowser');
      utils.isSupportedBrowser.returns(true);

      let args = { additional: 'args' };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [];

      store.dispatch(requireSupportedBrowser(next, {...args}));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(utils.isSupportedBrowser.callCount).to.equal(1);
      expect(next.callCount).to.equal(1);
      expect(next.calledWith({ ...args })).to.be.true;
      utils.isSupportedBrowser.restore();
    });

    it('should redirect and not call cb when isSupportedBrowser is false', () => {
      sinon.stub(utils, 'isSupportedBrowser');
      utils.isSupportedBrowser.returns(false);

      let args = { additional: 'args' };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [routeAction('/browser-warning')];

      store.dispatch(requireSupportedBrowser(cb, {...args}));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(utils.isSupportedBrowser.callCount).to.equal(1);
      expect(next.callCount).to.equal(0);
      utils.isSupportedBrowser.restore();
    });
  });

  describe('requireAuth', () => {
    beforeEach(() => {
      dispatch.resetHistory();
      cb.resetHistory();
    });

    it('should update route to /login if user is not authenticated', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false),
          get: sinon.stub(),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [routeAction('/login')];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should update route to /login with dest if user is not authenticated and destination available', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false),
          get: sinon.stub(),
        },
      };

      let store = mockStore({
        blip: {},
        router: { location: { pathname: '/otherDestination', hash: '#bar', search: '?param=foo' } },
      });

      let expectedActions = [routeAction('/login?dest=%2FotherDestination%3Fparam%3Dfoo%23bar')];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should not update route if user is authenticated and has accepted the latest terms', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
        },
        termsAccepted: '2015-01-01T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
      };

      let store = mockStore({
        blip: {
          working: {
            triggeringInitialClinicMigration: defaultWorkingState,
            fetchingClinicsForClinician: completedWorkingState,
          },
        },
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('[ditto &] should use state from the store instead of calling the API when available', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: sinon.stub(),
        },
      };

      let store = mockStore({
        blip: {
          allUsersMap: {
            a1b2c3: {
              userid: 'a1b2c3',
              emailVerified: true,
              profile: {
                patient: {},
              },
              termsAccepted: '2015-01-01T00:00:00-08:00',
            },
          },
          loggedInUserId: 'a1b2c3',
          working: {
            triggeringInitialClinicMigration: defaultWorkingState,
            fetchingClinicsForClinician: completedWorkingState,
          },
        },
      });

      let expectedActions = [];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(api.user.get.callCount).to.equal(0);
    });

    it('should update route to /terms if user is authenticated and has not ever accepted the terms', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
        },
        termsAccepted: '',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
      };

      let store = mockStore({
        blip: {
          working: {
            triggeringInitialClinicMigration: defaultWorkingState,
            fetchingClinicsForClinician: completedWorkingState,
          },
        },
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        routeAction('/terms'),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should update route to /terms if user is authenticated and has not accepted the latest terms', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
        },
        termsAccepted: '2013-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
      };

      let store = mockStore({
        blip: {
          working: {
            triggeringInitialClinicMigration: defaultWorkingState,
            fetchingClinicsForClinician: completedWorkingState,
          },
        },
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        routeAction('/terms'),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should fetch clinics for the user if they have not already been fetched', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
        },
        termsAccepted: '2019-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, null, []),
          getClinicianInvites: sinon.stub().callsArgWith(1, null, []),
        },
      };

      let store = mockStore({
        blip: { working: {
          fetchingClinicsForClinician: {
            inProgress: false,
            completed: false,
            inProgress: null,
          }
        }},
        router: { location: { pathname: 'foo-path' } } ,
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
        { type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS', payload: { clinicianId: 'a1b2c3', clinics: [] } },
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        { type: 'FETCH_CLINICIAN_INVITES_SUCCESS', payload: { invites: [] } },
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should redirect user to /patients if clinic status cannot be determined due to backend error', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
          clinic: {},
        },
        roles: ['clinic'],
        termsAccepted: '2019-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, { status: 500, body: 'Error!' }),
          getClinicianInvites: sinon.stub().callsArgWith(1, null, []),
        },
      };

      let store = mockStore({
        blip: {
          working: {
            fetchingClinicsForClinician: {
              inProgress: false,
              completed: false,
              inProgress: null,
            }
          },
          clinicFlowActive: true,
        },
        router: { location: { pathname: '/workspaces' } } ,
      });

      let err = new Error('Something went wrong while getting clinics for clinician.');
      err.status = 500;

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
        {
          type: 'GET_CLINICS_FOR_CLINICIAN_FAILURE',
          error: err,
          meta: {
            apiError: { status: 500, body: 'Error!' },
          },
        },
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        { type: 'FETCH_CLINICIAN_INVITES_SUCCESS', payload: { invites: [] } },
        routeAction('/patients'),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();

      expect(actions[3].error).to.deep.include({ message: 'Something went wrong while getting clinics for clinician.' });
      expectedActions[3].error = actions[3].error;

      expect(actions).to.eql(expectedActions);
    });

    it('should redirect the user to `/clinic-details/migrate` if the first returned clinic is empty', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
          clinic: {},
        },
        roles: ['clinic'],
        termsAccepted: '2019-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, null, [{ clinic: { id: 'newClinic' } }]),
          getClinicianInvites: sinon.stub().callsArgWith(1, null, []),
          getEHRSettings: sinon.stub().callsArgWith(1, null, {}),
          getMRNSettings: sinon.stub().callsArgWith(1, null, {}),
        },
      };

      let store = mockStore({
        blip: {
          working: {
            fetchingClinicsForClinician: {
              inProgress: false,
              completed: false,
              inProgress: null,
            }
          },
          clinicFlowActive: true,
        },
        router: { location: { pathname: 'foo-path' } } ,
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
        { type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS', payload: {
          clinicianId: 'a1b2c3',
          clinics: [{ clinic: { id: 'newClinic' } }],
        } },
        { type: 'FETCH_CLINIC_EHR_SETTINGS_REQUEST' },
        { type: 'FETCH_CLINIC_EHR_SETTINGS_SUCCESS', payload: { clinicId: 'newClinic', settings: {} } },
        { type: 'FETCH_CLINIC_MRN_SETTINGS_REQUEST' },
        { type: 'FETCH_CLINIC_MRN_SETTINGS_SUCCESS', payload: { clinicId: 'newClinic', settings: {} } },
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        { type: 'FETCH_CLINICIAN_INVITES_SUCCESS', payload: { invites: [] } },
        { type: 'SELECT_CLINIC', payload: { clinicId: 'newClinic' } },
        routeAction('/clinic-details/migrate', { selectedClinicId: null }),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should redirect the user to `/clinic-details/migrate` if the first returned clinic ready to migrate', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
          clinic: {},
        },
        roles: ['clinic'],
        termsAccepted: '2019-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, null, [{ clinic: { id: 'newClinic', name: 'Clinic ABC', canMigrate: true } }]),
          getClinicianInvites: sinon.stub().callsArgWith(1, null, []),
          getEHRSettings: sinon.stub().callsArgWith(1, null, {}),
          getMRNSettings: sinon.stub().callsArgWith(1, null, {}),
        },
      };

      let store = mockStore({
        blip: {
          working: {
            fetchingClinicsForClinician: {
              inProgress: false,
              completed: false,
              inProgress: null,
            }
          },
          clinicFlowActive: true,
        },
        router: { location: { pathname: 'foo-path' } } ,
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
        { type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS', payload: {
          clinicianId: 'a1b2c3',
          clinics: [{ clinic: { id: 'newClinic', name: 'Clinic ABC', canMigrate: true } }],
        } },
        { type: 'FETCH_CLINIC_EHR_SETTINGS_REQUEST' },
        { type: 'FETCH_CLINIC_EHR_SETTINGS_SUCCESS', payload: { clinicId: 'newClinic', settings: {} } },
        { type: 'FETCH_CLINIC_MRN_SETTINGS_REQUEST' },
        { type: 'FETCH_CLINIC_MRN_SETTINGS_SUCCESS', payload: { clinicId: 'newClinic', settings: {} } },
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        { type: 'FETCH_CLINICIAN_INVITES_SUCCESS', payload: { invites: [] } },
        { type: 'SELECT_CLINIC', payload: { clinicId: 'newClinic' } },
        routeAction('/clinic-details/migrate', { selectedClinicId: null }),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should redirect the user to `/clinic-details/profile` if the user has a clinic invite and no clinic profile', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
        },
        roles: ['clinic'],
        termsAccepted: '2019-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, null, []),
          getClinicianInvites: sinon.stub().callsArgWith(1, null, [{ id: 'inviteId' }]),
        },
      };

      let store = mockStore({
        blip: {
          working: {
            fetchingClinicsForClinician: {
              inProgress: false,
              completed: false,
              inProgress: null,
            }
          },
          clinicFlowActive: true,
        },
        router: { location: { pathname: 'foo-path' } } ,
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
        { type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS', payload: { clinicianId: 'a1b2c3', clinics: [] } },
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        { type: 'FETCH_CLINICIAN_INVITES_SUCCESS', payload: { invites: [{ id: 'inviteId' }] } },
        routeAction('/clinic-details/profile', { selectedClinicId: null }),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should redirect the user to `/workspaces` if the user has a clinic invite and has a clinic profile', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
          clinic: {},
        },
        roles: ['clinic'],
        termsAccepted: '2019-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, null, []),
          getClinicianInvites: sinon.stub().callsArgWith(1, null, [{ id: 'inviteId' }]),
        },
      };

      let store = mockStore({
        blip: {
          working: {
            fetchingClinicsForClinician: {
              inProgress: false,
              completed: false,
              inProgress: null,
            }
          },
          clinicFlowActive: true,
        },
        router: { location: { pathname: 'foo-path' } } ,
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
        { type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS', payload: { clinicianId: 'a1b2c3', clinics: [] } },
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        { type: 'FETCH_CLINICIAN_INVITES_SUCCESS', payload: { invites: [{ id: 'inviteId' }] } },
        routeAction('/workspaces'),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should redirect a non-clinic member user to `/patients` if they are on a Clinic UI route', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        profile: {
          patient: {},
        },
        termsAccepted: '2019-12-30T00:00:00-08:00',
      };
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
          get: (cb) => {
            cb(null, user);
          },
        },
        clinics: {
          getClinicsForClinician: sinon.stub().callsArgWith(2, null, []),
          getClinicianInvites: sinon.stub().callsArgWith(1, null, []),
        },
      };

      let store = mockStore({
        blip: {
          working: {
            fetchingClinicsForClinician: {
              inProgress: false,
              completed: false,
              inProgress: null,
            }
          },
          clinicFlowActive: false,
        },
        router: { location: { pathname: '/clinic-workspace/patients' } } ,
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        { type: 'GET_CLINICS_FOR_CLINICIAN_REQUEST' },
        { type: 'GET_CLINICS_FOR_CLINICIAN_SUCCESS', payload: {
          clinicianId: 'a1b2c3',
          clinics: [],
        } },
        { type: 'FETCH_CLINICIAN_INVITES_REQUEST' },
        { type: 'FETCH_CLINICIAN_INVITES_SUCCESS', payload: { invites: [] } },
        routeAction('/patients'),
      ];

      store.dispatch(requireAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    describe('clinic information already fetched', () => {
      it('should redirect user to `/patients` if trying to access clinic pages as non-clinician', () => {
        config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
        let api = {
          user: {
            isAuthenticated: sinon.stub().returns(true),
            get: sinon.stub(),
          },
        };

        let store = mockStore({
          blip: {
            loggedInUserId: 'user123',
            allUsersMap: {
              user123: {
                profile: {},
                termsAccepted: '2015-01-01T00:00:00-08:00',
              },
            },
            working: {
              fetchingClinicsForClinician: {
                inProgress: false,
                completed: true,
                notification: false,
              },
              triggeringInitialClinicMigration: {
                completed: null,
              },
            },
          },
          router: { location: { pathname: '/workspaces' } },
        });

        let expectedActions = [routeAction('/patients')];

        store.dispatch(requireAuth(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
      });

      it('should redirect user to `/workspaces` if clinic-specific page with no selected clinic', () => {
        config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
        let api = {
          user: {
            isAuthenticated: sinon.stub().returns(true),
            get: sinon.stub(),
          },
        };

        let store = mockStore({
          blip: {
            loggedInUserId: 'user123',
            allUsersMap: {
              user123: {
                profile: {},
                termsAccepted: '2015-01-01T00:00:00-08:00',
                isClinicMember: true,
              },
            },
            working: {
              fetchingClinicsForClinician: {
                inProgress: false,
                completed: true,
                notification: false,
              },
              triggeringInitialClinicMigration: {
                completed: null,
              },
            },
          },
          router: { location: { pathname: '/clinic-admin' } },
        });

        let expectedActions = [routeAction('/workspaces')];

        store.dispatch(requireAuth(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
      });
    });
  });

  describe('requireAuthAndNoPatient', () => {
    it('should update the route to /login if the user is not authenticated', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [routeAction('/login')];

      store.dispatch(requireAuthAndNoPatient(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should update the route to /patients if the user is authenticated and already has accepted TOS and has data storage set up', () => {
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        termsAccepted: '2016-01-01T05:00:00-08:00',
        profile: {
          patient: {},
        },
      };
      let api = {
        user: {
          get: (cb) => {
            cb(null, user);
          },
          isAuthenticated: sinon.stub().returns(true),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        routeAction('/patients'),
      ];

      store.dispatch(requireAuthAndNoPatient(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('[ditto &] should use state from the store instead of calling the API when available', () => {
      let api = {
        user: {
          get: sinon.stub(),
          isAuthenticated: sinon.stub().returns(true),
        },
      };

      let store = mockStore({
        blip: {
          allUsersMap: {
            a1b2c3: {
              userid: 'a1b2c3',
              emailVerified: true,
              termsAccepted: '2016-01-01T05:00:00-08:00',
              profile: {
                patient: {},
              },
            },
          },
          loggedInUserId: 'a1b2c3',
        },
      });

      let expectedActions = [routeAction('/patients')];

      store.dispatch(requireAuthAndNoPatient(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should update the route to /terms if the user has not yet accepted the TOS', () => {
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        termsAccepted: '',
      };
      let api = {
        user: {
          get: (cb) => {
            cb(null, user);
          },
          isAuthenticated: sinon.stub().returns(true),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        routeAction('/terms'),
      ];

      store.dispatch(requireAuthAndNoPatient(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should update the route to /terms if the user has not yet accepted the TOS', () => {
      let api = {
        user: {
          get: sinon.stub(),
          isAuthenticated: sinon.stub().returns(true),
        },
      };

      let store = mockStore({
        blip: {
          allUsersMap: {
            a1b2c3: {
              userid: 'a1b2c3',
              emailVerified: true,
              termsAccepted: '',
            },
          },
          loggedInUserId: 'a1b2c3',
        },
      });

      let expectedActions = [routeAction('/terms')];

      store.dispatch(requireAuthAndNoPatient(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should not update the route if the user is authenticated and does not have data storage set up', () => {
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        termsAccepted: '2016-01-01T05:00:00-08:00',
        profile: {
          about: 'Foo bar',
        },
      };
      let api = {
        user: {
          get: (cb) => {
            cb(null, user);
          },
          isAuthenticated: sinon.stub().returns(true),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
      ];

      store.dispatch(requireAuthAndNoPatient(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('[ditto &] should use state from the store instead of calling the API when available', () => {
      let api = {
        user: {
          get: sinon.stub(),
          isAuthenticated: sinon.stub().returns(true),
        },
      };

      let store = mockStore({
        blip: {
          allUsersMap: {
            a1b2c3: {
              userid: 'a1b2c3',
              emailVerified: true,
              termsAccepted: '2016-01-01T05:00:00-08:00',
              profile: {
                about: 'Foo bar',
              },
            },
          },
          loggedInUserId: 'a1b2c3',
        },
      });

      let expectedActions = [];

      store.dispatch(requireAuthAndNoPatient(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });
  });

  describe('ensureNoAuth', () => {
    it('should call api.user.logout', () => {
      let api = {
        user: {
          logout: sinon.stub().callsArg(0),
        },
      };

      let cb = sinon.stub();

      ensureNoAuth(api, cb)();

      expect(api.user.logout.callCount).to.equal(1);
      expect(cb.callCount).to.equal(1);
    });
  });

  describe('requireNoAuth', () => {
    context('user is authenticated', () => {
      context('clinic flow is active', () => {
        it('should update route to /workspaces if user is not on a clinic/clinician details page', () => {
          let api = {
            user: {
              isAuthenticated: sinon.stub().returns(true),
            },
          };

          let store = mockStore({
            blip: { clinicFlowActive: true },
          });

          let expectedActions = [routeAction('/workspaces')];

          store.dispatch(requireNoAuth(api));

          const actions = store.getActions();
          expect(actions).to.eql(expectedActions);
        });

        it('should update route to /clinic-details if user needs to fill in clinic details', () => {
          let api = {
            user: {
              isAuthenticated: sinon.stub().returns(true),
            },
          };

          let store = mockStore({
            blip: {
              allUsersMap: {
                clinician123: { isClinicMember: true },
              },
              clinicFlowActive: true,
              clinics: {
                clinic123: { id: 'clinic123', name: undefined },
              },
              loggedInUserId: 'clinician123',
            },
          });

          let expectedActions = [
            { type: 'SELECT_CLINIC', payload: { clinicId: 'clinic123' } },
            routeAction('/clinic-details'),
          ];

          store.dispatch(requireNoAuth(api));

          const actions = store.getActions();
          expect(actions).to.eql(expectedActions);
        });
      });

      context('clinic flow is inactive', () => {
        it('should update route to /patients if user is not on a clinic/clinician details page', () => {
          let api = {
            user: {
              isAuthenticated: sinon.stub().returns(true),
            },
          };

          let store = mockStore({
            blip: { clinicFlowActive: false },
          });

          let expectedActions = [routeAction('/patients')];

          store.dispatch(requireNoAuth(api));

          const actions = store.getActions();
          expect(actions).to.eql(expectedActions);
        });

        it('should update route to /clinician-details if user needs to fill in their clinician profile', () => {
          let api = {
            user: {
              isAuthenticated: sinon.stub().returns(true),
            },
          };

          let store = mockStore({
            blip: {
              allUsersMap: {
                clinician123: { roles: ['clinic'], profile: { clinic: undefined } },
              },
              clinicFlowActive: false,
              loggedInUserId: 'clinician123',
            },
          });

          let expectedActions = [
            routeAction('/clinician-details'),
          ];

          store.dispatch(requireNoAuth(api));

          const actions = store.getActions();
          expect(actions).to.eql(expectedActions);
        });
      });
    });

    it('should not update route if user is not authenticated', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [];

      store.dispatch(requireNoAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should set sso enabled display if present in location', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false),
        },
      };

      let store = mockStore({
        blip: {},
        router: {
          location: {
            query: {
              ssoEnabled: 'true',
            },
          },
        },
      });

      let expectedActions = [
        {
          type: 'SET_SSO_ENABLED_DISPLAY',
          payload: {
            value: true,
          },
        },
      ];

      store.dispatch(requireNoAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });
  });

  describe('requireNotVerified', () => {
    it('should not update route if user is not logged in', () => {
      let api = {
        user: {
          get: (cb) => {
            cb({
              status: 401,
            });
          },
        },
        logout: sinon.stub(),
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        {
          type: 'FETCH_USER_FAILURE',
          meta: { apiError: { status: 401 } },
          error: null,
        },
      ];

      store.dispatch(requireNotVerified(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should update the route to /patients if user has already verified e-mail and accepted the most recent terms', () => {
      config.LATEST_TERMS = '2014-01-01T00:00:00-08:00';
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        termsAccepted: '2015-01-01T00:00:00-08:00',
      };
      let api = {
        user: {
          get: (cb) => {
            cb(null, user);
          },
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        routeAction('/patients'),
      ];

      store.dispatch(requireNotVerified(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('[ditto &] should use state from the store instead of calling the API when available', () => {
      let api = {
        user: {
          get: sinon.stub(),
        },
      };

      let store = mockStore({
        blip: {
          allUsersMap: {
            a1b2c3: {
              userid: 'a1b2c3',
              emailVerified: true,
              termsAccepted: '2015-01-01T00:00:00-08:00',
            },
          },
          loggedInUserId: 'a1b2c3',
        },
      });

      let expectedActions = [routeAction('/patients')];

      store.dispatch(requireNotVerified(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(api.user.get.callCount).to.equal(0);
    });

    it('should update route to /terms if user has already verified e-mail and has not accepted the terms', () => {
      let user = {
        userid: 'a1b2c3',
        emailVerified: true,
        termsAccepted: '',
      };
      let api = {
        user: {
          get: (cb) => {
            cb(null, user);
          },
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_SUCCESS', payload: { user } },
        routeAction('/terms'),
      ];

      store.dispatch(requireNotVerified(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('[ditto &] should use state from the store instead of calling the API when available', () => {
      let api = {
        user: {
          get: sinon.stub(),
        },
      };

      let store = mockStore({
        blip: {
          allUsersMap: {
            a1b2c3: {
              userid: 'a1b2c3',
              emailVerified: true,
              termsAccepted: '',
            },
          },
          loggedInUserId: 'a1b2c3',
        },
      });

      let expectedActions = [routeAction('/terms')];

      store.dispatch(requireNotVerified(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(api.user.get.callCount).to.equal(0);
    });

    it('should not update the route if user has not yet verified e-mail and should "logout" user', () => {
      let api = {
        log: () => {},
        user: {
          get: (cb) => {
            cb(null, {
              userid: 'a1b2c3',
              emailVerified: false,
            });
          },
          logout: sinon.stub().callsArg(0),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let err = new Error(
        'Looks like your e-mail address has not been verified.'
      );
      let expectedActions = [
        { type: 'FETCH_USER_REQUEST' },
        { type: 'FETCH_USER_FAILURE', meta: { apiError: null }, error: err },
      ];

      store.dispatch(requireNotVerified(api));

      const actions = store.getActions();
      actions[1].error = err; // Error object comparison is strict
      expect(actions).to.eql(expectedActions);
      expect(api.user.logout.callCount).to.equal(1);
    });

    it('[ditto &] should use state from the store instead of calling the API when available', () => {
      let api = {
        log: () => {},
        user: {
          get: sinon.stub(),
          logout: sinon.stub(),
        },
      };

      let store = mockStore({
        blip: {
          allUsersMap: {
            a1b2c3: {
              userid: 'a1b2c3',
              emailVerified: false,
            },
          },
          loggedInUserId: 'a1b2c3',
        },
      });

      let expectedActions = [];

      store.dispatch(requireNotVerified(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(api.user.get.callCount).to.equal(0);
      expect(api.user.logout.callCount).to.equal(1);
    });
  });

  describe('onUploaderPasswordReset', () => {
    it('should not update route if user is not logged in', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(false),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [];

      store.dispatch(requireNoAuth(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should update the route to /profile if the user is authenticated', () => {
      let api = {
        user: {
          isAuthenticated: sinon.stub().returns(true),
        },
      };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [routeAction('/profile')];

      store.dispatch(onUploaderPasswordReset(api));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });
  });
});
