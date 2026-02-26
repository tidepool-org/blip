import React from 'react';
import { mountWithProviders } from '../../utils/mountWithProviders';
import { MemoryRouter, Route } from 'react-router';
import OAuthConnection from '../../../app/pages/oauth/OAuthConnection';
import { fireEvent } from '@testing-library/react';

jest.mock('../../../app/core/utils', () => {
  const actual = jest.requireActual('../../../app/core/utils');
  return {
    ...actual,
    isMobile: () => true,
  };
});

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */

const expect = chai.expect;

function routeAction() {
  return {
    type: '@@router/CALL_HISTORY_METHOD',
    payload: { args: [].slice.call(arguments), method: 'push' },
  };
}

describe('OAuthConnection', () => {
  let wrapper;
  let createWrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
  };

  let dispatchSpy;

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();
    dispatchSpy = sinon.spy();

    createWrapper = (providerName, status, queryParams = '') => {
      return mountWithProviders(
        <MemoryRouter initialEntries={[`/oauth/${providerName}/${status}${queryParams}`]}>
          <Route path='/oauth/:providerName/:status' children={() => (<OAuthConnection {...defaultProps} />)} />
        </MemoryRouter>,
        { dispatchSpy }
      );
    }
  });

  context('dexcom authorized', () => {
    beforeEach(() => {
      wrapper = createWrapper('dexcom', 'authorized');
    });

    it('should track the appropriate metric on load', () => {
      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'dexcom',
        status: 'authorized',
        custodialSignup: false,
      });

      defaultProps.trackMetric.resetHistory();
      createWrapper('dexcom', 'authorized', '?signupKey=abc&signupEmail=patient@mail.com');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'dexcom',
        status: 'authorized',
        custodialSignup: true,
      });
    });

    it('should render the appropriate banner', () => {
      const bannerEl = wrapper.container.querySelector('#banner-oauth-authorized');
      expect(bannerEl).to.not.be.null;
      expect(bannerEl.textContent).to.equal('You have successfully connected your Dexcom data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      const heading = wrapper.container.querySelector('#oauth-heading');
      expect(heading).to.not.be.null;
      expect(heading.textContent).to.equal('Connection Authorized');
      const subheading = wrapper.container.querySelector('#oauth-subheading');
      expect(subheading).to.not.be.null;
      expect(subheading.textContent).to.equal('Thank you for connecting with Tidepool!');
    });

    it('should render the appropriate message text', () => {
      const messageEl = wrapper.container.querySelector('#oauth-message');
      expect(messageEl).to.not.be.null;
      expect(messageEl.textContent).to.equal('We hope you enjoy your Tidepool experience.');
    });
    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('dexcom', 'authorized', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(0);
      expect(custodialWrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      fireEvent.click(custodialWrapper.container.querySelector('#oauth-claim-account-button'));

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'dexcom',
        status: 'authorized',
      });

      sinon.assert.calledWith(dispatchSpy, routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'));
    });

    it('should render a button to redirect back to tidepool app when on mobile', () => {
      defaultProps.trackMetric.resetHistory();
      fireEvent.click(wrapper.container.querySelector('#oauth-redirect-home-button'));

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Redirect back to Tidepool App', {
        providerName: 'dexcom',
        status: 'authorized',
      });

      sinon.assert.calledWith(dispatchSpy, routeAction(
        '/patients?justLoggedIn=true&dataConnectionStatus=authorized&dataConnectionProviderName=dexcom'
      ));
    });
  });

  context('dexcom declined', () => {
    beforeEach(() => {
      wrapper = createWrapper('dexcom', 'declined');
    });

    it('should track the appropriate metric on load', () => {
      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'dexcom',
        status: 'declined',
        custodialSignup: false,
      });

      defaultProps.trackMetric.resetHistory();
      createWrapper('dexcom', 'declined', '?signupKey=abc&signupEmail=patient@mail.com');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'dexcom',
        status: 'declined',
        custodialSignup: true,
      });
    });

    it('should render the appropriate banner', () => {
      const bannerEl = wrapper.container.querySelector('#banner-oauth-declined');
      expect(bannerEl).to.not.be.null;
      expect(bannerEl.textContent).to.equal('You have declined connecting your Dexcom data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      const heading = wrapper.container.querySelector('#oauth-heading');
      expect(heading).to.not.be.null;
      expect(heading.textContent).to.equal('Connection Declined');
      const subheading = wrapper.container.querySelector('#oauth-subheading');
      expect(subheading).to.not.be.null;
      expect(subheading.textContent).to.equal('You can always decide to connect at a later time.');
    });

    it('should render the appropriate message text', () => {
      const messageEl = wrapper.container.querySelector('#oauth-message');
      expect(messageEl).to.not.be.null;
      expect(messageEl.textContent).to.equal('We hope you enjoy your Tidepool experience.');
    });

    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('dexcom', 'declined', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(0);
      expect(custodialWrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      fireEvent.click(custodialWrapper.container.querySelector('#oauth-claim-account-button'));

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'dexcom',
        status: 'declined',
      });

      sinon.assert.calledWith(dispatchSpy, routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'));
    });
  });

  context('dexcom error', () => {
    beforeEach(() => {
      wrapper = createWrapper('dexcom', 'error');
    });

    it('should track the appropriate metric on load', () => {
      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'dexcom',
        status: 'error',
        custodialSignup: false,
      });

      defaultProps.trackMetric.resetHistory();
      createWrapper('dexcom', 'error', '?signupKey=abc&signupEmail=patient@mail.com');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'dexcom',
        status: 'error',
        custodialSignup: true,
      });
    });

    it('should render the appropriate banner', () => {
      const bannerEl = wrapper.container.querySelector('#banner-oauth-error');
      expect(bannerEl).to.not.be.null;
      expect(bannerEl.textContent).to.equal('We were unable to determine your Dexcom connection status.');
    });

    it('should render the appropriate heading and subheading', () => {
      const heading = wrapper.container.querySelector('#oauth-heading');
      expect(heading).to.not.be.null;
      expect(heading.textContent).to.equal('Connection Error');
      const subheading = wrapper.container.querySelector('#oauth-subheading');
      expect(subheading).to.not.be.null;
      expect(subheading.textContent).to.equal('Hmm... That didn\'t work. Please try again.');
    });

    it('should not render any secondary message text', () => {
      expect(wrapper.container.querySelectorAll('#oauth-message')).to.have.lengthOf(0);
    });

    it('should NOT render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('dexcom', 'error', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(custodialWrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(0);
    });
  });

  context('twiist authorized', () => {
    beforeEach(() => {
      wrapper = createWrapper('twiist', 'authorized');
    });

    it('should track the appropriate metric on load', () => {
      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'twiist',
        status: 'authorized',
        custodialSignup: false,
      });

      defaultProps.trackMetric.resetHistory();
      createWrapper('twiist', 'authorized', '?signupKey=abc&signupEmail=patient@mail.com');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'twiist',
        status: 'authorized',
        custodialSignup: true,
      });
    });

    it('should render the appropriate banner', () => {
      const bannerEl = wrapper.container.querySelector('#banner-oauth-authorized');
      expect(bannerEl).to.not.be.null;
      expect(bannerEl.textContent).to.equal('You have successfully connected your twiist data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      const heading = wrapper.container.querySelector('#oauth-heading');
      expect(heading).to.not.be.null;
      expect(heading.textContent).to.equal('Connection Authorized');
      const subheading = wrapper.container.querySelector('#oauth-subheading');
      expect(subheading).to.not.be.null;
      expect(subheading.textContent).to.equal('Thank you for connecting with Tidepool!');
    });

    it('should render the appropriate message text', () => {
      const messageEl = wrapper.container.querySelector('#oauth-message');
      expect(messageEl).to.not.be.null;
      expect(messageEl.textContent).to.equal('We hope you enjoy your Tidepool experience.');
    });

    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('twiist', 'authorized', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(0);
      expect(custodialWrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      fireEvent.click(custodialWrapper.container.querySelector('#oauth-claim-account-button'));

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'twiist',
        status: 'authorized',
      });

      sinon.assert.calledWith(dispatchSpy, routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'));
    });

    it('should render a button to redirect back to tidepool app when on mobile', () => {
      defaultProps.trackMetric.resetHistory();
      fireEvent.click(wrapper.container.querySelector('#oauth-redirect-home-button'));

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Redirect back to Tidepool App', {
        providerName: 'twiist',
        status: 'authorized',
      });

      sinon.assert.calledWith(dispatchSpy, routeAction('/patients?justLoggedIn=true&dataConnectionStatus=authorized&dataConnectionProviderName=twiist'));
    });
  });

  context('twiist declined', () => {
    beforeEach(() => {
      wrapper = createWrapper('twiist', 'declined');
    });

    it('should track the appropriate metric on load', () => {
      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'twiist',
        status: 'declined',
        custodialSignup: false,
      });

      defaultProps.trackMetric.resetHistory();
      createWrapper('twiist', 'declined', '?signupKey=abc&signupEmail=patient@mail.com');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'twiist',
        status: 'declined',
        custodialSignup: true,
      });
    });

    it('should render the appropriate banner', () => {
      const bannerEl = wrapper.container.querySelector('#banner-oauth-declined');
      expect(bannerEl).to.not.be.null;
      expect(bannerEl.textContent).to.equal('You have declined connecting your twiist data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      const heading = wrapper.container.querySelector('#oauth-heading');
      expect(heading).to.not.be.null;
      expect(heading.textContent).to.equal('Connection Declined');
      const subheading = wrapper.container.querySelector('#oauth-subheading');
      expect(subheading).to.not.be.null;
      expect(subheading.textContent).to.equal('You can always decide to connect at a later time.');
    });

    it('should render the appropriate message text', () => {
      const messageEl = wrapper.container.querySelector('#oauth-message');
      expect(messageEl).to.not.be.null;
      expect(messageEl.textContent).to.equal('We hope you enjoy your Tidepool experience.');
    });

    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('twiist', 'declined', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(0);
      expect(custodialWrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      fireEvent.click(custodialWrapper.container.querySelector('#oauth-claim-account-button'));

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'twiist',
        status: 'declined',
      });

      sinon.assert.calledWith(dispatchSpy, routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'));
    });
  });

  context('twiist error', () => {
    beforeEach(() => {
      wrapper = createWrapper('twiist', 'error');
    });

    it('should track the appropriate metric on load', () => {
      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'twiist',
        status: 'error',
        custodialSignup: false,
      });

      defaultProps.trackMetric.resetHistory();
      createWrapper('twiist', 'error', '?signupKey=abc&signupEmail=patient@mail.com');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection', {
        providerName: 'twiist',
        status: 'error',
        custodialSignup: true,
      });
    });

    it('should render the appropriate banner', () => {
      const bannerEl = wrapper.container.querySelector('#banner-oauth-error');
      expect(bannerEl).to.not.be.null;
      expect(bannerEl.textContent).to.equal('We were unable to determine your twiist connection status.');
    });

    it('should render the appropriate heading and subheading', () => {
      const heading = wrapper.container.querySelector('#oauth-heading');
      expect(heading).to.not.be.null;
      expect(heading.textContent).to.equal('Connection Error');
      const subheading = wrapper.container.querySelector('#oauth-subheading');
      expect(subheading).to.not.be.null;
      expect(subheading.textContent).to.equal('Hmm... That didn\'t work. Please try again.');
    });

    it('should not render any secondary message text', () => {
      expect(wrapper.container.querySelectorAll('#oauth-message')).to.have.lengthOf(0);
    });

    it('should NOT render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('twiist', 'error', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(custodialWrapper.container.querySelectorAll('#oauth-claim-account-button')).to.have.lengthOf(0);
    });
  });
});
