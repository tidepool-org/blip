import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'theme-ui';
import theme from '../../../../app/themes/baseTheme';
import EditPatientDialog from '../../../../app/components/navpatientheader/EditPatientDialog';
import { ToastProvider } from '../../../../app/providers/ToastProvider';

jest.mock('../../../../app/components/clinic/PatientForm', () => {
  return (props) => {
    React.useEffect(() => {
      props.onFormChange({ handleSubmit: jest.fn(), values: {} });
    }, []);
    return (
      <div data-testid="PatientForm" data-is-read-only={props.isReadOnly ? 'true' : 'false'} data-smart-on-fhir-mode={props.smartOnFhirMode ? 'true' : 'false'}>
        PatientForm Mock
      </div>
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
  it('sets smartOnFhirMode=true and does not disable save button when smartCorrelationId is present', () => {
    const smartOnFhirState = {
      blip: {
        ...initialState.blip,
        smartCorrelationId: 'some-correlation-id',
      },
    };

    renderEditPatientDialog(smartOnFhirState);

    const patientForm = screen.getByTestId('PatientForm');
    expect(patientForm).toHaveAttribute('data-smart-on-fhir-mode', 'true');
    expect(patientForm).toHaveAttribute('data-is-read-only', 'false');

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  it('sets smartOnFhirMode=false when smartCorrelationId is absent', () => {
    renderEditPatientDialog(initialState);

    const patientForm = screen.getByTestId('PatientForm');
    expect(patientForm).toHaveAttribute('data-smart-on-fhir-mode', 'false');
  });
});
