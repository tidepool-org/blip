/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import { clinics as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('clinics', () => {
  describe('createClinicSuccess', () => {
    it('should add clinic to state', () => {
      let initialStateForTest = {};
      let clinic = { id: 'one' };
      let action = actions.sync.createClinicSuccess(clinic);
      let state = reducer(initialStateForTest, action);
      expect(state[clinic.id].clinicians).to.eql({});
      expect(state[clinic.id].patients).to.eql({});
    });
  });

  describe('getClinicsSuccess', () => {
    it('should set clinics to state for clinician', () => {
      let initialStateForTest = {};
      let clinics = [{ id: 'clinicId' }];
      let options = { clinicianId: 'clinicianId' };
      let action = actions.sync.getClinicsSuccess(clinics, options);
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        clinicId: {
          id: 'clinicId',
          clinicians: {
            clinicianId: {},
          },
          patients: {},
        },
      });
    });

    it('should set clinics to state for patient', () => {
      let initialStateForTest = {};
      let clinics = [{ id: 'clinicId' }];
      let options = { patientId: 'patientId' };
      let action = actions.sync.getClinicsSuccess(clinics, options);
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        clinicId: {
          id: 'clinicId',
          clinicians: {},
          patients: {
            patientId: {},
          },
        },
      });
    });
  });

  describe('logoutRequest', () => {
    it('should set clinics to initial state', () => {
      let initialStateForTest = {
        clinicId: {
          id: 'clinicId',
          clinicians: {},
          patients: {
            patientId: {},
          },
        },
      };
      let action = actions.sync.logoutRequest();
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({});
    });
  });
});
