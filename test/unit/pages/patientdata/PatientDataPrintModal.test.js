import React from 'react';
import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';

import PatientDataPrintModal from '../../../../app/pages/patientdata/PatientDataPrintModal';
import usePrintPDF, { STATUS } from '../../../../app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '../../../../app/core/constants';

jest.mock('../../../../app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF');

const mockStore = configureStore([thunk]);

describe('PatientDataPrintModal', () => {
  const api = {};
  const patientId = 'patient123';

  const defaultStoreState = {
    blip: {
      loggedInUserId: 'clinician123',
    },
  };

  const latestDatumByType = {
    cbg: { time: '2020-03-10T00:00:00.000Z' },
    smbg: { time: '2020-03-10T00:00:00.000Z' },
    bolus: { time: '2020-03-10T00:00:00.000Z' },
    basal: { time: '2020-03-10T00:00:00.000Z' },
  };

  let store;
  let defaultProps;
  let wrapper;

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <PatientDataPrintModal {...defaultProps} {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    store = mockStore(defaultStoreState);
    defaultProps = { api, patientId, onClose: jest.fn() };
  });

  afterEach(() => {
    wrapper && wrapper.unmount();
    jest.clearAllMocks();
  });

  describe('when initial data is available', () => {
    it('renders the PrintDateRangeModal with options', () => {
      usePrintPDF.mockReturnValue({
        status: STATUS.AWAITING_INPUT,
        canPrint: true,
        print: jest.fn(),
        modalData: { latestDatumByType, timePrefs: { timezoneName: 'UTC' } },
      });

      wrapper = renderComponent();
      expect(screen.getByRole('heading', { name: /Print Report/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Print/ })).toBeTruthy();
    });
  });

  describe('when the print button is clicked', () => {
    it('calls the print function from usePrintPDF', () => {
      const mockPrint = jest.fn();

      usePrintPDF.mockReturnValue({
        status: STATUS.AWAITING_INPUT,
        canPrint: true,
        print: mockPrint,
        modalData: { latestDatumByType, timePrefs: { timezoneName: 'UTC' } },
      });

      wrapper = renderComponent();
      screen.getByRole('button', { name: /Print/ }).click();

      expect(mockPrint).toHaveBeenCalledTimes(1);
    });

    describe('opts enrichment from chartPrefs', () => {
      it('injects cgmSampleIntervalRange from chartPrefs into daily opts', () => {
        const mockPrint = jest.fn();
        const cgmSampleIntervalRange = [300000, 900000];

        usePrintPDF.mockReturnValue({
          status: STATUS.AWAITING_INPUT,
          canPrint: true,
          print: mockPrint,
          modalData: { latestDatumByType, timePrefs: { timezoneName: 'UTC' } },
        });

        wrapper = renderComponent({
          chartPrefs: { daily: { cgmSampleIntervalRange } },
        });

        screen.getByRole('button', { name: /Print/ }).click();

        expect(mockPrint).toHaveBeenCalledWith(
          expect.objectContaining({
            daily: expect.objectContaining({ cgmSampleIntervalRange }),
          })
        );
      });

      it('falls back to DEFAULT_CGM_SAMPLE_INTERVAL_RANGE when chartPrefs has no cgmSampleIntervalRange', () => {
        const mockPrint = jest.fn();

        usePrintPDF.mockReturnValue({
          status: STATUS.AWAITING_INPUT,
          canPrint: true,
          print: mockPrint,
          modalData: { latestDatumByType, timePrefs: { timezoneName: 'UTC' } },
        });

        wrapper = renderComponent({ chartPrefs: {} });

        screen.getByRole('button', { name: /Print/ }).click();

        expect(mockPrint).toHaveBeenCalledWith(
          expect.objectContaining({
            daily: expect.objectContaining({
              cgmSampleIntervalRange: DEFAULT_CGM_SAMPLE_INTERVAL_RANGE,
            }),
          })
        );
      });
    });
  });

  describe('on unmount', () => {
    it('dispatches removeGeneratedPDFS', () => {
      wrapper = renderComponent();
      wrapper.unmount();
      wrapper = null;

      const dispatchedTypes = store.getActions().map(a => a.type);
      expect(dispatchedTypes).toContain('REMOVE_GENERATED_PDFS');
    });
  });
});
