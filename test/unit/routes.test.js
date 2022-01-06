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
  requireChrome,
  requireAuth,
  requireAuthAndNoPatient,
  requireNoAuth,
  requireNotVerified,
  onUploaderPasswordReset,
  ensureNoAuth,
} from '../../app/routes';

import config from '../../app/config';

var expect = chai.expect;

function routeAction(path) {
  return {
    type: '@@router/CALL_HISTORY_METHOD',
    payload: { args: [path], method: 'push' },
  };
}

describe('routes', () => {
  const mockStore = configureStore([thunk]);

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

  describe('requireChrome', () => {
    let next = sinon.stub().returns( (dispatch) => {} );

    afterEach(()=>{
      next.resetHistory();
    });

    it('should not redirect and call cb when isChrome is true', () => {
      sinon.stub(utils, 'isChrome');
      utils.isChrome.returns(true);

      let args = { additional: 'args' };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [];

      store.dispatch(requireChrome(next, {...args}));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(utils.isChrome.callCount).to.equal(1);
      expect(next.callCount).to.equal(1);
      expect(next.calledWith({ ...args })).to.be.true;
      utils.isChrome.restore();
    });

    it('should redirect and not call cb when isChrome is false', () => {
      sinon.stub(utils, 'isChrome');
      utils.isChrome.returns(false);

      let args = { additional: 'args' };

      let store = mockStore({
        blip: {},
      });

      let expectedActions = [routeAction('/browser-warning')];

      store.dispatch(requireChrome(cb, {...args}));

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
      expect(utils.isChrome.callCount).to.equal(1);
      expect(next.callCount).to.equal(0);
      utils.isChrome.restore();
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
        blip: {},
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
        blip: {},
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
        blip: {},
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
