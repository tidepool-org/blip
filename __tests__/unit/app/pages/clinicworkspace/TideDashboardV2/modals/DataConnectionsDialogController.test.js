import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { setupStore } from '@tests/utils/setupStore';
import blipReducer from '@app/redux/reducers';
import api from '@app/core/api';
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
  email: 'shakur@example.test',
  permissions: { custodian: {} },
};

const server = setupServer(
  http.get('http://app.tidepool.test/v1/clinics/clinic123/patients', () => (
    HttpResponse.json({ data: [patient], meta: { count: 1 } })
  ))
);

describe('DataConnectionsDialogController', () => {
  let store;

  const renderComponent = () => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/clinic-workspace/tide-dashboard']}>
        <ToastProvider>
          <TideDashboardV2 />
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

    jest.spyOn(api.clinics, 'getPatientFromClinic').mockImplementation((clinicId, patientId, cb) => cb(null, patient));
    jest.spyOn(api.clinics, 'updateClinicPatient').mockImplementation((clinicId, patientId, updatedPatient, cb) => cb(null, updatedPatient));
  });

  afterEach(() => {
    server.resetHandlers();
    jest.restoreAllMocks();
  });

  afterAll(() => server.close());

  it('keeps Bring Data into Tidepool open after the patient email is edited from it', async () => {
    renderComponent();

    expect(await screen.findByText('Shakur Stevenson')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Bring Data into Tidepool', hidden: true })).not.toBeInTheDocument();

    // Open Bring Data into Tidepool from the More menu
    await userEvent.click(screen.getByTestId('action-menu-patient-1-icon'));
    await userEvent.click(screen.getByRole('button', { name: /Bring Data into Tidepool/ }));
    expect(screen.getByRole('heading', { name: 'Bring Data into Tidepool', hidden: true })).toBeInTheDocument();

    // Open the email editor from the patient's email address
    expect(screen.queryByRole('heading', { name: 'Edit Patient Email' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /shakur@example.test/, hidden: true }));
    expect(screen.getByRole('heading', { name: 'Edit Patient Email' })).toBeInTheDocument();

    // Change the email and save
    await userEvent.clear(screen.getByRole('textbox', { name: /Patient Email Address/ }));
    await userEvent.click(screen.getByRole('textbox', { name: /Patient Email Address/ }));
    await userEvent.paste('shakur.new@example.test');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(api.clinics.updateClinicPatient).toHaveBeenCalledWith(
      'clinic123',                                                   // clinicId
      'patient-1',                                                   // patientId
      expect.objectContaining({ email: 'shakur.new@example.test' }), // updated patient
      expect.any(Function),                                          // node-style callback
    ));

    // The email editor closes on success
    expect(await screen.findByText('You have successfully updated the patient email address.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Edit Patient Email' })).not.toBeInTheDocument());

    expect(screen.getByRole('heading', { name: 'Bring Data into Tidepool', hidden: true })).toBeInTheDocument();
  }, TEST_TIMEOUT_MS);
});
