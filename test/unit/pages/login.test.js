/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global afterEach */

import React from'react';
import mutationTracker from 'object-invariant-test-helper';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

jest.mock('../../../app/keycloak', () => ({
  keycloak: { login: jest.fn() },
}));

import Login, {
  Login as LoginFunction,
  mapStateToProps,
} from '../../../app/pages/login/login.js';
import { keycloak } from '../../../app/keycloak';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as ErrorMessages from '../../../app/redux/constants/errorMessages';

describe('Login', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(typeof LoginFunction).toBe('function');
  });

  describe('render', function() {
    var props = {
      acknowledgeNotification: sinon.stub(),
      confirmSignup: sinon.stub(),
      fetchers: [],
      isInvite: false,
      onSubmit: sinon.stub(),
      trackMetric: sinon.stub(),
      working: false,
      fetchingInfo: {
        inProgress: false,
        completed: true,
      },
      keycloakConfig: {},
      api: {
        user: {
          isAuthenticated: sinon.stub().returns(false),
          confirmSignUp: sinon.stub().callsArgWith(1, null),
        },
      },
      location: {},
      routerState: {
        location: {
          query: {},
        },
      },
    };

    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();

      render(<BrowserRouter><LoginFunction {...props} /></BrowserRouter>)
      expect(console.error.callCount).toBe(0);
    });

    describe('keycloak enabled', () => {
      const defaultWorkingState = {
        inProgress: false,
        completed: false,
        notification: null,
      };
      const storeState = {
        blip: {
          working: {
            loggingIn: defaultWorkingState,
            confirmingSignup: defaultWorkingState,
            fetchingInfo: {...defaultWorkingState, completed: true},
          },
          keycloakConfig: {
            url: 'someUrl',
            initialized: true,
          }
        },
      };
      const mockStore = configureStore([thunk]);
      const store = mockStore(storeState);

      let ConnectedLogin;
      let wrapper;

      beforeAll(() => {
        ConnectedLogin = Login;
        wrapper = render(
          <Provider store={store}>
            <BrowserRouter>
              <ConnectedLogin {...props} />
            </BrowserRouter>
          </Provider>
        );
      });

      afterEach(() => {
        keycloak.login.mockReset();
        store.clearActions();
      });

      it('should forward a user to keycloak login when initialized', () => {
        expect(keycloak.login).toHaveBeenCalledTimes(1);
        expect(keycloak.login).toHaveBeenCalledWith({ redirectUri: window.location.origin });
      });

      it('should include a destination if provided in router state', () => {
        let destStoreState = {
          ...storeState,
          router: {
            location: {
              query: {
                dest: '/a_destination'
              }
            }
          }
        };
        let destStore = mockStore(destStoreState);

        wrapper = render(
          <Provider store={destStore}>
            <BrowserRouter>
              <ConnectedLogin {...props} />
            </BrowserRouter>
          </Provider>
        );
        expect(keycloak.login).toHaveBeenCalledTimes(1);
        expect(keycloak.login).toHaveBeenCalledWith({
          redirectUri: `${window.location.origin}/a_destination`,
        });
      });

      describe('when error from declining TOS', () => {
        it('should forward to keycloak login', () => {
          let errorProps = {
            ...props,
            keycloakConfig: {
              error: 'access_denied',
            },
          };

          wrapper = render(
            <Provider store={store}>
              <BrowserRouter>
                <ConnectedLogin {...errorProps} />
              </BrowserRouter>
            </Provider>
          );

          expect(keycloak.login).toHaveBeenCalledTimes(1);
          expect(keycloak.login).toHaveBeenCalledWith({ redirectUri: window.location.origin });
        });
      });

      describe('when claiming an account', () => {
        it('should forward user to verification-with-password if signupEmail+signupKey present and 409 on confirm', () => {
          let claimProps = {
            ...props,
            api: {
              user: {
                isAuthenticated: sinon.stub().returns(false),
                confirmSignUp: sinon.stub().callsArgWith(1, {status: 409}),
              }
            },
            location: {
              query: {
                signupEmail: 'someEmail@example.com',
                signupKey: 'somerandomsignupkey',
              },
            },
          };
          let err = new Error(ErrorMessages.ERR_CONFIRMING_SIGNUP);
          err.status = 409;

          let expectedActions = [
            {
              type: 'CONFIRM_SIGNUP_REQUEST',
            },
            {
              type: 'CONFIRM_SIGNUP_FAILURE',
              error: err,
              meta: {
                apiError: {
                  status: 409,
                },
              },
              payload: {
                signupKey: 'somerandomsignupkey',
              },
            },
            {
              type: '@@router/CALL_HISTORY_METHOD',
              payload: {
                args: [
                  '/verification-with-password?signupKey=somerandomsignupkey&signupEmail=someEmail@example.com',
                ],
                method: 'push',
              },
            },
          ];

          wrapper = render(
            <Provider store={store}>
              <BrowserRouter>
                <ConnectedLogin {...claimProps} />
              </BrowserRouter>
            </Provider>
          );

          let actions = store.getActions();
          expect(actions[1].error).toMatchObject({
            message: ErrorMessages.ERR_CONFIRMING_SIGNUP,
          });
          expectedActions[1].error = actions[1].error;
          expect(actions).toEqual(expectedActions);
          expect(keycloak.login).not.toHaveBeenCalled();
          expect(claimProps.api.user.confirmSignUp.callCount).toBe(1);
        });

        it('should confirm signup if signupEmail+signupKey present and no error on confirm', () => {
          let claimProps = {
            ...props,
            location: {
              query: {
                signupEmail: 'someEmail@example.com',
                signupKey: 'somerandomsignupkey',
              },
            },
          };

          let expectedActions = [
            {
              type: 'CONFIRM_SIGNUP_REQUEST',
            },
            {
              type: 'CONFIRM_SIGNUP_SUCCESS',
            }
          ];

          wrapper = render(
            <Provider store={store}>
              <BrowserRouter>
                <ConnectedLogin {...claimProps} />
              </BrowserRouter>
            </Provider>
          );

          let actions = store.getActions();
          expect(actions).toEqual(expectedActions);
          expect(keycloak.login).not.toHaveBeenCalled();
          expect(claimProps.api.user.confirmSignUp.callCount).toBe(1);
        });
      });
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      keycloakConfig: {
        url: 'someUrl',
        initialized: false,
      },
      working: {
        confirmingSignup: {inProgress: false, notification: null},
        loggingIn: {inProgress: false, notification: {type: 'alert', message: 'Hi!'}}
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).toBe(false);
    });

    it('should be a function', () => {
      expect(typeof mapStateToProps).toBe('function');
    });

    it('should map working.loggingIn.inProgress to working', () => {
      expect(result.working).toEqual(state.working.loggingIn.inProgress);
    });

    it('should map working.loggingIn.notification to notification', () => {
      expect(result.notification).toEqual(state.working.loggingIn.notification);
    });

    it('should map keycloakConfig to keycloakConfig', () => {
      expect(result.keycloakConfig).toEqual(state.keycloakConfig);
    });

    it('should map working.confirmingSignup.notification to notification if working.loggingIn.notification is null', () => {
      const anotherState = {
        working: {
          loggingIn: {inProgress: false, notification: null},
          confirmingSignup: {inProgress: false, notification: {status: 500, body: 'Error :('}}
        }
      };
      const anotherRes = mapStateToProps({blip: anotherState});
      expect(anotherRes.notification).toEqual(anotherState.working.confirmingSignup.notification);
    });

    describe('when some state is `null`', () => {
      const state = {
        working: {
          confirmingSignup: {inProgress: false, notification: null},
          loggingIn: {inProgress: false, notification: null}
        }
      };

      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).toBe(false);
      });

      it('should map working.loggingIn.notification to notification', () => {
        expect(result.notification).toBeNull();
      });
    });
  });
});
