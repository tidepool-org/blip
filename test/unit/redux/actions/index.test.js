/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global afterEach */

import { isFSA } from 'flux-standard-action';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as sync from '../../../../app/redux/actions/sync';
import * as async from '../../../../app/redux/actions/async';

import initialState from '../../../../app/redux/reducers/initialState';

describe('Actions', () => {
  const mockStore = configureStore([thunk]);

  afterEach(function() {
    // very important to do this in an afterEach than in each test when __Rewire__ is used
    // if you try to reset within each test you'll make it impossible for tests to fail!
    async.__ResetDependency__('utils')
  })

  describe('Asyncronous Actions', () => {
    describe('signup', (done) => {
      it('should trigger SIGNUP_SUCCESS and it should call signup and get once for a successful request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, null, 'success!'),
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_SUCCESS', payload: { user: { id: 27 } } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.signup(api, {foo: 'bar'}));

        expect(api.user.signup.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(1);
      });

      it('should trigger SIGNUP_FAILURE and it should call signup once and get zero times for a failed signup request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, 'fail!', null),
            get: sinon.stub()
          }
        };

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_FAILURE', error: 'fail!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.signup(api, {foo: 'bar'}));

        expect(api.user.signup.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
      });

      it('should trigger SIGNUP_FAILURE and it should call signup and get once for a failed user retrieval', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, null, 'success!'),
            get: sinon.stub().callsArgWith(0, 'failed user retrieval!', null)
          }
        };

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_FAILURE', error: 'failed user retrieval!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.signup(api, {foo: 'bar'}));

        expect(api.user.signup.callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(1);
      });
    });

    describe('confirmSignup', () => {
      it('should trigger CONFIRM_SIGNUP_SUCCESS and it should call confirmSignup once for a successful request', (done) => {
        let user = { id: 27 };
        let api = {
          user: {
            confirmSignup: sinon.stub().callsArgWith(1, null)
          }
        };

        let expectedActions = [
          { type: 'CONFIRM_SIGNUP_REQUEST' },
          { type: 'CONFIRM_SIGNUP_SUCCESS' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.confirmSignup(api, 'fakeSignupKey'));

        expect(api.user.confirmSignup.calledWith('fakeSignupKey').callCount).to.equal(1);
      });

      it('should trigger CONFIRM_SIGNUP_FAILURE and it should call confirmSignup once for a failed request', (done) => {
        let user = { id: 27 };
        let api = {
          user: {
            confirmSignup: sinon.stub().callsArgWith(1, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'CONFIRM_SIGNUP_REQUEST' },
          { type: 'CONFIRM_SIGNUP_FAILURE', error: 'Failure!' }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.confirmSignup(api, 'fakeSignupKey'));

        expect(api.user.confirmSignup.calledWith('fakeSignupKey').callCount).to.equal(1);
      });
    });

    describe('login', () => {
      it('should trigger LOGIN_SUCCESS and it should call login and user.get once for a successful request', (done) => {
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
          { type: 'LOGIN_SUCCESS', payload: { user: user } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.login(api, creds));

        expect(api.user.login.calledWith(creds).callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(1);
      });

      it('should trigger LOGIN_FAILURE and it should call login once and user.get zero times for a failed login request', (done) => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, 'failed!'),
            get: sinon.stub()
          }
        };

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: 'failed!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.login(api, creds));

        expect(api.user.login.calledWith(creds).callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
      });

      it('should trigger LOGIN_FAILURE and it should call login and user.get once for a failed user.get request', (done) => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, null),
            get: sinon.stub().callsArgWith(0, 'failed!')
          }
        };

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: 'failed!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.login(api, creds));

        expect(api.user.login.calledWith(creds).callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(1);
      });
    });

    describe('logout', () => {
      it('should trigger LOGOUT_SUCCESS and it should call logout once for a successful request', (done) => {
        let api = {
          user: {
            logout: sinon.stub().callsArgWith(0, null)
          }
        };

        let expectedActions = [
          { type: 'LOGOUT_REQUEST' },
          { type: 'LOGOUT_SUCCESS' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.logout(api));

        expect(api.user.logout.callCount).to.equal(1);
      });

      it('should trigger LOGOUT_FAILURE and it should call logout once for a failed request', (done) => {
        let api = {
          user: {
            logout: sinon.stub().callsArgWith(0, 'this thing failed!')
          }
        };

        let expectedActions = [
          { type: 'LOGOUT_REQUEST' },
          { type: 'LOGOUT_FAILURE', error: 'this thing failed!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.logout(api));

        expect(api.user.logout.callCount).to.equal(1);
      });
    });

    describe('logError', () => {
      it('should trigger LOG_ERROR_SUCCESS and it should call error once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.logError(api, error, message, props));

        expect(api.errors.log.withArgs(error, message, props).callCount).to.equal(1);
      });

      it('should trigger LOG_ERROR_FAILURE and it should call error once for a failed request', (done) => {
        let error = 'Error';
        let message = 'Another random detailed error message!';
        let props = { 
          stacktrace: true
        };

        let api = {
          errors: {
            log: sinon.stub().callsArgWith(3, 'This totally messed up!')
          }
        };

        let expectedActions = [
          { type: 'LOG_ERROR_REQUEST' },
          { type: 'LOG_ERROR_FAILURE', error: 'This totally messed up!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.logError(api, error, message, props));

        expect(api.errors.log.withArgs(error, message, props).callCount).to.equal(1);
      });
    });

    describe('fetchUser', () => {
      it('should trigger FETCH_USER_SUCCESS and it should call error once for a successful request', (done) => {
        let user = { id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_SUCCESS', payload: { user : user } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchUser(api));

        expect(api.user.get.callCount).to.equal(1);
      });

      it('should trigger FETCH_USER_FAILURE and it should call error once for a failed request', (done) => {
        let user = { id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_FAILURE', error: 'Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchUser(api));

        expect(api.user.get.callCount).to.equal(1);
      });
    });

    describe('fetchPendingInvites', () => {
      it('should trigger FETCH_PENDING_INVITES_SUCCESS and it should call error once for a successful request', (done) => {
        let pendingInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getSent: sinon.stub().callsArgWith(0, null, pendingInvites)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_INVITES_SUCCESS', payload: { pendingInvites : pendingInvites } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingInvites(api));

        expect(api.invitation.getSent.callCount).to.equal(1);
      });

      it('should trigger FETCH_PENDING_INVITES_FAILURE and it should call error once for a failed request', (done) => {
        let pendingInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getSent: sinon.stub().callsArgWith(0, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_INVITES_FAILURE', error: 'Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingInvites(api));

        expect(api.invitation.getSent.callCount).to.equal(1);
      });
    });

    describe('fetchPendingMemberships', () => {
      it('should trigger FETCH_PENDING_MEMBERSHIPS_SUCCESS and it should call error once for a successful request', (done) => {
        let pendingMemberships = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getReceived: sinon.stub().callsArgWith(0, null, pendingMemberships)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_MEMBERSHIPS_REQUEST' },
          { type: 'FETCH_PENDING_MEMBERSHIPS_SUCCESS', payload: { pendingMemberships : pendingMemberships } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingMemberships(api));

        expect(api.invitation.getReceived.callCount).to.equal(1);
      });

      it('should trigger FETCH_PENDING_MEMBERSHIPS_FAILURE and it should call error once for a failed request', (done) => {
        let pendingMemberships = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getReceived: sinon.stub().callsArgWith(0, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_MEMBERSHIPS_REQUEST' },
          { type: 'FETCH_PENDING_MEMBERSHIPS_FAILURE', error: 'Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingMemberships(api));

        expect(api.invitation.getReceived.callCount).to.equal(1);
      });
    });

    describe('fetchPatient', () => {
      it('should trigger FETCH_PATIENT_SUCCESS and it should call error once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatient(api, 58686));

        expect(api.patient.get.withArgs(58686).callCount).to.equal(1);
      });

      it('should trigger FETCH_PATIENT_FAILURE and it should call error once for a failed request', (done) => {
        let patient = { id: 58686, name: 'Buddy Holly', age: 65 };

        let api = {
          patient: {
            get: sinon.stub().callsArgWith(1, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_FAILURE', error: 'Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatient(api, 58686));

        expect(api.patient.get.withArgs(58686).callCount).to.equal(1);
      });
    });

    describe('fetchPatients', () => {
      it('should trigger FETCH_PATIENTS_SUCCESS and it should call error once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatients(api));

        expect(api.patient.getAll.callCount).to.equal(1);
      });

      it('should trigger FETCH_PATIENTS_FAILURE and it should call error once for a failed request', (done) => {
        let patients = [
          { id: 58686, name: 'Buddy Holly', age: 65 }
        ]

        let api = {
          patient: {
            getAll: sinon.stub().callsArgWith(0, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENTS_REQUEST' },
          { type: 'FETCH_PATIENTS_FAILURE', error: 'Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatients(api));

        expect(api.patient.getAll.callCount).to.equal(1);
      });
    });

    describe('fetchPatientData', () => {

      it('should trigger FETCH_PATIENT_DATA_SUCCESS and it should call error once for a successful request', (done) => {
        async.__Rewire__('utils', {
          processPatientData: sinon.stub().returnsArg(0)
        });

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
          { type: 'FETCH_PATIENT_DATA_REQUEST' },
          { type: 'FETCH_PATIENT_DATA_SUCCESS', payload: { patientData : patientData.concat(teamNotes) } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatientData(api, 300, {}));

        expect(api.patientData.get.withArgs(300).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(300).callCount).to.equal(1);
      });

      it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call error once for a failed request due to patient data call returning error', (done) => {
        async.__Rewire__('utils', {
          processPatientData: sinon.stub()
        });

        let patientData = [
          { id: 25, value: 540.4 }
        ];

        let teamNotes = [
          { id: 25, note: 'foo' }
        ];

        let api = {
          patientData: {
            get: sinon.stub().callsArgWith(1, 'Patient Error!', null),
          },
          team: {
            getNotes: sinon.stub().callsArgWith(1, null, teamNotes)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENT_DATA_REQUEST' },
          { type: 'FETCH_PATIENT_DATA_FAILURE', error: 'Patient Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatientData(api, 400));

        expect(api.patientData.get.withArgs(400).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(400).callCount).to.equal(1);
      });


      it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call error once for a failed request due to team notes call returning error', (done) => {
        async.__Rewire__('utils', {
          processPatientData: sinon.stub()
        });

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
            getNotes: sinon.stub().callsArgWith(1, 'Team Notes Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENT_DATA_REQUEST' },
          { type: 'FETCH_PATIENT_DATA_FAILURE', error: 'Team Notes Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatientData(api, 400));

        expect(api.patientData.get.withArgs(400).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(400).callCount).to.equal(1);
      });
    });

    describe('fetchMessageThread', () => {
      it('should trigger FETCH_MESSAGE_THREAD_SUCCESS and it should call error once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchMessageThread(api, 300));

        expect(api.team.getMessageThread.withArgs(300).callCount).to.equal(1);
      });

      it('should trigger FETCH_MESSAGE_THREAD_FAILURE and it should call error once for a failed request', (done) => {
        let messageThread = [
          { message: 'Foobar' }
        ]

        let api = {
          team: {
            getMessageThread: sinon.stub().callsArgWith(1, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_MESSAGE_THREAD_REQUEST' },
          { type: 'FETCH_MESSAGE_THREAD_FAILURE', error: 'Error!' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchMessageThread(api, 400));

        expect(api.team.getMessageThread.withArgs(400).callCount).to.equal(1);
      });
    });
  });


  describe('Syncronous Actions', () => {
    describe('showWelcomeMessage', () => {
      it('should be a FSA', () => {
        let action = sync.showWelcomeMessage();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SHOW_WELCOME_MESSAGE', () => {
        let action = sync.showWelcomeMessage();
        expect(action.type).to.equal('SHOW_WELCOME_MESSAGE');
      });
    });

    describe('hideWelcomeMessage', () => {
      it('should be a FSA', () => {
        let action = sync.hideWelcomeMessage();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal HIDE_WELCOME_MESSAGE', () => {
        let action = sync.hideWelcomeMessage();
        expect(action.type).to.equal('HIDE_WELCOME_MESSAGE');
      });
    });

    describe('showNotification', () => {
      it('should be a FSA', () => {
        let action = sync.showNotification('Fake notification');

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SHOW_NOTIFICATION', () => {
        let action = sync.showNotification();
        expect(action.type).to.equal('SHOW_NOTIFICATION');
      });
    });

    describe('closeNotification', () => {
      it('should be a FSA', () => {
        let action = sync.closeNotification();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CLOSE_NOTIFICATION', () => {
        let action = sync.closeNotification();
        expect(action.type).to.equal('CLOSE_NOTIFICATION');
      });
    });

    describe('loginRequest', () => {
      it('should be a FSA', () => {
        let action = sync.loginRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGIN_REQUEST', () => {
        let action = sync.loginRequest();
        expect(action.type).to.equal('LOGIN_REQUEST');
      });
    });

    describe('loginSuccess', () => {
      it('should be a FSA', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.loginSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGIN_SUCCESS and payload should contain user', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.loginSuccess(user);

        expect(action.type).to.equal('LOGIN_SUCCESS');
        expect(action.payload.user).to.equal(user);
      });
    });

    describe('loginFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.loginFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGIN_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.loginFailure(error);

        expect(action.type).to.equal('LOGIN_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('logoutRequest', () => {
      it('should be a FSA', () => {
        let action = sync.logoutRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_REQUEST', () => {
        let action = sync.logoutRequest();
        expect(action.type).to.equal('LOGOUT_REQUEST');
      });
    });

    describe('logoutSuccess', () => {
      it('should be a FSA', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.logoutSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_SUCCESS', () => {
        let action = sync.logoutSuccess();

        expect(action.type).to.equal('LOGOUT_SUCCESS');
      });
    });

    describe('logoutFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.logoutFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOGOUT_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.logoutFailure(error);

        expect(action.type).to.equal('LOGOUT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('signupRequest', () => {
      it('should be a FSA', () => {
        let action = sync.signupRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_REQUEST', () => {
        let action = sync.signupRequest();
        expect(action.type).to.equal('SIGNUP_REQUEST');
      });
    });

    describe('signupSuccess', () => {
      it('should be a FSA', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.signupSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_SUCCESS and payload should contain user', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.signupSuccess(user);

        expect(action.type).to.equal('SIGNUP_SUCCESS');
        expect(action.payload.user).to.equal(user);
      });
    });

    describe('signupFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.signupFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal SIGNUP_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.signupFailure(error);

        expect(action.type).to.equal('SIGNUP_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('confirmSignupRequest', () => {
      it('should be a FSA', () => {
        let action = sync.confirmSignupRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_REQUEST', () => {
        let action = sync.confirmSignupRequest();
        expect(action.type).to.equal('CONFIRM_SIGNUP_REQUEST');
      });
    });

    describe('confirmSignupSuccess', () => {
      it('should be a FSA', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.confirmSignupSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_SUCCESS', () => {
        let action = sync.confirmSignupSuccess();

        expect(action.type).to.equal('CONFIRM_SIGNUP_SUCCESS');
      });
    });

    describe('confirmSignupFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.confirmSignupFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal CONFIRM_SIGNUP_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.confirmSignupFailure(error);

        expect(action.type).to.equal('CONFIRM_SIGNUP_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('logErrorRequest', () => {
      it('should be a FSA', () => {
        let action = sync.logErrorRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_REQUEST', () => {
        let action = sync.logErrorRequest();
        expect(action.type).to.equal('LOG_ERROR_REQUEST');
      });
    });

    describe('logErrorSuccess', () => {
      it('should be a FSA', () => {
        let action = sync.logErrorSuccess();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_SUCCESS', () => {
        let action = sync.logErrorSuccess();

        expect(action.type).to.equal('LOG_ERROR_SUCCESS');
      });
    });

    describe('logErrorFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.logErrorFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal LOG_ERROR_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.logErrorFailure(error);

        expect(action.type).to.equal('LOG_ERROR_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchUserRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchUserRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_REQUEST', () => {
        let action = sync.fetchUserRequest();
        expect(action.type).to.equal('FETCH_USER_REQUEST');
      });
    });

    describe('fetchUserSuccess', () => {
      it('should be a FSA', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.fetchUserSuccess(user);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_SUCCESS', () => {
        let user = { id: 27, name: 'Frankie' };
        let action = sync.fetchUserSuccess(user);

        expect(action.type).to.equal('FETCH_USER_SUCCESS');
        expect(action.payload.user).to.equal(user);
      });
    });

    describe('fetchUserFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchUserFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_USER_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchUserFailure(error);

        expect(action.type).to.equal('FETCH_USER_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPendingInvitesRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPendingInvitesRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_INVITES_REQUEST', () => {
        let action = sync.fetchPendingInvitesRequest();
        expect(action.type).to.equal('FETCH_PENDING_INVITES_REQUEST');
      });
    });

    describe('fetchPendingInvitesSuccess', () => {
      it('should be a FSA', () => {
        let pendingInvites = [ 1,  2, 27 ];
        let action = sync.fetchPendingInvitesSuccess(pendingInvites);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_INVITES_SUCCESS', () => {
        let pendingInvites = [ 1,  7, 27, 566 ];
        let action = sync.fetchPendingInvitesSuccess(pendingInvites);

        expect(action.type).to.equal('FETCH_PENDING_INVITES_SUCCESS');
        expect(action.payload.pendingInvites).to.equal(pendingInvites);
      });
    });

    describe('fetchPendingInvitesFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPendingInvitesFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_INVITES_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPendingInvitesFailure(error);

        expect(action.type).to.equal('FETCH_PENDING_INVITES_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPendingMembershipsRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPendingMembershipsRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_MEMBERSHIPS_REQUEST', () => {
        let action = sync.fetchPendingMembershipsRequest();
        expect(action.type).to.equal('FETCH_PENDING_MEMBERSHIPS_REQUEST');
      });
    });

    describe('fetchPendingMembershipsSuccess', () => {
      it('should be a FSA', () => {
        let pendingMemberships = [ 1,  2, 27 ];
        let action = sync.fetchPendingMembershipsSuccess(pendingMemberships);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_MEMBERSHIPS_SUCCESS', () => {
        let pendingMemberships = [ 1,  7, 27, 566 ];
        let action = sync.fetchPendingMembershipsSuccess(pendingMemberships);

        expect(action.type).to.equal('FETCH_PENDING_MEMBERSHIPS_SUCCESS');
        expect(action.payload.pendingMemberships).to.equal(pendingMemberships);
      });
    });

    describe('fetchPendingMembershipsFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPendingMembershipsFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PENDING_MEMBERSHIPS_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPendingMembershipsFailure(error);

        expect(action.type).to.equal('FETCH_PENDING_MEMBERSHIPS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPatientRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_REQUEST', () => {
        let action = sync.fetchPatientRequest();
        expect(action.type).to.equal('FETCH_PATIENT_REQUEST');
      });
    });

    describe('fetchPatientSuccess', () => {
      it('should be a FSA', () => {
        let patient = { name: 'Bruce Lee', age: 24 };
        let action = sync.fetchPatientSuccess(patient);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_SUCCESS', () => {
        let patient = { name: 'Jackie Chan', age: 24 };
        let action = sync.fetchPatientSuccess(patient);

        expect(action.type).to.equal('FETCH_PATIENT_SUCCESS');
        expect(action.payload.patient).to.equal(patient);
      });
    });

    describe('fetchPatientFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPatientFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPatientFailure(error);

        expect(action.type).to.equal('FETCH_PATIENT_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientsRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPatientsRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_REQUEST', () => {
        let action = sync.fetchPatientsRequest();
        expect(action.type).to.equal('FETCH_PATIENTS_REQUEST');
      });
    });

    describe('fetchPatientsSuccess', () => {
      it('should be a FSA', () => {
        let patients = [ { name: 'Bruce Lee', age: 24 } ];
        let action = sync.fetchPatientsSuccess(patients);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_SUCCESS', () => {
        let patients = [ { name: 'Jackie Chan', age: 24 } ];
        let action = sync.fetchPatientsSuccess(patients);

        expect(action.type).to.equal('FETCH_PATIENTS_SUCCESS');
        expect(action.payload.patients).to.equal(patients);
      });
    });

    describe('fetchPatientsFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPatientsFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENTS_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPatientsFailure(error);

        expect(action.type).to.equal('FETCH_PATIENTS_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchPatientDataRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchPatientDataRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_REQUEST', () => {
        let action = sync.fetchPatientDataRequest();
        expect(action.type).to.equal('FETCH_PATIENT_DATA_REQUEST');
      });
    });

    describe('fetchPatientDataSuccess', () => {
      it('should be a FSA', () => {
        let patientData = [
          { id: 24, value: 500 },
          { id: 4567, value: 300 }
        ];
        let action = sync.fetchPatientDataSuccess(patientData);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_SUCCESS', () => {
        let patientData = [
          { id: 24, value: 500 },
          { id: 4567, value: 400 }
        ];
        let action = sync.fetchPatientDataSuccess(patientData);

        expect(action.type).to.equal('FETCH_PATIENT_DATA_SUCCESS');
        expect(action.payload.patientData).to.equal(patientData);
      });
    });

    describe('fetchPatientDataFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchPatientDataFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_PATIENT_DATA_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchPatientDataFailure(error);

        expect(action.type).to.equal('FETCH_PATIENT_DATA_FAILURE');
        expect(action.error).to.equal(error);
      });
    });

    describe('fetchMessageThreadRequest', () => {
      it('should be a FSA', () => {
        let action = sync.fetchMessageThreadRequest();

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_REQUEST', () => {
        let action = sync.fetchMessageThreadRequest();
        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_REQUEST');
      });
    });

    describe('fetchMessageThreadSuccess', () => {
      it('should be a FSA', () => {
        let messageThread = [
          { id: 47, message: 'Good Morning' },
          { id: 7447, message: 'I know Kung Fu!' }
        ];
        let action = sync.fetchMessageThreadSuccess(messageThread);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_SUCCESS', () => {
        let messageThread = [
          { id: 10106, message: 'Hello, this is quite fun!' },
          { id: 7, message: 'And they all lived happily ever after.' }
        ];
        let action = sync.fetchMessageThreadSuccess(messageThread);

        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_SUCCESS');
        expect(action.payload.messageThread).to.equal(messageThread);
      });
    });

    describe('fetchMessageThreadFailure', () => {
      it('should be a FSA', () => {
        let error = 'Error';
        let action = sync.fetchMessageThreadFailure(error);

        expect(isFSA(action)).to.be.true;
      });

      it('type should equal FETCH_MESSAGE_THREAD_FAILURE and error should equal passed error', () => {
        let error = 'Error';
        let action = sync.fetchMessageThreadFailure(error);

        expect(action.type).to.equal('FETCH_MESSAGE_THREAD_FAILURE');
        expect(action.error).to.equal(error);
      });
    });
  });
});