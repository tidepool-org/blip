import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { push } from 'connected-react-router';
import { useFlags } from 'launchdarkly-react-client-sdk';

import '@app/core/language';
import ClinicWorkspace from '@app/pages/clinicworkspace';
import { resetTideDashboardState } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';

jest.mock('launchdarkly-react-client-sdk', () => ({ useFlags: jest.fn() }));

jest.mock('@app/components/clinic/ClinicWorkspaceHeader', () => () => <div>stubbed clinic workspace header</div>);
jest.mock('@app/pages/share', () => ({ PatientInvites: () => <div>stubbed patient invites</div> }));
jest.mock('@app/pages/clinicworkspace/ClinicPatients', () => () => <div>stubbed clinic patients</div>);
jest.mock('@app/pages/clinicworkspace/TideDashboardV2', () => () => <div>stubbed tide dashboard</div>);
jest.mock('@app/pages/prescription/Prescriptions', () => () => <div>stubbed prescriptions</div>);

jest.mock('@app/redux/actions', () => ({
  worker: { dataWorkerRemoveDataRequest: jest.fn(() => ({ type: 'MOCK_ACTION' })) },
  sync: { clearPatientInView: jest.fn(() => ({ type: 'MOCK_ACTION' })) },
  async: {
    fetchPatientInvites: jest.fn(() => ({ type: 'MOCK_ACTION' })),
    selectClinic: jest.fn(() => ({ type: 'MOCK_ACTION' })),
  },
}));

const mockStore = configureStore([thunk]);

describe('ClinicWorkspace', () => {
  let store;
  let defaultProps;

  const defaultState = {
    blip: {
      loggedInUserId: 'clinicianUserId123',
      selectedClinicId: 'clinic123',
      currentPatientInViewId: null,
      clinics: {
        clinic123: {
          id: 'clinic123',
          patientInvites: {
            invite1: { key: 'invite1' },
            invite2: { key: 'invite2' },
          },
        },
      },
      working: {
        fetchingPatientInvites: { inProgress: false, completed: true, notification: null },
      },
    },
  };

  const renderComponent = (route = '') => render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/clinic-workspace/${route}`]}>
        <Route path="/clinic-workspace/:tab?" children={() => <ClinicWorkspace {...defaultProps} />} />
      </MemoryRouter>
    </Provider>
  );

  beforeEach(() => {
    useFlags.mockReturnValue({ showTideDashboard: true, showPrescriptions: true });
    store = mockStore(defaultState);
    defaultProps = { api: {}, trackMetric: jest.fn() };
  });

  describe('tab visibility', () => {
    it('shows no optional tabs when both flags are off', () => {
      useFlags.mockReturnValue({ showTideDashboard: false, showPrescriptions: false });
      renderComponent();

      expect(screen.getByRole('tab', { name: 'Patient List' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'TIDE Dashboard' })).not.toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Invites (2)' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Tidepool Loop Start Orders' })).not.toBeInTheDocument();
    });

    it('adds the TIDE Dashboard tab when showTideDashboard is on', () => {
      useFlags.mockReturnValue({ showTideDashboard: true, showPrescriptions: false });
      renderComponent();

      expect(screen.getByRole('tab', { name: 'Patient List' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'TIDE Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Invites (2)' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Tidepool Loop Start Orders' })).not.toBeInTheDocument();
    });

    it('adds the Tidepool Loop Start Orders tab when showPrescriptions is on', () => {
      useFlags.mockReturnValue({ showTideDashboard: false, showPrescriptions: true });
      renderComponent();

      expect(screen.getByRole('tab', { name: 'Patient List' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'TIDE Dashboard' })).not.toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Invites (2)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tidepool Loop Start Orders' })).toBeInTheDocument();
    });

    it('shows all tabs when all flags are on', () => {
      useFlags.mockReturnValue({ showTideDashboard: true, showPrescriptions: true });
      renderComponent();

      expect(screen.getByRole('tab', { name: 'Patient List' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'TIDE Dashboard' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Invites (2)' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tidepool Loop Start Orders' })).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('sets the tide dashboard path when clicking TIDE Dashboard', async () => {
      renderComponent();

      expect(screen.queryByText('stubbed tide dashboard')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: 'TIDE Dashboard' }));

      expect(screen.getByText('stubbed tide dashboard')).toBeInTheDocument();
      expect(store.getActions()).toContainEqual(push('/clinic-workspace/tide-dashboard'));
      expect(store.getActions()).toContainEqual(resetTideDashboardState());
    });

    it('sets the invites path when clicking Invites', async () => {
      renderComponent();

      expect(screen.queryByText('stubbed patient invites')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: 'Invites (2)' }));

      expect(screen.getByText('stubbed patient invites')).toBeInTheDocument();
      expect(store.getActions()).toContainEqual(push('/clinic-workspace/invites'));
      expect(store.getActions()).not.toContainEqual(resetTideDashboardState());
    });

    it('sets the prescriptions path when clicking Tidepool Loop Start Orders', async () => {
      renderComponent();

      expect(screen.queryByText('stubbed prescriptions')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: 'Tidepool Loop Start Orders' }));

      expect(screen.getByText('stubbed prescriptions')).toBeInTheDocument();
      expect(store.getActions()).toContainEqual(push('/clinic-workspace/prescriptions'));
      expect(store.getActions()).not.toContainEqual(resetTideDashboardState());
    });

    it('sets the patients path when clicking Patient List from another tab', async () => {
      renderComponent('invites');

      // The invites route param pre-selects the Invites tab
      expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('Invites (2)');
      expect(screen.queryByText('stubbed clinic patients')).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole('tab', { name: 'Patient List' }));

      expect(screen.getByText('stubbed clinic patients')).toBeInTheDocument();
      expect(store.getActions()).toContainEqual(push('/clinic-workspace/patients'));
      expect(store.getActions()).not.toContainEqual(resetTideDashboardState());
    });
  });
});
