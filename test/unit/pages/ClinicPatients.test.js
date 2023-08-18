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
import Button from '../../../app/components/elements/Button';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global afterEach */

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
        getPatientFromClinic: sinon.stub(),
        getPatientsForClinic: sinon.stub(),
        deletePatientFromClinic: sinon.stub(),
        createClinicCustodialAccount: sinon.stub().callsArgWith(2, null, { id: 'stubbedId' }),
        updateClinicPatient: sinon.stub().callsArgWith(3, null, { id: 'stubbedId', stubbedUpdates: 'foo' }),
        sendPatientUploadReminder: sinon.stub().callsArgWith(2, null, { lastUploadReminderTime: '2022-02-02T00:00:00.000Z'}),
        sendPatientDexcomConnectRequest: sinon.stub().callsArgWith(2, null, { lastRequestedDexcomConnectTime: '2022-02-02T00:00:00.000Z'}),
        createClinicPatientTag: sinon.stub(),
        updateClinicPatientTag: sinon.stub(),
        deleteClinicPatientTag: sinon.stub(),
      },
    },
  };

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    delete localStorage.activePatientFilters;
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.getPatientFromClinic.resetHistory();
    defaultProps.api.clinics.getPatientsForClinic.resetHistory();
    defaultProps.api.clinics.deletePatientFromClinic.resetHistory();
    defaultProps.api.clinics.createClinicCustodialAccount.resetHistory();
    defaultProps.api.clinics.sendPatientDexcomConnectRequest.resetHistory();
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
        fetchingPatientFromClinic: defaultWorkingState,
        fetchingPatientsForClinic: completedState,
        deletingPatientFromClinic: defaultWorkingState,
        updatingClinicPatient: defaultWorkingState,
        creatingClinicCustodialAccount: defaultWorkingState,
        sendingPatientUploadReminder: defaultWorkingState,
        sendingPatientDexcomConnectRequest: defaultWorkingState,
        creatingClinicPatientTag: defaultWorkingState,
        updatingClinicPatientTag: defaultWorkingState,
        deletingClinicPatientTag: defaultWorkingState,
      },
    },
  };

  let store = mockStore(noPatientsState);

  const mrnRequiredState = merge({}, noPatientsState, {
    blip: {
      clinics: {
        clinicID123: {
          mrnSettings: {
            required: true,
          },
        },
      },
    },
  });

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
              permissions: { view : {} }
            },
            patient2: {
              id: 'patient2',
              email: 'patient2@test.ca',
              fullName: 'Patient Two',
              birthDate: '1999-02-02',
              mrn: 'mrn123',
              permissions: { custodian : {} }
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

  const dexcomPatientsClinicState = {
    blip: {
      ...hasPatientsState.blip,
      clinics: {
        clinicID123: {
          ...hasPatientsState.blip.clinics.clinicID123,
          patients: {
            patient1: {
              id: 'patient1',
              email: 'patient1@test.ca',
              fullName: 'patient1',
              birthDate: '1999-01-01',
              lastRequestedDexcomConnectTime: '2021-10-19T16:27:59.504Z',
              dataSources: [
                { providerName: 'dexcom', state: 'pending' },
              ],
            },
            patient2: {
              id: 'patient2',
              email: 'patient2@test.ca',
              fullName: 'patient2',
              birthDate: '1999-01-01',
              dataSources: [
                { providerName: 'dexcom', state: 'connected' },
              ],
            },
            patient3: {
              id: 'patient3',
              email: 'patient3@test.ca',
              fullName: 'patient3',
              birthDate: '1999-01-01',
              lastRequestedDexcomConnectTime: '2021-10-19T16:27:59.504Z',
              dataSources: [
                { providerName: 'dexcom', state: 'disconnected' },
              ],
            },
            patient4: {
              id: 'patient4',
              email: 'patient4@test.ca',
              fullName: 'patient4',
              birthDate: '1999-01-01',
              dataSources: [
                { providerName: 'dexcom', state: 'error' },
              ],
            },
            patient5: {
              id: 'patient5',
              email: 'patient5@test.ca',
              fullName: 'patient5',
              birthDate: '1999-01-01',
              dataSources: [
                { providerName: 'dexcom', state: 'foo' },
              ],
            },
            patient6: {
              id: 'patient6',
              email: 'patient6@test.ca',
              fullName: 'patient6',
              birthDate: '1999-01-01',
              dataSources: [
                { providerName: 'foo', state: 'connected' },
              ],
            },
            patient7: {
              id: 'patient7',
              email: 'patient7@test.ca',
              fullName: 'patient7',
              birthDate: '1999-01-01',
              dataSources: [
                { providerName: 'dexcom', state: 'pendingReconnect' },
              ],
            },
          },
        },
      },
      timePrefs: {
        timezoneName: 'UTC'
      }
    },
  };

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

  const tier0300ClinicState = {
    blip: {
      ...hasPatientsState.blip,
      clinics: {
        clinicID123: {
          ...hasPatientsState.blip.clinics.clinicID123,
          tier: 'tier0300',
          patientTags: [
            { id: 'tag1', name: 'test tag 1'},
            { id: 'tag2', name: 'test tag 2'},
            { id: 'tag3', name: 'test tag 3'},
          ],
          patients: {
            patient1: {
              id: 'patient1',
              email: 'patient1@test.ca',
              fullName: 'Patient One',
              birthDate: '1999-01-01',
              mrn: 'mrn012',
              summary: {},
              permissions: { custodian : {} },
              tags: [],
            },
            patient2: {
              id: 'patient2',
              email: 'patient2@test.ca',
              fullName: 'Patient Two',
              birthDate: '1999-02-02',
              mrn: 'mrn123',
              summary:{
                bgmStats: {
                  dates: {
                    lastUploadDate: moment().subtract(1, 'day').toISOString(),
                  },
                  periods: { '14d': {
                    averageGlucose: { units: MMOLL_UNITS, value: 10.5 },
                    averageDailyRecords: 0.25,
                    timeInVeryLowRecords: 1,
                    timeInVeryHighRecords: 2,
                  } },
                },
                cgmStats: {
                  dates: {
                    lastUploadDate: moment().toISOString(),
                  },
                  periods: { '14d': {
                    averageGlucose: { units: MMOLL_UNITS },
                    timeCGMUsePercent: 0.85,
                    timeCGMUseMinutes: 23 * 60,
                    glucoseManagementIndicator: 7.75,
                  } },
                },
              },
              permissions: { custodian : undefined },
              tags: ['tag1'],
            },
            patient3: {
              id: 'patient3',
              email: 'patient3@test.ca',
              fullName: 'Patient Three',
              birthDate: '1999-03-03',
              mrn: 'mrn456',
              summary: {
                bgmStats: {
                  dates: {
                    lastUploadDate: moment().subtract(1, 'day').toISOString(),
                  },
                  periods: { '14d': {
                    averageGlucose: { units: MMOLL_UNITS, value: 11.5 },
                    averageDailyRecords: 1.25,
                    timeInVeryLowRecords: 3,
                    timeInVeryHighRecords: 4,
                  } },
                },
                cgmStats: {
                  dates: {
                    lastUploadDate: moment().subtract(1, 'day').toISOString(),
                  },
                  periods: {
                    '30d': {
                      averageGlucose: { units: MGDL_UNITS },
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 7.5,
                    },
                    '14d': {
                      averageGlucose: { units: MGDL_UNITS },
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 6.5,
                    },
                    '7d': {
                      averageGlucose: { units: MGDL_UNITS },
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 5.5,
                    },
                    '1d': {
                      averageGlucose: { units: MGDL_UNITS },
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 4.5,
                    },
                  },
                },
              },
              tags: ['tag1', 'tag2', 'tag3'],
            },
            patient4: {
              id: 'patient4',
              email: 'patient4@test.ca',
              fullName: 'Patient Four',
              birthDate: '1999-04-04',
              mrn: 'mrn789',
              summary: {
                bgmStats: {
                  dates: {
                    lastUploadDate: moment().subtract(1, 'day').toISOString(),
                  },
                  periods: { '14d': {
                    averageGlucose: { units: MMOLL_UNITS, value: 12.5 },
                    averageDailyRecords: 1.5,
                    timeInVeryLowRecords: 0,
                    timeInVeryHighRecords: 0,
                  } },
                },
                cgmStats: {
                  dates: {
                    lastUploadDate: moment().subtract(29, 'days').toISOString(),
                  },
                  periods: { '14d': {
                    averageGlucose: { units: MMOLL_UNITS },
                    timeCGMUsePercent: 0.69,
                    timeCGMUseMinutes:  7 * 24 * 60,
                    glucoseManagementIndicator: 8.5,
                  } },
                },
              },
            },
            patient5: {
              id: 'patient5',
              email: 'patient5@test.ca',
              fullName: 'Patient Five',
              birthDate: '1999-05-05',
              mrn: 'mrn101',
              summary: {
                cgmStats: {
                  dates: {
                    lastUploadDate: moment().subtract(30, 'days').toISOString(),
                  },
                  periods: { '14d': {
                    averageGlucose: { units: MGDL_UNITS },
                    timeCGMUsePercent: 0.69,
                    timeCGMUseMinutes:  30 * 24 * 60,
                    glucoseManagementIndicator: 8.5,
                  } },
                },
              },
            },
          }
        },
      },
    },
  };

  const tier0300ClinicStateMmoll = {
    blip: {
      ...tier0300ClinicState.blip,
      clinics: {
        clinicID123: {
          ...tier0300ClinicState.blip.clinics.clinicID123,
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

  const defaultFetchOptions = { limit: 50, offset: 0, period: '14d', sortType: 'cgm' };

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
            connectDexcom: false,
            birthDate: '1999-11-21',
            mrn: '123456',
            email: 'patient@test.ca',
            tags: [],
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

    it('should prevent adding a new patient witout an MRN if required by the clinic', () => {
      store = mockStore(mrnRequiredState);
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <ClinicPatients {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

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
      patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: '' } });
      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('');

      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('');
      patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: ''}});
      expect(patientForm().find('input[name="email"]').prop('value')).to.equal('');

      expect(dialog().find('Button#addPatientConfirm').prop('disabled')).to.be.true;

      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('');
      patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: 'mrn876' } });
      expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('mrn876');

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

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', { ...defaultFetchOptions, search: 'Two', sort: '+fullName' });
          done();
        }, 1000);
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

        expect(patientForm().find('input[name="connectDexcom"]').find('input').props().checked).to.be.false;
        patientForm().find('input[name="connectDexcom"]').find('input').simulate('change', { persist: noop, target: { name: 'connectDexcom', value: true } });
        expect(patientForm().find('input[name="connectDexcom"]').find('input').props().checked).to.be.true;

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
              connectDexcom: true,
              dataSources: [{ providerName: 'dexcom', state: 'pending' }],
              birthDate: '1999-01-01',
              mrn: 'mrn456',
              id: 'patient2',
              email: 'patient-two@test.ca',
              permissions: { custodian: {} },
              tags: [],
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

      it('should disable email editing for non-custodial patients', done => {
        const table = wrapper.find(Table);
        expect(table).to.have.length(1);
        expect(table.find('tr')).to.have.length(3); // header row + 2 invites
        const editButton = table.find('tr').at(1).find('Button[iconLabel="Edit Patient Information"]');

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

        expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient One');
        patientForm().find('input[name="fullName"]').simulate('change', { persist: noop, target: { name: 'fullName', value: 'Patient 2' } });
        expect(patientForm().find('input[name="fullName"]').prop('value')).to.equal('Patient 2');

        expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('01/01/1999');
        patientForm().find('input[name="birthDate"]').simulate('change', { persist: noop, target: { name: 'birthDate', value: '02/02/1999' } });
        expect(patientForm().find('input[name="birthDate"]').prop('value')).to.equal('02/02/1999');

        expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('');
        patientForm().find('input[name="mrn"]').simulate('change', { persist: noop, target: { name: 'mrn', value: 'mrn456' } });
        expect(patientForm().find('input[name="mrn"]').prop('value')).to.equal('mrn456');

        expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient1@test.ca');
        expect(patientForm().find('input[name="email"]').prop('disabled')).to.equal(true);

        store.clearActions();
        dialog().find('Button#editPatientConfirm').simulate('click');

        setTimeout(() => {
          expect(defaultProps.api.clinics.updateClinicPatient.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.updateClinicPatient,
            'clinicID123',
            'patient1',
            {
              fullName: 'Patient 2',
              connectDexcom: false,
              birthDate: '1999-02-02',
              mrn: 'mrn456',
              id: 'patient1',
              email: 'patient1@test.ca',
              permissions: { view: {} },
              tags: [],
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

      context('dexcom connection status - patient add', () => {
        let patientForm;

        beforeEach(() => {
          const addButton = wrapper.find('button#add-patient');
          expect(addButton.text()).to.equal('Add New Patient');

          const dialog = () => wrapper.find('Dialog#addPatient');

          expect(dialog()).to.have.length(0);
          addButton.simulate('click');
          wrapper.update();
          expect(dialog()).to.have.length(1);
          expect(dialog().props().open).to.be.true;

          patientForm = () => dialog().find('form#clinic-patient-form');
          expect(patientForm()).to.have.lengthOf(1);
        });

        it('should render the dexcom connect request input', () => {
          expect(patientForm().find('input[name="connectDexcom"]').hostNodes()).to.have.lengthOf(1);
        });

        it('should disable the dexcom connect input if email is empty', () => {
          expect(patientForm().find('input[name="email"]').prop('value')).to.equal('');
          expect(patientForm().find('input[name="connectDexcom"]').find('input').props().disabled).to.be.true;

          patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient-two@test.ca' } });
          expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient-two@test.ca');
          expect(patientForm().find('input[name="connectDexcom"]').find('input').props().disabled).to.be.false;
        });

        it('should disable and uncheck the dexcom connect checkbox if email is cleared', () => {
          // Set the email and check the dexcom request box
          patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: 'patient-two@test.ca' } });
          expect(patientForm().find('input[name="email"]').prop('value')).to.equal('patient-two@test.ca');
          expect(patientForm().find('input[name="connectDexcom"]').find('input').props().disabled).to.be.false;

          patientForm().find('input[name="connectDexcom"]').find('input').simulate('change', { persist: noop, target: { name: 'connectDexcom', value: true } });
          expect(patientForm().find('input[name="connectDexcom"]').find('input').props().checked).to.be.true;

          // Clear the email input
          patientForm().find('input[name="email"]').simulate('change', { persist: noop, target: { name: 'email', value: '' } });
          expect(patientForm().find('input[name="email"]').prop('value')).to.equal('');

          expect(patientForm().find('input[name="connectDexcom"]').find('input').props().disabled).to.be.true;
          expect(patientForm().find('input[name="connectDexcom"]').find('input').props().checked).to.be.false;
        });
      });

      context('dexcom connection status - patient edit', () => {
        let patientForm;

        const getPatientForm = (patientIndex) => {
          const table = wrapper.find(Table);
          const editButton = table.find('tbody tr').at(patientIndex).find('Button[iconLabel="Edit Patient Information"]');
          const dialog = () => wrapper.find('Dialog#editPatient');

          editButton.simulate('click');
          wrapper.update();
          expect(dialog()).to.have.length(1);
          expect(dialog().props().open).to.be.true;

          patientForm = () => dialog().find('form#clinic-patient-form');
          expect(patientForm()).to.have.lengthOf(1);
        }

        beforeEach(() => {
          store = mockStore(dexcomPatientsClinicState);
          defaultProps.trackMetric.resetHistory();
          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <ClinicPatients {...defaultProps} />
              </ToastProvider>
            </Provider>
          );

          wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
          defaultProps.trackMetric.resetHistory();

          getPatientForm(0);
        });

        it('should render the dexcom connect request input, but only if the patient does not have a dexcom data source', () => {
          getPatientForm(5); // no dexcom source
          expect(patientForm().find('#connectDexcomWrapper').hostNodes()).to.have.lengthOf(1)

          getPatientForm(0); // pending dexcom state
          expect(patientForm().find('#connectDexcomWrapper').hostNodes()).to.have.lengthOf(0)
        });

        it('should show the current dexcom connection status if the patient has it set', () => {
          const stateWrapper = () => patientForm().find('#connectDexcomStatusWrapper').hostNodes();

          getPatientForm(0);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Pending connection with');

          getPatientForm(1);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Connected with');

          getPatientForm(2);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Disconnected from');

          getPatientForm(3);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Error connecting to');

          getPatientForm(4);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Unknown connection to');

          getPatientForm(6);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Pending reconnection with');
        });

        it('should have a valid form state for all legitimate dexcom connection states', () => {
          const stateWrapper = () => patientForm().find('#connectDexcomStatusWrapper').hostNodes();
          const submitButton = () => wrapper.find('#editPatientConfirm').hostNodes();

          getPatientForm(0);
          expect(stateWrapper().text()).includes('Pending connection with');
          expect(submitButton().prop('disabled')).to.be.false;

          getPatientForm(1);
          expect(stateWrapper().text()).includes('Connected with');
          expect(submitButton().prop('disabled')).to.be.false;

          getPatientForm(2);
          expect(stateWrapper().text()).includes('Disconnected from');
          expect(submitButton().prop('disabled')).to.be.false;

          getPatientForm(3);
          expect(stateWrapper().text()).includes('Error connecting to');
          expect(submitButton().prop('disabled')).to.be.false;

          getPatientForm(6);
          expect(stateWrapper().text()).includes('Pending reconnection with');
          expect(submitButton().prop('disabled')).to.be.false;
        });

        it('should allow resending a pending dexcom connection reminder', () => {
          const stateWrapper = () => patientForm().find('#connectDexcomStatusWrapper').hostNodes();
          const resendButton = () => stateWrapper().find('#resendDexcomConnectRequestTrigger').hostNodes();

          getPatientForm(1);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Connected with');
          expect(resendButton()).to.have.lengthOf(0);

          // Show for disconnected state
          getPatientForm(2);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Disconnected from');
          expect(resendButton()).to.have.lengthOf(1);

          // Show for pending state
          getPatientForm(0);
          expect(stateWrapper()).to.have.lengthOf(1);
          expect(stateWrapper().text()).includes('Pending connection');
          expect(resendButton()).to.have.lengthOf(1);

          const resendDialog = () => stateWrapper().find('#resendDexcomConnectRequest').at(1);
          expect(resendDialog().props().open).to.be.false;
          resendButton().simulate('click');
          expect(resendDialog().props().open).to.be.true;

          expect(resendDialog().text()).to.have.string('10/19/2021 at 4:27 pm');

          const resendInvite = resendDialog().find(Button).filter({variant: 'primary'});
          expect(resendInvite).to.have.length(1);

          const expectedActions = [
            {
              type: 'SEND_PATIENT_DEXCOM_CONNECT_REQUEST_REQUEST',
            },
            {
              type: 'SEND_PATIENT_DEXCOM_CONNECT_REQUEST_SUCCESS',
              payload: {
                clinicId: 'clinicID123',
                lastRequestedDexcomConnectTime: '2022-02-02T00:00:00.000Z',
                patientId: 'patient1',
              },
            },
          ];

          store.clearActions();
          resendInvite.props().onClick();
          expect(store.getActions()).to.eql(expectedActions);
          sinon.assert.calledWith(
            defaultProps.api.clinics.sendPatientDexcomConnectRequest,
            'clinicID123',
            'patient1'
          );
        });
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

      context('tier0300 clinic', () => {
        beforeEach(() => {
          store = mockStore(tier0300ClinicState);

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

          expect(columns.at(1).text()).to.equal('Last Upload');
          assert(columns.at(1).is('#peopleTable-header-cgm-lastUploadDate'));

          expect(columns.at(2).text()).to.equal('Patient Tags');
          assert(columns.at(2).is('#peopleTable-header-tags'));

          expect(columns.at(3).text()).to.equal('CGM');
          assert(columns.at(3).is('#peopleTable-header-cgmTag'));

          expect(columns.at(4).text()).to.equal('GMI');
          assert(columns.at(4).is('#peopleTable-header-cgm-glucoseManagementIndicator'));

          expect(columns.at(5).text()).to.equal('% Time in Range');
          assert(columns.at(5).is('#peopleTable-header-bgRangeSummary'));

          expect(columns.at(7).text()).to.equal('BGM');
          assert(columns.at(7).is('#peopleTable-header-bgmTag'));

          expect(columns.at(8).text()).to.equal('Avg. Glucose (mg/dL)');
          assert(columns.at(8).is('#peopleTable-header-bgm-averageGlucose'));

          expect(columns.at(9).text()).to.equal('Lows');
          assert(columns.at(9).is('#peopleTable-header-bgm-timeInVeryLowRecords'));

          expect(columns.at(10).text()).to.equal('Highs');
          assert(columns.at(10).is('#peopleTable-header-bgm-timeInVeryHighRecords'));

          const rows = table.find('tbody tr');
          expect(rows).to.have.lengthOf(5);

          const rowData = row => rows.at(row).find('.MuiTableCell-root');

          // Patient name, dob, and mrn in first column
          expect(rowData(0).at(0).text()).contains('Patient One');
          expect(rowData(0).at(0).text()).contains('1999-01-01');
          expect(rowData(0).at(0).text()).contains('mrn012');

          // Last upload date in second column
          expect(rowData(0).at(1).text()).contains(emptyStatText);
          expect(rowData(1).at(1).text()).contains('CGM: Today');
          expect(rowData(1).at(1).text()).contains('BGM: Yesterday');
          expect(rowData(2).at(1).text()).contains('CGM: Yesterday');
          expect(rowData(3).at(1).text()).contains('CGM: 30 days ago');
          expect(rowData(4).at(1).text().slice(-10)).to.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/); // match YYYY-MM-DD format

          // Patient tags in third column
          expect(rowData(0).at(2).text()).contains('Add'); // Add tag link when no tags avail
          expect(rowData(1).at(2).text()).contains('test tag 1');
          expect(rowData(2).at(2).text()).contains(['test tag 1', '+2'].join('')); // +1 for tag overflow

          // GMI in fifth column
          expect(rowData(0).at(4).text()).contains(emptyStatText);// GMI undefined
          expect(rowData(1).at(4).text()).contains(emptyStatText); // <24h cgm use shows empty text
          expect(rowData(2).at(4).text()).contains('6.5 %');
          expect(rowData(3).at(4).text()).contains(emptyStatText); // <70% cgm use

          // Ensure tags hidden by overflow are visible on hover
          const tagOverflowTrigger = rowData(2).at(2).find('.tag-overflow-trigger').hostNodes();
          expect(tagOverflowTrigger).to.have.length(1);

          const popover = () => wrapper.find('#tags-overflow-patient3').hostNodes();
          expect(popover()).to.have.lengthOf(1);

          expect(popover().props().style.visibility).to.equal('hidden');

          tagOverflowTrigger.simulate('mouseenter');
          expect(popover().props().style.visibility).to.be.undefined;

          const overflowTags = popover().find('.tag-text').hostNodes();
          expect(overflowTags).to.have.length(2);
          expect(overflowTags.at(0).text()).to.equal('test tag 2');
          expect(overflowTags.at(1).text()).to.equal('test tag 3');

          // BG summary in sixth column
          expect(rowData(0).at(5).text()).to.not.contain('CGM Use <24 hours'); // no cgm stats
          expect(rowData(1).at(5).text()).contains('CGM Use <24 hours'); // 23 hours of data

          expect(rowData(2).at(5).find('.range-summary-bars').hostNodes()).to.have.lengthOf(1);
          expect(rowData(2).at(5).find('.range-summary-stripe-overlay').hostNodes()).to.have.lengthOf(0); // normal bars

          expect(rowData(3).at(5).find('.range-summary-bars').hostNodes()).to.have.lengthOf(1);
          expect(rowData(3).at(5).find('.range-summary-stripe-overlay').hostNodes()).to.have.lengthOf(1); // striped bars for <70% cgm use

          // Average glucose and readings/day in ninth column
          expect(rowData(0).at(8).text()).contains('');
          expect(rowData(1).at(8).text()).contains('189'); // 10.5 mmol/L -> mg/dL
          expect(rowData(1).at(8).text()).contains('<1 reading/day');
          expect(rowData(2).at(8).text()).contains('207'); // 11.5 mmol/L -> mg/dL
          expect(rowData(2).at(8).text()).contains('1 reading/day');
          expect(rowData(3).at(8).text()).contains('225'); // 12.5 mmol/L -> mg/dL
          expect(rowData(3).at(8).text()).contains('2 readings/day');

          // Low events in tenth column
          expect(rowData(0).at(9).text()).contains('');
          expect(rowData(1).at(9).text()).contains('1');
          expect(rowData(2).at(9).text()).contains('3');
          expect(rowData(3).at(9).text()).contains('0');

          // Low events in eleventh column
          expect(rowData(0).at(10).text()).contains('');
          expect(rowData(1).at(10).text()).contains('2');
          expect(rowData(2).at(10).text()).contains('4');
          expect(rowData(3).at(10).text()).contains('0');
        });

        it('should refetch patients with updated sort parameter when sortable column headers are clicked', () => {
          const table = wrapper.find(Table);
          expect(table).to.have.length(1);

          const patientHeader = table.find('#peopleTable-header-fullName .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          patientHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+fullName' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          patientHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-fullName' }));

          const lastUploadDateHeader = table.find('#peopleTable-header-cgm-lastUploadDate .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          lastUploadDateHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-lastUploadDate', sortType: 'cgm' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          lastUploadDateHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+lastUploadDate', sortType: 'cgm' }));

          const gmiHeader = table.find('#peopleTable-header-cgm-glucoseManagementIndicator .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          gmiHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-glucoseManagementIndicator', sortType: 'cgm' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          gmiHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+glucoseManagementIndicator', sortType: 'cgm' }));

          const averageGlucoseHeader = table.find('#peopleTable-header-bgm-averageGlucose .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          averageGlucoseHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-averageGlucose', sortType: 'bgm' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          averageGlucoseHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+averageGlucose', sortType: 'bgm' }));

          const lowsHeader = table.find('#peopleTable-header-bgm-timeInVeryLowRecords .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          lowsHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-timeInVeryLowRecords', sortType: 'bgm' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          lowsHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+timeInVeryLowRecords', sortType: 'bgm' }));

          const highsHeader = table.find('#peopleTable-header-bgm-timeInVeryHighRecords .MuiTableSortLabel-root').at(0);

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          highsHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-timeInVeryHighRecords', sortType: 'bgm' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          highsHeader.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+timeInVeryHighRecords', sortType: 'bgm' }));
        });

        it('should allow refreshing the patient list and maintain', () => {
          const refreshButton = wrapper.find('#refresh-patients').hostNodes();
          expect(refreshButton).to.have.lengthOf(1);
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          refreshButton.simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ ...defaultFetchOptions, sort: '-lastUploadDate' }));
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
          const typeFilterOptions = popover().find('#last-upload-type').find('label').hostNodes();
          expect(typeFilterOptions).to.have.lengthOf(2);
          expect(typeFilterOptions.at(0).text()).to.equal('CGM');
          expect(typeFilterOptions.at(0).find('input').props().value).to.equal('cgm');

          expect(typeFilterOptions.at(1).text()).to.equal('BGM');
          expect(typeFilterOptions.at(1).find('input').props().value).to.equal('bgm');

          // Ensure period filter options present
          const periodFilterOptions = popover().find('#last-upload-filters').find('label').hostNodes();
          expect(periodFilterOptions).to.have.lengthOf(4);
          expect(periodFilterOptions.at(0).text()).to.equal('Today');
          expect(periodFilterOptions.at(0).find('input').props().value).to.equal('1');

          expect(periodFilterOptions.at(1).text()).to.equal('Last 2 days');
          expect(periodFilterOptions.at(1).find('input').props().value).to.equal('2');

          expect(periodFilterOptions.at(2).text()).to.equal('Last 14 days');
          expect(periodFilterOptions.at(2).find('input').props().value).to.equal('14');

          expect(periodFilterOptions.at(3).text()).to.equal('Last 30 days');
          expect(periodFilterOptions.at(3).find('input').props().value).to.equal('30');

          // Apply button disabled until selection made
          const applyButton = () => popover().find('#apply-last-upload-filter').hostNodes();
          expect(applyButton().props().disabled).to.be.true;

          typeFilterOptions.at(1).find('input').last().simulate('change', { target: { name: 'last-upload-type', value: 'bgm' } });
          periodFilterOptions.at(3).find('input').last().simulate('change', { target: { name: 'last-upload-filters', value: 30 } });
          expect(applyButton().props().disabled).to.be.false;

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          applyButton().simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ ...defaultFetchOptions, sortType: 'bgm', sort: '-lastUploadDate', 'bgm.lastUploadDateFrom': sinon.match.string, 'bgm.lastUploadDateTo': sinon.match.string }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Last upload apply filter', sinon.match({ clinicId: 'clinicID123', dateRange: '30 days', type: 'bgm'}));
        });

        it('should allow filtering by tags', () => {
          const patientTagsFilterTrigger = wrapper.find('#patient-tags-filter-trigger').hostNodes();
          expect(patientTagsFilterTrigger).to.have.lengthOf(1);

          const popover = () => wrapper.find('#patientTagFilters').hostNodes();
          expect(popover().props().style.visibility).to.equal('hidden');

          // Open filters popover
          patientTagsFilterTrigger.simulate('click');
          expect(popover().props().style.visibility).to.be.undefined;

          // Ensure filter options present
          const filterOptions = popover().find('.tag-list').find('.tag-text').hostNodes();
          expect(filterOptions).to.have.lengthOf(3);
          expect(filterOptions.at(0).text()).to.equal('test tag 1');
          expect(filterOptions.at(1).text()).to.equal('test tag 2');
          expect(filterOptions.at(2).text()).to.equal('test tag 3');

          // Apply button disabled until selection made
          const applyButton = () => popover().find('#apply-patient-tags-filter').hostNodes();
          expect(applyButton().props().disabled).to.be.true;

          popover().find('#tag1').hostNodes().simulate('click');
          popover().find('#tag2').hostNodes().simulate('click');
          expect(applyButton().props().disabled).to.be.false;

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          applyButton().simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ ...defaultFetchOptions, sort: '-lastUploadDate', tags: ['tag1', 'tag2'] }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Patient tag filter apply', sinon.match({ clinicId: 'clinicID123' }));
        });

        it('should allow filtering by cgm use', () => {
          const cgmUseFilterTrigger = wrapper.find('#cgm-use-filter-trigger').hostNodes();
          expect(cgmUseFilterTrigger).to.have.lengthOf(1);

          const popover = () => wrapper.find('#cgmUseFilters').hostNodes();
          expect(popover().props().style.visibility).to.equal('hidden');

          // Open filters popover
          cgmUseFilterTrigger.simulate('click');
          expect(popover().props().style.visibility).to.be.undefined;

          // Ensure filter options present
          const cgmUseFilterOptions = popover().find('#cgm-use').find('label').hostNodes();
          expect(cgmUseFilterOptions).to.have.lengthOf(2);
          expect(cgmUseFilterOptions.at(0).text()).to.equal('Less than 70%');
          expect(cgmUseFilterOptions.at(0).find('input').props().value).to.equal('<0.7');

          expect(cgmUseFilterOptions.at(1).text()).to.equal('70% or more');
          expect(cgmUseFilterOptions.at(1).find('input').props().value).to.equal('>=0.7');

          // Apply button disabled until selection made
          const applyButton = () => popover().find('#apply-cgm-use-filter').hostNodes();
          expect(applyButton().props().disabled).to.be.true;

          cgmUseFilterOptions.at(1).find('input').last().simulate('change', { target: { name: 'cgm-use', value: '<0.7' } });
          expect(applyButton().props().disabled).to.be.false;

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          applyButton().simulate('click');
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ ...defaultFetchOptions, sortType: 'cgm', 'cgm.timeCGMUsePercent': '<0.7' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - CGM use apply filter', sinon.match({ clinicId: 'clinicID123', filter: '<0.7' }));
        });

        describe('managing clinic patient tags', () => {
          let filterPopover, editTagsDialog, patientTagsFilterTrigger, patientTagsEditTrigger;

          beforeEach(() => {
            patientTagsFilterTrigger = wrapper.find('#patient-tags-filter-trigger').hostNodes();
            filterPopover = () => wrapper.find('#patientTagFilters').hostNodes();

            patientTagsEditTrigger = filterPopover().find('#show-edit-clinic-patient-tags-dialog').hostNodes();
            editTagsDialog = () => wrapper.find('#editClinicPatientTags').hostNodes();

            expect(patientTagsFilterTrigger).to.have.lengthOf(1);
            expect(filterPopover().props().style.visibility).to.equal('hidden');
            expect(editTagsDialog()).to.have.length(0);

            // Open filters popover
            patientTagsFilterTrigger.simulate('click');
            expect(filterPopover().props().style.visibility).to.be.undefined;

            // Open clinic tags edit popover
            patientTagsEditTrigger.simulate('click');
            wrapper.update();
            expect(editTagsDialog()).to.have.length(1);
            expect(editTagsDialog().childAt(0).props().open).to.be.true;


            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Edit clinic tags open', sinon.match({ clinicId: 'clinicID123', source: 'Filter menu' }));
          });

          it('should allow adding a clinic patient tag', done => {
            const addInput = editTagsDialog().find('#patient-tag-add').find('input#name');
            const addButton = () => editTagsDialog().find('#patient-tag-add').find('button[type="submit"]').hostNodes();
            expect(addButton()).to.have.length(1);
            expect(addButton().props().disabled).to.be.true;

            addInput.simulate('change', { persist: noop, target: { name: 'name', value: 'new tag' } })

            defaultProps.api.clinics.createClinicPatientTag.resetHistory();
            addButton().simulate('submit');

            setTimeout(() => {
              sinon.assert.calledWith(defaultProps.api.clinics.createClinicPatientTag, 'clinicID123', { name: 'new tag' });
              sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Edit clinic tags add', sinon.match({ clinicId: 'clinicID123' }));
              done();
            }, 0);
          });

          it('should allow updating a clinic patient tag', done => {
            // Ensure tags present
            const tags = editTagsDialog().find('.tag-list').find('.tag-text').hostNodes();
            expect(tags).to.have.lengthOf(3);
            expect(tags.at(0).text()).to.equal('test tag 1');
            expect(tags.at(1).text()).to.equal('test tag 2');
            expect(tags.at(2).text()).to.equal('test tag 3');

            const confirmDialog = () => wrapper.find('Dialog#updatePatientTag');
            expect(confirmDialog()).to.have.length(0);

            // Open confirm dialog
            editTagsDialog().find('#tag1').hostNodes().simulate('click');
            wrapper.update();
            expect(confirmDialog()).to.have.length(1);
            expect(confirmDialog().props().open).to.be.true;

            const confirmButton = () => confirmDialog().find('button#patient-tag-update-confirm').hostNodes();
            expect(confirmButton()).to.have.length(1);
            expect(confirmButton().props().disabled).to.be.false;

            const editInput = confirmDialog().find('#patient-tag-update').find('input#name');
            editInput.simulate('change', { persist: noop, target: { name: 'name', value: '' } })
            expect(confirmButton().props().disabled).to.be.true;

            editInput.simulate('change', { persist: noop, target: { name: 'name', value: 'new tag name' } })
            expect(confirmButton().props().disabled).to.be.false;

            defaultProps.api.clinics.updateClinicPatientTag.resetHistory();
            confirmButton().simulate('submit');

            setTimeout(() => {
              sinon.assert.calledWith(defaultProps.api.clinics.updateClinicPatientTag, 'clinicID123', 'tag1', { name: 'new tag name' });
              sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Edit clinic tags update', sinon.match({ clinicId: 'clinicID123' }));
              done();
            }, 0);
          });

          it('should allow deleting a clinic patient tag', () => {
            // Ensure tags present
            const tags = editTagsDialog().find('.tag-list').find('.tag-text').hostNodes();
            expect(tags).to.have.lengthOf(3);
            expect(tags.at(0).text()).to.equal('test tag 1');
            expect(tags.at(1).text()).to.equal('test tag 2');
            expect(tags.at(2).text()).to.equal('test tag 3');

            const confirmDialog = () => wrapper.find('Dialog#deletePatientTag');
            expect(confirmDialog()).to.have.length(0);

            // Open confirm dialog
            editTagsDialog().find('#tag1').find('.icon').hostNodes().simulate('click');
            wrapper.update();
            expect(confirmDialog()).to.have.length(1);
            expect(confirmDialog().props().open).to.be.true;

            const confirmButton = () => confirmDialog().find('button#patientTagRemoveConfirm').hostNodes();
            expect(confirmButton()).to.have.length(1);

            defaultProps.api.clinics.deleteClinicPatientTag.resetHistory();
            confirmButton().simulate('click');

            sinon.assert.calledWith(defaultProps.api.clinics.deleteClinicPatientTag, 'clinicID123', 'tag1');
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Edit clinic tags delete', sinon.match({ clinicId: 'clinicID123' }));
          });
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

          // Ensure filter options present and in default unchecked state
          const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
          expect(veryLowFilter()).to.have.lengthOf(1);
          expect(veryLowFilter().text()).contains('Severe hypoglycemia');
          expect(veryLowFilter().text()).contains('Greater than 1% Time');
          expect(veryLowFilter().text()).contains('below 54 mg/dL');
          expect(veryLowFilter().find('input').props().checked).to.be.false;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          expect(lowFilter()).to.have.lengthOf(1);
          expect(lowFilter().text()).contains('Hypoglycemia');
          expect(lowFilter().text()).contains('Greater than 4% Time');
          expect(lowFilter().text()).contains('between 54-70 mg/dL');
          expect(lowFilter().find('input').props().checked).to.be.false;

          const targetFilter = () => dialog().find('#time-in-range-filter-target').hostNodes();
          expect(targetFilter()).to.have.lengthOf(1);
          expect(targetFilter().text()).contains('Normal');
          expect(targetFilter().text()).contains('Less than 70% Time');
          expect(targetFilter().text()).contains('between 70-180 mg/dL');
          expect(targetFilter().find('input').props().checked).to.be.false;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          expect(highFilter()).to.have.lengthOf(1);
          expect(highFilter().text()).contains('Hyperglycemia');
          expect(highFilter().text()).contains('Greater than 25% Time');
          expect(highFilter().text()).contains('between 180-250 mg/dL');
          expect(highFilter().find('input').props().checked).to.be.false;

          const veryHighFilter = () => dialog().find('#time-in-range-filter-veryHigh').hostNodes();
          expect(veryHighFilter()).to.have.lengthOf(1);
          expect(veryHighFilter().text()).contains('Severe hyperglycemia');
          expect(veryHighFilter().text()).contains('Greater than 5% Time ');
          expect(veryHighFilter().text()).contains('above 250 mg/dL');
          expect(veryHighFilter().find('input').props().checked).to.be.false;

          // Select all filter ranges
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-timeInVeryLowPercent-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          lowFilter().find('input').simulate('change', { target: { name: 'range-timeInLowPercent-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          targetFilter().find('input').simulate('change', { target: { name: 'range-timeInTargetPercent-filter', checked: true } });
          expect(targetFilter().find('input').props().checked).to.be.true;

          highFilter().find('input').simulate('change', { target: { name: 'range-timeInHighPercent-filter', checked: true } });
          expect(highFilter().find('input').props().checked).to.be.true;

          veryHighFilter().find('input').simulate('change', { target: { name: 'range-timeInVeryHighPercent-filter', checked: true } });
          expect(veryHighFilter().find('input').props().checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          const applyButton = dialog().find('#timeInRangeFilterConfirm').hostNodes();
          applyButton.simulate('click');

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({
            ...defaultFetchOptions,
            sort: '-lastUploadDate',
            'cgm.timeInHighPercent': '>=0.25',
            'cgm.timeInLowPercent': '>=0.04',
            'cgm.timeInTargetPercent': '<=0.7',
            'cgm.timeInVeryHighPercent': '>=0.05',
            'cgm.timeInVeryLowPercent': '>=0.01',
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

        context('summary period filtering', () => {
          let mockedLocalStorage;

          beforeEach(() => {
            mockedLocalStorage = {
              activePatientFilters: {
                timeInRange: [
                    'timeInLowPercent',
                    'timeInHighPercent'
                ],
                patientTags: [],
                meetsGlycemicTargets: false,
              },
              activePatientSummaryPeriod: '14d',
            };

            ClinicPatients.__Rewire__('useLocalStorage', sinon.stub().callsFake(key => {
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            }));

            wrapper = mount(
              <Provider store={store}>
                <ToastProvider>
                  <ClinicPatients {...defaultProps} />
                </ToastProvider>
              </Provider>
            );

            wrapper.find('#patients-view-toggle').hostNodes().simulate('click');
          });

          afterEach(() => {
            ClinicPatients.__ResetDependency__('useLocalStorage');
          });

          it('should allow filtering by summary period', () => {
            const summaryPeriodFilterTrigger = wrapper.find('#summary-period-filter-trigger').hostNodes();
            expect(summaryPeriodFilterTrigger).to.have.lengthOf(1);

            const popover = () => wrapper.find('#summaryPeriodFilters').hostNodes();
            expect(popover().props().style.visibility).to.equal('hidden');

            // Open filters popover
            summaryPeriodFilterTrigger.simulate('click');
            expect(popover().props().style.visibility).to.be.undefined;

            // Ensure filter options present
            const filterOptions = popover().find('#summary-period-filters').find('label').hostNodes();
            expect(filterOptions).to.have.lengthOf(4);
            expect(filterOptions.at(0).text()).to.equal('24 hours');
            expect(filterOptions.at(0).find('input').props().value).to.equal('1d');

            expect(filterOptions.at(1).text()).to.equal('7 days');
            expect(filterOptions.at(1).find('input').props().value).to.equal('7d');

            expect(filterOptions.at(2).text()).to.equal('14 days');
            expect(filterOptions.at(2).find('input').props().value).to.equal('14d');

            expect(filterOptions.at(3).text()).to.equal('30 days');
            expect(filterOptions.at(3).find('input').props().value).to.equal('30d');

            // Default should be 14 days
            expect(filterOptions.at(2).find('input').props().checked).to.be.true;

            // Set to 7 days
            filterOptions.at(1).find('input').last().simulate('change', { target: { name: 'summary-period-filters', value: '7d' } });

            defaultProps.api.clinics.getPatientsForClinic.resetHistory();
            const applyButton = popover().find('#apply-summary-period-filter').hostNodes();
            applyButton.simulate('click');

            // Ensure resulting patient fetch is requesting the 7 day period for time in range filters
            sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({
              ...defaultFetchOptions,
              sort: '-lastUploadDate',
              period: '7d',
              'cgm.timeInHighPercent': '>0.25',
              'cgm.timeInLowPercent': '>0.04',
            }));

            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Summary period apply filter', sinon.match({ clinicId: 'clinicID123', summaryPeriod: '7d' }));
          });

          it('should not show the GMI if selected period is less than 14 days', () => {
            const emptyStatText = '--';
            const summaryPeriodFilterTrigger = wrapper.find('#summary-period-filter-trigger').hostNodes();
            expect(summaryPeriodFilterTrigger).to.have.lengthOf(1);

            const popover = () => wrapper.find('#summaryPeriodFilters').hostNodes();
            expect(popover().props().style.visibility).to.equal('hidden');

            const applyButton = () => popover().find('#apply-summary-period-filter').hostNodes();

            // Open filters popover
            summaryPeriodFilterTrigger.simulate('click');
            expect(popover().props().style.visibility).to.be.undefined;

            // Ensure filter options present
            const filterOptions = () => popover().find('#summary-period-filters').find('label').hostNodes();

            // Default should be 14 days
            expect(filterOptions().at(2).find('input').props().checked).to.be.true;

            const table = () => wrapper.find(Table);
            expect(table()).to.have.length(1);

            const rows = () => table().find('tbody tr');
            expect(rows()).to.have.lengthOf(5);

            const rowData = row => rows().at(row).find('.MuiTableCell-root');

            expect(rowData(2).at(4).text()).contains('6.5 %'); // shows for 14 days

            // Open filters popover and set to 30 days
            summaryPeriodFilterTrigger.simulate('click');
            filterOptions().at(1).find('input').last().simulate('change', { target: { name: 'summary-period-filters', value: '30d' } });
            expect(filterOptions().at(3).find('input').props().checked).to.be.true;
            applyButton().simulate('click');
            expect(rowData(2).at(4).text()).contains('7.5 %'); // shows for 30 days

            // Open filters popover and set to 7 days
            summaryPeriodFilterTrigger.simulate('click');
            filterOptions().at(1).find('input').last().simulate('change', { target: { name: 'summary-period-filters', value: '7d' } });
            expect(filterOptions().at(1).find('input').props().checked).to.be.true;
            applyButton().simulate('click');
            expect(rowData(2).at(4).text()).contains(emptyStatText); // hidden for 7 days

            // Open filters popover and set to 1 day
            summaryPeriodFilterTrigger.simulate('click');
            filterOptions().at(1).find('input').last().simulate('change', { target: { name: 'summary-period-filters', value: '1d' } });
            expect(filterOptions().at(0).find('input').props().checked).to.be.true;
            applyButton().simulate('click');
            expect(rowData(2).at(4).text()).contains(emptyStatText); // hidden for 1 day
          });
        });

        context('persisted filter state', () => {
          let mockedLocalStorage;

          beforeEach(() => {
            store = mockStore(tier0300ClinicState);

            mockedLocalStorage = {
              activePatientFilters: {
                lastUploadDate: 14,
                timeInRange: [
                    'timeInLowPercent',
                    'timeInHighPercent'
                ],
                patientTags: ['tag2'],
                meetsGlycemicTargets: true,
              },
              activePatientSummaryPeriod: '14d',
            };

            ClinicPatients.__Rewire__('useLocalStorage', sinon.stub().callsFake(key => {
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            }));

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

          afterEach(() => {
            ClinicPatients.__ResetDependency__('useLocalStorage');
          });

          it('should set the last upload filter on load based on the stored filters', () => {
            const lastUploadFilterTrigger = wrapper.find('#last-upload-filter-trigger').hostNodes();
            expect(lastUploadFilterTrigger.text()).to.equal('Last 14 days');
          });

          it('should set the patient tag filters on load based on the stored filters', () => {
            const patientTagsFilterCount = wrapper.find('#patient-tags-filter-count').hostNodes();
            expect(patientTagsFilterCount.text()).to.equal('1');

            const patientTagsFilterTrigger = wrapper.find('#patient-tags-filter-trigger').hostNodes();
            expect(patientTagsFilterTrigger).to.have.lengthOf(1);

            const popover = () => wrapper.find('#patientTagFilters').hostNodes();
            expect(popover().props().style.visibility).to.equal('hidden');

            // Open filters popover
            patientTagsFilterTrigger.simulate('click');
            expect(popover().props().style.visibility).to.be.undefined;

            // Ensure selected filter is set
            const selectedFilters = popover().find('#selected-tag-filters').hostNodes();
            expect(selectedFilters.find('.tag-text').hostNodes().text()).to.equal('test tag 2');
          });

          it('should set the time in range filters on load based on the stored filters', () => {
            const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();

            // Should show 2 active time in range filters
            const timeInRangeFilterCount = () => wrapper.find('#time-in-range-filter-count').hostNodes();
            expect(timeInRangeFilterCount()).to.have.lengthOf(1);
            expect(timeInRangeFilterCount().text()).to.equal('2');

            const dialog = () => wrapper.find('Dialog#timeInRangeDialog');

            // Open time in rangefilters dialog
            timeInRangeFilterTrigger.simulate('click');
            wrapper.update();
            expect(dialog()).to.have.length(1);
            expect(dialog().props().open).to.be.true;

            // Ensure filter options in pre-set state
            const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
            expect(veryLowFilter().find('input').props().checked).to.be.false;

            const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
            expect(lowFilter().find('input').props().checked).to.be.true;

            const targetFilter = () => dialog().find('#time-in-range-filter-target').hostNodes();
            expect(targetFilter().find('input').props().checked).to.be.false;

            const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
            expect(highFilter().find('input').props().checked).to.be.true;

            const veryHighFilter = () => dialog().find('#time-in-range-filter-veryHigh').hostNodes();
            expect(veryHighFilter().find('input').props().checked).to.be.false;
          });

          it('should fetch the initial patient based on the stored filters', () => {
            sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({
              ...defaultFetchOptions,
              sort: '-lastUploadDate',
              'cgm.timeInHighPercent': '>=0.25',
              'cgm.timeInLowPercent': '>=0.04',
              tags: sinon.match.array,
            }));
          });
        });

        context('mmol/L preferredBgUnits', () => {
          beforeEach(() => {
            store = mockStore(tier0300ClinicStateMmoll);

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

          it('should show the bgm average glucose in mmol/L units', () => {
            const table = wrapper.find(Table);
            expect(table).to.have.length(1);

            const columns = table.find('.MuiTableCell-head');

            expect(columns.at(8).text()).to.equal('Avg. Glucose (mmol/L)');
            assert(columns.at(8).is('#peopleTable-header-bgm-averageGlucose'));

            const rows = table.find('tbody tr');
            expect(rows).to.have.lengthOf(5);

            const rowData = row => rows.at(row).find('.MuiTableCell-root');

            expect(rowData(1).at(8).text()).contains('10.5');
            expect(rowData(2).at(8).text()).contains('11.5');
            expect(rowData(3).at(8).text()).contains('12.5');
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
            expect(veryLowFilter().text()).contains('Severe hypoglycemia');
            expect(veryLowFilter().text()).contains('Greater than 1% Time');
            expect(veryLowFilter().text()).contains('below 3.0 mmol/L');
            expect(veryLowFilter().find('input').props().checked).to.be.false;

            const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
            expect(lowFilter()).to.have.lengthOf(1);
            expect(lowFilter().text()).contains('Hypoglycemia');
            expect(lowFilter().text()).contains('Greater than 4% Time');
            expect(lowFilter().text()).contains('between 3.0-3.9 mmol/L');
            expect(lowFilter().find('input').props().checked).to.be.false;

            const targetFilter = () => dialog().find('#time-in-range-filter-target').hostNodes();
            expect(targetFilter()).to.have.lengthOf(1);
            expect(targetFilter().text()).contains('Normal');
            expect(targetFilter().text()).contains('Less than 70% Time');
            expect(targetFilter().text()).contains('between 3.9-10.0 mmol/L');
            expect(targetFilter().find('input').props().checked).to.be.false;

            const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
            expect(highFilter()).to.have.lengthOf(1);
            expect(highFilter().text()).contains('Hyperglycemia');
            expect(highFilter().text()).contains('Greater than 25% Time');
            expect(highFilter().text()).contains('between 10.0-13.9 mmol/L');
            expect(highFilter().find('input').props().checked).to.be.false;

            const veryHighFilter = () => dialog().find('#time-in-range-filter-veryHigh').hostNodes();
            expect(veryHighFilter()).to.have.lengthOf(1);
            expect(veryHighFilter().text()).contains('Severe hyperglycemia');
            expect(veryHighFilter().text()).contains('Greater than 5% Time');
            expect(veryHighFilter().text()).contains('above 13.9 mmol/L');
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

          const typeFilterOptions = popover().find('#last-upload-type').find('label').hostNodes();
          expect(typeFilterOptions).to.have.lengthOf(2);

          const periodFilterOptions = popover().find('#last-upload-filters').find('label').hostNodes();
          expect(periodFilterOptions).to.have.lengthOf(4);

          typeFilterOptions.at(0).find('input').last().simulate('change', { target: { name: 'last-upload-type', value: 'cgm' } });
          periodFilterOptions.at(3).find('input').last().simulate('change', { target: { name: 'last-upload-filters', value: 30 } });
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
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-timeInVeryLowPercent-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          lowFilter().find('input').simulate('change', { target: { name: 'range-timeInLowPercent-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          highFilter().find('input').simulate('change', { target: { name: 'range-timeInHighPercent-filter', checked: true } });
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

          const typeFilterOptions = popover().find('#last-upload-type').find('label').hostNodes();
          expect(typeFilterOptions).to.have.lengthOf(2);

          const periodFilterOptions = popover().find('#last-upload-filters').find('label').hostNodes();
          expect(periodFilterOptions).to.have.lengthOf(4);

          typeFilterOptions.at(0).find('input').last().simulate('change', { target: { name: 'last-upload-type', value: 'cgm' } });
          periodFilterOptions.at(3).find('input').last().simulate('change', { target: { name: 'last-upload-filters', value: 30 } });
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
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-timeInVeryLowPercent-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          lowFilter().find('input').simulate('change', { target: { name: 'range-timeInLowPercent-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          highFilter().find('input').simulate('change', { target: { name: 'range-timeInHighPercent-filter', checked: true } });
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

        it('should clear pending filter edits when time in range filter dialog closed', () => {
          const filterCount = () => wrapper.find('#filter-count').hostNodes();
          expect(filterCount()).to.have.lengthOf(0);

          const timeInRangeFilterCount = () => wrapper.find('#time-in-range-filter-count').hostNodes();
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);

          // Reset Filters button only shows when filters are active
          const resetAllFiltersButton = () => wrapper.find('#reset-all-active-filters').hostNodes();
          expect(resetAllFiltersButton()).to.have.lengthOf(0);

          // Open time in range dialog
          const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();
          expect(timeInRangeFilterTrigger).to.have.lengthOf(1);

          const dialog = () => wrapper.find('Dialog#timeInRangeDialog');
          timeInRangeFilterTrigger.simulate('click');

          // Select 3 filter ranges
          const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-timeInVeryLowPercent-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          lowFilter().find('input').simulate('change', { target: { name: 'range-timeInLowPercent-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          highFilter().find('input').simulate('change', { target: { name: 'range-timeInHighPercent-filter', checked: true } });
          expect(highFilter().find('input').props().checked).to.be.true;

          // Close dialog without applying filter
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          expect(dialog()).to.have.length(1);
          const closeButton = dialog().find('DialogTitle button').hostNodes();
          closeButton.simulate('click');
          expect(dialog()).to.have.length(0);

          // Re-open dialog
          timeInRangeFilterTrigger.simulate('click');
          expect(dialog()).to.have.length(1);

          // Verify that options are not still checked
          expect(veryLowFilter().find('input').props().checked).to.be.false;
          expect(lowFilter().find('input').props().checked).to.be.false;
          expect(highFilter().find('input').props().checked).to.be.false;

          // Total filter count and time in range filter count should be unset
          expect(filterCount()).to.have.lengthOf(0);
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);
          expect(resetAllFiltersButton()).to.have.lengthOf(0);
        });

        it('should clear pending filter edits when time in range filter dialog closed by clicking outside dialog', () => {
          const filterCount = () => wrapper.find('#filter-count').hostNodes();
          expect(filterCount()).to.have.lengthOf(0);

          const timeInRangeFilterCount = () => wrapper.find('#time-in-range-filter-count').hostNodes();
          expect(timeInRangeFilterCount()).to.have.lengthOf(0);

          // Reset Filters button only shows when filters are active
          const resetAllFiltersButton = () => wrapper.find('#reset-all-active-filters').hostNodes();
          expect(resetAllFiltersButton()).to.have.lengthOf(0);

          // Open time in range dialog
          const timeInRangeFilterTrigger = wrapper.find('#time-in-range-filter-trigger').hostNodes();
          expect(timeInRangeFilterTrigger).to.have.lengthOf(1);

          const dialog = () => wrapper.find('Dialog#timeInRangeDialog');
          timeInRangeFilterTrigger.simulate('click');

          // Select 3 filter ranges
          const veryLowFilter = () => dialog().find('#time-in-range-filter-veryLow').hostNodes();
          veryLowFilter().find('input').simulate('change', { target: { name: 'range-timeInVeryLowPercent-filter', checked: true } });
          expect(veryLowFilter().find('input').props().checked).to.be.true;

          const lowFilter = () => dialog().find('#time-in-range-filter-low').hostNodes();
          lowFilter().find('input').simulate('change', { target: { name: 'range-timeInLowPercent-filter', checked: true } });
          expect(lowFilter().find('input').props().checked).to.be.true;

          const highFilter = () => dialog().find('#time-in-range-filter-high').hostNodes();
          highFilter().find('input').simulate('change', { target: { name: 'range-timeInHighPercent-filter', checked: true } });
          expect(highFilter().find('input').props().checked).to.be.true;

          // Close dialog without applying filter
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          expect(dialog()).to.have.length(1);
          const dialogBackdrop = dialog().find('.MuiBackdrop-root').hostNodes();
          dialogBackdrop.simulate('click');
          expect(dialog()).to.have.length(0);

          // Re-open dialog
          timeInRangeFilterTrigger.simulate('click');
          expect(dialog()).to.have.length(1);

          // Verify that options are not still checked
          expect(veryLowFilter().find('input').props().checked).to.be.false;
          expect(lowFilter().find('input').props().checked).to.be.false;
          expect(highFilter().find('input').props().checked).to.be.false;

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

        describe('managing patient tags', () => {
          it('should allow adding tags to a patient', () => {
            const table = wrapper.find(Table);
            const rows = table.find('tbody tr');
            const rowData = row => rows.at(row).find('.MuiTableCell-root');

            expect(rowData(0).at(2).text()).contains('Add'); // Add tag link when no tags avail
            const addTagsTrigger = rowData(0).find('#add-tags-to-patient-trigger').hostNodes();
            expect(addTagsTrigger).to.have.length(1);

            const addTagsPopover = () => wrapper.find('#add-patient-tags-patient1').hostNodes();
            expect(addTagsPopover()).to.have.length(1);
            expect(addTagsPopover().props().style.visibility).to.equal('hidden');

            // Open tags popover
            addTagsTrigger.simulate('click');
            expect(addTagsPopover().props().style.visibility).to.be.undefined;

            // No initial selected tags
            const selectedTags = () => addTagsPopover().find('.selected-tags').find('.tag-text').hostNodes();
            expect(selectedTags).to.have.length(0);

            // Ensure tag options present
            const availableTags = () => addTagsPopover().find('.available-tags').find('.tag-text').hostNodes();
            expect(availableTags()).to.have.lengthOf(3);
            expect(availableTags().at(0).text()).to.equal('test tag 1');
            expect(availableTags().at(1).text()).to.equal('test tag 2');
            expect(availableTags().at(2).text()).to.equal('test tag 3');

            // Apply button disabled until selection made
            const applyButton = () => addTagsPopover().find('#apply-patient-tags-dialog').hostNodes();
            expect(applyButton().props().disabled).to.be.true;

            addTagsPopover().find('#tag1').hostNodes().simulate('click');
            addTagsPopover().find('#tag2').hostNodes().simulate('click');
            expect(applyButton().props().disabled).to.be.false;

            // Tags should now be moved to selected group
            expect(selectedTags()).to.have.lengthOf(2);
            expect(selectedTags().at(0).text()).to.equal('test tag 1');
            expect(selectedTags().at(1).text()).to.equal('test tag 2');

            expect(availableTags()).to.have.lengthOf(1);
            expect(availableTags().at(0).text()).to.equal('test tag 3');

            defaultProps.api.clinics.getPatientsForClinic.resetHistory();
            applyButton().simulate('click');

            sinon.assert.calledWith(
              defaultProps.api.clinics.updateClinicPatient,
              'clinicID123',
              'patient1',
              {
                fullName: 'Patient One',
                birthDate: '1999-01-01',
                mrn: 'mrn012',
                id: 'patient1',
                email: 'patient1@test.ca',
                permissions: { custodian: {} },
                tags: ['tag1', 'tag2'],
                summary: {},
              }
            );

            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Assign patient tag confirm', sinon.match({ clinicId: 'clinicID123' }));
          });
        });

        it('should allow updating tags for a patient', done => {
          const table = wrapper.find(Table);
          const rows = table.find('tbody tr');
          const rowData = row => rows.at(row).find('.MuiTableCell-root');

          expect(rowData(1).at(2).text()).contains('test tag 1');
          const editTagsTrigger = rowData(1).find('.edit-tags-trigger').hostNodes();
          expect(editTagsTrigger).to.have.length(1);

          const dialog = () => wrapper.find('Dialog#editPatient');

          expect(dialog()).to.have.length(0);
          editTagsTrigger.simulate('click');
          wrapper.update();
          expect(dialog()).to.have.length(1);
          expect(dialog().props().open).to.be.true;

          expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient')).to.be.true;
          expect(defaultProps.trackMetric.callCount).to.equal(1);

          const patientForm = () => dialog().find('form#clinic-patient-form');
          expect(patientForm()).to.have.lengthOf(1);

          // Check existing selected tags
          const selectedTags = () => patientForm().find('.selected-tags').find('.tag-text').hostNodes();
          expect(selectedTags()).to.have.lengthOf(1);
          expect(selectedTags().at(0).text()).to.equal('test tag 1');

          // Ensure available tag options present
          const availableTags = () => patientForm().find('.available-tags').find('.tag-text').hostNodes();
          expect(availableTags()).to.have.lengthOf(2);
          expect(availableTags().at(0).text()).to.equal('test tag 2');
          expect(availableTags().at(1).text()).to.equal('test tag 3');

          // Add tag 3
          patientForm().find('#tag3').hostNodes().simulate('click');

          // Remove tag 1
          patientForm().find('#tag1').find('.icon').hostNodes().simulate('click');

          expect(selectedTags()).to.have.lengthOf(1);
          expect(selectedTags().at(0).text()).to.equal('test tag 3');

          expect(availableTags()).to.have.lengthOf(2);
          expect(availableTags().at(0).text()).to.equal('test tag 1');
          expect(availableTags().at(1).text()).to.equal('test tag 2');

          store.clearActions();
          dialog().find('Button#editPatientConfirm').simulate('click');

          setTimeout(() => {
            expect(defaultProps.api.clinics.updateClinicPatient.callCount).to.equal(1);

            sinon.assert.calledWith(
              defaultProps.api.clinics.updateClinicPatient,
              'clinicID123',
              'patient2',
              {
                id: 'patient2',
                email: 'patient2@test.ca',
                fullName: 'Patient Two',
                birthDate: '1999-02-02',
                connectDexcom: false,
                mrn: 'mrn123',
                permissions: { custodian : undefined },
                summary: {
                  bgmStats: {
                    dates: {
                      lastUploadDate: sinon.match.string,
                    },
                    periods: { '14d': {
                      averageGlucose: { units: MMOLL_UNITS, value: 10.5 },
                      averageDailyRecords: 0.25,
                      timeInVeryLowRecords: 1,
                      timeInVeryHighRecords: 2,
                    } },
                  },
                  cgmStats: {
                    dates: {
                      lastUploadDate: sinon.match.string,
                    },
                    periods: {
                      '14d': {
                        averageGlucose: { units: 'mmol/L' },
                        glucoseManagementIndicator: 7.75,
                        timeCGMUseMinutes: 1380,
                        timeCGMUsePercent: 0.85,
                      },
                    },
                  },
                },
                tags: ['tag3'],
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
        })
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
