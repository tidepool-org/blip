import React from 'react';
import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { thunk } from 'redux-thunk';

import PatientDataPrintDialog from '@app/pages/patientdata/PatientDataPrintDialog';
import usePrintPDF, { STATUS } from '@app/core/usePrintPDF';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '@app/core/constants';

jest.mock('@app/core/usePrintPDF');

const mockStore = configureStore([thunk]);

describe('PatientDataPrintDialog', () => {
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
        <PatientDataPrintDialog {...defaultProps} {...props} />
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
    it('renders the PrintDateRangeDialog with options', () => {
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

      it('injects the unsaved site change source into the print opts', () => {
        const mockPrint = jest.fn();

        usePrintPDF.mockReturnValue({
          status: STATUS.AWAITING_INPUT,
          canPrint: true,
          print: mockPrint,
          modalData: { latestDatumByType, timePrefs: { timezoneName: 'UTC' } },
        });

        wrapper = renderComponent({ siteChangeSource: 'tubingPrime' });

        screen.getByRole('button', { name: /Print/ }).click();

        expect(mockPrint).toHaveBeenCalledWith(expect.objectContaining({ siteChangeSource: 'tubingPrime' }));
      });

      it('omits the site change source from the print opts when there is no unsaved pick', () => {
        const mockPrint = jest.fn();

        usePrintPDF.mockReturnValue({
          status: STATUS.AWAITING_INPUT,
          canPrint: true,
          print: mockPrint,
          modalData: { latestDatumByType, timePrefs: { timezoneName: 'UTC' } },
        });

        wrapper = renderComponent();

        screen.getByRole('button', { name: /Print/ }).click();

        expect(mockPrint.mock.calls[0][0]).not.toHaveProperty('siteChangeSource');
      });
    });
  });

  describe('when the patient has tags and sites', () => {
    it('forwards them from modalData to the PrintDateRangeDialog panels', () => {
      usePrintPDF.mockReturnValue({
        status: STATUS.AWAITING_INPUT,
        canPrint: true,
        print: jest.fn(),
        modalData: {
          latestDatumByType,
          timePrefs: { timezoneName: 'UTC' },
          patientTags: [{ id: 'tag-a', name: 'A tag' }],
          sites: [{ id: 'site-a', name: 'A site' }],
        },
      });

      wrapper = renderComponent();

      expect(document.body.querySelector('#tags-header')).toBeInTheDocument();
      expect(document.body.querySelector('#clinicSites-header')).toBeInTheDocument();
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
