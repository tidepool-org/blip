/* global chai */
/* global describe */
/* global sinon */
/* global afterEach */
/* global context */
/* global it */
/* global beforeEach */
/* global before */
/* global after */

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { renderHook } from '@testing-library/react-hooks/dom';
import _ from 'lodash';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { utils as vizUtils } from '@tidepool/viz';
import Plotly from 'plotly.js-basic-dist-min';

import useAgpCGM from '../../../../../../app/pages/dashboard/PatientDrawer/useAgpCGM';
import * as actions from '../../../../../../app/redux/actions';

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('useAgpCGM', () => {
  const getWrapper = (store) => ({ children }) => <Provider store={store}>{children}</Provider>;

  const patientId = 'patient-1';
  const api = { foo: 'bar' }

  let toImage;
  let generateAGPFigureDefinitions;

  let removeGeneratedPDFS;
  let dataWorkerRemoveDataRequest;
  let fetchPatientData;
  let generatePDFRequest;

  before(() => {
    toImage = sinon.stub(Plotly, 'toImage')
    generateAGPFigureDefinitions = sinon.stub(vizUtils.agp, 'generateAGPFigureDefinitions')

    removeGeneratedPDFS = sinon.stub(actions.worker, 'removeGeneratedPDFS').returns({ type: 'MOCK_ACTION' });
    dataWorkerRemoveDataRequest = sinon.stub(actions.worker, 'dataWorkerRemoveDataRequest').returns({ type: 'MOCK_ACTION' });
    fetchPatientData = sinon.stub(actions.async, 'fetchPatientData').returns({ type: 'MOCK_ACTION' });
    generatePDFRequest = sinon.stub(actions.worker, 'generatePDFRequest').returns({ type: 'MOCK_ACTION' });
  });

  beforeEach(() => {
    toImage.resetHistory();
    generateAGPFigureDefinitions.resetHistory();

    removeGeneratedPDFS.resetHistory();
    dataWorkerRemoveDataRequest.resetHistory();
    fetchPatientData.resetHistory();
    generatePDFRequest.resetHistory();
  });

  after(() => {
    toImage.restore();
    generateAGPFigureDefinitions.restore();

    removeGeneratedPDFS.restore();
    dataWorkerRemoveDataRequest.restore();
    fetchPatientData.restore();
    generatePDFRequest.restore();
  });

  context('When another patients data is in state', () => {
    const state = {
      blip: {
        data: { metaData: { patientId: 'patient-2' } },
        pdf: { opts: { patient: { id: 'patient-2' } } },
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } }
      }
    }

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins state cleanup', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(removeGeneratedPDFS.called).to.be.true;
      expect(dataWorkerRemoveDataRequest.called).to.be.true;
      expect(result.current).to.eql({ status: 'INITIALIZED', svgDataURLS: null, agpCGM: null })
    });
  });
  
  context('When state is clear', () => {
    const state = {
      blip: {
        data: { metaData: {} },
        pdf: {},
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } }
      }
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins patient fetch', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(fetchPatientData.called).to.be.true;
      expect(result.current).to.eql({ status: 'STATE_CLEARED', svgDataURLS: null, agpCGM: null });
    });
  });

  context('When patient is loaded into state', () => {
    const state = {
      blip: {
        data: { metaData: { patientId: 'patient-1' } },
        pdf: {},
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } }
      }
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins PDF generation', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(generatePDFRequest.called).to.be.true;
      expect(result.current).to.eql({ status: 'PATIENT_LOADED', svgDataURLS: null, agpCGM: null });
    });
  });

  context('When pdf has been loaded into state', () => {
    const state = {
      blip: {
        data: { metaData: { patientId: 'patient-1' } },
        pdf: { 
          data: { agpCGM: { current: 'statistics_data_here' } },
          opts: { patient: { id: 'patient-1' } }
        },
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } }
      }
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and begins AGP image generation', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(generateAGPFigureDefinitions.called).to.be.true;
      expect(result.current).to.eql({ 
        status: 'DATA_PROCESSED', 
        svgDataURLS: undefined,
        agpCGM: { current: 'statistics_data_here' },
      });
    });
  });

  context('When svgs have been successfully generated', () => {
    const state = {
      blip: {
        data: { metaData: { patientId: 'patient-1' } },
        pdf: { 
          data: { agpCGM: { current: 'statistics_data_here' } }, 
          opts: { 
            patient: { id: 'patient-1' },
            svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg..' } } 
          } 
        },
        selectedClinicId: 'clinic-1',
        clinics: { 'clinic-1': { patients: { 'patient-1': { fullName: 'Naoya Inoue' } } } }
      }
    };

    const store = mockStore(state);
    const wrapper = getWrapper(store);

    it('returns correct status and returns data', () => {
      const { result } = renderHook(() => useAgpCGM(api, patientId), { wrapper });

      expect(result.current).to.eql({ 
        status: 'SVGS_GENERATED', 
        svgDataURLS: { agpCGM: { ambulatoryGlucoseProfile: 'data:image/svg..' } },
        agpCGM: { current: 'statistics_data_here' }
      });
    });
  });
});
