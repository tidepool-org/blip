/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global expect */

import { clinics as reducer } from '../../../../app/redux/reducers/misc';

import * as actions from '../../../../app/redux/actions/index';

var expect = chai.expect;

describe('clinics', () => {
  describe('getClinicsSuccess', () => {
    it('should set clinics to state for clinician', () => {
      let initialStateForTest = {};
      let clinics = [{ id: 'clinicId123' }];
      let action = actions.sync.getClinicsSuccess(clinics);
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        clinicId123: {
          id: 'clinicId123',
          clinicians: {},
          patients: {},
          patientInvites: {},
        },
      });
    });

    it('should set clinics to state for patient', () => {
      let initialStateForTest = {};
      let clinics = [{ id: 'clinicId123' }];
      let action = actions.sync.getClinicsSuccess(clinics);
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql({
        clinicId123: {
          id: 'clinicId123',
          clinicians: {},
          patients: {},
          patientInvites: {},
        },
      });
    });
  });

  describe('fetchPatientsForClinicSuccess', () => {
    it('should add patients to a clinic', () => {
      let initialStateForTest = {};
      let clinicId = 'clinicId123';
      let clinic = { id: clinicId };
      let patients = [{ id: 'patientId123' }, { id: 'patientId456' }];
      let action = actions.sync.fetchPatientsForClinicSuccess(clinicId, patients);
      let state = reducer(initialStateForTest, action);
      expect(state[clinic.id].patients.patientId123).to.eql({ id: 'patientId123', sortIndex: 0 });
      expect(state[clinic.id].patients.patientId456).to.eql({ id: 'patientId456', sortIndex: 1 });
    });
  });

  describe('fetchPatientsForClinicFailure', () => {
    it('should do nothing for 500 error', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {},
          patients: {
            patientId: {},
          },
        },
      };
      let err = new Error('server error');
      err.status = 500;
      let action = actions.sync.fetchPatientsForClinicFailure(
        err,
        null,
        'clinicId123'
      );
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql(initialStateForTest);
    });

    it('should clear patients for a 403 unauthorized error', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {},
          patients: {
            patientId: {},
          },
        },
      };
      let err = new Error('auth error');
      err.status = 403;
      let action = actions.sync.fetchPatientsForClinicFailure(
        err,
        null,
        'clinicId123'
      );
      let state = reducer(initialStateForTest, action);
      expect(state['clinicId123'].patients).to.eql({});
    });
  });

  describe('fetchPatientInvitesSuccess', () => {
    it('should add patient invites to a clinic', () => {
      let initialStateForTest = {};
      let clinicId = 'clinicId123';
      let clinic = { id: clinicId };
      let patientInvites = [{ key: 'patientId123' }];
      let action = actions.sync.fetchPatientInvitesSuccess(clinicId, patientInvites);
      let state = reducer(initialStateForTest, action);
      expect(state[clinic.id].patientInvites.patientId123).to.eql({ key: 'patientId123' });
    });
  });

  describe('acceptPatientInvitationSuccess', () => {
    it('should remove the patient invites from a clinic and increase the patientCount', () => {
      let initialStateForTest = {
        clinicId123: {
          patientCount: 2,
          patientInvites: {
            patientId123: { key: 'patientId123' },
            patientId456: { key: 'patientId456' },
          },
        },
      };
      let clinicId = 'clinicId123';
      let clinic = { id: clinicId };
      let inviteId = 'patientId123';
      let action = actions.sync.acceptPatientInvitationSuccess(clinicId, inviteId);
      let state = reducer(initialStateForTest, action);
      expect(state[clinic.id].patientInvites.patientId123).to.be.undefined;
      expect(state[clinic.id].patientInvites.patientId456).to.eql({ key: 'patientId456' });
      expect(state[clinic.id].patientCount).to.equal(3);
    });
  });

  describe('deletePatientInvitationSuccess', () => {
    it('should remove the patient invites from a clinic', () => {
      let initialStateForTest = {
        clinicId123: {
          patientInvites: {
            patientId123: { key: 'patientId123' },
            patientId456: { key: 'patientId456' },
          },
        },
      };
      let clinicId = 'clinicId123';
      let clinic = { id: clinicId };
      let inviteId = 'patientId123';
      let action = actions.sync.deletePatientInvitationSuccess(clinicId, inviteId);
      let state = reducer(initialStateForTest, action);
      expect(state[clinic.id].patientInvites.patientId123).to.be.undefined;
      expect(state[clinic.id].patientInvites.patientId456).to.eql({ key: 'patientId456' });
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

  describe('fetchClinicSuccess', () => {
    it('should add clinic to state', () => {
      let initialStateForTest = {};
      let clinic = { id: 'one', patients: { p1: 'patient' } };
      let action = actions.sync.fetchClinicSuccess(clinic);
      let state = reducer(initialStateForTest, action);
      expect(state[clinic.id].clinicians).to.eql({});
      expect(state[clinic.id].patients).to.eql({ p1: 'patient' });
      expect(state[clinic.id].id).to.eql('one');
    });

    it('should update clinic already stored to state', () => {
      let initialStateForTest = { one: { foo: 'bar', patients: { abc: 123 } }};
      let clinic = { id: 'one', foo: 'baz' };
      let action = actions.sync.fetchClinicSuccess(clinic);
      let state = reducer(initialStateForTest, action);
      expect(state[clinic.id].foo).to.eql('baz');
      expect(state[clinic.id].patients).to.eql({ abc: 123 });
    });
  });

  describe('fetchClinicsByIdsSuccess', () => {
    it('should add clinic to state', () => {
      let initialStateForTest = {};
      let clinics = {
        one: { id: 'one', patients: { p1: 'patient' } },
        two: { id: 'two', patients: { p2: 'patient2' } },
      };
      let action = actions.sync.fetchClinicsByIdsSuccess(clinics);
      let state = reducer(initialStateForTest, action);
      expect(state['one'].patients).to.eql({ p1: 'patient' });
      expect(state['two'].patients).to.eql({ p2: 'patient2' });
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

  describe('fetchCliniciansFromClinicFailure', () => {
    it('should do nothing for 500 error', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {
              id: 'clinicianId123',
              name: 'clinician123',
            },
            clinicianId456: {
              id: 'clinicianId456',
              name: 'clinician456',
            },
          },
          patients: {
            patientId: {},
          },
        },
      };
      let err = new Error('server error');
      err.status = 500;
      let action = actions.sync.fetchCliniciansFromClinicFailure(
        err,
        null,
        'clinicId123'
      );
      let state = reducer(initialStateForTest, action);
      expect(state).to.eql(initialStateForTest);
    });

    it('should clear clinicians for a 403 unauthorized error', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {
              id: 'clinicianId123',
              name: 'clinician123',
            },
            clinicianId456: {
              id: 'clinicianId456',
              name: 'clinician456',
            },
          },
          patients: {
            patientId: {},
          },
        },
      };
      let err = new Error('auth error');
      err.status = 403;
      let action = actions.sync.fetchCliniciansFromClinicFailure(
        err,
        null,
        'clinicId123'
      );
      let state = reducer(initialStateForTest, action);
      expect(state['clinicId123'].clinicians).to.eql({});
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

  describe('updateClinicPatientSuccess', () => {
    it('should update clinic patient', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {}
          },
          patients: {
            patient123: {
              id: 'patient123',
              name: 'Patient OneTwoThree',
            },
          },
        },
      };
      let patient = {
        id: 'patient123',
        name: 'Patient 123',
      };
      let action = actions.sync.updateClinicPatientSuccess('clinicId123', 'patient123', patient);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patient123.name).to.eql('Patient 123');
    });
  });

  describe('createClinicCustodialAccountSuccess', () => {
    it('should add clinic patient and increase accounts by 1', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          clinicians: {
            clinicianId123: {}
          },
          patients: {},
          fetchedPatientCount: 0,
          patientCount: 0,
        },
      };
      let patient = {
        id: 'patient123',
        name: 'Patient 123',
      };
      let action = actions.sync.createClinicCustodialAccountSuccess('clinicId123', 'patient123', patient);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patient123.name).to.eql('Patient 123');
      expect(state.clinicId123.fetchedPatientCount).to.eql(1);
      expect(state.clinicId123.patientCount).to.eql(1);
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

  describe('deletePatientFromClinicSuccess', () => {
    it('should remove patient and decrease counts by 1', () => {
      let initialStateForTest = {
        clinicId123: {
          id: 'clinicId123',
          patients: {
            patientId123: {
              id: 'patientId123',
              name: 'patient123'
            }
          },
          fetchedPatientCount: 1,
          patientCount: 1,
          clinicians: {
            clinicianId: {},
          },
        },
      };
      let action = actions.sync.deletePatientFromClinicSuccess('clinicId123', 'patientId123');
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients).to.eql({});
      expect(state.clinicId123.fetchedPatientCount).to.eql(0);
      expect(state.clinicId123.patientCount).to.eql(0);
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
              name: 'clinician123',
            },
            inviteId123: {
              inviteId: 'inviteId123',
              email: 'newClinician@domain.com',
            },
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
          name: 'clinician123',
        },
      });
    });
  });

  describe('getClinicsForClinicianSuccess', () => {
    it('should add clinics with clinician attached to state', () => {
      let initialStateForTest = {};
      let clinics = [
        {
          clinic: {
            id: 'clinicId123',
          },
          clinician: {
            id: 'clinicianId1234',
          },
        },
        {
          clinic: {
            id: 'clinicId456',
          },
          clinician: {
            id: 'clinicianId4567',
          },
        },
      ];
      let action = actions.sync.getClinicsForClinicianSuccess(clinics);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.clinicians.clinicianId1234).to.eql(clinics[0].clinician);
      expect(state.clinicId456.clinicians.clinicianId4567).to.eql(clinics[1].clinician);
    });
  });

  describe('fetchClinicsForPatient', () => {
    it('should add clinics with patient attached to state', () => {
      let initialStateForTest = {};
      let clinics = [
        {
          clinic: {
            id: 'clinicId123',
          },
          patient: {
            id: 'patientId1234',
          },
        },
        {
          clinic: {
            id: 'clinicId456',
          },
          patient: {
            id: 'patientId4567',
          },
        },
      ];
      let action = actions.sync.fetchClinicsForPatientSuccess(clinics);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patientId1234).to.eql(clinics[0].patient);
      expect(state.clinicId456.patients.patientId4567).to.eql(clinics[1].patient);
    });
  });

  describe('updatePatientPermissions', () => {
    it('should update patient permissions in state', () => {
      let clinicId = 'clinicId123';
      let patientId = 'patientId1234';
      let viewOnlyPermissions = { view: {} };
      let updatePermissions = { view: {}, update: {} };
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patients: {
            [patientId]: {
              permissions: viewOnlyPermissions,
            },
          },
        },
      };
      let action = actions.sync.updatePatientPermissionsSuccess(clinicId, patientId, updatePermissions);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patientId1234.permissions).to.eql(updatePermissions);
    });
  });

  describe('fetchClinicMRNSettingsSuccess', () => {
    it('should add clinic MRN settings to state', () => {
      let clinicId = 'clinicId123';
      let mrnSettings = {
        required: true,
        unique: true,
      };
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
        },
      };
      let action = actions.sync.fetchClinicMRNSettingsSuccess(
        clinicId,
        mrnSettings
      );
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.mrnSettings).to.eql(mrnSettings);
    });
  });

  describe('fetchClinicEHRSettingsSuccess', () => {
    it('should add clinic EHR settings to state', () => {
      let clinicId = 'clinicId123';
      let ehrSettings = {
        enabled: true,
        facility: 'facility',
        sourceId: 'sourceId',
      };
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
        },
      };
      let action = actions.sync.fetchClinicEHRSettingsSuccess(
        clinicId,
        ehrSettings
      );
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.ehrSettings).to.eql(ehrSettings);
    });
  });

  describe('triggerInitialClinicMigrationSuccess', () => {
    it('should set the `canMigrate` state of the clinic to `false`', () => {
      let clinicId = 'clinicId123';
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          canMigrate: true,
        },
      };
      let action = actions.sync.triggerInitialClinicMigrationSuccess(clinicId);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.canMigrate).to.be.false;
    });
  });

  describe('sendPatientUploadReminderSuccess', () => {
    it('should update patient `lastUploadReminderTime` in state', () => {
      let clinicId = 'clinicId123';
      let patientId = 'patientId123';
      const lastUploadReminderTime = '2022-10-10T00:00:000Z';
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patients: {
            [patientId]: {},
          },
        },
      };
      let action = actions.sync.sendPatientUploadReminderSuccess(clinicId, patientId, lastUploadReminderTime);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patientId123.lastUploadReminderTime).to.eql(lastUploadReminderTime);
    });
  });

  describe('fetchTideDashboardPatientsSuccess', () => {
    it('should set clinic.patients to patients returned in report', () => {
      let clinicId = 'clinicId123';

      const payload = {
        config: { clinicId },
        results: {
          timeInVeryLowPercent: [{
            patient: { id: 'timeInVeryLowPercentID'}
          }],
          timeInAnyLowPercent: [{
            patient: { id: 'timeInAnyLowPercentID'}
          }],
          dropInTimeInTargetPercent: [{
            patient: { id: 'dropInTimeInTargetPercentID'}
          }],
          timeInTargetPercent: [{
            patient: { id: 'timeInTargetPercentID'}
          }],
          timeCGMUsePercent: [{
            patient: { id: 'timeCGMUsePercentID'}
          }],
          meetingTargets: [{
            patient: { id: 'meetingTargetsID'}
          }],
          noData: [{
            patient: { id: 'noDataID'}
          }],
        }
      }

      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patients: {},
        },
      };

      let action = actions.sync.fetchTideDashboardPatientsSuccess(payload);
      let state = reducer(initialStateForTest, action);

      expect(state.clinicId123.patients).to.eql({
        timeInVeryLowPercentID: {
          id: 'timeInVeryLowPercentID',
        },
        timeInAnyLowPercentID: {
          id: 'timeInAnyLowPercentID',
        },
        dropInTimeInTargetPercentID: {
          id: 'dropInTimeInTargetPercentID',
        },
        timeInTargetPercentID: {
          id: 'timeInTargetPercentID',
        },
        timeCGMUsePercentID: {
          id: 'timeCGMUsePercentID',
        },
        meetingTargetsID: {
          id: 'meetingTargetsID',
        },
        noDataID: {
          id: 'noDataID',
        },
      });
    });
  });

  describe('setClinicPatientLastReviewedSuccess', () => {
    it('should update patient `lastReviewed` and `previousLastReviewed` in state', () => {
      let clinicId = 'clinicId123';
      let patientId = 'patientId123';
      const clinicianId = 'clinicianId123';

      const lastReviewed = {
        clinicianId,
        time: '2022-10-10T00:00:000Z',
      };
      const previousLastReviewed = {
        clinicianId,
        time: '2022-10-02T00:00:000Z',
      };

      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patients: {
            [patientId]: {},
          },
        },
      };
      let action = actions.sync.setClinicPatientLastReviewedSuccess(clinicId, patientId, [lastReviewed, previousLastReviewed]);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patientId123.reviews).to.eql([lastReviewed, previousLastReviewed]);
    });
  });

  describe('revertClinicPatientLastReviewedSuccess', () => {
    it('should update patient `lastReviewed` and `previousLastReviewed` in state', () => {
      let clinicId = 'clinicId123';
      let patientId = 'patientId123';
      const clinicianId = 'clinicianId123';

      const lastReviewed = {
        clinicianId,
        time: '2022-10-10T00:00:000Z',
      };
      const previousLastReviewed = {
        clinicianId,
        time: '2022-10-02T00:00:000Z',
      };

      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patients: {
            [patientId]: {},
          },
        },
      };
      let action = actions.sync.revertClinicPatientLastReviewedSuccess(clinicId, patientId, [lastReviewed, previousLastReviewed]);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patientId123.reviews).to.eql([lastReviewed, previousLastReviewed]);
    });
  });

  describe('sendPatientDexcomConnectRequestSuccess', () => {
    it('should update patient `lastRequestedDexcomConnectTime` in state', () => {
      let clinicId = 'clinicId123';
      let patientId = 'patientId123';
      const lastRequestedDexcomConnectTime = '2022-10-10T00:00:000Z';
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patients: {
            [patientId]: {},
          },
        },
      };
      let action = actions.sync.sendPatientDexcomConnectRequestSuccess(clinicId, patientId, lastRequestedDexcomConnectTime);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patients.patientId123.lastRequestedDexcomConnectTime).to.eql(lastRequestedDexcomConnectTime);
    });
  });

  describe('createClinicPatientTagSuccess', () => {
    it('should update `patientTags` in state', () => {
      let clinicId = 'clinicId123';
      let patientTags = ['patientTag123'];
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patientTags: [],
        },
      };
      let action = actions.sync.createClinicPatientTagSuccess(clinicId, patientTags);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patientTags).to.eql(patientTags);
    });
  });

  describe('updateClinicPatientTagSuccess', () => {
    it('should update `patientTags` in state', () => {
      let clinicId = 'clinicId123';
      let patientTags = ['patientTag456'];
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patientTags: ['patientTag123'],
        },
      };
      let action = actions.sync.updateClinicPatientTagSuccess(clinicId, patientTags);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patientTags).to.eql(patientTags);
    });
  });

  describe('deleteClinicPatientTagSuccess', () => {
    it('should update `patientTags` in state', () => {
      let clinicId = 'clinicId123';
      let patientTags = ['patientTag123'];
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patientTags: ['patientTag123', 'patientTag456'],
        },
      };
      let action = actions.sync.deleteClinicPatientTagSuccess(clinicId, patientTags);
      let state = reducer(initialStateForTest, action);
      expect(state.clinicId123.patientTags).to.eql(patientTags);
    });
  });

  describe('fetchClinicPatientCountSuccess', () => {
    it('should update `patientCount` in state', () => {
      let clinicId = 'clinicId123';
      let results = { patientCount: 33 };
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patientCount: 32,
        },
      };
      let action = actions.sync.fetchClinicPatientCountSuccess(clinicId, results);
      let state = reducer(initialStateForTest, action);
      expect(state[clinicId].patientCount).to.eql(33);
    });
  });

  describe('fetchClinicPatientCountSettingsSuccess', () => {
    it('should update `patientCountSettings` in state', () => {
      let clinicId = 'clinicId123';
      let results = { foo: 'bar' };
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patientCountSettings: { bar: 'baz' },
        },
      };
      let action = actions.sync.fetchClinicPatientCountSettingsSuccess(clinicId, results);
      let state = reducer(initialStateForTest, action);
      expect(state[clinicId].patientCountSettings).to.eql({ foo: 'bar' });
    });
  });

  describe('setClinicUIDetails', () => {
    it('should merge the provided `uiDetails` with clinic state', () => {
      let clinicId = 'clinicId123';
      let uiDetails = { foo: 'bar', bar: 'baz' };
      let initialStateForTest = {
        [clinicId]: {
          id: clinicId,
          patientCount: 1,
        },
      };
      let action = actions.sync.setClinicUIDetails(clinicId, uiDetails);
      let state = reducer(initialStateForTest, action);
      expect(state[clinicId]).to.eql({
        id: clinicId,
        patientCount: 1,
        foo: 'bar',
        bar: 'baz',
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
