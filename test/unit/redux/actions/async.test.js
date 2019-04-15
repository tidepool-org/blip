/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */
/* global context */

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import trackingMiddleware from '../../../../app/redux/utils/trackingMiddleware';
import moment from 'moment';
import _ from 'lodash';

import isTSA from 'tidepool-standard-action';

import initialState from '../../../../app/redux/reducers/initialState';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';
import * as UserMessages from '../../../../app/redux/constants/usrMessages';

import { TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL, MMOLL_UNITS } from '../../../../app/core/constants';

// need to require() async in order to rewire utils inside
const async = require('../../../../app/redux/actions/async');

describe('Actions', () => {
  const trackMetric = sinon.spy();
  const mockStore = configureStore([
    thunk,
    trackingMiddleware({ metrics: { track: trackMetric } })
  ]);

  afterEach(function() {
    // very important to do this in an afterEach than in each test when __Rewire__ is used
    // if you try to reset within each test you'll make it impossible for tests to fail!
    async.__ResetDependency__('utils');
    trackMetric.resetHistory();
  })

  describe('Asynchronous Actions', () => {
    describe('signup', () => {
      it('should trigger SIGNUP_SUCCESS and it should call signup and get once for a successful request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, null, user),
          }
        };

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_SUCCESS', payload: { user: { id: 27 } } },
          { type: '@@router/TRANSITION', payload: { args: [ '/email-verification' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.signup(api, {foo: 'bar'}));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(trackMetric.calledWith('Signed Up')).to.be.true;
      });

      it('should trigger ACCEPT_TERMS_REQUEST if the user user accepted terms in the signup form', () => {
        const acceptedDate = new Date().toISOString();
        const loggedInUserId = false;
        const termsData = { termsAccepted: acceptedDate };
        const user = {
          id: 27,
        };

        const initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId } });

        const api = {
          user: {
            signup: sinon.stub().callsArgWith(1, null, user),
            acceptTerms: sinon.stub().callsArgWith(1, null, user),
          }
        };

        const accountDetails = {
          termsAccepted: acceptedDate,
        }

        const store = mockStore(initialStateForTest);
        store.dispatch(async.signup(api, accountDetails));

        const actions = store.getActions();

        const action = _.find(actions, { type: 'ACCEPT_TERMS_REQUEST' });
        expect(isTSA(action)).to.be.true;
      });

      it('[409] should trigger SIGNUP_FAILURE and it should call signup once and get zero times for a failed signup request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, {status: 409, body: 'Error!'}, null),
          }
        };

        let err = new Error(ErrorMessages.ERR_ACCOUNT_ALREADY_EXISTS);
        err.status = 409;

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_FAILURE', error: err, meta: { apiError: {status: 409, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.signup(api, {foo: 'bar'}));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_ACCOUNT_ALREADY_EXISTS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.signup.callCount).to.equal(1);
      });

      it('[500] should trigger SIGNUP_FAILURE and it should call signup once and get zero times for a failed signup request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_SIGNUP);
        err.status = 500;

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.signup(api, {foo: 'bar'}));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_SIGNUP });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.signup.callCount).to.equal(1);
      });
    });

    describe('confirmSignup', () => {
      it('should trigger CONFIRM_SIGNUP_SUCCESS and it should call confirmSignup once for a successful request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            confirmSignUp: sinon.stub().callsArgWith(1, null)
          }
        };

        let expectedActions = [
          { type: 'CONFIRM_SIGNUP_REQUEST' },
          { type: 'CONFIRM_SIGNUP_SUCCESS' }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.confirmSignup(api, 'fakeSignupKey'));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.confirmSignUp.calledWith('fakeSignupKey')).to.be.true;
        expect(api.user.confirmSignUp.callCount).to.equal(1);
      });

      it('should trigger CONFIRM_SIGNUP_FAILURE and it should call confirmSignup once for a failed request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            confirmSignUp: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_CONFIRMING_SIGNUP);
        err.status = 500;

        let expectedActions = [
          { type: 'CONFIRM_SIGNUP_REQUEST' },
          { type: 'CONFIRM_SIGNUP_FAILURE', error: err, payload: { signupKey: 'fakeSignupKey' }, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.confirmSignup(api, 'fakeSignupKey'));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CONFIRMING_SIGNUP });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.confirmSignUp.calledWith('fakeSignupKey')).to.be.true;
        expect(api.user.confirmSignUp.callCount).to.equal(1);
      });

      it('[409] should trigger CONFIRM_SIGNUP_FAILURE and it should call confirmSignup once for a failed request and redirect for password creation', () => {
        let user = { id: 27 };
        let api = {
          user: {
            confirmSignUp: sinon.stub().callsArgWith(1, {status: 409, message: 'User does not have a password'})
          }
        };

        let err = new Error(ErrorMessages.ERR_CONFIRMING_SIGNUP);
        err.status = 409;

        let expectedActions = [
          { type: 'CONFIRM_SIGNUP_REQUEST' },
          { type: 'CONFIRM_SIGNUP_FAILURE', error: err, payload: { signupKey: 'fakeSignupKey' }, meta: { apiError: {status: 409, message: 'User does not have a password'} } },
          { type: '@@router/TRANSITION', payload: { args: [ '/verification-with-password?signupKey=fakeSignupKey&signupEmail=g@a.com' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.confirmSignup(api, 'fakeSignupKey', 'g@a.com'));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CONFIRMING_SIGNUP });
        expectedActions[1].error = actions[1].error;

        expect(actions).to.eql(expectedActions);
        expect(api.user.confirmSignUp.calledWith('fakeSignupKey')).to.be.true;
        expect(api.user.confirmSignUp.callCount).to.equal(1);
      });
    });

    describe('verifyCustodial', () => {
      it('should trigger ACKNOWLEDGE_NOTIFICATION for the confirmingSignup notification if set', () => {
        let user = { id: 27 };
        let key = 'fakeSignupKey';
        let email = 'g@a.com';
        let birthday = '07/18/1988';
        let password = 'foobar01';
        let creds = { username: email, password: password };
        let api = {
          user: {
            custodialConfirmSignUp: sinon.stub().callsArgWith(3, null),
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedAction = { type: 'ACKNOWLEDGE_NOTIFICATION', payload: { acknowledgedNotification: 'confirmingSignup' } };

        let initialStateForTest = _.merge({}, initialState, { blip: { working: { confirmingSignup: { notification: 'hi' } } } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.verifyCustodial(api, key, email, birthday, password));

        const actions = store.getActions();
        expect(actions[0]).to.eql(expectedAction);
      });

      it('should trigger VERIFY_CUSTODIAL_SUCCESS and it should call verifyCustodial once for a successful request', () => {
        let user = { id: 27 };
        let key = 'fakeSignupKey';
        let email = 'g@a.com';
        let birthday = '07/18/1988';
        let password = 'foobar01';
        let creds = { username: email, password: password };
        let api = {
          user: {
            custodialConfirmSignUp: sinon.stub().callsArgWith(3, null),
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'VERIFY_CUSTODIAL_REQUEST' },
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_SUCCESS', payload: { user: user } },
          { type: 'VERIFY_CUSTODIAL_SUCCESS' },
          { type: '@@router/TRANSITION', payload: { args: [ '/patients?justLoggedIn=true' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let initialStateForTest = _.merge({}, initialState, { blip: { working: { confirmingSignup: { notification: null } } } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.verifyCustodial(api, key, email, birthday, password));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);

        expect(api.user.custodialConfirmSignUp.calledWith(key, birthday, password)).to.be.true;
        expect(api.user.custodialConfirmSignUp.callCount).to.equal(1);

        expect(trackMetric.calledWith('VCA Home Verification - Verified')).to.be.true;
        expect(trackMetric.calledWith('Logged In')).to.be.true;
      });

      it('should trigger VERIFY_CUSTODIAL_FAILURE and it should call verifyCustodial once for a failed request', () => {
        let user = { id: 27 };
        let key = 'fakeSignupKey';
        let email = 'g@a.com';
        let birthday = '07/18/1988';
        let password = 'foobar01';
        let api = {
          user: {
            custodialConfirmSignUp: sinon.stub().callsArgWith(3, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_CONFIRMING_SIGNUP);
        err.status = 500;

        let expectedActions = [
          { type: 'VERIFY_CUSTODIAL_REQUEST' },
          { type: 'VERIFY_CUSTODIAL_FAILURE', error: err, payload: { signupKey: 'fakeSignupKey' }, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let initialStateForTest = _.merge({}, initialState, { blip: { working: { confirmingSignup: { notification: null } } } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.verifyCustodial(api, key, email, birthday, password));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CONFIRMING_SIGNUP });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.custodialConfirmSignUp.calledWith(key, birthday, password)).to.be.true;
        expect(api.user.custodialConfirmSignUp.callCount).to.equal(1);
      });
    });

    describe('resendEmailVerification', () => {
      it('should trigger RESEND_EMAIL_VERIFICATION_SUCCESS and it should call resendEmailVerification once for a successful request', () => {
        const email = 'foo@bar.com';
        let api = {
          user: {
            resendEmailVerification: sinon.stub().callsArgWith(1, null)
          }
        };

        let expectedActions = [
          { type: 'RESEND_EMAIL_VERIFICATION_REQUEST' },
          { type: 'RESEND_EMAIL_VERIFICATION_SUCCESS', payload: {notification: {type: 'alert', message: 'We just sent you an e-mail.'}} }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.resendEmailVerification(api, email));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.resendEmailVerification.calledWith(email)).to.be.true;
        expect(api.user.resendEmailVerification.callCount).to.equal(1);
      });

      it('should trigger RESEND_EMAIL_VERIFICATION_FAILURE and it should call resendEmailVerification once for a failed request', () => {
        const email = 'foo@bar.com';
        let api = {
          user: {
            resendEmailVerification: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_RESENDING_EMAIL_VERIFICATION);
        err.status = 500;

        let expectedActions = [
          { type: 'RESEND_EMAIL_VERIFICATION_REQUEST' },
          { type: 'RESEND_EMAIL_VERIFICATION_FAILURE', error: err, meta: {apiError: {status: 500, body: 'Error!'}} }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.resendEmailVerification(api, email));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_RESENDING_EMAIL_VERIFICATION });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.resendEmailVerification.calledWith(email)).to.be.true;
        expect(api.user.resendEmailVerification.callCount).to.equal(1);
      });
    });

    describe('acceptTerms', () => {
      it('should trigger ACCEPT_TERMS_SUCCESS and it should call acceptTerms once for a successful request', () => {
        let acceptedDate = new Date();
        let loggedInUserId = 500;
        let termsData = { termsAccepted: new Date() };
        let api = {
          user: {
            acceptTerms: sinon.stub().callsArgWith(1, null)
          }
        };

        let expectedActions = [
          { type: 'ACCEPT_TERMS_REQUEST' },
          { type: 'ACCEPT_TERMS_SUCCESS', payload: { userId: loggedInUserId, acceptedDate: acceptedDate } },
          { type: '@@router/TRANSITION', payload: { args: [ '/patients?justLoggedIn=true' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.acceptTerms(api, acceptedDate));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.acceptTerms.calledWith(termsData)).to.be.true;
        expect(api.user.acceptTerms.callCount).to.equal(1);
      });

      it('should trigger ACCEPT_TERMS_SUCCESS and it should call acceptTerms once for a successful request, routing to clinic info for clinician', () => {
        let acceptedDate = new Date();
        let loggedInUserId = 500;
        let termsData = { termsAccepted: new Date() };
        let user = {
          roles: ['clinic']
        };
        let api = {
          user: {
            acceptTerms: sinon.stub().callsArgWith(1, null, user)
          }
        };

        let expectedActions = [
          { type: 'ACCEPT_TERMS_REQUEST' },
          { type: 'ACCEPT_TERMS_SUCCESS', payload: { userId: loggedInUserId, acceptedDate: acceptedDate } },
          { type: '@@router/TRANSITION', payload: { args: [ '/clinician-details' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.acceptTerms(api, acceptedDate));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.acceptTerms.calledWith(termsData)).to.be.true;
        expect(api.user.acceptTerms.callCount).to.equal(1);
      });

      it('should trigger ACCEPT_TERMS_SUCCESS and should not trigger a route transition if the user is not logged in', () => {
        let acceptedDate = new Date();
        let loggedInUserId = false;
        let termsData = { termsAccepted: new Date() };
        let user = {
          id: 27,
          roles: ['clinic'],
        };
        let api = {
          user: {
            acceptTerms: sinon.stub().callsArgWith(1, null, user)
          }
        };

        let expectedActions = [
          { type: 'ACCEPT_TERMS_REQUEST' },
          { type: 'ACCEPT_TERMS_SUCCESS', payload: { userId: user.id, acceptedDate: acceptedDate } },
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.acceptTerms(api, acceptedDate, user.id));

        const actions = store.getActions();

        expect(actions).to.eql(expectedActions);
        expect(api.user.acceptTerms.calledWith(termsData)).to.be.true;
        expect(api.user.acceptTerms.callCount).to.equal(1);

        expect(_.find(actions, { type: '@@router/TRANSITION' })).to.be.undefined;
      });

      it('should trigger ACCEPT_TERMS_FAILURE and it should call acceptTerms once for a failed request', () => {
        let acceptedDate = new Date();
        let termsData = { termsAccepted: acceptedDate };
        let loggedInUserId = 500;
        let api = {
          user: {
            acceptTerms: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_ACCEPTING_TERMS);
        err.status = 500;

        let expectedActions = [
          { type: 'ACCEPT_TERMS_REQUEST' },
          { type: 'ACCEPT_TERMS_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.acceptTerms(api, acceptedDate));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_ACCEPTING_TERMS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.acceptTerms.calledWith(termsData)).to.be.true;
        expect(api.user.acceptTerms.callCount).to.equal(1);
      });
    });

    describe('login', () => {
      it('should trigger LOGIN_SUCCESS and it should call login and user.get once for a successful request', () => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_SUCCESS', payload: { user: user } },
          { type: '@@router/TRANSITION', payload: { args: [ '/patients?justLoggedIn=true' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.login(api, creds));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.get.callCount).to.equal(1);
        expect(trackMetric.calledWith('Logged In')).to.be.true;
      });

      it('should trigger LOGIN_SUCCESS and it should call login, user.get and patient.get once for a successful request', () => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27, profile: { patient: true } };
        let patient = { foo: 'bar' };

        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, null, user)
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_SUCCESS', payload: { user: _.merge({}, user, patient) } },
          { type: '@@router/TRANSITION', payload: { args: [ '/patients?justLoggedIn=true' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);

        store.dispatch(async.login(api, creds));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.get.callCount).to.equal(1);
        expect(api.patient.get.callCount).to.equal(1);
        expect(trackMetric.calledWith('Logged In')).to.be.true;
      });

      it('should trigger LOGIN_SUCCESS and it should redirect a clinician with no clinic profile to the clinician details form', () => {
        const creds = { username: 'bruce', password: 'wayne' };
        const user = { id: 27, roles: [ 'clinic' ], profile: {} };
        const patient = { foo: 'bar' };

        const api = {
          user: {
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, null, user)
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        const expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_SUCCESS', payload: { user } },
          { type: '@@router/TRANSITION', payload: { method: 'push', args: [ '/clinician-details' ] } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        const store = mockStore(initialState);

        store.dispatch(async.login(api, creds));

        const actions = store.getActions();

        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.get.callCount).to.equal(1);
        expect(trackMetric.calledWith('Logged In')).to.be.true;
      });


      it('should trigger LOGIN_SUCCESS and it should redirect a clinician with a clinic profile to the patients view', () => {
        const creds = { username: 'bruce', password: 'wayne' };
        const user = { id: 27, roles: ['clinic'], profile: { clinic: true } };
        const patient = { foo: 'bar' };

        const api = {
          user: {
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, null, user)
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        const expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_SUCCESS', payload: { user } },
          { type: '@@router/TRANSITION', payload: { method: 'push', args: ['/patients?justLoggedIn=true'] } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        const store = mockStore(initialState);

        store.dispatch(async.login(api, creds));

        const actions = store.getActions();

        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.get.callCount).to.equal(1);
        expect(trackMetric.calledWith('Logged In')).to.be.true;
      });

      it('[400] should trigger LOGIN_FAILURE and it should call login once and user.get zero times for a failed login request', () => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, {status: 400, body: 'Error!'}),
            get: sinon.stub()
          }
        };

        let err = new Error(ErrorMessages.ERR_LOGIN);
        err.status = 400;

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: err, payload: null, meta: { apiError: {status: 400, body: 'Error!'}}}
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.login(api, creds));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_LOGIN });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.login.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
      });

      it('[401] should trigger LOGIN_FAILURE and it should call login once and user.get zero times for a failed login because of wrong password request', () => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, {status: 401, body: 'Wrong password!'}),
            get: sinon.stub()
          }
        };

        let err = new Error(ErrorMessages.ERR_LOGIN_CREDS);
        err.status = 401;

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: err, payload: null, meta: { apiError: {status: 401, body: 'Wrong password!'}} }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.login(api, creds));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_LOGIN_CREDS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.login.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
      });

      it('[403] should trigger LOGIN_FAILURE and it should call login once and user.get zero times for a failed login because of unverified e-mail', () => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, {status: 403, body: 'E-mail not verified!'}),
            get: sinon.stub()
          }
        };

        let err = null;
        let payload = {isLoggedIn: false, emailVerificationSent: false};

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: err, payload: payload, meta: { apiError: {status: 403, body: 'E-mail not verified!'}} },
          { type: '@@router/TRANSITION', payload: { args: [ '/email-verification' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.login(api, creds));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.login.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
      });

      it('[500 on user fetch] should trigger LOGIN_FAILURE and it should call login and user.get once for a failed user.get request', () => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_USER);
        err.status = 500;

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: err, payload: null, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.login(api, creds));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_USER });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.login.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(1);
      });

      it('[500 on patient fetch] should trigger LOGIN_FAILURE and it should call login, user.get, and patient.get once for a failed patient.get request', () => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27, profile: { patient: true} };
        let api = {
          patient: {
            get: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          },
          user: {
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_PATIENT);
        err.status = 500;

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: err, payload: null, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.login(api, creds));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_PATIENT });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.login.calledWith(creds)).to.be.true;
        expect(api.user.login.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(1);
        expect(api.patient.get.callCount).to.equal(1);
      });
    });

    describe('logout', () => {
      it('should trigger LOGOUT_SUCCESS and it should call logout once for a successful request', () => {
        let api = {
          user: {
            logout: sinon.stub().callsArgWith(0, null)
          }
        };

        let expectedActions = [
          { type: 'LOGOUT_REQUEST' },
          { type: 'LOGOUT_SUCCESS' },
          { type: '@@router/TRANSITION', payload: { args: [ '/' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.logout(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.logout.callCount).to.equal(1);
        expect(trackMetric.calledWith('Logged Out')).to.be.true;
      });
    });

    describe('setupDataStorage', () => {
      it('should trigger SETUP_DATA_STORAGE_SUCCESS and it should call setupDataStorage once for a successful request', () => {
        let loggedInUserId = 500;
        let patient = { userid: 27, name: 'Bruce' };
        let api = {
          patient: {
            post: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'SETUP_DATA_STORAGE_REQUEST' },
          { type: 'SETUP_DATA_STORAGE_SUCCESS', payload: { userId: loggedInUserId, patient: patient } },
          { type: '@@router/TRANSITION', payload: { args: [ '/patients/27/data' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.setupDataStorage(api, patient));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.patient.post.calledWith(patient)).to.be.true;
        expect(api.patient.post.callCount).to.equal(1);
        expect(trackMetric.calledWith('Created Profile')).to.be.true;
      });

      it('should trigger SETUP_DATA_STORAGE_FAILURE and it should call setupDataStorage once for a failed request', () => {
        let loggedInUserId = 500;
        let patient = { id: 27, name: 'Bruce' };
        let api = {
          patient: {
            post: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_DSA_SETUP);
        err.status = 500;

        let expectedActions = [
          { type: 'SETUP_DATA_STORAGE_REQUEST' },
          { type: 'SETUP_DATA_STORAGE_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest);
        store.dispatch(async.setupDataStorage(api, patient));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_DSA_SETUP });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.patient.post.calledWith(patient)).to.be.true;
        expect(api.patient.post.callCount).to.equal(1);
      });
    });

    describe('removeMembershipInOtherCareTeam', () => {
      it('should trigger REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS and it should call leaveGroup and patient.getAll once for a successful request', () => {
        let patientId = 27;
        let patients = [
          { id: 200 },
          { id: 101 }
        ]
        let api = {
          access: {
            leaveGroup: sinon.stub().callsArgWith(1, null)
          },
          patient: {
            getAll: sinon.stub().callsArgWith(0, null, patients)
          }
        };

        let expectedActions = [
          { type: 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST' },
          { type: 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_SUCCESS', payload: { removedPatientId: patientId } },
          { type: 'FETCH_PATIENTS_REQUEST' },
          { type: 'FETCH_PATIENTS_SUCCESS', payload: { patients: patients } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.removeMembershipInOtherCareTeam(api, patientId));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.access.leaveGroup.calledWith(patientId)).to.be.true;
        expect(api.access.leaveGroup.callCount).to.equal(1)
        expect(api.patient.getAll.callCount).to.equal(1);
      });

      it('should trigger REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE and it should call removeMembershipInOtherCareTeam once for a failed request', () => {
        let patientId = 27;
        let api = {
          access: {
            leaveGroup: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_REMOVING_MEMBERSHIP);
        err.status = 500;

        let expectedActions = [
          { type: 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST' },
          { type: 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.removeMembershipInOtherCareTeam(api, patientId));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_REMOVING_MEMBERSHIP });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.access.leaveGroup.calledWith(patientId)).to.be.true;
        expect(api.access.leaveGroup.callCount).to.equal(1)
      });
    });

    describe('removeMemberFromTargetCareTeam', () => {
      it('should trigger REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS and it should call api.access.removeMember and callback once for a successful request', () => {
        let memberId = 27;
        let patientId = 456;
        let patient = { id: 546, name: 'Frank' };
        let api = {
          access: {
            removeMember: sinon.stub().callsArgWith(1, null)
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST' },
          { type: 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS', payload: { removedMemberId: memberId } },
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_SUCCESS', payload: { patient: patient } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.removeMemberFromTargetCareTeam(api, patientId, memberId, callback));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.access.removeMember.withArgs(memberId).callCount).to.equal(1);
        expect(api.patient.get.withArgs(patientId).callCount).to.equal(1);

        // assert callback contains no error, and the memberId
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, null, memberId);
      });

      it('should trigger REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE and it should call api.access.removeMember and callback once with error for a failed request', () => {
        let memberId = 27;
        let patientId = 420;
        const error = { status: 500, body: 'Error!' };
        let api = {
          access: {
            removeMember: sinon.stub().callsArgWith(1, error)
          }
        };

        let err = new Error(ErrorMessages.ERR_REMOVING_MEMBER);
        err.status = 500;

        let expectedActions = [
          { type: 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_REQUEST' },
          { type: 'REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.removeMemberFromTargetCareTeam(api, patientId, memberId, callback));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_REMOVING_MEMBER });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.access.removeMember.calledWith(memberId)).to.be.true;

        // assert callback contains the error
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, error, memberId);
      });
    });

    describe('sendInvite', () => {
      it('should trigger SEND_INVITE_SUCCESS and it should call api.invitation.send and callback once for a successful request', () => {
        let email = 'a@b.com';
        let permissions = {
          view: true
        };
        let invite = { foo: 'bar' };
        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, null, invite)
          }
        };

        let expectedActions = [
          { type: 'SEND_INVITE_REQUEST' },
          { type: 'SEND_INVITE_SUCCESS', payload: { invite: invite } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.sendInvite(api, email, permissions, callback));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.send.calledWith(email, permissions)).to.be.true;

        // assert callback contains no error, and the invite
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, null, invite);
      });

      it('should trigger FETCH_PENDING_SENT_INVITES_REQUEST once for a successful request for a data donation account', () => {
        let email = 'a@b.com';
        let permissions = {
          view: true
        };
        let invite = { email: TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL };
        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, null, invite),
            getSent: sinon.stub(),
          }
        };

        let expectedActions = [
          { type: 'SEND_INVITE_REQUEST' },
          { type: 'FETCH_PENDING_SENT_INVITES_REQUEST' },
          { type: 'SEND_INVITE_SUCCESS', payload: { invite: invite } },
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.sendInvite(api, email, permissions, callback));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.send.calledWith(email, permissions)).to.be.true;

        // assert callback contains no error, and the invite
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, null, invite);
      });

      it('should trigger SEND_INVITE_FAILURE when invite has already been sent to the e-mail', () => {
        let email = 'a@b.com';
        let permissions = {
          view: true
        };
        let invitation = { foo: 'bar' };
        const error = { status: 409, body: 'Error!' };
        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, error)
          }
        };

        let err = new Error(ErrorMessages.ERR_ALREADY_SENT_TO_EMAIL);
        err.status = 409;

        let expectedActions = [
          { type: 'SEND_INVITE_REQUEST' },
          { type: 'SEND_INVITE_FAILURE', error: err, meta: { apiError: {status: 409, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.sendInvite(api, email, permissions, callback));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_ALREADY_SENT_TO_EMAIL });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.send.calledWith(email, permissions)).to.be.true;

        // assert callback contains the error
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, error, undefined);
      });

      it('should trigger SEND_INVITE_FAILURE and it should call api.invitation.send and callback once with error for a failed request', () => {
        let email = 'a@b.com';
        let permissions = {
          view: true
        };
        let invitation = { foo: 'bar' };
        const error = { status: 500, body: 'Error!' };
        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, error)
          }
        };

        let err = new Error(ErrorMessages.ERR_SENDING_INVITE);
        err.status = 500;

        let expectedActions = [
          { type: 'SEND_INVITE_REQUEST' },
          { type: 'SEND_INVITE_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.sendInvite(api, email, permissions, callback));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_SENDING_INVITE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.send.calledWith(email, permissions)).to.be.true;

        // assert callback contains the error
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, error, undefined);
      });
    });

    describe('cancelSentInvite', () => {
      it('should trigger CANCEL_SENT_INVITE_SUCCESS and it should call api.invitation.cancel and callback once for a successful request', () => {
        let email = 'a@b.com';
        let api = {
          invitation: {
            cancel: sinon.stub().callsArgWith(1, null)
          }
        };

        let expectedActions = [
          { type: 'CANCEL_SENT_INVITE_REQUEST' },
          { type: 'CANCEL_SENT_INVITE_SUCCESS', payload: { removedEmail: email } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.cancelSentInvite(api, email, callback));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.cancel.calledWith(email)).to.be.true;

        // assert callback contains no error, and the email
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, null, email);
      });

      it('should trigger CANCEL_SENT_INVITE_FAILURE and it should call api.invitation.send and callback once with error for a failed request', () => {
        let email = 'a@b.com';
        const error = { status: 500, body: 'Error!' };
        let api = {
          invitation: {
            cancel: sinon.stub().callsArgWith(1, error)
          }
        };

        let err = new Error(ErrorMessages.ERR_CANCELLING_INVITE);
        err.status = 500;

        let expectedActions = [
          { type: 'CANCEL_SENT_INVITE_REQUEST' },
          { type: 'CANCEL_SENT_INVITE_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        const callback = sinon.stub();

        store.dispatch(async.cancelSentInvite(api, email, callback));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CANCELLING_INVITE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.cancel.calledWith(email)).to.be.true;

        // assert callback contains the error
        sinon.assert.calledOnce(callback);
        sinon.assert.calledWithExactly(callback, error, email);
      });
    });

    describe('fetchDataDonationAccounts', () => {
      it('should trigger FETCH_DATA_DONATION_ACCOUNTS_SUCCESS and it should call api.user.getDataDonationAccounts once for a successful request', () => {
        let dataDonationAccounts = [
          { email: 'bigdata@tidepool.org' },
          { email: 'bigdata+NSF@tidepool.org' },
        ];

        let api = {
          user: {
            getDataDonationAccounts: sinon.stub().callsArgWith(0, null, dataDonationAccounts)
          }
        };

        let expectedActions = [
          { type: 'FETCH_DATA_DONATION_ACCOUNTS_REQUEST' },
          { type: 'FETCH_DATA_DONATION_ACCOUNTS_SUCCESS', payload: { accounts: dataDonationAccounts } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchDataDonationAccounts(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.getDataDonationAccounts.callCount).to.equal(1);
      });

      it('should trigger FETCH_DATA_DONATION_ACCOUNTS_FAILURE and it should call error once for a failed request', () => {
        let dataDonationAccounts = [
          { email: 'bigdata@tidepool.org' },
          { email: 'bigdata+NSF@tidepool.org' },
        ];

        let api = {
          user: {
            getDataDonationAccounts: sinon.stub().callsArgWith(0, { status: 500, body: 'Error!' }, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_DATA_DONATION_ACCOUNTS);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_DATA_DONATION_ACCOUNTS_REQUEST' },
          { type: 'FETCH_DATA_DONATION_ACCOUNTS_FAILURE', error: err, meta: { apiError: { status: 500, body: 'Error!' } } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchDataDonationAccounts(api));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_DATA_DONATION_ACCOUNTS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.getDataDonationAccounts.callCount).to.equal(1);
      });
    });

    describe('updateDataDonationAccounts', () => {
      it('should trigger UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS and it should add and remove accounts for a successful request', () => {
        let addAccounts = [
          TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
        ];

        let removeAccounts = [
          { email: 'bigdata+NSF@tidepool.org' },
        ];

        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, null, { email: TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL }),
            cancel: sinon.stub().callsArgWith(1, null, { removedEmail: 'bigdata+NSF@tidepool.org' }),
            getSent: sinon.stub(),
          }
        };

        let expectedActions = [
          { type: 'UPDATE_DATA_DONATION_ACCOUNTS_REQUEST' },
          { type: 'SEND_INVITE_REQUEST'},
          { type: 'FETCH_PENDING_SENT_INVITES_REQUEST'},
          { type: 'SEND_INVITE_SUCCESS', payload: { invite: { email: TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL } } },
          { type: 'CANCEL_SENT_INVITE_REQUEST' },
          { type: 'CANCEL_SENT_INVITE_SUCCESS', payload: { removedEmail: 'bigdata+NSF@tidepool.org' } },
          { type: 'UPDATE_DATA_DONATION_ACCOUNTS_SUCCESS', payload: { accounts: {
            addAccounts: _.map(addAccounts, email => ({ email: email })),
            removeAccounts: _.map(removeAccounts, account => account.email),
          }}}
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(_.assign({}, initialState, {
          blip: { loggedInUserId: 1234 },
        }));

        store.dispatch(async.updateDataDonationAccounts(api, addAccounts, removeAccounts));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
      });

      it('should trigger UPDATE_DATA_DONATION_ACCOUNTS_FAILURE and it should call error once for a failed add account request', () => {
        let addAccounts = [
          TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
        ];

        let removeAccounts = [
          { email: 'bigdata+NSF@tidepool.org' },
        ];

        let err = new Error(ErrorMessages.ERR_UPDATING_DATA_DONATION_ACCOUNTS);
        err.status = 500;

        let sendErr = new Error(ErrorMessages.ERR_SENDING_INVITE);
        sendErr.status = 500;

        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, { status: 500, body: 'Error!' } , null),
            cancel: sinon.stub().callsArgWith(1, null, { removedEmail: 'bigdata+NSF@tidepool.org' }),
            getSent: sinon.stub(),
          }
        };

        let expectedActions = [
          { type: 'UPDATE_DATA_DONATION_ACCOUNTS_REQUEST' },
          { type: 'SEND_INVITE_REQUEST' },
          { type: 'SEND_INVITE_FAILURE', error: sendErr, meta: { apiError: { status: 500, body: 'Error!' } } },
          { type: 'CANCEL_SENT_INVITE_REQUEST' },
          { type: 'CANCEL_SENT_INVITE_SUCCESS', payload: { removedEmail: 'bigdata+NSF@tidepool.org' } },
          { type: 'UPDATE_DATA_DONATION_ACCOUNTS_FAILURE', error: err, meta: { apiError: { status: 500, body: 'Error!' } } },
        ];

        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(_.assign({}, initialState, {
          blip: { loggedInUserId: 1234 },
        }));

        store.dispatch(async.updateDataDonationAccounts(api, addAccounts, removeAccounts));

        const actions = store.getActions();
        expect(actions[2].error).to.deep.include({ message: ErrorMessages.ERR_SENDING_INVITE });
        expectedActions[2].error = actions[2].error;
        expect(actions[5].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_DATA_DONATION_ACCOUNTS });
        expectedActions[5].error = actions[5].error;
        expect(actions).to.eql(expectedActions);
      });
    });

    describe('dismissDonateBanner', () => {
      it('should trigger DISMISS_BANNER and it should call updatePreferences once for a successful request', () => {
        let preferences = { dismissedDonateYourDataBannerTime: '2017-11-28T00:00:00.000Z' };
        let patient = { id: 500, name: 'Buddy Holly', age: 65 };

        let api = {
          metadata: {
            preferences: {
              put: sinon.stub().callsArgWith(2, null, preferences),
            },
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'DISMISS_BANNER', payload: { type: 'donate' } },
          { type: 'UPDATE_PREFERENCES_REQUEST' },
          { type: 'UPDATE_PREFERENCES_SUCCESS', payload: { updatedPreferences: {
            dismissedDonateYourDataBannerTime: preferences.dismissedDonateYourDataBannerTime,
          } } },
        ];

        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.dismissDonateBanner(api, patient.id));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
      });
    });

    describe('dismissDexcomConnectBanner', () => {
      it('should trigger DISMISS_BANNER and it should call updatePreferences once for a successful request', () => {
        let preferences = { dismissedDexcomConnectBannerTime: '2017-11-28T00:00:00.000Z' };
        let patient = { id: 500, name: 'Buddy Holly', age: 65 };

        let api = {
          metadata: {
            preferences: {
              put: sinon.stub().callsArgWith(2, null, preferences),
            },
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'DISMISS_BANNER', payload: { type: 'dexcom' } },
          { type: 'UPDATE_PREFERENCES_REQUEST' },
          { type: 'UPDATE_PREFERENCES_SUCCESS', payload: { updatedPreferences: {
            dismissedDexcomConnectBannerTime: preferences.dismissedDexcomConnectBannerTime,
          } } },
        ];

        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.dismissDexcomConnectBanner(api, patient.id));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
      });
    });

    describe('clickDexcomConnectBanner', () => {
      it('should trigger DISMISS_BANNER and it should call updatePreferences once for a successful request', () => {
        let preferences = { clickedDexcomConnectBannerTime: '2017-11-28T00:00:00.000Z' };
        let patient = { id: 500, name: 'Buddy Holly', age: 65 };

        let api = {
          metadata: {
            preferences: {
              put: sinon.stub().callsArgWith(2, null, preferences),
            },
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'DISMISS_BANNER', payload: { type: 'dexcom' } },
          { type: 'UPDATE_PREFERENCES_REQUEST' },
          { type: 'UPDATE_PREFERENCES_SUCCESS', payload: { updatedPreferences: {
            clickedDexcomConnectBannerTime: preferences.clickedDexcomConnectBannerTime,
          } } },
        ];

        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.clickDexcomConnectBanner(api, patient.id));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
      });
    });

    describe('acceptReceivedInvite', () => {
      it('should trigger ACCEPT_RECEIVED_INVITE_SUCCESS and it should call acceptReceivedInvite once for a successful request', () => {
        let invitation = { key: 'foo', creator: { userid: 500 } };
        let patient = { id: 500, name: 'Buddy Holly', age: 65 };

        let api = {
          invitation: {
            accept: sinon.stub().callsArgWith(2, null, invitation)
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'ACCEPT_RECEIVED_INVITE_REQUEST', payload: { acceptedReceivedInvite: invitation } },
          { type: 'ACCEPT_RECEIVED_INVITE_SUCCESS', payload: { acceptedReceivedInvite: invitation } },
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_SUCCESS', payload: { patient : patient } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.acceptReceivedInvite(api, invitation));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.accept.calledWith(invitation.key, invitation.creator.userid)).to.be.true;
        expect(api.patient.get.calledWith(invitation.creator.userid)).to.be.true;
      });

      it('should trigger ACCEPT_RECEIVED_INVITE_FAILURE and it should call acceptReceivedInvite once for a failed request', () => {
        let invitation = { key: 'foo', creator: { id: 500 } };
        let api = {
          invitation: {
            accept: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_ACCEPTING_INVITE);
        err.status = 500;

        let expectedActions = [
          { type: 'ACCEPT_RECEIVED_INVITE_REQUEST', payload: { acceptedReceivedInvite: invitation } },
          { type: 'ACCEPT_RECEIVED_INVITE_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.acceptReceivedInvite(api, invitation));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_ACCEPTING_INVITE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.accept.calledWith(invitation.key, invitation.creator.userid)).to.be.true;
      });
    });

    describe('rejectReceivedInvite', () => {
      it('should trigger REJECT_RECEIVED_INVITE_SUCCESS and it should call rejectReceivedInvite once for a successful request', () => {
        let invitation = { key: 'foo', creator: { userid: 500 } };
        let api = {
          invitation: {
            dismiss: sinon.stub().callsArgWith(2, null, invitation)
          }
        };

        let expectedActions = [
          { type: 'REJECT_RECEIVED_INVITE_REQUEST', payload: { rejectedReceivedInvite: invitation } },
          { type: 'REJECT_RECEIVED_INVITE_SUCCESS', payload: { rejectedReceivedInvite: invitation } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.rejectReceivedInvite(api, invitation));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.dismiss.calledWith(invitation.key, invitation.creator.userid)).to.be.true;
      });

      it('should trigger REJECT_RECEIVED_INVITE_FAILURE and it should call rejectReceivedInvite once for a failed request', () => {
        let invitation = { key: 'foo', creator: { id: 500 } };
        let api = {
          invitation: {
            dismiss: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_REJECTING_INVITE);
        err.status = 500;

        let expectedActions = [
          { type: 'REJECT_RECEIVED_INVITE_REQUEST', payload: { rejectedReceivedInvite: invitation } },
          { type: 'REJECT_RECEIVED_INVITE_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.rejectReceivedInvite(api, invitation));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_REJECTING_INVITE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.dismiss.calledWith(invitation.key, invitation.creator.userid)).to.be.true;
      });
    });

    describe('setMemberPermissions', () => {
      it('should trigger SET_MEMBER_PERMISSIONS_SUCCESS and it should call setMemberPermissions once for a successful request', () => {
        let patientId = 50;
        let patient = { id: 50, name: 'Jeanette Peach' };
        let memberId = 2;
        let permissions = {
          read: false
        };
        let api = {
          access: {
            setMemberPermissions: sinon.stub().callsArgWith(2, null)
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'SET_MEMBER_PERMISSIONS_REQUEST' },
          { type: 'SET_MEMBER_PERMISSIONS_SUCCESS', payload: {
              memberId: memberId,
              permissions: permissions
            }
          },
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_SUCCESS', payload: { patient: patient } },
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.setMemberPermissions(api, patientId, memberId, permissions));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.access.setMemberPermissions.calledWith(memberId, permissions)).to.be.true;
        expect(api.patient.get.calledWith(patientId)).to.be.true;
      });

      it('should trigger SET_MEMBER_PERMISSIONS_FAILURE and it should call setMemberPermissions once for a failed request', () => {
        let patientId = 50;
        let memberId = 2;
        let permissions = {
          read: false
        };
        let api = {
          access: {
            setMemberPermissions: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_CHANGING_PERMS);
        err.status = 500;

        let expectedActions = [
          { type: 'SET_MEMBER_PERMISSIONS_REQUEST' },
          { type: 'SET_MEMBER_PERMISSIONS_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.setMemberPermissions(api, patientId, memberId, permissions));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CHANGING_PERMS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.access.setMemberPermissions.calledWith(memberId, permissions)).to.be.true;
      });
    });

    describe('updatePatient', () => {
      it('should trigger UPDATE_PATIENT_SUCCESS and it should call updatePatient once for a successful request', () => {
        let patient = { name: 'Bruce' };
        let api = {
          patient: {
            put: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'UPDATE_PATIENT_REQUEST' },
          { type: 'UPDATE_PATIENT_SUCCESS', payload: { updatedPatient: patient } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.updatePatient(api, patient));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.patient.put.calledWith(patient)).to.be.true;
        expect(trackMetric.calledWith('Updated Profile')).to.be.true;
      });

      it('should trigger UPDATE_PATIENT_FAILURE and it should call updatePatient once for a failed request', () => {
        let patient = { name: 'Bruce' };
        let api = {
          patient: {
            put: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_UPDATING_PATIENT);
        err.status = 500;

        let expectedActions = [
          { type: 'UPDATE_PATIENT_REQUEST' },
          { type: 'UPDATE_PATIENT_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.updatePatient(api, patient));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_PATIENT });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.patient.put.calledWith(patient)).to.be.true;
      });
    });

    describe('updatePreferences', () => {
      it('should trigger UPDATE_PREFERENCES_SUCCESS and it should call updatePreferences once for a successful request', () => {
        let patientId = 1234;
        let preferences = { display: 'all' };
        let api = {
          metadata: {
            preferences: {
              put: sinon.stub().callsArgWith(2, null, preferences)
            }
          }
        };

        let expectedActions = [
          { type: 'UPDATE_PREFERENCES_REQUEST' },
          { type: 'UPDATE_PREFERENCES_SUCCESS', payload: { updatedPreferences: preferences } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.updatePreferences(api, patientId, preferences));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.metadata.preferences.put.calledWith(patientId, preferences)).to.be.true;
      });

      it('should trigger UPDATE_PREFERENCES_FAILURE and it should call updatePreferences once for a failed request', () => {
        let patientId = 1234;
        let preferences = { display: 'all' };
        let api = {
          metadata: {
            preferences: {
              put: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'})
            }
          }
        };

        let err = new Error(ErrorMessages.ERR_UPDATING_PREFERENCES);
        err.status = 500;

        let expectedActions = [
          { type: 'UPDATE_PREFERENCES_REQUEST' },
          { type: 'UPDATE_PREFERENCES_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.updatePreferences(api, patientId, preferences));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_PREFERENCES });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.metadata.preferences.put.calledWith(patientId, preferences)).to.be.true;
      });
    });

    describe('updateSettings', () => {
      it('should trigger UPDATE_SETTINGS_SUCCESS and it should call updateSettings once for a successful request', () => {
        let patientId = 1234;
        let settings = { siteChangeSource: 'cannulaPrime' };
        let api = {
          metadata: {
            settings: {
              put: sinon.stub().callsArgWith(2, null, settings)
            }
          }
        };

        let expectedActions = [
          { type: 'UPDATE_SETTINGS_REQUEST' },
          { type: 'UPDATE_SETTINGS_SUCCESS', payload: { userId: patientId, updatedSettings: settings } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.updateSettings(api, patientId, settings));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.metadata.settings.put.calledWith(patientId, settings)).to.be.true;
      });

      it('should trigger UPDATE_PATIENT_BG_UNITS_REQUEST when bg units are being updated', () => {
          let patientId = 1234;
          let settings = { units: { bg: MMOLL_UNITS} };
          let api = {
            metadata: {
              settings: {
                put: sinon.stub().callsArgWith(2, null, settings)
              }
            }
          };

          let expectedActions = [
            { type: 'UPDATE_SETTINGS_REQUEST' },
            { type: 'UPDATE_PATIENT_BG_UNITS_REQUEST' },
            { type: 'UPDATE_SETTINGS_SUCCESS', payload: { userId: patientId, updatedSettings: settings } },
            { type: 'UPDATE_PATIENT_BG_UNITS_SUCCESS', payload: { userId: patientId, updatedSettings: settings } },
          ];

          _.each(expectedActions, (action) => {
            expect(isTSA(action)).to.be.true;
          });

          let store = mockStore(initialState);
          store.dispatch(async.updateSettings(api, patientId, settings));

          const actions = store.getActions();
          expect(actions).to.eql(expectedActions);
          expect(api.metadata.settings.put.calledWith(patientId, settings)).to.be.true;
      });

      it('should trigger UPDATE_SETTINGS_FAILURE and it should call updateSettings once for a failed request', () => {
        let patientId = 1234;
        let settings = { siteChangeSource: 'cannulaPrime' };
        let api = {
          metadata: {
            settings: {
              put: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'})
            }
          }
        };

        let err = new Error(ErrorMessages.ERR_UPDATING_SETTINGS);
        err.status = 500;

        let expectedActions = [
          { type: 'UPDATE_SETTINGS_REQUEST' },
          { type: 'UPDATE_SETTINGS_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.updateSettings(api, patientId, settings));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_SETTINGS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.metadata.settings.put.calledWith(patientId, settings)).to.be.true;
      });

      it('should trigger UPDATE_PATIENT_BG_UNITS_FAILURE and it should call updateSettings once for a failed request', () => {
        let patientId = 1234;
        let settings = { units: { bg: MMOLL_UNITS} };
        let api = {
          metadata: {
            settings: {
              put: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'})
            }
          }
        };

        let err = new Error(ErrorMessages.ERR_UPDATING_SETTINGS);
        err.status = 500;

        let bgErr = new Error(ErrorMessages.ERR_UPDATING_PATIENT_BG_UNITS);
        bgErr.status = 500;

        let expectedActions = [
          { type: 'UPDATE_SETTINGS_REQUEST' },
          { type: 'UPDATE_PATIENT_BG_UNITS_REQUEST' },
          { type: 'UPDATE_SETTINGS_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } },
          { type: 'UPDATE_PATIENT_BG_UNITS_FAILURE', error: bgErr, meta: { apiError: {status: 500, body: 'Error!'} } },
        ];

        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.updateSettings(api, patientId, settings));

        const actions = store.getActions();
        expect(actions[2].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_SETTINGS });
        expectedActions[2].error = actions[2].error;
        expect(actions[3].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_PATIENT_BG_UNITS });
        expectedActions[3].error = actions[3].error;
        expect(actions).to.eql(expectedActions);
        expect(api.metadata.settings.put.calledWith(patientId, settings)).to.be.true;
      });
    });

    describe('updateUser', () => {
      it('should trigger UPDATE_USER_SUCCESS and it should call updateUser once for a successful request', () => {
        let loggedInUserId = 400;
        let currentUser = {
          profile: {
            name: 'Joe Bloggs',
            age: 29
          },
          password: 'foo',
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let formValues = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
        };

        let updatingUser = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          preferences: {},
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let userUpdates = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          preferences: {},
          password: 'foo'
        };

        let updatedUser = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe',
          password: 'foo'
        };

        let api = {
          user: {
            put: sinon.stub().callsArgWith(1, null, updatedUser)
          }
        };

        let initialStateForTest = _.merge({}, initialState, { allUsersMap: { [loggedInUserId] : currentUser }, loggedInUserId: loggedInUserId });

        let expectedActions = [
          { type: 'UPDATE_USER_REQUEST', payload: { userId: loggedInUserId, updatingUser: updatingUser} },
          { type: 'UPDATE_USER_SUCCESS', payload: { userId: loggedInUserId, updatedUser: updatedUser } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore({ blip : initialStateForTest });
        store.dispatch(async.updateUser(api, formValues));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.put.calledWith(userUpdates)).to.be.true;
        expect(trackMetric.calledWith('Updated Account')).to.be.true;
      });

      it('should trigger UPDATE_USER_FAILURE and it should call updateUser once for a failed request', () => {
        let loggedInUserId = 400;
        let currentUser = {
          profile: {
            name: 'Joe Bloggs',
            age: 29
          },
          password: 'foo',
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let formValues = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          }
        };

        let updatingUser = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          preferences: {},
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let userUpdates = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          preferences: {},
          password: 'foo'
        };
        let api = {
          user: {
            put: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_UPDATING_USER);
        err.status = 500;

        let initialStateForTest = _.merge({}, initialState, { allUsersMap: { [loggedInUserId] : currentUser }, loggedInUserId: loggedInUserId });

        let expectedActions = [
          { type: 'UPDATE_USER_REQUEST', payload: { userId: loggedInUserId, updatingUser: updatingUser} },
          { type: 'UPDATE_USER_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'}} }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore({ blip : initialStateForTest });
        store.dispatch(async.updateUser(api, formValues));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_USER });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.put.calledWith(userUpdates)).to.be.true;
      });
    });

    describe('updateClinicianProfile', () => {
      it('should trigger UPDATE_USER_SUCCESS and it should call updateClinicianProfile once for a successful request and route user', () => {
        let loggedInUserId = 400;
        let currentUser = {
          profile: {
            name: 'Joe Bloggs',
            age: 29
          },
          password: 'foo',
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let formValues = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
        };

        let updatingUser = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let userUpdates = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          password: 'foo'
        };

        let updatedUser = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe',
          password: 'foo'
        };

        let api = {
          user: {
            put: sinon.stub().callsArgWith(1, null, updatedUser)
          }
        };

        let initialStateForTest = _.merge({}, initialState, { allUsersMap: { [loggedInUserId] : currentUser }, loggedInUserId: loggedInUserId });

        let expectedActions = [
          { type: 'UPDATE_USER_REQUEST', payload: { userId: loggedInUserId, updatingUser: updatingUser} },
          { type: 'UPDATE_USER_SUCCESS', payload: { userId: loggedInUserId, updatedUser: updatedUser } },
          { type: '@@router/TRANSITION', payload: { args: [ '/patients?justLoggedIn=true' ], method: 'push' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore({ blip : initialStateForTest });
        store.dispatch(async.updateClinicianProfile(api, formValues));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.put.calledWith(userUpdates)).to.be.true;
        expect(trackMetric.calledWith('Updated Account')).to.be.true;
      });

      it('should trigger UPDATE_USER_FAILURE and it should call updateClinicianProfile once for a failed request', () => {
        let loggedInUserId = 400;
        let currentUser = {
          profile: {
            name: 'Joe Bloggs',
            age: 29
          },
          password: 'foo',
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let formValues = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          }
        };

        let updatingUser = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          emails: [
            'joe@bloggs.com'
          ],
          username: 'Joe'
        };

        let userUpdates = {
          profile: {
            name: 'Joe Steven Bloggs',
            age: 30
          },
          password: 'foo'
        };
        let api = {
          user: {
            put: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_UPDATING_USER);
        err.status = 500;

        let initialStateForTest = _.merge({}, initialState, { allUsersMap: { [loggedInUserId] : currentUser }, loggedInUserId: loggedInUserId });

        let expectedActions = [
          { type: 'UPDATE_USER_REQUEST', payload: { userId: loggedInUserId, updatingUser: updatingUser} },
          { type: 'UPDATE_USER_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'}} }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore({ blip : initialStateForTest });
        store.dispatch(async.updateClinicianProfile(api, formValues));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_UPDATING_USER });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.put.calledWith(userUpdates)).to.be.true;
      });
    });

    describe('requestPasswordReset', () => {
      it('should trigger REQUEST_PASSWORD_RESET_SUCCESS and it should call requestPasswordReset once for a successful request', () => {
        const email = 'foo@bar.com';
        let api = {
          user: {
            requestPasswordReset: sinon.stub().callsArgWith(1, null)
          }
        };

        let expectedActions = [
          { type: 'REQUEST_PASSWORD_RESET_REQUEST' },
          { type: 'REQUEST_PASSWORD_RESET_SUCCESS' }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.requestPasswordReset(api, email));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.requestPasswordReset.calledWith(email)).to.be.true;
      });

      it('should trigger REQUEST_PASSWORD_RESET_FAILURE and it should call requestPasswordReset once for a failed request', () => {
        const email = 'foo@bar.com';
        let api = {
          user: {
            requestPasswordReset: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_REQUESTING_PASSWORD_RESET);
        err.status = 500;

        let expectedActions = [
          { type: 'REQUEST_PASSWORD_RESET_REQUEST' },
          { type: 'REQUEST_PASSWORD_RESET_FAILURE', error: err, meta: {apiError: {status: 500, body: 'Error!'}} }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.requestPasswordReset(api, email));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_REQUESTING_PASSWORD_RESET });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.requestPasswordReset.calledWith(email)).to.be.true;
      });
    });

    describe('confirmPasswordReset', () => {
      it('should trigger CONFIRM_PASSWORD_RESET_SUCCESS and it should call confirmPasswordReset once for a successful requestPasswordReset', () => {
        const payload = {};
        let api = {
          user: {
            confirmPasswordReset: sinon.stub().callsArgWith(1, null)
          }
        };

        let expectedActions = [
          { type: 'CONFIRM_PASSWORD_RESET_REQUEST' },
          { type: 'CONFIRM_PASSWORD_RESET_SUCCESS' }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.confirmPasswordReset(api, payload));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.confirmPasswordReset.calledWith(payload)).to.be.true;
      });

      it('should trigger CONFIRM_PASSWORD_RESET_FAILURE and it should call confirmPasswordReset once for a failed requestPasswordReset', () => {
        const payload = {};
        let api = {
          user: {
            confirmPasswordReset: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
          }
        };

        let err = new Error(ErrorMessages.ERR_CONFIRMING_PASSWORD_RESET);
        err.status = 500;

        let expectedActions = [
          { type: 'CONFIRM_PASSWORD_RESET_REQUEST' },
          { type: 'CONFIRM_PASSWORD_RESET_FAILURE', error: err, meta: {apiError: {status: 500, body: 'Error!'}} }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.confirmPasswordReset(api, payload));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CONFIRMING_PASSWORD_RESET });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.confirmPasswordReset.calledWith(payload)).to.be.true;
      });
    });

    describe('logError', () => {
      it('should trigger LOG_ERROR_SUCCESS and it should call error once for a successful request', () => {
        let error = 'Error';
        let message = 'Some random detailed error message!';
        let props = {
          stacktrace: true
        };

        let api = {
          errors: {
            log: sinon.stub().callsArgWith(3, null)
          }

        };

        let expectedActions = [
          { type: 'LOG_ERROR_REQUEST' },
          { type: 'LOG_ERROR_SUCCESS' }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.logError(api, error, message, props));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.errors.log.withArgs(error, message, props).callCount).to.equal(1);
      });
    });

    describe('fetchUser', () => {
      it('should trigger FETCH_USER_SUCCESS and it should call get once for a successful request', () => {
        let user = { emailVerified: true, username: 'frankie@gmaz.com', id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_SUCCESS', payload: { user : user } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchUser(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.get.callCount).to.equal(1);
      });

      it('should trigger FETCH_USER_SUCCESS and it should call user.get and patient.get once for a successful request', () => {
        let user = { emailVerified: true, username: 'frankie@gmaz.com', id: 306, name: 'Frankie Boyle', profile: { patient: true } };
        let patient = { foo: 'bar' };
        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, null, user)
          },
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_SUCCESS', payload: { user : _.merge({}, user, patient) } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchUser(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.get.callCount).to.equal(1);
        expect(api.patient.get.callCount).to.equal(1);
      });

      it('should trigger FETCH_USER_FAILURE and it should call error once for a request for user that has not verified email', () => {
        let user = { emailVerified: false, username: 'frankie@gmaz.com', id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_FAILURE', error: new Error(ErrorMessages.ERR_EMAIL_NOT_VERIFIED), meta: { apiError: null } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.fetchUser(api));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_EMAIL_NOT_VERIFIED });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.get.callCount).to.equal(1);
      });


      it('[401] should trigger FETCH_USER_FAILURE and it should call error once for a failed request', () => {
        let user = { id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, { status: 401 }, null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_FAILURE', error: null, meta: { apiError: { status: 401 } } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchUser(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.get.callCount).to.equal(1);
      });

      it('[500] should trigger FETCH_USER_FAILURE and it should call error once for a failed request', () => {
        let user = { id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_USER);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchUser(api));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_USER });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.get.callCount).to.equal(1);
      });
    });

    describe('fetchPendingSentInvites', () => {
      it('should trigger FETCH_PENDING_SENT_INVITES_SUCCESS and it should call error once for a successful request', () => {
        let pendingSentInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getSent: sinon.stub().callsArgWith(0, null, pendingSentInvites)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_SENT_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_SENT_INVITES_SUCCESS', payload: { pendingSentInvites : pendingSentInvites } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchPendingSentInvites(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.getSent.callCount).to.equal(1);
      });

      it('should trigger FETCH_PENDING_SENT_INVITES_FAILURE and it should call error once for a failed request', () => {
        let pendingSentInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getSent: sinon.stub().callsArgWith(0, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_PENDING_SENT_INVITES);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_PENDING_SENT_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_SENT_INVITES_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchPendingSentInvites(api));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_PENDING_SENT_INVITES });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.getSent.callCount).to.equal(1);
      });
    });

    describe('fetchPendingReceivedInvites', () => {
      it('should trigger FETCH_PENDING_RECEIVED_INVITES_SUCCESS and it should call error once for a successful request', () => {
        let pendingReceivedInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getReceived: sinon.stub().callsArgWith(0, null, pendingReceivedInvites)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_RECEIVED_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_RECEIVED_INVITES_SUCCESS', payload: { pendingReceivedInvites : pendingReceivedInvites } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchPendingReceivedInvites(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.getReceived.callCount).to.equal(1);
      });

      it('should trigger FETCH_PENDING_RECEIVED_INVITES_FAILURE and it should call error once for a failed request', () => {
        let pendingReceivedInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getReceived: sinon.stub().callsArgWith(0, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_PENDING_RECEIVED_INVITES);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_PENDING_RECEIVED_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_RECEIVED_INVITES_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchPendingReceivedInvites(api));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_PENDING_RECEIVED_INVITES });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.getReceived.callCount).to.equal(1);
      });
    });

    describe('fetchPatient', () => {
      it('should trigger FETCH_PATIENT_SUCCESS and it should call error once for a successful request', () => {
        let patient = { id: 58686, name: 'Buddy Holly', age: 65 };

        let api = {
          patient: {
            get: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_SUCCESS', payload: { patient : patient } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore({ blip: initialState });
        store.dispatch(async.fetchPatient(api, 58686));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.patient.get.withArgs(58686).callCount).to.equal(1);
      });

      it('[500] should trigger FETCH_PATIENT_FAILURE and it should call error once for a failed request', () => {
        let patient = { id: 58686, name: 'Buddy Holly', age: 65 };

        let api = {
          patient: {
            get: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_PATIENT);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_FAILURE', error: err, payload: {link: null}, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore({ blip: initialState });
        store.dispatch(async.fetchPatient(api, 58686));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_PATIENT });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.patient.get.withArgs(58686).callCount).to.equal(1);
      });

      it('[404] should trigger FETCH_PATIENT_FAILURE and it should call error once for a failed request', () => {
        let patient = { id: 58686, name: 'Buddy Holly', age: 65 };
        let thisInitialState = Object.assign(initialState, {loggedInUserId: 58686});

        let api = {
          patient: {
            get: sinon.stub().callsArgWith(1, {status: 404, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_YOUR_ACCOUNT_NOT_CONFIGURED);
        err.status = 404;

        let expectedActions = [
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_FAILURE', error: err, payload: {link: {to: '/patients/new', text: UserMessages.YOUR_ACCOUNT_DATA_SETUP}}, meta: { apiError: {status: 404, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore({ blip: thisInitialState });
        store.dispatch(async.fetchPatient(api, 58686));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_YOUR_ACCOUNT_NOT_CONFIGURED });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.patient.get.withArgs(58686).callCount).to.equal(1);
      });
    });

    describe('fetchPatients', () => {
      it('should trigger FETCH_PATIENTS_SUCCESS and it should call error once for a successful request', () => {
        let patients = [
          { id: 58686, name: 'Buddy Holly', age: 65 }
        ]

        let api = {
          patient: {
            getAll: sinon.stub().callsArgWith(0, null, patients)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENTS_REQUEST' },
          { type: 'FETCH_PATIENTS_SUCCESS', payload: { patients : patients } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchPatients(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.patient.getAll.callCount).to.equal(1);
      });

      it('should trigger FETCH_PATIENTS_FAILURE and it should call error once for a failed request', () => {
        let patients = [
          { id: 58686, name: 'Buddy Holly', age: 65 }
        ]

        let api = {
          patient: {
            getAll: sinon.stub().callsArgWith(0, {status: 500, body: {status: 500, body: 'Error!'}}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_PATIENTS);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_PATIENTS_REQUEST' },
          { type: 'FETCH_PATIENTS_FAILURE', error: err, meta: { apiError: {status: 500, body: {status: 500, body: 'Error!'}} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchPatients(api));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_PATIENTS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.patient.getAll.callCount).to.equal(1);
      });
    });

    describe('fetchPatientData', () => {
      const patientId = 300;
      const serverTime = '2018-01-28T00:00:11.000Z';
      const serverTimePlusOneDay = moment.utc(serverTime).add(1, 'days').toISOString();

      const latestPumpSettings = { uploadId: 'abc123', time: '2017-11-15T00:00:00.000Z', type: 'pumpSettings' };
      const latestUpload = { uploadId: 'abc123', time: '2017-11-01T00:00:00.000Z', type: 'upload' };

      const diabetesDataRangeSufficient = {
        spanInDays: 30,
        start: '2018-01-01T00:00:00.000Z',
        end: '2018-01-30T00:00:00.000Z',
      };

      const diabetesDataRangeInsufficient = {
        spanInDays: 29,
        start: '2018-01-01T00:00:00.000Z',
        end: '2018-01-29T00:00:00.000Z',
      };

      const diabetesDataMissing = {
        spanInDays: null,
        start: undefined,
        end: undefined,
      };

      const latestPumpSettingsSufficient = {
        latestPumpSettings,
        uploadRecord: latestUpload,
      };

      const latestPumpSettingsMissing = {
        latestPumpSettings: undefined,
        uploadRecord: undefined,
      };

      const latestPumpSettingsMissingUpload = {
        latestPumpSettings,
        uploadRecord: undefined,
      };

      let options;
      let patientData;
      let teamNotes;
      let api;

      beforeEach(() => {
        options = {
          startDate: '2018-01-01T00:00:00.000Z',
          endDate: '2018-01-30T00:00:00.000Z',
          useCache: true,
          initial: true,
        };

        patientData = [
          { id: 25, value: 540.4, type: 'smbg', time: '2018-01-01T00:00:00.000Z' },
          { id: 26, value: 30.8, type: 'smbg', time: '2018-01-30T00:00:00.000Z' },
        ];

        teamNotes = [
          { id: 28, note: 'foo' }
        ];

        api = {
          patientData: {
            get: sinon.stub().callsArgWith(2, null, patientData),
          },
          server: {
            getTime: sinon.stub().callsArgWith(0, null, { data: { time: serverTime } }),
          },
          team: {
            getNotes: sinon.stub().callsArgWith(2, null, teamNotes)
          },
        };

        async.__Rewire__('utils', {
          getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeSufficient),
          getLatestPumpSettings: sinon.stub().returns(latestPumpSettingsSufficient),
        });
      });

      context('initial data fetch', () => {
        context('enough data returned', () => {
          it('should trigger FETCH_PATIENT_DATA_REQUEST once for a successful request when enough data is returned', () => {
            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              {
                type: 'FETCH_SERVER_TIME_SUCCESS',
                payload: { serverTime },
              },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData: patientData,
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: '2017-12-03T00:00:00.000Z'
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore({ blip: initialState });
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions).to.eql(expectedActions);
            expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
            sinon.assert.calledOnce(async.__get__('utils').getDiabetesDataRange);
          });
        });

        context('not enough data returned', () => {
          it('should trigger FETCH_PATIENT_DATA_REQUEST twice for a successful request when not enough data is returned on first call', () => {
            async.__Rewire__('utils', {
              getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeInsufficient),
              getLatestPumpSettings: sinon.stub().returns(latestPumpSettingsSufficient),
            });

            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              {
                type: 'FETCH_SERVER_TIME_SUCCESS',
                payload: { serverTime },
              },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData: patientData,
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: '2017-12-30T00:00:00.000Z'
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore({ blip: initialState });
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions).to.eql(expectedActions);

            expect(api.patientData.get.withArgs(patientId).callCount).to.equal(2);
            expect(api.patientData.get.firstCall.args[1]).to.eql(options);

            expect(api.patientData.get.secondCall.args[1]).to.eql(_.assign({}, options, {
              startDate: '2017-12-30T00:00:00.000Z',
              endDate: serverTimePlusOneDay,
              initial: false,
            }));

            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(2);
            expect(api.team.getNotes.firstCall.args[1]).to.eql(_.assign({}, options, {
              start: options.startDate,
              end: options.endDate,
            }));
            expect(api.team.getNotes.secondCall.args[1]).to.eql(_.assign({}, options, {
              startDate: '2017-12-30T00:00:00.000Z',
              endDate: serverTimePlusOneDay,
              start: '2017-12-30T00:00:00.000Z',
              end: serverTimePlusOneDay,
              initial: false,
            }));

            sinon.assert.calledOnce(async.__get__('utils').getDiabetesDataRange);
          });

          it('should trigger FETCH_PATIENT_DATA_REQUEST twice for a successful request when no data is returned on first call', () => {
            async.__Rewire__('utils', {
              getDiabetesDataRange: sinon.stub().returns(diabetesDataMissing),
              getLatestPumpSettings: sinon.stub().returns(latestPumpSettingsSufficient),
            });

            api.patientData = {
              get: sinon.stub().callsArgWith(2, null, []),
            };

            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              {
                type: 'FETCH_SERVER_TIME_SUCCESS',
                payload: { serverTime },
              },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData: [],
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: null,
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore({ blip: initialState });
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions).to.eql(expectedActions);

            expect(api.patientData.get.withArgs(patientId).callCount).to.equal(2);
            expect(api.patientData.get.firstCall.args[1]).to.eql(options);
            expect(api.patientData.get.secondCall.args[1]).to.eql(_.assign({}, options, {
              startDate: null, // should fetch to the beginning by not specifying a start date
              endDate: serverTimePlusOneDay,
              initial: false,
            }));

            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(2);
            expect(api.team.getNotes.firstCall.args[1]).to.eql(_.assign({}, options, {
              start: options.startDate,
              end: options.endDate,
            }));
            expect(api.team.getNotes.secondCall.args[1]).to.eql(_.assign({}, options, {
              startDate: null,
              endDate: serverTimePlusOneDay,
              start: null,
              end: serverTimePlusOneDay,
              initial: false,
            }));
          });
        });

        context('server time fetch fails', () => {
          it('should trigger FETCH_SERVER_TIME_FAILURE and when unable to fetch the server time, but continue on with fetching patientData', () => {
            options = _.assign({}, options, {
              browserTimeStub: '2018-01-28T00:01:00.000Z',
            });

            api.server = {
              getTime: sinon.stub().callsArgWith(0, {status: 500, body: 'Error!'}, null)
            };

            let err = new Error(ErrorMessages.ERR_FETCHING_SERVER_TIME);
            err.status = 500;

            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              { type: 'FETCH_SERVER_TIME_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData,
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: '2017-12-03T00:00:00.000Z',
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore(initialState);
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_SERVER_TIME });
            expectedActions[1].error = actions[1].error;
            expect(actions).to.eql(expectedActions);
            expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
          });
        });

        context('missing pump settings', () => {
          it('should trigger FETCH_PATIENT_DATA_REQUEST only twice if the upload record is present after fetching pump settings', () => {
            async.__Rewire__('utils', {
              getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeSufficient),
              getLatestPumpSettings: sinon.stub()
                .onFirstCall().returns(latestPumpSettingsMissing)
                .onSecondCall().returns(latestPumpSettingsSufficient)
            });

            api.patientData.get= sinon.stub()
              .onFirstCall().callsArgWith(2, null, patientData)
              .onSecondCall().callsArgWith(2, null, [latestPumpSettings]);

            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              {
                type: 'FETCH_SERVER_TIME_SUCCESS',
                payload: { serverTime },
              },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData: patientData.concat(latestPumpSettings),
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: '2017-12-03T00:00:00.000Z'
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore({ blip: initialState });
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions).to.eql(expectedActions);
            expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
            sinon.assert.calledOnce(async.__get__('utils').getDiabetesDataRange);
          });

          it('should trigger FETCH_PATIENT_DATA_REQUEST three times if the upload record is missing after fetching pump settings', () => {
            async.__Rewire__('utils', {
              getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeSufficient),
              getLatestPumpSettings: sinon.stub()
                .onFirstCall().returns(latestPumpSettingsMissing)
                .onSecondCall().returns(latestPumpSettingsMissingUpload),
            });

            api.patientData.get= sinon.stub()
              .onFirstCall().callsArgWith(2, null, patientData)
              .onSecondCall().callsArgWith(2, null, [latestPumpSettings])
              .onThirdCall().callsArgWith(2, null, [latestUpload]);

            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              {
                type: 'FETCH_SERVER_TIME_SUCCESS',
                payload: { serverTime },
              },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData: patientData.concat(latestPumpSettings).concat(latestUpload),
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: '2017-12-03T00:00:00.000Z'
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore({ blip: initialState });
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions).to.eql(expectedActions);
            expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
            sinon.assert.calledOnce(async.__get__('utils').getDiabetesDataRange);
          });
        });

        context('missing pump settings upload record', () => {
          it('should trigger FETCH_PATIENT_DATA_REQUEST twice if an upload record is present after fetching', () => {
            async.__Rewire__('utils', {
              getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeSufficient),
              getLatestPumpSettings: sinon.stub()
                .onFirstCall().returns(latestPumpSettingsMissingUpload)
                .onSecondCall().returns(latestPumpSettingsSufficient)
            });

            api.patientData.get= sinon.stub()
              .onFirstCall().callsArgWith(2, null, patientData.concat(latestPumpSettings))
              .onSecondCall().callsArgWith(2, null, [latestUpload]);

            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              {
                type: 'FETCH_SERVER_TIME_SUCCESS',
                payload: { serverTime },
              },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData: patientData.concat(latestPumpSettings).concat(latestUpload),
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: '2017-12-03T00:00:00.000Z'
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore({ blip: initialState });
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions).to.eql(expectedActions);
            expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
            sinon.assert.calledOnce(async.__get__('utils').getDiabetesDataRange);
          });

          it('should trigger FETCH_PATIENT_DATA_REQUEST twice if an upload record is missing after fetching, but still dispatch success', () => {
            async.__Rewire__('utils', {
              getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeSufficient),
              getLatestPumpSettings: sinon.stub()
                .onFirstCall().returns(latestPumpSettingsMissingUpload)
                .onSecondCall().returns(latestPumpSettingsSufficient)
            });

            api.patientData.get= sinon.stub()
              .onFirstCall().callsArgWith(2, null, patientData.concat(latestPumpSettings))
              .onSecondCall().callsArgWith(2, null, []); // no upload found -- oh well we tried

            let expectedActions = [
              { type: 'FETCH_SERVER_TIME_REQUEST' },
              {
                type: 'FETCH_SERVER_TIME_SUCCESS',
                payload: { serverTime },
              },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              { type: 'FETCH_PATIENT_DATA_REQUEST' },
              {
                type: 'FETCH_PATIENT_DATA_SUCCESS',
                payload: {
                  patientData: patientData.concat(latestPumpSettings),
                  patientNotes: teamNotes,
                  patientId: patientId,
                  fetchedUntil: '2017-12-03T00:00:00.000Z'
                },
              },
            ];
            _.each(expectedActions, (action) => {
              expect(isTSA(action)).to.be.true;
            });

            let store = mockStore({ blip: initialState });
            store.dispatch(async.fetchPatientData(api, options, patientId));

            const actions = store.getActions();
            expect(actions).to.eql(expectedActions);
            expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
            expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
            sinon.assert.calledOnce(async.__get__('utils').getDiabetesDataRange);
          });
        });
      });

      context('subsequent data fetch', () => {
        it('should not consider the data range and trigger FETCH_PATIENT_DATA_REQUEST only once', () => {
          options = _.assign({}, options, {
            initial: false,
          });

          let expectedActions = [
            { type: 'FETCH_PATIENT_DATA_REQUEST' },
            {
              type: 'FETCH_PATIENT_DATA_SUCCESS',
              payload: {
                patientData: patientData,
                patientNotes: teamNotes,
                patientId: patientId,
                fetchedUntil: '2018-01-01T00:00:00.000Z'
              },
            },
          ];
          _.each(expectedActions, (action) => {
            expect(isTSA(action)).to.be.true;
          });

          let store = mockStore({ blip: initialState });
          store.dispatch(async.fetchPatientData(api, options, patientId));

          const actions = store.getActions();
          expect(actions).to.eql(expectedActions);
          expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
          expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
          sinon.assert.notCalled(async.__get__('utils').getDiabetesDataRange);
        });
      });

      context('handleFetchErrors', () => {
        it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call error once for a failed request due to patient data call returning error', () => {
          api.patientData = {
            get: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'}, null),
          };

          let err = new Error(ErrorMessages.ERR_FETCHING_PATIENT_DATA);
          err.status = 500;

          let expectedActions = [
            { type: 'FETCH_SERVER_TIME_REQUEST' },
            {
              type: 'FETCH_SERVER_TIME_SUCCESS',
              payload: { serverTime },
            },
            { type: 'FETCH_PATIENT_DATA_REQUEST' },
            { type: 'FETCH_PATIENT_DATA_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
          ];
          _.each(expectedActions, (action) => {
            expect(isTSA(action)).to.be.true;
          });
          let store = mockStore({ blip: initialState });
          store.dispatch(async.fetchPatientData(api, options, patientId));

          const actions = store.getActions();
          expect(actions[3].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_PATIENT_DATA });
          expectedActions[3].error = actions[3].error;
          expect(actions).to.eql(expectedActions);
          expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
          expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
        });

        it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call error once for a failed request due to latest pump settings call returning error', () => {
          async.__Rewire__('utils', {
            getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeSufficient),
            getLatestPumpSettings: sinon.stub().returns(latestPumpSettingsMissing),
          });

          api.patientData = {
            get: sinon.stub(),
          };

          api.patientData.get
            .onFirstCall().callsArgWith(2, null, [])
            .onSecondCall().callsArgWith(2, {status: 500, body: 'Error!'}, null);

          let err = new Error(ErrorMessages.ERR_FETCHING_PATIENT_DATA);
          err.status = 500;

          let expectedActions = [
            { type: 'FETCH_SERVER_TIME_REQUEST' },
            {
              type: 'FETCH_SERVER_TIME_SUCCESS',
              payload: { serverTime },
            },
            { type: 'FETCH_PATIENT_DATA_REQUEST' },
            { type: 'FETCH_PATIENT_DATA_REQUEST' },
            { type: 'FETCH_PATIENT_DATA_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
          ];
          _.each(expectedActions, (action) => {
            expect(isTSA(action)).to.be.true;
          });
          let store = mockStore({ blip: initialState });
          store.dispatch(async.fetchPatientData(api, options, patientId));

          const actions = store.getActions();
          expect(actions[4].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_LATEST_PUMP_SETTINGS });
          expectedActions[4].error = actions[4].error;
          expect(actions).to.eql(expectedActions);
          expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
          expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
        });

        it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call error once for a failed request due to latest pump settings upload call returning error', () => {
          async.__Rewire__('utils', {
            getDiabetesDataRange: sinon.stub().returns(diabetesDataRangeSufficient),
            getLatestPumpSettings: sinon.stub().returns(latestPumpSettingsMissingUpload),
          });

          api.patientData = {
            get: sinon.stub()
              .onFirstCall().callsArgWith(2, null, [])
              .onSecondCall().callsArgWith(2, {status: 500, body: 'Error!'}, null),
          };

          let err = new Error(ErrorMessages.ERR_FETCHING_PATIENT_DATA);
          err.status = 500;

          let expectedActions = [
            { type: 'FETCH_SERVER_TIME_REQUEST' },
            {
              type: 'FETCH_SERVER_TIME_SUCCESS',
              payload: { serverTime },
            },
            { type: 'FETCH_PATIENT_DATA_REQUEST' },
            { type: 'FETCH_PATIENT_DATA_REQUEST' },
            { type: 'FETCH_PATIENT_DATA_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
          ];
          _.each(expectedActions, (action) => {
            expect(isTSA(action)).to.be.true;
          });
          let store = mockStore({ blip: initialState });
          store.dispatch(async.fetchPatientData(api, options, patientId));

          const actions = store.getActions();
          expect(actions[4].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_LATEST_PUMP_SETTINGS_UPLOAD });
          expectedActions[4].error = actions[4].error;
          expect(actions).to.eql(expectedActions);
          expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
          expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
        });

        it('should trigger FETCH_MESSAGE_THREAD_FAILURE and it should call error once for a failed request due to team notes call returning error', () => {
          api.team = {
            getNotes: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'}, null)
          };

          let err = new Error(ErrorMessages.ERR_FETCHING_MESSAGE_THREAD);
          err.status = 500;

          let expectedActions = [
            { type: 'FETCH_SERVER_TIME_REQUEST' },
            {
              type: 'FETCH_SERVER_TIME_SUCCESS',
              payload: { serverTime },
            },
            { type: 'FETCH_PATIENT_DATA_REQUEST' },
            { type: 'FETCH_MESSAGE_THREAD_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
          ];
          _.each(expectedActions, (action) => {
            expect(isTSA(action)).to.be.true;
          });

          let store = mockStore(initialState);
          store.dispatch(async.fetchPatientData(api, options, patientId));

          const actions = store.getActions();
          expect(actions[3].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_MESSAGE_THREAD });
          expectedActions[3].error = actions[3].error;
          expect(actions).to.eql(expectedActions);
          expect(api.patientData.get.withArgs(patientId, options).callCount).to.equal(1);
          expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
        });
      });
    });

    describe('fetchSettings', () => {
      it('should trigger FETCH_SETTINGS_SUCCESS and it should call fetchSettings once for a successful request', () => {
        let patientId = 1234;
        let settings = { siteChangeSource: 'cannulaPrime' };
        let api = {
          metadata: {
            settings: {
              get: sinon.stub().callsArgWith(1, null, settings)
            }
          }
        };

        let expectedActions = [
          { type: 'FETCH_SETTINGS_REQUEST' },
          { type: 'FETCH_SETTINGS_SUCCESS', payload: { settings: settings } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchSettings(api, patientId));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.metadata.settings.get.calledWith(patientId)).to.be.true;
      });

      it('should trigger FETCH_SETTINGS_FAILURE and it should call fetchSettings once for a failed request', () => {
        let patientId = 1234;
        let api = {
          metadata: {
            settings: {
              get: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
            }
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_SETTINGS);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_SETTINGS_REQUEST' },
          { type: 'FETCH_SETTINGS_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.fetchSettings(api, patientId));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_SETTINGS });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.metadata.settings.get.calledWith(patientId)).to.be.true;
      });
    });


    describe('fetchMessageThread', () => {
      it('should trigger FETCH_MESSAGE_THREAD_SUCCESS and it should call error once for a successful request', () => {
        let messageThread = [
          { message: 'Foobar' }
        ]

        let api = {
          team: {
            getMessageThread: sinon.stub().callsArgWith(1, null, messageThread)
          }
        };

        let expectedActions = [
          { type: 'FETCH_MESSAGE_THREAD_REQUEST' },
          { type: 'FETCH_MESSAGE_THREAD_SUCCESS', payload: { messageThread : messageThread } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.fetchMessageThread(api, 300));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.team.getMessageThread.withArgs(300).callCount).to.equal(1);
      });

      it('should trigger FETCH_MESSAGE_THREAD_FAILURE and it should call error once for a failed request', () => {
        let messageThread = [
          { message: 'Foobar' }
        ]

        let api = {
          team: {
            getMessageThread: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_MESSAGE_THREAD);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_MESSAGE_THREAD_REQUEST' },
          { type: 'FETCH_MESSAGE_THREAD_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchMessageThread(api, 400));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_MESSAGE_THREAD });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.team.getMessageThread.withArgs(400).callCount).to.equal(1);
      });
    });

    describe('fetchDataSources', () => {
      it('should trigger FETCH_DATA_SOURCES_SUCCESS and it should call error once for a successful request', () => {
        let dataSources = [
          { id: 'strava' },
          { id: 'fitbit' },
        ];

        let api = {
          user: {
            getDataSources: sinon.stub().callsArgWith(0, null, dataSources)
          }
        };

        let expectedActions = [
          { type: 'FETCH_DATA_SOURCES_REQUEST' },
          { type: 'FETCH_DATA_SOURCES_SUCCESS', payload: { dataSources : dataSources } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.fetchDataSources(api));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.getDataSources.callCount).to.equal(1);
      });

      it('should trigger FETCH_DATA_SOURCES_FAILURE and it should call error once for a failed request', () => {
        let api = {
          user: {
            getDataSources: sinon.stub().callsArgWith(0, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_DATA_SOURCES);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_DATA_SOURCES_REQUEST' },
          { type: 'FETCH_DATA_SOURCES_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.fetchDataSources(api));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_FETCHING_DATA_SOURCES });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.getDataSources.callCount).to.equal(1);
      });
    });

    describe('connectDataSource', () => {
      it('should trigger CONNECT_DATA_SOURCE_SUCCESS and it should call error once for a successful request', () => {
        let restrictedToken = { id: 'blah.blah.blah'};
        let url = 'fitbit.url';
        let api = {
          user: {
            createRestrictedToken: sinon.stub().callsArgWith(1, null, restrictedToken),
            createOAuthProviderAuthorization: sinon.stub().callsArgWith(2, null, url),
          }
        };

        let expectedActions = [
          { type: 'CONNECT_DATA_SOURCE_REQUEST' },
          { type: 'CONNECT_DATA_SOURCE_SUCCESS', payload: {
            authorizedDataSource : { id: 'fitbit', url: url}}
          }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.connectDataSource(api, 'fitbit', { path: [ '/v1/oauth/fitbit' ] }, { providerType: 'oauth', providerName: 'fitbit' }));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.createRestrictedToken.withArgs({ path: [ '/v1/oauth/fitbit' ] }).callCount).to.equal(1);
        expect(api.user.createOAuthProviderAuthorization.withArgs('fitbit', restrictedToken.id).callCount).to.equal(1);
      });

      it('should trigger CONNECT_DATA_SOURCE_FAILURE and it should call error once for an unexpected provider type', () => {
        let api = {
          user: {
            createRestrictedToken: sinon.stub(),
            createOAuthProviderAuthorization: sinon.stub(),
          }
        };

        let err = new Error(ErrorMessages.ERR_CONNECTING_DATA_SOURCE);

        let expectedActions = [
          { type: 'CONNECT_DATA_SOURCE_REQUEST' },
          { type: 'CONNECT_DATA_SOURCE_FAILURE', error: err, meta: { apiError: 'Unknown data source type' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.connectDataSource(api, 'strava', { path: [ '/v1/oauth/strava' ] }, { providerType: 'unexpected', providerName: 'strava' }));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CONNECTING_DATA_SOURCE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.createRestrictedToken.callCount).to.equal(0);
        expect(api.user.createOAuthProviderAuthorization.callCount).to.equal(0);
      });

      it('should trigger CONNECT_DATA_SOURCE_FAILURE and it should call error once for a failed request', () => {
        let api = {
          user: {
            createRestrictedToken: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null),
            createOAuthProviderAuthorization: sinon.stub(),
          }
        };

        let err = new Error(ErrorMessages.ERR_CONNECTING_DATA_SOURCE);
        err.status = 500;

        let expectedActions = [
          { type: 'CONNECT_DATA_SOURCE_REQUEST' },
          { type: 'CONNECT_DATA_SOURCE_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.connectDataSource(api, 'strava', { path: [ '/v1/oauth/strava' ] }, { providerType: 'oauth', providerName: 'strava' }));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_CONNECTING_DATA_SOURCE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.createRestrictedToken.withArgs({ path: [ '/v1/oauth/strava' ] }).callCount).to.equal(1);
        expect(api.user.createOAuthProviderAuthorization.callCount).to.equal(0);
      });
    });

    describe('disconnectDataSource', () => {
      it('should trigger DISCONNECT_DATA_SOURCE_SUCCESS and it should call error once for a successful request', () => {
        let restrictedToken = { id: 'blah.blah.blah'};
        let api = {
          user: {
            deleteOAuthProviderAuthorization: sinon.stub().callsArgWith(1, null, restrictedToken),
          }
        };

        let expectedActions = [
          { type: 'DISCONNECT_DATA_SOURCE_REQUEST' },
          { type: 'DISCONNECT_DATA_SOURCE_SUCCESS', payload: {}}
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.disconnectDataSource(api, 'fitbit', { providerType: 'oauth', providerName: 'fitbit' }));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.user.deleteOAuthProviderAuthorization.withArgs('fitbit').callCount).to.equal(1);
      });

      it('should trigger DISCONNECT_DATA_SOURCE_FAILURE and it should call error once for an unexpected provider type', () => {
        let api = {
          user: {
            deleteOAuthProviderAuthorization: sinon.stub(),
          }
        };

        let err = new Error(ErrorMessages.ERR_DISCONNECTING_DATA_SOURCE);

        let expectedActions = [
          { type: 'DISCONNECT_DATA_SOURCE_REQUEST' },
          { type: 'DISCONNECT_DATA_SOURCE_FAILURE', error: err, meta: { apiError: 'Unknown data source type' } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.disconnectDataSource(api, 'strava', { providerType: 'unexpected', providerName: 'strava' }));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_DISCONNECTING_DATA_SOURCE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.deleteOAuthProviderAuthorization.callCount).to.equal(0);
      });

      it('should trigger DISCONNECT_DATA_SOURCE_FAILURE and it should call error once for a failed request', () => {
        let api = {
          user: {
            deleteOAuthProviderAuthorization: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null),
          }
        };

        let err = new Error(ErrorMessages.ERR_DISCONNECTING_DATA_SOURCE);
        err.status = 500;

        let expectedActions = [
          { type: 'DISCONNECT_DATA_SOURCE_REQUEST' },
          { type: 'DISCONNECT_DATA_SOURCE_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore(initialState);
        store.dispatch(async.disconnectDataSource(api, 'strava', { providerType: 'oauth', providerName: 'strava' }));

        const actions = store.getActions();
        expect(actions[1].error).to.deep.include({ message: ErrorMessages.ERR_DISCONNECTING_DATA_SOURCE });
        expectedActions[1].error = actions[1].error;
        expect(actions).to.eql(expectedActions);
        expect(api.user.deleteOAuthProviderAuthorization.withArgs('strava').callCount).to.equal(1);
      });
    });
  });
});
