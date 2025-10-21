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
});
