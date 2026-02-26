import React from 'react';
import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';
import { mountWithProviders } from '../../utils/mountWithProviders';
import moment from 'moment-timezone';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import merge from 'lodash/merge';
import defaults from 'lodash/defaults';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';
import { useHistory, useLocation } from 'react-router-dom';
import { useLocalStorage } from '../../../app/core/hooks';
import TideDashboard from '../../../app/pages/dashboard/TideDashboard';
import Popover from '../../../app/components/elements/Popover';
import TideDashboardConfigForm from '../../../app/components/clinic/TideDashboardConfigForm';
import DataConnections from '../../../app/components/datasources/DataConnections';
import DataConnectionsModal from '../../../app/components/datasources/DataConnectionsModal';
import { clinicUIDetails } from '../../../app/core/clinicUtils';
import api from '../../../app/core/api';
import mockTideDashboardPatients from '../../fixtures/mockTideDashboardPatients.json';
import LDClientMock from '../../fixtures/LDClientMock';
import SelectTags from '../../../app/components/clinic/PatientForm/SelectTags';

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global afterEach */

jest.mock('launchdarkly-react-client-sdk', () => {
  const actual = jest.requireActual('launchdarkly-react-client-sdk');

  return {
    ...actual,
    useFlags: jest.fn(),
    useLDClient: jest.fn(),
  };
});

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');

  return {
    ...actual,
    useHistory: jest.fn(),
    useLocation: jest.fn(),
  };
});

jest.mock('../../../app/core/hooks', () => {
  const actual = jest.requireActual('../../../app/core/hooks');

  return {
    ...actual,
    useLocalStorage: jest.fn(),
  };
});

jest.mock('../../../app/components/clinic/PatientForm/SelectTags', () => {
  const React = require('react');
  return jest.fn((props) => (
    React.createElement('div', {
      'data-testid': 'mock-select-tags',
      onClick: () => props.onChange(['646f7efd08e23bc18d91caa6', '63d98f3dda7008171a96ab04'])
    }, 'Mock Select Tags')
  ));
});

const expect = chai.expect;
const mockStore = configureStore([thunk]);

beforeAll(() => {
  window.scrollTo = jest.fn();
});

describe('TideDashboard', () => {
  const today = moment().toISOString();
  const yesterday = moment(today).subtract(1, 'day').toISOString();

  let wrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    api: {
      clinics: {
        getPatientsForTideDashboard: sinon.stub(),
        getPatientFromClinic: sinon.stub(),
        updateClinicPatient: sinon.stub().callsArgWith(3, null, { id: 'stubbedId', stubbedUpdates: 'foo' }),
        setClinicPatientLastReviewed: sinon.stub().callsArgWith(2, null, [today, yesterday]),
        revertClinicPatientLastReviewed: sinon.stub().callsArgWith(2, null, [yesterday]),
      },
    },
  };

  beforeEach(() => {
    useLDClient.mockReturnValue(new LDClientMock());

    useFlags.mockReturnValue({
      showTideDashboard: true,
      showSummaryDashboard: true,
      tideDashboardCategories: '',
    });

    useHistory.mockReturnValue({
      location: { query: {}, pathname: '/settings' },
      replace: sinon.stub(),
    });

    useLocation.mockReturnValue({
      search: '',
      pathname: '/dashboard/tide'
    });

    api.clinics.getPatientFromClinic = defaultProps.api.clinics.getPatientFromClinic;
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  const sampleTags = [
    { id: '646f7edb08e23bc18d91caa5', name: 'test tag 1' },
    { id: '646f7efd08e23bc18d91caa6', name: 'test tag 2' },
    { id: '63d98f3dda7008171a96ab04', name: 'test tag 3' },
  ];

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
    id: 'clinicID123',
    patientTags: sampleTags,
    patients: {},
    address: '2 Address Ln, City Zip',
    name: 'other_clinic_name',
    email: 'other_clinic_email_address@example.com',
  };

  const noResultsState = {
    blip: {
      loggedInUserId,
      clinics: {
        clinicID123: {
          ...defaultClinic,
          ...clinicUIDetails({
            ...defaultClinic,
            tier: 'tier0300',
          }),
        },
      },
      tideDashboardPatients: {},
      timePrefs: { timezoneName: 'UTC' },
      selectedClinicId: 'clinicID123',
      data: {
        metaData: {},
      },
      allUsersMap: {
        clinicianUserId123,
      },
      consentRecords: {},
      working: {
        fetchingPatientFromClinic: defaultWorkingState,
        fetchingTideDashboardPatients: completedState,
        updatingClinicPatient: defaultWorkingState,
        fetchingPatientsForClinic: defaultWorkingState,
        settingClinicPatientLastReviewed: defaultWorkingState,
        revertingClinicPatientLastReviewed: defaultWorkingState,
        fetchingClinicMRNsForPatientFormValidation: defaultWorkingState,
      },
    },
  };

  const lastReviewedOverrides = [
    [
      { clinicianId: 'clinicianUserId123', time: today },
      { clinicianId: 'clinicianUserId123', time: yesterday },
    ],
    [
      { clinicianId: 'clinicianUserId123', time: yesterday },
    ],
    [
      { clinicianId: 'clinicianUserId123', time: moment(today).subtract(30, 'd').toISOString() },
    ],
    [
      { clinicianId: 'clinicianUserId123', time: moment('2024-03-05T12:00:00.000Z').toISOString() },
    ],
    [],
  ];

  const noDataOverrides = [
    { lastData: moment(today).subtract(30, 'd').toISOString() },
    { lastData: moment(today).subtract(200, 'd').toISOString() },
    { lastData: yesterday },
    {},
    { lastData: moment(today).subtract(45, 'd').toISOString() },
  ]

  const tideDashboardPatients = {
    ...mockTideDashboardPatients,
    results: {
      ...mockTideDashboardPatients.results,
      meetingTargets:  map(mockTideDashboardPatients.results.meetingTargets, (results, i) => ({
        ...results,
        patient: { ...results.patient, reviews: lastReviewedOverrides[i] },
      })),
      noData:  map(mockTideDashboardPatients.results.noData, (results, i) => ({
        ...results,
        ...noDataOverrides[i]
      })),
    }
  }

  const hasResultsState = merge({}, noResultsState, {
    blip: {
      allUsersMap: {
        clinicianUserId123,
      },
      tideDashboardPatients,
      timePrefs: { timezoneName: 'UTC' },
      clinics: {
        clinicID123: {
          ...defaultClinic,
          ...clinicUIDetails(defaultClinic),
          patients: keyBy(map(tideDashboardPatients.results.meetingTargets, ({ patient }) => patient), 'id'),
        },
      },
      working: {
        fetchingPatientFromClinic: defaultWorkingState,
        fetchingTideDashboardPatients: completedState,
        updatingClinicPatient: defaultWorkingState,
        sendingPatientDataProviderConnectRequest: defaultWorkingState,
        settingClinicPatientLastReviewed: defaultWorkingState,
        revertingClinicPatientLastReviewed: defaultWorkingState,
      },
    },
  });

  const hasEmptyResultsState = {
    blip: {
      ...hasResultsState.blip,
      tideDashboardPatients: {
        ...tideDashboardPatients,
        results: {
          timeInVeryLowPercent: [],
          timeInAnyLowPercent: [],
          dropInTimeInTargetPercent: [],
          timeInTargetPercent: [],
          timeCGMUsePercent: [],
          meetingTargets: [],
          timeInVeryHighPercent: [],
          timeInAnyHighPercent: [],
          noData: [],
        }
      },
    },
  };

  const hasResultsStateMmoll = {
    blip: {
      ...hasResultsState.blip,
      clinics: {
        clinicID123: {
          ...defaultClinic,
          preferredBgUnits: 'mmol/L',
          ...clinicUIDetails(defaultClinic),
        },
      },
    },
  };

  const tier0200ClinicState = {
    blip: {
      ...hasResultsState.blip,
      clinics: {
        clinicID123: {
          ...defaultClinic,
          ...clinicUIDetails({
            ...defaultClinic,
            tier: 'tier0200',
          }),
        },
      },
    },
  };

  const tier0300ClinicState = {
    blip: {
      ...hasResultsState.blip,
      clinics: {
        clinicID123: {
          ...defaultClinic,
          ...clinicUIDetails({
            ...defaultClinic,
            tier: 'tier0300',
          }),
        },
      },
    },
  };

  const useLocalStorageRewire = mocked => sinon.stub().callsFake(key => {
    defaults(mocked, { [key]: {} })
    return [
      mocked[key],
      sinon.stub().callsFake(val => mocked[key] = val)
    ];
  });

  let store;
  let mockedLocalStorage;

  beforeEach(() => {
    localStorage.removeItem('tideDashboardConfig');
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.getPatientsForTideDashboard.resetHistory();
    defaultProps.api.clinics.updateClinicPatient.resetHistory();

    store = mockStore(hasResultsState);

    mockedLocalStorage = {
      tideDashboardConfig: {
        'clinicianUserId123|clinicID123': {
          period: '30d',
          lastData: '7',
          tags: sampleTags.map(({ id }) => id),
        },
      },
    };

    useLocalStorage.mockImplementation(useLocalStorageRewire(mockedLocalStorage));
    wrapper = mountWithProviders(
      <TideDashboard {...defaultProps} />,
      { store }
    );
  });

  afterEach(() => {
    store.clearActions();
    jest.clearAllMocks();
  });

  context('on mount', () => {
    it('should redirect back to the clinic workspace if LD `entitlements.tideDashboard` is false ', () => {
      store = mockStore(tier0300ClinicState);
      store.clearActions();

      useLDClient.mockReturnValue(new LDClientMock({ clinic : {
        tier: 'tier0300'
      }}));

      useFlags.mockReturnValue({
        showTideDashboard: false,
      });

      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );

      const actions = store.getActions();
      const redirectAction = actions.find(a => a.type === '@@router/CALL_HISTORY_METHOD');
      expect(redirectAction).to.eql({
        payload: { args: ['/clinic-workspace'], method: 'push' },
        type: '@@router/CALL_HISTORY_METHOD',
      });
    });

    it('should clear the current patient in view', () => {
      store = mockStore({
        blip: {
          ...tier0200ClinicState.blip,
          currentPatientInViewId: 'patientInViewID',
        },
      });
      store.clearActions();

      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );

      expect(store.getActions()[0]).to.eql({
        type: 'CLEAR_PATIENT_IN_VIEW',
      });

      expect(store.getActions()[1]).to.eql({
        meta: {
          WebWorker: true,
          id: 'patientInViewID',
          worker: 'data',
        },
        payload: {
          predicate: undefined,
        },
        type: 'DATA_WORKER_REMOVE_DATA_REQUEST',
      });
    });

    it('should open the config dialog if the configuration is not set', () => {
      store = mockStore(noResultsState);
      mockedLocalStorage = {};
      useLocalStorage.mockImplementation(useLocalStorageRewire(mockedLocalStorage));

      useLDClient.mockReturnValue(new LDClientMock({ clinic : {
        tier: 'tier0300',
      }}));

      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );

      const dialog = document.querySelector('#tideDashboardConfig');
      expect(dialog).to.not.be.null;
    });

    it('should open the config dialog if the configuration is invalid', () => {
      store = mockStore(noResultsState);
      mockedLocalStorage = {
        tideDashboardConfig: {
          'clinicianUserId123|clinicID123': {
            period: '30d',
            lastData: '7',
            tags: [], // invalid: no tags selected
          },
        },
      };
      useLocalStorage.mockImplementation(useLocalStorageRewire(mockedLocalStorage));

      useLDClient.mockReturnValue(new LDClientMock({ clinic : {
        tier: 'tier0300',
      }}));

      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );

      const dialog = document.querySelector('#tideDashboardConfig');
      expect(dialog).to.not.be.null;
    });

    it('should fetch dashboard results if the configuration is set', () => {
      store = mockStore(noResultsState);

      mockedLocalStorage = {
        tideDashboardConfig: {
          'clinicianUserId123|clinicID123': {
            period: '30d',
            lastData: '7',
            tags: sampleTags.map(({ id }) => id),
          },
        },
      };

      useLocalStorage.mockImplementation(useLocalStorageRewire(mockedLocalStorage));
      useFlags.mockReturnValue({
        showSummaryDashboard: true,
        showTideDashboard: true,
        tideDashboardCategories: '',
      });

      useLDClient.mockReturnValue(new LDClientMock({ clinic : {
        tier: 'tier0300',
      }}));

      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );

      const expectedAction = { type: 'FETCH_TIDE_DASHBOARD_PATIENTS_REQUEST' };
      expect(store.getActions()[0]).to.eql(expectedAction);
    });
  });

  context('on unmount', () => {
    it('should remove dashboard results from state', () => {
      store.clearActions();

      wrapper.unmount();

      const expectedActions = [
        { type: 'CLEAR_TIDE_DASHBOARD_PATIENTS' },
      ];

      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  context('no results after fetching', () => {
    beforeEach(() => {
      store = mockStore(hasEmptyResultsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );
    });

    it('should show empty table text', () => {
      const dashboardSections = document.querySelectorAll('.dashboard-section');
      expect(dashboardSections).to.have.length(1);
      const emptyTextNode = dashboardSections[0].querySelector('#no-tide-results');
      expect(emptyTextNode).to.not.be.null;
      expect(emptyTextNode.textContent).contains('To make sure your patients are tagged and you have set the correct patient filters, go to your Clinic Workspace.');
    });
  });

  context('has results', () => {
    beforeEach(() => {
      store = mockStore(hasResultsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );
    });

    it('should render the dashboard header with period dates', () => {
      store = mockStore({
        blip: {
          ...hasResultsState.blip,
          tideDashboardPatients: {
            ...tideDashboardPatients,
            config: {
              ...tideDashboardPatients.config,
              period: '14d',
              lastData: 1,
            },
          },
        },
      });
      defaultProps.trackMetric.resetHistory();
      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );

      const header = document.querySelector('#tide-dashboard-header');
      expect(header.textContent).to.equal('TIDE Dashboard');

      const period = document.querySelector('#tide-dashboard-summary-period');
      expect(period.textContent).contains('14 days');

      const lastData = document.querySelector('#tide-dashboard-last-data');
      expect(lastData.textContent).contains('Today');
    });

    it('should render a heading and table for dashboard section, with correctly ordered results', async () => {
      const dashboardSections = document.querySelectorAll('.dashboard-section');
      expect(dashboardSections).to.have.length(8);

      const dashboardSectionLabels = document.querySelectorAll('.dashboard-section-label');
      expect(dashboardSectionLabels).to.have.length(8);
      expect(dashboardSectionLabels[0].textContent).to.equal('Very Low> 1% Time below 54 mg/dL');
      expect(dashboardSectionLabels[1].textContent).to.equal('Low> 4% Time below 70 mg/dL');
      expect(dashboardSectionLabels[2].textContent).to.equal('Large Drop in Time in Range> 15%');
      expect(dashboardSectionLabels[3].textContent).to.equal('High> 25% Time above 180 mg/dL');
      expect(dashboardSectionLabels[4].textContent).to.equal('Very High> 5% Time above 250 mg/dL');
      expect(dashboardSectionLabels[5].textContent).to.equal('Low CGM Wear Time< 70%');
      expect(dashboardSectionLabels[6].textContent).to.equal('Meeting Targets');
      expect(dashboardSectionLabels[7].textContent).to.equal('Data Issues');

      const dashboardSectionTables = document.querySelectorAll('.dashboard-table');
      expect(dashboardSectionTables).to.have.length(8);

      const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables[tableIndex].querySelectorAll('tr')[rowIndex];

      expect(dashboardSectionTables[0].querySelectorAll('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables[1].querySelectorAll('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables[2].querySelectorAll('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables[3].querySelectorAll('tr')).to.have.length(1); // header row
      expect(dashboardSectionTables[4].querySelectorAll('tr')).to.have.length(1); // header row
      expect(dashboardSectionTables[5].querySelectorAll('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables[6].querySelectorAll('tr')).to.have.length(6); // header row + 5 results

      // Verify all columns on present on a sample patient from first table
      expect(getTableRow(0, 0).querySelectorAll('th')[0].textContent).contains('Patient Name');
      expect(getTableRow(0, 2).querySelectorAll('th')[0].textContent).contains('Charmane Fassman');

      expect(getTableRow(0, 0).querySelectorAll('th')[1].textContent).contains('Avg. Glucose');
      expect(getTableRow(0, 2).querySelectorAll('td')[0].textContent).contains('97');

      expect(getTableRow(0, 0).querySelectorAll('th')[2].textContent).contains('GMI');
      expect(getTableRow(0, 2).querySelectorAll('td')[1].textContent).contains('12.2 %');

      expect(getTableRow(0, 0).querySelectorAll('th')[3].textContent).contains('CGM Use');
      expect(getTableRow(0, 2).querySelectorAll('td')[2].textContent).contains('84 %');

      // Confirm first table is sorted appropriately
      expect(getTableRow(0, 0).querySelectorAll('th')[4].textContent).contains('% Time < 54');
      expect(getTableRow(0, 1).querySelectorAll('td')[3].textContent).contains('4 %');
      expect(getTableRow(0, 2).querySelectorAll('td')[3].textContent).contains('3 %');
      expect(getTableRow(0, 3).querySelectorAll('td')[3].textContent).contains('1 %');

      expect(getTableRow(0, 0).querySelectorAll('th')[5].textContent).contains('% Time < 70');
      expect(getTableRow(0, 2).querySelectorAll('td')[4].textContent).contains('17 %');

      expect(getTableRow(0, 0).querySelectorAll('th')[6].textContent).contains('% TIR 70-180');
      expect(getTableRow(0, 2).querySelectorAll('td')[5].textContent).contains('71 %');

      expect(getTableRow(0, 0).querySelectorAll('th')[7].textContent).contains('% Time in Range');
      expect(getTableRow(0, 2).querySelectorAll('td')[6].querySelectorAll('.range-summary-bars')).to.have.lengthOf(1);

      expect(getTableRow(0, 0).querySelectorAll('th')[8].textContent).contains('% Change in TIR');
      expect(getTableRow(0, 2).querySelectorAll('td')[7].textContent).contains('10');

      expect(getTableRow(0, 0).querySelectorAll('th')[9].textContent).contains('Tags');
      expect(getTableRow(0, 2).querySelectorAll('td')[8].textContent).contains('test tag 1');

      // Should contain a "more" menu that allows opening a patient edit dialog and opening a patient data connections dialog
      const moreMenuIcon = getTableRow(0, 2).querySelectorAll('td')[9].querySelector('button');
      
      expect(document.querySelector('#editPatient')).to.be.null;
      fireEvent.click(moreMenuIcon);
      
      const editButton = (await screen.findAllByText('Edit Patient Details'))[0];
      expect(editButton).to.not.be.null;

      fireEvent.click(editButton);
      
      const editDialog = await waitFor(() => document.querySelector('#editPatient'));
      expect(editDialog).to.not.be.null;

      expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      // Close the dialog without triggering the "Edit patient close" trackMetric
      // (clicking aria-label="close dialog" fires an extra metric via DialogTitle's onClose handler)
      // Click the MUI backdrop instead which triggers Dialog.onClose = handleCloseOverlays (no metric)
      fireEvent.click(document.querySelector('#editPatient .MuiBackdrop-root'));
      await waitFor(() => expect(document.querySelector('#editPatient')).to.be.null);

      // Open menu again
      fireEvent.click(moreMenuIcon);

      await screen.findAllByText('Bring Data into Tidepool'); // wait for DOM to settle
      const dataConnectionsButton = Array.from(document.querySelectorAll('.action-list-item'))
        .find(el => el.textContent.includes('Bring Data into Tidepool'));
      expect(dataConnectionsButton).to.not.be.null;

      expect(document.querySelector('#data-connections')).to.be.null;

      fireEvent.click(dataConnectionsButton);
      
      const dataConnectionsDialog = await waitFor(() => document.querySelector('#data-connections'));
      expect(dataConnectionsDialog).to.not.be.null;

      expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient data connections')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(2);

      // Confirm second table is sorted appropriately
      expect(getTableRow(1, 0).querySelectorAll('th')[5].textContent).contains('% Time < 70');
      expect(getTableRow(1, 1).querySelectorAll('td')[4].textContent).contains('9 %');
      expect(getTableRow(1, 2).querySelectorAll('td')[4].textContent).contains('9 %');
      expect(getTableRow(1, 3).querySelectorAll('td')[4].textContent).contains('6 %');

      // Confirm third table is sorted appropriately
      expect(getTableRow(2, 0).querySelectorAll('th')[8].textContent).contains('% Change in TIR');
      expect(getTableRow(2, 1).querySelectorAll('td')[7].textContent).contains('26');
      expect(getTableRow(2, 2).querySelectorAll('td')[7].textContent).contains('25');
      expect(getTableRow(2, 3).querySelectorAll('td')[7].textContent).contains('24');

      // Confirm sixth table is sorted appropriately
      expect(getTableRow(5, 0).querySelectorAll('th')[3].textContent).contains('CGM Use');
      expect(getTableRow(5, 1).querySelectorAll('td')[2].textContent).contains('57');
      expect(getTableRow(5, 2).querySelectorAll('td')[2].textContent).contains('66');
      expect(getTableRow(5, 3).querySelectorAll('td')[2].textContent).contains('69');

      // Confirm seventh table is sorted appropriately
      expect(getTableRow(6, 0).querySelectorAll('th')[4].textContent).contains('% Time < 54');
      expect(getTableRow(6, 1).querySelectorAll('td')[3].textContent).contains('0 %');
      expect(getTableRow(6, 2).querySelectorAll('td')[3].textContent).contains('1 %');
      expect(getTableRow(6, 3).querySelectorAll('td')[3].textContent).contains('1 %');
      expect(getTableRow(6, 4).querySelectorAll('td')[3].textContent).contains('0 %');
      expect(getTableRow(6, 5).querySelectorAll('td')[3].textContent).contains('0 %');

      // Confirm eighth table is sorted appropriately
      expect(getTableRow(7, 0).querySelectorAll('th')[2].textContent).contains('Days Since Last Data');
      expect(getTableRow(7, 1).querySelectorAll('td')[1].textContent).contains('20');
      expect(getTableRow(7, 2).querySelectorAll('td')[1].textContent).contains('45');
      expect(getTableRow(7, 3).querySelectorAll('td')[1].textContent).contains('30');
      expect(getTableRow(7, 4).querySelectorAll('td')[1].textContent).contains('1');
      expect(getTableRow(7, 5).querySelectorAll('td')[1].textContent).contains('-');


      // Verify columns present on a sample patient from the data issues table
      expect(getTableRow(7, 0).querySelectorAll('th')[0].textContent).contains('Patient Name');
      expect(getTableRow(7, 1).querySelectorAll('th')[0].textContent).contains('Judah Stopforth');

      expect(getTableRow(7, 0).querySelectorAll('th')[1].textContent).contains('Dexcom Connection Status');
      expect(getTableRow(7, 1).querySelectorAll('td')[0].textContent).contains('Error Connecting');

      expect(getTableRow(7, 0).querySelectorAll('th')[2].textContent).contains('Days Since Last Data');
      expect(getTableRow(7, 1).querySelectorAll('td')[1].textContent).contains('20');

      // Verify that various connection statuses are rendering correctly
      expect(getTableRow(7, 2).querySelectorAll('th')[0].textContent).contains('Willie Gambles');
      expect(getTableRow(7, 2).querySelectorAll('td')[0].textContent).contains('Invite Sent');

      expect(getTableRow(7, 3).querySelectorAll('th')[0].textContent).contains('Denys Ickov');
      expect(getTableRow(7, 3).querySelectorAll('td')[0].textContent).contains('Patient Disconnected');

      expect(getTableRow(7, 4).querySelectorAll('th')[0].textContent).contains('Johna Slatcher');
      expect(getTableRow(7, 4).querySelectorAll('td')[0].textContent).contains('No Pending Connections');

      expect(getTableRow(7, 5).querySelectorAll('th')[0].textContent).contains('Emelda Stangoe');
      expect(getTableRow(7, 5).querySelectorAll('td')[0].textContent).contains('Invite Expired');
    });

    it('should show empty text for a section without results', () => {
      store = mockStore({
        blip: {
          ...hasResultsState.blip,
          tideDashboardPatients: {
            ...tideDashboardPatients,
            results: {
              ...tideDashboardPatients.results,
              timeInVeryLowPercent: [],
            }
          },
        }
      });
      defaultProps.trackMetric.resetHistory();
      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );

      const dashboardSections = document.querySelectorAll('.dashboard-section');
      expect(dashboardSections).to.have.length(8);

      const emptyTextNode = dashboardSections[0].querySelector('.table-empty-text');
      expect(emptyTextNode).to.not.be.null;
      expect(emptyTextNode.textContent).contains('There are no patients that match your filter criteria.');
    });

    it('should link to a patient data trends view when patient name is clicked', () => {
      const dashboardSectionTables = document.querySelectorAll('.dashboard-table');
      const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables[tableIndex].querySelectorAll('tr')[rowIndex];

      const firstPatientName = getTableRow(0, 2).querySelectorAll('span')[0];
      expect(firstPatientName.textContent).contains('Charmane Fassman');
      const expectedPatientId = '6da2c016-263b-92db-1c3e-11ed92f5be4b';

      store.clearActions();
      fireEvent.click(firstPatientName);

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: [`/patients/${expectedPatientId}/data/trends?dashboard=tide`]}
        },
      ]);
    });

    context('mmol/L preferredBgUnits', () => {
      beforeEach(() => {
        store = mockStore(hasResultsStateMmoll);

        wrapper = mountWithProviders(
          <TideDashboard {...defaultProps} />,
          { store }
        );

        defaultProps.trackMetric.resetHistory();
      });

      it('should show the bgm average glucose in mmol/L units', () => {
        const dashboardSectionTables = document.querySelectorAll('.dashboard-table');
        const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables[tableIndex].querySelectorAll('tr')[rowIndex];

        expect(getTableRow(0, 0).querySelectorAll('th')[1].textContent).contains('Avg. Glucose');
        expect(getTableRow(0, 2).querySelectorAll('td')[0].textContent).contains('5.4');
      });

      it('should show table headings mmol/L units', () => {
        const dashboardSections = document.querySelectorAll('.dashboard-section');
        expect(dashboardSections).to.have.length(8);

        const dashboardSectionLabels = document.querySelectorAll('.dashboard-section-label');
        expect(dashboardSectionLabels).to.have.length(8);
        expect(dashboardSectionLabels[0].textContent).to.equal('Very Low> 1% Time below 3.0 mmol/L');
        expect(dashboardSectionLabels[1].textContent).to.equal('Low> 4% Time below 3.9 mmol/L');

        const dashboardSectionTables = document.querySelectorAll('.dashboard-table');
        const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables[tableIndex].querySelectorAll('tr')[rowIndex];

        // Confirm first table is sorted appropriately
        expect(getTableRow(0, 0).querySelectorAll('th')[4].textContent).contains('% Time < 3.0');
        expect(getTableRow(0, 1).querySelectorAll('td')[3].textContent).contains('4 %');
        expect(getTableRow(0, 2).querySelectorAll('td')[3].textContent).contains('3 %');
        expect(getTableRow(0, 3).querySelectorAll('td')[3].textContent).contains('1 %');

        expect(getTableRow(0, 0).querySelectorAll('th')[5].textContent).contains('% Time < 3.9');
        expect(getTableRow(0, 2).querySelectorAll('td')[4].textContent).contains('17 %');
      });
    });

    describe('Managing patient last reviewed dates', () => {
      context('showSummaryDashboardLastReviewed flag is true', () => {
        beforeEach(() => {
          store = mockStore(hasResultsState);

          useFlags.mockReturnValue({
            showTideDashboardLastReviewed: true,
            tideDashboardCategories: '',
          });

          wrapper = mountWithProviders(
            <TideDashboard {...defaultProps} />,
            { store }
          );
        });

        afterEach(() => {
          jest.clearAllMocks();
        });

        it('should render the Last Reviewed column', () => {
          const lastReviewedHeader = document.querySelector('#dashboard-table-meetingTargets-header-lastReviewed');
          expect(lastReviewedHeader).to.not.be.null;

          const table = document.querySelector('table#dashboard-table-meetingTargets');
          const rows = table.querySelectorAll('tbody tr');
          const lastReviewData = row => rows[row].querySelectorAll('.MuiTableCell-root')[10];

          expect(lastReviewData(0).textContent).to.contain('Today');
          expect(lastReviewData(1).textContent).to.contain('Yesterday');
          expect(lastReviewData(3).textContent).to.contain('30 days ago');
          expect(lastReviewData(4).textContent).to.contain('2024-03-05');
        });

        it('should allow setting last reviewed date', async () => {
          const table = document.querySelector('table#dashboard-table-meetingTargets');
          const rows = table.querySelectorAll('tbody tr');
          const lastReviewData = row => rows[row].querySelectorAll('.MuiTableCell-root')[10];
          const updateButton = () => lastReviewData(1).querySelector('button');

          expect(lastReviewData(1).textContent).to.contain('Yesterday');
          expect(updateButton().textContent).to.equal('Mark Reviewed');

          store.clearActions();
          fireEvent.click(updateButton());
          
          await waitFor(() => {
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Mark patient reviewed', sinon.match({ clinicId: 'clinicID123', source: 'TIDE dashboard' }));
          });

          sinon.assert.calledWith(
            defaultProps.api.clinics.setClinicPatientLastReviewed,
            'clinicID123',
          );

          expect(store.getActions()).to.eql([
            { type: 'SET_CLINIC_PATIENT_LAST_REVIEWED_REQUEST' },
            {
              type: 'SET_CLINIC_PATIENT_LAST_REVIEWED_SUCCESS',
              payload: { clinicId: 'clinicID123', patientId: 'ea8ab4da-d4ed-bc6a-dec3-6aa170a99d49', reviews: [today, yesterday] },
            },
          ]);
        });

        it('should allow undoing last reviewed date', async () => {
          const table = document.querySelector('table#dashboard-table-meetingTargets');
          const rows = table.querySelectorAll('tbody tr');
          const lastReviewData = row => rows[row].querySelectorAll('.MuiTableCell-root')[10];
          const updateButton = () => lastReviewData(0).querySelector('button');

          expect(lastReviewData(0).textContent).to.contain('Today');
          expect(updateButton().textContent).to.equal('Undo');

          store.clearActions();
          fireEvent.click(updateButton());
          
          await waitFor(() => {
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Undo mark patient reviewed', sinon.match({ clinicId: 'clinicID123', source: 'TIDE dashboard' }));
          });

          sinon.assert.calledWith(
            defaultProps.api.clinics.revertClinicPatientLastReviewed,
            'clinicID123',
          );

          expect(store.getActions()).to.eql([
            { type: 'REVERT_CLINIC_PATIENT_LAST_REVIEWED_REQUEST' },
            {
              type: 'REVERT_CLINIC_PATIENT_LAST_REVIEWED_SUCCESS',
              payload: { clinicId: 'clinicID123', patientId: 'ecabff50-0698-ec3d-f2b9-b9d3720cbe14', reviews: [yesterday] },
            },
          ]);
        });

        it('should not render the Last Reviewed column if showSummaryData flag is false', () => {
          useFlags.mockReturnValue({
            showSummaryData: false,
          });

          store = mockStore(hasResultsState);
          wrapper = mountWithProviders(
            <TideDashboard {...defaultProps} />,
            { store }
          );

          const lastReviewedHeader = document.querySelector('#dashboard-table-meetingTargets-header-lastReviewed');
          expect(lastReviewedHeader).to.be.null;

          jest.clearAllMocks();
        });
      });

      context('showSummaryDashboardLastReviewed flag is false', () => {
        beforeEach(() => {
          useFlags.mockReturnValue({
            showSummaryDashboardLastReviewed: false,
          });
        });

        afterEach(() => {
          jest.clearAllMocks();
        });

        it('should not show the Last Reviewed column, even if clinic tier >= tier0300', () => {
          store = mockStore(tier0300ClinicState);
          wrapper = mountWithProviders(
            <TideDashboard {...defaultProps} />,
            { store }
          );

          const lastReviewedHeader = document.querySelector('#dashboard-table-meetingTargets-header-lastReviewed');
          expect(lastReviewedHeader).to.be.null;
        });
      });
    });
  });

  context('has custom tideDashboardCategories setting configured in LaunchDarkly', () => {
    beforeEach(() => {
      useFlags.mockReturnValue({
        showTideDashboard: true,
        showSummaryDashboard: true,
        tideDashboardCategories: 'noData,fooBar,meetingTargets , timeCGMUsePercent,timeInAnyLowPercent',
      });

      store = mockStore(hasResultsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mountWithProviders(
        <TideDashboard {...defaultProps} />,
        { store }
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('returns custom sections in expected order and filters out invalid sections', () => {
      const dashboardSections = document.querySelectorAll('.dashboard-section');
      expect(dashboardSections).to.have.length(4);

      const dashboardSectionLabels = document.querySelectorAll('.dashboard-section-label');
      expect(dashboardSectionLabels).to.have.length(4);
      expect(dashboardSectionLabels[0].textContent).to.equal('Data Issues');
      expect(dashboardSectionLabels[1].textContent).to.equal('Meeting Targets');
      expect(dashboardSectionLabels[2].textContent).to.equal('Low CGM Wear Time< 70%');
      expect(dashboardSectionLabels[3].textContent).to.equal('Low> 4% Time below 70 mg/dL');
    });
  });

  describe('Updating dashboard config', () => {
    it('should open a modal to update the dashboard, with the current config from localStorage as a starting point', async () => {
      const tideDashboardButton = document.querySelector('#update-dashboard-config');
      expect(tideDashboardButton).to.not.be.null;

      // Open dashboard config popover
      expect(document.querySelector('#tideDashboardConfig')).to.be.null;
      fireEvent.click(tideDashboardButton);
      
      const dialog = await waitFor(() => document.querySelector('#tideDashboardConfig'));
      expect(dialog).to.not.be.null;
      
      sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show Tide Dashboard config dialog', sinon.match({ clinicId: 'clinicID123', source: 'Tide dashboard' }));

      // Select 2 tags from select menu
      fireEvent.click(screen.getByTestId('mock-select-tags'));

      // Ensure period filter option set correctly
      const summaryPeriodOptions = dialog.querySelector('#period').querySelectorAll('label');
      expect(summaryPeriodOptions).to.have.lengthOf(4);

      expect(summaryPeriodOptions[1].textContent).to.equal('7 days');
      expect(summaryPeriodOptions[1].querySelector('input').value).to.equal('7d');

      expect(summaryPeriodOptions[3].textContent).to.equal('30 days');
      expect(summaryPeriodOptions[3].querySelector('input').value).to.equal('30d');
      expect(summaryPeriodOptions[3].querySelector('input').checked).to.be.true;

      fireEvent.click(summaryPeriodOptions[1].querySelector('input'));

      // Ensure period filter options present
      const lastDataFilterOptions = dialog.querySelector('#lastData').querySelectorAll('label');
      expect(lastDataFilterOptions).to.have.lengthOf(3);

      expect(lastDataFilterOptions[0].textContent).to.equal('Today');
      expect(lastDataFilterOptions[0].querySelector('input').value).to.equal('1');

      expect(lastDataFilterOptions[2].textContent).to.equal('Within 7 days');
      expect(lastDataFilterOptions[2].querySelector('input').value).to.equal('7');
      expect(lastDataFilterOptions[2].querySelector('input').checked).to.be.true;

      fireEvent.click(lastDataFilterOptions[0].querySelector('input'));

      // Submit the form
      const applyButton = dialog.querySelector('#configureTideDashboardConfirm');
      store.clearActions();
      defaultProps.trackMetric.resetHistory();
      fireEvent.click(applyButton);

      // Should redirect to the Tide dashboard after saving the dashboard opts to localStorage,
      // keyed to clinician|clinic IDs
      await waitFor(() => {
        expect(store.getActions()).to.eql([
          { type: 'FETCH_TIDE_DASHBOARD_PATIENTS_REQUEST' },
        ]);
      });

      sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show Tide Dashboard config dialog confirmed', sinon.match({ clinicId: 'clinicID123', source: 'Tide dashboard' }));

      expect(mockedLocalStorage.tideDashboardConfig?.['clinicianUserId123|clinicID123']).to.eql({
        period: '7d',
        lastData: '1',
        tags: [sampleTags[1].id, sampleTags[2].id],
      });
    });
  });
});
