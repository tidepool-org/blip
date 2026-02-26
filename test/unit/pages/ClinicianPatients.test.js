import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { mountWithProviders } from '../../utils/mountWithProviders';
import ClinicianPatients from '../../../app/pages/clinicworkspace/ClinicianPatients';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global assert */

const expect = chai.expect;
const assert = chai.assert;
const mockStore = configureStore([thunk]);

describe('ClinicianPatients', () => {
  let patient1 = {
    userid: 'patient1',
    username: 'patient1@test.ca',
    profile: {
      fullName: 'Patient One',
      patient: {
        birthday: '1999-01-01' ,
      }
    }
  };

  let patient2 = {
    userid: 'patient2',
    username: 'patient2@test.ca',
    profile: {
      fullName: 'Patient Two',
      patient: {
        birthday: '1999-02-02',
        mrn: 'mrn123'
      }
    }
  };

  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    patients: [
      patient1,
      patient2,
    ],
    api: {
      patient: {
        put: sinon.stub().callsArgWith(1, null, { stubbedUpdates: 'foo' }),
      },
      user: {
        createCustodialAccount: sinon.stub().callsArgWith(1, null, { userid: 'stubbedId' }),
      },
      access: {
        leaveGroup: sinon.stub(),
      },
    },
  };

  let noPatientProps = {
    ...defaultProps,
    patients: [],
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.access.leaveGroup.resetHistory();
    defaultProps.api.user.createCustodialAccount.resetHistory();
    defaultProps.api.patient.put.resetHistory();
  });

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const completedState = {
    ...defaultWorkingState,
    completed: true,
  };

  const loggedInUserId = 'clinicianUserId123';

  const clinicianUserId123 = {
    username: 'clinic@example.com',
    roles: ['CLINIC'],
    userid: 'clinicianUserId123',
  };

  const noPatientsState = {
    blip: {
      loggedInUserId,
      allUsersMap: { clinicianUserId123 },
      data: { metaData: {} },
      consentRecords: {},
      working: {
        updatingClinicPatient: defaultWorkingState,
        fetchingAssociatedAccounts: completedState,
        removingMembershipInOtherCareTeam: defaultWorkingState,
        updatingPatient: defaultWorkingState,
        creatingVCACustodialAccount: defaultWorkingState,
        sendingPatientDataProviderConnectRequest: defaultWorkingState,
        fetchingPatientsForClinic: defaultWorkingState,
        fetchingClinicMRNsForPatientFormValidation: defaultWorkingState,
      },
      patientListFilters: {
        isPatientListVisible: true,
        patientListSearchTextInput: '',
      }
    },
  };

  let store;

  const hasPatientsState = merge({}, noPatientsState, {
    blip: {
      ...noPatientsState.blip,
      allUsersMap: {
        clinicianUserId123,
        patient1,
        patient2,
      },
      membershipPermissionsInOtherCareTeams: {
        patient1: { view: {} },
        patient2: { custodian: {} },
      },
      patientListFilters: {
        isPatientListVisible: true,
        patientListSearchTextInput: '',
      }
    },
  });

  const renderComponent = (props, state) => {
    store = mockStore(state);
    return mountWithProviders(<ClinicianPatients {...props} />, { store });
  };

  context('patients hidden', () => {
    beforeEach(() => {
      const initialState = {
        blip: {
          ...hasPatientsState.blip,
          patientListFilters: { isPatientListVisible: false, patientListSearchTextInput: '' }
        }
      }

      renderComponent(defaultProps, initialState);
      store.clearActions();
      defaultProps.trackMetric.resetHistory();
    });

    it('should render a button that toggles patients to be visible', () => {
      const showAllButton = document.querySelector('.peopletable-names-showall');
      fireEvent.click(showAllButton);
      expect(store.getActions()).to.eql([{ type: 'SET_IS_PATIENT_LIST_VISIBLE', payload: { isVisible: true } }])
    })
  });

  context('no patients', () => {
    beforeEach(() => {
      renderComponent(noPatientProps, noPatientsState);
      defaultProps.trackMetric.resetHistory();
    });

    it('should render an empty table', () => {
      const table = document.querySelector('table');
      expect(table).to.not.be.null;
      expect(table.querySelectorAll('tr')).to.have.length(1); // header row only
      expect(document.querySelector('.table-empty-text').textContent).to.include('There are no results to show.');
    });

    it('should open a modal for adding a new patient', async () => {
      const addButton = document.querySelector('button#add-patient');
      expect(addButton.textContent).to.equal('Add New Patient');

      expect(document.querySelector('#addPatient')).to.be.null;
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(document.querySelector('#addPatient')).to.not.be.null;
      });

      expect(defaultProps.trackMetric.calledWith('Clinician - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const patientForm = document.querySelector('form#clinic-patient-form');
      expect(patientForm).to.not.be.null;

      const fullNameInput = document.querySelector('input[name="fullName"]');
      expect(fullNameInput.value).to.equal('');
      fireEvent.change(fullNameInput, { target: { value: 'Patient Name' } });
      expect(fullNameInput.value).to.equal('Patient Name');

      const birthDateInput = document.querySelector('input[name="birthDate"]');
      expect(birthDateInput.value).to.equal('');
      fireEvent.change(birthDateInput, { target: { value: '11/21/1999' } });
      expect(birthDateInput.value).to.equal('11/21/1999');

      const mrnInput = document.querySelector('input[name="mrn"]');
      expect(mrnInput.value).to.equal('');
      fireEvent.change(mrnInput, { target: { value: '123456' } });
      expect(mrnInput.value).to.equal('123456');

      const emailInput = document.querySelector('input[name="email"]');
      expect(emailInput.value).to.equal('');
      fireEvent.change(emailInput, { target: { value: 'patient@test.ca' } });
      expect(emailInput.value).to.equal('patient@test.ca');

      // should not show the dexcom connection section
      expect(document.querySelector('#connectDexcomWrapper')).to.be.null;

      store.clearActions();
      fireEvent.click(document.querySelector('button#addPatientConfirm'));

      await waitFor(() => {
        expect(defaultProps.api.user.createCustodialAccount.callCount).to.equal(1);
      });

      sinon.assert.calledWith(
        defaultProps.api.user.createCustodialAccount,
        {
          emails: ['patient@test.ca'],
          fullName: 'Patient Name',
          patient: { birthday: '1999-11-21', mrn: '123456' }
        }
      );

      expect(store.getActions()).to.eql([
        { type: 'CREATE_VCA_CUSTODIAL_ACCOUNT_REQUEST' },
        {
          type: 'CREATE_VCA_CUSTODIAL_ACCOUNT_SUCCESS',
          payload: {
            patientId: 'stubbedId',
            patient: { userid: 'stubbedId' },
          },
        },
      ]);
    });

    it('should prevent adding a new patient with an invalid birthday', async () => {
      const addButton = document.querySelector('button#add-patient');
      expect(addButton.textContent).to.equal('Add New Patient');

      expect(document.querySelector('#addPatient')).to.be.null;
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(document.querySelector('#addPatient')).to.not.be.null;
      });

      expect(defaultProps.trackMetric.calledWith('Clinician - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const patientForm = document.querySelector('form#clinic-patient-form');
      expect(patientForm).to.not.be.null;

      const fullNameInput = document.querySelector('input[name="fullName"]');
      expect(fullNameInput.value).to.equal('');
      fireEvent.change(fullNameInput, { target: { value: 'Patient Name' } });
      expect(fullNameInput.value).to.equal('Patient Name');

      const birthDateInput = document.querySelector('input[name="birthDate"]');
      expect(birthDateInput.value).to.equal('');
      fireEvent.change(birthDateInput, { target: { value: '13/21/1999' } });
      expect(birthDateInput.value).to.equal('13/21/1999');

      const mrnInput = document.querySelector('input[name="mrn"]');
      expect(mrnInput.value).to.equal('');
      fireEvent.change(mrnInput, { target: { value: '123456' } });
      expect(mrnInput.value).to.equal('123456');

      const emailInput = document.querySelector('input[name="email"]');
      expect(emailInput.value).to.equal('');
      fireEvent.change(emailInput, { target: { value: 'patient@test.ca' } });
      expect(emailInput.value).to.equal('patient@test.ca');

      expect(document.querySelector('button#addPatientConfirm').disabled).to.be.true;

      fireEvent.change(birthDateInput, { target: { value: '11/21/1999' } });
      expect(birthDateInput.value).to.equal('11/21/1999');
      
      await waitFor(() => {
        expect(document.querySelector('button#addPatientConfirm').disabled).to.be.false;
      });
    });
  });

  context('has patients', () => {
    beforeEach(() => {
      defaultProps.trackMetric.resetHistory();
      renderComponent(defaultProps, hasPatientsState);
      store.clearActions();
    });

    describe('showNames', function () {
      it('should show a row of data for each person', function () {
        // 2 people plus one row for the header
        expect(document.querySelectorAll('.MuiTableRow-root')).to.have.length(3);
      });

      it('should trigger a call to trackMetric', function () {
        fireEvent.click(document.querySelector('#patients-view-toggle'));
        expect(defaultProps.trackMetric.calledWith('Clicked Hide All')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);
      });

      it('should not have instructions displayed', function () {
        expect(document.querySelectorAll('.peopletable-instructions')).to.have.length(0);
      });
    });

    context('show names clicked', () => {
      beforeEach(() => {
        defaultProps.trackMetric.resetHistory();
      });

      it('should render a list of patients', () => {
        const table = document.querySelector('table');
        expect(table).to.not.be.null;
        const rows = table.querySelectorAll('tr');
        expect(rows).to.have.length(3); // header row + 2 invites
        expect(rows[1].textContent).to.include('Patient One');
        expect(rows[1].textContent).to.include('1999-01-01');
        expect(rows[2].textContent).to.include('Patient Two');
        expect(rows[2].textContent).to.include('1999-02-02');
        expect(rows[2].textContent).to.include('mrn123');
      });

      it('should allow searching patients', () => {
        const table = document.querySelector('table');
        expect(table).to.not.be.null;
        const rows = table.querySelectorAll('tr');
        expect(rows).to.have.length(3); // header row + 2 invites
        expect(rows[1].textContent).to.include('Patient One');
        expect(rows[2].textContent).to.include('Patient Two');

        const searchInput = document.querySelector('input[name="search-patients"]');
        expect(searchInput).to.not.be.null;

        // Input partial match on name for patient two
        fireEvent.change(searchInput, { target: { value: 'Two' } });
        expect(store.getActions()).to.eql([
          { type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT', payload: { textInput: 'Two' } },
          { type: 'SET_IS_PATIENT_LIST_VISIBLE', payload: { isVisible: true } } // a search query should automatically toggle the visibility to true
        ])
      });

      it('should link to a patient data view when patient name is clicked', () => {
        const table = document.querySelector('table');
        expect(table).to.not.be.null;
        const rows = table.querySelectorAll('tr');
        expect(rows).to.have.length(3); // header row + 2 invites
        const firstPatientName = rows[1].querySelector('th span');
        expect(firstPatientName.textContent).to.include('Patient One');

        store.clearActions();
        fireEvent.click(firstPatientName);

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data']}
          },
        ]);
      });

      it('should link to a patient data view when patient birthday is clicked', () => {
        const table = document.querySelector('table');
        expect(table).to.not.be.null;
        const rows = table.querySelectorAll('tr');
        expect(rows).to.have.length(3); // header row + 2 invites
        const firstPatientBirthday = rows[1].querySelectorAll('td')[0].querySelectorAll('span')[1];
        expect(firstPatientBirthday.textContent).to.include('1999-01-01');

        store.clearActions();
        fireEvent.click(firstPatientBirthday);

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data']}
          },
        ]);
      });

      it('should display menu when "More" icon is clicked', async () => {
        const moreMenuIcon = document.querySelectorAll('[aria-label="info"]')[0];
        fireEvent.click(moreMenuIcon);
        await waitFor(() => {
          expect(document.querySelector('#action-menu-patient1')).to.not.be.null;
          expect(document.querySelector('#action-menu-patient1').style.visibility).to.not.equal('hidden');
        });
      });

      it('should not show the patient edit link for non-custodial patient accounts', async () => {
        const table = document.querySelector('table');
        expect(table).to.not.be.null;
        const rows = table.querySelectorAll('tr');
        expect(rows).to.have.length(3); // header row + 2 invites
        const patientRow1 = rows[1];
        const patientRow2 = rows[2];

        expect(patientRow1.textContent).to.include('Patient One');
        
        // Open popover for patient 1
        const moreMenuIcon1 = patientRow1.querySelector('[aria-label="info"]');
        fireEvent.click(moreMenuIcon1);
        
        await waitFor(() => {
          expect(document.querySelector('#action-menu-patient1').style.visibility).to.not.equal('hidden');
        });
        
        assert(!hasPatientsState.blip.membershipPermissionsInOtherCareTeams.patient1.custodian);
        const patient1EditButton = document.querySelector('#action-menu-patient1').querySelector('button#edit-patient1');
        expect(patient1EditButton).to.be.null;
        
        // Close popover
        fireEvent.keyDown(document.querySelector('#action-menu-patient1'), { key: 'Escape', code: 'Escape' });
        await waitFor(() => {
          expect(document.querySelector('#action-menu-patient1').style.visibility).to.equal('hidden');
        });

        expect(patientRow2.textContent).to.include('Patient Two');
        assert(hasPatientsState.blip.membershipPermissionsInOtherCareTeams.patient2.custodian);
        
        // Open popover for patient 2
        const moreMenuIcon2 = patientRow2.querySelector('[aria-label="info"]');
        fireEvent.click(moreMenuIcon2);
        
        await waitFor(() => {
          expect(document.querySelector('#action-menu-patient2').style.visibility).to.not.equal('hidden');
        });
        
        const patient2EditButton = document.querySelector('#action-menu-patient2').querySelector('button#edit-patient2');
        expect(patient2EditButton).to.not.be.null;
      });

      it('should open a modal for patient editing when edit link is clicked', async () => {
        const table = document.querySelector('table');
        expect(table).to.not.be.null;
        const rows = table.querySelectorAll('tr');
        expect(rows).to.have.length(3); // header row + 2 invites
        
        // Open popover for patient 2
        const moreMenuIcon2 = rows[2].querySelector('[aria-label="info"]');
        fireEvent.click(moreMenuIcon2);
        
        await waitFor(() => {
          expect(document.querySelector('#action-menu-patient2').style.visibility).to.not.equal('hidden');
        });
        
        const editButton = document.querySelector('#action-menu-patient2').querySelector('button#edit-patient2');

        expect(document.querySelector('#editPatient')).to.be.null;
        fireEvent.click(editButton);
        
        await waitFor(() => {
          expect(document.querySelector('#editPatient')).to.not.be.null;
        });

        expect(defaultProps.trackMetric.calledWith('Clinician - Edit patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        const patientForm = document.querySelector('form#clinic-patient-form');
        expect(patientForm).to.not.be.null;

        const fullNameInput = document.querySelector('input[name="fullName"]');
        expect(fullNameInput.value).to.equal('Patient Two');
        fireEvent.change(fullNameInput, { target: { value: 'Patient 2' } });
        expect(fullNameInput.value).to.equal('Patient 2');

        const birthDateInput = document.querySelector('input[name="birthDate"]');
        expect(birthDateInput.value).to.equal('02/02/1999');
        fireEvent.change(birthDateInput, { target: { value: '01/01/1999' } });
        expect(birthDateInput.value).to.equal('01/01/1999');

        const mrnInput = document.querySelector('input[name="mrn"]');
        expect(mrnInput.value).to.equal('mrn123');
        fireEvent.change(mrnInput, { target: { value: 'mrn456' } });
        expect(mrnInput.value).to.equal('MRN456');

        const emailInput = document.querySelector('input[name="email"]');
        expect(emailInput.value).to.equal('patient2@test.ca');
        fireEvent.change(emailInput, { target: { value: 'patient-two@test.ca' } });
        expect(emailInput.value).to.equal('patient-two@test.ca');

        // should not show the dexcom connection section
        expect(document.querySelector('#connectDexcomWrapper')).to.be.null;

        store.clearActions();
        fireEvent.click(document.querySelector('button#editPatientConfirm'));

        await waitFor(() => {
          expect(defaultProps.api.patient.put.callCount).to.equal(1);
        });

        sinon.assert.calledWith(
          defaultProps.api.patient.put,
          {
            emails: ['patient-two@test.ca'],
            permissions: undefined,
            profile: {
              emails: ['patient-two@test.ca'],
              fullName: 'Patient 2',
              patient: { birthday: '1999-01-01', mrn: 'MRN456' },
            },
            userid: 'patient2',
            username: 'patient-two@test.ca',
          }
        );

        expect(store.getActions()).to.eql([
          { type: 'UPDATE_PATIENT_REQUEST' },
          {
            type: 'UPDATE_PATIENT_SUCCESS',
            payload: {
              updatedPatient: { stubbedUpdates: 'foo' },
            },
          },
        ]);
      });

      it('should remove a patient', async () => {
        const table = document.querySelector('table');
        expect(table).to.not.be.null;
        const rows = table.querySelectorAll('tr');
        expect(rows).to.have.length(3); // header row + 2 invites
        
        // Open popover for patient 1
        const moreMenuIcon1 = rows[1].querySelector('[aria-label="info"]');
        fireEvent.click(moreMenuIcon1);
        
        await waitFor(() => {
          expect(document.querySelector('#action-menu-patient1').style.visibility).to.not.equal('hidden');
        });
        
        const removeButton = document.querySelector('#action-menu-patient1').querySelector('button#delete-patient1');

        expect(document.querySelector('#deleteUser').style.visibility).to.equal('hidden');
        fireEvent.click(removeButton);
        
        await waitFor(() => {
          expect(document.querySelector('#deleteUser').style.visibility).to.not.equal('hidden');
        });

        expect(defaultProps.trackMetric.calledWith('Clinician - Remove patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        const confirmRemoveButton = document.querySelector('button#patientRemoveConfirm');
        expect(confirmRemoveButton.textContent).to.equal('Remove');

        store.clearActions();

        fireEvent.click(confirmRemoveButton);

        expect(store.getActions()).to.eql([
          { type: 'REMOVE_MEMBERSHIP_IN_OTHER_CARE_TEAM_REQUEST' },
        ]);

        sinon.assert.calledWith(defaultProps.api.access.leaveGroup, 'patient1');

        expect(defaultProps.trackMetric.calledWith('Clinician - Remove patient confirmed')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(2);
      });
    });
  });
});
