/* global jest */
/* global expect */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global it */

import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import OAuthConnection from '../../../../app/pages/oauth/OAuthConnection';
import utils from '../../../../app/core/utils';

const mockHistoryPush = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useHistory: () => ({ push: mockHistoryPush }),
  };
});

jest.mock('../../../../app/core/utils', () => ({
  __esModule: true,
  default: { isMobile: jest.fn() },
}));

describe('OAuthConnection', () => {
  const trackMetric = jest.fn();
  // const historyPushSpy = jest.fn();

  const mockStore = configureStore([thunk]);
  let store;

  const defaultProps = {
    trackMetric,
  };

  beforeEach(() => {
    store = mockStore({});
    utils.isMobile.mockReturnValue(false);
  });

  afterEach(() => {
    trackMetric.mockClear();
    mockHistoryPush.mockClear();
    store.clearActions();
  });

  const MockedProviderWrappers = ({ children, path }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Switch>
          <Route path="/oauth/:providerName/:status">
            {children}
          </Route>
        </Switch>
      </MemoryRouter>
    </Provider>
  );

  describe('dexcom authorized', () => {
    describe('when desktop non-custodial signup', () => {
      utils.isMobile.mockReturnValue(true);

      it('should track metric, render success content, and hide back button', () => {
        render(
          <MockedProviderWrappers path={'/oauth/dexcom/authorized'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'authorized',
          custodialSignup: false,
        });

        expect(screen.getByText('You have successfully connected your Dexcom data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Authorized')).toBeInTheDocument();
        expect(screen.getByText('Thank you for connecting with Tidepool!')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const backButton = screen.queryByRole('button', { name: /Back to Tidepool/ });

        expect(backButton).not.toBeInTheDocument();
      });
    });

    describe('when mobile non-custodial signup', () => {
      it('should track metric, render success content, and navigate to patients on back button click', async () => {
        utils.isMobile.mockReturnValue(true);

        render(
          <MockedProviderWrappers path={'/oauth/dexcom/authorized'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'authorized',
          custodialSignup: false,
        });

        expect(screen.getByText('You have successfully connected your Dexcom data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Authorized')).toBeInTheDocument();
        expect(screen.getByText('Thank you for connecting with Tidepool!')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const backButton = screen.getByRole('button', { name: /Back to Tidepool/ });

        await userEvent.click(backButton);

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection - Redirect back to Tidepool App', {
          providerName: 'dexcom',
          status: 'authorized',
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/patients',
          search: 'justLoggedIn=true&dataConnectionStatus=authorized&dataConnectionProviderName=dexcom',
        });
      });
    });

    describe('when desktop custodial signup', () => {
      it('should track metric, render success content, and navigate to verification on claim account click', async () => {
        render(
          <MockedProviderWrappers path={'/oauth/dexcom/authorized?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'authorized',
          custodialSignup: true,
        });

        expect(screen.getByText('You have successfully connected your Dexcom data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Authorized')).toBeInTheDocument();
        expect(screen.getByText('Thank you for connecting with Tidepool!')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const claimAccountButton = screen.getByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).toBeInTheDocument();

        expect(mockHistoryPush).not.toHaveBeenCalled();

        await userEvent.click(claimAccountButton);

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection - Claim Account', {
          providerName: 'dexcom',
          status: 'authorized',
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/verification-with-password',
          search: 'signupKey=abc&signupEmail=patient%40mail.com',
        });
      });
    });

    describe('when mobile custodial signup', () => {
      it('should track metric and auto-redirect to verification with success flag', async () => {
        utils.isMobile.mockReturnValue(true);

        render(
          <MockedProviderWrappers path={'/oauth/dexcom/authorized?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'authorized',
          custodialSignup: true,
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/verification-with-password',
          search: 'signupKey=abc&signupEmail=patient%40mail.com&isC2CSuccess=true',
        });
      });
    });
  });

  describe('dexcom declined', () => {
    describe('when desktop non-custodial signup', () => {
      it('should track metric, render declined content, and hide claim account button', () => {
        render(
          <MockedProviderWrappers path={'/oauth/dexcom/declined'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'declined',
          custodialSignup: false,
        });

        expect(screen.getByText('You have declined connecting your Dexcom data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Declined')).toBeInTheDocument();
        expect(screen.getByText('You can always decide to connect at a later time.')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const claimAccountButton = screen.queryByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).not.toBeInTheDocument();
      });
    });

    describe('when desktop custodial signup', () => {
      it('should track metric, render declined content, and navigate to verification on claim account click', async () => {
        render(
          <MockedProviderWrappers path={'/oauth/dexcom/declined?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'declined',
          custodialSignup: true,
        });

        expect(screen.getByText('You have declined connecting your Dexcom data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Declined')).toBeInTheDocument();
        expect(screen.getByText('You can always decide to connect at a later time.')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const claimAccountButton = screen.getByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).toBeInTheDocument();

        expect(mockHistoryPush).not.toHaveBeenCalled();

        await userEvent.click(claimAccountButton);

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection - Claim Account', {
          providerName: 'dexcom',
          status: 'declined',
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/verification-with-password',
          search: 'signupKey=abc&signupEmail=patient%40mail.com',
        });
      });
    });
  });

  describe('dexcom error', () => {
    describe('when desktop non-custodial signup', () => {
      it('should track metric, render error content, and hide secondary message and claim account button', () => {
        render(
          <MockedProviderWrappers path={'/oauth/dexcom/error'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'error',
          custodialSignup: false,
        });

        expect(screen.getByText('We were unable to determine your Dexcom connection status.')).toBeInTheDocument();
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText("Hmm... That didn't work. Please try again.")).toBeInTheDocument();

        const messageText = screen.queryByText('We hope you enjoy your Tidepool experience.');
        expect(messageText).not.toBeInTheDocument();

        const claimAccountButton = screen.queryByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).not.toBeInTheDocument();
      });
    });

    describe('when desktop custodial signup', () => {
      it('should track metric, render error content, and hide claim account button even with signup params', () => {
        render(
          <MockedProviderWrappers path={'/oauth/dexcom/error?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'dexcom',
          status: 'error',
          custodialSignup: true,
        });

        expect(screen.getByText('We were unable to determine your Dexcom connection status.')).toBeInTheDocument();
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText("Hmm... That didn't work. Please try again.")).toBeInTheDocument();

        const claimAccountButton = screen.queryByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).not.toBeInTheDocument();
      });
    });
  });

  describe('twiist authorized', () => {
    describe('when desktop non-custodial signup', () => {
      it('should track metric, render success content, and hide back button', () => {
        render(
          <MockedProviderWrappers path={'/oauth/twiist/authorized'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'authorized',
          custodialSignup: false,
        });

        expect(screen.getByText('You have successfully connected your twiist data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Authorized')).toBeInTheDocument();
        expect(screen.getByText('Thank you for connecting with Tidepool!')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const backButton = screen.queryByRole('button', { name: /Back to Tidepool/ });
        expect(backButton).not.toBeInTheDocument();
      });
    });

    describe('when mobile non-custodial signup', () => {
      it('should track metric, render success content, and navigate to patients on back button click', async () => {
        utils.isMobile.mockReturnValue(true);

        render(
          <MockedProviderWrappers path={'/oauth/twiist/authorized'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'authorized',
          custodialSignup: false,
        });

        expect(screen.getByText('You have successfully connected your twiist data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Authorized')).toBeInTheDocument();
        expect(screen.getByText('Thank you for connecting with Tidepool!')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const backButton = screen.getByRole('button', { name: /Back to Tidepool/ });

        await userEvent.click(backButton);

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection - Redirect back to Tidepool App', {
          providerName: 'twiist',
          status: 'authorized',
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/patients',
          search: 'justLoggedIn=true&dataConnectionStatus=authorized&dataConnectionProviderName=twiist',
        });
      });
    });

    describe('when desktop custodial signup', () => {
      it('should track metric, render success content, and navigate to verification on claim account click', async () => {
        render(
          <MockedProviderWrappers path={'/oauth/twiist/authorized?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'authorized',
          custodialSignup: true,
        });

        expect(screen.getByText('You have successfully connected your twiist data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Authorized')).toBeInTheDocument();
        expect(screen.getByText('Thank you for connecting with Tidepool!')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const claimAccountButton = screen.getByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).toBeInTheDocument();

        expect(mockHistoryPush).not.toHaveBeenCalled();

        await userEvent.click(claimAccountButton);

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection - Claim Account', {
          providerName: 'twiist',
          status: 'authorized',
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/verification-with-password',
          search: 'signupKey=abc&signupEmail=patient%40mail.com',
        });
      });
    });

    describe('when mobile custodial signup', () => {
      it('should track metric and auto-redirect to verification with success flag', async () => {
        utils.isMobile.mockReturnValue(true);

        render(
          <MockedProviderWrappers path={'/oauth/twiist/authorized?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'authorized',
          custodialSignup: true,
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/verification-with-password',
          search: 'signupKey=abc&signupEmail=patient%40mail.com&isC2CSuccess=true',
        });
      });
    });
  });

  describe('twiist declined', () => {
    describe('when desktop non-custodial signup', () => {
      it('should track metric, render declined content, and hide claim account button', () => {
        render(
          <MockedProviderWrappers path={'/oauth/twiist/declined'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'declined',
          custodialSignup: false,
        });

        expect(screen.getByText('You have declined connecting your twiist data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Declined')).toBeInTheDocument();
        expect(screen.getByText('You can always decide to connect at a later time.')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const claimAccountButton = screen.queryByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).not.toBeInTheDocument();
      });
    });

    describe('when desktop custodial signup', () => {
      it('should track metric, render declined content, and navigate to verification on claim account click', async () => {
        render(
          <MockedProviderWrappers path={'/oauth/twiist/declined?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'declined',
          custodialSignup: true,
        });

        expect(screen.getByText('You have declined connecting your twiist data to Tidepool.')).toBeInTheDocument();
        expect(screen.getByText('Connection Declined')).toBeInTheDocument();
        expect(screen.getByText('You can always decide to connect at a later time.')).toBeInTheDocument();
        expect(screen.getByText('We hope you enjoy your Tidepool experience.')).toBeInTheDocument();

        const claimAccountButton = screen.getByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).toBeInTheDocument();

        expect(mockHistoryPush).not.toHaveBeenCalled();

        await userEvent.click(claimAccountButton);

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection - Claim Account', {
          providerName: 'twiist',
          status: 'declined',
        });

        expect(mockHistoryPush).toHaveBeenCalledWith({
          pathname: '/verification-with-password',
          search: 'signupKey=abc&signupEmail=patient%40mail.com',
        });
      });
    });
  });

  describe('twiist error', () => {
    describe('when desktop non-custodial signup', () => {
      it('should track metric, render error content, and hide secondary message and claim account button', () => {
        render(
          <MockedProviderWrappers path={'/oauth/twiist/error'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'error',
          custodialSignup: false,
        });

        expect(screen.getByText('We were unable to determine your twiist connection status.')).toBeInTheDocument();
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText("Hmm... That didn't work. Please try again.")).toBeInTheDocument();

        const messageText = screen.queryByText('We hope you enjoy your Tidepool experience.');
        expect(messageText).not.toBeInTheDocument();

        const claimAccountButton = screen.queryByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).not.toBeInTheDocument();
      });
    });

    describe('when desktop custodial signup', () => {
      it('should track metric, render error content, and hide claim account button even with signup params', () => {
        render(
          <MockedProviderWrappers path={'/oauth/twiist/error?signupKey=abc&signupEmail=patient@mail.com'}>
            <OAuthConnection {...defaultProps} />
          </MockedProviderWrappers>
        );

        expect(trackMetric).toHaveBeenCalledWith('Oauth - Connection', {
          providerName: 'twiist',
          status: 'error',
          custodialSignup: true,
        });

        expect(screen.getByText('We were unable to determine your twiist connection status.')).toBeInTheDocument();
        expect(screen.getByText('Connection Error')).toBeInTheDocument();
        expect(screen.getByText("Hmm... That didn't work. Please try again.")).toBeInTheDocument();

        const claimAccountButton = screen.queryByRole('button', { name: 'Claim My Account' });
        expect(claimAccountButton).not.toBeInTheDocument();
      });
    });
  });
});
