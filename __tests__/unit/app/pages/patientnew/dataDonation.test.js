/* global jest, test, expect, describe, it */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom'; // for useParams
import configureStore from 'redux-mock-store'; // for mockStore
import { Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import { default as DataDonation} from '../../../../../app/pages/patientnew/dataDonation';
import { ToastProvider } from '@app/providers/ToastProvider';
import { DATA_DONATION_CONSENT_TYPE, URL_BIG_DATA_DONATION_INFO } from '../../../../../app/core/constants';

describe('DataDonation page', ()  => {
  const mockStore = configureStore([thunk]);

  const defaultWorkingState = {
    inProgress: false,
    completed: false,
    notification: null,
  };

  const completedState = {
    ...defaultWorkingState,
    completed: true,
  };

  const loggedInUserId = 'user123';

  const initialState = {
    loggedInUserId,
    consents: {
      [DATA_DONATION_CONSENT_TYPE]: { content: 'Consent document stub', type: DATA_DONATION_CONSENT_TYPE, version: 1 },
    },
    consentRecords: {},
    working: {
      creatingUserConsentRecord: defaultWorkingState
    }
  };

  const consentedState = {
    ...initialState,
    consentRecords: {
      [DATA_DONATION_CONSENT_TYPE]: { id: 'consent-id', type: DATA_DONATION_CONSENT_TYPE, status: 'active' }
    }
  };

  const createStore = blipState => mockStore({
    blip: blipState,
  });

  let store;

  const defaultProps = {
    trackMetric: jest.fn(),
    api: {
      consent: {
        getLatestConsentByType: jest.fn(),
        getUserConsentRecords: jest.fn(),
        createUserConsentRecord: jest.fn(),
        updateUserConsentRecord: jest.fn(),
        revokeUserConsentRecord: jest.fn(),
      },
    },
  };

  const MockedProviderWrappers = ({ children, blipState }) => {
    store = createStore(blipState);
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={['/patients/new/dataDonation']}>
          <Switch>
            <Route path='/patients/new/dataDonation'>
              <ToastProvider>
                {children}
              </ToastProvider>
            </Route>
          </Switch>
        </MemoryRouter>
      </Provider>
    );
  };
  describe('initial state', () => {
    it('displays the correct content for initial state', () => {
      render(
        <MockedProviderWrappers blipState={initialState}>
          <DataDonation {...defaultProps} />
        </MockedProviderWrappers>
      );

      expect(screen.getByRole('heading', { name: 'Consider Donating Your Anonymized Data!' })).toBeInTheDocument();
      expect(screen.getByLabelText('Data donation slideshow')).toBeInTheDocument();

      const donationLink = screen.getByLabelText('Data donation details link');
      expect(donationLink).toBeInTheDocument();
      expect(donationLink).toHaveAttribute('href', URL_BIG_DATA_DONATION_INFO);
      expect(donationLink).toHaveAttribute('target', '_blank');
      expect(donationLink).toHaveAttribute('rel', 'noreferrer noopener');

      expect(screen.getByRole('button', { name: "Yes, I'm Interested" })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'No, Thanks' })).toBeInTheDocument();

      // elements unique to the consented state should be missing
      expect(screen.queryByLabelText('Consent success message')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Stop Sharing Data' })).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Data donation supported non-profits')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Done' })).not.toBeInTheDocument();
    });

    it('should open the consent form modal when the appropriate button is clicked', async () => {
      render(
        <MockedProviderWrappers blipState={initialState}>
          <DataDonation {...defaultProps} />
        </MockedProviderWrappers>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Consent document stub')).not.toBeInTheDocument();

      const button = screen.getByRole('button', { name: "Yes, I'm Interested" });
      await userEvent.click(button);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText('Consent document stub')).toBeInTheDocument();
    });

    it('should redirect to the patient data view when the appropriate button is clicked', async () => {
      render(
        <MockedProviderWrappers blipState={initialState}>
          <DataDonation {...defaultProps} />
        </MockedProviderWrappers>
      );

      store.clearActions();
      const button = screen.getByRole('button', { name: 'No, Thanks' });
      await userEvent.click(button);

      // Assert that the expected action was dispatched
      const actions = store.getActions();
      expect(actions).toEqual([{
        payload: {
          args: [
            '/patients/user123/data',
          ],
          method: 'push',
        },
        type: '@@router/CALL_HISTORY_METHOD',
      }]);
    });
  });

  describe('consented state', () => {
    it('displays the correct content for consented state', () => {
      render(
        <MockedProviderWrappers blipState={consentedState}>
          <DataDonation {...defaultProps} />
        </MockedProviderWrappers>
      );

      expect(screen.getByRole('heading', { name: 'Thank You for Donating Your Data!' })).toBeInTheDocument();
      expect(screen.getByLabelText('Data donation slideshow')).toBeInTheDocument();
      expect(screen.getByLabelText('Consent success message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Stop Sharing Data' })).toBeInTheDocument();
      expect(screen.getByLabelText('Data donation supported non-profits')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();

      // elements unique to the initial state should be missing
      expect(screen.queryByLabelText('Data donation details link')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: "Yes, I'm Interested" })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'No, Thanks' })).not.toBeInTheDocument();
    });

    it('should open the revoke consent modal when the appropriate button is clicked', async () => {
      render(
        <MockedProviderWrappers blipState={consentedState}>
          <DataDonation {...defaultProps} />
        </MockedProviderWrappers>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Consent document stub')).not.toBeInTheDocument();

      const button = screen.getByRole('button', { name: 'Stop Sharing Data' });
      await userEvent.click(button);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByText('Stop Sharing Data?')).toBeInTheDocument();
    });

    it('should redirect to the patient data view when the appropriate button is clicked', async () => {
      render(
        <MockedProviderWrappers blipState={consentedState}>
          <DataDonation {...defaultProps} />
        </MockedProviderWrappers>
      );

      store.clearActions();
      const button = screen.getByRole('button', { name: 'Done' });
      await userEvent.click(button);

      const actions = store.getActions();
      expect(actions).toEqual([{
        payload: {
          args: [
            '/patients/user123/data',
          ],
          method: 'push',
        },
        type: '@@router/CALL_HISTORY_METHOD',
      }]);
    });
  });
});
