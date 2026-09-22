import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { thunk } from 'redux-thunk';

import ClinicPatientsPrintModal from '@app/pages/clinicworkspace/ClinicPatientsPrintModal';
import { ToastProvider } from '@app/providers/ToastProvider';
import usePrintPDF, { STATUS } from '@app/core/usePrintPDF';

jest.mock('@app/core/usePrintPDF');

const mockStore = configureStore([thunk]);

describe('ClinicPatientsPrintModal', () => {
  const api = {};
  const patientId = 'patient123';
  const mockPrint = jest.fn();

  const selectedClinicId = 'clinic123';

  const defaultStoreState = {
    blip: {
      loggedInUserId: 'clinician123',
      selectedClinicId,
      clinics: { [selectedClinicId]: { id: selectedClinicId, patientTags: [], sites: [] } },
    },
  };

  let store;
  let defaultProps;
  let wrapper;

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ToastProvider>
            <ClinicPatientsPrintModal {...defaultProps} {...props} />
          </ToastProvider>
        </MemoryRouter>
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

  describe('when latestDatumByType is not available', () => {
    it('renders a loading modal', () => {
      usePrintPDF.mockReturnValue({
        status: STATUS.FETCHING_MODAL_DATA,
        canPrint: false,
        print: jest.fn(),
        modalData: {
          latestDatumByType: null,
          timePrefs: null,
        },
      });

      wrapper = renderComponent();
      expect(document.body.querySelector('.loader')).toBeTruthy();
    });
  });

  describe('when there is no patient data', () => {
    it('fires the onClose action', async () => {
      usePrintPDF.mockReturnValue({
        status: STATUS.NO_PATIENT_DATA,
        canPrint: false,
        print: jest.fn(),
        modalData: {
          latestDatumByType: null,
          timePrefs: null,
        },
      });

      wrapper = renderComponent();

      await waitFor(() => {
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when latestDatumByType is available', () => {
    it('renders the PrintDateRangeModal with options', () => {
      usePrintPDF.mockReturnValue({
        status: STATUS.AWAITING_INPUT,
        canPrint: true,
        print: mockPrint,
        modalData: {
          latestDatumByType: { cbg: { time: '2020-03-10T00:00:00.000Z' } },
          timePrefs: { timezoneName: 'UTC' },
        },
      });

      wrapper = renderComponent();
      expect(screen.getByRole('heading', { name: /Print Report/ })).toBeTruthy();
      expect(mockPrint).not.toHaveBeenCalled();

      const printButton = screen.getByRole('button', { name: /Print/ });
      printButton.click();

      expect(mockPrint).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the patient has tags and sites', () => {
    it('forwards them from modalData to the PrintDateRangeModal panels', () => {
      usePrintPDF.mockReturnValue({
        status: STATUS.AWAITING_INPUT,
        canPrint: true,
        print: jest.fn(),
        modalData: {
          latestDatumByType: { cbg: { time: '2020-03-10T00:00:00.000Z' } },
          timePrefs: { timezoneName: 'UTC' },
          patientTags: [{ id: 'tag-a', name: 'A tag' }],
          sites: [{ id: 'site-a', name: 'A site' }],
        },
      });

      wrapper = renderComponent();

      expect(document.body.querySelector('.PatientFormSelectTags__multi-value__label')).toHaveTextContent('A tag');
      expect(document.body.querySelector('.PatientFormSelectSites__multi-value__label')).toHaveTextContent('A site');
    });
  });
});
