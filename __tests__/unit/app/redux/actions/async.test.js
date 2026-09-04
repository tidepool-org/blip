/* global jest */
/* global describe */
/* global it */
/* global expect */
/* global afterEach */

import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import trackingMiddleware from '../../../../../app/redux/utils/trackingMiddleware';

import initialState from '../../../../../app/redux/reducers/initialState';

import * as ErrorMessages from '../../../../../app/redux/constants/errorMessages';

// need to require() async in order to rewire utils inside
const async = require('../../../../../app/redux/actions/async');

describe('Actions', () => {
  const trackMetric = jest.fn();
  const mockStore = configureStore([
    thunk,
    trackingMiddleware({ metrics: { track: trackMetric } }),
  ]);

  describe('Asynchronous Actions', () => {
    describe('createClinicSite', () => {
      it('should trigger CREATE_CLINIC_SITE_SUCCESS and it should call clinics.createClinicSite once for a successful request', () => {
        const clinicId = 'clinicId1';
        const newSite = { id: 'site-alpha-id', name: 'Site Alpha' };

        let api = {
          clinics: {
            createClinicSite: jest.fn().mockImplementation((_arg1, _arg2, cb) => cb(null, newSite)),
          },
        };

        let expectedActions = [
          { type: 'CREATE_CLINIC_SITE_REQUEST' },
          { type: 'CREATE_CLINIC_SITE_SUCCESS', payload: { clinicId, site: newSite } },
        ];

        let store = mockStore({ blip: initialState });
        store.dispatch(async.createClinicSite(api, clinicId, { name: 'Site Alpha' }));

        const actions = store.getActions();
        expect(actions).toStrictEqual(expectedActions);
        expect(api.clinics.createClinicSite).toHaveBeenCalledTimes(1);
      });

      it('should trigger CREATE_CLINIC_SITE_FAILURE and it should call error once for a failed request', () => {
        let clinicId = 'clinicId1';

        let api = {
          clinics: {
            createClinicSite: jest.fn().mockImplementation((_arg1, _arg2, cb) => cb({ status: 500, body: 'Error!' }, null)),
          },
        };

        let err = new Error(ErrorMessages.ERR_CREATING_CLINIC_SITE);
        err.status = 500;

        let expectedActions = [
          { type: 'CREATE_CLINIC_SITE_REQUEST' },
          { type: 'CREATE_CLINIC_SITE_FAILURE', error: err, meta: { apiError: { status: 500, body: 'Error!' } } },
        ];

        let store = mockStore({ blip: initialState });
        store.dispatch(async.createClinicSite(api, clinicId, { name: 'Site Charlie' }));

        const actions = store.getActions();
        expect(actions).toStrictEqual(expectedActions);
        expect(api.clinics.createClinicSite).toHaveBeenCalledTimes(1);
      });
    });

    describe('selectClinic', () => {
      const clinicId = 'clinic123';

      const expectedUIDetails = {
        entitlements: {
          patientTags: false,
          clinicSites: false,
          prescriptions: false,
          rpmReport: false,
          summaryDashboard: false,
          tideDashboard: false,
        },
        patientLimitEnforced: false,
        planName: 'internationalBase',
        ui: {
          display: {
            patientCount: true,
            patientLimit: false,
            planName: false,
            workspacePlan: false,
            workspaceLimitDescription: false,
            workspaceLimitFeedback: false,
            workspaceLimitResolutionLink: false,
          },
          text: {
            planDisplayName: 'Base',
            limitDescription: undefined,
            limitFeedback: undefined,
            limitResolutionLink: undefined,
          },
          warnings: {
            limitApproaching: false,
            limitReached: false,
          },
        },
      };

      afterEach(() => {
        localStorage.clear();
      });

      it('should trigger SELECT_CLINIC_SUCCESS, FETCH_CLINIC_PATIENT_COUNTS_SUCCESS, and FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS for a successful request', () => {
        const countResults = { plan: 33 };
        const settingsResults = { bar: 'baz' };

        localStorage.setItem('tideDashboardFilters/user456/clinic123', JSON.stringify({ lastData: 7, patientTags: ['load1'] })); // this one should load
        localStorage.setItem('tideDashboardFilters/wrongUser/clinic123', JSON.stringify({ lastData: 1 }));
        localStorage.setItem('tideDashboardFilters/user456/wrongClinic', JSON.stringify({ lastData: 30 }));

        let api = {
          clinics: {
            getClinicPatientCount: jest.fn().mockImplementation((_arg1, cb) => cb(null, countResults)),
            getClinicPatientCountSettings: jest.fn().mockImplementation((_arg1, cb) => cb(null, settingsResults)),
          },
        };

        let expectedActions = [
          { type: 'SELECT_CLINIC_SUCCESS', payload: { clinicId, tideDashboardFilters: { lastData: 7, patientTags: ['load1'] } } }, // filters load from localState
          { type: 'FETCH_CLINIC_PATIENT_COUNTS_REQUEST' },
          { type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST' },
          { type: 'FETCH_CLINIC_PATIENT_COUNTS_SUCCESS', payload: { clinicId, patientCounts: countResults } },
          { type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_SUCCESS', payload: { clinicId, patientCountSettings: settingsResults } },
          { type: 'SET_CLINIC_UI_DETAILS', payload: { clinicId, uiDetails: expectedUIDetails } },
        ];

        let store = mockStore({ blip: {
          ...initialState,
          loggedInUserId: 'user456',
          clinics: {
            [clinicId]: {
              patientCounts: undefined,
              patientCountSettings: undefined,
            },
          },
        } });

        store.dispatch(async.selectClinic(api, clinicId));

        const actions = store.getActions();
        expect(actions).toStrictEqual(expectedActions);
        expect(api.clinics.getClinicPatientCount).toHaveBeenCalledWith(clinicId, expect.any(Function));
        expect(api.clinics.getClinicPatientCount).toHaveBeenCalledTimes(1);
        expect(api.clinics.getClinicPatientCountSettings).toHaveBeenCalledWith(clinicId, expect.any(Function));
        expect(api.clinics.getClinicPatientCountSettings).toHaveBeenCalledTimes(1);
      });

      it('should trigger SELECT_CLINIC_SUCCESS, but not FETCH_CLINIC_PATIENT_COUNTS_REQUEST or FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST for a successful request if data available in clinic state', () => {
        let api = {
          clinics: {
            getClinicPatientCount: jest.fn(),
            getClinicPatientCountSettings: jest.fn(),
          },
        };

        let expectedActions = [
          { type: 'SELECT_CLINIC_SUCCESS', payload: { clinicId, tideDashboardFilters: undefined } },
          { type: 'SET_CLINIC_UI_DETAILS', payload: { clinicId, uiDetails: expectedUIDetails } },
        ];

        let store = mockStore({ blip: {
          ...initialState,
          clinics: {
            [clinicId]: {
              patientCounts: { plan: 33 },
              patientCountSettings: { foo: 'bar' },
            },
          },
        } });

        store.dispatch(async.selectClinic(api, clinicId));

        const actions = store.getActions();
        expect(actions).toStrictEqual(expectedActions);
        expect(api.clinics.getClinicPatientCount).not.toHaveBeenCalled();
        expect(api.clinics.getClinicPatientCountSettings).not.toHaveBeenCalled();
      });

      it('should trigger FETCH_CLINIC_PATIENT_COUNTS_FAILURE and FETCH_CLINIC_PATIENT_COUNT_SETTINGS_FAILURE and it should call error once for a failed request', () => {
        let api = {
          clinics: {
            getClinicPatientCount: jest.fn().mockImplementation((_arg1, cb) => cb({ status: 500, body: 'Count Error!' }, null)),
            getClinicPatientCountSettings: jest.fn().mockImplementation((_arg1, cb) => cb({ status: 500, body: 'Settings Error!' }, null)),
          },
        };

        let countErr = new Error(ErrorMessages.ERR_FETCHING_CLINIC_PATIENT_COUNTS);
        countErr.status = 500;

        let settingsErr = new Error(ErrorMessages.ERR_FETCHING_CLINIC_PATIENT_COUNT_SETTINGS);
        settingsErr.status = 500;

        let expectedActions = [
          { type: 'SELECT_CLINIC_SUCCESS', payload: { clinicId, tideDashboardFilters: undefined } },
          { type: 'FETCH_CLINIC_PATIENT_COUNTS_REQUEST' },
          { type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_REQUEST' },
          {
            type: 'FETCH_CLINIC_PATIENT_COUNTS_FAILURE',
            error: countErr,
            meta: { apiError: { status: 500, body: 'Count Error!' } },
          },
          {
            type: 'FETCH_CLINIC_PATIENT_COUNT_SETTINGS_FAILURE',
            error: settingsErr,
            meta: { apiError: { status: 500, body: 'Settings Error!' } },
          },
        ];

        let store = mockStore({ blip: {
          ...initialState,
          clinics: {
            [clinicId]: {
              patientCounts: undefined,
              patientCountSettings: undefined,
            },
          },
        } });

        store.dispatch(async.selectClinic(api, clinicId));

        const actions = store.getActions();
        expect(actions).toStrictEqual(expectedActions);
        expect(api.clinics.getClinicPatientCount).toHaveBeenCalledWith(clinicId, expect.any(Function));
        expect(api.clinics.getClinicPatientCount).toHaveBeenCalledTimes(1);
        expect(api.clinics.getClinicPatientCountSettings).toHaveBeenCalledWith(clinicId, expect.any(Function));
        expect(api.clinics.getClinicPatientCountSettings).toHaveBeenCalledTimes(1);
      });
    });
  });
});
