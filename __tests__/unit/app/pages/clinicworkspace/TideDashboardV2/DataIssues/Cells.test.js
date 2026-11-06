import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import {
  DexcomConnectionStatusCell,
  MoreMenuCell,
} from '@app/pages/clinicworkspace/TideDashboardV2/DataIssues/Cells';

const mockStore = configureStore([thunk]);

describe('DataIssues Cells', () => {
  let store;

  const renderComponent = (cell) => {
    render(<Provider store={store}>{cell}</Provider>);
  };

  beforeEach(() => {
    store = mockStore({
      blip: {
        selectedClinicId: 'clinic123',
        timePrefs: {},
      },
    });

    // Fake only Date so "now" is pinned; connect states and day counts resolve deterministically
    jest.useFakeTimers({
      now: new Date('2025-05-29T10:00:00Z'),
      doNotFake: [
        'hrtime', 'nextTick', 'performance', 'queueMicrotask',
        'requestAnimationFrame', 'cancelAnimationFrame',
        'requestIdleCallback', 'cancelIdleCallback',
        'setImmediate', 'clearImmediate',
        'setInterval', 'clearInterval',
        'setTimeout', 'clearTimeout',
      ],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('DexcomConnectionStatusCell', () => {
    const onOpenDataConnectionsModal = jest.fn();

    const ui = (patient) => (
      <Provider store={store}>
        <DexcomConnectionStatusCell
          patient={patient}
          onOpenDataConnectionsModal={onOpenDataConnectionsModal}
        />
      </Provider>
    );

    beforeEach(() => {
      onOpenDataConnectionsModal.mockClear();
    });

    it('shows the connection status for each dexcom data source state, with a View button that opens the Data Connections modal for actionable states', async () => {
      // No dexcom data source: No Pending Connections, and View opens the Data Connections modal
      const { rerender } = render(ui({ id: 'patient-1' }));

      expect(screen.getByLabelText('dexcom connection status')).toHaveTextContent('No Pending Connections');
      await userEvent.click(screen.getByRole('button', { name: 'View' }));
      expect(onOpenDataConnectionsModal).toHaveBeenCalledWith('patient-1');

      // Pending invite: Invite Sent, without a View button
      rerender(ui(
        {
          id: 'patient-1',
          dataSources: [{
            providerName: 'dexcom',
            state: 'pending',
            modifiedTime: '2025-05-27T10:00:00.000Z',
            expirationTime: '2025-06-03T10:00:00.000Z',
          }],
        }
      ));

      expect(screen.getByLabelText('dexcom connection status')).toHaveTextContent('Invite Sent');
      expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument();

      // Expired pending invite: Invite Expired, with a View button
      rerender(ui(
        {
          id: 'patient-1',
          dataSources: [{
            providerName: 'dexcom',
            state: 'pending',
            modifiedTime: '2025-04-01T10:00:00.000Z',
            expirationTime: '2025-05-01T10:00:00.000Z',
          }],
        }
      ));

      expect(screen.getByLabelText('dexcom connection status')).toHaveTextContent('Invite Expired');
      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();

      // Active connection: Connected, without a View button
      rerender(ui(
        {
          id: 'patient-1',
          dataSources: [{
            providerName: 'dexcom',
            state: 'connected',
            modifiedTime: '2025-05-27T10:00:00.000Z',
            lastImportTime: '2025-05-28T10:00:00.000Z',
            latestDataTime: '2025-05-28T10:00:00.000Z',
          }],
        }
      ));

      expect(screen.getByLabelText('dexcom connection status')).toHaveTextContent('Connected');
      expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument();

      // Patient has disconnected: Patient Disconnected, with a View button
      rerender(ui(
        {
          id: 'patient-1',
          dataSources: [{
            providerName: 'dexcom',
            state: 'disconnected',
            modifiedTime: '2025-05-20T10:00:00.000Z',
          }],
        }
      ));

      expect(screen.getByLabelText('dexcom connection status')).toHaveTextContent('Patient Disconnected');
      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();

      // Connection error: Error Connecting, with a View button
      rerender(ui(
        {
          id: 'patient-1',
          dataSources: [{
            providerName: 'dexcom',
            state: 'error',
            modifiedTime: '2025-05-20T10:00:00.000Z',
          }],
        }
      ));

      expect(screen.getByLabelText('dexcom connection status')).toHaveTextContent('Error Connecting');
      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();

      // Unrecognized data source state: Unknown Status, with a View button
      rerender(ui(
        {
          id: 'patient-1',
          dataSources: [{
            providerName: 'dexcom',
            state: 'somethingUnexpected',
            modifiedTime: '2025-05-20T10:00:00.000Z',
          }],
        }
      ));

      expect(screen.getByLabelText('dexcom connection status')).toHaveTextContent('Unknown Status');
      expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    });
  });

  describe('MoreMenuCell', () => {
    const patient = { id: 'patient-1', fullName: 'James Jellyfish' };
    const onOpenEditPatientDialog = jest.fn();
    const onOpenDataConnectionsModal = jest.fn();

    beforeEach(() => {
      onOpenEditPatientDialog.mockClear();
      onOpenDataConnectionsModal.mockClear();
    });

    it('opens the Edit Patient dialog for the patient', async () => {
      renderComponent(
        <MoreMenuCell
          patient={patient}
          onOpenEditPatientDialog={onOpenEditPatientDialog}
          onOpenDataConnectionsModal={onOpenDataConnectionsModal}
        />
      );

      expect(screen.queryByRole('button', { name: /Edit Patient Details/ })).not.toBeInTheDocument();
      await userEvent.click(screen.getByTestId('action-menu-patient-1-icon'));

      await userEvent.click(screen.getByRole('button', { name: /Edit Patient Details/ }));
      expect(onOpenEditPatientDialog).toHaveBeenCalledWith('patient-1');
      expect(onOpenDataConnectionsModal).not.toHaveBeenCalled();
    });

    it('opens the Data Connections modal for the patient', async () => {
      renderComponent(
        <MoreMenuCell
          patient={patient}
          onOpenEditPatientDialog={onOpenEditPatientDialog}
          onOpenDataConnectionsModal={onOpenDataConnectionsModal}
        />
      );

      expect(screen.queryByRole('button', { name: /Bring Data into Tidepool/ })).not.toBeInTheDocument();
      await userEvent.click(screen.getByTestId('action-menu-patient-1-icon'));

      await userEvent.click(screen.getByRole('button', { name: /Bring Data into Tidepool/ }));
      expect(onOpenDataConnectionsModal).toHaveBeenCalledWith('patient-1');
      expect(onOpenEditPatientDialog).not.toHaveBeenCalled();
    });
  });
});
