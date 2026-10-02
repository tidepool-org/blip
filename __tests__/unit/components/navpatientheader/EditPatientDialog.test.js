import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { ThemeProvider } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
import theme from '@app/themes/baseTheme';
import EditPatientDialog from '@app/components/navpatientheader/EditPatientDialog';
import { ToastProvider } from '@app/providers/ToastProvider';
import { buildGlycemicRangesFromPreset } from '@app/core/glycemicRangesUtils';
import { GLYCEMIC_RANGE_OPTS } from '@app/components/clinic/PatientForm/SelectGlycemicRanges';
import { MGDL_UNITS } from '@app/core/constants';
import { usePrevious } from '@app/core/hooks';
const { GLYCEMIC_RANGES_PRESET } = vizUtils.constants;

const mockStore = configureStore([thunk]);

jest.mock('@app/core/hooks', () => ({
  ...jest.requireActual('@app/core/hooks'),
  useIsFirstRender: jest.fn(() => false),
  usePrevious: jest.fn(),
}));

const initialState = {
  blip: {
    selectedClinicId: 'clinic123',
    currentPatientInViewId: 'patient123',
    clinics: {
      clinic123: {
        id: 'clinic123',
        mrnSettings: { required: false },
      },
    },
    allUsersMap: {
      patient123: {
        id: 'patient123',
        profile: { fullName: 'John Doe' },
      },
    },
    working: {
      fetchingClinicMRNsForPatientFormValidation: { inProgress: false, completed: false, notification: null },
      updatingClinicPatient: { inProgress: false, completed: false, notification: null },
    },
    clinicMRNsForPatientFormValidation: [],
  },
};

const renderEditPatientDialog = (storeState = initialState) => {
  const reducer = (state = storeState, action) => state;
  const store = createStore(reducer, applyMiddleware(thunk));

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <EditPatientDialog
            api={{ clinics: { getPatientFromClinic: jest.fn() } }}
            trackMetric={jest.fn()}
            isOpen={true}
            onClose={jest.fn()}
          />
        </ToastProvider>
      </ThemeProvider>
    </Provider>
  );
};

describe('EditPatientDialog', () => {
  it('locks identity fields and leaves the save button enabled when smartCorrelationId is present', () => {
    const smartOnFhirState = {
      blip: {
        ...initialState.blip,
        smartCorrelationId: 'some-correlation-id',
        clinics: {
          clinic123: {
            ...initialState.blip.clinics.clinic123,
            patients: {
              patient123: { id: 'patient123', fullName: 'John Doe', birthDate: '2000-01-01' },
            },
          },
        },
      },
    };

    renderEditPatientDialog(smartOnFhirState);

    expect(screen.getByRole('textbox', { name: /Full Name/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Birthdate/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /MRN/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Email/i })).toBeDisabled();
    // Clinical fields stay editable in smart-on-fhir mode; only EHR-sourced identity fields lock.
    expect(screen.getByLabelText(/Diabetes Type/i)).not.toBeDisabled();
    expect(screen.getByLabelText('Target Range')).not.toBeDisabled();

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  it('sets read-only fields enabled when smartCorrelationId is absent', () => {
    renderEditPatientDialog(initialState);

    expect(screen.getByRole('textbox', { name: /Full Name/i })).not.toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Birthdate/i })).not.toBeDisabled();
    expect(screen.getByRole('textbox', { name: /MRN/i })).not.toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Email/i })).not.toBeDisabled();
    expect(screen.getByLabelText(/Diabetes Type/i)).not.toBeDisabled();
    expect(screen.getByLabelText('Target Range')).not.toBeDisabled();
  });

  // The dialog is permanently mounted and subscribes to the global updatingClinicPatient, so it must
  // only clear the data worker for updates it initiated (isOpen), not foreign ones (e.g. adding a data
  // source) — clearing on a foreign update would strand the patient-data view on the loader.
  describe('data worker cache on a foreign clinic-patient update', () => {
    const justCompletedUpdateState = {
      blip: {
        ...initialState.blip,
        working: {
          fetchingClinicMRNsForPatientFormValidation: { inProgress: false, completed: true, notification: null },
          updatingClinicPatient: { inProgress: false, completed: true, notification: null },
        },
      },
    };

    const renderForeignUpdate = ({ isOpen }) => {
      const store = mockStore(justCompletedUpdateState);
      const onClose = jest.fn();

      render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ToastProvider>
              <EditPatientDialog api={{}} trackMetric={jest.fn()} isOpen={isOpen} onClose={onClose} />
            </ToastProvider>
          </ThemeProvider>
        </Provider>
      );

      return { store, onClose };
    };

    beforeEach(() => {
      usePrevious.mockReturnValue(true);
    });

    it('does NOT dispatch dataWorkerRemoveDataRequest when the dialog is closed (foreign update)', () => {
      const { store, onClose } = renderForeignUpdate({ isOpen: false });

      expect(onClose).not.toHaveBeenCalled();
      expect(store.getActions().some(a => a.type === 'DATA_WORKER_REMOVE_DATA_REQUEST')).toBe(false);
    });
  });

  // The data worker is cleared (forcing a reprocess) only when Target Range changed AND the patient
  // has chart data to reprocess; a no-data patient would be stranded on the loader, so it's skipped.
  describe('clearing chart data only when a data-affecting field changed and chart data exists', () => {
    const RANGE_A = buildGlycemicRangesFromPreset(GLYCEMIC_RANGES_PRESET.ADA_STANDARD);
    const RANGE_B = buildGlycemicRangesFromPreset(GLYCEMIC_RANGES_PRESET.ADA_OLDER_HIGH_RISK);
    const RANGE_A_LABEL = GLYCEMIC_RANGE_OPTS[MGDL_UNITS][0].label;
    const RANGE_B_LABEL = GLYCEMIC_RANGE_OPTS[MGDL_UNITS][1].label;
    const IDLE_UPDATE = { inProgress: false, completed: null, notification: null };
    const COMPLETED_UPDATE = { inProgress: false, completed: true, notification: null };

    const makeState = ({ savedRange, chartDataSize, updatingClinicPatient }) => ({
      blip: {
        ...initialState.blip,
        working: {
          fetchingClinicMRNsForPatientFormValidation: { inProgress: false, completed: false, notification: null },
          updatingClinicPatient,
        },
        data: { metaData: { size: chartDataSize } },
        clinics: {
          clinic123: {
            ...initialState.blip.clinics.clinic123,
            patients: {
              patient123: { id: 'patient123', fullName: 'John Doe', birthDate: '2000-01-01', glycemicRanges: savedRange },
            },
          },
        },
      },
    });

    const api = { clinics: { getPatientFromClinic: jest.fn(), updateClinicPatient: jest.fn() } };
    const onClose = jest.fn();

    const ui = (store) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <EditPatientDialog api={api} trackMetric={jest.fn()} isOpen={true} onClose={onClose} />
          </ToastProvider>
        </ThemeProvider>
      </Provider>
    );

    const cleared = store => store.getActions().some(a => a.type === 'DATA_WORKER_REMOVE_DATA_REQUEST');

    beforeEach(() => {
      onClose.mockClear();
      usePrevious.mockReturnValue(true);
      window.HTMLElement.prototype.scrollIntoView = jest.fn();
    });

    it('does NOT clear the data worker for a demographic-only edit, even when chart data exists', async () => {
      const initialState = makeState({ savedRange: RANGE_A, chartDataSize: 100, updatingClinicPatient: IDLE_UPDATE });
      const { rerender } = render(ui(mockStore(initialState)));

      await userEvent.type(screen.getByRole('textbox', { name: /Full Name/i }), ' Jr');
      await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      const completedStore = mockStore(makeState({ savedRange: RANGE_A, chartDataSize: 100, updatingClinicPatient: COMPLETED_UPDATE }));
      rerender(ui(completedStore));

      expect(onClose).toHaveBeenCalled();
      expect(cleared(completedStore)).toBe(false);
    });

    it('DOES clear the data worker when Target Range changed from the saved value and the patient has chart data', async () => {
      const { rerender } = render(ui(mockStore(makeState({ savedRange: RANGE_A, chartDataSize: 100, updatingClinicPatient: IDLE_UPDATE }))));

      await userEvent.click(screen.getByLabelText('Target Range'));
      await userEvent.click(screen.getByText(RANGE_B_LABEL));
      await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      const completedStore = mockStore(makeState({ savedRange: RANGE_A, chartDataSize: 100, updatingClinicPatient: COMPLETED_UPDATE }));
      rerender(ui(completedStore));

      expect(onClose).toHaveBeenCalled();
      expect(cleared(completedStore)).toBe(true);
    });

    it('clears on a SUBSEQUENT Target Range change — compares against the saved value, not the frozen original', async () => {
      const { rerender } = render(ui(mockStore(makeState({ savedRange: RANGE_A, chartDataSize: 100, updatingClinicPatient: IDLE_UPDATE }))));
      rerender(ui(mockStore(makeState({ savedRange: RANGE_B, chartDataSize: 100, updatingClinicPatient: IDLE_UPDATE }))));

      await userEvent.click(screen.getByLabelText('Target Range'));
      await userEvent.click(screen.getByText(RANGE_A_LABEL));
      await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      const completedStore = mockStore(makeState({ savedRange: RANGE_B, chartDataSize: 100, updatingClinicPatient: COMPLETED_UPDATE }));
      rerender(ui(completedStore));

      expect(onClose).toHaveBeenCalled();
      expect(cleared(completedStore)).toBe(true);
    });

    it('does NOT clear the data worker on a Target Range change for a no-data patient (would strand the loader)', async () => {
      const { rerender } = render(ui(mockStore(makeState({ savedRange: RANGE_A, chartDataSize: 0, updatingClinicPatient: IDLE_UPDATE }))));

      await userEvent.click(screen.getByLabelText('Target Range'));
      await userEvent.click(screen.getByText(RANGE_B_LABEL));
      await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      const completedStore = mockStore(makeState({ savedRange: RANGE_A, chartDataSize: 0, updatingClinicPatient: COMPLETED_UPDATE }));
      rerender(ui(completedStore));

      expect(onClose).toHaveBeenCalled();
      expect(cleared(completedStore)).toBe(false);
    });
  });
});
