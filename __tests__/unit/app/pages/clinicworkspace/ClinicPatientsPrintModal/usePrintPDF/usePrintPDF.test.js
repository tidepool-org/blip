/* global jest */
/* global expect */
/* global describe */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks/dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import moment from 'moment';

import usePrintPDF, { STATUS } from '@app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF/usePrintPDF';
import * as actions from '@app/redux/actions';
import { useToasts } from '@app/providers/ToastProvider';
import { useGenerateReportMutation } from '@app/redux/api/reportApi';

const mockStore = configureStore([thunk]);

jest.mock('@app/redux/actions', () => ({
  worker: {
    removeGeneratedPDFS: jest.fn(),
    dataWorkerRemoveDataRequest: jest.fn(),
  },
  async: {
    fetchPatientLatestDatums: jest.fn(),
    fetchPatient: jest.fn(),
  },
}));

jest.mock('@app/providers/ToastProvider', () => {
  const actual = jest.requireActual('@app/providers/ToastProvider');
  return { ...actual, useToasts: jest.fn() };
});

jest.mock('react-i18next', () => {
  const actual = jest.requireActual('react-i18next');
  return { ...actual, useTranslation: () => ({ t: (key) => key }) };
});

jest.mock('@app/redux/api/reportApi', () => ({
  useGenerateReportMutation: jest.fn(),
}));

describe('usePrintPDF', () => {
  const patientId = 'patient-1';
  const userId = 'user-1';
  const clinicId = 'clinic-1';
  const api = { foo: 'bar' };
  const onPrintTriggered = jest.fn();

  let setToast;
  let unwrap;
  let generateReport;
  let openStub;
  let mockWindow;

  // A typical state where modal data has loaded and the user can confirm printing.
  const readyStore = (overrides = {}) => mockStore({
    blip: {
      data: { metaData: { patientId, latestTimeZone: 'US/Eastern', latestDatumByType: { cbg: {} } } },
      pdf: {},
      allUsersMap: {
        [patientId]: { userid: patientId, profile: { fullName: 'Test Patient', patient: { birthday: '2010-10-10', mrn: 'mrn-123' } } },
        [userId]: { userid: userId, profile: {}, roles: ['clinic'] },
      },
      currentPatientInViewId: patientId,
      loggedInUserId: userId,
      selectedClinicId: clinicId,
      clinics: { [clinicId]: { preferredBgUnits: 'mg/dL', patients: { [patientId]: { id: patientId, fullName: 'Test Patient' } } } },
      ...overrides,
    },
  });

  const renderPrintHook = (store) => renderHook(
    () => usePrintPDF(api, patientId, onPrintTriggered),
    { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
  );

  beforeEach(() => {
    jest.clearAllMocks();

    setToast = jest.fn();
    useToasts.mockReturnValue({ set: setToast });

    unwrap = jest.fn().mockResolvedValue(new Blob(['%PDF'], { type: 'application/octet-stream' }));
    generateReport = jest.fn(() => ({ unwrap }));
    useGenerateReportMutation.mockReturnValue([generateReport]);

    mockWindow = { location: { href: '' }, close: jest.fn() };
    openStub = jest.spyOn(window, 'open').mockReturnValue(mockWindow);

    jest.spyOn(crypto, 'randomUUID').mockReturnValue('1234-abcd-5678-qwer');

    actions.worker.removeGeneratedPDFS.mockReturnValue({ type: 'REMOVE_GENERATED_PDFS' });
    actions.worker.dataWorkerRemoveDataRequest.mockReturnValue({ type: 'DATA_WORKER_REMOVE_DATA_REQUEST' });
    actions.async.fetchPatientLatestDatums.mockReturnValue({ type: 'FETCH_PATIENT_LATEST_DATUMS' });
    actions.async.fetchPatient.mockReturnValue({ type: 'FETCH_PATIENT' });
  });

  afterEach(() => {
    openStub.mockRestore();
  });

  describe('When another patient data is in state', () => {
    it('dispatches cache cleanup actions', () => {
      const store = readyStore({ data: { metaData: { patientId: 'patient-5' } }, pdf: { opts: { requestId: '1234-abcd-5678-qwer' } } });
      const { result } = renderPrintHook(store);

      expect(result.current.status).toBe(STATUS.CLEARING_CACHE);
      expect(onPrintTriggered).not.toHaveBeenCalled();
      expect(actions.worker.removeGeneratedPDFS).toHaveBeenCalledTimes(1);
      expect(actions.worker.dataWorkerRemoveDataRequest).toHaveBeenCalledWith(null, patientId);
      expect(result.current.modalData.latestDatumByType).toBeNull();
    });
  });

  describe('When no patient data is loaded into state', () => {
    it('returns FETCHING_MODAL_DATA status and dispatches the modal-data fetches', () => {
      const store = readyStore({ data: { metaData: {} }, currentPatientInViewId: null, allUsersMap: {} });
      const { result } = renderPrintHook(store);

      expect(result.current.status).toBe(STATUS.FETCHING_MODAL_DATA);
      expect(actions.async.fetchPatientLatestDatums).toHaveBeenCalledWith(api, patientId);
      expect(actions.async.fetchPatient).toHaveBeenCalledWith(api, patientId);
      expect(result.current.canPrint).toBe(false);
    });
  });

  describe('When there is no patient data', () => {
    it('returns NO_PATIENT_DATA status', () => {
      const store = readyStore({ data: { metaData: { patientId, size: 0 } } });
      const { result } = renderPrintHook(store);

      expect(result.current.status).toBe(STATUS.NO_PATIENT_DATA);
      expect(result.current.canPrint).toBe(false);
    });
  });

  describe('When modal data is ready for user print confirmation', () => {
    it('returns AWAITING_INPUT status and enables printing', () => {
      const { result } = renderPrintHook(readyStore());

      expect(result.current.status).toBe(STATUS.AWAITING_INPUT);
      expect(result.current.canPrint).toBe(true);
      expect(result.current.modalData.latestDatumByType).toEqual({ cbg: {} });
    });

    it('posts the report request and opens the PDF in the tab', async () => {
      const { result } = renderPrintHook(readyStore());

      await act(async () => {
        await result.current.print({
          basics: { disabled: false, endpoints: [moment.utc('2026-05-11').valueOf(), moment.utc('2026-06-11').valueOf()] },
          daily: { disabled: false, endpoints: [moment.utc('2026-05-25').valueOf(), moment.utc('2026-06-11').valueOf()], cgmSampleIntervalRange: [300000, Infinity] },
          settings: { disabled: true },
          requestId: '1234-abcd-5678-qwer',
        });
      });

      // Opens the generated PDF blob URL in a new tab.
      expect(window.open).toHaveBeenCalledWith(expect.stringMatching(/^blob:/), '_blank');

      const [[{ patientId: sentPatientId, body }]] = generateReport.mock.calls;
      expect(sentPatientId).toBe(patientId);

      // userDetail is sourced from the (clinician-combined) patient record.
      expect(body.userDetail).toEqual({ userId: patientId, fullName: 'Test Patient', dob: '2010-10-10', mrn: 'mrn-123' });

      // reportDetail carries derived range + only the enabled reports.
      expect(body.reportDetail.bgUnits).toBe('mg/dL');
      expect(body.reportDetail.reports).toEqual(['basics', 'daily']);
      expect(body.reportDetail.startDate).toBe('2026-05-11T00:00:00.000Z');
      expect(body.reportDetail.endDate).toBe('2026-06-11T00:00:00.000Z');

      // printOpts strips the requestId and JSON-normalizes Infinity.
      expect(body.printOpts.requestId).toBeUndefined();
      expect(body.printOpts.daily.cgmSampleIntervalRange).toEqual([300000, Number.MAX_VALUE]);

      expect(onPrintTriggered).toHaveBeenCalledTimes(1);
    });

    it('toasts when report generation fails', async () => {
      unwrap.mockRejectedValueOnce({ status: 500 });
      const { result } = renderPrintHook(readyStore());

      await act(async () => {
        await result.current.print({
          basics: { disabled: false, endpoints: [moment.utc('2026-05-11').valueOf(), moment.utc('2026-06-11').valueOf()] },
        });
      });

      expect(window.open).not.toHaveBeenCalled();
      expect(setToast).toHaveBeenCalledWith(expect.objectContaining({ variant: 'danger' }));
      expect(onPrintTriggered).toHaveBeenCalledTimes(1);
    });
  });
});
