/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global afterEach */

import { isFSA } from 'flux-standard-action';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import _ from 'lodash';

import * as async from '../../../../app/redux/actions/async';

import initialState from '../../../../app/redux/reducers/initialState';

import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

describe('Actions', () => {
  const mockStore = configureStore([thunk]);

  afterEach(function() {
    // very important to do this in an afterEach than in each test when __Rewire__ is used
    // if you try to reset within each test you'll make it impossible for tests to fail!
    async.__ResetDependency__('utils')
  })

  describe('Asynchronous Actions', () => {
    describe('signup', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.signup(api, {foo: 'bar'}));

      });

      it('should trigger SIGNUP_FAILURE and it should call signup once and get zero times for a failed signup request', () => {
        let user = { id: 27 };
        let api = {
          user: {
            signup: sinon.stub().callsArgWith(1, { status: 401 }, null),
          }
        };

        let expectedActions = [
          { type: 'SIGNUP_REQUEST' },
          { type: 'SIGNUP_FAILURE', error: 'An error occured while signing up.' }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.signup(api, {foo: 'bar'}));

        expect(api.user.signup.callCount).to.equal(1);
      });
    });

    describe('confirmSignup', () => {
      it('should trigger CONFIRM_SIGNUP_SUCCESS and it should call confirmSignup once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.confirmSignup(api, 'fakeSignupKey'));

        expect(api.user.confirmSignup.calledWith('fakeSignupKey').callCount).to.equal(1);
      });

      it('should trigger CONFIRM_SIGNUP_FAILURE and it should call confirmSignup once for a failed request', (done) => {
        let user = { id: 27 };
        let api = {
          user: {
            confirmSignUp: sinon.stub().callsArgWith(1, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'CONFIRM_SIGNUP_REQUEST' },
          { type: 'CONFIRM_SIGNUP_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.confirmSignup(api, 'fakeSignupKey'));

        expect(api.user.confirmSignup.calledWith('fakeSignupKey').callCount).to.equal(1);
      });
    });

    describe('acceptTerms', () => {
      it('should trigger ACCEPT_TERMS_SUCCESS and it should call acceptTerms once for a successful request', (done) => {
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
          { type: 'ACCEPT_TERMS_SUCCESS', payload: { userId: loggedInUserId, acceptedDate: acceptedDate } }
        ];

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest, expectedActions, done);

        store.dispatch(async.acceptTerms(api, acceptedDate));

        expect(api.user.acceptTerms.calledWith(termsData).callCount).to.equal(1);
      });

      it('should trigger ACCEPT_TERMS_FAILURE and it should call acceptTerms once for a failed request', (done) => {
        let termsData = { termsAccepted: new Date() };
        let loggedInUserId = 500;
        let api = {
          user: {
            acceptTerms: sinon.stub().callsArgWith(1, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'ACCEPT_TERMS_REQUEST' },
          { type: 'ACCEPT_TERMS_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest, expectedActions, done);

        store.dispatch(async.acceptTerms(api, termsData));

        expect(api.user.acceptTerms.calledWith(termsData).callCount).to.equal(1);
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
            login: sinon.stub().callsArgWith(2, { status: 400 }),
            get: sinon.stub()
          }
        };

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: 'An error occured while logging in.', payload: null }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.login(api, creds));

        expect(api.user.login.calledWith(creds).callCount).to.equal(1);
        expect(api.user.get.callCount).to.equal(0);
      });

      it('should trigger LOGIN_FAILURE and it should call login once and user.get zero times for a failed login because of wrong password request', (done) => {
        let creds = { username: 'bruce', password: 'wayne' };
        let user = { id: 27 };
        let api = {
          user: {
            login: sinon.stub().callsArgWith(2, { status: 401 }),
            get: sinon.stub()
          }
        };

        let expectedActions = [
          { type: 'LOGIN_REQUEST' },
          { type: 'LOGIN_FAILURE', error: 'Wrong username or password.', payload: null }
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
          { type: 'LOGIN_FAILURE', error: ErrorMessages.STANDARD, payload: null }
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
          { type: 'LOGOUT_SUCCESS' },
          { type: '@@router/TRANSITION', payload: { args: [ '/' ], method: 'push' } }
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
          { type: 'LOGOUT_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.logout(api));

        expect(api.user.logout.callCount).to.equal(1);
      });
    });

    describe('createPatient', () => {
      it('should trigger CREATE_PATIENT_SUCCESS and it should call createPatient once for a successful request', (done) => {
        let loggedInUserId = 500;
        let patient = { id: 27, name: 'Bruce' };
        let api = {
          patient: {
            post: sinon.stub().callsArgWith(1, null, patient)
          }
        };

        let expectedActions = [
          { type: 'CREATE_PATIENT_REQUEST' },
          { type: 'CREATE_PATIENT_SUCCESS', payload: { userId: loggedInUserId, patient: patient } }
        ];
        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest, expectedActions, done);

        store.dispatch(async.createPatient(api, patient));

        expect(api.patient.post.calledWith(patient).callCount).to.equal(1);
      });

      it('should trigger CREATE_PATIENT_FAILURE and it should call createPatient once for a failed request', (done) => {
        let loggedInUserId = 500;
        let patient = { id: 27, name: 'Bruce' };
        let api = {
          patient: {
            post: sinon.stub().callsArgWith(1, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'CREATE_PATIENT_REQUEST' },
          { type: 'CREATE_PATIENT_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let initialStateForTest = _.merge({}, initialState, { blip: { loggedInUserId: loggedInUserId } });

        let store = mockStore(initialStateForTest, expectedActions, done);

        store.dispatch(async.createPatient(api, patient));

        expect(api.patient.post.calledWith(patient).callCount).to.equal(1);
      });
    });

    describe('removePatient', () => {
      it('should trigger REMOVE_PATIENT_SUCCESS and it should call leaveGroup and patient.getAll once for a successful request', (done) => {
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
          { type: 'REMOVE_PATIENT_REQUEST' },
          { type: 'REMOVE_PATIENT_SUCCESS', payload: { removedPatientId: patientId } },
          { type: 'FETCH_PATIENTS_REQUEST' },
          { type: 'FETCH_PATIENTS_SUCCESS', payload: { patients: patients } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.removePatient(api, patientId));

        expect(api.access.leaveGroup.calledWith(patientId).callCount).to.equal(1);
        expect(api.patient.getAll.callCount).to.equal(1);
      });

      it('should trigger REMOVE_PATIENT_FAILURE and it should call removePatient once for a failed request', (done) => {
        let patientId = 27;
        let api = {
          access: {
            leaveGroup: sinon.stub().callsArgWith(1, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'REMOVE_PATIENT_REQUEST' },
          { type: 'REMOVE_PATIENT_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.removePatient(api, patientId));

        expect(api.access.leaveGroup.calledWith(patientId).callCount).to.equal(1);
      });
    });

    describe('removeMember', () => {
      it('should trigger REMOVE_MEMBER_SUCCESS and it should call removeMember once for a successful request', (done) => {
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
          { type: 'REMOVE_MEMBER_REQUEST' },
          { type: 'REMOVE_MEMBER_SUCCESS', payload: { removedMemberId: memberId } },
          { type: 'FETCH_PATIENT_REQUEST' },
          { type: 'FETCH_PATIENT_SUCCESS', payload: { patient: patient } }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.removeMember(api, patientId, memberId));

        expect(api.access.removeMember.calledWith(memberId).callCount).to.equal(1);
        expect(api.patient.get.calledWith(patientId).callCount).to.equal(1);
      });

      it('should trigger REMOVE_MEMBER_FAILURE and it should call removeMember once for a failed request', (done) => {
        let memberId = 27;
        let api = {
          access: {
            removeMember: sinon.stub().callsArgWith(1, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'REMOVE_MEMBER_REQUEST' },
          { type: 'REMOVE_MEMBER_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.removeMember(api, memberId));

        expect(api.access.removeMember.calledWith(memberId).callCount).to.equal(1);
      });
    });

    describe('sendInvite', () => {
      it('should trigger SEND_INVITE_SUCCESS and it should call sendInvite once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.sendInvite(api, email, permissions));

        expect(api.access.sendInvite.calledWith(email, permissions).callCount).to.equal(1);
      });

      it('should trigger SEND_INVITE_FAILURE and it should call sendInvite once for a failed request', (done) => {
        let email = 'a@b.com';
        let permissions = {
          view: true
        };
        let invitation = { foo: 'bar' };
        let api = {
          invitation: {
            send: sinon.stub().callsArgWith(2, { status: 400 })
          }
        };

        let expectedActions = [
          { type: 'SEND_INVITE_REQUEST' },
          { type: 'SEND_INVITE_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.sendInvite(api, email, permissions));

        expect(api.access.sendInvite.calledWith(email, permissions).callCount).to.equal(1);
      });
    });

    describe('cancelSentInvite', () => {
      it('should trigger CANCEL_SENT_INVITE_SUCCESS and it should call cancelSentInvite once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.cancelSentInvite(api, email));

        expect(api.access.cancelSentInvite.calledWith(email).callCount).to.equal(1);
      });

      it('should trigger CANCEL_SENT_INVITE_FAILURE and it should call cancelSentInvite once for a failed request', (done) => {
        let email = 'a@b.com';
        let api = {
          invitation: {
            cancel: sinon.stub().callsArgWith(1, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'CANCEL_SENT_INVITE_REQUEST' },
          { type: 'CANCEL_SENT_INVITE_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.cancelSentInvite(api, email));

        expect(api.access.cancelSentInvite.calledWith(email).callCount).to.equal(1);
      });
    });

    describe('acceptReceivedInvite', () => {
      it('should trigger ACCEPT_RECEIVED_INVITE_SUCCESS and it should call acceptReceivedInvite once for a successful request', (done) => {
        let invitation = { key: 'foo', creator: { userid: 500 } };
        let api = {
          invitation: {
            accept: sinon.stub().callsArgWith(2, null, invitation)
          }
        };

        let expectedActions = [
          { type: 'ACCEPT_RECEIVED_INVITE_REQUEST', payload: { acceptedReceivedInvite: invitation } },
          { type: 'ACCEPT_RECEIVED_INVITE_SUCCESS', payload: { acceptedReceivedInvite: invitation } }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.acceptReceivedInvite(api, invitation));

        expect(api.access.acceptReceivedInvite.calledWith(invitation.key, invitation.creator.userid).callCount).to.equal(1);
      });

      it('should trigger ACCEPT_RECEIVED_INVITE_FAILURE and it should call acceptReceivedInvite once for a failed request', (done) => {
        let invitation = { key: 'foo', creator: { id: 500 } };
        let api = {
          invitation: {
            accept: sinon.stub().callsArgWith(2, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'ACCEPT_RECEIVED_INVITE_REQUEST', payload: { acceptedReceivedInvite: invitation } },
          { type: 'ACCEPT_RECEIVED_INVITE_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.acceptReceivedInvite(api, invitation));

        expect(api.access.acceptReceivedInvite.calledWith(invitation.key, invitation.creator.userid).callCount).to.equal(1);
      });
    });

    describe('rejectReceivedInvite', () => {
      it('should trigger REJECT_RECEIVED_INVITE_SUCCESS and it should call rejectReceivedInvite once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.rejectReceivedInvite(api, invitation));

        expect(api.access.rejectReceivedInvite.calledWith(invitation.key, invitation.creator.userid).callCount).to.equal(1);
      });

      it('should trigger REJECT_RECEIVED_INVITE_FAILURE and it should call rejectReceivedInvite once for a failed request', (done) => {
        let invitation = { key: 'foo', creator: { id: 500 } };
        let api = {
          invitation: {
            dismiss: sinon.stub().callsArgWith(2, 'Failure!')
          }
        };

        let expectedActions = [
          { type: 'REJECT_RECEIVED_INVITE_REQUEST', payload: { rejectedReceivedInvite: invitation } },
          { type: 'REJECT_RECEIVED_INVITE_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.rejectReceivedInvite(api, invitation));

        expect(api.access.rejectReceivedInvite.calledWith(invitation.key, invitation.creator.userid).callCount).to.equal(1);
      });
    });

    describe('setMemberPermissions', () => {
      it('should trigger SET_MEMBER_PERMISSIONS_SUCCESS and it should call setMemberPermissions once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.setMemberPermissions(api, patientId, memberId, permissions));

        expect(api.access.setMemberPermissions.calledWith(memberId, permissions).callCount).to.equal(1);
        expect(api.patient.get.calledWith(patientId).callCount).to.equal(1);
      });

      it('should trigger SET_MEMBER_PERMISSIONS_FAILURE and it should call setMemberPermissions once for a failed request', (done) => {
        let patientId = 50;
        let memberId = 2;
        let permissions = {
          read: false
        };
        let api = {
          access: {
            setMemberPermissions: sinon.stub().callsArgWith(2, { error: 400 })
          }
        };

        let expectedActions = [
          { type: 'SET_MEMBER_PERMISSIONS_REQUEST' },
          { type: 'SET_MEMBER_PERMISSIONS_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.setMemberPermissions(api, patientId, memberId, permissions));

        expect(api.access.setMemberPermissions.calledWith(memberId, permissions).callCount).to.equal(1);
      });
    });

    describe('updatePatient', () => {
      it('should trigger UPDATE_PATIENT_SUCCESS and it should call updatePatient once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.updatePatient(api, patient));

        expect(api.access.updatePatient.calledWith(patient).callCount).to.equal(1);
      });

      it('should trigger UPDATE_PATIENT_FAILURE and it should call updatePatient once for a failed request', (done) => {
        let patient = { name: 'Bruce' };
        let api = {
          patient: {
            put: sinon.stub().callsArgWith(1, 'Something wrong happened!')
          }
        };

        let expectedActions = [
          { type: 'UPDATE_PATIENT_REQUEST' },
          { type: 'UPDATE_PATIENT_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.updatePatient(api, patient));

        expect(api.access.updatePatient.calledWith(patient).callCount).to.equal(1);
      });
    });

    describe('updateUser', () => {
      it('should trigger UPDATE_USER_SUCCESS and it should call updateUser once for a successful request', (done) => {
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
          }
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

        let store = mockStore({ blip : initialStateForTest }, expectedActions, done);

        store.dispatch(async.updateUser(api, formValues));

        expect(api.access.updateUser.calledWith(userUpdates).callCount).to.equal(1);
      });

      it('should trigger UPDATE_USER_FAILURE and it should call updateUser once for a failed request', (done) => {
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
          }
        };
        let api = {
          user: {
            put: sinon.stub().callsArgWith(1, 'Something wrong happened!')
          }
        };

        let initialStateForTest = _.merge({}, initialState, { allUsersMap: { [loggedInUserId] : currentUser }, loggedInUserId: loggedInUserId });

        let expectedActions = [
          { type: 'UPDATE_USER_REQUEST', payload: { userId: loggedInUserId, updatingUser: updatingUser} },
          { type: 'UPDATE_USER_FAILURE', error: ErrorMessages.STANDARD }
        ];

        let store = mockStore({ blip : initialStateForTest }, expectedActions, done);

        store.dispatch(async.updateUser(api, formValues));

        expect(api.access.updateUser.calledWith(userUpdates).callCount).to.equal(1);
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
          { type: 'LOG_ERROR_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.logError(api, error, message, props));

        expect(api.errors.log.withArgs(error, message, props).callCount).to.equal(1);
      });
    });

    describe('fetchUser', () => {
      it('should trigger FETCH_USER_SUCCESS and it should call error once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchUser(api));

        expect(api.user.get.callCount).to.equal(1);
      });

      it('should trigger FETCH_USER_FAILURE and it should call error once for a request for user that has not verified email', (done) => {
        let user = { emailVerified: false, username: 'frankie@gmaz.com', id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, null, user)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_FAILURE', error: ErrorMessages.EMAIL_NOT_VERIFIED }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchUser(api));

        expect(api.user.get.callCount).to.equal(1);
      });


      it('should trigger FETCH_USER_FAILURE when a 401 happensand it should call error once for a failed request', (done) => {
        let user = { id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, { status: 401 }, null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_FAILURE', error: null }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchUser(api));

        expect(api.user.get.callCount).to.equal(1);
      });

      it('should trigger FETCH_USER_FAILURE when a 500 happens and it should call error once for a failed request', (done) => {
        let user = { id: 306, name: 'Frankie Boyle' };

        let api = {
          user: {
            get: sinon.stub().callsArgWith(0, { status: 500 }, null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_USER_REQUEST' },
          { type: 'FETCH_USER_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchUser(api));

        expect(api.user.get.callCount).to.equal(1);
      });
    });

    describe('fetchPendingSentInvites', () => {
      it('should trigger FETCH_PENDING_SENT_INVITES_SUCCESS and it should call error once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingSentInvites(api));

        expect(api.invitation.getSent.callCount).to.equal(1);
      });

      it('should trigger FETCH_PENDING_SENT_INVITES_FAILURE and it should call error once for a failed request', (done) => {
        let pendingSentInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getSent: sinon.stub().callsArgWith(0, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_SENT_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_SENT_INVITES_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingSentInvites(api));

        expect(api.invitation.getSent.callCount).to.equal(1);
      });
    });

    describe('fetchPendingReceivedInvites', () => {
      it('should trigger FETCH_PENDING_RECEIVED_INVITES_SUCCESS and it should call error once for a successful request', (done) => {
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
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingReceivedInvites(api));

        expect(api.invitation.getReceived.callCount).to.equal(1);
      });

      it('should trigger FETCH_PENDING_RECEIVED_INVITES_FAILURE and it should call error once for a failed request', (done) => {
        let pendingReceivedInvites = [ 1, 555, 78191 ];

        let api = {
          invitation: {
            getReceived: sinon.stub().callsArgWith(0, 'Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PENDING_RECEIVED_INVITES_REQUEST' },
          { type: 'FETCH_PENDING_RECEIVED_INVITES_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPendingReceivedInvites(api));

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
        let store = mockStore({ blip: initialState }, expectedActions, done);

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
          { type: 'FETCH_PATIENT_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore({ blip: initialState }, expectedActions, done);

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
          { type: 'FETCH_PATIENTS_FAILURE', error: ErrorMessages.STANDARD }
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
          { type: 'FETCH_PATIENT_DATA_REQUEST' },
          { type: 'FETCH_PATIENT_DATA_SUCCESS', payload: { patientData : patientData, patientNotes: teamNotes, patientId: patientId } }
        ];
        let store = mockStore({ blip: initialState }, expectedActions, done);

        store.dispatch(async.fetchPatientData(api, patientId));

        expect(api.patientData.get.withArgs(patientId).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
      });

      it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call error once for a failed request due to patient data call returning error', (done) => {
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
            get: sinon.stub().callsArgWith(1, 'Patient Error!', null),
          },
          team: {
            getNotes: sinon.stub().callsArgWith(1, null, teamNotes)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENT_DATA_REQUEST' },
          { type: 'FETCH_PATIENT_DATA_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore({ blip: initialState }, expectedActions, done);

        store.dispatch(async.fetchPatientData(api, patientId));

        expect(api.patientData.get.withArgs(patientId).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
      });


      it('should trigger FETCH_PATIENT_DATA_FAILURE and it should call error once for a failed request due to team notes call returning error', (done) => {
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
            getNotes: sinon.stub().callsArgWith(1, 'Team Notes Error!', null)
          }
        };

        let expectedActions = [
          { type: 'FETCH_PATIENT_DATA_REQUEST' },
          { type: 'FETCH_PATIENT_DATA_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchPatientData(api, patientId));

        expect(api.patientData.get.withArgs(patientId).callCount).to.equal(1);
        expect(api.team.getNotes.withArgs(patientId).callCount).to.equal(1);
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
          { type: 'FETCH_MESSAGE_THREAD_FAILURE', error: ErrorMessages.STANDARD }
        ];
        let store = mockStore(initialState, expectedActions, done);

        store.dispatch(async.fetchMessageThread(api, 400));

        expect(api.team.getMessageThread.withArgs(400).callCount).to.equal(1);
      });
    });
  });
});