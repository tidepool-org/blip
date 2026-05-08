import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
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
      <div data-testid="PatientForm" data-disabled-fields={JSON.stringify(props.disabledFields || {})}>
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
  it('locks identity fields and leaves the save button enabled when smartCorrelationId is present', () => {
    const smartOnFhirState = {
      blip: {
        ...initialState.blip,
        smartCorrelationId: 'some-correlation-id',
      },
    };

    renderEditPatientDialog(smartOnFhirState);

    const patientForm = screen.getByTestId('PatientForm');
    expect(JSON.parse(patientForm.getAttribute('data-disabled-fields'))).toEqual({
      fullName: true,
      birthDate: true,
      mrn: true,
      email: true,
    });

    const saveButton = screen.getByRole('button', { name: 'Save Changes' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeEnabled();
  });

  it('passes an empty disabledFields object when smartCorrelationId is absent', () => {
    renderEditPatientDialog(initialState);

    const patientForm = screen.getByTestId('PatientForm');
    expect(JSON.parse(patientForm.getAttribute('data-disabled-fields'))).toEqual({});
  });
});
