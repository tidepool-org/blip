/* global jest */
/* global expect */
/* global describe */
/* global it */
/* global beforeEach */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks/dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moment from 'moment';

import usePrintPDF, { STATUS } from '@app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF/usePrintPDF';
import * as actions from '@app/redux/actions';
import usePrintWindow from '@app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF/usePrintWindow';
import { useGenerateAGPImages } from '@app/core/agpUtils';

const mockStore = configureStore([thunk]);

jest.mock('@app/redux/actions', () => ({
  worker: {
    removeGeneratedPDFS: jest.fn(),
    dataWorkerRemoveDataRequest: jest.fn(),
    generatePDFRequest: jest.fn(),
  },
  async: {
    fetchPatientLatestDatums: jest.fn(),
    fetchPatientData: jest.fn(),
    fetchPatient: jest.fn(),
  },
}));

jest.mock('@app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF/usePrintWindow');
jest.mock('@app/core/agpUtils');

const mockOpenPrintWindow = jest.fn();
const mockTriggerPrint = jest.fn();
const mockGenerateAGPImages = jest.fn();

describe('usePrintPDF', () => {
  const patientId = 'patient-1';
  const userId = 'user-1';
  const clinicId = 'clinic-1';
  const api = { foo: 'bar' };
  const onPrintTriggered = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    usePrintWindow.mockReturnValue({
      openPrintWindow: mockOpenPrintWindow,
      triggerPrint: mockTriggerPrint,
    });

    useGenerateAGPImages.mockReturnValue(mockGenerateAGPImages);

    jest.spyOn(crypto, 'randomUUID').mockReturnValue('1234-abcd-5678-qwer');

    actions.worker.removeGeneratedPDFS.mockReturnValue({ type: 'REMOVE_GENERATED_PDFS' });
    actions.worker.dataWorkerRemoveDataRequest.mockReturnValue({ type: 'DATA_WORKER_REMOVE_DATA_REQUEST' });
    actions.worker.generatePDFRequest.mockReturnValue({ type: 'GENERATE_PDF_REQUEST' });
    actions.async.fetchPatientLatestDatums.mockReturnValue({ type: 'FETCH_PATIENT_LATEST_DATUMS' });
    actions.async.fetchPatientData.mockReturnValue({ type: 'FETCH_PATIENT_DATA' });
    actions.async.fetchPatient.mockReturnValue({ type: 'FETCH_PATIENT' });
  });

  describe('When another patient data is in state ', () => {
    it('dispatches cache cleanup actions', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId: 'patient-5' } },
          pdf: { opts: { requestId: '1234-abcd-5678-qwer' } },
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.CLEARING_CACHE);
      expect(onPrintTriggered).not.toHaveBeenCalled();
      expect(actions.worker.removeGeneratedPDFS).toHaveBeenCalledTimes(1);
      expect(actions.worker.dataWorkerRemoveDataRequest).toHaveBeenCalledWith(null, patientId);
      expect(result.current.modalData.latestDatumByType).toBeNull();
    });

    it('dispatches cache cleanup actions when wrong requestId', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId: 'patient-1' } },
          pdf: { opts: { requestId: '87436-askdbfsbf' } },
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.CLEARING_CACHE);
      expect(onPrintTriggered).not.toHaveBeenCalled();
      expect(actions.worker.removeGeneratedPDFS).toHaveBeenCalledTimes(1);
      expect(actions.worker.dataWorkerRemoveDataRequest).toHaveBeenCalledWith(null, patientId);
      expect(result.current.modalData.latestDatumByType).toBeNull();
    });
  });

  describe('When no patient data is loaded into state', () => {
    it('returns FETCHING_MODAL_DATA status and dispatches initial fetches', () => {
      const store = mockStore({
        blip: {
          data: { metaData: {} },
          pdf: {},
          allUsersMap: {},
          currentPatientInViewId: null,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.FETCHING_MODAL_DATA);
      expect(onPrintTriggered).not.toHaveBeenCalled();
      expect(actions.async.fetchPatientLatestDatums).toHaveBeenCalledWith(api, patientId);
      expect(actions.async.fetchPatient).toHaveBeenCalledWith(api, patientId);

      expect(result.current.canPrint).toBe(false);
      expect(result.current.modalData.latestDatumByType).toBeNull();
    });
  });

  describe('When modal data is ready for user print confirmation', () => {
    const latestDatumByType = { cbg: { normalTime: '2025-01-01' } };

    it('returns AWAITING_INPUT status and enables printing', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId, latestDatumByType } },
          pdf: {},
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.AWAITING_INPUT);
      expect(onPrintTriggered).not.toHaveBeenCalled();
      expect(result.current.canPrint).toBe(true);
      expect(result.current.modalData.latestDatumByType).toEqual(latestDatumByType);
    });

    it('opens a print window when print() is called', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId, latestDatumByType } },
          pdf: {},
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      act(() => {
        result.current.print({
          basics: { disabled: false, endpoints: [moment.utc('2025-01-01').valueOf(), moment.utc('2025-01-15').valueOf()] },
        });
      });

      expect(mockOpenPrintWindow).toHaveBeenCalledTimes(1);
    });
  });

  describe('When there is no patient data', () => {
    it('returns NO_PATIENT_DATA status', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId, size: 0 } },
          pdf: {},
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.NO_PATIENT_DATA);
      expect(result.current.canPrint).toBe(false);
    });
  });

  describe('When PDF data exists in state', () => {
    it('returns GENERATING_AGP status and calls generateAGPImages with enabled report types', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId } },
          pdf: {
            data: { agpCGM: { current: 'stats' } },
            opts: { agpCGM: { disabled: false }, agpBGM: { disabled: true } },
          },
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.GENERATING_AGP);
      expect(mockGenerateAGPImages).toHaveBeenCalledWith(
        store.getState().blip.pdf,
        ['agpCGM'], // only enabled report types
      );
    });

    it('includes agpBGM in report types when it is enabled', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId } },
          pdf: {
            data: { agpBGM: { current: 'stats' } },
            opts: {
              agpCGM: { disabled: true },
              agpBGM: { disabled: false },
            },
          },
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(mockGenerateAGPImages).toHaveBeenCalledWith(
        store.getState().blip.pdf,
        ['agpBGM'],
      );
    });
  });

  describe('When SVG images are in state', () => {
    it('returns ATTACHING_SVGS status and dispatches a second generatePDFRequest', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId } },
          pdf: {
            data: { agpCGM: { current: 'stats' } },
            opts: {
              agpCGM: { disabled: false },
              svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg+xml...' } },
            },
          },
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.ATTACHING_SVGS);
      expect(actions.worker.generatePDFRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('When the combined PDF URL is in state (TRIGGERING_PRINT)', () => {
    it('returns TRIGGERING_PRINT status and triggers the print window', () => {
      const store = mockStore({
        blip: {
          data: { metaData: { patientId } },
          pdf: {
            combined: { url: 'blob:http://localhost/pdf-url' },
            opts: {
              requestId: '1234-abcd-5678-qwer',
              svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg+xml...' } },
            },
          },
          allUsersMap: {
            [patientId]: { userid: patientId, profile: {} },
            [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
          },
          currentPatientInViewId: patientId,
          loggedInUserId: userId,
          selectedClinicId: clinicId,
          clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
        },
      });

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
      );

      expect(result.current.status).toBe(STATUS.TRIGGERING_PRINT);
      expect(mockTriggerPrint).toHaveBeenCalledWith(store.getState().blip.pdf);
    });
  });
});
