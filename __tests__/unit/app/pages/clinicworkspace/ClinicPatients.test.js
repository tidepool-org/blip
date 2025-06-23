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

import { ToastProvider } from '@app/providers/ToastProvider';
import { clinicUIDetails } from '@app/core/clinicUtils';
import ClinicPatients from '@app/pages/clinicworkspace/ClinicPatients';

import mockLocalStorage from '../../../../utils/mockLocalStorage';

import { useLDClient, useFlags } from 'launchdarkly-react-client-sdk';
jest.mock('launchdarkly-react-client-sdk');

const TEST_TIMEOUT_MS = 30_000;

describe('ClinicPatients', ()  => {
  const today = moment('2025-05-29T00:00:00Z').toISOString();
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

        describe('filtering for patients', () => {
          afterEach(() => {
            // Clear any persisted filter state between tests
            localStorage.clear();
          });

          it('should allow filtering by sites', async () => {
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

            expect(defaultProps.api.clinics.getPatientsForClinic).toHaveBeenCalledWith(
              'clinicID123',
              { sites: ['site-1-id', 'site-2-id'], limit: 50, offset: 0, period: '14d', sortType: 'cgm', sort: '-lastData' },
              expect.any(Function),
            );

            expect(defaultProps.trackMetric).toHaveBeenCalledWith(
              'Clinic - Population Health - Clinic sites filter apply',
              { clinicId: 'clinicID123' },
            );
          }, TEST_TIMEOUT_MS);

          it('should allow filtering by for patients with zero sites', async () => {
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
                      lastData: '2025-05-28T00:00:00.000Z',
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
                      lastData: '2025-05-29T00:00:00.000Z',
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
                      lastData: '2025-05-28T00:00:00.000Z',
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
                      lastData: '2025-05-29T00:00:00.000Z',
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
