/* global jest, before, beforeEach, afterEach, test, expect, describe, it */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import moment from 'moment';
import api from '../../../../../app/core/api';
import { URL_TIDEPOOL_PLUS_PLANS } from '../../../../../app/core/constants';

import { ToastProvider } from '@app/providers/ToastProvider';
import { clinicUIDetails } from '@app/core/clinicUtils';
import ClinicPatients from '@app/pages/clinicworkspace/ClinicPatients';

import mockLocalStorage from '../../../../utils/mockLocalStorage';

import { useLDClient, useFlags } from 'launchdarkly-react-client-sdk';
jest.mock('launchdarkly-react-client-sdk');

const TEST_TIMEOUT_MS = 30_000;

describe('ClinicPatients', ()  => {
  const today = moment().toISOString();
  const yesterday = moment(today).subtract(1, 'day').toISOString();

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

  const defaultFetchOptions = { limit: 50, offset: 0, period: '14d', sortType: 'cgm' };

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
      },
      patientListFilters: {
        patientListSearchTextInput: '',
        isPatientListVisible: true,
      },
    },
  };

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
    },
  });

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
            { id: 'tag1', name: 'test tag 1'},
          ],
          sites: [
            { id: 'site-1-id', name: 'Site Alpha' },
            { id: 'site-2-id', name: 'Site Bravo' },
            { id: 'site-3-id', name: 'Site Charlie' },
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
              sites: [],
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
              sites: [{ id: 'site-1-id', name: 'Site Alpha'}],
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
                    lastData: moment(today).subtract(1, 'day').toISOString(),
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
              sites: [],
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
                    lastData: moment(today).subtract(30, 'days').toISOString(),
                  },
                  periods: { '14d': {
                    timeCGMUsePercent: 0.69,
                    timeCGMUseMinutes:  7 * 24 * 60,
                    glucoseManagementIndicator: 8.5,
                  } },
                },
              },
              tags: [],
              sites: [],
              reviews: [{ clinicianId: 'clinicianUserId123', time: moment('2024-03-05T12:00:00.000Z').toISOString() }],
            },
            patient5: {
              id: 'patient5',
              email: 'patient5@test.ca',
              fullName: 'Patient Five',
              birthDate: '1999-05-05',
              mrn: 'mrn101',
              tags: [],
              sites: [],
              summary: {
                cgmStats: {
                  dates: {
                    lastData: moment(today).subtract(31, 'days').toISOString(),
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

  let defaultProps = {
    trackMetric: jest.fn(),
    t: jest.fn(),
    searchDebounceMs: 0,
    api: {
      clinics: {
        getPatientFromClinic: jest.fn(),
        getPatientsForClinic: jest.fn(),
        deletePatientFromClinic: jest.fn(),
        createClinicCustodialAccount: jest.fn(),
        updateClinicPatient: jest.fn(),
        sendPatientUploadReminder: jest.fn(),
        sendPatientDataProviderConnectRequest: jest.fn(),
        createClinicPatientTag: jest.fn(),
        updateClinicPatientTag: jest.fn(),
        deleteClinicPatientTag: jest.fn(),
        deleteClinicPatientTag: jest.fn(),
        getPatientsForRpmReport: jest.fn(),
        setClinicPatientLastReviewed: jest.fn(),
        revertClinicPatientLastReviewed: jest.fn(),
        createClinicSite: jest.fn(),
        updateClinicSite: jest.fn(),
        deleteClinicSite: jest.fn(),
      },
    },
  };

  const mockStore = configureStore([thunk]);
  let store;

  const MockedProviderWrappers = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace']}>
        <Switch>
          <Route path='/clinic-workspace'>
            <ToastProvider>
              {children}
            </ToastProvider>
          </Route>
        </Switch>
      </MemoryRouter>
    </Provider>
  );

  beforeEach(() => {
    useFlags.mockReturnValue({
      showSummaryDashboard: true,
      showSummaryDashboardLastReviewed: true,
      showExtremeHigh: false,
    });

    useLDClient.mockReturnValue({
      getContext: jest.fn(() => ({
        clinic: { tier: 'tier0300' },
      })),
    });

    defaultProps.trackMetric.mockClear();
    defaultProps.api.clinics.getPatientFromClinic.mockClear();
    defaultProps.api.clinics.getPatientsForClinic.mockClear();
    defaultProps.api.clinics.deletePatientFromClinic.mockClear();
    defaultProps.api.clinics.createClinicCustodialAccount.mockClear();
    defaultProps.api.clinics.updateClinicPatient.mockClear();
    defaultProps.api.clinics.sendPatientUploadReminder.mockClear();
    defaultProps.api.clinics.sendPatientDataProviderConnectRequest.mockClear();
    defaultProps.api.clinics.createClinicPatientTag.mockClear();
    defaultProps.api.clinics.updateClinicPatientTag.mockClear();
    defaultProps.api.clinics.deleteClinicPatientTag.mockClear();
    defaultProps.api.clinics.deleteClinicPatientTag.mockClear();
    defaultProps.api.clinics.getPatientsForRpmReport.mockClear();
    defaultProps.api.clinics.setClinicPatientLastReviewed.mockClear();
    defaultProps.api.clinics.revertClinicPatientLastReviewed.mockClear();
    defaultProps.api.clinics.createClinicSite.mockClear();
    defaultProps.api.clinics.updateClinicSite.mockClear();
    defaultProps.api.clinics.deleteClinicSite.mockClear();
  });

  describe('on mount', () => {
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

      render(
        <MockedProviderWrappers store={store}>
          <ClinicPatients {...defaultProps} />
        </MockedProviderWrappers>
      );

      expect(store.getActions()).toStrictEqual([]);
    }, TEST_TIMEOUT_MS);

    it('should fetch patients for clinic', () => {
      store = mockStore(hasPatientsState);

      render(
        <MockedProviderWrappers store={store}>
          <ClinicPatients {...defaultProps} />
        </MockedProviderWrappers>
      );

      const expectedActions = [
        { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
      ];
      expect(store.getActions()).toStrictEqual(expectedActions);
    }, TEST_TIMEOUT_MS);

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

      render(
        <MockedProviderWrappers store={store}>
          <ClinicPatients {...defaultProps} />
        </MockedProviderWrappers>
      );

      const expectedActions = [
        { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
      ];
      expect(store.getActions()).toStrictEqual(expectedActions);
    }, TEST_TIMEOUT_MS);
  });

  describe('patients hidden', () => {
    beforeEach(() => {
      const initialState = {
        blip: {
          ...hasPatientsState.blip,
          patientListFilters: { isPatientListVisible: false, patientListSearchTextInput: '' },
        },
      };

      store = mockStore(initialState);
    });

    it('should render a button that toggles patients to be visible', async () => {
      render(
        <MockedProviderWrappers>
          <ClinicPatients {...defaultProps} />
        </MockedProviderWrappers>
      );

      store.clearActions();

      await userEvent.click(screen.getByText(/Show All/));
      expect(store.getActions()).toStrictEqual([{ type: 'SET_IS_PATIENT_LIST_VISIBLE', payload: { isVisible: true } }])
    }, TEST_TIMEOUT_MS);
  });

  describe('no patients', () => {
    beforeEach(() => {
      store = mockStore(noPatientsState);
    });

    it('should render an empty table', () => {
      render(
        <MockedProviderWrappers>
          <ClinicPatients {...defaultProps} />
        </MockedProviderWrappers>
      );

      expect(screen.getByText('There are no results to show')).toBeInTheDocument();
      expect(screen.queryByTestId('filter-reset-bar')).not.toBeInTheDocument();
    }, TEST_TIMEOUT_MS);

    it('should open a modal for adding a new patient', async () => {
      store = mockStore(noPatientsState);
      render(
        <MockedProviderWrappers>
          <ClinicPatients {...defaultProps} />
        </MockedProviderWrappers>
      );

      // Open the modal. The modal title should exist.
      expect(screen.queryByText('Add New Patient Account')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /Add New Patient/}));
      expect(screen.getByText('Add New Patient Account')).toBeInTheDocument();

      expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Add patient', { 'clinicId': 'clinicID123' });
      expect(defaultProps.trackMetric).toHaveBeenCalledTimes(1);

      // Fill in the Pwd's demographic info
      await userEvent.click(screen.getByRole('textbox', { name: 'Full Name' }));
      await userEvent.paste('Vasily Lomachenko');

      await userEvent.click(screen.getByRole('textbox', { name: 'Birthdate' }));
      await userEvent.paste('11/21/1999');

      await userEvent.click(screen.getByRole('textbox', { name: 'MRN (optional)' }));
      await userEvent.paste('123456');

      await userEvent.click(screen.getByRole('textbox', { name: 'Email (optional)' }));
      await userEvent.paste('patient@test.ca');

      store.clearActions();

      // Submit the form. Pwd should be created.
      await userEvent.click(screen.getByRole('button', { name: /Add Patient/ }));

      await waitFor(() => expect(defaultProps.api.clinics.createClinicCustodialAccount).toHaveBeenCalled());

      expect(defaultProps.api.clinics.createClinicCustodialAccount).toHaveBeenCalledWith(
        'clinicID123', // clinicId,
          {
            fullName: 'Vasily Lomachenko',
            birthDate: '1999-11-21',
            mrn: '123456',
            email: 'patient@test.ca',
            tags: [],
          },
        expect.any(Function), // callback fn passed to api
      );

      expect(store.getActions()[0]).toStrictEqual({
        type: 'CREATE_CLINIC_CUSTODIAL_ACCOUNT_REQUEST',
      });
    }, TEST_TIMEOUT_MS);
  });

  it('should prevent adding a new patient with an invalid Date of Birth', async () => {
    store = mockStore(noPatientsState);
    render(
      <MockedProviderWrappers>
        <ClinicPatients {...defaultProps} />
      </MockedProviderWrappers>
    );

    await userEvent.click(screen.getByRole('button', { name: /Add New Patient/}));

    // Fill in the Pwd's demographic info
    const nameField = screen.getByRole('textbox', { name: 'Full Name' });
    const dobField = screen.getByRole('textbox', { name: 'Birthdate' });
    const mrnField = screen.getByRole('textbox', { name: 'MRN (optional)' });
    const emailField = screen.getByRole('textbox', { name: 'Email (optional)' });
    const submitButton = screen.getByRole('button', { name: /Add Patient/ });

    // Input valid values into all fields; submit button should be enabled
    await userEvent.click(nameField);
    await userEvent.paste('Vasily Lomachenko');

    await userEvent.click(dobField);
    await userEvent.paste('11/21/1999');

    await userEvent.click(mrnField);
    await userEvent.paste('123456');

    await userEvent.click(emailField);
    await userEvent.paste('patient@test.ca');
    expect(submitButton).toBeEnabled();

    // Disabled after invalid DOB
    await userEvent.click(dobField);
    await userEvent.clear(dobField);
    await userEvent.paste('13/21/1999');

    expect(submitButton).toBeDisabled();

    // Re-entering valid DOB should re-enable it
    await userEvent.clear(dobField);
    await userEvent.paste('09/21/1999');

    expect(submitButton).toBeEnabled();
  }, TEST_TIMEOUT_MS);

  it('should prevent adding a new patient without an MRN if MRN required by the clinic', async () => {
    store = mockStore(mrnRequiredState);
    render(
      <MockedProviderWrappers>
        <ClinicPatients {...defaultProps} />
      </MockedProviderWrappers>
    );

    await userEvent.click(screen.getByRole('button', { name: /Add New Patient/}));

    // Fill in the Pwd's demographic info
    const nameField = screen.getByRole('textbox', { name: 'Full Name' });
    const dobField = screen.getByRole('textbox', { name: 'Birthdate' });
    const mrnField = screen.getByRole('textbox', { name: 'MRN' }); // Missing "(optional)" copy
    const emailField = screen.getByRole('textbox', { name: 'Email (optional)' });
    const submitButton = screen.getByRole('button', { name: /Add Patient/ });

    // Enter valid values into all fields except leaving MRN blank; submit button is disabled
    await userEvent.click(nameField);
    await userEvent.paste('Vasily Lomachenko');

    await userEvent.click(dobField);
    await userEvent.paste('11/21/1999');

    await userEvent.click(emailField);
    await userEvent.paste('patient@test.ca');

    expect(submitButton).toBeDisabled();

    // Entering an MRN enables the submit button
    await userEvent.click(mrnField);
    await userEvent.paste('A1234');

    expect(submitButton).toBeEnabled();

    // Entering an MRN over char limit disables the submit button
    await userEvent.click(mrnField);
    await userEvent.paste('1234567890123456789012345677890');
    expect(screen.getByText('Maximum length: 25 characters')).toBeInTheDocument();

    expect(submitButton).toBeDisabled();
  }, TEST_TIMEOUT_MS);

  it('should prevent adding a new patient with an MRN already in use', async () => {
    store = mockStore(hasPatientsState);
    render(
      <MockedProviderWrappers>
        <ClinicPatients {...defaultProps} />
      </MockedProviderWrappers>
    );

    await userEvent.click(screen.getByRole('button', { name: /Add New Patient/}));

    // Fill in the Pwd's demographic info
    const nameField = screen.getByRole('textbox', { name: 'Full Name' });
    const dobField = screen.getByRole('textbox', { name: 'Birthdate' });
    const mrnField = screen.getByRole('textbox', { name: 'MRN (optional)' }); // Missing "(optional)" copy
    const emailField = screen.getByRole('textbox', { name: 'Email (optional)' });
    const submitButton = screen.getByRole('button', { name: /Add Patient/ });

    // Enter valid values into all fields but an already-in-use MRN. Submit should be disabled
    await userEvent.click(nameField);
    await userEvent.paste('Vasily Lomachenko');

    await userEvent.click(dobField);
    await userEvent.paste('11/21/1999');

    await userEvent.click(mrnField);
    await userEvent.paste('MRN123');

    await userEvent.click(emailField);
    await userEvent.paste('patient@test.ca');

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('This MRN is already in use. Please enter a valid MRN.')).toBeInTheDocument();

    // Changing the MRN re-enables the submit button
    await userEvent.click(mrnField);
    await userEvent.clear(mrnField);
    await userEvent.paste('MRN12345');

    expect(submitButton).toBeEnabled();
  }, TEST_TIMEOUT_MS);

  it('should prevent adding a new patient with an invalid MRN', async () => {
    store = mockStore(noPatientsState);
    render(
      <MockedProviderWrappers>
        <ClinicPatients {...defaultProps} />
      </MockedProviderWrappers>
    );

    await userEvent.click(screen.getByRole('button', { name: /Add New Patient/}));

    // Fill in the Pwd's demographic info
    const nameField = screen.getByRole('textbox', { name: 'Full Name' });
    const dobField = screen.getByRole('textbox', { name: 'Birthdate' });
    const mrnField = screen.getByRole('textbox', { name: 'MRN (optional)' });
    const emailField = screen.getByRole('textbox', { name: 'Email (optional)' });
    const submitButton = screen.getByRole('button', { name: /Add Patient/ });

    // All fields valid; should be enabled
    await userEvent.click(nameField);
    await userEvent.paste('Vasily Lomachenko');

    await userEvent.click(dobField);
    await userEvent.paste('11/21/1999');

    await userEvent.click(mrnField);
    await userEvent.paste('123456');

    await userEvent.click(emailField);
    await userEvent.paste('patient@test.ca');

    expect(submitButton).toBeEnabled();

    // Disabled after invalid MRN
    await userEvent.click(mrnField);
    await userEvent.clear(mrnField);
    await userEvent.paste('MRN876THISWILLEXCEEDTHELENGTHLIMIT');

    expect(submitButton).toBeDisabled();

    // Re-entering valid MRN should re-enable it
    await userEvent.clear(mrnField);
    await userEvent.paste('MRN8768934');

    expect(submitButton).toBeEnabled();
  }, TEST_TIMEOUT_MS);

  describe('has patients but none matching filter criteria', () => {
    const noPatientsButWithFiltersState = merge({}, noPatientsState, {
      blip: {
        patientListFilters: {
          patientListSearchTextInput: 'CantMatchThis',
        },
      },
    });

    describe('when Reset Filters button is clicked', () => {
      it('should show the No Results text and reset filters', async () => {
        mockLocalStorage({
          'activePatientFilters/clinicianUserId123/clinicID123': JSON.stringify({
            timeInRange: ['timeInLowPercent'],
            patientTags: [],
            clinicSites: [],
            meetsGlycemicTargets: false,
          }),
        });

        store = mockStore(noPatientsButWithFiltersState);

        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Header should be visible. Should indicate there are no results
        expect(screen.getByTestId('clinic-patients-header')).toBeInTheDocument();
        expect(screen.getByText('There are no results to show')).toBeInTheDocument();


        // Clicking "Reset Filters" should reset the filters in localStorage
        await userEvent.click(
          within(screen.getByTestId('clinic-patients-people-table'))
                       .getByRole('button', { name: /Reset Filters/ })
        );

        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          'activePatientFilters/clinicianUserId123/clinicID123',
           JSON.stringify({
            timeCGMUsePercent: null,
            lastData: null,
            lastDataType: null,
            timeInRange :[],
            meetsGlycemicTargets:true,
            patientTags: [],
            clinicSites: [],
          }),
        );
      });
    });

    describe('when Clear Search button is clicked', () => {
      it('should clear the search input text in Redux', async () => {
        store = mockStore(noPatientsButWithFiltersState);

        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Header should be visible. Should indicate there are no results
        expect(screen.getByTestId('clinic-patients-header')).toBeInTheDocument();
        expect(screen.getByText('There are no results to show')).toBeInTheDocument();

        store.clearActions();

        // Clicking "Clear Search" should clear the serach in redux
        await userEvent.click(
          within(screen.getByTestId('clinic-patients-people-table'))
                       .getByRole('button', { name: /Clear Search/ })
        );

        await waitFor(() =>
          expect(store.getActions()).toStrictEqual([
            { type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT', payload: { textInput: '' } },
            { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
          ])
        );
      });
    });
  });

  describe('has patients', () => {
    describe('showNames', () => {
      it('should show data for each person', async () => {
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Should show data for patients
        expect(screen.getByText('Patient One')).toBeInTheDocument();
        expect(screen.getByText('DOB: 1999-01-01')).toBeInTheDocument();
        expect(screen.getByText('Patient Two')).toBeInTheDocument();
        expect(screen.getByText('DOB: 1999-02-02')).toBeInTheDocument();

        // Should not show peopletable instructions
        expect(screen.queryByTestId('clinic-patients-people-table-instructions')).not.toBeInTheDocument();

        // Should fire trackmetric when toggling hide/show
        await userEvent.click(screen.getByTestId('clinic-patients-view-toggle-icon'));
        expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Hide all icon', { clinicId: 'clinicID123' });
      });
    });

    describe('show names clicked', () => {
      it('should allow searching patients', async () => {
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        store.clearActions();

        // Click on the input, then type "Two". An action should be dispatched to Redux and API request should be made.
        await userEvent.click(screen.getByPlaceholderText('Search'));
        await userEvent.paste('Two');

        await waitFor(() =>
          expect(store.getActions()).toStrictEqual([
            { type: 'SET_PATIENT_LIST_SEARCH_TEXT_INPUT', payload: { textInput: 'Two' } },
            { type: 'FETCH_PATIENTS_FOR_CLINIC_REQUEST' },
          ])
        );

        expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
          'clinicID123',
          { ...defaultFetchOptions, search: 'Two', sort: '+fullName' },
          expect.any(Function)
        );
      });

      it('should link to a patient data view when patient demographic details are clicked', async () => {
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        store.clearActions();
        expect(store.getActions()).toStrictEqual([]);

        // Clicking on a pwd name should navigate to the pwd
        await userEvent.click(screen.getByText('Patient One'));

        expect(store.getActions()).toStrictEqual([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data'] },
          },
        ]);

        store.clearActions();
        expect(store.getActions()).toStrictEqual([]);

        // Clicking on a pwd birthday should navigate to the pwd
        await userEvent.click(screen.getByText('DOB: 1999-01-01'));

        expect(store.getActions()).toStrictEqual([
          {
            type: '@@router/CALL_HISTORY_METHOD',
            payload: { method: 'push', args: ['/patients/patient1/data'] },
          },
        ]);
      });

      it('should display menu when "More" icon is clicked', async () => {
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Dropdown buttons should not exist
        expect(screen.queryByRole('button', { name: /Edit Patient Information/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Bring Data into Tidepool/})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Remove Patient/})).not.toBeInTheDocument();

        // Dropdown buttons should appear after dropdown clicked
        await userEvent.click(screen.getByTestId('action-menu-patient1-icon'));
        expect(screen.getByRole('button', { name: /Edit Patient Information/})).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Bring Data into Tidepool/})).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Remove Patient/})).toBeInTheDocument();
      });

      it('should open a modal for patient editing when edit link is clicked', async () => {
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Modal title should not be present
        expect(screen.queryByText('Edit Patient Details')).not.toBeInTheDocument();

        // Modal title should be present after clicking "Edit Patient Information"
        await userEvent.click(screen.getByTestId('action-menu-patient2-icon'));
        await userEvent.click(screen.getByRole('button', { name: /Edit Patient Information/}));
        expect(screen.getByText('Edit Patient Details')).toBeInTheDocument();
        expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Edit patient', { clinicId: 'clinicID123', source: 'action menu' });
        expect(defaultProps.trackMetric).toHaveBeenCalledTimes(1);

        // Edit the Pwd's demographic info
        const nameField = screen.getByRole('textbox', { name: 'Full Name' });
        const dobField = screen.getByRole('textbox', { name: 'Birthdate' });
        const mrnField = screen.getByRole('textbox', { name: 'MRN (optional)' });
        const emailField = screen.getByRole('textbox', { name: 'Email (optional)' });

        expect(nameField).toHaveValue('Patient Two');
        await userEvent.click(nameField);
        await userEvent.clear(nameField);
        await userEvent.paste('Patient 2');
        expect(nameField).toHaveValue('Patient 2');

        expect(dobField).toHaveValue('02/02/1999');
        await userEvent.click(dobField);
        await userEvent.clear(dobField);
        await userEvent.paste('01/01/1999');
        expect(dobField).toHaveValue('01/01/1999');

        expect(mrnField).toHaveValue('MRN123');
        await userEvent.click(mrnField);
        await userEvent.clear(mrnField);
        await userEvent.paste('MRN456');
        expect(mrnField).toHaveValue('MRN456');

        expect(emailField).toHaveValue('patient2@test.ca');
        await userEvent.click(emailField);
        await userEvent.clear(emailField);
        await userEvent.paste('patient-two@test.ca');
        expect(emailField).toHaveValue('patient-two@test.ca');

        store.clearActions();

        await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

        await waitFor(() => expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalled());

        expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalledWith(
          'clinicID123', // clinicId,
          'patient2', // patientId,
          {
            fullName: 'Patient 2',
            birthDate: '1999-01-01',
            mrn: 'MRN456',
            id: 'patient2',
            email: 'patient-two@test.ca',
            permissions: { custodian: {} },
            tags: [],
          },
          expect.any(Function), // callback fn passed to api
        );
      });

      it('should disable email editing for non-custodial patients', async () => {
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Modal title should not be present
        expect(screen.queryByText('Edit Patient Details')).not.toBeInTheDocument();

        // Modal title should be present after clicking "Edit Patient Information"
        await userEvent.click(screen.getByTestId('action-menu-patient1-icon'));
        await userEvent.click(screen.getByRole('button', { name: /Edit Patient Information/}));
        expect(screen.getByText('Edit Patient Details')).toBeInTheDocument();
        expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Edit patient', { clinicId: 'clinicID123', source: 'action menu' });
        expect(defaultProps.trackMetric).toHaveBeenCalledTimes(1);

        // Edit the Pwd's demographic info
        const nameField = screen.getByRole('textbox', { name: 'Full Name' });
        const dobField = screen.getByRole('textbox', { name: 'Birthdate' });
        const mrnField = screen.getByRole('textbox', { name: 'MRN (optional)' });
        const emailField = screen.getByRole('textbox', { name: 'Email (optional)' });

        expect(nameField).toHaveValue('Patient One');
        await userEvent.click(nameField);
        await userEvent.clear(nameField);
        await userEvent.paste('Patient 3');
        expect(nameField).toHaveValue('Patient 3');

        expect(dobField).toHaveValue('01/01/1999');
        await userEvent.click(dobField);
        await userEvent.clear(dobField);
        await userEvent.paste('03/03/1999');
        expect(dobField).toHaveValue('03/03/1999');

        expect(mrnField).toHaveValue('');
        await userEvent.click(mrnField);
        await userEvent.clear(mrnField);
        await userEvent.paste('mrn456');
        expect(mrnField).toHaveValue('MRN456'); // capitalizes

        expect(emailField).toHaveValue('patient1@test.ca');
        expect(emailField).toBeDisabled();

        store.clearActions();

        await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

        await waitFor(() => expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalled());

        expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalledWith(
          'clinicID123', // clinicId,
          'patient1', // patientId,
          {
            fullName: 'Patient 3',
            birthDate: '1999-03-03',
            mrn: 'MRN456',
            id: 'patient1',
            email: 'patient1@test.ca',
            permissions: { view: {} },
            tags: [],
          },
          expect.any(Function), // callback fn passed to api
        );
      });

      it('should open a modal for managing data connections when data connection menu option is clicked', async () => {
        const getPatientFromClinicSpy = jest.spyOn(api.clinics, 'getPatientFromClinic').mockReturnValue({});
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Modal title should be present after clicking "Bring Data into Tidepool"
        await userEvent.click(screen.getByTestId('action-menu-patient1-icon'));
        await userEvent.click(screen.getByRole('button', { name: /Bring Data into Tidepool/ }));

        expect(screen.getByText('Connect a Device Account')).toBeInTheDocument();
        expect(screen.getByText('Invite patients to authorize syncing from these accounts. Only available in the US at this time.')).toBeInTheDocument();

        expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Edit patient data connections', { clinicId: 'clinicID123', source: 'action menu' });
        expect(defaultProps.trackMetric).toHaveBeenCalledTimes(1);

        getPatientFromClinicSpy.mockRestore();
      });


      it('should remove a patient', async () => {
        store = mockStore(hasPatientsState);
        render(
          <MockedProviderWrappers>
            <ClinicPatients {...defaultProps} />
          </MockedProviderWrappers>
        );

        // Modal title should be present after clicking "Remove Patient"
        await userEvent.click(screen.getByTestId('action-menu-patient1-icon'));
        await userEvent.click(screen.getByRole('button', { name: /Remove Patient/ }));

        expect(screen.getByRole('heading', { name: /Remove Patient One/ })).toBeInTheDocument();
        expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Remove patient', { clinicId: 'clinicID123' });
        expect(defaultProps.trackMetric).toHaveBeenCalledTimes(1);

        store.clearActions();

        // Confirm removal. Correct actions should be fired.
        await userEvent.click(screen.getByRole('button', { name: /Remove/ }));

        await waitFor(() => expect(defaultProps.api.clinics.deletePatientFromClinic).toHaveBeenCalled());

        expect(defaultProps.api.clinics.deletePatientFromClinic).toHaveBeenCalledWith(
          'clinicID123',
          'patient1',
          expect.any(Function),
        );

        expect(store.getActions()).toStrictEqual([{ type: 'DELETE_PATIENT_FROM_CLINIC_REQUEST' }]);
      });

      describe('tier0100 clinic', () => {
        beforeEach(() => {
          useFlags.mockReturnValue({
            showSummaryDashboard: false,
            showSummaryDashboardLastReviewed: false,
            showExtremeHigh: false,
          });

          useLDClient.mockReturnValue({
            getContext: jest.fn(() => ({
              clinic: { tier: 'tier0100' },
            })),
          });
        });

        it('should show the standard table columns and refetch patients with sort parameter when headers are clicked', async () => {
          store = mockStore(tier0100ClinicState);
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          const patientHeader = screen.getByRole('button', { name: 'Patient Details' });
          const dobHeader = screen.getByRole('button', { name: 'Birthday' });

          // Headers should exist
          expect(patientHeader).toBeInTheDocument();
          expect(dobHeader).toBeInTheDocument();
          expect(screen.getAllByText('MRN').length > 0).toBe(true);

          // Clicking on patient header should sort by name (ascending/descending)
          await userEvent.click(patientHeader);
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-fullName' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();

          await userEvent.click(patientHeader);
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+fullName' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();

          // Clicking on patient header should sort by date of birth (ascending/descending)
          await userEvent.click(dobHeader);
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+birthDate' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();

          await userEvent.click(dobHeader);
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-birthDate' }),
            expect.any(Function),
          );
        });

        describe('showSummaryDashboard flag is true', () => {
          it('should show the summary dashboard instead of the standard patient table', () => {
            useFlags.mockReturnValue({
              showSummaryDashboard: true,
              showSummaryDashboardLastReviewed: true,
              showExtremeHigh: false,
            });

            store = mockStore(tier0100ClinicState);
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            expect(screen.getByTestId('summary-dashboard-filters')).toBeInTheDocument();
          });
        });

        describe('patient limit is reached', () => {
          it('should show a popover with a link to the plans url if add patient button hovered', async () => {
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

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Add New Patient should be disabled
            const AddNewPatientButton = screen.getByRole('button', { name: /Add New Patient/ });
            expect(AddNewPatientButton).toBeInTheDocument();
            expect(AddNewPatientButton).toBeDisabled();

            // Should be a hover indicator to show patient limit reached
            await userEvent.hover(AddNewPatientButton);
            expect(screen.getByAltText('Patient Limit Reached')).toBeVisible();
            expect(screen.getByRole('link', { name: 'learn more about our plans.' })).toHaveAttribute('href', URL_TIDEPOOL_PLUS_PLANS);
          });
        });
      });

      describe('tier0300 clinic', () => {
        beforeEach(() => {
          window.HTMLElement.prototype.scrollIntoView = jest.fn();
          store = mockStore(tier0300ClinicState);

          useFlags.mockReturnValue({
            showSummaryDashboard: true,
            showSummaryDashboardLastReviewed: true,
          });

          useLDClient.mockReturnValue({
            getContext: jest.fn(() => ({
              clinic: { tier: 'tier0300' },
            })),
          });
        });

        it('should show data appropriately based on availablity', async () => {
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          const table = document.querySelector('table') // eslint-disable-line
          const columns = table.querySelectorAll('.MuiTableCell-head'); // eslint-disable-line

          expect(columns[0]).toHaveTextContent('Patient Details');
          expect(columns[1]).toHaveTextContent('Data Recency');
          expect(columns[2]).toHaveTextContent('Patient Tags');
          expect(columns[3]).toHaveTextContent('CGM');
          expect(columns[4]).toHaveTextContent('GMI');
          expect(columns[5]).toHaveTextContent('% Time in Range');
          expect(columns[7]).toHaveTextContent('BGM');
          expect(columns[8]).toHaveTextContent('Avg. Glucose (mg/dL)');
          expect(columns[9]).toHaveTextContent('Lows');
          expect(columns[10]).toHaveTextContent('Highs');

          const rows = table.querySelectorAll('tbody tr'); // eslint-disable-line
          expect(rows.length).toBe(5);

          expect(rows[0]).toHaveTextContent(/Patient One/i);
          expect(rows[0]).toHaveTextContent(/1999-01-01/i);
          expect(rows[0]).toHaveTextContent(/MRN012/i);
          expect(rows[0]).toHaveTextContent(/--/i); // empty stat text

          // Last upload date
          expect(rows[0]).toHaveTextContent(/--/);
          expect(rows[1]).toHaveTextContent(/CGM: Today/i);
          expect(rows[1]).toHaveTextContent(/BGM: Yesterday/i);
          expect(rows[2]).toHaveTextContent(/CGM: Yesterday/i);
          expect(rows[3]).toHaveTextContent(/CGM: 30 days ago/i);

          // Patient Tags
          expect(rows[0]).toHaveTextContent(/Add/i);
          expect(rows[1]).toHaveTextContent(/test tag 1/i);
          expect(rows[2]).toHaveTextContent(/test tag 1\+2/i);

          // // GMI
          expect(rows[0]).toHaveTextContent(/--/);// GMI undefined
          expect(rows[1]).toHaveTextContent(/--/); // <24h cgm use shows empty text
          expect(rows[2]).toHaveTextContent(/6.5 %/i);
          expect(rows[3]).toHaveTextContent(/--/); // <70% cgm use

          // Ensure tags hidden by overflow are visible on hover
          await userEvent.hover(screen.getByTestId('tag-overflow-trigger'));
          expect(screen.getByTestId('tag-list-overflow')).toBeVisible();

          // Average glucose and readings/day
          expect(rows[1]).toHaveTextContent('189'); // 10.5 mmol/L -> mg/dL
          expect(rows[1]).toHaveTextContent('<1 reading/day');
          expect(rows[2]).toHaveTextContent('207'); // 11.5 mmol/L -> mg/dL
          expect(rows[2]).toHaveTextContent('1 reading/day');
          expect(rows[3]).toHaveTextContent('225'); // 12.5 mmol/L -> mg/dL
          expect(rows[3]).toHaveTextContent('2 readings/day');

          // Low events
          expect(rows[1]).toHaveTextContent('1');
          expect(rows[2]).toHaveTextContent('3');
          expect(rows[3]).toHaveTextContent('0');

          // High events
          expect(rows[1]).toHaveTextContent('2');
          expect(rows[2]).toHaveTextContent('4');
          expect(rows[3]).toHaveTextContent('0');
        });

        it('should refetch patients with updated sort parameter when sortable column headers are clicked', async () => {
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          const patientHeader = screen.getByRole('button', { name: /Patient Details/ });
          await userEvent.click(patientHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Patient details sort ascending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+fullName' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          await userEvent.click(patientHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Patient details sort descending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-fullName' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          const lastDataDateHeader = screen.getAllByRole('button', { name: /Data Recency/ })[1];
          await userEvent.click(lastDataDateHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Data recency sort descending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-lastData' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          await userEvent.click(lastDataDateHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Data recency sort ascending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+lastData' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          const gmiHeader = screen.getByRole('button', { name: /GMI/ });
          await userEvent.click(gmiHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - GMI sort descending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-glucoseManagementIndicator' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          await userEvent.click(gmiHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - GMI sort ascending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+glucoseManagementIndicator' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          const averageGlucoseHeader = screen.getByRole('button', { name: /Avg. Glucose/i });
          await userEvent.click(averageGlucoseHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Average glucose sort descending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-averageGlucoseMmol' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          await userEvent.click(averageGlucoseHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Average glucose sort ascending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+averageGlucoseMmol' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          const lowsHeader = screen.getByRole('button', { name: /Lows/i });
          await userEvent.click(lowsHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Time in very low sort descending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-timeInVeryLowRecords' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          await userEvent.click(lowsHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Time in very low sort ascending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+timeInVeryLowRecords' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          const highsHeader = screen.getByRole('button', { name: /Highs/i });
          await userEvent.click(highsHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Time in very high sort descending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '-timeInVeryHighRecords' }),
            expect.any(Function),
          );

          defaultProps.api.clinics.getPatientsForClinic.mockClear();
          defaultProps.trackMetric.mockClear();

          await userEvent.click(highsHeader);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.trackMetric).toHaveBeenCalledWith('Clinic - Population Health - Time in very high sort ascending', { clinicId: 'clinicID123' })
          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ sort: '+timeInVeryHighRecords' }),
            expect.any(Function),
          );
        }, TEST_TIMEOUT_MS);

        it('should allow refreshing the patient list and maintain', async () => {
          store = mockStore(tier0300ClinicState);
          mockLocalStorage({ activePatientSort: '-lastData' });

          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          // should show the last time since patient data fetch
          expect(screen.getByText('Last updated less than an hour ago')).toBeInTheDocument();

          // clicking refresh should fresh the patient list
          await userEvent.click(screen.getByLabelText('Refresh patients list'));

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ ...defaultFetchOptions, sort: '-lastData' }),
            expect.any(Function),
          ));
        });

        it('should allow filtering by last upload', async () => {
          store = mockStore(tier0300ClinicState);
          mockLocalStorage({ activePatientSort: '-lastData' });
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          // Filter options should not be visible yet
          expect(screen.queryByRole('radio', { name: 'CGM' })).not.toBeInTheDocument();

          // Open the filter dropdown
          await userEvent.click(screen.getByTestId('last-data-filter-trigger'));

          expect(screen.getByRole('radio', { name: 'CGM' })).toBeInTheDocument();
          expect(screen.getByRole('radio', { name: 'BGM' })).toBeInTheDocument();

          expect(screen.getByRole('radio', { name: 'Within 24 hours' })).toBeInTheDocument();
          expect(screen.getByRole('radio', { name: 'Within 2 days' })).toBeInTheDocument();
          expect(screen.getByRole('radio', { name: 'Within 14 days' })).toBeInTheDocument();
          expect(screen.getByRole('radio', { name: 'Within 30 days' })).toBeInTheDocument();

          // Apply button should be disabled since no options are selected
          const applyFilterButton = screen.getByRole('button', { name: 'Apply' });
          expect(applyFilterButton).toBeDisabled();

          // Select some options. Apply button should enable
          await userEvent.click(screen.getByRole('radio', { name: 'BGM' }));
          await userEvent.click(screen.getByRole('radio', { name: 'Within 30 days' }));
          expect(applyFilterButton).toBeEnabled();

          await userEvent.click(applyFilterButton);

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ ...defaultFetchOptions, sortType: 'bgm', sort: '-lastData', 'bgm.lastDataFrom': expect.any(String), 'bgm.lastDataTo': expect.any(String) }),
            expect.any(Function),
          ));

          expect(defaultProps.trackMetric).toHaveBeenCalledWith(
            'Clinic - Population Health - Last upload apply filter',
            expect.objectContaining({ clinicId: 'clinicID123', dateRange: '30 days', type: 'bgm'}),
          );
        });

        it('should allow filtering by cgm use', async () => {
          store = mockStore(tier0300ClinicState);
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          // Filter options should not be visible yet
          expect(screen.queryByRole('radio', { name: 'Less than 70%' })).not.toBeInTheDocument();

          // Open filter dropdown
          await userEvent.click(screen.getByTestId('cgm-use-filter-trigger'));

          // Query options should be visible. Apply button should be disabled due to no option selected
          expect(screen.getByRole('radio', { name: 'Less than 70%' })).toBeInTheDocument();
          expect(screen.getByRole('radio', { name: '70% or more' })).toBeInTheDocument();

          const applyFilterButton = screen.getByRole('button', { name: 'Apply' });
          expect(applyFilterButton).toBeDisabled();

          await userEvent.click(screen.getByRole('radio', { name: 'Less than 70%' }));
          expect(applyFilterButton).toBeEnabled();

          await userEvent.click(applyFilterButton);

          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({ 'cgm.timeCGMUsePercent': '<0.7' }),
            expect.any(Function),
          );

          expect(defaultProps.trackMetric).toHaveBeenCalledWith(
            'Clinic - Population Health - CGM use apply filter',
            expect.objectContaining({ clinicId: 'clinicID123', filter: '<0.7' }),
          );
        });


        it('should allow filtering by bg range targets that DO NOT meet selected criteria', async () => {
          store = mockStore(tier0300ClinicState);
          mockLocalStorage({ activePatientSort: '-lastData' });
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));

          // Modal title and checkbox options should be present in unchecked state
          expect(screen.getByText('Filter by Time in Range')).toBeInTheDocument();

          const optVeryHigh = screen.getByRole('checkbox', { name: /Very High Greater than 5 % Time >250 mg\/dL/ });
          const optHigh = screen.getByRole('checkbox', { name: /High Greater than 25 % Time >180 mg\/dL/ });
          const optNotMeetingTIR = screen.getByRole('checkbox', { name: /Not meeting TIR Less than 70 % Time between 70-180 mg\/dL/ });
          const optLow = screen.getByRole('checkbox', { name: /Low Greater than 4 % Time <70 mg\/dL/ });
          const optVeryLow = screen.getByRole('checkbox', { name: /Very Low Greater than 1 % Time <54 mg\/dL/ });

          expect(optVeryHigh).not.toBeChecked();
          expect(optHigh).not.toBeChecked();
          expect(optNotMeetingTIR).not.toBeChecked();
          expect(optLow).not.toBeChecked();
          expect(optVeryLow).not.toBeChecked();

          // Select all filter ranges and submit form
          await userEvent.click(optVeryHigh);
          await userEvent.click(optHigh);
          await userEvent.click(optNotMeetingTIR);
          await userEvent.click(optLow);
          await userEvent.click(optVeryLow);

          await userEvent.click(screen.getByRole('button', { name: 'Apply Filter' }));

          await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

          expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
            'clinicID123',
            expect.objectContaining({
              sort: '-lastData',
              'cgm.timeInAnyHighPercent': '>=0.25',
              'cgm.timeInAnyLowPercent': '>=0.04',
              'cgm.timeInTargetPercent': '<=0.7',
              'cgm.timeInVeryHighPercent': '>=0.05',
              'cgm.timeInVeryLowPercent': '>=0.01',
            }),
            expect.any(Function)
          );

          expect(defaultProps.trackMetric).toHaveBeenCalledWith(
            'Clinic - Population Health - Time in range apply filter',
            expect.objectContaining({
              clinicId: 'clinicID123',
              hyper: true,
              hypo: true,
              inRange: true,
              meetsCriteria: true,
              severeHyper: true,
              severeHypo: true,
            }),
          );
        });

        describe('summary period filtering', () => {
          it('should allow filtering by summary period', async () => {
            mockLocalStorage({
              'activePatientFilters/clinicianUserId123/clinicID123': JSON.stringify({
                timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                patientTags: [],
                meetsGlycemicTargets: false,
              }),
              activePatientSummaryPeriod: '14d',
            });

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            expect(screen.getByTestId('filter-reset-bar')).toBeInTheDocument();
            expect(screen.queryByRole('radio', { name: '24 hours' })).not.toBeInTheDocument();

            // Open the dropdown. Radio options should appear. 14 days should be checked.
            await userEvent.click(screen.getByRole('button', { name: /14 days of data/ }));

            const radio24h = screen.getByRole('radio', { name: '24 hours' });
            const radio7d = screen.getByRole('radio', { name: '7 days' });
            const radio14d = screen.getByRole('radio', { name: '14 days' });
            const radio30d = screen.getByRole('radio', { name: '30 days' });

            expect(radio24h).not.toBeChecked();
            expect(radio7d).not.toBeChecked();
            expect(radio14d).toBeChecked();
            expect(radio30d).not.toBeChecked();

            await userEvent.click(radio7d);
            await userEvent.click(screen.getByRole('button', { name: /Apply/ }));

            await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalled());

            expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
              'clinicID123',
              expect.objectContaining({
                ...defaultFetchOptions,
                sort: '-lastData',
                period: '7d',
                'cgm.timeInAnyHighPercent': '>0.25',
                'cgm.timeInAnyLowPercent': '>0.04',
              }),
              expect.any(Function),
            );

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Summary period apply filter',
              expect.objectContaining({ clinicId: 'clinicID123', summaryPeriod: '7d' }),
            );
          });
        });

        it('should not show the GMI if selected period is less than 14 days', async () => {
          mockLocalStorage({
            'activePatientFilters/clinicianUserId123/clinicID123': JSON.stringify({
              timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
              patientTags: [],
              meetsGlycemicTargets: false,
            }),
            activePatientSummaryPeriod: '14d',
          });

          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          expect(screen.getByTestId('filter-reset-bar')).toBeInTheDocument();
          expect(screen.queryByRole('radio', { name: '24 hours' })).not.toBeInTheDocument();

          const gmiIndicator = document.getElementById('peopleTable-row-2-cgm.glucoseManagementIndicator'); // eslint-disable-line

          // GMI Indicator should initially have 6.5%
          expect(gmiIndicator).toHaveTextContent('GMI6.5 %');

          // Open the dropdown. Click on 7 days. GMI Indicator should be hidden.
          await userEvent.click(screen.getByRole('button', { name: /14 days of data/ }));
          await userEvent.click(screen.getByRole('radio', { name: '7 days' }));
          await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

          expect(gmiIndicator).toHaveTextContent('GMI--');

          // Open the dropdown. Click on 30 days. GMI Indicator should still be shown and show new value.
          await userEvent.click(screen.getByRole('button', { name: /7 days of data/ }));
          await userEvent.click(screen.getByRole('radio', { name: '30 days' }));
          await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

          expect(gmiIndicator).toHaveTextContent('GMI7.5 %');

          // Open the dropdown. Click on 24 hours. GMI Indicator should be hidden.
          await userEvent.click(screen.getByRole('button', { name: /30 days of data/ }));
          await userEvent.click(screen.getByRole('radio', { name: '24 hours' }));
          await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

          expect(gmiIndicator).toHaveTextContent('GMI--');
        });

        describe('persisted filter state', () => {
          it('should set the last upload filter on load based on the stored filters', async () => {
            mockLocalStorage({
              'activePatientFilters/clinicianUserId123/clinicID123': JSON.stringify({
                lastData: 14,
                timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                patientTags: ['tag2'],
                meetsGlycemicTargets: true,
              }),
              activePatientSummaryPeriod: '14d',
            });

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Data Recency button should have correct copy reflecting current 14 day filter
            expect(screen.getByTestId('last-data-filter-trigger')).toHaveTextContent('Data within 14 days');

            // Tags button should have a 1 appended to it, reflecting 1 currently applied tag
            const tagsDropdownTrigger = screen.getByTestId('patient-tags-filter-trigger');
            expect(tagsDropdownTrigger).toHaveTextContent('Tags1');

            // Open the dropdown. The applied tag should already be checked
            await userEvent.click(tagsDropdownTrigger);

            expect(screen.getByRole('checkbox', { name: 'ttest tag 3' })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'test tag 2' })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: 'test tag 1' })).not.toBeChecked();
          });

          it('should set the time in range filters on load based on the stored filters', async () => {
            mockLocalStorage({
              'activePatientFilters/clinicianUserId123/clinicID123': JSON.stringify({
                lastData: 14,
                timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                patientTags: ['tag2'],
                meetsGlycemicTargets: true,
              }),
              activePatientSummaryPeriod: '14d',
            });

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Should show 2 active time in range filters
            const timeInRangeFilterTrigger = screen.getByTestId('time-in-range-filter-trigger');
            expect(timeInRangeFilterTrigger).toHaveTextContent('Time in Range2');

            // Open the dialog
            expect(screen.queryByText('Filter by Time in Range')).not.toBeInTheDocument();
            await userEvent.click(timeInRangeFilterTrigger);

            // anyLow and anyHigh are already selected
            expect(screen.getByText('Filter by Time in Range')).toBeInTheDocument();

            expect(screen.getByRole('checkbox', { name: /^Very High\b/ })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: /^High\b/ })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: /^Not meeting TIR\b/ })).not.toBeChecked();
            expect(screen.getByRole('checkbox', { name: /^Low\b/ })).toBeChecked();
            expect(screen.getByRole('checkbox', { name: /^Very Low\b/ })).not.toBeChecked();
          });

          it('should fetch the initial patient based on the stored filters', async () => {
            mockLocalStorage({
              'activePatientFilters/clinicianUserId123/clinicID123': JSON.stringify({
                lastData: 14,
                timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                patientTags: ['tag2'],
                meetsGlycemicTargets: true,
              }),
              activePatientSummaryPeriod: '14d',
            });

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
              'clinicID123',
              {
                ...defaultFetchOptions,
                sort: '-lastData',
                'cgm.timeInAnyHighPercent': '>=0.25',
                'cgm.timeInAnyLowPercent': '>=0.04',
                tags: expect.any(Array),
              },
              expect.any(Function),
            ));
          });
        });

        describe('persisted sort state', () => {
          it('uses sort params from localStorage to set the table sort UI and to fetch the initial patient list', async () => {
            store = mockStore(tier0300ClinicState);
            mockLocalStorage({
              'activePatientFilters/clinicianUserId123/clinicID123': JSON.stringify({
                timeInRange: ['timeInAnyLowPercent', 'timeInAnyHighPercent'],
                patientTags: [],
                meetsGlycemicTargets: false,
              }),
              activePatientSummaryPeriod: '14d',
              activePatientSort: JSON.stringify({ sort: '-averageGlucoseMmol', sortType: 'bgm' }),
            });

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            const sortMarker = document.getElementsByClassName('MuiTableSortLabel-active')[0]; // eslint-disable-line
            const headingCell = sortMarker.parentElement; // eslint-disable-line

            // On mount, the cell will be Data Recency, but it will be moved to Avg Glucose with an effect
            await waitFor(() => expect(headingCell).toHaveTextContent('Avg. Glucose (mg/dL)')); // eslint-disable-line
            expect(headingCell).toHaveAttribute('aria-sort', 'descending'); // eslint-disable-line

            await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
              'clinicID123',
              expect.objectContaining({ ...defaultFetchOptions, sort: '-averageGlucoseMmol', sortType: 'bgm' }),
              expect.any(Function),
            ));
          });
        });

        describe('mmol/L preferredBgUnits', () => {
          it('should show the bgm average glucose and the bg range filters in mmol/L units', async () => {
            store = mockStore(tier0300ClinicStateMmoll);
            mockLocalStorage({});

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            /* eslint-disable testing-library/no-node-access */
            const headingCell = document.getElementById('peopleTable-header-bgm-averageGlucoseMmol');
            expect(headingCell).toBeInTheDocument();
            expect(headingCell).toHaveTextContent('Avg. Glucose (mmol/L)');

            expect(screen.getByText('10.5')).toBeInTheDocument();

            expect(document.getElementById('peopleTable-row-1-bgm.averageGlucoseMmol')).toHaveTextContent('10.5');
            expect(document.getElementById('peopleTable-row-2-bgm.averageGlucoseMmol')).toHaveTextContent('11.5');
            expect(document.getElementById('peopleTable-row-3-bgm.averageGlucoseMmol')).toHaveTextContent('12.5');
            /* eslint-enable testing-library/no-node-access */

            // Open filters dialog
            await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));
            expect(screen.getByText('Filter by Time in Range')).toBeInTheDocument();

            const optVeryHigh = screen.getByRole('checkbox', { name: /Very High Greater than 5 % Time >13.9 mmol\/L/ });
            const optHigh = screen.getByRole('checkbox', { name: /High Greater than 25 % Time >10.0 mmol\/L/ });
            const optNotMeetingTIR = screen.getByRole('checkbox', { name: /Not meeting TIR Less than 70 % Time between 3.9-10.0 mmol\/L/ });
            const optLow = screen.getByRole('checkbox', { name: /Low Greater than 4 % Time <3.9 mmol\/L/ });
            const optVeryLow = screen.getByRole('checkbox', { name: /Very Low Greater than 1 % Time <3.0 mmol\/L/ });

            expect(optVeryHigh).not.toBeChecked();
            expect(optHigh).not.toBeChecked();
            expect(optNotMeetingTIR).not.toBeChecked();
            expect(optLow).not.toBeChecked();
            expect(optVeryLow).not.toBeChecked();
          });
        });

        it('should track how many filters are active', async () => {
          store = mockStore(tier0300ClinicState);
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          expect(screen.queryByTestId('filter-count')).not.toBeInTheDocument();

          // Set last data filter. Filter count should now appear
          await userEvent.click(screen.getByTestId('last-data-filter-trigger'));
          await userEvent.click(screen.getByRole('radio', { name: 'CGM' }));
          await userEvent.click(screen.getByRole('radio', { name: 'Within 30 days' }));
          await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

          const filterCountIndicator = screen.getByTestId('filter-count');
          expect(filterCountIndicator).toHaveTextContent('1');

          // Set time in range filter. Filter count should be 2
          await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));

          await userEvent.click(screen.getByRole('checkbox', { name: /^High\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Low\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Very Low\b/ }));
          await userEvent.click(screen.getByRole('button', { name: 'Apply Filter' }));

          expect(filterCountIndicator).toHaveTextContent('2');

          // Unset last data filter. Filter count should be 1
          await userEvent.click(screen.getByTestId('last-data-filter-trigger'));
          await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

          expect(filterCountIndicator).toHaveTextContent('1');

          // Unset time in range filter. Filter count indicator should disappear
          await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));

          await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

          expect(filterCountIndicator).not.toBeInTheDocument();
        }, TEST_TIMEOUT_MS);

        it('should reset all active filters at once', async () => {
          store = mockStore(tier0300ClinicState);
          mockLocalStorage({});

          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          // Reset Filters button only shows when filters are active
          expect(screen.queryByTestId('filter-count')).not.toBeInTheDocument();
          expect(screen.queryByTestId('reset-all-active-filters')).not.toBeInTheDocument();

          // Set lastData filter
          await userEvent.click(screen.getByTestId('last-data-filter-trigger'));
          await userEvent.click(screen.getByRole('radio', { name: 'CGM' }));
          await userEvent.click(screen.getByRole('radio', { name: 'Within 30 days' }));
          await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

          const filterCountIndicator = screen.getByTestId('filter-count');
          expect(filterCountIndicator).toHaveTextContent('1');

          const resetButton = await screen.findByTestId('reset-all-active-filters');
          expect(resetButton).toBeInTheDocument();
          expect(resetButton).toHaveTextContent('Reset Filters');

          // Set time in range filter
          await userEvent.click(screen.getByRole('button', { name: /% Time in Range/ }));

          await userEvent.click(screen.getByRole('checkbox', { name: /^High\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Low\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Very Low\b/ }));
          await userEvent.click(screen.getByRole('button', { name: 'Apply Filter' }));

          // Filter count should be 2, reset button should still be visible
          expect(filterCountIndicator).toHaveTextContent('2');
          expect(resetButton).toBeInTheDocument();

          await userEvent.click(resetButton);

          // Total filter count and time in range filter count should be unset
          expect(filterCountIndicator).not.toBeInTheDocument();
          expect(resetButton).not.toBeInTheDocument();
        }, TEST_TIMEOUT_MS);

        it('should clear pending filter edits when time in range filter dialog closed', async () => {
          store = mockStore(tier0300ClinicState);
          mockLocalStorage({});

          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          expect(screen.queryByTestId('filter-count')).not.toBeInTheDocument();
          expect(screen.queryByTestId('time-in-range-filter-count')).not.toBeInTheDocument();
          expect(screen.queryByTestId('reset-all-active-filters')).not.toBeInTheDocument();

          await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));
          expect(screen.getByText('Filter by Time in Range')).toBeInTheDocument();

          await userEvent.click(screen.getByRole('checkbox', { name: /^High\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Low\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Very Low\b/ }));

          // Close dialog without applying filter
          const closeDialogButton = within(screen.getByRole('dialog')).getByLabelText('close dialog');
          await userEvent.click(closeDialogButton);
          await waitFor(() => expect(screen.queryByText('Filter by Time in Range')).not.toBeInTheDocument());

          // Re-open dialog
          await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));
          expect(screen.getByText('Filter by Time in Range')).toBeInTheDocument();

          expect(screen.getByRole('checkbox', { name: /^Very High\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^High\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^Not meeting TIR\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^Low\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^Very Low\b/ })).not.toBeChecked();

          expect(screen.queryByTestId('filter-count')).not.toBeInTheDocument();
          expect(screen.queryByTestId('reset-all-active-filters')).not.toBeInTheDocument();
        }, TEST_TIMEOUT_MS);

        it('should clear pending filter edits when time in range filter dialog closed by exiting the dialog', async () => {
          store = mockStore(tier0300ClinicState);
          mockLocalStorage({});

          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          expect(screen.queryByTestId('filter-count')).not.toBeInTheDocument();
          expect(screen.queryByTestId('time-in-range-filter-count')).not.toBeInTheDocument();
          expect(screen.queryByTestId('reset-all-active-filters')).not.toBeInTheDocument();

          await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));
          expect(screen.getByText('Filter by Time in Range')).toBeInTheDocument();

          await userEvent.click(screen.getByRole('checkbox', { name: /^High\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Low\b/ }));
          await userEvent.click(screen.getByRole('checkbox', { name: /^Very Low\b/ }));

          // Close dialog without applying filter
          await userEvent.keyboard('{Escape}');
          await waitFor(() => expect(screen.queryByText('Filter by Time in Range')).not.toBeInTheDocument());

          // Re-open dialog
          await userEvent.click(screen.getByTestId('time-in-range-filter-trigger'));
          expect(screen.getByText('Filter by Time in Range')).toBeInTheDocument();

          expect(screen.getByRole('checkbox', { name: /^Very High\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^High\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^Not meeting TIR\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^Low\b/ })).not.toBeChecked();
          expect(screen.getByRole('checkbox', { name: /^Very Low\b/ })).not.toBeChecked();

          expect(screen.queryByTestId('filter-count')).not.toBeInTheDocument();
          expect(screen.queryByTestId('reset-all-active-filters')).not.toBeInTheDocument();
        }, TEST_TIMEOUT_MS);

        it('should send an upload reminder to a fully claimed patient account', async () => {
          store = mockStore(tier0300ClinicState);
          mockLocalStorage({});

          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          // No reminder action for a custodial account - should not show Send Upload button
          const patientOneActionMenuTrigger = screen.getByTestId('action-menu-patient1-icon');
          await userEvent.click(patientOneActionMenuTrigger);
          expect(screen.queryByRole('button', { name: /Send Upload Reminder/ })).not.toBeInTheDocument();
          await userEvent.click(patientOneActionMenuTrigger); // close the dropdown agai)n

          // Fully claimed account - should have Send Upload button
          const patientTwoActionMenuTrigger = screen.getByTestId('action-menu-patient2-icon');
          await userEvent.click(patientTwoActionMenuTrigger);

          // Click the button, it should open a dialog that allows sending an upload reminder
          store.clearActions();
          await userEvent.click(screen.getByRole('button', { name: /Send Upload Reminder/ }));

          expect(await screen.findByRole('heading', { name: /Send Upload Reminder/ })).toBeInTheDocument();
          expect(screen.getByText(/Are you sure you want to send an upload reminder email to\b/));

          await userEvent.click(screen.getByRole('button', { name: 'Send' }));

          await waitFor(() => expect(defaultProps.api.clinics.sendPatientUploadReminder).toHaveBeenCalledWith(
            'clinicID123',
            'patient2',
            expect.any(Function),
          ));

          expect(defaultProps.trackMetric).toHaveBeenCalledWith(
            'Clinic - Population Health - Send upload reminder',
            { clinicId: 'clinicID123' }
          );

          expect(store.getActions()).toStrictEqual([
            { type: 'SEND_PATIENT_UPLOAD_REMINDER_REQUEST' },
          ]);
        }, TEST_TIMEOUT_MS);

        // *** Migration Current Position ***

        describe('filtering for patients', () => {
          afterEach(() => {
            // Clear any persisted filter state between tests
            localStorage.clear();
          });

          it('should allow filtering by sites', async () => {
            store = mockStore(tier0300ClinicState);
            mockLocalStorage({});

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Sites filter  dropdown and filter for 2 sites
            await userEvent.click(screen.getByRole('button', { name: /Sites/ }));

            const site1checkbox = screen.getByTestId('clinic-site-filter-option-checkbox-site-1-id');
            const site2checkbox = screen.getByTestId('clinic-site-filter-option-checkbox-site-2-id');

            expect(site1checkbox).not.toBeChecked();
            expect(site2checkbox).not.toBeChecked();

            await userEvent.click(site1checkbox);
            await userEvent.click(site2checkbox);

            expect(site1checkbox).toBeChecked();
            expect(site2checkbox).toBeChecked();

            // Click Apply
            await userEvent.click(screen.getByRole('button', { name: /Apply/ }));

            await waitFor(() => expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
              'clinicID123',
              expect.objectContaining({ sites: ['site-1-id', 'site-2-id'] }),
              expect.any(Function),
            ));

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Clinic sites filter apply',
              { clinicId: 'clinicID123' },
            );
          }, TEST_TIMEOUT_MS);

          it('should allow filtering by for patients with zero sites', async () => {
            store = mockStore(tier0300ClinicState);
            mockLocalStorage({});

            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Sites filter dropdown and filter for 2 sites
            await userEvent.click(screen.getByRole('button', { name: /Sites/ }));

            const site1checkbox = screen.getByTestId('clinic-site-filter-option-checkbox-site-1-id');
            const site2checkbox = screen.getByTestId('clinic-site-filter-option-checkbox-site-2-id');
            await userEvent.click(site1checkbox);
            await userEvent.click(site2checkbox);
            expect(site1checkbox).toBeChecked();
            expect(site2checkbox).toBeChecked();

            // Click the checkbox to filter for pwds with zero sites. Others should uncheck.
            const zeroSiteCheckbox = screen.getByTestId('clinic-site-filter-option-checkbox-PWDS_WITH_ZERO_SITES');
            await userEvent.click(zeroSiteCheckbox);
            expect(site1checkbox).not.toBeChecked();
            expect(site2checkbox).not.toBeChecked();

            // Click Apply. A query of `['_']` should be made for sites.
            await userEvent.click(screen.getByRole('button', { name: /Apply/ }));

            expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
              'clinicID123',
              { sites: ['_'], limit: 50, offset: 0, period: '14d', sortType: 'cgm', sort: '-lastData' },
              expect.any(Function),
            );
          }, TEST_TIMEOUT_MS);

          it('should allow filtering by tags', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Tags filter dropdown and filter for 2 sites
            await userEvent.click(screen.getByRole('button', { name: /Tags/ }));

            const tag1checkbox = screen.getByTestId('tag-filter-option-checkbox-tag1');
            const tag3checkbox = screen.getByTestId('tag-filter-option-checkbox-tag3');

            expect(tag1checkbox).not.toBeChecked();
            expect(tag3checkbox).not.toBeChecked();

            await userEvent.click(tag1checkbox);
            await userEvent.click(tag3checkbox);

            expect(tag1checkbox).toBeChecked();
            expect(tag3checkbox).toBeChecked();

            // Click Apply
            await userEvent.click(screen.getByRole('button', { name: /Apply/ }));

            expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenLastCalledWith(
              'clinicID123',
              { tags: ['tag1', 'tag3'], limit: 50, offset: 0, period: '14d', sortType: 'cgm', sort: '-lastData' },
              expect.any(Function),
            );

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Patient tag filter apply',
              { clinicId: 'clinicID123' },
            );
          }, TEST_TIMEOUT_MS);

          it('should allow filtering by for patients with zero tags', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Tags filter dropdown and filter for 2 tags
            await userEvent.click(screen.getByRole('button', { name: /Tags/ }));

            const tag1checkbox = screen.getByTestId('tag-filter-option-checkbox-tag1');
            const tag2checkbox = screen.getByTestId('tag-filter-option-checkbox-tag2');
            await userEvent.click(tag1checkbox);
            await userEvent.click(tag2checkbox);
            expect(tag1checkbox).toBeChecked();
            expect(tag2checkbox).toBeChecked();

            // Click the checkbox to filter for pwds with zero tags. Others should uncheck.
            const zeroTagCheckbox = screen.getByTestId('tag-filter-option-checkbox-PWDS_WITH_ZERO_TAGS');
            await userEvent.click(zeroTagCheckbox);
            expect(tag1checkbox).not.toBeChecked();
            expect(tag2checkbox).not.toBeChecked();

            // Click Apply. A query of `['_']` should be made for sites.
            await userEvent.click(screen.getByRole('button', { name: /Apply/ }));

            expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
              'clinicID123',
              { tags: ['_'], limit: 50, offset: 0, period: '14d', sortType: 'cgm', sort: '-lastData' },
              expect.any(Function),
            );
          }, TEST_TIMEOUT_MS);
        });

        describe('managing sites', () => {
          it('should allow creating a new site for a workspace', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Edit Sites Dialog
            await userEvent.click(screen.getByRole('button', { name: /Sites/ }));
            await userEvent.click(screen.getByRole('button', { name: /Edit Sites/ }));

            // Type in a new site "Charlie" into the textbox and click add
            const newSiteInputField = await screen.findByRole('textbox');
            await userEvent.click(newSiteInputField);
            await userEvent.paste('Site Charlie');
            await userEvent.click(screen.getByRole('button', { name: /Add/ }));

            await waitFor(() => expect(defaultProps.api.clinics.createClinicSite).toHaveBeenCalled());

            expect(defaultProps.api.clinics.createClinicSite).toHaveBeenCalledWith(
              'clinicID123', // clinicId,
              { name: 'Site Charlie' }, // new site to be created
              expect.any(Function), // callback fn passed to api
            );

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Edit clinic sites add',
              { clinicId: 'clinicID123' },
            );
          }, TEST_TIMEOUT_MS);

          it('should allow updating an existing site for a workspace', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Edit Sites Dialog
            await userEvent.click(screen.getByRole('button', { name: /Sites/ }));
            await userEvent.click(screen.getByRole('button', { name: /Edit Sites/ }));

            // Click on Icon to edit site 2. Dialog titled ` Update "Site Bravo" ` should be open
            await userEvent.click(screen.getByTestId('edit-site-button-site-2-id'));
            expect(screen.getByText('Update "Site Bravo"')).toBeInTheDocument();

            // Change the name of the site, then click "Update" button
            const editSiteNameInputField = screen.getByRole('textbox');
            expect(editSiteNameInputField).toHaveValue('Site Bravo');

            await userEvent.clear(editSiteNameInputField);
            await userEvent.click(editSiteNameInputField);
            await userEvent.paste('Site Zulu');
            expect(editSiteNameInputField).toHaveValue('Site Zulu');

            await userEvent.click(screen.getByRole('button', { name: /Update/ }));

            await waitFor(() => expect(defaultProps.api.clinics.updateClinicSite).toHaveBeenCalled());

            expect(defaultProps.api.clinics.updateClinicSite).toHaveBeenCalledWith(
              'clinicID123', // clinicId,
              'site-2-id', // site id
              { name: 'Site Zulu' }, // updated site
              expect.any(Function), // callback fn passed to api
            );

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Edit clinic sites update',
              { clinicId: 'clinicID123' },
            );
          }, TEST_TIMEOUT_MS);

          it('should allow deleting an existing site for a workspace', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Edit Sites Dialog
            await userEvent.click(screen.getByRole('button', { name: /Sites/ }));
            await userEvent.click(screen.getByRole('button', { name: /Edit Sites/ }));

            // Click on Icon to delete site 2. Dialog titled ` Remove "Site Bravo" ` should be open
            await userEvent.click(screen.getByTestId('delete-site-button-site-2-id'));
            expect(screen.getByText('Remove "Site Bravo"')).toBeInTheDocument();

            // Confirm
            await userEvent.click(screen.getByRole('button', { name : /Remove/ }));

            await waitFor(() => expect(defaultProps.api.clinics.deleteClinicSite).toHaveBeenCalled());

            expect(defaultProps.api.clinics.deleteClinicSite).toHaveBeenCalledWith(
              'clinicID123', // clinicId,
              'site-2-id', // site id
              expect.any(Function), // callback fn passed to api
            );

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Edit clinic sites delete',
              { clinicId: 'clinicID123' },
            );
          }, TEST_TIMEOUT_MS);
        });

        describe('managing patient sites', () => {
          it('should allow updating sites for a patient', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Click the Edit Sites icon for a patient. The Dialog for Edit Patient Details should open.
            expect(screen.queryByText('Edit Patient Details')).not.toBeInTheDocument();
            await userEvent.click(screen.getByTestId('action-menu-patient2-icon'));
            await userEvent.click(screen.getByRole('button', { name: /Edit Patient Information/ }));
            expect(screen.getByText('Edit Patient Details')).toBeInTheDocument();

            // Add Site 3 and remove Site 1, then save
            await userEvent.click(screen.getAllByRole('combobox')[1]); // open combobox dropdown
            await userEvent.click(screen.getByText('Site Charlie', { selector: 'div' }));
            await userEvent.click(screen.getByLabelText(/Remove Site Alpha/));
            await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

            await waitFor(() => expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalled());

            expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalledWith(
              'clinicID123',
              'patient2',
              {
                id: 'patient2',
                email: 'patient2@test.ca',
                fullName: 'Patient Two',
                birthDate: '1999-02-02',
                mrn: 'MRN123',
                permissions: { custodian : undefined },
                summary: {
                  bgmStats: {
                    dates: {
                      lastData: expect.any(String),
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
                      lastData: expect.any(String),
                    },
                    periods: {
                      '14d': {
                        glucoseManagementIndicator: 7.75,
                        timeCGMUseMinutes: 1380,
                        timeCGMUsePercent: 0.85,
                      },
                    },
                  },
                },
                tags: ['tag1'],
                sites: [{ id: 'site-3-id', name: 'Site Charlie' }],
                reviews: [{ clinicianId: 'clinicianUserId123', time: yesterday }],
              },
              expect.any(Function), // callback fn passed to api
            );
          }, TEST_TIMEOUT_MS);
        });

        describe('managing clinic patient tags', () => {
          it('should allow creating a new tag for a workspace', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Open the Edit Sites Dialog
            await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
            await userEvent.click(screen.getByRole('button', { name: /Edit Tags/ }));

            // Type in a new tag "Delta" into the textbox and click add
            const newTag = await screen.findByRole('textbox');
            await userEvent.click(newTag);
            await userEvent.paste('Tag Delta');
            await userEvent.click(screen.getByRole('button', { name: /Add/ }));

            await waitFor(() => expect(defaultProps.api.clinics.createClinicPatientTag).toHaveBeenCalled());

            expect(defaultProps.api.clinics.createClinicPatientTag).toHaveBeenCalledWith(
              'clinicID123', // clinicId,
              { name: 'Tag Delta' }, // new site to be created
              expect.any(Function), // callback fn passed to api
            );

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Edit clinic tags add',
              { clinicId: 'clinicID123' },
            );
          }, TEST_TIMEOUT_MS);
        });

        it('should allow updating an existing tag for a workspace', async () => {
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          // Open the Edit Tags Dialog
          await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
          await userEvent.click(screen.getByRole('button', { name: /Edit Tags/ }));

          // Click on Icon to edit tag 2. Dialog titled ` Update "test tag 2" ` should be open
          await userEvent.click(screen.getByTestId('edit-tag-button-tag2'));
          expect(screen.getByText('Update "test tag 2"')).toBeInTheDocument();

          // Change the name of the tag, then click "Update" button
          const editTagNameInputField = screen.getByRole('textbox');
          expect(editTagNameInputField).toHaveValue('test tag 2');

          await userEvent.clear(editTagNameInputField);
          await userEvent.click(editTagNameInputField);
          await userEvent.paste('updated tag 2');
          expect(editTagNameInputField).toHaveValue('updated tag 2');

          await userEvent.click(screen.getByRole('button', { name: /Update/ }));

          await waitFor(() => expect(defaultProps.api.clinics.updateClinicPatientTag).toHaveBeenCalled());

          expect(defaultProps.api.clinics.updateClinicPatientTag).toHaveBeenCalledWith(
            'clinicID123', // clinicId,
            'tag2', // tag id
            { name: 'updated tag 2' }, // updated tag
            expect.any(Function), // callback fn passed to api
          );

          expect(defaultProps.trackMetric).toHaveBeenCalledWith(
            'Clinic - Population Health - Edit clinic tags update',
            { clinicId: 'clinicID123' },
          );
        }, TEST_TIMEOUT_MS);

        it('should allow deleting an existing site for a workspace', async () => {
          render(
            <MockedProviderWrappers>
              <ClinicPatients {...defaultProps} />
            </MockedProviderWrappers>
          );

          // Open the Edit Sites Dialog
          await userEvent.click(screen.getByRole('button', { name: /Tags/ }));
          await userEvent.click(screen.getByRole('button', { name: /Edit Tags/ }));

          // Click on Icon to delete tag 2. Dialog titled ` Remove "test tag 2" ` should be open
          await userEvent.click(screen.getByTestId('delete-tag-button-tag2'));
          expect(screen.getByText('Remove "test tag 2"')).toBeInTheDocument();

          // Confirm
          await userEvent.click(screen.getByRole('button', { name : /Remove/ }));

          await waitFor(() => expect(defaultProps.api.clinics.deleteClinicPatientTag).toHaveBeenCalled());

          expect(defaultProps.api.clinics.deleteClinicPatientTag).toHaveBeenCalledWith(
            'clinicID123', // clinicId,
            'tag2', // site id
            expect.any(Function), // callback fn passed to api
          );

          expect(defaultProps.trackMetric).toHaveBeenCalledWith(
            'Clinic - Population Health - Edit clinic tags delete',
            { clinicId: 'clinicID123' },
          );
        }, TEST_TIMEOUT_MS);

        describe('managing patient tags', () => {
          it('should allow updating tags for a patient', async () => {
            render(
              <MockedProviderWrappers>
                <ClinicPatients {...defaultProps} />
              </MockedProviderWrappers>
            );

            // Click the Edit Tags icon for a patient. The Dialog for Edit Patient Details should open.
            expect(screen.queryByText('Edit Patient Details')).not.toBeInTheDocument();
            await userEvent.click(screen.getAllByTestId('edit-tags-icon')[0]); // Open patient2
            expect(screen.getByText('Edit Patient Details')).toBeInTheDocument();

            // Add Tag 3 and remove Tag 1, then save
            await userEvent.click(screen.getAllByRole('combobox')[0]); // open combobox dropdown
            await userEvent.click(screen.getByText('ttest tag 3', { selector: 'div' }));
            await userEvent.click(screen.getByLabelText(/Remove test tag 1/));
            await userEvent.click(screen.getByRole('button', { name: /Save Changes/ }));

            await waitFor(() => expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalled());

            expect(defaultProps.api.clinics.updateClinicPatient).toHaveBeenCalledWith(
              'clinicID123',
              'patient2',
              {
                id: 'patient2',
                email: 'patient2@test.ca',
                fullName: 'Patient Two',
                birthDate: '1999-02-02',
                mrn: 'MRN123',
                permissions: { custodian : undefined },
                summary: {
                  bgmStats: {
                    dates: {
                      lastData: expect.any(String),
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
                      lastData: expect.any(String),
                    },
                    periods: {
                      '14d': {
                        glucoseManagementIndicator: 7.75,
                        timeCGMUseMinutes: 1380,
                        timeCGMUsePercent: 0.85,
                      },
                    },
                  },
                },
                tags: ['tag3'],
                sites: [{ id: 'site-1-id', name: 'Site Alpha' }],
                reviews: [{ clinicianId: 'clinicianUserId123', time: yesterday }],
              },
              expect.any(Function), // callback fn passed to api
            );
          }, TEST_TIMEOUT_MS);
        });
      });
    });
  });
});
