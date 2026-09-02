import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { ThemeProvider } from 'theme-ui';
import theme from '@app/themes/baseTheme';
import EditPatientDialog from '@app/components/clinic/EditPatientDialog';
import { usePrevious } from '@app/core/hooks';

const mockStore = configureStore([thunk]);

jest.mock('@app/core/hooks', () => ({
  ...jest.requireActual('@app/core/hooks'),
  useIsFirstRender: jest.fn(() => false),
  usePrevious: jest.fn(),
}));

const clinicPatient = {
  id: 'patient123',
  fullName: 'John Doe',
  birthDate: '2000-01-01',
  permissions: { custodian: {} },
};

const IDLE_UPDATE = { inProgress: false, completed: null, notification: null };
const COMPLETED_UPDATE = { inProgress: false, completed: true, notification: null };
const FAILED_UPDATE = { inProgress: false, completed: false, notification: { message: 'Something went wrong' } };

const makeState = ({ smartCorrelationId, updatingClinicPatient = IDLE_UPDATE } = {}) => ({
  blip: {
    selectedClinicId: 'clinic123',
    smartCorrelationId,
    clinics: { clinic123: { id: 'clinic123', mrnSettings: { required: false } } },
    working: {
      fetchingClinicMRNsForPatientFormValidation: { inProgress: false, completed: false, notification: null },
      updatingClinicPatient,
    },
    clinicMRNsForPatientFormValidation: [],
  },
});

const api = { clinics: { getPatientFromClinic: jest.fn(), updateClinicPatient: jest.fn() } };
const onClose = jest.fn();
const onEditConfirm = jest.fn();
const onEditSuccess = jest.fn();
const onEditFailure = jest.fn();

const ui = (store) => (
  <Provider store={store}>
    <MemoryRouter initialEntries={['/patients/patient123/data']}>
      <ThemeProvider theme={theme}>
        <EditPatientDialog
          api={api}
          clinicPatient={clinicPatient}
          isOpen={true}
          onClose={onClose}
          onEditConfirm={onEditConfirm}
          onEditSuccess={onEditSuccess}
          onEditFailure={onEditFailure}
        />
      </ThemeProvider>
    </MemoryRouter>
  </Provider>
);

describe('EditPatientDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePrevious.mockReturnValue(true);
  });

  it('renders the patient form populated from clinicPatient, locking identity fields only in smart-on-fhir mode', () => {
    const { rerender } = render(ui(mockStore(makeState())));

    // The form is prefilled from clinicPatient ('2000-01-01' renders in the display format, 01/01/2000)
    expect(screen.getByRole('textbox', { name: /Full Name/i })).toHaveValue('John Doe');
    expect(screen.getByRole('textbox', { name: /Birthdate/i })).toHaveValue('01/01/2000');

    // Outside smart-on-fhir mode every field is editable
    expect(screen.getByRole('textbox', { name: /Full Name/i })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: /Birthdate/i })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: /MRN/i })).toBeEnabled();
    expect(screen.getByRole('textbox', { name: /Email/i })).toBeEnabled();

    // In smart-on-fhir mode the EHR-sourced identity fields lock
    rerender(ui(mockStore(makeState({ smartCorrelationId: 'some-correlation-id' }))));
    expect(screen.getByRole('textbox', { name: /Full Name/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Birthdate/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /MRN/i })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Email/i })).toBeDisabled();

    // Clinical fields stay editable in smart-on-fhir mode
    expect(screen.getByLabelText(/Diabetes Type/i)).toBeEnabled();
    expect(screen.getByLabelText('Target Range')).toBeEnabled();
  });

  it('notifies the parent through onEditConfirm and submits the form when Save Changes is clicked', async () => {
    render(ui(mockStore(makeState())));

    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    // The parent is handed the live form context before the submit fires
    expect(onEditConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ values: expect.objectContaining({ fullName: 'John Doe' }) })
    );

    // The form submit runs through to the patient update endpoint
    await waitFor(() => {
      expect(api.clinics.updateClinicPatient).toHaveBeenCalledWith(
        'clinic123',                                       // clinicId
        'patient123',                                      // patientId
        expect.objectContaining({ fullName: 'John Doe' }), // updated patient
        expect.any(Function),                              // node-style callback
      );
    });
  });

  it('reports the update result: onEditSuccess when it completes and onEditFailure when it fails', () => {
    const { rerender } = render(ui(mockStore(makeState({ updatingClinicPatient: IDLE_UPDATE }))));

    // Nothing is reported while no update has resolved
    expect(onEditSuccess).not.toHaveBeenCalled();
    expect(onEditFailure).not.toHaveBeenCalled();

    // The in-flight update completes successfully
    rerender(ui(mockStore(makeState({ updatingClinicPatient: COMPLETED_UPDATE }))));
    expect(onEditSuccess).toHaveBeenCalledTimes(1);
    expect(onEditFailure).not.toHaveBeenCalled();

    // A later update fails
    rerender(ui(mockStore(makeState({ updatingClinicPatient: FAILED_UPDATE }))));
    expect(onEditFailure).toHaveBeenCalledTimes(1);
    expect(onEditSuccess).toHaveBeenCalledTimes(1);
  });
});
