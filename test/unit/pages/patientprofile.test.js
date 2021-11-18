/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
import mutationTracker from 'object-invariant-test-helper';

var assert = chai.assert;
var expect = chai.expect;

import { mapStateToProps, getFetchers } from '../../../app/pages/patientprofile/patientprofile';

describe('PatientProfile', () => {
  describe('getFetchers', () => {
    const stateProps = {
      user: { userid: '12345' },
      fetchingPendingSentInvites: {
        inProgress: false,
        completed: null,
      },
      fetchingAssociatedAccounts: {
        inProgress: false,
        completed: null,
      },
    };

    const ownProps = {
      match: {
        params: { id: '12345' }
      }
    };

    const dispatchProps = {
      fetchPatient: sinon.stub().returns('fetchPatient'),
      fetchPendingSentInvites: sinon.stub().returns('fetchPendingSentInvites'),
      fetchAssociatedAccounts: sinon.stub().returns('fetchAssociatedAccounts'),
      fetchPatientFromClinic: sinon.stub().returns('fetchPatientFromClinic'),
    };

    const api = {};

    it('should return an array containing the user fetcher from dispatchProps', () => {
      const result = getFetchers(dispatchProps, ownProps, stateProps, api);
      expect(result[0]).to.be.a('function');
      expect(result[0]()).to.equal('fetchPatient');
      expect(result[1]).to.be.a('function');
      expect(result[1]()).to.equal('fetchPendingSentInvites');
      expect(result[2]).to.be.a('function');
      expect(result[2]()).to.equal('fetchAssociatedAccounts');
    });

    it('should only add the associated accounts and pending invites fetchers if fetches are not already in progress or completed', () => {
      const standardResult = getFetchers(dispatchProps, ownProps, stateProps, api);
      expect(standardResult.length).to.equal(3);

      const inProgressResult = getFetchers(dispatchProps, ownProps, {
        user: { userid: '12345' },
        fetchingPendingSentInvites: {
          inProgress: true,
          completed: null,
        },
        fetchingAssociatedAccounts: {
          inProgress: true,
          completed: null,
        },
      }, api);

      expect(inProgressResult.length).to.equal(1);
      expect(inProgressResult[0]()).to.equal('fetchPatient');

      const completedResult = getFetchers(dispatchProps, ownProps, {
        user: { userid: '12345' },
        fetchingPendingSentInvites: {
          inProgress: false,
          completed: true,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: true,
        },
      }, api);

      expect(completedResult.length).to.equal(1);
      expect(completedResult[0]()).to.equal('fetchPatient');
    });

    it('should only add the associated accounts fetcher when viewing the profile of the logged-in user', () => {
      const standardResult = getFetchers(dispatchProps, ownProps, stateProps, api);
      expect(standardResult.length).to.equal(3);

      const loggedInUserResult = getFetchers(dispatchProps, {
        match: {
          params: { id: '12345' }
        }
      }, {
        user: { userid: '12345' },
        fetchingPendingSentInvites: {
          inProgress: false,
          completed: null,
        },
        fetchingAssociatedAccounts: {
          inProgress: false,
          completed: null,
        },
      }, dispatchProps, api);

      expect(loggedInUserResult.length).to.equal(3);
    });

    it('should only fetch the clinic patient if selectedClinicId is set, and the patient permissions are unavailable', () => {
      const standardResult = getFetchers(dispatchProps, ownProps, stateProps, api);
      expect(standardResult.length).to.equal(3);

      const clinicUserResult = getFetchers(dispatchProps, {
        match: {
          params: { id: '12345' }
        }
      }, {
        ...stateProps,
        selectedClinicId: 'clinic123',
        clinics: { clinic123: { patients: { '12345': { name: 'Jackie', permissions: { foo: 'bar' } } } } }
      }, dispatchProps, api);

      expect(clinicUserResult.length).to.equal(3);

      const clinicUserMissingPermissionsResult = getFetchers(dispatchProps, {
        match: {
          params: { id: '12345' }
        }
      }, {
        ...stateProps,
        selectedClinicId: 'clinic123',
        clinics: { clinic123: { patients: { '12345': { name: 'Jackie' } } } }
      }, dispatchProps, api);

      expect(clinicUserMissingPermissionsResult.length).to.equal(4);
      expect(clinicUserMissingPermissionsResult[3]).to.be.a('function');
      expect(clinicUserMissingPermissionsResult[3]()).to.equal('fetchPatientFromClinic');
    });
  });

  describe('mapStateToProps', () => {
    describe('logged-in user is PWD viewing own profile', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {userid: 'a1b2c3', permissions: {root: {}}}
        },
        currentPatientInViewId: 'a1b2c3',
        loggedInUserId: 'a1b2c3',
        working: {
          fetchingPatient: {inProgress: false, notification: null},
          fetchingUser: {inProgress: false, notification: null},
          fetchingPendingSentInvites: { inProgress: false, completed: null },
          fetchingAssociatedAccounts: { inProgress: false, completed: null },
          updatingDataDonationAccounts: { inProgress: false },
          updatingPatientBgUnits: { inProgress: false },
        },
      };

      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
      });

      it('should map allUsersMap.a1b2c3 to patient', () => {
        expect(result.patient).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.deep.equal(state.working.fetchingPatient.inProgress)
      });

      it('should map working.fetchingPendingSentInvites to fetchingPendingSentInvites', () => {
        expect(result.fetchingPendingSentInvites).to.deep.equal(state.working.fetchingPendingSentInvites)
      });

      it('should map working.fetchingAssociatedAccounts to fetchingAssociatedAccounts', () => {
        expect(result.fetchingAssociatedAccounts).to.deep.equal(state.working.fetchingAssociatedAccounts)
      });
    });

    describe('logged-in user is viewing a different PWD\'s profile', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {userid: 'a1b2c3', permissions: {root: {}}},
          d4e5f6: {userid: 'd4e5f6', permissions: {}}
        },
        currentPatientInViewId: 'd4e5f6',
        loggedInUserId: 'a1b2c3',
        working: {
          fetchingPatient: {inProgress: true, notification: null},
          fetchingUser: { inProgress: false, notification: null },
          fetchingPendingSentInvites: { inProgress: false, completed: null },
          fetchingAssociatedAccounts: { inProgress: false, completed: null },
          updatingDataDonationAccounts: { inProgress: false },
          updatingPatientBgUnits: { inProgress: false },
        },
      };

      const tracked = mutationTracker.trackObj(state);
      const result = mapStateToProps({blip: state});

      it('should not mutate the state', () => {
        expect(mutationTracker.hasMutated(tracked)).to.be.false;
      });

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should map working.fetchingUser.inProgress to fetchingUser', () => {
        expect(result.fetchingUser).to.equal(state.working.fetchingUser.inProgress);
      });

      it('should map allUsersMap.d4e5f6 to patient', () => {
        expect(result.patient).to.deep.equal(state.allUsersMap.d4e5f6);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.deep.equal(state.working.fetchingPatient.inProgress)
      });

      it('should map working.fetchingPendingSentInvites to fetchingPendingSentInvites', () => {
        expect(result.fetchingPendingSentInvites).to.deep.equal(state.working.fetchingPendingSentInvites)
      });

      it('should map working.fetchingAssociatedAccounts to fetchingAssociatedAccounts', () => {
        expect(result.fetchingAssociatedAccounts).to.deep.equal(state.working.fetchingAssociatedAccounts)
      });
    });
  });
});
