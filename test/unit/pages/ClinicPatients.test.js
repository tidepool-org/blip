import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import moment from 'moment';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Table from '../../../app/components/elements/Table';
import ClinicPatients from '../../../app/pages/clinicworkspace/ClinicPatients';
import Popover from '../../../app/components/elements/Popover';
import { MMOLL_UNITS, MGDL_UNITS } from '../../../app/core/constants';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

const expect = chai.expect;
const assert = chai.assert;
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
        sendPatientUploadReminder: sinon.stub().callsArgWith(2, null, { lastUploadReminderTime: '2022-02-02T00:00:00.000Z'}),
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
        sendingPatientUploadReminder: defaultWorkingState,
      },
    },
  };

  let store = mockStore(noPatientsState);

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

  const tier0100ClinicState = {
    blip: {
      ...hasPatientsState.blip,
      clinics: {
        clinicID123: {
          ...hasPatientsState.blip.clinics.clinicID123,
          // tier: 'tier0100',
        },
      },
    },
  };

  const tier0200ClinicState = {
    blip: {
      ...hasPatientsState.blip,
      clinics: {
        clinicID123: {
          ...hasPatientsState.blip.clinics.clinicID123,
          tier: 'tier0200',
          patients: {
            patient1: {
              id: 'patient1',
              email: 'patient1@test.ca',
              fullName: 'Patient One',
              birthDate: '1999-01-01',
              mrn: 'mrn012',
              summary: {},
              permissions: { custodian : {} }
            },
            patient2: {
              id: 'patient2',
              email: 'patient2@test.ca',
              fullName: 'Patient Two',
              birthDate: '1999-02-02',
              mrn: 'mrn123',
              summary:{
                lastUploadDate: moment().toISOString(),
                averageGlucose: { units: MMOLL_UNITS },
                percentTimeCGMUse: 0.85,
                glucoseManagementIndicator: 7.75,
                lastData: moment().toISOString(),
                firstData: moment().subtract(23, 'hours').toISOString(),
              },
              permissions: { custodian : undefined }
            },
            patient3: {
              id: 'patient3',
              email: 'patient3@test.ca',
              fullName: 'Patient Three',
              birthDate: '1999-03-03',
              mrn: 'mrn456',
              summary: {
                lastUploadDate: moment().subtract(1, 'day').toISOString(),
                averageGlucose: { units: MGDL_UNITS },
                percentTimeCGMUse: 0.70,
                glucoseManagementIndicator: 6.5,
                lastData: moment().toISOString(),
                firstData: moment().subtract(7, 'days').toISOString(),
              },
            },
            patient4: {
              id: 'patient4',
              email: 'patient4@test.ca',
              fullName: 'Patient Four',
              birthDate: '1999-04-04',
              mrn: 'mrn789',
              summary: {
                lastUploadDate: moment().subtract(29, 'days').toISOString(),
                averageGlucose: { units: MMOLL_UNITS },
                percentTimeCGMUse: 0.69,
                glucoseManagementIndicator: undefined,
                lastData: moment().toISOString(),
                firstData: moment().subtract(7, 'days').toISOString(),
              },
            },
            patient5: {
              id: 'patient5',
              email: 'patient5@test.ca',
              fullName: 'Patient Five',
              birthDate: '1999-05-05',
              mrn: 'mrn101',
              summary: {
                lastUploadDate: moment().subtract(30, 'days').toISOString(),
                averageGlucose: { units: MGDL_UNITS },
                percentTimeCGMUse: 0.69,
                glucoseManagementIndicator: undefined,
              },
            },
          }
        },
      },
    },
  };

  const tier0200ClinicStateMmoll = {
    blip: {
      ...tier0200ClinicState.blip,
      clinics: {
        clinicID123: {
          ...tier0200ClinicState.blip.clinics.clinicID123,
          preferredBgUnits: 'mmol/L',
        },
      },
    },
  };

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

  context('on mount', () => {
    beforeEach(() => {
      store.clearActions();
    });
    it('should not fetch patients for clinic if already in progress', () => {
      store = mockStore(
        merge({}, hasPatientsState, {
          blip: {
            working: {
              fetchingPatientsForClinic: {
                inProgress: true,
              },
            },
          },
        })
      );
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      expect(store.getActions()).to.eql([]);
    });

    it('should fetch patients for clinic', () => {
      store = mockStore(hasPatientsState);

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      const expectedActions = [
        { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
      ];
      expect(store.getActions()).to.eql(expectedActions);
    });

    it('should fetch patients for clinic if previously errored', () => {
      store = mockStore(
        merge({}, hasPatientsState, {
          blip: {
            working: {
              fetchingPatientsForClinic: {
                notification: {
                  message: 'Errored',
                },
              },
            },
          },
        })
      );
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
      const expectedActions = [
        { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
      ];
      expect(store.getActions()).to.eql(expectedActions);
    });
  });

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

      wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
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
      expect(addButton.text()).to.equal('Add New Patient');

      const dialog = () => wrapper.find('Dialog#addPatient');

      expect(dialog()).to.have.length(0);
      addButton.simulate('click');
      wrapper.update();
      expect(dialog()).to.have.length(1);
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

    it('should prevent adding a new patient with an invalid birthday', () => {
      const addButton = wrapper.find('button#add-patient');
      expect(addButton.text()).to.equal('Add New Patient');

      const dialog = () => wrapper.find('Dialog#addPatient');

      expect(dialog()).to.have.length(0);
      addButton.simulate('click');
      wrapper.update();
      expect(dialog()).to.have.length(1);
      expect(dialog().props().open).to.be.true;

      expect(defaultProps.trackMetric.calledWith('Clinic - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const patientForm = () => dialog().find('form#clinic-patient-form');
      expect(patientForm()).to.have.lengthOf(1);

      expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('');
      patientForm().find('input[name="fullName"]').simulate('change', { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient Name');

      expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('');
      patientForm().find('input[name="birthDate"]').simulate('change', { persist: noop, target: { name: 'birthDate', value: '13/21/1999' } });
      expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('13/21/1999');

      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('');
      patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: '123456' } });
      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('123456');

      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('');
      patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient@test.ca' } });
      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient@test.ca');

      expect(dialog().find('Button#addPatientConfirm').prop('disabled')).to.be.true;

      patientForm().find('input[name="birthDate"]').simulate('change', { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('11/21/1999');
      expect(dialog().find('Button#addPatientConfirm').prop('disabled')).to.be.false;
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
        wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
        // 2 people plus one row for the header
        expect(wrapper.find('.MuiTableRow-root')).to.have.length(3);
      });

      it('should trigger a call to trackMetric', function () {
        wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
        expect(defaultProps.trackMetric.calledWith('Clicked Show All')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);
      });

      it('should not have instructions displayed', function () {
        wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
        expect(wrapper.find('.peopletable-instructions')).to.have.length(0);
      });
    });

    context('show names clicked', () => {
      beforeEach(() => {
        wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
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
        expect(wrapper.find(Popover).at(1).props().open).to.be.false;
        moreMenuIcon.simulate('click');
        expect(wrapper.find(Popover).at(1).props().open).to.be.true;
      });

      it('should open a modal for patient editing when edit link is clicked', done => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const editButton = table.find('tr').at(2).find('Button[iconLabel="Edit Patient Information"]');

        const dialog = () => wrapper.find('Dialog#editPatient');

        expect(dialog()).to.have.length(0);
        editButton.simulate('click');
        wrapper.update();
        expect(dialog()).to.have.length(1);
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

      context('tier0100 clinic', () => {
        beforeEach(() => {
          store = mockStore(tier0100ClinicState);

          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <ClinicPatients {...defaultProps} />
              </ToastProvider>
            </Provider>
          );

          wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
          defaultProps.trackMetric.resetHistory();
        });

        it('should show the standard table columns', () => {
          const table = wrapper.find(Table);
          expect(table).to.have.length(1);

          const columns = table.find('.MuiTableCell-head');
          expect(columns.at(0).text()).to.equal('Patient Details');
          assert(columns.at(0).is('#peopleTable-header-fullName'));

          expect(columns.at(1).text()).to.equal('Birthday');
          assert(columns.at(1).is('#peopleTable-header-birthDate'));

          expect(columns.at(2).text()).to.equal('MRN');
          assert(columns.at(2).is('#peopleTable-header-mrn'));
        });

        it('should refetch patients with updated sort parameter when name or birthday headers are clicked', () => {
          const table = wrapper.find(Table);
          expect(table).to.have.length(1);

          const patientHeader = table.find('#peopleTable-header-fullName .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          patientHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-fullName' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          patientHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+fullName' }));

          const birthdayHeader = table.find('#peopleTable-header-birthDate .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          birthdayHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+birthDate' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          birthdayHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-birthDate' }));
        });
      });

      context('tier0200 clinic', () => {
        beforeEach(() => {
          store = mockStore(tier0200ClinicState);

          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <ClinicPatients {...defaultProps} />
              </ToastProvider>
            </Provider>
          );

          wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
          defaultProps.trackMetric.resetHistory();
        });

        it('should show and format patient data appropriately based on availablity', () => {
          const emptyStatText = '--';

          const table = wrapper.find(Table);
          expect(table).to.have.length(1);

          const columns = table.find('.MuiTableCell-head');
          expect(columns.at(0).text()).to.equal('Patient Details');
          assert(columns.at(0).is('#peopleTable-header-fullName'));

          expect(columns.at(1).text()).to.equal('');
          assert(columns.at(1).is('#peopleTable-header-patientSecondary'));

          expect(columns.at(2).text()).to.equal('Last Upload (CGM)');
          assert(columns.at(2).is('#peopleTable-header-summary-lastUploadDate'));

          expect(columns.at(3).text()).to.equal('% CGM Use');
          assert(columns.at(3).is('#peopleTable-header-summary-percentTimeCGMUse'));

          expect(columns.at(4).text()).to.equal('% GMI');
          assert(columns.at(4).is('#peopleTable-header-summary-glucoseManagementIndicator'));

          expect(columns.at(5).text()).to.equal('% Time in Range');
          assert(columns.at(5).is('#peopleTable-header-bgRangeSummary'));

          const rows = table.find('tbody tr');
          expect(rows).to.have.lengthOf(5);

          const rowData = row => rows.at(row).find('.MuiTableCell-root');

          // Patient name and email in first column
          expect(rowData(0).at(0).text()).contains('Patient One');
          expect(rowData(0).at(0).text()).contains('patient1@test.ca');

          // Patient birth date and mrn in second column
          expect(rowData(0).at(1).text()).contains('1999-01-01');
          expect(rowData(0).at(1).text()).contains('mrn012');

          // Last upload date in third column
          expect(rowData(0).at(2).text()).contains(emptyStatText);
          expect(rowData(1).at(2).text()).contains('Today');
          expect(rowData(2).at(2).text()).contains('Yesterday');
          expect(rowData(3).at(2).text()).contains('30 days ago');
          expect(rowData(4).at(2).text()).to.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/); // match YYYY-MM-DD format

          // CGM use in fourth column
          expect(rowData(0).at(3).text()).contains(emptyStatText);
          expect(rowData(1).at(3).text()).contains('85 %');
          expect(rowData(2).at(3).text()).contains('70 %');
          expect(rowData(3).at(3).text()).contains('69 %');

          // GMI in fifth column
          expect(rowData(0).at(4).text()).contains(emptyStatText);
          expect(rowData(1).at(4).text()).contains('7.8 %');
          expect(rowData(2).at(4).text()).contains('6.5 %');
          expect(rowData(3).at(4).text()).contains(emptyStatText);

          // BG summary in sixth column
          expect(rowData(0).at(5).text()).contains('CGM Use <24 hours'); // empty summary
          expect(rowData(1).at(5).text()).contains('CGM Use <24 hours'); // 23 hours of data

          expect(rowData(2).at(5).find('.range-summary-bars').hostNodes()).to.have.lengthOf(1);
          expect(rowData(2).at(5).find('.range-summary-stripe-overlay').hostNodes()).to.have.lengthOf(0); // normal bars

          expect(rowData(3).at(5).find('.range-summary-bars').hostNodes()).to.have.lengthOf(1);
          expect(rowData(3).at(5).find('.range-summary-stripe-overlay').hostNodes()).to.have.lengthOf(1); // striped bars for <70% cgm use
        });

        it('should refetch patients with updated sort parameter when name, last upload, gmi, or cgm use headers are clicked', () => {
          const table = wrapper.find(Table);
          expect(table).to.have.length(1);

          const patientHeader = table.find('#peopleTable-header-fullName .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          patientHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-fullName' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          patientHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+fullName' }));

          const lastUploadHeader = table.find('#peopleTable-header-summary-lastUploadDate .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          lastUploadHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+summary.lastUploadDate' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          lastUploadHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-summary.lastUploadDate' }));

          const cgmUseHeader = table.find('#peopleTable-header-summary-percentTimeCGMUse .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          cgmUseHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+summary.percentTimeCGMUse' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          cgmUseHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-summary.percentTimeCGMUse' }));

          const gmiHeader = table.find('#peopleTable-header-summary-glucoseManagementIndicator .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          gmiHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+summary.glucoseManagementIndicator' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          gmiHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-summary.glucoseManagementIndicator' }));
        });

        it('should allow refreshing the patient list and maintain', () => {
          const refreshButton = wrapper.find('#refresh-patients').hostNodes();
          expect(refreshButton).to.have.lengthOf(1);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          refreshButton.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ limit: 10, offset: 0, sort: '+fullName' }));
        });

        it('should show the time since the last patient data fetch', () => {
          const timeAgoMessage = () => wrapper.find('#last-refresh-time-ago').hostNodes().text();
          expect(timeAgoMessage()).to.equal('Last updated less than an hour ago');
        });

        it('should allow filtering by last upload', () => {
          const lastUploadFilterTrigger = wrapper.find('#last-upload-filter-trigger').hostNodes();
          expect(lastUploadFilterTrigger).to.have.lengthOf(1);

          const popover = () => wrapper.find('#lastUploadDateFilters').hostNodes();
          expect(popover().props().style.visibility).to.equal('hidden');

          // Open filters popover
          lastUploadFilterTrigger.simulate('click');
          expect(popover().props().style.visibility).to.be.undefined;

          // Ensure filter options present
          const filterOptions = popover().find('#last-upload-filters').find('label').hostNodes();
          expect(filterOptions).to.have.lengthOf(4);
          expect(filterOptions.at(0).text()).to.equal('Today');
          expect(filterOptions.at(0).find('input').props().value).to.equal('1');

          expect(filterOptions.at(1).text()).to.equal('Last 2 days');
          expect(filterOptions.at(1).find('input').props().value).to.equal('2');

          expect(filterOptions.at(2).text()).to.equal('Last 14 days');
          expect(filterOptions.at(2).find('input').props().value).to.equal('14');

          expect(filterOptions.at(3).text()).to.equal('Last 30 days');
          expect(filterOptions.at(3).find('input').props().value).to.equal('30');

          // Apply button disabled until selection made
          const applyButton = () => popover().find('#apply-last-upload-filter').hostNodes();
          expect(applyButton().props().disabled).to.be.true;

          filterOptions.at(3).find('input').last().simulate('change', { target: { name: 'last-upload-filters', value: 30 } });
          expect(applyButton().props().disabled).to.be.false;

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          applyButton().simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ limit: 10, offset: 0, sort: '+fullName', 'summary.lastUploadDateFrom': sinon.match.string, 'summary.lastUploadDateTo': sinon.match.string }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Last upload apply filter', sinon.match({ clinicId: 'clinicID123', dateRange: '30 days' }));
        });

        it('should allow filtering by bg range targets that DO meet selected criteria', () => {
          const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();
          expect(timeInRangeFilterTrigger).to.have.lengthOf(1);
          expect(timeInRangeFilterTrigger.text()).to.equal('% Time in Range');

          const timeInRangeFilterCount = () => wrapper.find('#time-in-range-filter-count').hostNodes();
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);

          const dialog = () => wrapper.find('Dialog#timeInRangeDialog');
          expect(dialog()).to.have.length(0);

          // Open filters dialog
          timeInRangeFilterTrigger.simulate('click');
          wrapper.update();
          expect(dialog()).to.have.length(1);
          expect(dialog().props().open).to.be.true;

          const meetsCriteriaButton = () => dialog().find('#meets-glycemic-targets-filter').hostNodes();
          expect(meetsCriteriaButton()).to.have.lengthOf(1);

          const notMeetsCriteriaButton = () => dialog().find('#not-meets-glycemic-targets-filter').hostNodes();
          expect(notMeetsCriteriaButton()).to.have.lengthOf(1);

          expect(meetsCriteriaButton().is('.selected')).to.be.true;
          expect(notMeetsCriteriaButton().is('.selected')).to.be.false;

          // Ensure filter options present and in default unchecked state
          const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
          expect(veryLowFilter()).to.have.lengthOf(1);
          expect(veryLowFilter().text()).contains('Severe Hypoglycemia');
          expect(veryLowFilter().text()).contains('<1% Time below Range');
          expect(veryLowFilter().text()).contains('<54 mg/dL');
          expect(veryLowFilter().find('input').props().checked).to.be.false;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          expect(lowFilter()).to.have.lengthOf(1);
          expect(lowFilter().text()).contains('Low');
          expect(lowFilter().text()).contains('<4% Time below Range');
          expect(lowFilter().text()).contains('54-70 mg/dL');
          expect(lowFilter().find('input').props().checked).to.be.false;

          const targetFilter = () => dialog().find('#time-in-range-filter-target').hostNodes();
          expect(targetFilter()).to.have.lengthOf(1);
          expect(targetFilter().text()).contains('Normal');
          expect(targetFilter().text()).contains('>70% Time in Range');
          expect(targetFilter().text()).contains('70-180 mg/dL');
          expect(targetFilter().find('input').props().checked).to.be.false;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          expect(highFilter()).to.have.lengthOf(1);
          expect(highFilter().text()).contains('High');
          expect(highFilter().text()).contains('<25% Time above Range');
          expect(highFilter().text()).contains('180-250 mg/dL');
          expect(highFilter().find('input').props().checked).to.be.false;

          const veryHighFilter = () => dialog().find('#time-in-range-filter-veryHigh').hostNodes();
          expect(veryHighFilter()).to.have.lengthOf(1);
          expect(veryHighFilter().text()).contains('Severe Hyperglycemia');
          expect(veryHighFilter().text()).contains('<5% Time above Range');
          expect(veryHighFilter().text()).contains('>250 mg/dL');
          expect(veryHighFilter().find('input').props().checked).to.be.false;

          // Select all filter ranges
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInVeryLow-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          lowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInLow-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          targetFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInTarget-filter', checked: true } });
          expect(targetFilter().find('input').props().checked).to.be.true;

          highFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInHigh-filter', checked: true } });
          expect(highFilter().find('input').props().checked).to.be.true;

          veryHighFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInVeryHigh-filter', checked: true } });
          expect(veryHighFilter().find('input').props().checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          const applyButton = dialog().find('#timeInRangeFilterConfirm').hostNodes();
          applyButton.simulate('click');

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({limit: 10,
            offset: 0,
            sort: '+fullName',
            'summary.percentTimeInHigh': '<0.25',
            'summary.percentTimeInLow': '<0.04',
            'summary.percentTimeInTarget': '>0.7',
            'summary.percentTimeInVeryHigh': '<0.05',
            'summary.percentTimeInVeryLow': '<0.01',
          }));

          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Time in range apply filter', sinon.match({
            clinicId: 'clinicID123',
            hyper: true,
            hypo: true,
            inRange: true,
            meetsCriteria: true,
            severeHyper: true,
            severeHypo: true
          }));

          expect(timeInRangeFilterCount()).to.have.lengthOf(1);
          expect(timeInRangeFilterCount().text()).to.equal('5');
        });

        it('should allow filtering by bg range targets that DO NOT meet selected criteria', () => {
          const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();
          expect(timeInRangeFilterTrigger).to.have.lengthOf(1);
          expect(timeInRangeFilterTrigger.text()).to.equal('% Time in Range');

          const timeInRangeFilterCount = () => wrapper.find('#time-in-range-filter-count').hostNodes();
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);

          const dialog = () => wrapper.find('Dialog#timeInRangeDialog');
          expect(dialog()).to.have.length(0);

          // Open filters dialog
          timeInRangeFilterTrigger.simulate('click');
          wrapper.update();
          expect(dialog()).to.have.length(1);
          expect(dialog().props().open).to.be.true;

          const meetsCriteriaButton = () => dialog().find('#meets-glycemic-targets-filter').hostNodes();
          expect(meetsCriteriaButton()).to.have.lengthOf(1);

          const notMeetsCriteriaButton = () => dialog().find('#not-meets-glycemic-targets-filter').hostNodes();
          expect(notMeetsCriteriaButton()).to.have.lengthOf(1);

          notMeetsCriteriaButton().simulate('click');
          expect(meetsCriteriaButton().is('.selected')).to.be.false;
          expect(notMeetsCriteriaButton().is('.selected')).to.be.true;

          // Ensure filter options present and in default unchecked state
          const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
          expect(veryLowFilter()).to.have.lengthOf(1);
          expect(veryLowFilter().text()).contains('Severe Hypoglycemia');
          expect(veryLowFilter().text()).contains('<1% Time below Range');
          expect(veryLowFilter().text()).contains('<54 mg/dL');
          expect(veryLowFilter().find('input').props().checked).to.be.false;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          expect(lowFilter()).to.have.lengthOf(1);
          expect(lowFilter().text()).contains('Low');
          expect(lowFilter().text()).contains('<4% Time below Range');
          expect(lowFilter().text()).contains('54-70 mg/dL');
          expect(lowFilter().find('input').props().checked).to.be.false;

          const targetFilter = () => dialog().find('#time-in-range-filter-target').hostNodes();
          expect(targetFilter()).to.have.lengthOf(1);
          expect(targetFilter().text()).contains('Normal');
          expect(targetFilter().text()).contains('>70% Time in Range');
          expect(targetFilter().text()).contains('70-180 mg/dL');
          expect(targetFilter().find('input').props().checked).to.be.false;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          expect(highFilter()).to.have.lengthOf(1);
          expect(highFilter().text()).contains('High');
          expect(highFilter().text()).contains('<25% Time above Range');
          expect(highFilter().text()).contains('180-250 mg/dL');
          expect(highFilter().find('input').props().checked).to.be.false;

          const veryHighFilter = () => dialog().find('#time-in-range-filter-veryHigh').hostNodes();
          expect(veryHighFilter()).to.have.lengthOf(1);
          expect(veryHighFilter().text()).contains('Severe Hyperglycemia');
          expect(veryHighFilter().text()).contains('<5% Time above Range');
          expect(veryHighFilter().text()).contains('>250 mg/dL');
          expect(veryHighFilter().find('input').props().checked).to.be.false;

          // Select all filter ranges
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInVeryLow-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          lowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInLow-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          targetFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInTarget-filter', checked: true } });
          expect(targetFilter().find('input').props().checked).to.be.true;

          highFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInHigh-filter', checked: true } });
          expect(highFilter().find('input').props().checked).to.be.true;

          veryHighFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInVeryHigh-filter', checked: true } });
          expect(veryHighFilter().find('input').props().checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          const applyButton = dialog().find('#timeInRangeFilterConfirm').hostNodes();
          applyButton.simulate('click');

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({limit: 10,
            offset: 0,
            sort: '+fullName',
            'summary.percentTimeInHigh': '>=0.25',
            'summary.percentTimeInLow': '>=0.04',
            'summary.percentTimeInTarget': '<=0.7',
            'summary.percentTimeInVeryHigh': '>=0.05',
            'summary.percentTimeInVeryLow': '>=0.01',
          }));

          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Time in range apply filter', sinon.match({
            clinicId: 'clinicID123',
            hyper: true,
            hypo: true,
            inRange: true,
            meetsCriteria: false,
            severeHyper: true,
            severeHypo: true
          }));

          expect(timeInRangeFilterCount()).to.have.lengthOf(1);
          expect(timeInRangeFilterCount().text()).to.equal('5');
        });

        context('mmol/L preferredBgUnits', () => {
          beforeEach(() => {
            store = mockStore(tier0200ClinicStateMmoll);

            wrapper = mount(
              <Provider store={store}>
                <ToastProvider>
                  <ClinicPatients {...defaultProps} />
                </ToastProvider>
              </Provider>
            );

            wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
            defaultProps.trackMetric.resetHistory();
          });

          it('should show the bg range filters in mmol/L units', () => {
            const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();

            const dialog = () => wrapper.find('Dialog#timeInRangeDialog');
            expect(dialog()).to.have.length(0);

            // Open filters dialog
            timeInRangeFilterTrigger.simulate('click');
            wrapper.update();
            expect(dialog()).to.have.length(1);
            expect(dialog().props().open).to.be.true;

            // Ensure filter options present and in default unchecked state
            const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
            expect(veryLowFilter()).to.have.lengthOf(1);
            expect(veryLowFilter().text()).contains('Severe Hypoglycemia');
            expect(veryLowFilter().text()).contains('<1% Time below Range');
            expect(veryLowFilter().text()).contains('<3.0 mmol/L');
            expect(veryLowFilter().find('input').props().checked).to.be.false;

            const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
            expect(lowFilter()).to.have.lengthOf(1);
            expect(lowFilter().text()).contains('Low');
            expect(lowFilter().text()).contains('<4% Time below Range');
            expect(lowFilter().text()).contains('3.0-3.9 mmol/L');
            expect(lowFilter().find('input').props().checked).to.be.false;

            const targetFilter = () => dialog().find('#time-in-range-filter-target').hostNodes();
            expect(targetFilter()).to.have.lengthOf(1);
            expect(targetFilter().text()).contains('Normal');
            expect(targetFilter().text()).contains('>70% Time in Range');
            expect(targetFilter().text()).contains('3.9-10.0 mmol/L');
            expect(targetFilter().find('input').props().checked).to.be.false;

            const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
            expect(highFilter()).to.have.lengthOf(1);
            expect(highFilter().text()).contains('High');
            expect(highFilter().text()).contains('<25% Time above Range');
            expect(highFilter().text()).contains('10.0-13.9 mmol/L');
            expect(highFilter().find('input').props().checked).to.be.false;

            const veryHighFilter = () => dialog().find('#time-in-range-filter-veryHigh').hostNodes();
            expect(veryHighFilter()).to.have.lengthOf(1);
            expect(veryHighFilter().text()).contains('Severe Hyperglycemia');
            expect(veryHighFilter().text()).contains('<5% Time above Range');
            expect(veryHighFilter().text()).contains('>13.9 mmol/L');
            expect(veryHighFilter().find('input').props().checked).to.be.false;
          });
        });

        it('should track how many filters are active', () => {
          const filterCount = () => wrapper.find('#filter-count').hostNodes();
          expect(filterCount()).to.have.lengthOf(0);

          const timeInRangeFilterCount = () => wrapper.find('#time-in-range-filter-count').hostNodes();
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);

          // Set lastUpload filter
          const lastUploadFilterTrigger = wrapper.find('#last-upload-filter-trigger').hostNodes();
          expect(lastUploadFilterTrigger).to.have.lengthOf(1);

          const popover = () => wrapper.find('#lastUploadDateFilters').hostNodes();
          lastUploadFilterTrigger.simulate('click');

          const filterOptions = popover().find('#last-upload-filters').find('label').hostNodes();
          expect(filterOptions).to.have.lengthOf(4);

          filterOptions.at(3).find('input').last().simulate('change', { target: { name: 'last-upload-filters', value: 30 } });
          popover().find('#apply-last-upload-filter').hostNodes().simulate('click');

          // Filter count should be 1
          expect(filterCount()).to.have.lengthOf(1);
          expect(filterCount().text()).to.equal('1');

          // Set time in range filter
          const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();
          expect(timeInRangeFilterTrigger).to.have.lengthOf(1);

          const dialog = () => wrapper.find('Dialog#timeInRangeDialog');
          timeInRangeFilterTrigger.simulate('click');

          // Select 3 filter ranges
          const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInVeryLow-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          lowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInLow-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          highFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInHigh-filter', checked: true } });
          expect(highFilter().find('input').props().checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          const applyButton = dialog().find('#timeInRangeFilterConfirm').hostNodes();
          applyButton.simulate('click');

          // Filter count should be 2
          expect(filterCount().text()).to.equal('2');
          expect(timeInRangeFilterCount().text()).to.equal('3');

          // Unset last upload filter
          lastUploadFilterTrigger.simulate('click');
          popover().find('#clear-last-upload-filter').hostNodes().simulate('click');

          // Filter count should be 1
          expect(filterCount()).to.have.lengthOf(1);
          expect(filterCount().text()).to.equal('1');
          expect(timeInRangeFilterCount().text()).to.equal('3');

          // Unset time in range filter
          timeInRangeFilterTrigger.simulate('click');
          dialog().find('#timeInRangeFilterClear').hostNodes().simulate('click');

          // Total filter count and time in range filter count should be unset
          expect(filterCount()).to.have.lengthOf(0);
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);
        });

        it('should reset all active filters at once', () => {
          const filterCount = () => wrapper.find('#filter-count').hostNodes();
          expect(filterCount()).to.have.lengthOf(0);

          const timeInRangeFilterCount = () => wrapper.find('#time-in-range-filter-count').hostNodes();
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);

          // Reset Filters button only shows when filters are active
          const resetAllFiltersButton = () => wrapper.find('#reset-all-active-filters').hostNodes();
          expect(resetAllFiltersButton()).to.have.lengthOf(0);

          // Set lastUpload filter
          const lastUploadFilterTrigger = wrapper.find('#last-upload-filter-trigger').hostNodes();
          expect(lastUploadFilterTrigger).to.have.lengthOf(1);

          const popover = () => wrapper.find('#lastUploadDateFilters').hostNodes();
          lastUploadFilterTrigger.simulate('click');

          const filterOptions = popover().find('#last-upload-filters').find('label').hostNodes();
          expect(filterOptions).to.have.lengthOf(4);

          filterOptions.at(3).find('input').last().simulate('change', { target: { name: 'last-upload-filters', value: 30 } });
          popover().find('#apply-last-upload-filter').hostNodes().simulate('click');

          // Filter count should be 1
          expect(filterCount()).to.have.lengthOf(1);
          expect(filterCount().text()).to.equal('1');
          expect(resetAllFiltersButton()).to.have.lengthOf(1);
          expect(resetAllFiltersButton().text()).to.equal('Reset Filters');

          // Set time in range filter
          const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();
          expect(timeInRangeFilterTrigger).to.have.lengthOf(1);

          const dialog = () => wrapper.find('Dialog#timeInRangeDialog');
          timeInRangeFilterTrigger.simulate('click');

          // Select 3 filter ranges
          const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInVeryLow-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          lowFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInLow-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          highFilter().find('input').simulate('change', { target: { name: 'range-percentTimeInHigh-filter', checked: true } });
          expect(highFilter().find('input').props().checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          const applyButton = dialog().find('#timeInRangeFilterConfirm').hostNodes();
          applyButton.simulate('click');

          // Filter count should be 2
          expect(filterCount().text()).to.equal('2');
          expect(timeInRangeFilterCount().text()).to.equal('3');
          expect(resetAllFiltersButton()).to.have.lengthOf(1);

          // Click reset filters button
          resetAllFiltersButton().simulate('click');

          // Total filter count and time in range filter count should be unset
          expect(filterCount()).to.have.lengthOf(0);
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);
          expect(resetAllFiltersButton()).to.have.lengthOf(0);
        });

        it('should send an upload reminder to a fully claimed patient account', () => {
          const table = wrapper.find(Table);
          expect(table).to.have.length(1);
          expect(table.find('tbody tr')).to.have.length(5);

          // No reminder action for a custodial account
          const patient1Reminder = table.find('tbody tr').at(0).find('Button[iconLabel="Send Upload Reminder"]');
          expect(patient1Reminder).to.have.lengthOf(0);

          // Fully claimed account
          const patient2Reminder = table.find('tbody tr').at(1).find('Button[iconLabel="Send Upload Reminder"]');
          expect(patient2Reminder).to.have.lengthOf(1);

          const dialog = () => wrapper.find('Dialog#sendUploadReminderDialog');

          expect(dialog()).to.have.length(0);
          patient2Reminder.simulate('click');
          wrapper.update();
          wrapper.update();
          expect(dialog()).to.have.length(1);
          expect(dialog().props().open).to.be.true;

          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Send upload reminder', { clinicId: 'clinicID123' });
          expect(defaultProps.trackMetric.callCount).to.equal(1);

          store.clearActions();
          dialog().find('Button#resend-upload-reminder').simulate('click');

          expect(defaultProps.api.clinics.sendPatientUploadReminder.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.sendPatientUploadReminder,
            'clinicID123',
            'patient2',
          );

          expect(store.getActions()).to.eql([
            { type: 'SEND_PATIENT_UPLOAD_REMINDER_REQUEST' },
            {
              type: 'SEND_PATIENT_UPLOAD_REMINDER_SUCCESS',
              payload: {
                clinicId: 'clinicID123',
                patientId: 'patient2',
                lastUploadReminderTime: '2022-02-02T00:00:00.000Z',
              },
            },
          ]);
        });
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

          wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
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
