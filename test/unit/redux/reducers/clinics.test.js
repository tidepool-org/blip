/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import { clinics as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';
import { update } from 'lodash-es';

var expect = chai.expect;

describe('clinics', () => {
  describe('getClinicsSuccess', () => {
    it('should set clinics to state for clinician', () => {
      let initialStateForTest = {};
      let clinics = [{ id: 'clinicId123' }];
      let options = { clinicianId: 'clinicianId' };
      let action = actions.sync.getClinicsSuccess(clinics, options);
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId: {},
          },
          patients: {},
        },
      });
    });

    it('should set clinics to state for patient', () => {
      let initialStateForTest = {};
      let clinics = [{ id: 'clinicId123' }];
      let options = { patientId: 'patientId' };
      let action = actions.sync.getClinicsSuccess(clinics, options);
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        clinicId123: {
          id: 'clinicId123',
          clinicians: {},
          patients: {
            patientId: {},
          },
        },
      });
    });
  });

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

  describe('updateClinicSuccess', () => {
    it('should update specificied clinic state', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {},
          patients: {
            patientId: {},
          },
        },
      };
      let updatedClinic = {
        id: 'clinicId123',
        name: 'new clinic name',
        clinicians: {},
        patients: {
          patientId: {},
        },
      }
      let action = actions.sync.updateClinicSuccess('clinicId123', updatedClinic);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123).to.eql(updatedClinic)
    });
  });

  describe('fetchCliniciansFromClinicSuccess', () => {
    it('should add clinicians to specified clinic', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {},
          patients: {
            patientId: {},
          },
        },
      };
      let clinicians = [{
        id: 'clinicianId123',
        name: 'clinician123'
      }, {
        id: 'clinicianId456',
        name: 'clinician456'
      }];
      let action = actions.sync.fetchCliniciansFromClinicSuccess({clinicians, clinicId: 'clinicId123'});
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.clinicians.clinicianId123.name).to.eql('clinician123');
      expect(state.clinicId123.clinicians.clinicianId456.name).to.eql('clinician456');
    });
  });

  describe('updateClinicianSuccess', () => {
    it('should update clinician', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {
              id: 'clinicianId123',
              name: 'clinician123'
            }
          },
          patients: {
            patientId: {},
          },
        },
      };
      let updates = {
        id: 'clinicianId123',
        name: 'newClinician123'
      };
      let action = actions.sync.updateClinicianSuccess('clinicId123', 'clinicianId123', updates);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.clinicians.clinicianId123.name).to.eql('newClinician123');
    });
  });

  describe('deleteClinicianFromClinicSuccess', () => {
    it('should remove clinician', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {
              id: 'clinicianId123',
              name: 'clinician123'
            }
          },
          patients: {
            patientId: {},
          },
        },
      };
      let action = actions.sync.deleteClinicianFromClinicSuccess('clinicId123', 'clinicianId123');
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.clinicians).to.eql({});
    });
  });

  describe('sendClinicianInviteSuccess', () => {
    it('should add clinician by invite', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {
              id: 'clinicianId123',
              name: 'clinician123'
            }
          },
          patients: {
            patientId: {},
          },
        },
      };
      let invite = {
        inviteId: 'inviteId123',
        email: 'newClinician@domain.com'
      };
      let action = actions.sync.sendClinicianInviteSuccess(invite, 'clinicId123');
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.clinicians.inviteId123).to.eql(invite);
    });
  });

  describe('deleteClinicianInviteSuccess', () => {
    it('should remove clinician by invite', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {
              id: 'clinicianId123',
              name: 'clinician123'
            },
            inviteId123: {
              inviteId: 'inviteId123',
              email: 'newClinician@domain.com'
            }
          },
          patients: {
            patientId: {},
          },
        },
      };
      let action = actions.sync.deleteClinicianInviteSuccess('clinicId123', 'inviteId123');
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.clinicians).to.eql({
        clinicianId123: {
          id: 'clinicianId123',
          name: 'clinician123'
        }
      });
    });
  });

  describe('getClinicsForClinicianSuccess', () => {
    it('should add clinics with clinician attached to state', () => {
      let initialStateForTest = {};
      let clinics = [
        {
          clinic: {
            id: 'clinicId123'
          },
          clinician: {
            id: 'clinicianId1234'
          }
        },
        {
          clinic: {
            id: 'clinicId456'
          },
          clinician: {
            id: 'clinicianId4567'
          }
        }
      ]
      let action = actions.sync.getClinicsForClinicianSuccess(clinics);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.clinicians.clinicianId1234).to.eql(clinics[0].clinician);
      expect(state.clinicId456.clinicians.clinicianId4567).to.eql(clinics[1].clinician);
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
