// /* global chai */
// /* global sinon */
// /* global describe */
// /* global it */
// /* global expect */

// import _ from 'lodash';

// import reducer from '../../../../app/redux/reducers/index';

// import actions from '../../../../app/redux/actions/index';

// import * as ErrorMessages from '../../../../app/redux/constants/errorMessages';

// import initialState from '../../../../app/redux/reducers/initialState';


// var expect = chai.expect;

// describe('reducers', () => {
//   describe('acknowledgeNotification', () => {
//     it('should set state.notification to null when called with no argument', () => {
//       let initialStateForTest = _.merge({}, initialState, { notification: { message: 'foo' } });
//       let action = actions.sync.acknowledgeNotification()

//       expect(initialStateForTest.notification.message).to.equal('foo');

//       let state = reducer(initialStateForTest, action);
//       expect(state.notification).to.be.null;
//     });

//     it('should set state.working.fetchingUser.notification to null when called with "fetchingUser"', () => {
//       let initialStateForTest = _.merge({}, initialState, { working: { fetchingUser: { notification: { message: 'foo' } } } });
//       let action = actions.sync.acknowledgeNotification('fetchingUser')

//       expect(initialStateForTest.working.fetchingUser.notification.message).to.equal('foo');

//       let state = reducer(initialStateForTest, action);
//       expect(state.working.fetchingUser.notification).to.be.null;
//     });
//   });

//   describe('access', () => {
//     describe('login', () => {
//       describe('request', () => {
//         it('should set working.loggingIn to be true', () => {
//           let action = actions.sync.loginRequest();
//           expect(initialState.working.loggingIn.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.loggingIn.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set working.loggingIn to be false', () => {
//           let error = 'Something bad happened';

//           let requestAction = actions.sync.loginRequest();
//           expect(initialState.working.loggingIn.inProgress).to.be.false;

//           let intermediateState = reducer(initialState, requestAction);
//           expect(intermediateState.working.loggingIn.inProgress).to.be.true;

//           let failureAction = actions.sync.loginFailure(error);
//           let state = reducer(intermediateState, failureAction);
//           expect(state.working.loggingIn.inProgress).to.be.false;
//           expect(state.working.loggingIn.notification.type).to.equal('error');
//           expect(state.working.loggingIn.notification.message).to.equal(error);
//         });

//         it('should set working.loggingIn to be false and apply other payload values to state', () => {
//           let error = 'Something bad happened';

//           let requestAction = actions.sync.loginRequest();
//           expect(initialState.working.loggingIn.inProgress).to.be.false;

//           let intermediateState = reducer(initialState, requestAction);
//           expect(intermediateState.working.loggingIn.inProgress).to.be.true;

//           let failureAction = actions.sync.loginFailure(error, { isLoggedIn: false, emailVerificationSent: false });
//           let state = reducer(intermediateState, failureAction);
//           expect(state.working.loggingIn.inProgress).to.be.false;
//           expect(state.working.loggingIn.notification.type).to.equal('error');
//           expect(state.working.loggingIn.notification.message).to.equal(error);
//           expect(state.isLoggedIn).to.equal(false);
//           expect(state.emailVerificationSent).to.equal(false);
//         });
//       });

//       describe('success', () => {
//         it('should set working.loggingIn.inProgress to be false and set user', () => {
//           let user = 'user'

//           let requestAction = actions.sync.loginRequest();
//           expect(initialState.working.loggingIn.inProgress).to.be.false;

//           let intermediateState = reducer(initialState, requestAction);
//           expect(intermediateState.working.loggingIn.inProgress).to.be.true;

//           let successAction = actions.sync.loginSuccess(user);
//           let state = reducer(intermediateState, successAction);
//           expect(state.working.loggingIn.inProgress).to.be.false;
//           expect(state.isLoggedIn).to.be.true;
//           expect(state.loggedInUser).to.equal(user);
//         });
//       });
//     });

//     describe('logout', () => {
//       describe('request', () => {
//         it('should set working.loggingOut.inProgress to be true', () => {
//           let action = actions.sync.logoutRequest();
//           expect(initialState.working.loggingOut.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.loggingOut.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set working.loggingOut.inProgress to be false', () => {
//           let error = 'Something bad happened';

//           let requestAction = actions.sync.logoutRequest();
//           expect(initialState.working.loggingOut.inProgress).to.be.false;

//           let intermediateState = reducer(initialState, requestAction);
//           expect(intermediateState.working.loggingOut.inProgress).to.be.true;

//           let failureAction = actions.sync.logoutFailure(error);
//           let state = reducer(intermediateState, failureAction);
//           expect(state.working.loggingOut.inProgress).to.be.false;
//           expect(state.working.loggingOut.notification.type).to.equal('error');
//           expect(state.working.loggingOut.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set working.loggingOut.inProgress to be false and clear session state values', () => {
//           let user = 'user';

//           let requestAction = actions.sync.logoutRequest();
//           expect(initialState.working.loggingOut.inProgress).to.be.false;

//           let intermediateState = reducer(initialState, requestAction);
//           expect(intermediateState.working.loggingOut.inProgress).to.be.true;

//           let successAction = actions.sync.logoutSuccess(user);
//           let state = reducer(intermediateState, successAction);

//           console.log(JSON.stringify(state,null, 4));
//           expect(state.working.loggingOut.inProgress).to.be.false;
//           expect(state.isLoggedIn).to.be.false;
//           expect(state.loggedInUser).to.equal(null);
//           expect(state.currentPatientInView).to.equal(null);
//           expect(Object.keys(state.patientsMap).length).to.equal(0);
//           expect(Object.keys(state.patientDataMap).length).to.equal(0);
//           expect(Object.keys(state.patientNotesMap).length).to.equal(0);
//           expect(state.invites.length).to.equal(0);
//         });
//       });
//     });
//   });

//   describe('signup', () => {
//     describe('request', () => {
//       it('should set working.signingUp.inProgress to be true', () => {
//         let action = actions.sync.signupRequest();
//         expect(initialState.working.signingUp.inProgress).to.be.false;

//         let state = reducer(initialState, action);
//         expect(state.working.signingUp.inProgress).to.be.true;
//       });
//     });

//     describe('failure', () => {
//       it('should set working.signingUp.inProgress to be false', () => {
//         let error = 'Something bad happened when signing up';

//         let requestAction = actions.sync.signupRequest();
//         expect(initialState.working.signingUp.inProgress).to.be.false;

//         let intermediateState = reducer(initialState, requestAction);
//         expect(intermediateState.working.signingUp.inProgress).to.be.true;

//         let failureAction = actions.sync.signupFailure(error);
//         let state = reducer(intermediateState, failureAction);
//         expect(state.working.signingUp.inProgress).to.be.false;
//         expect(state.working.signingUp.notification.type).to.equal('error');
//         expect(state.working.signingUp.notification.message).to.equal(error);
//       });
//     });

//     describe('success', () => {
//       it('should set working.signingUp.inProgress to be false and set sentEmailVerification', () => {
//         let user = 'user';

//         let requestAction = actions.sync.signupRequest();
        
//         expect(initialState.working.signingUp.inProgress).to.be.false;

//         let intermediateState = reducer(initialState, requestAction);
//         expect(intermediateState.working.signingUp.inProgress).to.be.true;

//         let successAction = actions.sync.signupSuccess(user);
//         let state = reducer(intermediateState, successAction);

//         expect(state.working.signingUp.inProgress).to.be.false;
//         expect(state.emailVerificationSent).to.be.true;
//       });
//     });
//   });

//   describe('confirmSignup', () => {
//     describe('request', () => {
//       it('should set working.confirmingSignup.inProgress to be true', () => {
//         let action = actions.sync.confirmSignupRequest();
//         expect(initialState.working.confirmingSignup.inProgress).to.be.false;

//         let state = reducer(initialState, action);
//         expect(state.working.confirmingSignup.inProgress).to.be.true;
//       });
//     });

//     describe('failure', () => {
//       it('should set working.confirmingSignup.inProgress to be false', () => {
//         let error = 'Something bad happened when signing up';

//         let requestAction = actions.sync.confirmSignupRequest();
//         expect(initialState.working.confirmingSignup.inProgress).to.be.false;

//         let intermediateState = reducer(initialState, requestAction);
//         expect(intermediateState.working.confirmingSignup.inProgress).to.be.true;

//         let failureAction = actions.sync.confirmSignupFailure(error);
//         let state = reducer(intermediateState, failureAction);
//         expect(state.working.confirmingSignup.inProgress).to.be.false;
//         expect(state.working.confirmingSignup.notification.type).to.equal('error');
//         expect(state.working.confirmingSignup.notification.message).to.equal(error);
//       });
//     });

//     describe('success', () => {
//       it('should set working.confirmingSignup.inProgress to be false and set user', () => {
//         let user = 'user';

//         let requestAction = actions.sync.confirmSignupRequest();
        
//         expect(initialState.working.confirmingSignup.inProgress).to.be.false;

//         let intermediateState = reducer(initialState, requestAction);
//         expect(intermediateState.working.confirmingSignup.inProgress).to.be.true;

//         let successAction = actions.sync.confirmSignupSuccess(user);
//         let state = reducer(intermediateState, successAction);

//         expect(state.working.confirmingSignup.inProgress).to.be.false;
//         expect(state.confirmedSignup).to.be.true;
//       });
//     });
//   });

//   describe('confirmPasswordReset', () => {
//     describe('request', () => {
//       it('should set working.confirmingPasswordReset.inProgress to be true', () => {
//         let action = actions.sync.confirmPasswordResetRequest();
//         expect(initialState.working.confirmingPasswordReset.inProgress).to.be.false;

//         let state = reducer(initialState, action);
//         expect(state.working.confirmingPasswordReset.inProgress).to.be.true;
//       });
//     });

//     describe('failure', () => {
//       it('should set working.confirmingPasswordReset.inProgress to be false', () => {
//         let error = 'Something bad happened when signing up';

//         let requestAction = actions.sync.confirmPasswordResetRequest();
//         expect(initialState.working.confirmingPasswordReset.inProgress).to.be.false;

//         let intermediateState = reducer(initialState, requestAction);
//         expect(intermediateState.working.confirmingPasswordReset.inProgress).to.be.true;

//         let failureAction = actions.sync.confirmPasswordResetFailure(error);
//         let state = reducer(intermediateState, failureAction);
//         expect(state.working.confirmingPasswordReset.inProgress).to.be.false;
//         expect(state.working.confirmingPasswordReset.notification.type).to.equal('error');
//         expect(state.working.confirmingPasswordReset.notification.message).to.equal(error);
//       });
//     });

//     describe('success', () => {
//       it('should set working.confirmingPasswordReset.inProgress to be false and set user', () => {
//         let user = 'user';

//         let requestAction = actions.sync.confirmPasswordResetRequest();
        
//         expect(initialState.working.confirmingPasswordReset.inProgress).to.be.false;

//         let intermediateState = reducer(initialState, requestAction);
//         expect(intermediateState.working.confirmingPasswordReset.inProgress).to.be.true;

//         let successAction = actions.sync.confirmPasswordResetSuccess(user);
//         let state = reducer(intermediateState, successAction);

//         expect(state.working.confirmingPasswordReset.inProgress).to.be.false;
//         expect(state.passwordResetConfirmed).to.be.true;
//       });
//     });
//   });

//   describe('acceptTerms', () => {
//     describe('request', () => {
//       it('should set working.acceptingTerms.inProgress to be true', () => {
//         let action = actions.sync.acceptTermsRequest(); 

//         expect(initialState.working.acceptingTerms.inProgress).to.be.false;

//         let state = reducer(initialState, action);
//         expect(state.working.acceptingTerms.inProgress).to.be.true;
//       });
//     });

//     describe('failure', () => {
//       it('should set working.acceptingTerms.inProgress to be false', () => {
//         let error = 'Something bad happened when signing up';

//         let requestAction = actions.sync.acceptTermsRequest();
//         expect(initialState.working.acceptingTerms.inProgress).to.be.false;

//         let intermediateState = reducer(initialState, requestAction);
//         expect(intermediateState.working.acceptingTerms.inProgress).to.be.true;

//         let failureAction = actions.sync.acceptTermsFailure(error);
//         let state = reducer(intermediateState, failureAction);
//         expect(state.working.acceptingTerms.inProgress).to.be.false;
//         expect(state.working.acceptingTerms.notification.type).to.equal('error');
//         expect(state.working.acceptingTerms.notification.message).to.equal(error);
//       });
//     });

//     describe('success', () => {
//       it('should set working.acceptingTerms.inProgress to be false and set user', () => {
//         let termsAccepted = '2015-02-01';

//         let user = { termsAccepted: false };

//         let initialStateForTest = _.merge({}, initialState, { loggedInUser:  user });
//         let requestAction = actions.sync.acceptTermsRequest();
        
//         expect(initialStateForTest.working.acceptingTerms.inProgress).to.be.false;
//         expect(initialStateForTest.loggedInUser.termsAccepted).to.be.false;

//         let intermediateState = reducer(initialStateForTest, requestAction);
//         expect(intermediateState.working.acceptingTerms.inProgress).to.be.true;

//         let successAction = actions.sync.acceptTermsSuccess(termsAccepted);
//         let state = reducer(intermediateState, successAction);

//         expect(state.working.acceptingTerms.inProgress).to.be.false;
//         expect(state.loggedInUser.termsAccepted).to.equal(termsAccepted);
//       });
//     });
//   });

//   describe('fetchers', () => {
//     describe('fetchUser', () => {
//       describe('request', () => {
//         it('should set fetchingUser to be true', () => {
//           let action = actions.sync.fetchUserRequest(); 

//           expect(initialState.working.fetchingUser.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.fetchingUser.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set fetchingUser to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingUser: { inProgress : true, notification: null } } });
//           let error = 'Something bad happened!';
//           let action = actions.sync.fetchUserFailure(error);

//           expect(initialStateForTest.working.fetchingUser.inProgress).to.be.true;
//           expect(initialStateForTest.working.fetchingUser.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);

//           expect(state.working.fetchingUser.inProgress).to.be.false;
//           expect(state.working.fetchingUser.notification.type).to.equal('error');
//           expect(state.working.fetchingUser.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set fetchingUser to be false and set user', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingUser: { inProgress : true, notification: null } } });
//           let user = { id: 501, name: 'Jamie Blake'};
//           let action = actions.sync.fetchUserSuccess(user);

//           expect(initialStateForTest.working.fetchingUser.inProgress).to.be.true;
//           expect(initialStateForTest.loggedInUser).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingUser.inProgress).to.be.false;
//           expect(state.loggedInUser.id).to.equal(user.id);
//           expect(state.loggedInUser.name).to.equal(user.name);
//         });
//       });
//     });

//     describe('fetchPatient', () => {
//       describe('request', () => {
//         it('should set fetchingPatient to be true', () => {
//           let action = actions.sync.fetchPatientRequest(); 

//           expect(initialState.working.fetchingPatient.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.fetchingPatient.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set fetchingPatient to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatient: { inProgress : true, notification: null } } });
//           let error = 'Something else bad happened!';
//           let action = actions.sync.fetchPatientFailure(error);

//           expect(initialStateForTest.working.fetchingPatient.inProgress).to.be.true;
//           expect(initialStateForTest.working.fetchingPatient.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);

//           expect(state.working.fetchingPatient.inProgress).to.be.false;
//           expect(state.working.fetchingPatient.notification.type).to.equal('error');
//           expect(state.working.fetchingPatient.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set fetchingPatient to be false and set patient', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatient: { inProgress : true, notification: null } } });
//           let patient = { id: 2020, name: 'Megan Durrant'};
//           let action = actions.sync.fetchPatientSuccess(patient);

//           expect(initialStateForTest.working.fetchingPatient.inProgress).to.be.true;
//           expect(initialStateForTest.currentPatientInView).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingPatient.inProgress).to.be.false;
//           expect(state.currentPatientInView.id).to.equal(patient.id);
//           expect(state.currentPatientInView.name).to.equal(patient.name);
//         });
//       });
//     });

//     describe('fetchPatients', () => {
//       describe('request', () => {
//         it('should set fetchingPatients to be true', () => {
//           let action = actions.sync.fetchPatientsRequest(); 

//           expect(initialState.working.fetchingPatients.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.fetchingPatients.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set fetchingPatients to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatients: { inProgress : true, notification: null } } });
//           let error = 'Oh no!!';
//           let action = actions.sync.fetchPatientsFailure(error);

//           expect(initialStateForTest.working.fetchingPatients.inProgress).to.be.true;
//           expect(initialStateForTest.working.fetchingPatients.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);

//           expect(state.working.fetchingPatients.inProgress).to.be.false;
//           expect(state.working.fetchingPatients.notification.type).to.equal('error');
//           expect(state.working.fetchingPatients.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set fetchingPatients to be false and set patient', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatients: { inProgress : true, notification: null } } });
//           let patients = [
//             { userid: 2020, name: 'Megan Durrant'},
//             { userid: 501, name: 'Jamie Blake'}
//           ];
//           let action = actions.sync.fetchPatientsSuccess(patients);

//           expect(initialStateForTest.working.fetchingPatients.inProgress).to.be.true;
//           expect(initialStateForTest.patients).to.be.empty;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingPatients.inProgress).to.be.false;
//           expect(Object.keys(state.patientsMap).length).to.equal(2);
//           expect(state.patientsMap[patients[0].userid].userid).to.equal(patients[0].userid);
//           expect(state.patientsMap[patients[1].userid].userid).to.equal(patients[1].userid);
//           expect(state.patientsMap[patients[0].userid].name).to.equal(patients[0].name);
//           expect(state.patientsMap[patients[1].userid].name).to.equal(patients[1].name);
//         });
//       });
//     });

//     describe('fetchPatientData', () => {
//       describe('request', () => {
//         it('should set fetchingPatientData to be true', () => {
//           let action = actions.sync.fetchPatientDataRequest(); 

//           expect(initialState.working.fetchingPatientData.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.fetchingPatientData.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set fetchingPatientData to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatientData: { inProgress : true, notification: null } } });
//           let error = 'Oh no!!';
//           let action = actions.sync.fetchPatientDataFailure(error);

//           expect(initialStateForTest.working.fetchingPatientData.inProgress).to.be.true;
//           expect(initialStateForTest.working.fetchingPatientData.notification).to.be.null;
//           expect(initialStateForTest.patientDataMap).to.be.empty;

//           let state = reducer(initialStateForTest, action);

//           expect(state.working.fetchingPatientData.inProgress).to.be.false;
//           expect(state.working.fetchingPatientData.notification.type).to.equal('error');
//           expect(state.working.fetchingPatientData.notification.message).to.equal(error);
//           expect(state.patientDataMap).to.be.empty;
//         });
//       });

//       describe('success', () => {
//         it('should set fetchingPatientData to be false and set patient', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPatientData: { inProgress : true, notification: null } } });
//           let patientId = 300;
//           let patientData = [
//             { id: 2020 },
//             { id: 501 }
//           ];
//           let patientNotes = [
//             { id: 123, type: 'message' },
//             { id: 456, type: 'message' }
//           ];
//           let action = actions.sync.fetchPatientDataSuccess(patientId, patientData, patientNotes);

//           expect(initialStateForTest.working.fetchingPatientData.inProgress).to.be.true;
//           expect(initialStateForTest.patientDataMap).to.be.empty;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingPatientData.inProgress).to.be.false;
//           expect(Object.keys(state.patientDataMap).length).to.equal(1);
//           expect(state.patientDataMap[patientId].length).to.equal(patientData.length);
//           expect(state.patientDataMap[patientId][0].id).to.equal(patientData[0].id);
//           expect(state.patientDataMap[patientId][1].id).to.equal(patientData[1].id);
//           expect(state.patientNotesMap[patientId].length).to.equal(patientNotes.length);
//           expect(state.patientNotesMap[patientId][0].id).to.equal(patientNotes[0].id);
//           expect(state.patientNotesMap[patientId][1].id).to.equal(patientNotes[1].id);
//         });
//       });
//     });

//     describe('fetchPendingInvites', () => {
//       describe('request', () => {
//         it('should set fetchingPendingInvites to be true', () => {
//           let action = actions.sync.fetchPendingInvitesRequest(); 

//           expect(initialState.working.fetchingPendingInvites.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.fetchingPendingInvites.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set fetchingPendingInvites to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingInvites: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not work!!';
//           let action = actions.sync.fetchPendingInvitesFailure(error);

//           expect(initialStateForTest.working.fetchingPendingInvites.inProgress).to.be.true;
//           expect(initialStateForTest.working.fetchingPendingInvites.notification).to.be.null;
//           expect(initialStateForTest.pendingInvites).to.be.empty;

//           let state = reducer(initialStateForTest, action);

//           expect(state.working.fetchingPendingInvites.inProgress).to.be.false;
//           expect(state.working.fetchingPendingInvites.notification.type).to.equal('error');
//           expect(state.working.fetchingPendingInvites.notification.message).to.equal(error);
//           expect(state.pendingInvites).to.be.empty;
//         });
//       });

//       describe('success', () => {
//         it('should set fetchingPendingInvites to be false and set patient', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingInvites: { inProgress : true, notification: null } } });
//           let pendingInvites = [
//             { id: 1167 },
//             { id: 11 }
//           ];
//           let action = actions.sync.fetchPendingInvitesSuccess(pendingInvites);

//           expect(initialStateForTest.working.fetchingPendingInvites.inProgress).to.be.true;
//           expect(initialStateForTest.pendingInvites).to.be.empty;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingPendingInvites.inProgress).to.be.false;
//           expect(state.pendingInvites.length).to.equal(2);
//           expect(state.pendingInvites[0].id).to.equal(pendingInvites[0].id);
//           expect(state.pendingInvites[1].id).to.equal(pendingInvites[1].id);
//         });
//       });
//     });

//     describe('fetchPendingMemberships', () => {
//       describe('request', () => {
//         it('should set fetchingPendingMemberships to be true', () => {
//           let action = actions.sync.fetchPendingMembershipsRequest(); 

//           expect(initialState.working.fetchingPendingMemberships.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.fetchingPendingMemberships.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set fetchingPendingMemberships to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingMemberships: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not get pending memeberships!!';
//           let action = actions.sync.fetchPendingMembershipsFailure(error);

//           expect(initialStateForTest.working.fetchingPendingMemberships.inProgress).to.be.true;
//           expect(initialStateForTest.working.fetchingPendingMemberships.notification).to.be.null;
//           expect(initialStateForTest.pendingMemberships).to.be.empty;

//           let state = reducer(initialStateForTest, action);

//           expect(state.working.fetchingPendingMemberships.inProgress).to.be.false;
//           expect(state.working.fetchingPendingMemberships.notification.type).to.equal('error');
//           expect(state.working.fetchingPendingMemberships.notification.message).to.equal(error);
//           expect(state.pendingMemberships).to.be.empty;
//         });
//       });

//       describe('success', () => {
//         it('should set fetchingPendingMemberships to be false and set patient', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingPendingMemberships: { inProgress : true, notification: null } } });
//           let pendingMemberships = [
//             { id: 204 },
//             { id: 1 }
//           ];
//           let action = actions.sync.fetchPendingMembershipsSuccess(pendingMemberships);

//           expect(initialStateForTest.working.fetchingPendingMemberships.inProgress).to.be.true;
//           expect(initialStateForTest.pendingMemberships).to.be.empty;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingPendingMemberships.inProgress).to.be.false;
//           expect(state.pendingMemberships.length).to.equal(2);
//           expect(state.pendingMemberships[0].id).to.equal(pendingMemberships[0].id);
//           expect(state.pendingMemberships[1].id).to.equal(pendingMemberships[1].id);
//         });
//       });
//     });

//     describe('fetchMessageThread', () => {
//       describe('request', () => {
//         it('should set fetchingMessageThread to be true', () => {
//           let action = actions.sync.fetchMessageThreadRequest(); 

//           expect(initialState.working.fetchingMessageThread.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.fetchingMessageThread.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set fetchingMessageThread to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingMessageThread: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.fetchMessageThreadFailure(error);
          
//           expect(initialStateForTest.working.fetchingMessageThread.inProgress).to.be.true;
//           expect(initialStateForTest.working.fetchingMessageThread.notification).to.be.null;
//           expect(initialStateForTest.messageThread).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingMessageThread.inProgress).to.be.false;
//           expect(state.working.fetchingMessageThread.notification.type).to.equal('error');
//           expect(state.working.fetchingMessageThread.notification.message).to.equal(error);
//           expect(state.messageThread).to.be.null;
//         });
//       });

//       describe('success', () => {
//         it('should set fetchingMessageThread to be false and set patient', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { fetchingMessageThread: { inProgress : true, notification: null } } });
//           let messageThread = 'some message thread';
//           let action = actions.sync.fetchMessageThreadSuccess(messageThread);

//           expect(initialStateForTest.working.fetchingMessageThread.inProgress).to.be.true;
//           expect(initialStateForTest.messageThread).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.fetchingMessageThread.inProgress).to.be.false;
//           expect(state.messageThread).to.equal(messageThread);
//         });
//       });
//     });

//     describe('createPatient', () => {
//       describe('request', () => {
//         it('should set creatingPatient to be true', () => {
//           let action = actions.sync.createPatientRequest(); 

//           expect(initialState.working.creatingPatient.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.creatingPatient.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set creatingPatient to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, {
//             working: { 
//               creatingPatient: {
//                 inProgress: true,
//                 notification: null
//               }
//             } 
//           });
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.createPatientFailure(error);
          
//           expect(initialStateForTest.working.creatingPatient.inProgress).to.be.true;
//           expect(initialStateForTest.working.creatingPatient.notification).to.be.null;
//           expect(initialStateForTest.currentPatientInView).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.creatingPatient.inProgress).to.be.false;
//           expect(state.working.creatingPatient.notification.type).to.equal('error');
//           expect(state.working.creatingPatient.notification.message).to.equal(error);
//           expect(state.currentPatientInView).to.be.null;
//         });
//       });

//       describe('success', () => {
//         it('should set creatingPatient to be false and set patient', () => {
//           let initialStateForTest = _.merge({}, initialState, {
//             working: { 
//               creatingPatient: {
//                 inProgress: true,
//                 notification: null
//               }
//             },
//             loggedInUser: {
//             }
//           });
//           let patient = {
//             userid: '27',
//             profile: {
//               foo: 'bar'
//             }
//           };
//           let action = actions.sync.createPatientSuccess(patient);

//           expect(initialStateForTest.working.creatingPatient.inProgress).to.be.true;
//           expect(initialStateForTest.currentPatientInView).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.creatingPatient.inProgress).to.be.false;
//           expect(state.currentPatientInView).to.equal(patient);
//         });
//       });
//     });

//     describe('removePatient', () => {
//       describe('request', () => {
//         it('should set removingPatient to be true', () => {
//           let action = actions.sync.removePatientRequest(); 

//           expect(initialState.working.removingPatient.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.removingPatient.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set removingPatient to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.removePatientFailure(error);
          
//           expect(initialStateForTest.working.removingPatient.inProgress).to.be.true;
//           expect(initialStateForTest.working.removingPatient.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.removingPatient.inProgress).to.be.false;
//           expect(state.working.removingPatient.notification.type).to.equal('error');
//           expect(state.working.removingPatient.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set removingPatient to be false', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { removingPatient: { inProgress : true, notification: null } } });
//           let patientId = 15;
//           let action = actions.sync.removePatientSuccess(patientId);

//           expect(initialStateForTest.working.removingPatient.inProgress).to.be.true;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.removingPatient.inProgress).to.be.false;
//         });
//       });
//     });

//     describe('removeMember', () => {
//       describe('request', () => {
//         it('should set removingMember to be true', () => {
//           let action = actions.sync.removeMemberRequest(); 

//           expect(initialState.working.removingMember.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.removingMember.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set removingMember to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { 
//             working: { 
//               removingMember: { 
//                 inProgress: true, 
//                 notification: null
//               }
//             } 
//           });
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.removeMemberFailure(error);
          
//           expect(initialStateForTest.working.removingMember.inProgress).to.be.true;
//           expect(initialStateForTest.working.removingMember.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.removingMember.inProgress).to.be.false;
//           expect(state.working.removingMember.notification.type).to.equal('error');
//           expect(state.working.removingMember.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set removingMember to be false', () => {
//           let initialStateForTest = _.merge({}, initialState, { 
//             working: { 
//               removingMember: { 
//                 inProgress: true, 
//                 notification: null
//               }
//             } 
//           });
//           let memberId = 15;
//           let action = actions.sync.removeMemberSuccess(memberId);

//           expect(initialStateForTest.working.removingMember.inProgress).to.be.true;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.removingMember.inProgress).to.be.false;
//         });
//       });
//     });

//     describe('sendInvitation', () => {
//       describe('request', () => {
//         it('should set sendingInvitation to be true', () => {
//           let action = actions.sync.sendInvitationRequest(); 

//           expect(initialState.working.sendingInvitation.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.sendingInvitation.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set sendingInvitation to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { 
//             working: { 
//               sendingInvitation: {
//                 inProgress: true,
//                 notification: null
//               }
//             } 
//           });
//           let error = ErrorMessages.STANDARD;

//           let action = actions.sync.sendInvitationFailure(error);
          
//           expect(initialStateForTest.working.sendingInvitation.inProgress).to.be.true;
//           expect(initialStateForTest.working.sendingInvitation.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.sendingInvitation.inProgress).to.be.false;
//           expect(state.working.sendingInvitation.notification.type).to.equal('error');
//           expect(state.working.sendingInvitation.notification.message).to.equal(ErrorMessages.STANDARD);
//         });
//       });

//       describe('success', () => {
//         it('should set sendingInvitation to be false', () => {
//           let pendingInvites = [
//             { email: 'a@a.com', permissions: 'bar'}
//           ];

//           let initialStateForTest = _.merge(
//             {}, 
//             initialState, 
//             { 
//               working: { 
//                 sendingInvitation: {
//                   inProgress: true,
//                   notification: false
//                 }
//               },
//               pendingInvites: pendingInvites
//           });
          
//           let invitation = { email: 'f@f.com', permissions: 'foo' };
//           let action = actions.sync.sendInvitationSuccess(invitation);

//           expect(initialStateForTest.working.sendingInvitation.inProgress).to.be.true;
//           expect(initialStateForTest.pendingInvites.length).to.equal(pendingInvites.length);

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.sendingInvitation.inProgress).to.be.false;

//           expect(state.pendingInvites.length).to.equal(pendingInvites.length + 1);
//           expect(state.pendingInvites[0].email).to.equal(pendingInvites[0].email);
//           expect(state.pendingInvites[0].permissions).to.equal(pendingInvites[0].permissions);
//           expect(state.pendingInvites[1].email).to.equal(invitation.email);
//           expect(state.pendingInvites[1].permissions).to.equal(invitation.permissions);
//         });
//       });
//     });

//     describe('cancelInvitation', () => {
//       describe('request', () => {
//         it('should set cancellingInvitation to be true', () => {
//           let action = actions.sync.cancelInvitationRequest(); 

//           expect(initialState.working.cancellingInvitation.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.cancellingInvitation.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set cancellingInvitation to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { 
//             working: { 
//               cancellingInvitation: { 
//                 inProgress: true, 
//                 notification: null
//               }
//             } 
//           });
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.cancelInvitationFailure(error);
          
//           expect(initialStateForTest.working.cancellingInvitation.inProgress).to.be.true;
//           expect(initialStateForTest.working.cancellingInvitation.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.cancellingInvitation.inProgress).to.be.false;
//           expect(state.working.cancellingInvitation.notification.type).to.equal('error');
//           expect(state.working.cancellingInvitation.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set cancellingInvitation to be false', () => {
//           let pendingInvites = [
//             { email: 'a@a.com', permissions: 'bar'},
//             { email: 'f@f.com', permissions: 'foo' }
//           ];

//           let initialStateForTest = _.merge(
//             {}, 
//             initialState, 
//             { 
//               working: { 
//                 cancellingInvitation: { 
//                   inProgress: true, 
//                   notification: null
//                 }
//               },
//               pendingInvites: pendingInvites
//           });
          
//           let invitation = { email: 'f@f.com', permissions: 'foo' };
//           let action = actions.sync.cancelInvitationSuccess(invitation.email);

//           expect(initialStateForTest.working.cancellingInvitation.inProgress).to.be.true;
//           expect(initialStateForTest.pendingInvites.length).to.equal(pendingInvites.length);

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.cancellingInvitation.inProgress).to.be.false;

//           expect(state.pendingInvites.length).to.equal(pendingInvites.length - 1);
//           expect(state.pendingInvites[0].email).to.equal(pendingInvites[0].email);
//           expect(state.pendingInvites[0].permissions).to.equal(pendingInvites[0].permissions);
//         });
//       });
//     });

//     describe('setMemberPermissions', () => {
//       describe('request', () => {
//         it('should set settingMemberPermissions to be true', () => {
//           let action = actions.sync.setMemberPermissionsRequest(); 

//           expect(initialState.working.settingMemberPermissions.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.settingMemberPermissions.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set settingMemberPermissions to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, 
//             { working: 
//               { 
//                 settingMemberPermissions: {
//                   inProgress: true,
//                   notification: null
//                 }
//               } 
//             }
//           );
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.setMemberPermissionsFailure(error);
          
//           expect(initialStateForTest.working.settingMemberPermissions.inProgress).to.be.true;
//           expect(initialStateForTest.working.settingMemberPermissions.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.settingMemberPermissions.inProgress).to.be.false;
//           expect(state.working.settingMemberPermissions.notification.type).to.equal('error');
//           expect(state.working.settingMemberPermissions.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set settingMemberPermissions to be false', () => {
//           let pendingMemberships = [
//             { key: 'foo', creator: { userid: 500, name: 'Frank' } },
//             { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
//           ];

//           let patients = [
//             { userid: 506, name: 'Alice' }
//           ];

//           let initialStateForTest = _.merge(
//             {}, 
//             initialState, 
//             { 
//               working: { 
//                 settingMemberPermissions: {
//                   inProgress: true,
//                   notification: null
//                 }
//               }
//           });
          
//           let action = actions.sync.setMemberPermissionsSuccess(pendingMemberships[0]);

//           expect(initialStateForTest.working.settingMemberPermissions.inProgress).to.be.true;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.settingMemberPermissions.inProgress).to.be.false;
//         });
//       });
//     });

//     describe('acceptMembership', () => {
//       describe('request', () => {
//         it('should set acceptingMembership to be true', () => {
//           let action = actions.sync.acceptMembershipRequest(); 

//           expect(initialState.working.acceptingMembership.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.acceptingMembership.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set acceptingMembership to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { acceptingMembership: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.acceptMembershipFailure(error);
          
//           expect(initialStateForTest.working.acceptingMembership.inProgress).to.be.true;
//           expect(initialStateForTest.working.acceptingMembership.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.acceptingMembership.inProgress).to.be.false;
//           expect(state.working.acceptingMembership.notification.type).to.equal('error');
//           expect(state.working.acceptingMembership.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set acceptingMembership to be false', () => {
//           let pendingMemberships = [
//             { key: 'foo', creator: { userid: 500, name: 'Frank' } },
//             { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
//           ];

//           let patientsMap = {
//             506: { userid: 506, name: 'Alice' }
//           };

//           let initialStateForTest = _.merge(
//             {}, 
//             initialState, 
//             { 
//               working: { 
//                 acceptingMembership: { inProgress : true, notification: null }
//               },
//               pendingMemberships: pendingMemberships,
//               patientsMap: patientsMap
//           });
          
//           let action = actions.sync.acceptMembershipSuccess(pendingMemberships[0]);

//           expect(initialStateForTest.working.acceptingMembership.inProgress).to.be.true;
//           expect(initialStateForTest.pendingMemberships.length).to.equal(pendingMemberships.length);
//           expect(Object.keys(initialStateForTest.patientsMap).length).to.equal(Object.keys(patientsMap).length);

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.acceptingMembership.inProgress).to.be.false;

//           expect(state.pendingMemberships.length).to.equal(pendingMemberships.length - 1);
//           expect(state.pendingMemberships[0].key).to.equal(pendingMemberships[1].key);
//           expect(state.pendingMemberships[0].creator.userid).to.equal(pendingMemberships[1].creator.userid);

//           expect(Object.keys(state.patientsMap).length).to.equal(Object.keys(patientsMap).length + 1);
//         });
//       });
//     });

//     describe('dismissMembership', () => {
//       describe('request', () => {
//         it('should set dismissingMembership to be true', () => {
//           let action = actions.sync.dismissMembershipRequest(); 

//           expect(initialState.working.dismissingMembership.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.dismissingMembership.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set dismissingMembership to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { dismissingMembership: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not get a message thread!!';
//           let action = actions.sync.dismissMembershipFailure(error);
          
//           expect(initialStateForTest.working.dismissingMembership.inProgress).to.be.true;
//           expect(initialStateForTest.working.dismissingMembership.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.dismissingMembership.inProgress).to.be.false;
//           expect(state.working.dismissingMembership.notification.type).to.equal('error');
//           expect(state.working.dismissingMembership.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set dismissingMembership to be false', () => {
//           let pendingMemberships = [
//             { key: 'foo', creator: { userid: 500, name: 'Frank' } },
//             { key: 'jazz', creator: { userid: 505, name: 'Jess' } }
//           ];

//           let patientsMap = {
//             506: { userid: 506, name: 'Alice' }
//           };

//           let initialStateForTest = _.merge(
//             {}, 
//             initialState, 
//             { 
//               working: { 
//                 dismissingMembership: { inProgress : true, notification: null }
//               },
//               pendingMemberships: pendingMemberships,
//               patientsMap: patientsMap
//           });
          
//           let action = actions.sync.dismissMembershipSuccess(pendingMemberships[0]);

//           expect(initialStateForTest.working.dismissingMembership.inProgress).to.be.true;
//           expect(initialStateForTest.pendingMemberships.length).to.equal(pendingMemberships.length);
//           expect(Object.keys(initialStateForTest.patientsMap).length).to.equal(Object.keys(patientsMap).length);

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.dismissingMembership.inProgress).to.be.false;

//           expect(state.pendingMemberships.length).to.equal(pendingMemberships.length - 1);
//           expect(state.pendingMemberships[0].key).to.equal(pendingMemberships[1].key);
//           expect(state.pendingMemberships[0].creator.userid).to.equal(pendingMemberships[1].creator.userid);

//           expect(Object.keys(state.patientsMap).length).to.equal(Object.keys(patientsMap).length);
//         });
//       });
//     });

//     describe('updatePatient', () => {
//       describe('request', () => {
//         it('should set updatingPatient to be true', () => {
//           let action = actions.sync.updatePatientRequest(); 

//           expect(initialState.working.updatingPatient.inProgress).to.be.false;

//           let state = reducer(initialState, action);
//           expect(state.working.updatingPatient.inProgress).to.be.true;
//         });
//       });

//       describe('failure', () => {
//         it('should set updatingPatient to be false and set error', () => {
//           let initialStateForTest = _.merge({}, initialState, { working: { updatingPatient: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not update patient!!';
//           let action = actions.sync.updatePatientFailure(error);
          
//           expect(initialStateForTest.working.updatingPatient.inProgress).to.be.true;
//           expect(initialStateForTest.working.updatingPatient.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.updatingPatient.inProgress).to.be.false;
//           expect(state.working.updatingPatient.notification.type).to.equal('error');
//           expect(state.working.updatingPatient.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set updatingPatient to be false', () => {
//           let currentPatient = { userid: 506, name: 'Alice' };
//           let updatedPatient = { userid: 506, name: 'Alice Cooper' };

//           let initialStateForTest = _.merge(
//             {}, 
//             initialState, 
//             { 
//               working: { 
//                 updatingPatient: { inProgress : true, notification: null }
//               },
//               currentPatientInView: currentPatient
//           });
          
//           let action = actions.sync.updatePatientSuccess(updatedPatient);

//           expect(initialStateForTest.working.updatingPatient.inProgress).to.be.true;
//           expect(initialStateForTest.currentPatientInView.userid).to.equal(currentPatient.userid);
//           expect(initialStateForTest.currentPatientInView.name).to.equal(currentPatient.name);

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.updatingPatient.inProgress).to.be.false;

//           expect(state.currentPatientInView.userid).to.equal(updatedPatient.userid);
//           expect(state.currentPatientInView.name).to.equal(updatedPatient.name);
//         });
//       });
//     });

//     describe('updateUser', () => {
//       describe('request', () => {
//         it('should set updatingUser to be true', () => {
//           let updatingUser = { id: 506, name: 'Jimmy Hendrix' };

//           let user = { id: 506 };

//           let initialStateForTest = _.merge({}, initialState, { loggedInUser:  user });
//           let action = actions.sync.updateUserRequest(updatingUser); 

//           expect(initialStateForTest.working.updatingUser.inProgress).to.be.false;
//           expect(initialStateForTest.loggedInUser.id).to.equal(user.id);

//           let state = reducer(initialStateForTest, action);
//           expect(state.working.updatingUser.inProgress).to.be.true;
//           expect(state.loggedInUser.id).to.equal(updatingUser.id);
//           expect(state.loggedInUser.name).to.equal(updatingUser.name);
//         });
//       });

//       describe('failure', () => {
//         it('should set updatingUser to be false and set error', () => {
          
//           let initialStateForTest = _.merge({}, initialState, { working: { updatingUser: { inProgress : true, notification: null } } });
//           let error = 'Oh no, did not update patient!!';
//           let action = actions.sync.updateUserFailure(error);
          
//           expect(initialStateForTest.working.updatingUser.inProgress).to.be.true;
//           expect(initialStateForTest.working.updatingUser.notification).to.be.null;

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.updatingUser.inProgress).to.be.false;
//           expect(state.working.updatingUser.notification.type).to.equal('error');
//           expect(state.working.updatingUser.notification.message).to.equal(error);
//         });
//       });

//       describe('success', () => {
//         it('should set updatingUser to be false', () => {
//           let loggedInUser = { id: 506, name: 'Jimmy' };
//           let updatedUser = { id: 506, name: 'Jimmy Hendrix' };

//           let initialStateForTest = _.merge(
//             {}, 
//             initialState, 
//             { 
//               working: { 
//                 updatingUser: { inProgress : true, notification: null }
//               },
//               loggedInUser: loggedInUser
//           });
          
//           let action = actions.sync.updateUserSuccess(updatedUser);

//           expect(initialStateForTest.working.updatingUser.inProgress).to.be.true;
//           expect(initialStateForTest.loggedInUser.id).to.equal(loggedInUser.id);
//           expect(initialStateForTest.loggedInUser.name).to.equal(loggedInUser.name);

//           let state = reducer(initialStateForTest, action);
          
//           expect(state.working.updatingUser.inProgress).to.be.false;

//           expect(state.loggedInUser.id).to.equal(updatedUser.id);
//           expect(state.loggedInUser.name).to.equal(updatedUser.name);
//         });
//       });
//     });
//   });
// });
