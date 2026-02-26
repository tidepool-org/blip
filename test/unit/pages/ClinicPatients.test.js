import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import isString from 'lodash/isString';
import merge from 'lodash/merge';
import noop from 'lodash/noop';
import defaults from 'lodash/defaults';
import moment from 'moment';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import ClinicPatients from '../../../app/pages/clinicworkspace/ClinicPatients';
import { clinicUIDetails } from '../../../app/core/clinicUtils';
import { URL_TIDEPOOL_PLUS_PLANS } from '../../../app/core/constants';
import mockRpmReportPatients from '../../fixtures/mockRpmReportPatients.json'
import LDClientMock from '../../fixtures/LDClientMock';

const mockUseLDClient = jest.fn();
const mockUseFlags = jest.fn();
const mockUseLocation = jest.fn();
const mockUseHistory = jest.fn();
const mockUseLocalStorage = jest.fn();
const mockUseClinicPatientsFilters = jest.fn();
var mockApi;

jest.mock('launchdarkly-react-client-sdk', () => {
  const actual = jest.requireActual('launchdarkly-react-client-sdk');
  return {
    ...actual,
    useLDClient: (...args) => mockUseLDClient(...args),
    useFlags: (...args) => mockUseFlags(...args),
  };
});

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: (...args) => mockUseLocation(...args),
    useHistory: (...args) => mockUseHistory(...args),
  };
});

jest.mock('../../../app/core/hooks', () => {
  const actual = jest.requireActual('../../../app/core/hooks');
  return {
    ...actual,
    useLocalStorage: (...args) => mockUseLocalStorage(...args),
  };
});

jest.mock('../../../app/pages/clinicworkspace/useClinicPatientsFilters', () => {
  const actual = jest.requireActual('../../../app/pages/clinicworkspace/useClinicPatientsFilters');
  return {
    ...actual,
    __esModule: true,
    default: (...args) => mockUseClinicPatientsFilters(...args),
  };
});

jest.mock('../../../app/core/api', () => {
  if (!mockApi) mockApi = { clinics: {} };
  return {
    __esModule: true,
    default: mockApi,
  };
});

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
  const today = moment().toISOString();
  const yesterday = moment(today).subtract(1, 'day').toISOString();

  let container;
  let rerender;
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
        sendPatientDataProviderConnectRequest: sinon.stub().callsArgWith(2, null),
        createClinicPatientTag: sinon.stub(),
        updateClinicPatientTag: sinon.stub(),
        deleteClinicPatientTag: sinon.stub(),
        deleteClinicPatientTag: sinon.stub(),
        getPatientsForRpmReport: sinon.stub().callsArgWith(2, null, mockRpmReportPatients),
        setClinicPatientLastReviewed: sinon.stub().callsArgWith(2, null, [today, yesterday]),
        revertClinicPatientLastReviewed: sinon.stub().callsArgWith(2, null, [yesterday]),
      },
    },
  };

  const mountWrapper = (store) => {
    cleanup();
    const result = render(
      <Provider store={store}>
        <ToastProvider>
          <ClinicPatients {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
    container = result.container;
    rerender = result.rerender;
  };

  beforeEach(() => {
    delete localStorage['activePatientFilters/clinicianUserId123/clinicID123'];
    delete localStorage.activePatientSort;
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.getPatientFromClinic.resetHistory();
    defaultProps.api.clinics.getPatientsForClinic.resetHistory();
    defaultProps.api.clinics.deletePatientFromClinic.resetHistory();
    defaultProps.api.clinics.createClinicCustodialAccount.resetHistory();
    defaultProps.api.clinics.sendPatientDataProviderConnectRequest.resetHistory();
    defaultProps.api.clinics.updateClinicPatient.resetHistory();
    defaultProps.api.clinics.getPatientsForRpmReport.resetHistory();
    mockApi.clinics = defaultProps.api.clinics;
    mockUseLDClient.mockReturnValue(new LDClientMock());
    mockUseFlags.mockReturnValue({ showSummaryData: true });
    mockUseLocation.mockReturnValue({ pathname: '/clinic-workspace' });
    mockUseHistory.mockReturnValue({
      location: { query: {}, pathname: '/settings' },
      replace: sinon.stub(),
    });
    mockUseLocalStorage.mockImplementation((key, fallback = {}) => {
      return [fallback, sinon.stub()];
    });
    mockUseClinicPatientsFilters.mockReturnValue([
      {
        timeInRange: [],
        patientTags: [],
        meetsGlycemicTargets: false,
      },
      sinon.stub(),
    ]);
  });

  afterEach(() => {
    cleanup();
    mockUseLDClient.mockReset();
    mockUseFlags.mockReset();
    mockUseLocation.mockReset();
    mockUseHistory.mockReset();
    mockUseLocalStorage.mockReset();
    mockUseClinicPatientsFilters.mockReset();
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

  const defaultClinic = {
    clinicians:{
      clinicianUserId123,
    },
    patients: {},
    id: 'clinicID123',
    address: '2 Address Ln, City Zip',
    country: 'US',
    name: 'other_clinic_name',
    email: 'other_clinic_email_address@example.com',
    timezone: 'US/Eastern',
  };

  const noPatientsState = {
    blip: {
      loggedInUserId,
      clinics: {
        clinicID123: {
          ...defaultClinic,
          ...clinicUIDetails(defaultClinic),
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
        sendingPatientDataProviderConnectRequest: defaultWorkingState,
        creatingClinicSite: defaultWorkingState,
        creatingClinicPatientTag: defaultWorkingState,
        updatingClinicPatientTag: defaultWorkingState,
        deletingClinicPatientTag: defaultWorkingState,
        fetchingTideDashboardPatients: defaultWorkingState,
        fetchingRpmReportPatients: defaultWorkingState,
        settingClinicPatientLastReviewed: defaultWorkingState,
        revertingClinicPatientLastReviewed: defaultWorkingState,
        fetchingClinicMRNsForPatientFormValidation: defaultWorkingState,
      },
      patientListFilters: {
        patientListSearchTextInput: '',
        isPatientListVisible: true
      }
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
          ...defaultClinic,
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
              mrn: 'MRN123',
              permissions: { custodian : {} }
            },
          },
        },
      },
      clinicMRNsForPatientFormValidation: ['MRN123'],
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
              createdTime: '2021-10-19T16:27:59.504Z',
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
              createdTime: '2021-10-19T16:27:59.504Z',
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
          ...clinicUIDetails({
            ...hasPatientsState.blip.clinics.clinicID123,
            tier: 'tier0100',
          }),
          tier: 'tier0100',
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
          ...clinicUIDetails({
            ...hasPatientsState.blip.clinics.clinicID123,
            tier: 'tier0300',
          }),
          tier: 'tier0300',
          patientTags: [
            { id: 'tag3', name: 'ttest tag 3'},
            { id: 'tag2', name: 'test tag 2'},
            { id: 'tag1', name: '>test tag 1'},
          ],
          patients: {
            patient1: {
              id: 'patient1',
              email: 'patient1@test.ca',
              fullName: 'Patient One',
              birthDate: '1999-01-01',
              mrn: 'MRN012',
              summary: {},
              permissions: { custodian : {} },
              tags: [],
              reviews: [
                { clinicianId: 'clinicianUserId123', time: today },
                { clinicianId: 'clinicianUserId123', time: yesterday },
              ],
            },
            patient2: {
              id: 'patient2',
              email: 'patient2@test.ca',
              fullName: 'Patient Two',
              birthDate: '1999-02-02',
              mrn: 'MRN123',
              summary:{
                bgmStats: {
                  dates: {
                    lastData: yesterday,
                  },
                  periods: { '14d': {
                    averageGlucoseMmol: 10.5,
                    averageDailyRecords: 0.25,
                    timeInVeryLowRecords: 1,
                    timeInVeryHighRecords: 2,
                  } },
                },
                cgmStats: {
                  dates: {
                    lastData: today,
                  },
                  periods: { '14d': {
                    timeCGMUsePercent: 0.85,
                    timeCGMUseMinutes: 23 * 60,
                    glucoseManagementIndicator: 7.75,
                  } },
                },
              },
              permissions: { custodian : undefined },
              tags: ['tag1'],
              reviews: [{ clinicianId: 'clinicianUserId123', time: yesterday }],
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
                    lastData: moment().subtract(1, 'day').toISOString(),
                  },
                  periods: { '14d': {
                    averageGlucoseMmol: 11.5,
                    averageDailyRecords: 1.25,
                    timeInVeryLowRecords: 3,
                    timeInVeryHighRecords: 4,
                  } },
                },
                cgmStats: {
                  dates: {
                    lastData: yesterday,
                  },
                  periods: {
                    '30d': {
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 7.5,
                    },
                    '14d': {
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 6.5,
                    },
                    '7d': {
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 5.5,
                    },
                    '1d': {
                      timeCGMUsePercent: 0.70,
                      timeCGMUseMinutes:  7 * 24 * 60,
                      glucoseManagementIndicator: 4.5,
                    },
                  },
                },
              },
              tags: ['tag1', 'tag2', 'tag3'],
              reviews: [{ clinicianId: 'clinicianUserId123', time: moment(today).subtract(30, 'd').toISOString() }],
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
                    lastData: yesterday,
                  },
                  periods: { '14d': {
                    averageGlucoseMmol: 12.5,
                    averageDailyRecords: 1.5,
                    timeInVeryLowRecords: 0,
                    timeInVeryHighRecords: 0,
                  } },
                },
                cgmStats: {
                  dates: {
                    lastData: moment().subtract(30, 'days').toISOString(),
                  },
                  periods: { '14d': {
                    timeCGMUsePercent: 0.69,
                    timeCGMUseMinutes:  7 * 24 * 60,
                    glucoseManagementIndicator: 8.5,
                  } },
                },
              },
              reviews: [{ clinicianId: 'clinicianUserId123', time: moment('2024-03-05T12:00:00.000Z').toISOString() }],
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
                    lastData: moment().subtract(31, 'days').toISOString(),
                  },
                  periods: { '14d': {
                    timeCGMUsePercent: 0.69,
                    timeCGMUseMinutes:  30 * 24 * 60,
                    glucoseManagementIndicator: 8.5,
                  } },
                },
              },
            },
          },
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
      mountWrapper(store);
      expect(store.getActions()).to.eql([]);
    });

    it('should fetch patients for clinic', () => {
      store = mockStore(hasPatientsState);
      mountWrapper(store);
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
      mountWrapper(store);
      const expectedActions = [
        { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
      ];
      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  context('patients hidden', () => {
    beforeEach(() => {
      const initialState = {
        blip: {
          ...hasPatientsState.blip,
          patientListFilters: { isPatientListVisible: false, patientListSearchTextInput: '' }
        }
      }

      store = mockStore(initialState);
      mountWrapper(store);

      store.clearActions();
      defaultProps.trackMetric.resetHistory();
    });

    it('should render a button that toggles patients to be visible', () => {
      fireEvent.click(container.querySelector('.peopletable-names-showall'));
      expect(store.getActions()).to.eql([{ type: 'SET_IS_PATIENT_LIST_VISIBLE', payload: { isVisible: true } }])
    })
  });

  context('no patients', () => {
    beforeEach(() => {
      store = mockStore(noPatientsState);
      mountWrapper(store);

      defaultProps.trackMetric.resetHistory();
    });

    it('should render an empty table', () => {
      expect(container.querySelector('.table-empty-text').textContent).includes('There are no results to show');
    });

    describe('Filter Reset Bar', () => {
      it('should hide the Filter Reset Bar', () => {
        const filterResetBar = container.querySelector('.filter-reset-bar');
        expect(filterResetBar).to.be.null;
      });
    });

    it('should open a modal for adding a new patient', async () => {
      const addButton = container.querySelector('button#add-patient');
      expect(addButton.textContent).to.equal('Add New Patient');

      expect(document.querySelector('#addPatient')).to.be.null;
      fireEvent.click(addButton);
      expect(document.querySelector('#addPatient')).to.exist;

      expect(defaultProps.trackMetric.calledWith('Clinic - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      expect(document.querySelector('#addPatient form#clinic-patient-form')).to.exist;

      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="fullName"]'), { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('Patient Name');

      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('11/21/1999');

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: '123456' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('123456');

      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="email"]'), { persist: noop, target: { name: 'email', value: 'patient@test.ca' } });
      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('patient@test.ca');

      store.clearActions();
      fireEvent.click(document.querySelector('#addPatient [id="addPatientConfirm"]'));

      await waitFor(() => {
        expect(defaultProps.api.clinics.createClinicCustodialAccount.callCount).to.equal(1);

        sinon.assert.calledWith(
          defaultProps.api.clinics.createClinicCustodialAccount,
          'clinicID123',
          {
            fullName: 'Patient Name',
            birthDate: '1999-11-21',
            mrn: '123456',
            email: 'patient@test.ca',
            tags: [],
            sites: [],
            diagnosisType: '',
            glycemicRanges: { type: 'preset', preset: 'adaStandard' },
          }
        );

        expect(store.getActions()[0]).to.eql({
          type: 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST',
        })

        expect(store.getActions()[1]).to.eql({
          type: 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_SUCCESS',
          payload: {
            clinicId: 'clinicID123',
            patientId: 'stubbedId',
            patient: { id: 'stubbedId' },
          },
        });
      });
    });

    it('should prevent adding a new patient with an invalid birthday', () => {
      const addButton = container.querySelector('button#add-patient');
      expect(addButton.textContent).to.equal('Add New Patient');

      expect(document.querySelector('#addPatient')).to.be.null;
      fireEvent.click(addButton);
      expect(document.querySelector('#addPatient')).to.exist;

      expect(defaultProps.trackMetric.calledWith('Clinic - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      expect(document.querySelector('#addPatient form#clinic-patient-form')).to.exist;

      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="fullName"]'), { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('Patient Name');

      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '13/21/1999' } });
      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('13/21/1999');

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: '123456' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('123456');

      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="email"]'), { persist: noop, target: { name: 'email', value: 'patient@test.ca' } });
      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('patient@test.ca');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.true;

      fireEvent.change(document.querySelector('#addPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('11/21/1999');
      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.false;
    });

    it('should prevent adding a new patient without an MRN if required by the clinic', () => {
      store = mockStore(mrnRequiredState);
      mountWrapper(store);

      const addButton = container.querySelector('button#add-patient');
      expect(addButton.textContent).to.equal('Add New Patient');

      expect(document.querySelector('#addPatient')).to.be.null;
      fireEvent.click(addButton);
      expect(document.querySelector('#addPatient')).to.exist;

      expect(defaultProps.trackMetric.calledWith('Clinic - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      expect(document.querySelector('#addPatient form#clinic-patient-form')).to.exist;

      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="fullName"]'), { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('Patient Name');

      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('11/21/1999');

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: '' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');

      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="email"]'), { persist: noop, target: { name: 'email', value: '' } });
      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.true;

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'mrn876' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('MRN876');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.false;
    });

    it('should prevent adding a new patient with an invalid MRN', () => {
      store = mockStore(mrnRequiredState);
      mountWrapper(store);

      const addButton = container.querySelector('button#add-patient');
      expect(addButton.textContent).to.equal('Add New Patient');

      expect(document.querySelector('#addPatient')).to.be.null;
      fireEvent.click(addButton);
      expect(document.querySelector('#addPatient')).to.exist;

      expect(defaultProps.trackMetric.calledWith('Clinic - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      expect(document.querySelector('#addPatient form#clinic-patient-form')).to.exist;

      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="fullName"]'), { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('Patient Name');

      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('11/21/1999');

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: '' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');

      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="email"]'), { persist: noop, target: { name: 'email', value: '' } });
      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.true;

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'm' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('M');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.false;

      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'mrn876thiswillexceedthelengthlimit' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('MRN876THISWILLEXCEEDTHELENGTHLIMIT');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.true;

      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'mrn876-only-alphanumerics' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('MRN876-ONLY-ALPHANUMERICS');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.true;

      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'mrn876' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('MRN876');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.false;
    });

    it('should prevent adding a new patient with an existing MRN', () => {
      store = mockStore(hasPatientsState);
      mountWrapper(store);

      const addButton = container.querySelector('button#add-patient');
      expect(addButton.textContent).to.equal('Add New Patient');

      expect(document.querySelector('#addPatient')).to.be.null;
      fireEvent.click(addButton);
      expect(document.querySelector('#addPatient')).to.exist;

      expect(defaultProps.trackMetric.calledWith('Clinic - Add patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      expect(document.querySelector('#addPatient form#clinic-patient-form')).to.exist;

      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="fullName"]'), { persist: noop, target: { name: 'fullName', value: 'Patient Name' } });
      expect(document.querySelector('#addPatient input[name="fullName"]').value).to.equal('Patient Name');

      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '11/21/1999' } });
      expect(document.querySelector('#addPatient input[name="birthDate"]').value).to.equal('11/21/1999');

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'MRN123' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('MRN123');

      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');
      fireEvent.change(document.querySelector('#addPatient input[name="email"]'), { persist: noop, target: { name: 'email', value: '' } });
      expect(document.querySelector('#addPatient input[name="email"]').value).to.equal('');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.true;

      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('MRN123');
      fireEvent.change(document.querySelector('#addPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'MRN12345' } });
      expect(document.querySelector('#addPatient input[name="mrn"]').value).to.equal('MRN12345');

      expect(document.querySelector('#addPatient [id="addPatientConfirm"]').disabled).to.be.false;
    });
  });

  context('has patients but none matching filter criteria', () => {
    let mockedLocalStorage = {
      activePatientSummaryPeriod: '14d',
    };

    let mockSetActiveFilters;

    beforeEach(() => {
      mockSetActiveFilters = sinon.stub();

      mockUseLocalStorage.mockImplementation(key => {
        defaults(mockedLocalStorage, { [key]: {} });
        return [
          mockedLocalStorage[key],
          sinon.stub().callsFake(val => mockedLocalStorage[key] = val),
        ];
      });

      mockUseClinicPatientsFilters.mockImplementation(() => (
        [
          {
            timeInRange: ['timeInLowPercent'],
            patientTags: [],
            meetsGlycemicTargets: false,
          },
          mockSetActiveFilters,
        ]
      ));

      const noPatientsButWithFiltersState = merge({}, noPatientsState, {
        blip: {
          patientListFilters: {
            patientListSearchTextInput: 'CantMatchThis',
          },
        },
      });

      store = mockStore(noPatientsButWithFiltersState);
      defaultProps.trackMetric.resetHistory();
      mountWrapper(store);
    });

    describe('Filter Reset Bar', () => {
      it('should hide the Filter Reset Bar', () => {
        const filterResetBar = container.querySelector('.filter-reset-bar');
        expect(filterResetBar).to.be.null;
      });
    });

    describe('when Reset Filters button is clicked', function () {
      it('should show the No Results text', () => {
        expect(container.querySelectorAll('.MuiTableRow-root').length).to.equal(1); // only header
        expect(container.querySelector('.table-empty-text').textContent).includes('There are no patient accounts with the current filter(s)');
      });

      it('should remove the active filters from localStorage', function () {
        fireEvent.click(container.querySelector('.reset-filters-button'));

        expect(mockSetActiveFilters.getCall(0).args[0].timeInRange.length).to.eql(0);
      });
    });

    describe('when Clear Search button is clicked', () => {
      it('should clear the search input text in Redux', async () => {
        store.clearActions();

        expect(store.getActions()).to.eql([]);

        fireEvent.click(container.querySelector('.clear-search-button'));
        await waitFor(() => {
          expect(store.getActions()).to.eql([
            {
              type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT',
              payload: { textInput: '' },
            },
            { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
          ]);
        });
      });
    });
  });

  context('has patients', () => {
    beforeEach(() => {
      store = mockStore(hasPatientsState);
      defaultProps.trackMetric.resetHistory();
      mountWrapper(store);
    });

    describe('showNames', function () {
      it('should show a row of data for each person', function () {
        // 2 people plus one row for the header
        expect(container.querySelectorAll('.MuiTableRow-root').length).to.equal(3);
      });

      it('should trigger a call to trackMetric', function () {
        fireEvent.click(container.querySelector('#patients-view-toggle'));
        expect(defaultProps.trackMetric.calledWith('Clicked Hide All')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);
      });

      it('should not have instructions displayed', function () {
        expect(container.querySelector('.peopletable-instructions')).to.be.null;
      });
    });

    context('show names clicked', () => {
      beforeEach(() => {
        defaultProps.trackMetric.resetHistory();
      });

      it('should render a list of patients', () => {
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites
        expect(rows[1].textContent).includes('Patient One');
        expect(rows[1].textContent).includes('1999-01-01');
        expect(rows[2].textContent).includes('Patient Two');
        expect(rows[2].textContent).includes('1999-02-02');
        expect(rows[2].textContent).includes('MRN123');
      });

      it('should allow searching patients', async () => {
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites
        expect(rows[1].textContent).includes('Patient One');
        expect(rows[2].textContent).includes('Patient Two');

        const searchInput = container.querySelector('input[name="search-patients"]');
        expect(searchInput).to.exist;

        // Clear the store actions
        store.clearActions();

        // Input partial match on name for patient two
        fireEvent.change(searchInput, { target: { name: 'search-patients', value: 'Two' } });

        await waitFor(() => {
          expect(store.getActions()).to.eql([
            { type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT', payload: { textInput: 'Two' } },
            { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
          ]);

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', { ...defaultFetchOptions, search: 'Two', sort: '+fullName' });
        });
      });

      it('should link to a patient data view when patient name is clicked', () => {
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites
        const firstPatientName = rows[1].querySelector('th span');
        expect(firstPatientName.textContent).includes('Patient One');

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
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites
        const spans = rows[1].querySelectorAll('td span');
        const firstPatientBirthday = Array.from(spans).find(s => s.textContent.includes('1999-01-01'));
        expect(firstPatientBirthday.textContent).includes('1999-01-01');

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
        const moreMenuIcon = container.querySelectorAll('[aria-label="info"]')[0];
        expect(moreMenuIcon).to.exist;
        fireEvent.click(moreMenuIcon);
        await waitFor(() => {
          const popoverMenu = document.querySelector('#action-menu-patient1');
          expect(popoverMenu).to.exist;
          expect(popoverMenu.style.visibility).to.not.equal('hidden');
        });
      });

      it('should open a modal for patient editing when edit link is clicked', async () => {
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites

        // Open the more menu to expose the edit button
        const moreMenuIcon = rows[2].querySelector('[aria-label="info"]');
        expect(moreMenuIcon).to.exist;
        fireEvent.click(moreMenuIcon);
        await waitFor(() => expect(document.querySelector('#action-menu-patient2')).to.exist);

        const editButton = document.querySelector('button#edit-patient2');
        expect(editButton).to.exist;

        expect(document.querySelector('#editPatient')).to.be.null;
        fireEvent.click(editButton);
        await waitFor(() => expect(document.querySelector('#editPatient')).to.exist);

        expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        expect(document.querySelector('#editPatient form#clinic-patient-form')).to.exist;

        expect(document.querySelector('#editPatient input[name="fullName"]').value).to.equal('Patient Two');
        fireEvent.change(document.querySelector('#editPatient input[name="fullName"]'), { persist: noop, target: { name: 'fullName', value: 'Patient 2' } });
        expect(document.querySelector('#editPatient input[name="fullName"]').value).to.equal('Patient 2');

        expect(document.querySelector('#editPatient input[name="birthDate"]').value).to.equal('02/02/1999');
        fireEvent.change(document.querySelector('#editPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '01/01/1999' } });
        expect(document.querySelector('#editPatient input[name="birthDate"]').value).to.equal('01/01/1999');

        expect(document.querySelector('#editPatient input[name="mrn"]').value).to.equal('MRN123');
        fireEvent.change(document.querySelector('#editPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'mrn456' } });
        expect(document.querySelector('#editPatient input[name="mrn"]').value).to.equal('MRN456');

        expect(document.querySelector('#editPatient input[name="email"]').value).to.equal('patient2@test.ca');
        fireEvent.change(document.querySelector('#editPatient input[name="email"]'), { persist: noop, target: { name: 'email', value: 'patient-two@test.ca' } });
        expect(document.querySelector('#editPatient input[name="email"]').value).to.equal('patient-two@test.ca');

        store.clearActions();
        fireEvent.click(document.querySelector('#editPatient [id="editPatientConfirm"]'));

        await waitFor(() => {
          expect(defaultProps.api.clinics.updateClinicPatient.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.updateClinicPatient,
            'clinicID123',
            'patient2',
            {
              fullName: 'Patient 2',
              birthDate: '1999-01-01',
              mrn: 'MRN456',
              id: 'patient2',
              email: 'patient-two@test.ca',
              permissions: { custodian: {} },
              tags: [],
              sites: [],
              diagnosisType: '',
              glycemicRanges: { type: 'preset', preset: 'adaStandard' },
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
            { type: 'FETCH_CLINIC_MRNS_FOR_PATIENT_FORM_VALIDATION_REQUEST' },
          ]);
        });
      });

      it('should disable email editing for non-custodial patients', async () => {
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites

        // Open the more menu to expose the edit button
        const moreMenuIcon = rows[1].querySelector('[aria-label="info"]');
        expect(moreMenuIcon).to.exist;
        fireEvent.click(moreMenuIcon);
        await waitFor(() => expect(document.querySelector('#action-menu-patient1')).to.exist);

        const editButton = document.querySelector('button#edit-patient1');
        expect(editButton).to.exist;

        expect(document.querySelector('#editPatient')).to.be.null;
        fireEvent.click(editButton);
        await waitFor(() => expect(document.querySelector('#editPatient')).to.exist);

        expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        expect(document.querySelector('#editPatient form#clinic-patient-form')).to.exist;

        expect(document.querySelector('#editPatient input[name="fullName"]').value).to.equal('Patient One');
        fireEvent.change(document.querySelector('#editPatient input[name="fullName"]'), { persist: noop, target: { name: 'fullName', value: 'Patient 2' } });
        expect(document.querySelector('#editPatient input[name="fullName"]').value).to.equal('Patient 2');

        expect(document.querySelector('#editPatient input[name="birthDate"]').value).to.equal('01/01/1999');
        fireEvent.change(document.querySelector('#editPatient input[name="birthDate"]'), { persist: noop, target: { name: 'birthDate', value: '02/02/1999' } });
        expect(document.querySelector('#editPatient input[name="birthDate"]').value).to.equal('02/02/1999');

        expect(document.querySelector('#editPatient input[name="mrn"]').value).to.equal('');
        fireEvent.change(document.querySelector('#editPatient input[name="mrn"]'), { persist: noop, target: { name: 'mrn', value: 'mrn456' } });
        expect(document.querySelector('#editPatient input[name="mrn"]').value).to.equal('MRN456');

        expect(document.querySelector('#editPatient input[name="email"]').value).to.equal('patient1@test.ca');
        expect(document.querySelector('#editPatient input[name="email"]').disabled).to.equal(true);

        store.clearActions();
        fireEvent.click(document.querySelector('#editPatient [id="editPatientConfirm"]'));

        await waitFor(() => {
          expect(defaultProps.api.clinics.updateClinicPatient.callCount).to.equal(1);

          sinon.assert.calledWith(
            defaultProps.api.clinics.updateClinicPatient,
            'clinicID123',
            'patient1',
            {
              fullName: 'Patient 2',
              birthDate: '1999-02-02',
              mrn: 'MRN456',
              id: 'patient1',
              email: 'patient1@test.ca',
              permissions: { view: {} },
              tags: [],
              sites: [],
              diagnosisType: '',
              glycemicRanges: { type: 'preset', preset: 'adaStandard' },
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
            { type: 'FETCH_CLINIC_MRNS_FOR_PATIENT_FORM_VALIDATION_REQUEST' },
          ]);
        });
      });

      it('should open a modal for managing data connections when data connection menu option is clicked', async () => {
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites

        // Open the more menu to expose the data connections button
        const moreMenuIcon = rows[2].querySelector('[aria-label="info"]');
        expect(moreMenuIcon).to.exist;
        fireEvent.click(moreMenuIcon);
        await waitFor(() => expect(document.querySelector('#action-menu-patient2')).to.exist);

        const dataConnectionsButton = document.querySelector('button#edit-data-connections-patient2');
        expect(dataConnectionsButton).to.exist;

        expect(document.querySelector('#data-connections')).to.be.null;
        fireEvent.click(dataConnectionsButton);
        await waitFor(() => expect(document.querySelector('#data-connections')).to.exist);

        expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient data connections')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);
      });

      it('should remove a patient', async () => {
        const rows = container.querySelectorAll('table tr');
        expect(rows.length).to.equal(3); // header row + 2 invites

        // Open the more menu to expose the remove button
        const moreMenuIcon = rows[1].querySelector('[aria-label="info"]');
        expect(moreMenuIcon).to.exist;
        fireEvent.click(moreMenuIcon);
        await waitFor(() => expect(document.querySelector('#action-menu-patient1')).to.exist);

        const removeButton = document.querySelector('button#delete-patient1');
        expect(removeButton).to.exist;

        expect(document.querySelector('#deleteUser[aria-hidden="true"]')).to.exist;
        fireEvent.click(removeButton);
        await waitFor(() => expect(document.querySelector('#deleteUser:not([aria-hidden])')).to.exist);

        expect(defaultProps.trackMetric.calledWith('Clinic - Remove patient')).to.be.true;
        expect(defaultProps.trackMetric.callCount).to.equal(1);

        const confirmRemoveButton = document.querySelector('#deleteUser [id="patientRemoveConfirm"]');
        expect(confirmRemoveButton.textContent).to.equal('Remove');

        store.clearActions();

        fireEvent.click(confirmRemoveButton);
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

          mockUseFlags.mockReturnValue({
            showSummaryDashboard: false,
          });

          mountWrapper(store);

          defaultProps.trackMetric.resetHistory();
        });

        it('should show the standard table columns', () => {
          const columns = container.querySelectorAll('.MuiTableCell-head');
          expect(columns[0].textContent).to.equal('Patient Details');
          expect(columns[0].id).to.equal('peopleTable-header-fullName');

          expect(columns[1].textContent).to.equal('Birthday');
          expect(columns[1].id).to.equal('peopleTable-header-birthDate');

          expect(columns[2].textContent).to.equal('MRN');
          expect(columns[2].id).to.equal('peopleTable-header-mrn');
        });

        it('should refetch patients with updated sort parameter when name or birthday headers are clicked', () => {
          const patientHeader = container.querySelector('#peopleTable-header-fullName .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          fireEvent.click(patientHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-fullName' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          fireEvent.click(patientHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+fullName' }));

          const birthdayHeader = container.querySelector('#peopleTable-header-birthDate .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          fireEvent.click(birthdayHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+birthDate' }));

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          fireEvent.click(birthdayHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-birthDate' }));
        });

        context('showSummaryDashboard flag is true', () => {
          it('should show the summary dashboard instead of the standard patient table', () => {
            mockUseFlags.mockReturnValue({
              showSummaryDashboard: true,
            });

            mountWrapper(store);

            expect(container.querySelector('#summary-dashboard-filters')).to.exist;
          });
        });

        context('patient limit is reached', () => {
          let addButton;

          beforeEach(() => {
            store = mockStore({
              blip: {
                ...tier0100ClinicState.blip,
                clinics: {
                  clinicID123: {
                    ...tier0100ClinicState.blip.clinics.clinicID123,
                    patientLimitEnforced: true,
                    ui: {
                      warnings: {
                        limitReached: 'yep',
                      },
                    },
                  },
                },
              },
            });

            mockUseFlags.mockReturnValue({
              showSummaryDashboard: false,
            });

            mountWrapper(store);

            defaultProps.trackMetric.resetHistory();

            addButton = container.querySelector('button#add-patient');
            expect(addButton.textContent).to.equal('Add New Patient');
          });

          it('should disable the add patient button', () => {
            expect(addButton.disabled).to.be.true;
          });

          it('should show a popover with a link to the plans url if add patient button hovered', () => {
            fireEvent.mouseEnter(addButton);

            const popover = document.querySelector('#limitReachedPopover');
            expect(popover).to.exist;

            const link = document.querySelector('#addPatientUnlockPlansLink');
            expect(link).to.exist;
            expect(link.href).to.equal(URL_TIDEPOOL_PLUS_PLANS);
          });
        });
      });

      context('tier0300 clinic', () => {
        beforeEach(() => {
          store = mockStore(tier0300ClinicState);
          mountWrapper(store);
          defaultProps.trackMetric.resetHistory();
        });

        it('should show and format patient data appropriately based on availablity', () => {
          const emptyStatText = '--';

          const columns = container.querySelectorAll('.MuiTableCell-head');
          expect(columns[0].textContent).to.equal('Patient Details');
          expect(columns[0].id).to.equal('peopleTable-header-fullName');

          expect(columns[1].textContent).to.equal('Data Recency');
          expect(columns[1].id).to.equal('peopleTable-header-cgm-lastData');

          expect(columns[2].textContent).to.equal('Patient Tags');
          expect(columns[2].id).to.equal('peopleTable-header-tags');

          expect(columns[3].textContent).to.equal('CGM');
          expect(columns[3].id).to.equal('peopleTable-header-cgmTag');

          expect(columns[4].textContent).to.equal('GMI');
          expect(columns[4].id).to.equal('peopleTable-header-cgm-glucoseManagementIndicator');

          expect(columns[5].textContent).to.equal('% Time in Range');
          expect(columns[5].id).to.equal('peopleTable-header-bgRangeSummary');

          expect(columns[7].textContent).to.equal('BGM');
          expect(columns[7].id).to.equal('peopleTable-header-bgmTag');

          expect(columns[8].textContent).to.equal('Avg. Glucose (mg/dL)');
          expect(columns[8].id).to.equal('peopleTable-header-bgm-averageGlucoseMmol');

          expect(columns[9].textContent).to.equal('Lows');
          expect(columns[9].id).to.equal('peopleTable-header-bgm-timeInVeryLowRecords');

          expect(columns[10].textContent).to.equal('Highs');
          expect(columns[10].id).to.equal('peopleTable-header-bgm-timeInVeryHighRecords');

          const dataRows = container.querySelectorAll('table tbody tr');
          expect(dataRows.length).to.equal(5);

          const getCells = row => dataRows[row].querySelectorAll('.MuiTableCell-root');

          // Patient name, dob, and mrn in first column
          expect(getCells(0)[0].textContent).includes('Patient One');
          expect(getCells(0)[0].textContent).includes('1999-01-01');
          expect(getCells(0)[0].textContent).includes('MRN012');

          // Last upload date in second column
          expect(getCells(0)[1].textContent).includes(emptyStatText);
          expect(getCells(1)[1].textContent).includes('CGM: Today');
          expect(getCells(1)[1].textContent).includes('BGM: Yesterday');
          expect(getCells(2)[1].textContent).includes('CGM: Yesterday');
          expect(getCells(3)[1].textContent).includes('CGM: 30 days ago');
          expect(getCells(4)[1].textContent.slice(-10)).to.match(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/);

          // Patient tags in third column
          expect(getCells(0)[2].textContent).includes('Add');
          expect(getCells(1)[2].textContent).includes('>test tag 1');
          expect(getCells(2)[2].textContent).includes(['>test tag 1', '+2'].join(''));

          // GMI in fifth column
          expect(getCells(0)[4].textContent).includes(emptyStatText);
          expect(getCells(1)[4].textContent).includes(emptyStatText);
          expect(getCells(2)[4].textContent).includes('6.5 %');
          expect(getCells(3)[4].textContent).includes(emptyStatText);

          // Ensure tags hidden by overflow are visible on hover
          const tagOverflowTrigger = getCells(2)[2].querySelector('.tag-overflow-trigger');
          expect(tagOverflowTrigger).to.exist;

          const popover = document.querySelector('#tags-overflow-patient3');
          expect(popover).to.exist;
          expect(popover.style.visibility).to.equal('hidden');

          fireEvent.mouseOver(tagOverflowTrigger);
          expect(popover.style.visibility).to.equal('');

          const overflowTags = popover.querySelectorAll('.tag-text');
          expect(overflowTags.length).to.equal(2);
          expect(overflowTags[0].textContent).to.equal('test tag 2');
          expect(overflowTags[1].textContent).to.equal('ttest tag 3');

          // BG summary in sixth column
          expect(getCells(0)[5].textContent).to.not.contain('CGM Use <24 hours');
          expect(getCells(1)[5].textContent).includes('CGM Use <24 hours');

          expect(getCells(2)[5].querySelector('.range-summary-bars')).to.exist;
          expect(getCells(2)[5].querySelector('.range-summary-stripe-overlay')).to.be.null;

          expect(getCells(3)[5].querySelector('.range-summary-bars')).to.exist;
          expect(getCells(3)[5].querySelector('.range-summary-stripe-overlay')).to.exist;

          // Average glucose and readings/day in ninth column
          expect(getCells(0)[8].textContent).includes('');
          expect(getCells(1)[8].textContent).includes('189');
          expect(getCells(1)[8].textContent).includes('<1 reading/day');
          expect(getCells(2)[8].textContent).includes('207');
          expect(getCells(2)[8].textContent).includes('1 reading/day');
          expect(getCells(3)[8].textContent).includes('225');
          expect(getCells(3)[8].textContent).includes('2 readings/day');

          // Low events in tenth column
          expect(getCells(0)[9].textContent).includes('');
          expect(getCells(1)[9].textContent).includes('1');
          expect(getCells(2)[9].textContent).includes('3');
          expect(getCells(3)[9].textContent).includes('0');

          // High events in eleventh column
          expect(getCells(0)[10].textContent).includes('');
          expect(getCells(1)[10].textContent).includes('2');
          expect(getCells(2)[10].textContent).includes('4');
          expect(getCells(3)[10].textContent).includes('0');
        });

        it('should refetch patients with updated sort parameter when sortable column headers are clicked', () => {
          const patientHeader = container.querySelector('#peopleTable-header-fullName .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(patientHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+fullName' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Patient details sort ascending', { clinicId: 'clinicID123' });

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(patientHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-fullName' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Patient details sort descending', { clinicId: 'clinicID123' });

          const lastDataDateHeader = container.querySelector('#peopleTable-header-cgm-lastData .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(lastDataDateHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-lastData', sortType: 'cgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Data recency sort descending', { clinicId: 'clinicID123' });

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(lastDataDateHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+lastData', sortType: 'cgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Data recency sort ascending', { clinicId: 'clinicID123' });

          const gmiHeader = container.querySelector('#peopleTable-header-cgm-glucoseManagementIndicator .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(gmiHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-glucoseManagementIndicator', sortType: 'cgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - GMI sort descending', { clinicId: 'clinicID123' });

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(gmiHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+glucoseManagementIndicator', sortType: 'cgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - GMI sort ascending', { clinicId: 'clinicID123' });

          const averageGlucoseHeader = container.querySelector('#peopleTable-header-bgm-averageGlucoseMmol .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(averageGlucoseHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-averageGlucoseMmol', sortType: 'bgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Average glucose sort descending', { clinicId: 'clinicID123' });

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(averageGlucoseHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+averageGlucoseMmol', sortType: 'bgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Average glucose sort ascending', { clinicId: 'clinicID123' });

          const lowsHeader = container.querySelector('#peopleTable-header-bgm-timeInVeryLowRecords .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(lowsHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-timeInVeryLowRecords', sortType: 'bgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Time in very low sort descending', { clinicId: 'clinicID123' });

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(lowsHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+timeInVeryLowRecords', sortType: 'bgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Time in very low sort ascending', { clinicId: 'clinicID123' });

          const highsHeader = container.querySelector('#peopleTable-header-bgm-timeInVeryHighRecords .MuiTableSortLabel-root');

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(highsHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-timeInVeryHighRecords', sortType: 'bgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Time in very high sort descending', { clinicId: 'clinicID123' });

          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          defaultProps.trackMetric.resetHistory();
          fireEvent.click(highsHeader);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+timeInVeryHighRecords', sortType: 'bgm' }));
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Time in very high sort ascending', { clinicId: 'clinicID123' });
        });

        it('should allow refreshing the patient list and maintain', () => {
          const refreshButton = container.querySelector('#refresh-patients');
          expect(refreshButton).to.exist;
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          fireEvent.click(refreshButton);
          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ ...defaultFetchOptions, sort: '-lastData' }));
        });

        it('should show the time since the last patient data fetch', () => {
          const timeAgoMessage = container.querySelector('#last-refresh-time-ago').textContent;
          expect(timeAgoMessage).to.equal('Last updated less than an hour ago');
        });

        it('should allow filtering by last upload', () => {
          const lastDataFilterTrigger = container.querySelector('#last-data-filter-trigger');
          expect(lastDataFilterTrigger).to.exist;

          const popover = () => document.querySelector('#lastDataFilters');
          expect(popover()).to.exist;
          expect(popover().style.visibility).to.equal('hidden');

          // Open filters popover
          fireEvent.click(lastDataFilterTrigger);
          expect(popover().style.visibility).to.equal('');

          // Ensure filter options present
          const typeFilterOptions = document.querySelectorAll('#last-upload-type label');
          expect(typeFilterOptions.length).to.equal(2);
          expect(typeFilterOptions[0].textContent).to.equal('CGM');
          expect(typeFilterOptions[0].querySelector('input').value).to.equal('cgm');

          expect(typeFilterOptions[1].textContent).to.equal('BGM');
          expect(typeFilterOptions[1].querySelector('input').value).to.equal('bgm');

          // Ensure period filter options present
          const periodFilterOptions = document.querySelectorAll('#last-upload-filters label');
          expect(periodFilterOptions.length).to.equal(4);
          expect(periodFilterOptions[0].textContent).to.equal('Today');
          expect(periodFilterOptions[0].querySelector('input').value).to.equal('1');

          expect(periodFilterOptions[1].textContent).to.equal('Within 2 days');
          expect(periodFilterOptions[1].querySelector('input').value).to.equal('2');

          expect(periodFilterOptions[2].textContent).to.equal('Within 14 days');
          expect(periodFilterOptions[2].querySelector('input').value).to.equal('14');

          expect(periodFilterOptions[3].textContent).to.equal('Within 30 days');
          expect(periodFilterOptions[3].querySelector('input').value).to.equal('30');

          // Apply button disabled until selection made
          const applyButton = () => document.querySelector('#apply-last-upload-filter');
          expect(applyButton().disabled).to.be.true;

          fireEvent.click(typeFilterOptions[1].querySelector('input'));
          fireEvent.click(periodFilterOptions[3].querySelector('input'));
          expect(applyButton().disabled).to.be.false;

          fireEvent.click(applyButton());
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Last upload apply filter', sinon.match({ clinicId: 'clinicID123', dateRange: '30 days', type: 'bgm'}));
        });

        it('should allow filtering by cgm use', () => {
          const cgmUseFilterTrigger = container.querySelector('#cgm-use-filter-trigger');
          expect(cgmUseFilterTrigger).to.exist;

          const popover = () => document.querySelector('#cgmUseFilters');
          expect(popover()).to.exist;
          expect(popover().style.visibility).to.equal('hidden');

          // Open filters popover
          fireEvent.click(cgmUseFilterTrigger);
          expect(popover().style.visibility).to.equal('');

          // Ensure filter options present
          const cgmUseFilterOptions = document.querySelectorAll('#cgm-use label');
          expect(cgmUseFilterOptions.length).to.equal(2);
          expect(cgmUseFilterOptions[0].textContent).to.equal('Less than 70%');
          expect(cgmUseFilterOptions[0].querySelector('input').value).to.equal('<0.7');

          expect(cgmUseFilterOptions[1].textContent).to.equal('70% or more');
          expect(cgmUseFilterOptions[1].querySelector('input').value).to.equal('>=0.7');

          // Apply button disabled until selection made
          const applyButton = () => document.querySelector('#apply-cgm-use-filter');
          expect(applyButton().disabled).to.be.true;

          fireEvent.click(cgmUseFilterOptions[0].querySelector('input'));
          expect(applyButton().disabled).to.be.false;

          fireEvent.click(applyButton());
          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - CGM use apply filter', sinon.match({ clinicId: 'clinicID123', filter: '<0.7' }));
        });

        it('should allow filtering by bg range targets that DO NOT meet selected criteria', async () => {
          // Set up stateful filter mock to allow DOM verification after applying filters
          let currentFilters = { timeInRange: [], patientTags: [], meetsGlycemicTargets: true };
          const applyFiltersMock = (newFilters) => {
            currentFilters = typeof newFilters === 'function' ? newFilters(currentFilters) : newFilters;
            mockUseClinicPatientsFilters.mockImplementation(() => [currentFilters, applyFiltersMock]);
          };
          mockUseClinicPatientsFilters.mockImplementation(() => [currentFilters, applyFiltersMock]);
          mountWrapper(store);
          defaultProps.trackMetric.resetHistory();

          const timeInRangeFilterTrigger = container.querySelector('#time-in-range-filter-trigger');
          expect(timeInRangeFilterTrigger).to.exist;
          expect(timeInRangeFilterTrigger.textContent).to.equal('% Time in Range');

          const timeInRangeFilterCount = () => container.querySelector('#time-in-range-filter-count');
          expect(timeInRangeFilterCount()).to.be.null;

          const popover = () => document.querySelector('#timeInRangeFilters');
          expect(popover()).to.exist;
          expect(popover().style.visibility).to.equal('hidden');

          // Open filters popover
          fireEvent.click(timeInRangeFilterTrigger);
          expect(popover().style.visibility).to.equal('');

          // Ensure filter options present and in default unchecked state
          const veryLowFilter = () => document.querySelector('#time-in-range-filter-veryLow');
          expect(veryLowFilter()).to.exist;
          expect(veryLowFilter().textContent).to.contain('Greater than 1% Time');
          expect(veryLowFilter().textContent).to.contain('<54 mg/dL');
          expect(veryLowFilter().querySelector('input').checked).to.be.false;

          const lowFilter = () => document.querySelector('#time-in-range-filter-anyLow');
          expect(lowFilter()).to.exist;
          expect(lowFilter().textContent).to.contain('Greater than 4% Time');
          expect(lowFilter().textContent).to.contain('<70 mg/dL');
          expect(lowFilter().querySelector('input').checked).to.be.false;

          const targetFilter = () => document.querySelector('#time-in-range-filter-target');
          expect(targetFilter()).to.exist;
          expect(targetFilter().textContent).to.contain('Less than 70% Time');
          expect(targetFilter().textContent).to.contain('between 70-180 mg/dL');
          expect(targetFilter().querySelector('input').checked).to.be.false;

          const highFilter = () => document.querySelector('#time-in-range-filter-anyHigh');
          expect(highFilter()).to.exist;
          expect(highFilter().textContent).to.contain('Greater than 25% Time');
          expect(highFilter().textContent).to.contain('>180 mg/dL');
          expect(highFilter().querySelector('input').checked).to.be.false;

          const veryHighFilter = () => document.querySelector('#time-in-range-filter-veryHigh');
          expect(veryHighFilter()).to.exist;
          expect(veryHighFilter().textContent).to.contain('Greater than 5% Time');
          expect(veryHighFilter().textContent).to.contain('>250 mg/dL');
          expect(veryHighFilter().querySelector('input').checked).to.be.false;

          // Select all filter ranges
          fireEvent.click(veryLowFilter().querySelector('input'));
          expect(veryLowFilter().querySelector('input').checked).to.be.true;

          fireEvent.click(lowFilter().querySelector('input'));
          expect(lowFilter().querySelector('input').checked).to.be.true;

          fireEvent.click(targetFilter().querySelector('input'));
          expect(targetFilter().querySelector('input').checked).to.be.true;

          fireEvent.click(highFilter().querySelector('input'));
          expect(highFilter().querySelector('input').checked).to.be.true;

          fireEvent.click(veryHighFilter().querySelector('input'));
          expect(veryHighFilter().querySelector('input').checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          const applyButton = document.querySelector('#timeInRangeFilterConfirm');
          fireEvent.click(applyButton);

          sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({
            ...defaultFetchOptions,
            sort: '-lastData',
            'cgm.timeInAnyHighPercent': '>=0.25',
            'cgm.timeInAnyLowPercent': '>=0.04',
            'cgm.timeInTargetPercent': '<=0.7',
            'cgm.timeInVeryHighPercent': '>=0.05',
            'cgm.timeInVeryLowPercent': '>=0.01',
            omitNonStandardRanges: true,
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

          await waitFor(() => {
            expect(timeInRangeFilterCount()).to.exist;
            expect(timeInRangeFilterCount().textContent).to.equal('5');
          });
        });

        context('summary period filtering', () => {
          let mockedLocalStorage;

          beforeEach(() => {
            mockedLocalStorage = {
              'activePatientFilters/clinicianUserId123/clinicID123': {
                timeInRange: [
                    'timeInAnyLowPercent',
                    'timeInAnyHighPercent'
                ],
                patientTags: [],
                meetsGlycemicTargets: false,
              },
              activePatientSummaryPeriod: '14d',
            };

            mockUseLocalStorage.mockImplementation(key => {
              defaults(mockedLocalStorage, { [key]: {} })
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            });

            mockUseClinicPatientsFilters.mockImplementation(() => (
              [
                {
                  timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                  patientTags: [],
                  meetsGlycemicTargets: false,
                },
                sinon.stub(),
              ]
            ));

            mountWrapper(store);
          });

          it('should show the Filter Reset Bar', () => {
            const filterResetBar = container.querySelector('.filter-reset-bar');
            expect(filterResetBar).to.exist;
          });

          it('should allow filtering by summary period', () => {
            const summaryPeriodFilterTrigger = container.querySelector('#summary-period-filter-trigger');
            expect(summaryPeriodFilterTrigger).to.exist;

            const popover = () => document.querySelector('#summaryPeriodFilters');
            expect(popover()).to.exist;
            expect(popover().style.visibility).to.equal('hidden');

            // Open filters popover
            fireEvent.click(summaryPeriodFilterTrigger);
            expect(popover().style.visibility).to.equal('');

            // Ensure filter options present
            const filterOptions = document.querySelectorAll('#summary-period-filters label');
            expect(filterOptions.length).to.equal(4);
            expect(filterOptions[0].textContent).to.equal('24 hours');
            expect(filterOptions[0].querySelector('input').value).to.equal('1d');

            expect(filterOptions[1].textContent).to.equal('7 days');
            expect(filterOptions[1].querySelector('input').value).to.equal('7d');

            expect(filterOptions[2].textContent).to.equal('14 days');
            expect(filterOptions[2].querySelector('input').value).to.equal('14d');

            expect(filterOptions[3].textContent).to.equal('30 days');
            expect(filterOptions[3].querySelector('input').value).to.equal('30d');

            // Default should be 14 days
            expect(filterOptions[2].querySelector('input').checked).to.be.true;

            // Set to 7 days
            fireEvent.click(filterOptions[1].querySelector('input'));

            defaultProps.api.clinics.getPatientsForClinic.resetHistory();
            const applyButton = document.querySelector('#apply-summary-period-filter');
            fireEvent.click(applyButton);

            // Ensure resulting patient fetch is requesting the 7 day period for time in range filters
            sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({
              ...defaultFetchOptions,
              sort: '-lastData',
              period: '7d',
              'cgm.timeInAnyHighPercent': '>0.25',
              'cgm.timeInAnyLowPercent': '>0.04',
            }));

            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Summary period apply filter', sinon.match({ clinicId: 'clinicID123', summaryPeriod: '7d' }));
          });

          it('should not show the GMI if selected period is less than 14 days', () => {
            const emptyStatText = '--';
            const summaryPeriodFilterTrigger = container.querySelector('#summary-period-filter-trigger');
            expect(summaryPeriodFilterTrigger).to.exist;

            const popover = () => document.querySelector('#summaryPeriodFilters');
            expect(popover()).to.exist;
            expect(popover().style.visibility).to.equal('hidden');

            const applyButton = () => document.querySelector('#apply-summary-period-filter');

            // Open filters popover
            fireEvent.click(summaryPeriodFilterTrigger);
            expect(popover().style.visibility).to.equal('');

            // Ensure filter options present
            const filterOptions = () => document.querySelectorAll('#summary-period-filters label');

            // Default should be 14 days
            expect(filterOptions()[2].querySelector('input').checked).to.be.true;

            const dataRows = container.querySelectorAll('table tbody tr');
            expect(dataRows.length).to.equal(5);

            const rowData = row => container.querySelectorAll('table tbody tr')[row].querySelectorAll('.MuiTableCell-root');

            expect(rowData(2)[4].textContent).to.contain('6.5 %'); // shows for 14 days

            // Open filters popover and set to 30 days
            fireEvent.click(summaryPeriodFilterTrigger);
            fireEvent.click(filterOptions()[3].querySelector('input'));
            expect(filterOptions()[3].querySelector('input').checked).to.be.true;
            fireEvent.click(applyButton());
            expect(rowData(2)[4].textContent).to.contain('7.5 %'); // shows for 30 days

            // Open filters popover and set to 7 days
            fireEvent.click(summaryPeriodFilterTrigger);
            fireEvent.click(filterOptions()[1].querySelector('input'));
            expect(filterOptions()[1].querySelector('input').checked).to.be.true;
            fireEvent.click(applyButton());
            expect(rowData(2)[4].textContent).to.contain(emptyStatText); // hidden for 7 days

            // Open filters popover and set to 1 day
            fireEvent.click(summaryPeriodFilterTrigger);
            fireEvent.click(filterOptions()[0].querySelector('input'));
            expect(filterOptions()[0].querySelector('input').checked).to.be.true;
            fireEvent.click(applyButton());
            expect(rowData(2)[4].textContent).to.contain(emptyStatText); // hidden for 1 day
          });
        });

        context('persisted filter state', () => {
          let mockedLocalStorage;

          beforeEach(() => {
            store = mockStore(tier0300ClinicState);

            mockedLocalStorage = {
              'activePatientFilters/clinicianUserId123/clinicID123': {
                lastData: 14,
                timeInRange: [
                    'timeInAnyLowPercent',
                    'timeInAnyHighPercent'
                ],
                patientTags: ['tag2'],
                meetsGlycemicTargets: true,
              },
              activePatientSummaryPeriod: '14d',
            };

            mockUseLocalStorage.mockImplementation(key => {
              defaults(mockedLocalStorage, { [key]: {} })
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            });

            mockUseClinicPatientsFilters.mockImplementation(() => (
              [
                {
                  lastData: 14,
                  timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                  patientTags: ['tag2'],
                  meetsGlycemicTargets: true,
                },
                sinon.stub(),
              ]
            ));

            mountWrapper(store);
            defaultProps.trackMetric.resetHistory();
          });

          it('should set the last upload filter on load based on the stored filters', () => {
            const lastDataFilterTrigger = container.querySelector('#last-data-filter-trigger');
            expect(lastDataFilterTrigger.textContent).to.equal('Data within 14 days');
          });

          it('should set the patient tag filters on load based on the stored filters', () => {
            const patientTagsFilterCount = container.querySelector('#patient-tags-filter-count');
            expect(patientTagsFilterCount.textContent).to.equal('1');

            const patientTagsFilterTrigger = container.querySelector('#patient-tags-filter-trigger');
            expect(patientTagsFilterTrigger).to.exist;

            const popover = () => document.querySelector('#patientTagFilters');
            expect(popover()).to.exist;
            expect(popover().style.visibility).to.equal('hidden');

            // Open filters popover
            fireEvent.click(patientTagsFilterTrigger);
            expect(popover().style.visibility).to.equal('');

            // Ensure selected filter is set
            const tag1Filter = document.querySelector('#tag-filter-option-checkbox-tag1');
            const tag2Filter = document.querySelector('#tag-filter-option-checkbox-tag2');
            const tag3Filter = document.querySelector('#tag-filter-option-checkbox-tag3');
            expect(tag1Filter.checked).to.be.false;
            expect(tag2Filter.checked).to.be.true;
            expect(tag3Filter.checked).to.be.false;
          });

          it('should set the time in range filters on load based on the stored filters', () => {
            const timeInRangeFilterTrigger = container.querySelector('#time-in-range-filter-trigger');

            // Should show 2 active time in range filters
            const timeInRangeFilterCount = () => container.querySelector('#time-in-range-filter-count');
            expect(timeInRangeFilterCount()).to.exist;
            expect(timeInRangeFilterCount().textContent).to.equal('2');

            // Open time in range filters dialog
            fireEvent.click(timeInRangeFilterTrigger);

            const popover = () => document.querySelector('#timeInRangeFilters');
            expect(popover()).to.exist;

            // Ensure filter options in pre-set state
            const veryLowFilter = () => document.querySelector('#time-in-range-filter-veryLow');
            expect(veryLowFilter().querySelector('input').checked).to.be.false;

            const lowFilter = () => document.querySelector('#time-in-range-filter-anyLow');
            expect(lowFilter().querySelector('input').checked).to.be.true;

            const targetFilter = () => document.querySelector('#time-in-range-filter-target');
            expect(targetFilter().querySelector('input').checked).to.be.false;

            const highFilter = () => document.querySelector('#time-in-range-filter-anyHigh');
            expect(highFilter().querySelector('input').checked).to.be.true;

            const veryHighFilter = () => document.querySelector('#time-in-range-filter-veryHigh');
            expect(veryHighFilter().querySelector('input').checked).to.be.false;
          });

          it('should fetch the initial patient based on the stored filters', () => {
            sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({
              ...defaultFetchOptions,
              sort: '-lastData',
              'cgm.timeInAnyHighPercent': '>=0.25',
              'cgm.timeInAnyLowPercent': '>=0.04',
              tags: sinon.match.array,
            }));
          });
        });

        context('persisted sort state', () => {
          let mockedLocalStorage;

          beforeEach(() => {
            store = mockStore(tier0300ClinicState);

            mockedLocalStorage = {
              'activePatientFilters/clinicianUserId123/clinicID123': {
                timeInRange: [
                    'timeInAnyLowPercent',
                    'timeInAnyHighPercent'
                ],
                patientTags: [],
                meetsGlycemicTargets: false,
              },
              activePatientSummaryPeriod: '14d',
              activePatientSort: {
                sort: '-averageGlucoseMmol',
                sortType: 'bgm',
              },
            };

            mockUseLocalStorage.mockImplementation(key => {
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            });

            mockUseClinicPatientsFilters.mockImplementation(() => (
              [
                {
                  timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                  patientTags: [],
                  meetsGlycemicTargets: false,
                },
                sinon.stub(),
              ]
            ));

            mountWrapper(store);
            defaultProps.trackMetric.resetHistory();
          });

          it('should set the table sort UI based on the the sort params from localStorage', () => {
            const activeSortLabel = container.querySelector('.MuiTableSortLabel-active');
            expect(activeSortLabel.textContent).to.equal('Avg. Glucose (mg/dL)');
            expect(activeSortLabel.querySelector('.MuiTableSortLabel-iconDirectionDesc')).to.exist;
          });


          it('should use the stored sort parameters when fetching the initial patient list', () => {
            sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({
              ...defaultFetchOptions,
              sort: '-averageGlucoseMmol',
              sortType: 'bgm',
            }));
          });
        });

        context('mmol/L preferredBgUnits', () => {
          beforeEach(() => {
            store = mockStore(tier0300ClinicStateMmoll);
            mountWrapper(store);
            defaultProps.trackMetric.resetHistory();
          });

          it('should show the bgm average glucose in mmol/L units', () => {
            const columns = container.querySelectorAll('.MuiTableCell-head');
            expect(columns[8].textContent).to.equal('Avg. Glucose (mmol/L)');
            expect(columns[8].id).to.equal('peopleTable-header-bgm-averageGlucoseMmol');

            const dataRows = container.querySelectorAll('table tbody tr');
            expect(dataRows.length).to.equal(5);

            const rowData = row => dataRows[row].querySelectorAll('.MuiTableCell-root');

            expect(rowData(1)[8].textContent).to.contain('10.5');
            expect(rowData(2)[8].textContent).to.contain('11.5');
            expect(rowData(3)[8].textContent).to.contain('12.5');
          });

          it('should show the bg range filters in mmol/L units', () => {
            const timeInRangeFilterTrigger = container.querySelector('#time-in-range-filter-trigger');

            const popover = () => document.querySelector('#timeInRangeFilters');

            // Open filters popover
            fireEvent.click(timeInRangeFilterTrigger);

            // Ensure filter options present and in default unchecked state
            const veryLowFilter = () => document.querySelector('#time-in-range-filter-veryLow');
            expect(veryLowFilter()).to.exist;
            expect(veryLowFilter().textContent).to.contain('Greater than 1% Time');
            expect(veryLowFilter().textContent).to.contain('<3.0 mmol/L');
            expect(veryLowFilter().querySelector('input').checked).to.be.false;

            const lowFilter = () => document.querySelector('#time-in-range-filter-anyLow');
            expect(lowFilter()).to.exist;
            expect(lowFilter().textContent).to.contain('Greater than 4% Time');
            expect(lowFilter().textContent).to.contain('<3.9 mmol/L');
            expect(lowFilter().querySelector('input').checked).to.be.false;

            const targetFilter = () => document.querySelector('#time-in-range-filter-target');
            expect(targetFilter()).to.exist;
            expect(targetFilter().textContent).to.contain('Less than 70% Time');
            expect(targetFilter().textContent).to.contain('between 3.9-10.0 mmol/L');
            expect(targetFilter().querySelector('input').checked).to.be.false;

            const highFilter = () => document.querySelector('#time-in-range-filter-anyHigh');
            expect(highFilter()).to.exist;
            expect(highFilter().textContent).to.contain('Greater than 25% Time');
            expect(highFilter().textContent).to.contain('>10.0 mmol/L');
            expect(highFilter().querySelector('input').checked).to.be.false;

            const veryHighFilter = () => document.querySelector('#time-in-range-filter-veryHigh');
            expect(veryHighFilter()).to.exist;
            expect(veryHighFilter().textContent).to.contain('Greater than 5% Time');
            expect(veryHighFilter().textContent).to.contain('>13.9 mmol/L');
            expect(veryHighFilter().querySelector('input').checked).to.be.false;
          });
        });

        it('should track how many filters are active', async () => {
          // Set up stateful filter mock to allow DOM verification after applying filters
          let currentFilters = { timeInRange: [], patientTags: [], meetsGlycemicTargets: false };
          const applyFiltersMock = (newFilters) => {
            currentFilters = typeof newFilters === 'function' ? newFilters(currentFilters) : newFilters;
            mockUseClinicPatientsFilters.mockImplementation(() => [currentFilters, applyFiltersMock]);
          };
          mockUseClinicPatientsFilters.mockImplementation(() => [currentFilters, applyFiltersMock]);
          mountWrapper(store);
          defaultProps.trackMetric.resetHistory();

          const filterCount = () => container.querySelector('#filter-count');
          expect(filterCount()).to.be.null;

          const timeInRangeFilterCount = () => container.querySelector('#time-in-range-filter-count');
          expect(timeInRangeFilterCount()).to.be.null;

          // Set lastData filter
          const lastDataFilterTrigger = container.querySelector('#last-data-filter-trigger');
          expect(lastDataFilterTrigger).to.exist;

          fireEvent.click(lastDataFilterTrigger);

          const typeFilterOptions = document.querySelectorAll('#last-upload-type label');
          expect(typeFilterOptions.length).to.equal(2);

          const periodFilterOptions = document.querySelectorAll('#last-upload-filters label');
          expect(periodFilterOptions.length).to.equal(4);

          fireEvent.click(typeFilterOptions[0].querySelector('input'));
          fireEvent.click(periodFilterOptions[3].querySelector('input'));
          fireEvent.click(document.querySelector('#apply-last-upload-filter'));

          // Filter count should be 1 after natural re-render from popover close
          await waitFor(() => {
            expect(filterCount()).to.exist;
          });
          expect(filterCount().textContent).to.equal('1');

          // Set time in range filter
          const timeInRangeFilterTrigger = container.querySelector('#time-in-range-filter-trigger');
          expect(timeInRangeFilterTrigger).to.exist;

          fireEvent.click(timeInRangeFilterTrigger);

          // Select 3 filter ranges
          const veryLowFilter = () => document.querySelector('#time-in-range-filter-veryLow');
          fireEvent.click(veryLowFilter().querySelector('input'));
          expect(veryLowFilter().querySelector('input').checked).to.be.true;

          const lowFilter = () => document.querySelector('#time-in-range-filter-anyLow');
          fireEvent.click(lowFilter().querySelector('input'));
          expect(lowFilter().querySelector('input').checked).to.be.true;

          const highFilter = () => document.querySelector('#time-in-range-filter-anyHigh');
          fireEvent.click(highFilter().querySelector('input'));
          expect(highFilter().querySelector('input').checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          fireEvent.click(document.querySelector('#timeInRangeFilterConfirm'));

          // Filter count should be 2 after natural re-render from popover close
          await waitFor(() => {
            expect(filterCount()?.textContent).to.equal('2');
            expect(timeInRangeFilterCount()).to.exist;
            expect(timeInRangeFilterCount().textContent).to.equal('3');
          });

          // Unset last upload filter
          fireEvent.click(lastDataFilterTrigger);
          fireEvent.click(document.querySelector('#clear-last-upload-filter'));

          // Filter count should be 1
          await waitFor(() => {
            expect(filterCount()?.textContent).to.equal('1');
            expect(timeInRangeFilterCount()).to.exist;
            expect(timeInRangeFilterCount().textContent).to.equal('3');
          });

          // Unset time in range filter
          fireEvent.click(timeInRangeFilterTrigger);
          fireEvent.click(document.querySelector('#timeInRangeFilterClear'));

          // Total filter count and time in range filter count should be unset
          await waitFor(() => {
            expect(filterCount()).to.be.null;
          });
          expect(timeInRangeFilterCount()).to.be.null;
        });

        it('should reset all active filters at once', async () => {
          // Set up stateful filter mock to allow DOM verification after applying filters
          let currentFilters = { timeInRange: [], patientTags: [], meetsGlycemicTargets: false };
          const applyFiltersMock = (newFilters) => {
            currentFilters = typeof newFilters === 'function' ? newFilters(currentFilters) : newFilters;
            mockUseClinicPatientsFilters.mockImplementation(() => [currentFilters, applyFiltersMock]);
          };
          mockUseClinicPatientsFilters.mockImplementation(() => [currentFilters, applyFiltersMock]);
          mountWrapper(store);
          defaultProps.trackMetric.resetHistory();

          const filterCount = () => container.querySelector('#filter-count');
          expect(filterCount()).to.be.null;

          const timeInRangeFilterCount = () => container.querySelector('#time-in-range-filter-count');
          expect(timeInRangeFilterCount()).to.be.null;

          const resetAllFiltersButton = () => container.querySelector('#reset-all-active-filters');
          expect(resetAllFiltersButton()).to.be.null;

          // Set lastData filter
          const lastDataFilterTrigger = container.querySelector('#last-data-filter-trigger');
          expect(lastDataFilterTrigger).to.exist;

          fireEvent.click(lastDataFilterTrigger);

          const typeFilterOptions = document.querySelectorAll('#last-upload-type label');
          expect(typeFilterOptions.length).to.equal(2);

          const periodFilterOptions = document.querySelectorAll('#last-upload-filters label');
          expect(periodFilterOptions.length).to.equal(4);

          fireEvent.click(typeFilterOptions[0].querySelector('input'));
          fireEvent.click(periodFilterOptions[3].querySelector('input'));
          fireEvent.click(document.querySelector('#apply-last-upload-filter'));

          // Filter count should be 1 after natural re-render from popover close
          await waitFor(() => {
            expect(filterCount()).to.exist;
          });
          expect(filterCount().textContent).to.equal('1');
          expect(resetAllFiltersButton()).to.exist;

          // Set time in range filter
          const timeInRangeFilterTrigger = container.querySelector('#time-in-range-filter-trigger');
          expect(timeInRangeFilterTrigger).to.exist;

          fireEvent.click(timeInRangeFilterTrigger);

          // Select 3 filter ranges
          const veryLowFilter = () => document.querySelector('#time-in-range-filter-veryLow');
          fireEvent.click(veryLowFilter().querySelector('input'));
          expect(veryLowFilter().querySelector('input').checked).to.be.true;

          const lowFilter = () => document.querySelector('#time-in-range-filter-anyLow');
          fireEvent.click(lowFilter().querySelector('input'));
          expect(lowFilter().querySelector('input').checked).to.be.true;

          const highFilter = () => document.querySelector('#time-in-range-filter-anyHigh');
          fireEvent.click(highFilter().querySelector('input'));
          expect(highFilter().querySelector('input').checked).to.be.true;

          // Submit the form
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          fireEvent.click(document.querySelector('#timeInRangeFilterConfirm'));

          // Filter count should be 2 after natural re-render from popover close
          await waitFor(() => {
            expect(filterCount()?.textContent).to.equal('2');
            expect(timeInRangeFilterCount()).to.exist;
            expect(timeInRangeFilterCount().textContent).to.equal('3');
          });
          expect(resetAllFiltersButton()).to.exist;

          fireEvent.click(resetAllFiltersButton());

          // Total filter count and time in range filter count should be unset
          await waitFor(() => {
            expect(filterCount()).to.be.null;
          });
          expect(timeInRangeFilterCount()).to.be.null;
          expect(resetAllFiltersButton()).to.be.null;
        });

        it('should clear pending filter edits when time in range filter dialog closed', () => {
          const filterCount = () => container.querySelector('#filter-count');
          expect(filterCount()).to.be.null;

          const timeInRangeFilterCount = () => container.querySelector('#time-in-range-filter-count');
          expect(timeInRangeFilterCount()).to.be.null;

          // Reset Filters button only shows when filters are active
          const resetAllFiltersButton = () => container.querySelector('#reset-all-active-filters');
          expect(resetAllFiltersButton()).to.be.null;

          // Open time in range popover
          const timeInRangeFilterTrigger = container.querySelector('#time-in-range-filter-trigger');
          expect(timeInRangeFilterTrigger).to.exist;

          fireEvent.click(timeInRangeFilterTrigger);

          // Select 3 filter ranges
          const veryLowFilter = () => document.querySelector('#time-in-range-filter-veryLow');
          fireEvent.click(veryLowFilter().querySelector('input'));
          expect(veryLowFilter().querySelector('input').checked).to.be.true;

          const lowFilter = () => document.querySelector('#time-in-range-filter-anyLow');
          fireEvent.click(lowFilter().querySelector('input'));
          expect(lowFilter().querySelector('input').checked).to.be.true;

          const highFilter = () => document.querySelector('#time-in-range-filter-anyHigh');
          fireEvent.click(highFilter().querySelector('input'));
          expect(highFilter().querySelector('input').checked).to.be.true;

          // Close popover without applying filter
          defaultProps.api.clinics.getPatientsForClinic.resetHistory();
          expect(document.querySelector('#timeInRangeFilters')).to.exist;
          const closeButton = document.querySelector('#timeInRangeFilters button[aria-label="close dialog"]');
          fireEvent.click(closeButton);

          // Re-open popover
          fireEvent.click(timeInRangeFilterTrigger);

          // Verify that options are not still checked
          expect(veryLowFilter().querySelector('input').checked).to.be.false;
          expect(lowFilter().querySelector('input').checked).to.be.false;
          expect(highFilter().querySelector('input').checked).to.be.false;

          // Total filter count and time in range filter count should be unset
          expect(filterCount()).to.be.null;
          expect(timeInRangeFilterCount()).to.be.null;
          expect(resetAllFiltersButton()).to.be.null;
        }, 30000);

        it('should send an upload reminder to a fully claimed patient account', async () => {
          const dataRows = container.querySelectorAll('table tbody tr');
          expect(dataRows.length).to.equal(5);

          // No reminder action for a custodial account - open patient1 menu and verify no send reminder option
          const patient1MenuIcon = dataRows[0].querySelector('[aria-label="info"]');
          fireEvent.click(patient1MenuIcon);
          await waitFor(() => expect(document.querySelector('#action-menu-patient1')).to.exist);
          expect(document.querySelector('button#send-upload-reminder-patient1')).to.be.null;
          // Close patient1 menu by clicking the trigger again
          fireEvent.click(patient1MenuIcon);

          // Fully claimed account - open patient2 menu
          const patient2MenuIcon = dataRows[1].querySelector('[aria-label="info"]');
          fireEvent.click(patient2MenuIcon);
          await waitFor(() => expect(document.querySelector('#action-menu-patient2')).to.exist);

          const patient2Reminder = document.querySelector('button#send-upload-reminder-patient2');
          expect(patient2Reminder).to.exist;

          const dialog = () => document.querySelector('#sendUploadReminderDialog');

          expect(dialog()).to.be.null;
          fireEvent.click(patient2Reminder);
          await waitFor(() => expect(dialog()).to.exist);

          sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Send upload reminder', { clinicId: 'clinicID123' });
          expect(defaultProps.trackMetric.callCount).to.equal(1);

          store.clearActions();
          fireEvent.click(document.querySelector('#sendUploadReminderDialog [id="resend-upload-reminder"]'));

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
            const dataRows = container.querySelectorAll('table tbody tr');
            const rowData = row => dataRows[row].querySelectorAll('.MuiTableCell-root');

            expect(rowData(0)[2].textContent).to.contain('Add'); // Add tag link when no tags avail
            const addTagsTrigger = dataRows[0].querySelector('#add-tags-to-patient-trigger');
            expect(addTagsTrigger).to.exist;

            const addTagsPopover = () => document.querySelector('#add-patient-tags-patient1');
            expect(addTagsPopover()).to.exist;
            expect(addTagsPopover().style.visibility).to.equal('hidden');

            // Open tags popover
            fireEvent.click(addTagsTrigger);
            expect(addTagsPopover().style.visibility).to.equal('');

            // No initial selected tags
            const selectedTags = () => addTagsPopover().querySelectorAll('.selected-tags .tag-text');
            expect(selectedTags().length).to.equal(0);

            // Ensure tag options present
            const availableTags = () => addTagsPopover().querySelectorAll('.available-tags .tag-text');
            expect(availableTags().length).to.equal(3);
            expect(availableTags()[0].textContent).to.equal('>test tag 1');
            expect(availableTags()[1].textContent).to.equal('test tag 2');
            expect(availableTags()[2].textContent).to.equal('ttest tag 3');

            // Apply button disabled until selection made
            const applyButton = () => addTagsPopover().querySelector('#apply-patient-tags-dialog');
            expect(applyButton().disabled).to.be.true;

            fireEvent.click(addTagsPopover().querySelector('#tag1'));
            fireEvent.click(addTagsPopover().querySelector('#tag2'));
            expect(applyButton().disabled).to.be.false;

            // Tags should now be moved to selected group
            expect(selectedTags().length).to.equal(2);
            expect(selectedTags()[0].textContent).to.equal('>test tag 1');
            expect(selectedTags()[1].textContent).to.equal('test tag 2');

            expect(availableTags().length).to.equal(1);
            expect(availableTags()[0].textContent).to.equal('ttest tag 3');

            defaultProps.api.clinics.getPatientsForClinic.resetHistory();
            fireEvent.click(applyButton());

            sinon.assert.calledWith(
              defaultProps.api.clinics.updateClinicPatient,
              'clinicID123',
              'patient1',
              {
                fullName: 'Patient One',
                birthDate: '1999-01-01',
                mrn: 'MRN012',
                id: 'patient1',
                email: 'patient1@test.ca',
                permissions: { custodian: {} },
                tags: ['tag1', 'tag2'],
                reviews: [
                  { clinicianId: 'clinicianUserId123', time: today },
                  { clinicianId: 'clinicianUserId123', time: yesterday },
                ],
                summary: {},
              }
            );

            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Population Health - Assign patient tag confirm', sinon.match({ clinicId: 'clinicID123' }));
          });

          it('Opens the Edit Patient modal when trying to add tags to patient not meeting MRN requirements', () => {
            const testStoreProperties = {
              blip: {
                ...tier0300ClinicState.blip,
                clinics: {
                  clinicID123: {
                    ...tier0300ClinicState.blip.clinics.clinicID123,
                    patientTags: [],
                    mrnSettings: {
                      required: true,
                    },
                  },
                },
              },
            };

            testStoreProperties.blip.clinics.clinicID123.patients.patient6 = {
              ...hasPatientsState.blip.clinics.clinicID123.patient1,
            };

            const testStore = mockStore(testStoreProperties);

            mountWrapper(testStore);

            const dataRows = container.querySelectorAll('table tbody tr');
            const rowData = row => dataRows[row].querySelectorAll('.MuiTableCell-root');

            // Patient 5 has an MRN, so the button will open the Add Tags dropdown
            fireEvent.click(dataRows[4].querySelector('#add-tags-to-patient-trigger'));
            expect(document.querySelector('#editPatient')).to.be.null;

            // Patient 6 has no MRN, so the button will instead open the Edit Patient Modal
            fireEvent.click(dataRows[5].querySelector('#add-tags-to-patient-trigger'));
            expect(document.querySelector('#editPatient')).to.exist;
          });
        });
      });

      describe('Accessing TIDE dashboard', () => {
        let mockedLocalStorage;

        context('showTideDashboard flag is true', () => {
          beforeEach(() => {
            store = mockStore(tier0300ClinicState);
            mockedLocalStorage = {};

            mockUseFlags.mockReturnValue({
              showTideDashboard: true,
            });

            mockUseLocalStorage.mockImplementation(key => {
              defaults(mockedLocalStorage, { [key]: {} })
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            });

            mockUseClinicPatientsFilters.mockImplementation(() => (
              [
                {},
                sinon.stub(),
              ]
            ));

            mockUseLocation.mockReturnValue({ pathname: '/clinic-workspace' });

            mountWrapper(store);
            defaultProps.trackMetric.resetHistory();
          });

          it('should render the TIDE Dashboard CTA', () => {
            const tideDashboardButton = container.querySelector('#open-tide-dashboard');
            expect(tideDashboardButton).to.exist;
            expect(tideDashboardButton.disabled).to.be.false;
          });

          it('should disable the TIDE Dashboard CTA if clinic has no patient tags defined', () => {
            store = mockStore({
              blip: {
                ...tier0300ClinicState.blip,
                clinics: {
                  clinicID123: {
                    ...tier0300ClinicState.blip.clinics.clinicID123,
                    patientTags: [],
                  },
                },
              },
            });
            mountWrapper(store);

            const tideDashboardButton = container.querySelector('#open-tide-dashboard');
            expect(tideDashboardButton).to.exist;
            expect(tideDashboardButton.disabled).to.be.true;
          });

          it('should not render the TIDE Dashboard CTA if clinic tier < tier0300', () => {
            store = mockStore(tier0100ClinicState);
            mountWrapper(store);

            const tideDashboardButton = container.querySelector('#open-tide-dashboard');
            expect(tideDashboardButton).to.be.null;
          });

          it('should open a modal to configure the dashboard, and redirect when configured', async () => {
            mountWrapper(store);
            defaultProps.trackMetric.resetHistory();

            const tideDashboardButton = container.querySelector('#open-tide-dashboard');
            const dialog = () => document.querySelector('#tideDashboardConfig');

            // Open dashboard config popover
            expect(dialog()).to.be.null;
            fireEvent.click(tideDashboardButton);
            await waitFor(() => expect(dialog()).to.exist);
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show Tide Dashboard config dialog', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

            const applyButton = () => document.querySelector('#configureTideDashboardConfirm');
            expect(applyButton().disabled).to.be.true;

            // Select tags via react-select: open the dropdown and click an option
            const selectControl = document.querySelector('#tideDashboardConfig .PatientFormSelectTags__control');
            expect(selectControl).to.exist;
            fireEvent.mouseDown(selectControl);
            await waitFor(() => expect(document.querySelector('.PatientFormSelectTags__menu')).to.exist);
            const tagOptions = document.querySelectorAll('.PatientFormSelectTags__option');
            expect(tagOptions.length).to.be.at.least(1);
            fireEvent.click(tagOptions[0]);

            // Ensure period filter options present
            const summaryPeriodOptions = document.querySelectorAll('#tideDashboardConfig #period label');
            expect(summaryPeriodOptions.length).to.equal(4);

            expect(summaryPeriodOptions[0].textContent).to.equal('24 hours');
            expect(summaryPeriodOptions[0].querySelector('input').value).to.equal('1d');

            expect(summaryPeriodOptions[1].textContent).to.equal('7 days');
            expect(summaryPeriodOptions[1].querySelector('input').value).to.equal('7d');

            expect(summaryPeriodOptions[2].textContent).to.equal('14 days');
            expect(summaryPeriodOptions[2].querySelector('input').value).to.equal('14d');

            expect(summaryPeriodOptions[3].textContent).to.equal('30 days');
            expect(summaryPeriodOptions[3].querySelector('input').value).to.equal('30d');

            fireEvent.click(summaryPeriodOptions[3].querySelector('input'));

            // Apply button should still be disabled (lastData not yet selected)
            expect(applyButton().disabled).to.be.true;

            // Ensure lastData filter options present
            const lastDataFilterOptions = document.querySelectorAll('#tideDashboardConfig #lastData label');
            expect(lastDataFilterOptions.length).to.equal(3);

            expect(lastDataFilterOptions[0].textContent).to.equal('Today');
            expect(lastDataFilterOptions[0].querySelector('input').value).to.equal('1');

            expect(lastDataFilterOptions[1].textContent).to.equal('Within 2 days');
            expect(lastDataFilterOptions[1].querySelector('input').value).to.equal('2');

            expect(lastDataFilterOptions[2].textContent).to.equal('Within 7 days');
            expect(lastDataFilterOptions[2].querySelector('input').value).to.equal('7');

            fireEvent.click(lastDataFilterOptions[2].querySelector('input'));

            // Apply button should now be active
            await waitFor(() => expect(applyButton().disabled).to.be.false);

            // Submit the form
            store.clearActions();
            fireEvent.click(applyButton());

            // Should redirect to the Tide dashboard after saving the dashboard opts to localStorage,
            // keyed to clinician|clinic IDs
            await waitFor(() => {
              expect(store.getActions()).to.eql([
                {
                  type: '@@router/CALL_HISTORY_METHOD',
                  payload: { method: 'push', args: ['/dashboard/tide']}
                },
              ]);
            });

            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show Tide Dashboard config dialog confirmed', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

            const savedConfig = mockedLocalStorage.tideDashboardConfig?.['clinicianUserId123|clinicID123'];
            expect(savedConfig).to.exist;
            expect(savedConfig.period).to.equal('30d');
            expect(savedConfig.tags).to.be.an('array');
            expect(savedConfig.tags.length).to.be.above(0);
          }, 15000);

          it('should redirect right away to the dashboard if a valid configuration exists in localStorage', () => {
            mockedLocalStorage = {
              tideDashboardConfig: {
                'clinicianUserId123|clinicID123': {
                  period: '30d',
                  lastData: 7,
                  tags: ['tag1', 'tag3'],
                },
              },
            };

            mockUseLocalStorage.mockImplementation(key => {
              defaults(mockedLocalStorage, { [key]: {} })
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            });

            mountWrapper(store);

            defaultProps.trackMetric.resetHistory();
            store.clearActions();

            // Click the dashboard button
            const tideDashboardButton = container.querySelector('#open-tide-dashboard');
            expect(tideDashboardButton).to.exist;
            fireEvent.click(tideDashboardButton);

            expect(store.getActions()).to.eql([
              {
                type: '@@router/CALL_HISTORY_METHOD',
                payload: { method: 'push', args: ['/dashboard/tide']}
              },
            ]);

            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Navigate to Tide Dashboard', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

          });

          it('should open the config modal if an invalid configuration exists in localStorage', async () => {
            mockedLocalStorage = {
              tideDashboardConfig: {
                'clinicianUserId123|clinicID123': {
                  period: '30d',
                  lastData: 14,
                  tags: [], // invalid: no tags selected
                },
              },
            };

            mockUseLocalStorage.mockImplementation(key => {
              defaults(mockedLocalStorage, { [key]: {} })
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            });

            mountWrapper(store);

            defaultProps.trackMetric.resetHistory();
            store.clearActions();

            // Click the dashboard button
            const tideDashboardButton = container.querySelector('#open-tide-dashboard');
            const dialog = () => document.querySelector('#tideDashboardConfig');

            // Open dashboard config popover
            expect(dialog()).to.be.null;
            fireEvent.click(tideDashboardButton);
            await waitFor(() => expect(dialog()).to.exist);
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show Tide Dashboard config dialog', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

          });
        });

        context('showTideDashboard flag is false', () => {
          beforeEach(() => {
            mockUseFlags.mockReturnValue({
              showTideDashboard: false,
            });
          });

          it('should not show the TIDE Dashboard CTA, even if clinic tier >= tier0300', () => {
            store = mockStore(tier0300ClinicState);
            mountWrapper(store);

            const tideDashboardButton = container.querySelector('#open-tide-dashboard');
            expect(tideDashboardButton).to.be.null;
          });
        });
      });

      describe('Managing patient last reviewed dates', () => {
        context('showSummaryDashboardLastReviewed flag is true', () => {
          beforeEach(() => {
            store = mockStore(tier0300ClinicState);

            mockUseFlags.mockReturnValue({
              showSummaryDashboardLastReviewed: true,
            });

            mountWrapper(store);
            defaultProps.trackMetric.resetHistory();
          });

          it('should render the Last Reviewed column', () => {
            const lastReviewedHeader = container.querySelector('#peopleTable-header-lastReviewed');
            expect(lastReviewedHeader).to.exist;

            const dataRows = container.querySelectorAll('table tbody tr');
            const lastReviewData = row => dataRows[row].querySelectorAll('.MuiTableCell-root')[12];

            expect(lastReviewData(0).textContent).to.contain('Today');
            expect(lastReviewData(1).textContent).to.contain('Yesterday');
            expect(lastReviewData(2).textContent).to.contain('30 days ago');
            expect(lastReviewData(3).textContent).to.contain('2024-03-05');
          });

          it('should allow setting last reviewed date', async () => {
            const dataRows = container.querySelectorAll('table tbody tr');
            const lastReviewData = row => dataRows[row].querySelectorAll('.MuiTableCell-root')[12];
            const updateButton = () => lastReviewData(1).querySelector('button');

            expect(lastReviewData(1).textContent).to.contain('Yesterday');
            expect(updateButton().textContent).to.equal('Mark Reviewed');

            store.clearActions();
            fireEvent.click(updateButton());

            await waitFor(() => {
              sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Mark patient reviewed', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

              sinon.assert.calledWith(
                defaultProps.api.clinics.setClinicPatientLastReviewed,
                'clinicID123',
              );

              expect(store.getActions()).to.eql([
                { type: 'SET_CLINIC_PATIENT_LAST_REVIEWED_REQUEST' },
                {
                  type: 'SET_CLINIC_PATIENT_LAST_REVIEWED_SUCCESS',
                  payload: { clinicId: 'clinicID123', patientId: 'patient2', reviews: [today, yesterday] },
                },
              ]);
            });
          });

          it('should allow undoing last reviewed date', async () => {
            const dataRows = container.querySelectorAll('table tbody tr');
            const lastReviewData = row => dataRows[row].querySelectorAll('.MuiTableCell-root')[12];
            const updateButton = () => lastReviewData(0).querySelector('button');

            expect(lastReviewData(0).textContent).to.contain('Today');
            expect(updateButton().textContent).to.equal('Undo');

            store.clearActions();
            fireEvent.click(updateButton());

            await waitFor(() => {
              sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Undo mark patient reviewed', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

              sinon.assert.calledWith(
                defaultProps.api.clinics.revertClinicPatientLastReviewed,
                'clinicID123',
              );

              expect(store.getActions()).to.eql([
                { type: 'REVERT_CLINIC_PATIENT_LAST_REVIEWED_REQUEST' },
                {
                  type: 'REVERT_CLINIC_PATIENT_LAST_REVIEWED_SUCCESS',
                  payload: { clinicId: 'clinicID123', patientId: 'patient1', reviews: [yesterday] },
                },
              ]);
            });
          });

          it('should refetch patients with updated sort parameter when Last Reviewed header is clicked', async () => {
            const lastReviewedHeader = container.querySelector('#peopleTable-header-lastReviewed .MuiTableSortLabel-root');

            defaultProps.api.clinics.getPatientsForClinic.resetHistory();
            fireEvent.click(lastReviewedHeader);
            await waitFor(() => sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '+lastReviewed' })));

            defaultProps.api.clinics.getPatientsForClinic.resetHistory();
            fireEvent.click(lastReviewedHeader);
            await waitFor(() => sinon.assert.calledWith(defaultProps.api.clinics.getPatientsForClinic, 'clinicID123', sinon.match({ sort: '-lastReviewed' })));
          });

          it('should not render the Last Reviewed column if showSummarData flag is false', () => {
            mockUseFlags.mockReturnValue({
              showSummaryData: false,
            });

            store = mockStore(tier0100ClinicState);
            mountWrapper(store);

            const lastReviewedHeader = container.querySelector('#peopleTable-header-lastReviewed');
            expect(lastReviewedHeader).to.be.null;
          });
        });

        context('showSummaryDashboardLastReviewed flag is false', () => {
          beforeEach(() => {
            mockUseFlags.mockReturnValue({
              showSummaryDashboardLastReviewed: false,
            });
          });

          it('should not show the Last Reviewed column, even if clinic tier >= tier0300', () => {
            store = mockStore(tier0300ClinicState);
            mountWrapper(store);

            const lastReviewedHeader = container.querySelector('#peopleTable-header-lastReviewed');
            expect(lastReviewedHeader).to.be.null;
          });
        });
      });

      describe('Generating RPM report', () => {
        let mockedLocalStorage;
        let exportRpmReportStub;

        context('showRpmReport flag is true', () => {
          beforeEach(() => {
            store = mockStore(tier0300ClinicState);
            mockedLocalStorage = {};

            function localStorageMock(key) {
              defaults(mockedLocalStorage, { [key]: {} })
              return [
                mockedLocalStorage[key],
                sinon.stub().callsFake(val => mockedLocalStorage[key] = val)
              ];
            }

            mockUseFlags.mockReturnValue({
              showRpmReport: true,
            });

            mockUseLocalStorage.mockImplementation(localStorageMock);
            mockUseClinicPatientsFilters.mockImplementation(() => (
              [
                { timeCGMUsePercent: '<0.7' },
                sinon.stub(),
              ]
            ));

            exportRpmReportStub = null;

            mountWrapper(store);
            defaultProps.trackMetric.resetHistory();
          });

          afterEach(() => {
            exportRpmReportStub = null;
          });

          it('should render the RPM Report CTA', () => {
            const rpmReportButton = container.querySelector('#open-rpm-report-config');
            expect(rpmReportButton).to.exist;
          });

          it('should not render the RPM Report CTA if clinic tier < tier0300', () => {
            store = mockStore(tier0100ClinicState);
            mountWrapper(store);

            const rpmReportButton = container.querySelector('#open-rpm-report-config');
            expect(rpmReportButton).to.be.null;
          });

          it('should open a patient count limit modal if current filtered count is > 1000', async () => {
            store = mockStore({
              blip: {
                ...tier0300ClinicState.blip,
                clinics: {
                  clinicID123: {
                    ...tier0300ClinicState.blip.clinics.clinicID123,
                    fetchedPatientCount: '1001',
                  },
                },
              }
            });

            mountWrapper(store);

            const rpmReportButton = container.querySelector('#open-rpm-report-config');
            const dialog = () => document.querySelector('#rpmReportLimit');

            // Clicking RPM report button should open dashboard limit popover since fetchedPatientCount > 1000
            expect(document.querySelector('#rpmReportLimit[aria-hidden="true"]')).to.exist;
            fireEvent.click(rpmReportButton);
            await waitFor(() => expect(document.querySelector('#rpmReportLimit:not([aria-hidden])')).to.exist);
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show RPM Report limit dialog', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));
          });

          it('should open a modal to configure the report, and generate when configured', async () => {
            store = mockStore({
              blip: {
                ...tier0300ClinicState.blip,
                clinics: {
                  clinicID123: {
                    ...tier0300ClinicState.blip.clinics.clinicID123,
                    fetchedPatientCount: '1000',
                  },
                },
              }
            });

            mountWrapper(store);

            // We'll start by filtering the patient list, to make sure the filters are passed correctly to the RPM report api call
            const cgmUseFilterTrigger = container.querySelector('#cgm-use-filter-trigger');
            expect(cgmUseFilterTrigger).to.exist;

            const cgmUsePopover = () => document.querySelector('#cgmUseFilters');
            expect(cgmUsePopover()).to.exist;
            expect(cgmUsePopover().style.visibility).to.equal('hidden');

            // Open cgmUse popover
            fireEvent.click(cgmUseFilterTrigger);
            expect(cgmUsePopover().style.visibility).to.equal('');

            // Ensure filter options present
            const cgmUseFilterOptions = document.querySelectorAll('#cgm-use label');
            expect(cgmUseFilterOptions.length).to.equal(2);
            expect(cgmUseFilterOptions[0].textContent).to.equal('Less than 70%');
            expect(cgmUseFilterOptions[0].querySelector('input').value).to.equal('<0.7');

            expect(cgmUseFilterOptions[1].textContent).to.equal('70% or more');
            expect(cgmUseFilterOptions[1].querySelector('input').value).to.equal('>=0.7');

            // Apply CGM use filter
            const cgmUseApplyButton = document.querySelector('#apply-cgm-use-filter');
            fireEvent.click(cgmUseFilterOptions[0].querySelector('input'));
            fireEvent.click(cgmUseApplyButton);

            // Set summary period
            const summaryPeriodFilterTrigger = container.querySelector('#summary-period-filter-trigger');
            expect(summaryPeriodFilterTrigger).to.exist;

            const summaryPeriodPopover = () => document.querySelector('#summaryPeriodFilters');
            expect(summaryPeriodPopover()).to.exist;
            expect(summaryPeriodPopover().style.visibility).to.equal('hidden');

            // Open summary period popover
            fireEvent.click(summaryPeriodFilterTrigger);
            expect(summaryPeriodPopover().style.visibility).to.equal('');

            // Set to 7 days
            const filterOptions = document.querySelectorAll('#summary-period-filters label');
            fireEvent.click(filterOptions[1].querySelector('input'));

            // Apply summary period filter
            const summaryPeriodApplyButton = document.querySelector('#apply-summary-period-filter');
            fireEvent.click(summaryPeriodApplyButton);

            const rpmReportButton = container.querySelector('#open-rpm-report-config');
            const dialog = () => document.querySelector('#rpmReportConfig');

            // Clicking RPM report button should open dashboard config popover since fetchedPatientCount <= 1000
            expect(document.querySelector('#rpmReportConfig[aria-hidden="true"]')).to.exist;
            fireEvent.click(rpmReportButton);
            await waitFor(() => expect(document.querySelector('#rpmReportConfig:not([aria-hidden])')).to.exist);
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show RPM Report config dialog', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

            // Should have the default dates set 30 days apart
            const startDate = () => document.querySelector('input#rpm-report-start-date');
            expect(startDate().value).to.be.a('string');
            const endDate = () => document.querySelector('input#rpm-report-end-date');
            expect(endDate().value).to.be.a('string');

            expect(
              moment(endDate().value, 'MMM D, YYYY')
              .diff(moment(startDate().value, 'MMM D, YYYY'), 'days'))
            .to.equal(29); // Because date range is inclusive of the start and end date, 29 here is correct for a 30 day range

            // Should have timezone field defaulted to the clinic timezone
            const timezoneSelect = () => document.querySelector('select#timezone');
            expect(timezoneSelect()).to.exist;
            expect(timezoneSelect().value).to.equal('US/Eastern');

            const applyButton = () => document.querySelector('#configureRpmReportConfirm');
            await waitFor(() => expect(applyButton().disabled).to.be.false);

            // Apply button disabled if timezone is unset
            fireEvent.change(timezoneSelect(), { persist: noop, target: { name: 'timezone', value: '' } });

            // Apply button should be disabled
            await waitFor(() => expect(applyButton().disabled).to.be.true);

            // Choose a new timezone (use UTC to avoid utcDayShift issues with western timezones)
            fireEvent.change(timezoneSelect(), { persist: noop, target: { name: 'timezone', value: 'UTC' } });

            // Apply button should now be active
            await waitFor(() => expect(applyButton().disabled).to.be.false);

            // Apply button disabled if startDate is unset
            fireEvent.change(startDate(), { persist: noop, target: { name: 'rpm-report-start-date', value: '' } });

            // Apply button should be disabled
            await waitFor(() => expect(applyButton().disabled).to.be.true);

            // Choose a new startDate
            fireEvent.change(startDate(), { persist: noop, target: { name: 'rpm-report-start-date', value: moment().subtract(10, 'days').format('YYYY-MM-DD') } });

            // Apply button should now be active
            await waitFor(() => expect(applyButton().disabled).to.be.false);

            // Submit the form
            store.clearActions();
            fireEvent.click(applyButton());

            await waitFor(() => {
              sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show RPM Report config dialog confirmed', sinon.match({ clinicId: 'clinicID123', source: 'Patients list' }));

              // Should save the selected timezone to localStorage, keyed to clinician|clinic IDs
              expect(mockedLocalStorage.rpmReportConfig?.['clinicianUserId123|clinicID123']).to.eql({
                timezone: 'UTC',
              });

              // TODO: delete temp mocked data response
              expect(defaultProps.api.clinics.getPatientsForRpmReport.callCount).to.equal(1);

              sinon.assert.calledWith(
                defaultProps.api.clinics.getPatientsForRpmReport,
                'clinicID123',
                {
                  startDate: sinon.match(value => isString(value)),
                  endDate: sinon.match(value => isString(value)),
                  patientFilters: { period: '7d', 'cgm.timeCGMUsePercent': '<0.7' },
                }
              );

              expect(store.getActions()).to.eql([
                { type: 'FETCH_RPM_REPORT_PATIENTS_REQUEST' },
                {
                  type: 'FETCH_RPM_REPORT_PATIENTS_SUCCESS',
                  payload: { results: mockRpmReportPatients },
                },
              ]);
            });
          }, 30000);

          it('should call `exportRpmReport` with fetched report data', () => {
            const originalCreateObjectURL = URL.createObjectURL;
            URL.createObjectURL = sinon.stub().returns('blob:mock-rpm-report');
            const createElementStub = sinon.stub(document, 'createElement').callsFake((tag) => {
              if (tag === 'a') {
                return {
                  set href(value) { this._href = value; },
                  get href() { return this._href; },
                  set download(value) { this._download = value; },
                  get download() { return this._download; },
                  click: sinon.stub(),
                };
              }
              return document.createElement.wrappedMethod.call(document, tag);
            });

            const initialStore = {
              blip: {
                ...tier0300ClinicState.blip,
                working: {
                  ...tier0300ClinicState.blip.working,
                  fetchingRpmReportPatients: {
                    ...defaultWorkingState,
                    inProgress: true,
                  },
                },
                rpmReportPatients: {
                  ...mockRpmReportPatients,
                  config: {
                    ...mockRpmReportPatients.config,
                    clinicId: 'clinicID123',
                    rawConfig: {
                      startDate: '2024-01-01',
                      endDate: '2024-01-31',
                      timezone: 'US/Eastern',
                    },
                  },
                },
              },
            };

            store = mockStore(initialStore);
            mountWrapper(store);

            rerender(
              <Provider store={mockStore({
                blip: {
                  ...initialStore.blip,
                  working: {
                    ...initialStore.blip.working,
                    fetchingRpmReportPatients: completedState,
                  },
                },
              })}>
                <ToastProvider>
                  <ClinicPatients {...defaultProps} />
                </ToastProvider>
              </Provider>
            );

            expect(container).to.exist;

            createElementStub.restore();
            if (originalCreateObjectURL) {
              URL.createObjectURL = originalCreateObjectURL;
            } else {
              delete URL.createObjectURL;
            }
          });
        });

        context('showRpmReport flag is false', () => {
          beforeEach(() => {
            mockUseFlags.mockReturnValue({
              showRpmReport: false,
            });
          });

          it('should not show the TIDE Dashboard CTA, even if clinic tier >= tier0300', () => {
            store = mockStore(tier0300ClinicState);
            mountWrapper(store);

            const rpmReportButton = container.querySelector('#open-rpm-report-config');
            expect(rpmReportButton).to.be.null;
          });
        });
      });

      context('non-admin clinician', () => {
        beforeEach(() => {
          store = mockStore(nonAdminPatientsState);
          defaultProps.trackMetric.resetHistory();
          mountWrapper(store);
        });

        it('should not render the remove button', () => {
          const rows = container.querySelectorAll('table tr');
          expect(rows.length).to.equal(3); // header row + 2 invites
          const removeButton = rows[1].querySelector('.remove-clinic-patient');
          expect(removeButton).to.be.null;
        });
      });
    });
  });
});
