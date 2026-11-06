import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { setupStore } from '@tests/utils/setupStore';
import blipReducer from '@app/redux/reducers';
import { ToastProvider } from '@app/providers/ToastProvider';
import TideDashboardV2 from '@app/pages/clinicworkspace/TideDashboardV2/TideDashboardV2';

jest.mock('@app/pages/clinicworkspace/TideDashboardV2/useDerivedDataRecencyEndpoints', () => ({
  __esModule: true,
  default: () => [
    '2025-05-23T00:00:00.000Z', // lastDataFrom
    '2025-05-30T00:00:00.000Z', // lastDataTo
  ],
}));

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: jest.fn().mockReturnValue({ showTideDashboard: true }),
  useLDClient: jest.fn().mockReturnValue({
    getContext: () => ({
      clinic: { tier: 'tier0400' },
    }),
  }),
}));

const TEST_TIMEOUT_MS = 30_000;

const patient = {
  id: 'patient-1',
  fullName: 'Shakur Stevenson',
  birthDate: '2010-10-10',
  email: 'james@example.test',
  permissions: { custodian: {} },
};

const server = setupServer(
  http.get('http://app.tidepool.test/v1/clinics/clinic123/patients', () => (
    HttpResponse.json({ data: [patient], meta: { count: 1 } })
  ))
);

describe('EditPatientDialogController', () => {
  let store;

  const api = {
    clinics: {
      getPatientFromClinic: jest.fn(),
      updateClinicPatient: jest.fn(),
    },
  };

  const renderComponent = () => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <ToastProvider>
          <TideDashboardV2 api={api} />
        </ToastProvider>
      </MemoryRouter>
    </Provider>
  );

  beforeAll(() => server.listen());

  beforeEach(() => {
    store = setupStore({
      blip: {
        selectedClinicId: 'clinic123',
        clinics: { clinic123: { id: 'clinic123' } },
      },
    }, { blip: blipReducer });

    api.clinics.getPatientFromClinic.mockReset().mockImplementation((clinicId, patientId, cb) => cb(null, patient));
    api.clinics.updateClinicPatient.mockReset().mockImplementation((clinicId, patientId, updatedPatient, cb) => cb(null, updatedPatient));
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => server.close());

  it('saves an edit opened from the More menu, then closes and shows the success toast', async () => {
    renderComponent();

    expect(await screen.findByText('Shakur Stevenson')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Edit Patient Details' })).not.toBeInTheDocument();

    // Open Edit Patient Details from the More menu
    await userEvent.click(screen.getByTestId('action-menu-patient-1-icon'));
    await userEvent.click(screen.getByRole('button', { name: /Edit Patient Details/ }));
    expect(screen.getByRole('heading', { name: 'Edit Patient Details' })).toBeInTheDocument();

    // Rename the patient and save
    await userEvent.clear(screen.getByRole('textbox', { name: /Full Name/ }));
    await userEvent.click(screen.getByRole('textbox', { name: /Full Name/ }));
    await userEvent.paste('Shakur Stevenson 2');
    await userEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(api.clinics.updateClinicPatient).toHaveBeenCalledWith(
      'clinic123',                                                // clinicId
      'patient-1',                                                // patientId
      expect.objectContaining({ fullName: 'Shakur Stevenson 2' }), // updated patient
      expect.any(Function),                                       // node-style callback
    ));

    // The dialog closes and the edit controller's own toast is shown
    expect(await screen.findByText('You have successfully updated a patient.')).toBeInTheDocument();
    expect(screen.queryByText('You have successfully updated the patient email address.')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Edit Patient Details' })).not.toBeInTheDocument());
  }, TEST_TIMEOUT_MS);
});
