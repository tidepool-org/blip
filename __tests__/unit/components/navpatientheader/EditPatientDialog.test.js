import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
import theme from '../../../../app/themes/baseTheme';
import EditPatientDialog from '../../../../app/components/navpatientheader/EditPatientDialog';
import { ToastProvider } from '../../../../app/providers/ToastProvider';
import { buildGlycemicRangesFromPreset } from '../../../../app/core/glycemicRangesUtils';

// When set by a test, the PatientForm mock feeds this Formik bag back through onFormChange so the
// dialog's patientFormContext (values / initialValues) is populated.
let mockFormBag;

jest.mock('../../../../app/components/clinic/PatientForm', () => {
  const React = require('react');
  return (props) => {
    React.useEffect(() => {
      if (mockFormBag) props.onFormChange(mockFormBag);
    }, []);
    return React.createElement(
      'div',
      { 'data-testid': 'PatientForm', 'data-is-read-only': props.isReadOnly ? 'true' : 'false' },
      'PatientForm Mock'
    );
  };
});

jest.mock('../../../../app/core/hooks', () => ({
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
            api={{}}
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
  it('sets isReadOnly=true and disables save button when smartCorrelationId is present', () => {
    const smartOnFhirState = {
      blip: {
        ...initialState.blip,
        smartCorrelationId: 'some-correlation-id',
      },
    };

    renderEditPatientDialog(smartOnFhirState);

    const patientForm = screen.getByTestId('PatientForm');
    expect(patientForm).toHaveAttribute('data-is-read-only', 'true');

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('sets isReadOnly=false when smartCorrelationId is absent', () => {
    renderEditPatientDialog(initialState);

    const patientForm = screen.getByTestId('PatientForm');
    expect(patientForm).toHaveAttribute('data-is-read-only', 'false');
  });

  // --- Failing test A: pins the foreign-update data-worker wipe (theory A / BUG-0019) ---
  // EditPatientDialog is always mounted in NavPatientHeader and subscribes to the GLOBAL
  // working.updatingClinicPatient. When a different flow (e.g. adding a data source) updates the
  // clinic patient, the dialog is closed (isOpen=false) but still fires dataWorkerRemoveDataRequest,
  // wiping the patient-data view. It should only clear the cache for updates it initiated.
  describe('data worker cache on a foreign clinic-patient update', () => {
    const { usePrevious } = require('../../../../app/core/hooks');

    // updatingClinicPatient just transitioned inProgress -> completed
    const justCompletedUpdateState = {
      blip: {
        ...initialState.blip,
        working: {
          updatingClinicPatient: { inProgress: false, completed: true, notification: null },
        },
      },
    };

    const renderWithCapturedActions = ({ isOpen }) => {
      const dispatchedActions = [];
      const reducer = (state = justCompletedUpdateState, action) => {
        dispatchedActions.push(action);
        return state;
      };
      const store = createStore(reducer, applyMiddleware(thunk));
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

      return { dispatchedActions, onClose };
    };

    beforeEach(() => {
      // prevInProgress = true so the inProgress -> completed transition is detected
      usePrevious.mockReturnValue(true);
    });

    it('does NOT dispatch dataWorkerRemoveDataRequest when the dialog is closed (foreign update)', () => {
      const { dispatchedActions, onClose } = renderWithCapturedActions({ isOpen: false });

      expect(onClose).not.toHaveBeenCalled();
      expect(dispatchedActions.some(a => a.type === 'DATA_WORKER_REMOVE_DATA_REQUEST')).toBe(false);
    });
  });

  // The data worker is cleared (forcing a chart-data reprocess) only when a data-affecting field
  // changed AND the patient actually has chart data to reprocess. Target Range (glycemicRanges) is the
  // only data-affecting field in the edit form. A no-data patient has nothing to reprocess and clearing
  // the worker would strand its view on the loader, so it must be skipped there.
  describe('clearing chart data only when a data-affecting field changed and chart data exists', () => {
    const { usePrevious } = require('../../../../app/core/hooks');

    const presets = Object.values(vizUtils.constants.GLYCEMIC_RANGES_PRESET);
    const RANGE_A = buildGlycemicRangesFromPreset(vizUtils.constants.GLYCEMIC_RANGES_PRESET.ADA_STANDARD);
    const RANGE_B = buildGlycemicRangesFromPreset(
      presets.find(p => p !== vizUtils.constants.GLYCEMIC_RANGES_PRESET.ADA_STANDARD)
    );

    afterEach(() => { mockFormBag = undefined; });

    // Renders an open dialog, saves the edit (capturing the clear-data decision), then drives the
    // update to completion and returns the actions dispatched during that completion. savedRange is the
    // patient's currently-stored Target Range (the comparison baseline); chartDataSize seeds the data
    // worker's metaData.size (0 = no-data patient); submittedRange is what the form submits.
    const saveEditThenComplete = ({ submittedRange, savedRange, frozenInitialRange = savedRange, fullName = 'Same', chartDataSize = 0 }) => {
      // frozenInitialRange models the form's own (frozen-at-mount) initialValues; the production code
      // must NOT use it — it compares against the patient's currently-saved range instead.
      mockFormBag = {
        values: { fullName, glycemicRanges: submittedRange },
        initialValues: { fullName: 'Same', glycemicRanges: frozenInitialRange },
        handleSubmit: jest.fn(),
      };
      usePrevious.mockReturnValue(true);
      const onClose = jest.fn();

      const makeStore = (updatingClinicPatient, actions) => {
        const state = {
          blip: {
            ...initialState.blip,
            working: { updatingClinicPatient },
            data: { metaData: { size: chartDataSize } },
            clinics: {
              clinic123: {
                ...initialState.blip.clinics.clinic123,
                patients: { patient123: { id: 'patient123', glycemicRanges: savedRange } },
              },
            },
          },
        };
        return createStore((s = state, action) => { if (actions) actions.push(action); return s; }, applyMiddleware(thunk));
      };

      const ui = (store) => (
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <ToastProvider>
              <EditPatientDialog api={{}} trackMetric={jest.fn()} isOpen={true} onClose={onClose} />
            </ToastProvider>
          </ThemeProvider>
        </Provider>
      );

      // idle: completed=null so the working-state hook ignores the initial render
      const { rerender } = render(ui(makeStore({ inProgress: false, completed: null, notification: null })));

      fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

      const completedActions = [];
      rerender(ui(makeStore({ inProgress: false, completed: true, notification: null }, completedActions)));

      return { completedActions, onClose };
    };

    const cleared = ({ completedActions }) => completedActions.some(a => a.type === 'DATA_WORKER_REMOVE_DATA_REQUEST');

    it('does NOT clear the data worker for a demographic-only edit, even when chart data exists', () => {
      const result = saveEditThenComplete({ fullName: 'New Name', submittedRange: RANGE_A, savedRange: RANGE_A, chartDataSize: 100 });
      expect(result.onClose).toHaveBeenCalled();
      expect(cleared(result)).toBe(false);
    });

    it('DOES clear the data worker when Target Range changed from the saved value and the patient has chart data', () => {
      expect(cleared(saveEditThenComplete({ submittedRange: RANGE_B, savedRange: RANGE_A, chartDataSize: 100 }))).toBe(true);
    });

    it('clears on a SUBSEQUENT Target Range change — compares against the saved value, not the frozen original', () => {
      // Patient was previously saved as RANGE_B; the form's frozen baseline is still the original mount
      // value RANGE_A; the clinician now changes the range back to RANGE_A. Comparing against the frozen
      // baseline would see "no change" and skip the reprocess (the live bug); comparing against the
      // saved RANGE_B correctly detects the change.
      expect(cleared(saveEditThenComplete({
        submittedRange: RANGE_A, savedRange: RANGE_B, frozenInitialRange: RANGE_A, chartDataSize: 100,
      }))).toBe(true);
    });

    it('does NOT clear the data worker on a Target Range change for a no-data patient (would strand the loader)', () => {
      const result = saveEditThenComplete({ submittedRange: RANGE_B, savedRange: RANGE_A, chartDataSize: 0 });
      expect(result.onClose).toHaveBeenCalled();
      expect(cleared(result)).toBe(false);
    });
  });
});
