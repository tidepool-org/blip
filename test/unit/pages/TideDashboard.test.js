import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import moment from 'moment-timezone';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import merge from 'lodash/merge';
import defaults from 'lodash/defaults';
import Table from '../../../app/components/elements/Table';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import TideDashboard from '../../../app/pages/dashboard/TideDashboard';
import Popover from '../../../app/components/elements/Popover';
import TideDashboardConfigForm from '../../../app/components/clinic/TideDashboardConfigForm';
import { clinicUIDetails } from '../../../app/core/clinicUtils';
import mockTideDashboardPatients from '../../fixtures/mockTideDashboardPatients.json';
import LDClientMock from '../../fixtures/LDClientMock';

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
const mockStore = configureStore([thunk]);

describe('TideDashboard', () => {
  let mount;

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

  before(() => {
    mount = createMount();
  });

  beforeEach(() => {
    TideDashboard.__Rewire__('useLDClient', sinon.stub().returns(new LDClientMock()));

    TideDashboard.__Rewire__('useFlags', sinon.stub().returns({
      showTideDashboard: true,
      showSummaryDashboard: true,
    }));
  });

  afterEach(() => {
    TideDashboard.__ResetDependency__('useLDClient');
    TideDashboard.__ResetDependency__('useFlags');
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
      working: {
        fetchingPatientFromClinic: defaultWorkingState,
        fetchingTideDashboardPatients: completedState,
        updatingClinicPatient: defaultWorkingState,
        fetchingPatientsForClinic: defaultWorkingState,
        settingClinicPatientLastReviewed: defaultWorkingState,
        revertingClinicPatientLastReviewed: defaultWorkingState,
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
        sendingPatientDexcomConnectRequest: defaultWorkingState,
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
    delete localStorage.tideDashboardConfig;
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.clinics.getPatientsForTideDashboard.resetHistory();
    defaultProps.api.clinics.updateClinicPatient.resetHistory();

    store = mockStore(hasResultsState);

    mockedLocalStorage = {
      tideDashboardConfig: {
        'clinicianUserId123|clinicID123': {
          period: '30d',
          lastData: 14,
          tags: sampleTags.map(({ id }) => id),
        },
      },
    };

    TideDashboard.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));
    TideDashboardConfigForm.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));
    TideDashboardConfigForm.__Rewire__('useLocation', sinon.stub().returns({ pathname: '/dashboard/tide' }));

    wrapper = mount(
      <Provider store={store}>
        <ToastProvider>
          <TideDashboard {...defaultProps} />
        </ToastProvider>
      </Provider>
    );
  });

  afterEach(() => {
    store.clearActions();
    TideDashboard.__ResetDependency__('useFlags');
    TideDashboard.__ResetDependency__('useLDClient');
    TideDashboard.__ResetDependency__('useLocalStorage');
    TideDashboardConfigForm.__ResetDependency__('useLocalStorage');
    TideDashboardConfigForm.__ResetDependency__('useLocation');
  });

  after(() => {
    mount.cleanUp();
  });

  context('on mount', () => {
    it('should redirect back to the clinic workspace if LD `entitlements.tideDashboard` is false ', () => {
      store = mockStore(tier0300ClinicState);
      store.clearActions();

      TideDashboard.__Rewire__('useLDClient', sinon.stub().returns(new LDClientMock({ clinic : {
        tier: 'tier0300'
      }})));

      TideDashboard.__Rewire__('useFlags', sinon.stub().returns({
        showTideDashboard: false,
      }));

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      expect(store.getActions()[2]).to.eql({
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

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      expect(store.getActions()[0]).to.eql({
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

      expect(store.getActions()[1]).to.eql({
        type: 'CLEAR_PATIENT_IN_VIEW',
      });
    });

    it('should open the config dialog if the configuration is not set', () => {
      store = mockStore(noResultsState);
      mockedLocalStorage = {};
      TideDashboard.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));
      TideDashboardConfigForm.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      const dialog = () => wrapper.find('Dialog#tideDashboardConfig');
      expect(dialog()).to.have.length(1);
      expect(dialog().props().open).to.be.true;
    });

    it('should open the config dialog if the configuration is invalid', () => {
      store = mockStore(noResultsState);
      mockedLocalStorage = {
        tideDashboardConfig: {
          'clinicianUserId123|clinicID123': {
            period: '30d',
            lastData: 14,
            tags: [], // invalid: no tags selected
          },
        },
      };
      TideDashboard.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));
      TideDashboardConfigForm.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      const dialog = () => wrapper.find('Dialog#tideDashboardConfig');
      expect(dialog()).to.have.length(1);
      expect(dialog().props().open).to.be.true;
    });

    it('should fetch dashboard results if the configuration is set', () => {
      store = mockStore(noResultsState);

      mockedLocalStorage = {
        tideDashboardConfig: {
          'clinicianUserId123|clinicID123': {
            period: '30d',
            lastData: 14,
            tags: sampleTags.map(({ id }) => id),
          },
        },
      };

      TideDashboard.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));
      TideDashboardConfigForm.__Rewire__('useLocalStorage', useLocalStorageRewire(mockedLocalStorage));

      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      const expectedAction = { type: 'FETCH_TIDE_DASHBOARD_PATIENTS_REQUEST' };
      expect(store.getActions()[2]).to.eql(expectedAction);
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
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );
    });

    it('should show empty table text', () => {
      const dashboardSections = wrapper.find('.dashboard-section');
      expect(dashboardSections.hostNodes()).to.have.length(1);
      const emptyTextNode = dashboardSections.at(1).find('#no-tide-results').hostNodes();
      expect(emptyTextNode).to.have.length(1);
      expect(emptyTextNode.text()).contains('To make sure your patients are tagged and you have set the correct patient filters, go to your Clinic Workspace.');
    });
  });

  context('has results', () => {
    beforeEach(() => {
      store = mockStore(hasResultsState);
      defaultProps.trackMetric.resetHistory();
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
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
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      const header = wrapper.find('#tide-dashboard-header').hostNodes();
      expect(header.text()).to.equal('TIDE Dashboard');

      const period = wrapper.find('#tide-dashboard-summary-period').hostNodes();
      expect(period.text()).contains('14 days');

      const lastData = wrapper.find('#tide-dashboard-last-data').hostNodes();
      expect(lastData.text()).contains('24 hours');
    });

    it('should render a heading and table for dashboard section, with correctly ordered results', () => {
      const dashboardSections = wrapper.find('.dashboard-section');
      expect(dashboardSections.hostNodes()).to.have.length(7);

      const dashboardSectionLabels = dashboardSections.find('.dashboard-section-label').hostNodes();
      expect(dashboardSectionLabels).to.have.length(7);
      expect(dashboardSectionLabels.at(0).text()).to.equal('Time below 54 mg/dL > 1%');
      expect(dashboardSectionLabels.at(1).text()).to.equal('Time below 70 mg/dL > 4%');
      expect(dashboardSectionLabels.at(2).text()).to.equal('Drop in Time in Range > 15%');
      expect(dashboardSectionLabels.at(3).text()).to.equal('Time in Range < 70%');
      expect(dashboardSectionLabels.at(4).text()).to.equal('CGM Wear Time < 70%');
      expect(dashboardSectionLabels.at(5).text()).to.equal('Meeting Targets');
      expect(dashboardSectionLabels.at(6).text()).to.equal('Data Issues');

      const dashboardSectionTables = dashboardSections.find('.dashboard-table').hostNodes();
      expect(dashboardSectionTables).to.have.length(7);

      const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables.at(tableIndex).find('tr').at(rowIndex);

      expect(dashboardSectionTables.at(0).find('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables.at(1).find('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables.at(2).find('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables.at(3).find('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables.at(4).find('tr')).to.have.length(4); // header row + 3 results
      expect(dashboardSectionTables.at(5).find('tr')).to.have.length(6); // header row + 5 results

      // Verify all columns on present on a sample patient from first table
      expect(getTableRow(0, 0).find('th').at(0).text()).contains('Patient Name');
      expect(getTableRow(0, 2).find('th').at(0).text()).contains('Charmane Fassman');

      expect(getTableRow(0, 0).find('th').at(1).text()).contains('Avg. Glucose');
      expect(getTableRow(0, 2).find('td').at(0).text()).contains('97');

      expect(getTableRow(0, 0).find('th').at(2).text()).contains('GMI');
      expect(getTableRow(0, 2).find('td').at(1).text()).contains('12.2 %');

      expect(getTableRow(0, 0).find('th').at(3).text()).contains('CGM Use');
      expect(getTableRow(0, 2).find('td').at(2).text()).contains('84 %');

      // Confirm first table is sorted appropriately
      expect(getTableRow(0, 0).find('th').at(4).text()).contains('% Time < 54');
      expect(getTableRow(0, 1).find('td').at(3).text()).contains('4 %');
      expect(getTableRow(0, 2).find('td').at(3).text()).contains('3 %');
      expect(getTableRow(0, 3).find('td').at(3).text()).contains('1 %');

      expect(getTableRow(0, 0).find('th').at(5).text()).contains('% Time 54-70');
      expect(getTableRow(0, 2).find('td').at(4).text()).contains('17 %');

      expect(getTableRow(0, 0).find('th').at(6).text()).contains('% TIR 70-180');
      expect(getTableRow(0, 2).find('td').at(5).text()).contains('71 %');

      expect(getTableRow(0, 0).find('th').at(7).text()).contains('% Time in Range');
      expect(getTableRow(0, 2).find('td').at(6).find('.range-summary-bars').hostNodes()).to.have.lengthOf(1);

      expect(getTableRow(0, 0).find('th').at(8).text()).contains('% Change in TIR');
      expect(getTableRow(0, 2).find('td').at(7).text()).contains('10.3');

      expect(getTableRow(0, 0).find('th').at(9).text()).contains('Tags');
      expect(getTableRow(0, 2).find('td').at(8).text()).contains('test tag 1');

      // Should contain a "more" menu that allows opening a patient edit dialog
      const moreMenuIcon = getTableRow(0, 2).find('td').at(9).find('PopoverMenu').find('Icon').at(0);
      const popoverMenu = () => wrapper.find(Popover).at(4);
      expect(popoverMenu().props().open).to.be.false;
      moreMenuIcon.simulate('click');
      expect(popoverMenu().props().open).to.be.true;

      const editButton = popoverMenu().find('Button[iconLabel="Edit Patient Information"]');
      expect(editButton).to.have.lengthOf(1);

      const dialog = () => wrapper.find('Dialog#editPatient');
      expect(dialog()).to.have.length(0);
      editButton.simulate('click');
      wrapper.update();
      expect(dialog()).to.have.length(1);
      expect(dialog().props().open).to.be.true;

      expect(defaultProps.trackMetric.calledWith('Clinic - Edit patient')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      // Confirm second table is sorted appropriately
      expect(getTableRow(1, 0).find('th').at(5).text()).contains('% Time 54-70');
      expect(getTableRow(1, 1).find('td').at(4).text()).contains('9 %');
      expect(getTableRow(1, 2).find('td').at(4).text()).contains('9 %');
      expect(getTableRow(1, 3).find('td').at(4).text()).contains('6 %');

      // Confirm third table is sorted appropriately
      expect(getTableRow(2, 0).find('th').at(8).text()).contains('% Change in TIR');
      expect(getTableRow(2, 1).find('td').at(7).text()).contains('26.3');
      expect(getTableRow(2, 2).find('td').at(7).text()).contains('24.5');
      expect(getTableRow(2, 3).find('td').at(7).text()).contains('24.3');

      // Confirm fourth table is sorted appropriately
      expect(getTableRow(3, 0).find('th').at(6).text()).contains('% TIR 70-180');
      expect(getTableRow(3, 1).find('td').at(5).text()).contains('42');
      expect(getTableRow(3, 2).find('td').at(5).text()).contains('42');
      expect(getTableRow(3, 3).find('td').at(5).text()).contains('48');

      // Confirm fifth table is sorted appropriately
      expect(getTableRow(4, 0).find('th').at(3).text()).contains('CGM Use');
      expect(getTableRow(4, 1).find('td').at(2).text()).contains('57');
      expect(getTableRow(4, 2).find('td').at(2).text()).contains('66');
      expect(getTableRow(4, 3).find('td').at(2).text()).contains('69');

      // Confirm sixth table is sorted appropriately
      expect(getTableRow(5, 0).find('th').at(4).text()).contains('% Time < 54');
      expect(getTableRow(5, 1).find('td').at(3).text()).contains('1 %');
      expect(getTableRow(5, 2).find('td').at(3).text()).contains('1 %');
      expect(getTableRow(5, 3).find('td').at(3).text()).contains('0.3 %');
      expect(getTableRow(5, 4).find('td').at(3).text()).contains('0.2 %');
      expect(getTableRow(5, 5).find('td').at(3).text()).contains('0.1 %');

      // Confirm sixth table is sorted appropriately
      expect(getTableRow(6, 0).find('th').at(2).text()).contains('Days Since Last Data');
      expect(getTableRow(6, 1).find('td').at(1).text()).contains('200');
      expect(getTableRow(6, 2).find('td').at(1).text()).contains('45');
      expect(getTableRow(6, 3).find('td').at(1).text()).contains('30');
      expect(getTableRow(6, 4).find('td').at(1).text()).contains('1');
      expect(getTableRow(6, 5).find('td').at(1).text()).contains('-');


      // Verify columns present on a sample patient from the data issues table
      expect(getTableRow(6, 0).find('th').at(0).text()).contains('Patient Name');
      expect(getTableRow(6, 1).find('th').at(0).text()).contains('Judah Stopforth');

      expect(getTableRow(6, 0).find('th').at(1).text()).contains('Dexcom Connection Status');
      expect(getTableRow(6, 1).find('td').at(0).text()).contains('Error Connecting');

      expect(getTableRow(6, 0).find('th').at(2).text()).contains('Days Since Last Data');
      expect(getTableRow(6, 1).find('td').at(1).text()).contains('200');
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
      wrapper = mount(
        <Provider store={store}>
          <ToastProvider>
            <TideDashboard {...defaultProps} />
          </ToastProvider>
        </Provider>
      );

      const dashboardSections = wrapper.find('.dashboard-section');
      expect(dashboardSections.hostNodes()).to.have.length(7);

      const emptyTextNode = dashboardSections.at(1).find('.table-empty-text').hostNodes();
      expect(emptyTextNode).to.have.length(1);
      expect(emptyTextNode.text()).contains('There are no patients that match your filter criteria.');
    });

    it('should link to a patient data trends view when patient name is clicked', () => {
      const dashboardSections = wrapper.find('.dashboard-section');
      const dashboardSectionTables = dashboardSections.find('.dashboard-table').hostNodes();
      const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables.at(tableIndex).find('tr').at(rowIndex);

      const firstPatientName = getTableRow(0, 2).find('span').at(0).hostNodes();
      expect(firstPatientName.text()).contains('Charmane Fassman');
      const expectedPatientId = '6da2c016-263b-92db-1c3e-11ed92f5be4b';

      store.clearActions();
      firstPatientName.simulate('click');

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: [`/patients/${expectedPatientId}/data?chart=trends&dashboard=tide`]}
        },
      ]);
    });

    context('mmol/L preferredBgUnits', () => {
      beforeEach(() => {
        store = mockStore(hasResultsStateMmoll);

        wrapper = mount(
          <Provider store={store}>
            <ToastProvider>
              <TideDashboard {...defaultProps} />
            </ToastProvider>
          </Provider>
        );

        defaultProps.trackMetric.resetHistory();
      });

      it('should show the bgm average glucose in mmol/L units', () => {
        const dashboardSections = wrapper.find('.dashboard-section');
        const dashboardSectionTables = dashboardSections.find('.dashboard-table').hostNodes();
        const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables.at(tableIndex).find('tr').at(rowIndex);

        expect(getTableRow(0, 0).find('th').at(1).text()).contains('Avg. Glucose');
        expect(getTableRow(0, 2).find('td').at(0).text()).contains('5.4');
      });

      it('should show table headings mmol/L units', () => {
        const dashboardSections = wrapper.find('.dashboard-section');
        expect(dashboardSections.hostNodes()).to.have.length(7);

        const dashboardSectionLabels = dashboardSections.find('.dashboard-section-label').hostNodes();
        expect(dashboardSectionLabels).to.have.length(7);
        expect(dashboardSectionLabels.at(0).text()).to.equal('Time below 3.0 mmol/L > 1%');
        expect(dashboardSectionLabels.at(1).text()).to.equal('Time below 3.9 mmol/L > 4%');

        const dashboardSectionTables = dashboardSections.find('.dashboard-table').hostNodes();
        const getTableRow = (tableIndex, rowIndex) => dashboardSectionTables.at(tableIndex).find('tr').at(rowIndex);

        // Confirm first table is sorted appropriately
        expect(getTableRow(0, 0).find('th').at(4).text()).contains('% Time < 3.0');
        expect(getTableRow(0, 1).find('td').at(3).text()).contains('4 %');
        expect(getTableRow(0, 2).find('td').at(3).text()).contains('3 %');
        expect(getTableRow(0, 3).find('td').at(3).text()).contains('1 %');

        expect(getTableRow(0, 0).find('th').at(5).text()).contains('% Time 3.0-3.9');
        expect(getTableRow(0, 2).find('td').at(4).text()).contains('17 %');
      });
    });

    describe('Managing patient last reviewed dates', () => {
      context('showSummaryDashboardLastReviewed flag is true', () => {
        beforeEach(() => {
          store = mockStore(hasResultsState);

          TideDashboard.__Rewire__('useFlags', sinon.stub().returns({
            showTideDashboardLastReviewed: true,
          }));

          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <TideDashboard {...defaultProps} />
              </ToastProvider>
            </Provider>
          );
        });

        afterEach(() => {
          TideDashboard.__ResetDependency__('useFlags');
        });

        it('should render the Last Reviewed column', () => {
          const lastReviewedHeader = wrapper.find('#dashboard-table-meetingTargets-header-lastReviewed').hostNodes();
          expect(lastReviewedHeader).to.have.length(1);

          const table = wrapper.find('table#dashboard-table-meetingTargets');
          const rows = table.find('tbody tr');
          const lastReviewData = row => rows.at(row).find('.MuiTableCell-root').at(10);

          expect(lastReviewData(4).text()).to.contain('Today');
          expect(lastReviewData(1).text()).to.contain('Yesterday');
          expect(lastReviewData(2).text()).to.contain('30 days ago');
          expect(lastReviewData(3).text()).to.contain('2024-03-05');
        });

        it('should allow setting last reviewed date', done => {
          const table = wrapper.find('table#dashboard-table-meetingTargets');
          const rows = table.find('tbody tr');
          const lastReviewData = row => rows.at(row).find('.MuiTableCell-root').at(10);
          const updateButton = () =>lastReviewData(1).find('button');

          expect(lastReviewData(1).text()).to.contain('Yesterday');
          expect(updateButton().text()).to.equal('Mark Reviewed');

          store.clearActions();
          updateButton().simulate('click');
          setTimeout(() => {
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Mark patient reviewed', sinon.match({ clinicId: 'clinicID123', source: 'TIDE dashboard' }));

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

            done();
          });
        });

        it('should allow undoing last reviewed date', done => {
          const table = wrapper.find('table#dashboard-table-meetingTargets');
          const rows = table.find('tbody tr');
          const lastReviewData = row => rows.at(row).find('.MuiTableCell-root').at(10);
          const updateButton = () =>lastReviewData(4).find('button');

          expect(lastReviewData(4).text()).to.contain('Today');
          expect(updateButton().text()).to.equal('Undo');

          store.clearActions();
          updateButton().simulate('click');
          setTimeout(() => {
            sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Undo mark patient reviewed', sinon.match({ clinicId: 'clinicID123', source: 'TIDE dashboard' }));

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

            done();
          });
        });

        it('should not render the Last Reviewed column if showSummaryData flag is false', () => {
          TideDashboard.__Rewire__('useFlags', sinon.stub().returns({
            showSummaryData: false,
          }));

          store = mockStore(hasResultsState);
          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <TideDashboard {...defaultProps} />
              </ToastProvider>
            </Provider>
          );

          const lastReviewedHeader = wrapper.find('#dashboard-table-meetingTargets-header-lastReviewed').hostNodes();
          expect(lastReviewedHeader).to.have.length(0);

          TideDashboard.__ResetDependency__('useFlags');
        });
      });

      context('showSummaryDashboardLastReviewed flag is false', () => {
        beforeEach(() => {
          TideDashboard.__Rewire__('useFlags', sinon.stub().returns({
            showSummaryDashboardLastReviewed: false,
          }));
        });

        afterEach(() => {
          TideDashboard.__ResetDependency__('useFlags');
        });

        it('should not show the Last Reviewed column, even if clinic tier >= tier0300', () => {
          store = mockStore(tier0300ClinicState);
          wrapper = mount(
            <Provider store={store}>
              <ToastProvider>
                <TideDashboard {...defaultProps} />
              </ToastProvider>
            </Provider>
          );

          const lastReviewedHeader = wrapper.find('#dashboard-table-meetingTargets-header-lastReviewed').hostNodes();
          expect(lastReviewedHeader).to.have.length(0);
        });
      });
    });
  });

  describe('Updating dashboard config', () => {
    it('should open a modal to update the dashboard, with the current config from localStorage as a starting point', done => {
      const tideDashboardButton = wrapper.find('#update-dashboard-config').hostNodes();
      expect(tideDashboardButton).to.have.length(1);

      const dialog = () => wrapper.find('Dialog#tideDashboardConfig');

      // Open dashboard config popover
      expect(dialog()).to.have.length(0);
      tideDashboardButton.simulate('click');
      wrapper.update();
      expect(dialog()).to.have.length(1);
      expect(dialog().props().open).to.be.true;
      sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show Tide Dashboard config dialog', sinon.match({ clinicId: 'clinicID123', source: 'Tide dashboard' }));

      // Ensure tag options present
      const tags = dialog().find('.tag-text').hostNodes();
      expect(tags).to.have.lengthOf(3);
      expect(tags.at(0).text()).to.equal('test tag 1');
      expect(tags.at(1).text()).to.equal('test tag 2');
      expect(tags.at(2).text()).to.equal('test tag 3');

      // All tags initially selected
      const selectedTags = () => dialog().find('.tag-text.selected').hostNodes();
      expect(selectedTags()).to.have.length(3);

      // Apply button disabled until tag, upload date, and report period selections made
      tags.at(0).hostNodes().simulate('click');

      // Tags should now be selected
      expect(selectedTags()).to.have.lengthOf(2);
      expect(selectedTags().at(0).text()).to.equal('test tag 2');
      expect(selectedTags().at(1).text()).to.equal('test tag 3');

      // Ensure period filter option set correctly
      const summaryPeriodOptions = dialog().find('#period').find('label').hostNodes();
      expect(summaryPeriodOptions).to.have.lengthOf(4);

      expect(summaryPeriodOptions.at(1).text()).to.equal('7 days');
      expect(summaryPeriodOptions.at(1).find('input').props().value).to.equal('7d');

      expect(summaryPeriodOptions.at(3).text()).to.equal('30 days');
      expect(summaryPeriodOptions.at(3).find('input').props().value).to.equal('30d');
      expect(summaryPeriodOptions.at(3).find('input').props().checked).to.be.true;

      summaryPeriodOptions.at(3).find('input').last().simulate('change', { target: { name: 'period', value: '7d' } });

      // Ensure period filter options present
      const lastDataFilterOptions = dialog().find('#lastData').find('label').hostNodes();
      expect(lastDataFilterOptions).to.have.lengthOf(5);

      expect(lastDataFilterOptions.at(0).text()).to.equal('Within 24 hours');
      expect(lastDataFilterOptions.at(0).find('input').props().value).to.equal('1');

      expect(lastDataFilterOptions.at(3).text()).to.equal('Within 14 days');
      expect(lastDataFilterOptions.at(3).find('input').props().value).to.equal('14');
      expect(lastDataFilterOptions.at(3).find('input').props().checked).to.be.true;

      lastDataFilterOptions.at(0).find('input').last().simulate('change', { target: { name: 'lastData', value: 1 } });

      // Submit the form
      const applyButton = () => dialog().find('#configureTideDashboardConfirm').hostNodes();
      store.clearActions();
      defaultProps.trackMetric.resetHistory();
      applyButton().simulate('click');

      // Should redirect to the Tide dashboard after saving the dashboard opts to localStorage,
      // keyed to clinician|clinic IDs
      setTimeout(() => {
        expect(store.getActions()).to.eql([
          { type: 'FETCH_TIDE_DASHBOARD_PATIENTS_REQUEST' },
        ]);

        sinon.assert.calledWith(defaultProps.trackMetric, 'Clinic - Show Tide Dashboard config dialog confirmed', sinon.match({ clinicId: 'clinicID123', source: 'Tide dashboard' }));

        expect(mockedLocalStorage.tideDashboardConfig?.['clinicianUserId123|clinicID123']).to.eql({
          period: '7d',
          lastData: 1,
          tags: [sampleTags[1].id, sampleTags[2].id],
        });

        done();
      });
    });
  });
});
