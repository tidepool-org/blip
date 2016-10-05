/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global afterEach */

import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import trackingMiddleware from '../../../../app/redux/utils/trackingMiddleware';

import _ from 'lodash';

import isTSA from 'tidepool-standard-action';

import initialState from '../../../../app/redux/reducers/initialState';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';
import * as UserMessages from '../../../../app/redux/constants/usrMessages';

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
    async.__ResetDependency__('utils')
    trackMetric.reset();
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

        expect(actions).to.eql(expectedActions);
        expect(api.user.confirmSignUp.calledWith('fakeSignupKey')).to.be.true;
        expect(api.user.confirmSignUp.callCount).to.equal(1);
      });
    });

    describe('verifyCustodial', () => {
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
        let store = mockStore(initialState);
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

        let store = mockStore(initialState);
        store.dispatch(async.verifyCustodial(api, key, email, birthday, password));

        const actions = store.getActions();
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
        expect(actions).to.eql(expectedActions);
        expect(api.access.leaveGroup.calledWith(patientId)).to.be.true;
        expect(api.access.leaveGroup.callCount).to.equal(1)
      });
    });

    describe('removeMemberFromTargetCareTeam', () => {
      it('should trigger REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_SUCCESS and it should call removeMemberFromTargetCareTeam once for a successful request', () => {
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

        store.dispatch(async.removeMemberFromTargetCareTeam(api, patientId, memberId));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.access.removeMember.withArgs(memberId).callCount).to.equal(1);
        expect(api.patient.get.withArgs(patientId).callCount).to.equal(1);
      });

      it('should trigger REMOVE_MEMBER_FROM_TARGET_CARE_TEAM_FAILURE and it should call removeMemberFromTargetCareTeam once for a failed request', () => {
        let memberId = 27;
        let patientId = 420;
        let api = {
          access: {
            removeMember: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
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
        store.dispatch(async.removeMemberFromTargetCareTeam(api, patientId, memberId));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.access.removeMember.calledWith(memberId)).to.be.true;
      });
    });

    describe('sendInvite', () => {
      it('should trigger SEND_INVITE_SUCCESS and it should call sendInvite once for a successful request', () => {
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
        store.dispatch(async.sendInvite(api, email, permissions));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.send.calledWith(email, permissions)).to.be.true;
      });

      it('should trigger SEND_INVITE_FAILURE when invite has already been sent to the e-mail', () => {
        let email = 'a@b.com';
        let permissions = {
          view: true
        };
        let invitation = { foo: 'bar' };
        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, {status: 409, body: 'Error!'})
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
        store.dispatch(async.sendInvite(api, email, permissions));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.send.calledWith(email, permissions)).to.be.true;
      });

      it('should trigger SEND_INVITE_FAILURE and it should call sendInvite once for a failed request', () => {
        let email = 'a@b.com';
        let permissions = {
          view: true
        };
        let invitation = { foo: 'bar' };
        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, {status: 500, body: 'Error!'})
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
        store.dispatch(async.sendInvite(api, email, permissions));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.send.calledWith(email, permissions)).to.be.true;
      });
    });

    describe('cancelSentInvite', () => {
      it('should trigger CANCEL_SENT_INVITE_SUCCESS and it should call cancelSentInvite once for a successful request', () => {
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
        store.dispatch(async.cancelSentInvite(api, email));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.cancel.calledWith(email)).to.be.true;
      });

      it('should trigger CANCEL_SENT_INVITE_FAILURE and it should call cancelSentInvite once for a failed request', () => {
        let email = 'a@b.com';
        let api = {
          invitation: {
            cancel: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'})
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
        store.dispatch(async.cancelSentInvite(api, email));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.cancel.calledWith(email)).to.be.true;
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
        expect(actions).to.eql(expectedActions);
        expect(api.patient.put.calledWith(patient)).to.be.true;
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
        store.dispatch(async.updateUser(api, formValues));

        const actions = store.getActions();
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
        expect(actions).to.eql(expectedActions);
        expect(api.user.get.callCount).to.equal(1);
      });
    });

    describe('fetchPendingSentInvites', () => {
      it('should trigger FETCH_PENDING_SENT_INVITES_SUCCESS and it should call getSent once for a successful request', () => {
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

      it('should trigger FETCH_PENDING_SENT_INVITES_FAILURE and it should call getSent once for a failed request', () => {
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
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.getSent.callCount).to.equal(1);
      });
    });

    describe('fetchPendingReceivedInvites', () => {
      it('should trigger FETCH_PENDING_RECEIVED_INVITES_SUCCESS and it should call getReceived once for a successful request', () => {
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

      it('should trigger FETCH_PENDING_RECEIVED_INVITES_FAILURE and it should call getReceived once for a failed request', () => {
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
        expect(actions).to.eql(expectedActions);
        expect(api.invitation.getReceived.callCount).to.equal(1);
      });
    });

    describe('fetchPatient', () => {
      it('should trigger FETCH_PATIENT_SUCCESS and it should call get once for a successful request', () => {
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

      it('[500] should trigger FETCH_PATIENT_FAILURE and it should call get once for a failed request', () => {
        let patient = { id: 58686, name: 'Buddy Holly', age: 65 };

        let api = {
          patient: {
            get: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_MESSAGE_THREAD);
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
        expect(actions).to.eql(expectedActions);
        expect(api.patient.get.withArgs(58686).callCount).to.equal(1);
      });

      it('[404] should trigger FETCH_PATIENT_FAILURE and it should call get once for a failed request', () => {
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
        expect(actions).to.eql(expectedActions);
        expect(api.patient.get.withArgs(58686).callCount).to.equal(1);
      });
    });

    describe('fetchPatients', () => {
      it('should trigger FETCH_PATIENTS_SUCCESS and it should call getAll once for a successful request', () => {
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

      it('should trigger FETCH_PATIENTS_FAILURE and it should call getAll once for a failed request', () => {
        let patients = [
          { id: 58686, name: 'Buddy Holly', age: 65 }
        ]

        let api = {
          patient: {
            getAll: sinon.stub().callsArgWith(0, {status: 500, body: {status: 500, body: 'Error!'}}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_MESSAGE_THREAD);
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
        expect(actions).to.eql(expectedActions);
        expect(api.patient.getAll.callCount).to.equal(1);
      });
    });

    describe('fetchPatientData', () => {
      it('should trigger two WORKER_PROCESS_DATA_REQUESTs and then FETCH_PATIENT_DATA_SUCCESS and it should call patientData.get and getNotes once each for a successful request', () => {
        const timePrefs = {
          timezoneAware: true,
          timezoneName: 'US/Pacific'
        }
        async.__Rewire__('utils', {
          getTimezoneForDataProcessing: sinon.stub().returns(timePrefs),
          processPatientData: sinon.stub().returnsArg(0)
        });

        let patientId = 300;

        let patientData = [
          { id: 25, value: 540.4 }
        ];

        let teamNotes = [
          { id: 25, note: 'foo' }
        ];

        let api = {
          patientData: {
            get: sinon.stub().callsArgWith(1, null, patientData),
          },
          team: {
            getNotes: sinon.stub().callsArgWith(1, null, teamNotes)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENT_DATA_REQUEST', meta: { WebWorker: true } },
          { type: 'WORKER_PROCESS_DATA_REQUEST', payload: { data: [], timePrefs: timePrefs, userId: patientId  }, meta: { WebWorker: true } },
          { type: 'WORKER_PROCESS_DATA_REQUEST', payload: { data: [], timePrefs: timePrefs, userId: patientId  }, meta: { WebWorker: true } },
          { type: 'FETCH_PATIENT_DATA_SUCCESS', payload: { patientData : patientData, patientNotes: teamNotes, patientId: patientId } },
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore({ blip: initialState });
        store.dispatch(async.fetchPatientData(api, patientId));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.patientData.get.withArgs(patientId).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
      });

      it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call patientData.get and getNotes once each for a failed request due to patient data call returning error', () => {
        async.__Rewire__('utils', {
          processPatientData: sinon.stub()
        });

        let patientId = 400;

        let patientData = [
          { id: 25, value: 540.4 }
        ];

        let teamNotes = [
          { id: 25, note: 'foo' }
        ];

        let api = {
          patientData: {
            get: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null),
          },
          team: {
            getNotes: sinon.stub().callsArgWith(1, null, teamNotes)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_MESSAGE_THREAD);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_PATIENT_DATA_REQUEST', meta: { WebWorker: true } },
          { type: 'FETCH_PATIENT_DATA_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });
        let store = mockStore({ blip: initialState });
        store.dispatch(async.fetchPatientData(api, patientId));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.patientData.get.withArgs(patientId).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
      });


      it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call patientData.get and getNotes once each for a failed request due to team notes call returning error', () => {
        async.__Rewire__('utils', {
          processPatientData: sinon.stub()
        });

        let patientId = 400;

        let patientData = [
          { id: 25, value: 540.4 }
        ];

        let teamNotes = [
          { id: 25, note: 'foo' }
        ];

        let api = {
          patientData: {
            get: sinon.stub().callsArgWith(1, null, patientData),
          },
          team: {
            getNotes: sinon.stub().callsArgWith(1, {status: 500, body: 'Error!'}, null)
          }
        };

        let err = new Error(ErrorMessages.ERR_FETCHING_PATIENT_DATA);
        err.status = 500;

        let expectedActions = [
          { type: 'FETCH_PATIENT_DATA_REQUEST', meta: { WebWorker: true } },
          { type: 'FETCH_PATIENT_DATA_FAILURE', error: err, meta: { apiError: {status: 500, body: 'Error!'} } }
        ];
        _.each(expectedActions, (action) => {
          expect(isTSA(action)).to.be.true;
        });

        let store = mockStore(initialState);
        store.dispatch(async.fetchPatientData(api, patientId));

        const actions = store.getActions();
        expect(actions).to.eql(expectedActions);
        expect(api.patientData.get.withArgs(patientId).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
      });
    });

    describe('fetchMessageThread', () => {
      it('should trigger FETCH_MESSAGE_THREAD_SUCCESS and it should call getMessageThread once for a successful request', () => {
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

      it('should trigger FETCH_MESSAGE_THREAD_FAILURE and it should call getMessageThread once for a failed request', () => {
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
        expect(actions).to.eql(expectedActions);
        expect(api.team.getMessageThread.withArgs(400).callCount).to.equal(1);
      });
    });
  });
});
