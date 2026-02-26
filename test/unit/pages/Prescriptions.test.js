import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import merge from 'lodash/merge';
import { ToastProvider } from '../../../app/providers/ToastProvider';
import Prescriptions from '../../../app/pages/prescription/Prescriptions';
import { clinicUIDetails } from '../../../app/core/clinicUtils';
import LDClientMock from '../../fixtures/LDClientMock';

const mockUseFlags = jest.fn();
const mockUseLDClient = jest.fn();

jest.mock('launchdarkly-react-client-sdk', () => ({
  useFlags: () => mockUseFlags(),
  useLDClient: () => mockUseLDClient(),
}));

/* global chai */
/* global sinon */
/* global describe */
/* global context */
/* global it */
/* global beforeEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('Prescriptions', () => {
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
    searchDebounceMs: 0,
    api: {
      prescription: {
        getAllForClinic: sinon.stub(),
        delete: sinon.stub(),
      },
      user: {
        getAssociatedAccounts: sinon.stub(),
      },
    },
  };

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const completedState = {
    ...defaultWorkingState,
    completed: true,
  };

  const loggedInUserId = 'clinicianUserId123';

  const clinicianUserId123 = {
    email: 'clinic@example.com',
    roles: ['CLINIC_ADMIN'],
    id: 'clinicianUserId123',
  };

  const defaultClinic = {
    clinicians: {
      clinicianUserId123,
    },
    patients: {},
    id: 'clinicID123',
    address: '2 Address Ln, City Zip',
    country: 'US',
    name: 'other_clinic_name',
    email: 'other_clinic_email_address@example.com',
    timezone: 'US/Eastern',
    entitlements: {
      prescriptions: true,
    },
  };

  const initialState = {
    blip: {
      allUsersMap: {
        clinicianUserId123,
      },
      loggedInUserId,
      clinics: {
        clinicID123: {
          ...defaultClinic,
          ...clinicUIDetails(defaultClinic),
        },
      },
      selectedClinicId: 'clinicID123',
      membershipPermissionsInOtherCareTeams: {},
      prescriptions: [],
      working: {
        fetchingAssociatedAccounts: defaultWorkingState,
        fetchingClinicPrescriptions: defaultWorkingState,
        deletingPrescription: defaultWorkingState,
      },
    },
  };

  const noPrescriptionsState = merge({}, initialState, {
    blip: {
      ...initialState.blip,
      working: {
        fetchingAssociatedAccounts: completedState,
        fetchingClinicPrescriptions: completedState,
        deletingPrescription: defaultWorkingState,
      },
    },
  });

  const hasPrescriptionsState = merge({}, noPrescriptionsState, {
    blip: {
      ...noPrescriptionsState.blip,
      prescriptions: [
        {
          id: 'patient1RxId',
          clinicId: 'clinicID123',
          accessCode: 'access1',
          patientUserId: 'patient1Id',
          latestRevision: {
            attributes: {
              birthday: '1989-10-09',
              createdTime: '2024-02-02T12:00:00.000Z',
              email: 'patient1@test.ca',
              firstName: 'Patient',
              lastName: 'One',
              mrn: 'mrn1',
            },
          },
          state: 'submitted',
        },
        {
          id: 'patient2RxId',
          clinicId: 'clinicID123',
          accessCode: 'access2',
          latestRevision: {
            attributes: {
              birthday: '1989-10-10',
              createdTime: '2024-02-01T12:00:00.000Z',
              email: 'patient2@test.ca',
              firstName: 'Patient',
              lastName: 'Two',
              mrn: 'mrn2',
            },
          },
          state: 'draft',
        },
      ],
    },
  });

  const renderWithState = (state) => {
    const store = mockStore(state);
    const view = render(
      <Provider store={store}>
        <ToastProvider>
          <Prescriptions {...defaultProps} />
        </ToastProvider>
      </Provider>
    );

    return { ...view, store };
  };

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    defaultProps.api.prescription.getAllForClinic.resetHistory();
    defaultProps.api.prescription.delete.resetHistory();
    defaultProps.api.user.getAssociatedAccounts.resetHistory();

    mockUseLDClient.mockReturnValue(new LDClientMock({ clinic: { tier: 'tier0300' } }));
    mockUseFlags.mockReturnValue({
      showPrescriptions: true,
    });
  });

  context('on mount', () => {
    it('should redirect back to the clinic workspace patients list if LD `showPrescriptions` flag is false', () => {
      const state = merge({}, initialState, {
        blip: {
          clinics: {
            clinicID123: {
              ...initialState.blip.clinics.clinicID123,
              entitlements: {
                prescriptions: false,
              },
            },
          },
        },
      });

      mockUseFlags.mockReturnValue({
        showPrescriptions: false,
      });

      const { store } = renderWithState(state);

      expect(store.getActions()[0]).to.eql({
        payload: { args: ['/clinic-workspace/patients'], method: 'push' },
        type: '@@router/CALL_HISTORY_METHOD',
      });
    });

    it('should not fetch prescriptions or associated accounts for clinic if already in progress', () => {
      const state = merge({}, initialState, {
        blip: {
          working: {
            fetchingClinicPrescriptions: {
              inProgress: true,
            },
            fetchingAssociatedAccounts: {
              inProgress: true,
            },
          },
        },
      });

      const { store } = renderWithState(state);

      expect(store.getActions()).to.eql([]);
    });

    it('should fetch prescriptions and associated accounts for clinic', () => {
      const { store } = renderWithState(initialState);

      const expectedActions = [
        { type: 'FETCH_ASSOCIATED_ACCOUNTS_REQUEST' },
        { type: 'FETCH_CLINIC_PRESCRIPTIONS_REQUEST' },
      ];

      expect(store.getActions()).to.eql(expectedActions);
    });
  });

  context('no prescriptions', () => {
    it('should render an empty table', () => {
      const { container } = renderWithState(noPrescriptionsState);
      const rows = container.querySelectorAll('#prescriptions-table tr');

      expect(rows.length).to.equal(1);
      expect(container.textContent).includes('There are no prescriptions to show.');
    });
  });

  context('has prescriptions', () => {
    it('should render a list of prescriptions', () => {
      const { container } = renderWithState(hasPrescriptionsState);
      const rows = container.querySelectorAll('#prescriptions-table tr');

      expect(rows.length).to.equal(3);

      expect(rows[1].textContent).contains('Patient One');
      expect(rows[1].textContent).contains('10/09/1989');
      expect(rows[1].textContent).contains('mrn1');
      expect(rows[1].textContent).contains('access1');
      expect(rows[1].textContent).contains('Submitted');

      expect(rows[2].textContent).contains('Patient Two');
      expect(rows[2].textContent).contains('10/10/1989');
      expect(rows[2].textContent).contains('mrn2');
      expect(rows[2].textContent).not.contains('access2');
      expect(rows[2].textContent).contains('Draft');
    });

    it('should allow searching prescriptions', async () => {
      const { container } = renderWithState(hasPrescriptionsState);

      const searchInput = container.querySelector('input[name="search-prescriptions"]');
      fireEvent.change(searchInput, { target: { name: 'search-prescriptions', value: 'Tw' } });

      await waitFor(() => {
        const rows = container.querySelectorAll('#prescriptions-table tr');
        expect(rows.length).to.equal(2);
        expect(rows[1].textContent).contains('Patient Two');
      });
    });

    it('should redirect to a prescription view when a prescription row is clicked', () => {
      const { container, store } = renderWithState(hasPrescriptionsState);
      const firstPrescription = container.querySelector('#prescriptions-table-row-0');

      store.clearActions();
      fireEvent.click(firstPrescription);

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/patient1RxId'] },
        },
      ]);
    });

    it('should display menu when More icon is clicked', async () => {
      const { container } = renderWithState(hasPrescriptionsState);
      const menuTriggers = container.querySelectorAll('#prescriptions-table button[aria-haspopup="true"]');

      fireEvent.click(menuTriggers[0]);

      await waitFor(() => {
        expect(screen.getByText('View Tidepool Loop Start Order')).to.exist;
      });
    });

    it('should redirect to a prescription view when view action is clicked', async () => {
      const { container, store } = renderWithState(hasPrescriptionsState);
      const menuTriggers = container.querySelectorAll('#prescriptions-table button[aria-haspopup="true"]');

      store.clearActions();
      fireEvent.click(menuTriggers[0]);
      fireEvent.click(await screen.findByText('View Tidepool Loop Start Order'));

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/patient1RxId'] },
        },
      ]);
    });

    it('should redirect to a prescription view when edit action is clicked', async () => {
      const { container, store } = renderWithState(hasPrescriptionsState);
      const menuTriggers = container.querySelectorAll('#prescriptions-table button[aria-haspopup="true"]');

      store.clearActions();
      fireEvent.click(menuTriggers[1]);
      fireEvent.click(await screen.findByText('Update Tidepool Loop Start Order'));

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/patient2RxId'] },
        },
      ]);
    });

    it('should add a prescription', () => {
      const { container, store } = renderWithState(hasPrescriptionsState);
      const addButton = container.querySelector('button#add-prescription');

      store.clearActions();
      fireEvent.click(addButton);

      expect(store.getActions()).to.eql([
        {
          type: '@@router/CALL_HISTORY_METHOD',
          payload: { method: 'push', args: ['/prescriptions/new'] },
        },
      ]);
    });

    it('should delete a prescription', async () => {
      const { container, store } = renderWithState(hasPrescriptionsState);
      const menuTriggers = container.querySelectorAll('#prescriptions-table button[aria-haspopup="true"]');

      fireEvent.click(menuTriggers[1]);
      await waitFor(() => {
        expect(document.querySelectorAll('button#delete').length).to.equal(1);
      });
      fireEvent.click(document.querySelector('button#delete'));

      expect(defaultProps.trackMetric.calledWith('Clinic - Delete prescription')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(1);

      const confirmRemoveButton = document.querySelector('#prescription-delete-confirm');
      expect(confirmRemoveButton.textContent).to.equal('Delete Tidepool Loop Start Order');

      store.clearActions();
      fireEvent.click(confirmRemoveButton);

      expect(store.getActions()).to.eql([
        {
          payload: {
            prescriptionId: 'patient2RxId',
          },
          type: 'DELETE_PRESCRIPTION_REQUEST',
        },
      ]);

      sinon.assert.calledWith(defaultProps.api.prescription.delete, 'clinicID123', 'patient2RxId');
      expect(defaultProps.trackMetric.calledWith('Clinic - Delete prescription confirmed')).to.be.true;
      expect(defaultProps.trackMetric.callCount).to.equal(2);
    });
  });
});
