/* global jest */
/* global expect */
/* global describe */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import qhistory from 'qhistory';
import { stringify, parse } from 'qs';

import VerificationWithPassword from '@app/pages/verificationwithpassword/verificationwithpassword';
import * as actions from '@app/redux/actions';

jest.mock('@app/redux/actions', () => ({
  async: {
    verifyCustodial: jest.fn().mockReturnValue({ type: 'MOCK_VERIFY_CUSTODIAL' }),
  },
}));

jest.mock('@app/providers/ToastProvider', () => ({
  useToasts: () => ({ set: jest.fn() }),
}));

const mockStore = configureStore([thunk]);

const history = qhistory(
  createMemoryHistory({ initialEntries: ['/verification-with-password?signupKey=testKey123&signupEmail=test@example.com'] }),
  stringify,
  parse
);

describe('VerificationWithPassword', () => {
  const store = mockStore({
    blip: {
      working: {
        verifyingCustodial: {
          notification: null,
          inProgress: false,
        },
      },
    },
  });

  const defaultProps = {
    api: {},
    fetchingUser: false,
    user: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls verifyCustodial with correct arguments when form is submitted with valid inputs', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <VerificationWithPassword {...defaultProps} />
        </Router>
      </Provider>
    );

    await userEvent.type(screen.getByLabelText('Create Password'), 'ValidPass123!');
    await userEvent.type(screen.getByLabelText('Confirm password'), 'ValidPass123!');
    await userEvent.type(screen.getByLabelText('Birthday'), '01/15/1990');

    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(actions.async.verifyCustodial).toHaveBeenCalledWith(
        defaultProps.api,
        'testKey123',
        'test@example.com',
        '1990-01-15',
        'ValidPass123!'
      );
    });
  });

  it('does not call verifyCustodial and shows appropriate errors for invalid inputs', async () => {
    const { rerender } = render(
      <Provider store={store}>
        <Router history={history}>
          <VerificationWithPassword {...defaultProps} />
        </Router>
      </Provider>
    );

    const passwordInput = screen.getByLabelText('Create Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm password');
    const birthdayInput = screen.getByLabelText('Birthday');
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });

    // Test 1: All fields blank
    await userEvent.type(birthdayInput, '01');
    await userEvent.click(confirmButton);

    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('You have not entered a password.')).toBeInTheDocument();
    expect(actions.async.verifyCustodial).not.toHaveBeenCalled();

    // Clear inputs and rerender
    await userEvent.clear(birthdayInput);
    rerender(
      <Provider store={store}>
        <Router history={history}>
          <VerificationWithPassword {...defaultProps} />
        </Router>
      </Provider>
    );

    // Test 2: Password too short
    await userEvent.type(passwordInput, 'short');
    await userEvent.type(confirmPasswordInput, 'short');
    await userEvent.type(birthdayInput, '01/15/1990');

    await userEvent.click(confirmButton);

    expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(actions.async.verifyCustodial).not.toHaveBeenCalled();

    // Clear inputs and rerender
    await userEvent.clear(passwordInput);
    await userEvent.clear(confirmPasswordInput);
    await userEvent.clear(birthdayInput);
    rerender(
      <Provider store={store}>
        <Router history={history}>
          <VerificationWithPassword {...defaultProps} />
        </Router>
      </Provider>
    );

    // Test 3: Passwords don't match
    await userEvent.type(passwordInput, 'ValidPass123!');
    await userEvent.type(confirmPasswordInput, 'DifferentPass456!');
    await userEvent.type(birthdayInput, '01/15/1990');

    await userEvent.click(confirmButton);

    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
    expect(actions.async.verifyCustodial).not.toHaveBeenCalled();
  });
});
