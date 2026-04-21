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

  const getWrapper = (store) => ({ children }) => (
    <Provider store={store}>{children}</Provider>
  );

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

  // allUsersMap must key patient by currentPatientInViewId (selectPatient) and user by loggedInUserId (selectUser)
  const makePatientState = (extra = {}) => ({
    blip: {
      data: { metaData: {} },
      pdf: {},
      allUsersMap: {
        [patientId]: { userid: patientId, profile: {} },
        [userId]: { userid: userId, profile: {}, roles: ['CLINIC_ADMIN'] },
      },
      currentPatientInViewId: patientId,
      loggedInUserId: userId,
      selectedClinicId: clinicId,
      clinics: { [clinicId]: { patients: { [patientId]: { fullName: 'Test Patient' } } } },
      ...extra,
    },
  });

  describe('When another patient data is in state (CLEARING_CACHE)', () => {
    it('returns CLEARING_CACHE status and dispatches cache cleanup actions when wrong patient', () => {
      const state = makePatientState({
        data: { metaData: { patientId: 'patient-5' } },
        pdf: { opts: { requestId: '1234-abcd-5678-qwer' } },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.CLEARING_CACHE);
      expect(actions.worker.removeGeneratedPDFS).toHaveBeenCalledTimes(1);
      expect(actions.worker.dataWorkerRemoveDataRequest).toHaveBeenCalledWith(null, patientId);
    });

    it('returns CLEARING_CACHE status and dispatches cache cleanup actions when wrong requestId', () => {
      const state = makePatientState({
        data: { metaData: { patientId: 'patient-1' } },
        pdf: { opts: { requestId: '87436-askdbfsbf' } },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.CLEARING_CACHE);
      expect(actions.worker.removeGeneratedPDFS).toHaveBeenCalledTimes(1);
      expect(actions.worker.dataWorkerRemoveDataRequest).toHaveBeenCalledWith(null, patientId);
    });
  });

  describe('When state is empty (FETCHING_MODAL_DATA)', () => {
    it('returns FETCHING_MODAL_DATA status and dispatches initial fetches', () => {
      const state = makePatientState({
        data: { metaData: {} },
        pdf: {},
        allUsersMap: {},
        currentPatientInViewId: null,
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.FETCHING_MODAL_DATA);
      expect(actions.async.fetchPatientLatestDatums).toHaveBeenCalledWith(api, patientId);
      expect(actions.async.fetchPatient).toHaveBeenCalledWith(api, patientId);
    });

    it('returns canPrint: false before modal data loads', () => {
      const state = makePatientState({ data: { metaData: {} }, pdf: {}, allUsersMap: {}, currentPatientInViewId: null });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.canPrint).toBe(false);
      expect(result.current.modalData.latestDatumByType).toBeNull();
    });
  });

  describe('When modal data is ready (AWAITING_INPUT)', () => {
    const latestDatumByType = { cbg: { normalTime: '2025-01-01' } };

    it('returns AWAITING_INPUT status and enables printing', () => {
      const state = makePatientState({
        data: { metaData: { patientId, latestDatumByType } },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.AWAITING_INPUT);
      expect(result.current.canPrint).toBe(true);
    });

    it('exposes latestDatumByType in modalData once canPrint is true', () => {
      const state = makePatientState({
        data: { metaData: { patientId, latestDatumByType } },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.modalData.latestDatumByType).toEqual(latestDatumByType);
    });

    it('opens a print window when print() is called', () => {
      const state = makePatientState({
        data: { metaData: { patientId, latestDatumByType } },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      act(() => {
        result.current.print({
          basics: { disabled: false, endpoints: [moment.utc('2025-01-01').valueOf(), moment.utc('2025-01-15').valueOf()] },
        });
      });

      expect(mockOpenPrintWindow).toHaveBeenCalledTimes(1);
    });
  });

  describe('When there is no patient data (NO_PATIENT_DATA)', () => {
    it('returns NO_PATIENT_DATA status', () => {
      const state = makePatientState({
        data: { metaData: { patientId, size: 0 } },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.NO_PATIENT_DATA);
      expect(result.current.canPrint).toBe(false);
    });
  });

  describe('When PDF data exists in state (GENERATING_AGP)', () => {
    it('returns GENERATING_AGP status and calls generateAGPImages with enabled report types', () => {
      const state = makePatientState({
        data: { metaData: { patientId } },
        pdf: {
          data: { agpCGM: { current: 'stats' } },
          opts: {
            agpCGM: { disabled: false },
            agpBGM: { disabled: true },
          },
        },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.GENERATING_AGP);
      expect(mockGenerateAGPImages).toHaveBeenCalledWith(
        state.blip.pdf,
        ['agpCGM'], // only enabled report types
      );
    });

    it('includes agpBGM in report types when it is enabled', () => {
      const state = makePatientState({
        data: { metaData: { patientId } },
        pdf: {
          data: { agpBGM: { current: 'stats' } },
          opts: {
            agpCGM: { disabled: true },
            agpBGM: { disabled: false },
          },
        },
      });
      const store = mockStore(state);

      renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(mockGenerateAGPImages).toHaveBeenCalledWith(
        state.blip.pdf,
        ['agpBGM'],
      );
    });
  });

  describe('When SVG images are in state (ATTACHING_SVGS)', () => {
    it('returns ATTACHING_SVGS status and dispatches a second generatePDFRequest', () => {
      const state = makePatientState({
        data: { metaData: { patientId } },
        pdf: {
          data: { agpCGM: { current: 'stats' } },
          opts: {
            agpCGM: { disabled: false },
            svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg+xml...' } },
          },
        },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.ATTACHING_SVGS);
      expect(actions.worker.generatePDFRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('When the combined PDF URL is in state (TRIGGERING_PRINT)', () => {
    it('returns TRIGGERING_PRINT status and triggers the print window', () => {
      const state = makePatientState({
        data: { metaData: { patientId } },
        pdf: {
          combined: { url: 'blob:http://localhost/pdf-url' },
          opts: {
            requestId: '1234-abcd-5678-qwer',
            svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg+xml...' } },
          },
        },
      });
      const store = mockStore(state);

      const { result } = renderHook(
        () => usePrintPDF(api, patientId, onPrintTriggered),
        { wrapper: getWrapper(store) },
      );

      expect(result.current.status).toBe(STATUS.TRIGGERING_PRINT);
      expect(mockTriggerPrint).toHaveBeenCalledWith(state.blip.pdf);
    });
  });
});
