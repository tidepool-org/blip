/* global jest */
/* global expect */
/* global describe */
/* global afterEach */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

import React from 'react';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks/dom';
import _ from 'lodash';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { utils as vizUtils } from '@tidepool/viz';
import Plotly from 'plotly.js-basic-dist-min';

import useAgpCGM from '@app/pages/dashboard/PatientDrawer/useAgpCGM';
import * as actions from '@app/redux/actions';

const mockStore = configureStore([thunk]);

jest.mock('@app/redux/actions', () => ({
  worker: {
    removeGeneratedPDFS: jest.fn(),
    dataWorkerRemoveDataRequest: jest.fn(),
    generatePDFRequest: jest.fn(),
  },
  async: {
    fetchPatientData: jest.fn(),
  },
  sync: {
    generateAGPImagesSuccess: jest.fn(),
  },
}));

jest.mock('plotly.js-basic-dist-min', () => ({
  toImage: jest.fn(),
}));

// The hook mounts correctly without mocking Viz, but we do it in order to mock up
// generateAGPFigureDefinitions specifically and to test that it gets called
jest.mock('@tidepool/viz', () => ({
  ...jest.requireActual('@tidepool/viz'),
  utils: {
    ...jest.requireActual('@tidepool/viz').utils,
    agp: {
    ...jest.requireActual('@tidepool/viz').utils.agp,
    generateAGPFigureDefinitions: jest.fn(),
  },
  },
}));

const idleWorkingState = {
  inProgress: false,
  completed: null,
  notification: null,
};

const inProgressWorkingState = {
  inProgress: true,
  completed: null,
  notification: null,
};

const working = {
  removingGeneratedPDFS: idleWorkingState,
  removingData: idleWorkingState,
  fetchingPatientData: idleWorkingState,
  generatingPDF: idleWorkingState,
};

describe('useAgpCGM', () => {
  const getWrapper = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;

  const patientId = 'patient-1';
  const api = { foo: 'bar' };

  actions.worker.removeGeneratedPDFS.mockReturnValue({ type: 'MOCK_ACTION' });
  actions.worker.dataWorkerRemoveDataRequest.mockReturnValue({ type: 'MOCK_ACTION' });
  actions.worker.generatePDFRequest.mockReturnValue({ type: 'MOCK_ACTION' });
  actions.async.fetchPatientData.mockReturnValue({ type: 'MOCK_ACTION' });
  actions.sync.generateAGPImagesSuccess.mockReturnValue({ type: 'MOCK_ACTION' });
  vizUtils.agp.generateAGPFigureDefinitions.mockReturnValue([]);

  describe('When no patient is selected', () => {
    const state = {
      blip: {
        data: { metaData: {} },
        pdf: {},
        working: {
          removingGeneratedPDFS: idleWorkingState,
          removingData: idleWorkingState,
          fetchingPatientData: idleWorkingState,
          generatingPDF: idleWorkingState,
        },
        selectedClinicId: 'clinicId',
        clinics: {
          clinicId: {
            patients: {},
          },
        },
      },
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns NO_PATIENT status when patientId is null', () => {
      const { result } = renderHook(() => useAgpCGM(api, null), { wrapper });

      expect(result.current).toStrictEqual({
        status: 'NO_PATIENT',
        svgDataURLS: null,
        agpCGM: null,
        offsetAgpCGM: null,
      });
    });

    it('returns NO_PATIENT status when patientId is undefined', () => {
      const { result } = renderHook(() => useAgpCGM(api, undefined), { wrapper });

      expect(result.current).toStrictEqual({
        status: 'NO_PATIENT',
        svgDataURLS: undefined,
        agpCGM: undefined,
        offsetAgpCGM: undefined,
      });
    });

    it('does not dispatch any actions when no patient is selected', () => {
      // Clear mocks before this specific test
      actions.worker.removeGeneratedPDFS.mockClear();
      actions.worker.dataWorkerRemoveDataRequest.mockClear();
      actions.async.fetchPatientData.mockClear();
      actions.worker.generatePDFRequest.mockClear();

      renderHook(() => useAgpCGM(api, null), { wrapper });

      expect(actions.worker.removeGeneratedPDFS).not.toHaveBeenCalled();
      expect(actions.worker.dataWorkerRemoveDataRequest).not.toHaveBeenCalled();
      expect(actions.async.fetchPatientData).not.toHaveBeenCalled();
      expect(actions.worker.generatePDFRequest).not.toHaveBeenCalled();
    });
  });

  describe('When another patients data is in state', () => {
    const state = {
      blip: {
        working,
        data: { metaData: { patientId: 'patient-2' } },
        pdf: { opts: { patient: { id: 'patient-2' } } },
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } },
      },
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins state cleanup', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(actions.worker.removeGeneratedPDFS).toHaveBeenCalledTimes(1);
      expect(actions.worker.dataWorkerRemoveDataRequest).toHaveBeenCalledTimes(1);
      expect(result.current).toStrictEqual({ status: 'INITIALIZED', svgDataURLS: null, agpCGM: null, offsetAgpCGM: null });
    });
  });

  describe('When state is clear', () => {
    const state = {
      blip: {
        working,
        data: { metaData: {} },
        pdf: {},
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } },
      },
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins patient fetch', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(actions.async.fetchPatientData).toHaveBeenCalledTimes(1);
      expect(result.current).toStrictEqual({ status: 'STATE_CLEARED', svgDataURLS: null, agpCGM: null, offsetAgpCGM: null });
    });
  });

  describe('When patient is loaded into state', () => {
    const state = {
      blip: {
        working,
        data: { metaData: { patientId: 'patient-1' } },
        pdf: {},
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } },
      },
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins PDF generation', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(actions.worker.generatePDFRequest).toHaveBeenCalledTimes(1);
      expect(result.current).toStrictEqual({ status: 'PATIENT_LOADED', svgDataURLS: null, agpCGM: null, offsetAgpCGM: null });
    });
  });

  describe('When pdf has been loaded into state', () => {
    const state = {
      blip: {
        working,
        data: { metaData: { patientId: 'patient-1' } },
        pdf: {
          data: {
            agpCGM: { current: 'statistics_data_here' },
            offsetAgpCGM: { current: 'offset_statistics_data_here' },
          },
          opts: { patient: { id: 'patient-1' } },
        },
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } },
      },
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins AGP image generation', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(vizUtils.agp.generateAGPFigureDefinitions).toHaveBeenCalledTimes(1);
      expect(result.current).toStrictEqual({
        status: 'DATA_PROCESSED',
        svgDataURLS: undefined,
        agpCGM: { current: 'statistics_data_here' },
        offsetAgpCGM: { current: 'offset_statistics_data_here' },
      });
    });
  });

  describe('When svgs have been successfully generated', () => {
    const state = {
      blip: {
        working,
        data: { metaData: { patientId: 'patient-1' } },
        pdf: {
          data: {
            agpCGM: { current: 'statistics_data_here' },
            offsetAgpCGM: { current: 'offset_statistics_data_here' },
          },
          opts: {
            patient: { id: 'patient-1' },
            svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg..' } },
          },
        },
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } },
      },
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and returns data', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(result.current).toStrictEqual({
        status: 'SVGS_GENERATED',
        svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg..' } },
        agpCGM: { current: 'statistics_data_here' },
        offsetAgpCGM: { current: 'offset_statistics_data_here' },
      });
    });
  });

  describe('Action in progress checks', () => {
    const patientId = 'somePatientId';

    beforeEach(() => {
      actions.worker.removeGeneratedPDFS.mockClear();
      actions.worker.dataWorkerRemoveDataRequest.mockClear();
      actions.async.fetchPatientData.mockClear();
      actions.worker.generatePDFRequest.mockClear();
    });

    describe('State cleanup actions', () => {
      it('dispatches actions when not in progress during state cleanup', () => {
        const state = {
          blip: {
            data: { metaData: { patientId: 'differentPatientId' } },
            pdf: { opts: { patient: { id: 'anotherDifferentPatientId' } } },
            working: {
              removingGeneratedPDFS: idleWorkingState,
              removingData: idleWorkingState,
              fetchingPatientData: idleWorkingState,
              generatingPDF: idleWorkingState,
            },
            selectedClinicId: 'clinicId',
            clinics: {
              clinicId: {
                patients: {
                  [patientId]: { id: patientId, name: 'Test Patient' },
                },
              },
            },
          },
        };

        const store = mockStore(state);
        const wrapper = getWrapper(store);

        renderHook(() => useAgpCGM(api, patientId), { wrapper });

        expect(actions.worker.removeGeneratedPDFS).toHaveBeenCalled();
        expect(actions.worker.dataWorkerRemoveDataRequest).toHaveBeenCalledWith(null, patientId);
      });

      it('does not dispatch removeGeneratedPDFS nor dataWorkerRemoveDataRequest when already in progress', () => {
        const state = {
          blip: {
            data: { metaData: { patientId: 'differentPatientId' } },
            pdf: { opts: { patient: { id: 'anotherDifferentPatientId' } } },
            working: {
              removingGeneratedPDFS: inProgressWorkingState,
              removingData: inProgressWorkingState,
              fetchingPatientData: idleWorkingState,
              generatingPDF: idleWorkingState,
            },
            selectedClinicId: 'clinicId',
            clinics: {
              clinicId: {
                patients: {
                  [patientId]: { id: patientId, name: 'Test Patient' },
                },
              },
            },
          },
        };

        const store = mockStore(state);
        const wrapper = getWrapper(store);

        renderHook(() => useAgpCGM(api, patientId), { wrapper });

        expect(actions.worker.removeGeneratedPDFS).not.toHaveBeenCalled();
        expect(actions.worker.dataWorkerRemoveDataRequest).not.toHaveBeenCalled();
      });
    });

    describe('Patient fetch actions', () => {
      it('dispatches fetchPatientData when not in progress during state cleared', () => {
        const state = {
          blip: {
            data: { metaData: {} },
            pdf: {},
            working: {
              removingGeneratedPDFS: idleWorkingState,
              removingData: idleWorkingState,
              fetchingPatientData: idleWorkingState,
              generatingPDF: idleWorkingState,
            },
            selectedClinicId: 'clinicId',
            clinics: {
              clinicId: {
                patients: {
                  [patientId]: { id: patientId, name: 'Test Patient' },
                },
              },
            },
          },
        };

        const store = mockStore(state);
        const wrapper = getWrapper(store);

        renderHook(() => useAgpCGM(api, patientId), { wrapper });

        expect(actions.async.fetchPatientData).toHaveBeenCalledWith(
          api,
          expect.objectContaining({
            initial: false,
            forceDataWorkerAddDataRequest: true,
            useCache: false,
          }),
          patientId
        );
      });

      it('does not dispatch fetchPatientData when already in progress', () => {
        const state = {
          blip: {
            data: { metaData: {} },
            pdf: {},
            working: {
              removingGeneratedPDFS: idleWorkingState,
              removingData: idleWorkingState,
              fetchingPatientData: inProgressWorkingState,
              generatingPDF: idleWorkingState,
            },
            selectedClinicId: 'clinicId',
            clinics: {
              clinicId: {
                patients: {
                  [patientId]: { id: patientId, name: 'Test Patient' },
                },
              },
            },
          },
        };

        const store = mockStore(state);
        const wrapper = getWrapper(store);

        renderHook(() => useAgpCGM(api, patientId), { wrapper });

        expect(actions.async.fetchPatientData).not.toHaveBeenCalled();
      });
    });

    describe('PDF generation actions', () => {
      it('dispatches generatePDFRequest when not in progress during patient loaded', () => {
        const state = {
          blip: {
            data: { metaData: { patientId } },
            pdf: {},
            working: {
              removingGeneratedPDFS: idleWorkingState,
              removingData: idleWorkingState,
              fetchingPatientData: idleWorkingState,
              generatingPDF: idleWorkingState,
            },
            selectedClinicId: 'clinicId',
            clinics: {
              clinicId: {
                patients: {
                  [patientId]: { id: patientId, name: 'Test Patient' },
                },
              },
            },
          },
        };

        const store = mockStore(state);
        const wrapper = getWrapper(store);

        renderHook(() => useAgpCGM(api, patientId), { wrapper });

        expect(actions.worker.generatePDFRequest).toHaveBeenCalledWith(
          'combined',
          expect.any(Object),
          expect.objectContaining({
            patient: expect.objectContaining({ id: patientId }),
          }),
          patientId
        );
      });

      it('does not dispatch generatePDFRequest when already in progress', () => {
        const state = {
          blip: {
            data: { metaData: { patientId } },
            pdf: {},
            working: {
              removingGeneratedPDFS: idleWorkingState,
              removingData: idleWorkingState,
              fetchingPatientData: idleWorkingState,
              generatingPDF: inProgressWorkingState,
            },
            selectedClinicId: 'clinicId',
            clinics: {
              clinicId: {
                patients: {
                  [patientId]: { id: patientId, name: 'Test Patient' },
                },
              },
            },
          },
        };

        const store = mockStore(state);
        const wrapper = getWrapper(store);

        renderHook(() => useAgpCGM(api, patientId), { wrapper });

        expect(actions.worker.generatePDFRequest).not.toHaveBeenCalled();
      });
    });
  });
});
