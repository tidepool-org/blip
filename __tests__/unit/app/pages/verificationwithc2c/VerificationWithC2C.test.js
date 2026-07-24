/* global jest */
/* global expect */
/* global describe */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import VerificationWithC2C from '@app/pages/verificationwithc2c/VerificationWithC2C';
import { providers } from '@app/components/datasources/DataConnections';
import * as actions from '@app/redux/actions';

const mockSetToast = jest.fn();
const mockUnwrap = jest.fn();
const mockValidateRestrictedToken = jest.fn(() => ({ unwrap: mockUnwrap }));

jest.mock('@app/providers/ToastProvider', () => ({
  useToasts: () => ({ set: mockSetToast }),
}));

jest.mock('@app/redux/actions', () => ({
  sync: { connectDataSourceSuccess: jest.fn().mockReturnValue({ type: 'MOCK_CONNECT_DATA_SOURCE_SUCCESS' }) },
}));

jest.mock('@app/pages/verificationwithc2c/useRedirectOnC2CSuccess', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('@app/pages/verificationwithc2c/VerificationApi', () => ({
  useLazyValidateRestrictedTokenQuery: () => [mockValidateRestrictedToken],
}));

const mockStore = configureStore([thunk]);

describe('VerificationWithC2C', () => {
  let store;
  let history;

  const renderComponent = () => render(
    <Provider store={store}>
      <Router history={history}>
        <VerificationWithC2C />
      </Router>
    </Provider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    history = createMemoryHistory({ initialEntries: ['/verification-with-c2c?restrictedTokenId=abc123'] });
    store = mockStore({ blip: { loggedInUserId: null, allUsersMap: {} } });
  });

  it('navigates to account setup preserving query params when the skip button is clicked', async () => {
    renderComponent();

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText('Choose how you manage your diabetes')).toBeInTheDocument();

    // One Connect button per provider
    expect(screen.getAllByRole('button', { name: /Connect/ })).toHaveLength(Object.keys(providers).length);
    expect(screen.getByRole('button', { name: /I have a different device/ })).toBeInTheDocument();

    // On the C2C page to start
    expect(history.location.pathname).toBe('/verification-with-c2c');
    expect(history.location.search).toBe('?restrictedTokenId=abc123');

    // Skip the connection step
    await userEvent.click(screen.getByRole('button', { name: /I have a different device/ }));

    // Redirected to the password flow, restricted token preserved
    expect(history.location.pathname).toBe('/verification-with-password');
    expect(history.location.search).toBe('?restrictedTokenId=abc123');
  });

  it('dispatches connectDataSourceSuccess with the provider id and popup url when the token is valid', async () => {
    renderComponent();

    // Connect the first provider (dexcom). The current provider and restricted token are validated
    mockUnwrap.mockResolvedValue({ isValid: true });
    await userEvent.click(screen.getAllByRole('button', { name: /Connect/ })[0]);
    expect(mockValidateRestrictedToken).toHaveBeenCalledWith({ restrictedToken: 'abc123', providerName: 'dexcom' });

    await waitFor(() => expect(actions.sync.connectDataSourceSuccess).toHaveBeenCalledWith(
      'oauth/dexcom',      // providerId
      'http://app.tidepool.test/v1/oauth/dexcom/authorize?restricted_token=abc123',  // data connection popup url
    ));
  });

  it('redirects to account setup and shows a danger toast when the token is invalid', async () => {
    renderComponent();

    // Attempt to connect the first provider (dexcom)
    mockUnwrap.mockResolvedValue({ isValid: false });
    await userEvent.click(screen.getAllByRole('button', { name: /Connect/ })[0]);

    // Redirected to the password flow, query params preserved
    await waitFor(() => expect(history.location.pathname).toBe('/verification-with-password'));
    expect(history.location.search).toBe('?restrictedTokenId=abc123');

    // A danger toast explains the failure, and no connection is dispatched
    expect(mockSetToast).toHaveBeenCalledWith({
      message: 'An error occurred. Your connection invite may be expired or already used. Create an account to check your connection status.',
      variant: 'danger',
    });

    expect(actions.sync.connectDataSourceSuccess).not.toHaveBeenCalled();
  });
});
