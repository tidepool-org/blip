import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Table from '../../../app/components/elements/Table';
import ClinicPatients from '../../../app/pages/clinicworkspace/ClinicPatients';
import Popover from '../../../app/components/elements/Popover';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('ClinicPatients', () => {
  let mount;

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    searchDebounceMs: 0,
    api: {
      clinics: {
        getPatientsForClinic: sinon.stub(),
        deletePatientFromClinic: sinon.stub(),
        createClinicCustodialAccount: sinon.stub().callsArgWith(2, null, { id: 'stubbedId' }),
        updateClinicPatient: sinon.stub().callsArgWith(3, null, { id: 'stubbedId', stubbedUpdates: 'foo' }),
      },
    },
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.getPatientsForClinic.resetHistory();
    defaultProps.api.clinics.deletePatientFromClinic.resetHistory();
    defaultProps.api.clinics.createClinicCustodialAccount.resetHistory();
    defaultProps.api.clinics.updateClinicPatient.resetHistory();
  });

  after(() => {
    mount.cleanUp();
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
    email: 'clinic@example.com',
    roles: ['CLINIC_ADMIN'],
    id: 'clinicianUserId123',
  };

  const noPatientsState = {
    blip: {
      loggedInUserId,
      clinics: {
        clinicID123: {
          clinicians:{
            clinicianUserId123,
          },
          patients: {},
          id: 'clinicID123',
          address: '2 Address Ln, City Zip',
          name: 'other_clinic_name',
          email: 'other_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 444-4444',
              type: 'Office',
            },
          ],
        },
      },
      selectedClinicId: 'clinicID123',
      working: {
        fetchingPatientsForClinic: completedState,
        deletingPatientFromClinic: defaultWorkingState,
        updatingClinicPatient: defaultWorkingState,
        creatingClinicCustodialAccount: defaultWorkingState,
      },
    },
  };

  let store;

  const hasPatientsState = merge({}, noPatientsState, {
    blip: {
      allUsersMap: {
        clinicianUserId123,
      },
      clinics: {
        clinicID123: {
          clinicians:{
            clinicianUserId123,
          },
          patients: {
            patient1: {
              id: 'patient1',
              email: 'patient1@test.ca',
              fullName: 'Patient One',
              birthDate: '1999-01-01' ,
            },
            patient2: {
              id: 'patient2',
              email: 'patient2@test.ca',
              fullName: 'Patient Two',
              birthDate: '1999-02-02',
              mrn: 'mrn123'
            },
          },
          id: 'clinicID123',
          address: '2 Address Ln, City Zip',
          name: 'other_clinic_name',
          email: 'other_clinic_email_address@example.com',
          phoneNumbers: [
            {
              number: '(888) 444-4444',
              type: 'Office',
            },
          ],
        },
      },
    },
  });

  const nonAdminPatientsState = {
    blip: {
      ...hasPatientsState.blip,
      clinics: {
        clinicID123: {
          ...hasPatientsState.blip.clinics.clinicID123,
          clinicians: {
            clinicianUserId123: {
              ...clinicianUserId123,
              roles: ['CLINIC_MEMBER'],
            },
          },
        },
      },
    },
  };

  context('no patients', () => {
    beforeEach(() => {
      store = mockStore(noPatientsState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      wrapper.find('button#patients-view-toggle').simulate('click');
      defaultProps.trackMetric.resetHistory();
    });

    it('should render an empty table', () => {
      const table = wrapper.find(Table);
      expect(table).to.have.length(1);
      expect(table.find('tr')).to.have.length(1); // header row only
      expect(wrapper.find('.table-empty-text').hostNodes().text()).includes('There are no results to show.');
    });

    it('should open a modal for adding a new patient', done => {
      const addButton = wrapper.find('button#add-patient');
      expect(addButton.text()).to.equal('Add a New Patient');

      const dialog = () => wrapper.find('Dialog#addPatient');

      expect(dialog().props().open).to.be.false;
      addButton.simulate('click');
      wrapper.update();
      expect(dialog().props().open).to.be.true;

      expect(defaultProps.trackMetric.calledWith('Clinic - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const patientForm = () => dialog().find('form#clinic-patient-form');
      expect(patientForm()).to.have.lengthOf(1);

      expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('');
      patientForm().find('input[name="fullName"]').simulate('change', { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient Name');

      expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('');
      patientForm().find('input[name="birthDate"]').simulate('change', { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('11/21/1999');

      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('');
      patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: '123456' } });
      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('123456');

      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('');
      patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient@test.ca' } });
      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient@test.ca');

      expect(patientForm().find('input[name="attestationSubmitted"]').prop('checked')).to.be.false;
      patientForm().find('input[name="attestationSubmitted"]').simulate('change', { persist: noop, target: { name: 'attestationSubmitted', value: true } });
      expect(patientForm().find('input[name="attestationSubmitted"]').prop('checked')).to.be.true;

      store.clearActions();
      dialog().find('Button#addPatientConfirm').simulate('click');

      setTimeout(() => {
        expect(defaultProps.api.clinics.createClinicCustodialAccount.callCount).to.equal(1);

        sinon.assert.calledWith(
          defaultProps.api.clinics.createClinicCustodialAccount,
          'clinicID123',
          {
            fullName: 'Patient Name',
            birthDate: '1999-11-21',
            mrn: '123456',
            email: 'patient@test.ca',
          }
        );

        expect(store.getActions()).to.eql([
          { type: 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST' },
          {
            type: 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS',
            payload: {
              clinicId: 'clinicID123',
              patientId: 'stubbedId',
              patient: { id: 'stubbedId' },
            },
          },
        ]);

        done();
      }, 0);
    });
  });

  context('has patients', () => {
    beforeEach(() => {
      store = mockStore(hasPatientsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    describe('showNames', function () {
      it('should show a row of data for each person', function () {
        wrapper.find('button#patients-view-toggle').simulate('click');
        // 2 people plus one row for the header
        expect(wrapper.find('.MuiTableRow-root')).to.have.length(3);
      });

      it('should trigger a call to trackMetric', function () {
        wrapper.find('button#patients-view-toggle').simulate('click');
        expect(defaultProps.trackMetric.calledWith('Clicked Show All')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);
      });

      it('should not have instructions displayed', function () {
        wrapper.find('button#patients-view-toggle').simulate('click');
        expect(wrapper.find('.peopletable-instructions')).to.have.length(0);
      });
    });

    context('show names clicked', () => {
      beforeEach(() => {
        wrapper.find('button#patients-view-toggle').simulate('click');
        defaultProps.trackMetric.resetHistory();
      });

      it('should render a list of patients', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        expect(table.find('tr').at(1).text()).contains('Patient One');
        expect(table.find('tr').at(1).text()).contains('1999-01-01');
        expect(table.find('tr').at(2).text()).contains('Patient Two');
        expect(table.find('tr').at(2).text()).contains('1999-02-02');
        expect(table.find('tr').at(2).text()).contains('mrn123');
      });

      it('should allow searching patients', (done) => {
        const table = () => wrapper.find(Table);
        expect(table()).to.have.length(1);
        expect(table().find('tr')).to.have.length(3); // header row + 2 invites
        expect(table().find('tr').at(1).text()).contains('Patient One');
        expect(table().find('tr').at(2).text()).contains('Patient Two');

        const searchInput = wrapper.find('input[name="search-patients"]');
        expect(searchInput).to.have.lengthOf(1);

        // Clear the store actions
        store.clearActions();

        // Input partial match on name for patient two
        searchInput.simulate('change', { target: { name: 'search-patients', value: 'Two' } });

        setTimeout(() => {
          expect(store.getActions()).to.eql([
            { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
          ]);

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', { limit: 8, offset: 0, search: 'Two', sort: '+fullName' });
          done();
        }, 300);
      });

      it('should link to a patient data view when patient name is clicked', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const firstPatientName = table.find('tr').at(1).find('th').find('div').at(1).hostNodes();
        expect(firstPatientName.text()).contains('Patient One');

        store.clearActions();
        firstPatientName.simulate('click');

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data']}
          },
        ]);
      });

      it('should link to a patient data view when patient birthday is clicked', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const firstPatientBirthday = table.find('tr').at(1).find('td').at(0).find('div').at(1).hostNodes();
        expect(firstPatientBirthday.text()).contains('1999-01-01');

        store.clearActions();
        firstPatientBirthday.simulate('click');

        expect(store.getActions()).to.eql([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data']}
          },
        ]);
      });

      it('should display menu when "More" icon is clicked', () => {
        const moreMenuIcon = wrapper.find('PopoverMenu').find('Icon').at(0);
        expect(wrapper.find(Popover).at(0).props().open).to.be.false;
        moreMenuIcon.simulate('click');
        expect(wrapper.find(Popover).at(0).props().open).to.be.true;
      });

      it('should open a modal for patient editing when edit link is clicked', done => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const editButton = table.find('tr').at(2).find('Button[iconLabel="Edit Patient Information"]');

        const dialog = () => wrapper.find('Dialog#editPatient');

        expect(dialog().props().open).to.be.false;
        editButton.simulate('click');
        wrapper.update();
        expect(dialog().props().open).to.be.true;

        expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        const patientForm = () => dialog().find('form#clinic-patient-form');
        expect(patientForm()).to.have.lengthOf(1);

        expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient Two');
        patientForm().find('input[name="fullName"]').simulate('change', { persist: noop, target: { name: 'fullName', value: 'Patient 2' } });
        expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient 2');

        expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('02/02/1999');
        patientForm().find('input[name="birthDate"]').simulate('change', { persist: noop, target: { name: 'birthDate', value: '01/01/1999' } });
        expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('01/01/1999');

        expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('mrn123');
        patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: 'mrn456' } });
        expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('mrn456');

        expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient2@test.ca');
        patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient-two@test.ca' } });
        expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient-two@test.ca');

        store.clearActions();
        dialog().find('Button#editPatientConfirm').simulate('click');

        setTimeout(() => {
          expect(defaultProps.api.clinics.updateClinicPatient.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.updateClinicPatient,
            'clinicID123',
            'patient2',
            {
              fullName: 'Patient 2',
              birthDate: '1999-01-01',
              mrn: 'mrn456',
              id: 'patient2',
              email: 'patient-two@test.ca',
            }
          );

          expect(store.getActions()).to.eql([
            { type: 'UPDATE_CLINIC_PATIENT_REQUEST' },
            {
              type: 'UPDATE_CLINIC_PATIENT_SUCCESS',
              payload: {
                clinicId: 'clinicID123',
                patientId: 'stubbedId',
                patient: { id: 'stubbedId', stubbedUpdates: 'foo' },
              },
            },
          ]);

          done();
        }, 0);
      });

      it('should remove a patient', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const removeButton = table.find('tr').at(1).find('Button[iconLabel="Remove Patient"]');

        expect(wrapper.find('Dialog#deleteUser').props().open).to.be.false;
        removeButton.simulate('click');
        wrapper.update();
        expect(wrapper.find('Dialog#deleteUser').props().open).to.be.true;

        expect(defaultProps.trackMetric.calledWith('Clinic - Remove patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        const confirmRemoveButton = wrapper.find('Dialog#deleteUser').find('Button#patientRemoveConfirm');
        expect(confirmRemoveButton.text()).to.equal('Remove');

        store.clearActions();

        confirmRemoveButton.simulate('click');
        expect(store.getActions()).to.eql([
          { type: 'DELETE_PATIENT_FROM_CLINIC_REQUEST' },
        ]);

        sinon.assert.calledWith(defaultProps.api.clinics.deletePatientFromClinic, 'clinicID123', 'patient1');

        expect(defaultProps.trackMetric.calledWith('Clinic - Remove patient confirmed')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(2);
      });

      it('should refetch patients with updated sort parameter when name or birthday headers are clicked', () => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);

        const patientHeader = table.find('#peopleTable-header-fullName .MuiTableSortLabel-root').at(0);
        expect(patientHeader.text()).to.equal('Patient');

        defaultProps.api.clinics.getPatientsForClinic.resetHistory();
        patientHeader.simulate('click');
        sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-fullName' }));

        defaultProps.api.clinics.getPatientsForClinic.resetHistory();
        patientHeader.simulate('click');
        sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+fullName' }));

        const birthdayHeader = table.find('#peopleTable-header-birthDate .MuiTableSortLabel-root').at(0);
        expect(birthdayHeader.text()).to.equal('Birthday');

        defaultProps.api.clinics.getPatientsForClinic.resetHistory();
        birthdayHeader.simulate('click');
        sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+birthDate' }));

        defaultProps.api.clinics.getPatientsForClinic.resetHistory();
        birthdayHeader.simulate('click');
        sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-birthDate' }));
      });

      context('non-admin clinician', () => {
        beforeEach(() => {
          store = mockStore(nonAdminPatientsState);
          defaultProps.trackMetric.resetHistory();
          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <ClinicPatients {...defaultProps} />
              </ToastProvider>
            </Provider>
          );

          wrapper.find('button#patients-view-toggle').simulate('click');
        });

        it('should not render the remove button', () => {
          const table = wrapper.find(Table);
          expect(table).to.have.length(1);
          expect(table.find('tr')).to.have.length(3); // header row + 2 invites
          const removeButton = table.find('tr').at(1).find('.remove-clinic-patient');
          expect(removeButton).to.have.lengthOf(0);
        });
      });
    });
  });
});
