import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter, Route } from 'react-router';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import OAuthConnection from '../../../app/pages/oauth/OAuthConnection';

/* global chai */
/* global sinon */
/* global context */
/* global describe */
/* global it */
/* global beforeEach */
/* global before */
/* global after */
/* global afterEach */

const expect = chai.expect;
const mockStore = configureStore([thunk]);

function routeAction() {
  return {
    type: '@@router/CALL_HISTORY_METHOD',
    payload: { args: [].slice.call(arguments), method: 'push' },
  };
}

describe('OAuthConnection', () => {
  let mount;

  let wrapper;
  let createWrapper;
  let defaultProps = {
    trackMetric: sinon.stub(),
    t: sinon.stub().callsFake((string) => string),
  };

  let store = mockStore({});

  before(() => {
    mount = createMount();
    OAuthConnection.__Rewire__('utils', { isMobile: () => true });
  });

  after(() => {
    mount.cleanUp();
    OAuthConnection.__ResetDependency__('utils');
  });

  afterEach(() => {
    store.clearActions();
  });

  beforeEach(() => {
    defaultProps.trackMetric.resetHistory();

    createWrapper = (providerName, status, queryParams = '') => {
      return mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={[`/oauth/${providerName}/${status}${queryParams}`]}>
            <Route path='/oauth/:providerName/:status' children={() => (<OAuthConnection {...defaultProps} />)} />
          </MemoryRouter>
        </Provider>
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
      expect(wrapper.find('#banner-oauth-authorized').hostNodes().text()).to.equal('You have successfully connected your Dexcom data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      expect(wrapper.find('#oauth-heading').hostNodes().text()).to.equal('Connection Authorized');
      expect(wrapper.find('#oauth-subheading').hostNodes().text()).to.equal('Thank you for connecting with Tidepool!');
    });

    it('should render the appropriate message text', () => {
      expect(wrapper.find('#oauth-message').hostNodes().text()).to.equal('We hope you enjoy your Tidepool experience.');
    });

    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('dexcom', 'authorized', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(0);
      expect(custodialWrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      custodialWrapper.find('#oauth-claim-account-button').hostNodes().simulate('click');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'dexcom',
        status: 'authorized',
      });

      let expectedActions = [
        routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'),
      ];

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should render a button to redirect back to tidepool app when on mobile', () => {
      defaultProps.trackMetric.resetHistory();
      wrapper.find('#oauth-redirect-home-button').hostNodes().simulate('click');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Redirect back to Tidepool App', {
        providerName: 'dexcom',
        status: 'authorized',
      });

      let expectedActions = [
        routeAction(
          '/patients?justLoggedIn=true&dataConnectionStatus=authorized&dataConnectionProviderName=dexcom'
        ),
      ];

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
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
      expect(wrapper.find('#banner-oauth-declined').hostNodes().text()).to.equal('You have declined connecting your Dexcom data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      expect(wrapper.find('#oauth-heading').hostNodes().text()).to.equal('Connection Declined');
      expect(wrapper.find('#oauth-subheading').hostNodes().text()).to.equal('You can always decide to connect at a later time.');
    });

    it('should render the appropriate message text', () => {
      expect(wrapper.find('#oauth-message').hostNodes().text()).to.equal('We hope you enjoy your Tidepool experience.');
    });

    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('dexcom', 'declined', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(0);
      expect(custodialWrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      custodialWrapper.find('#oauth-claim-account-button').hostNodes().simulate('click');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'dexcom',
        status: 'declined',
      });

      let expectedActions = [
        routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'),
      ];

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
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
      expect(wrapper.find('#banner-oauth-error').hostNodes().text()).to.equal('We were unable to determine your Dexcom connection status.');
    });

    it('should render the appropriate heading and subheading', () => {
      expect(wrapper.find('#oauth-heading').hostNodes().text()).to.equal('Connection Error');
      expect(wrapper.find('#oauth-subheading').hostNodes().text()).to.equal('Hmm... That didn\'t work. Please try again.');
    });

    it('should not render any secondary message text', () => {
      expect(wrapper.find('#oauth-message').hostNodes()).to.have.lengthOf(0);
    });

    it('should NOT render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('dexcom', 'error', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(custodialWrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(0);
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
      expect(wrapper.find('#banner-oauth-authorized').hostNodes().text()).to.equal('You have successfully connected your Twiist data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      expect(wrapper.find('#oauth-heading').hostNodes().text()).to.equal('Connection Authorized');
      expect(wrapper.find('#oauth-subheading').hostNodes().text()).to.equal('Thank you for connecting with Tidepool!');
    });

    it('should render the appropriate message text', () => {
      expect(wrapper.find('#oauth-message').hostNodes().text()).to.equal('We hope you enjoy your Tidepool experience.');
    });

    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('twiist', 'authorized', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(0);
      expect(custodialWrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      custodialWrapper.find('#oauth-claim-account-button').hostNodes().simulate('click');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'twiist',
        status: 'authorized',
      });

      let expectedActions = [
        routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'),
      ];

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
    });

    it('should render a button to redirect back to tidepool app when on mobile', () => {
      defaultProps.trackMetric.resetHistory();
      wrapper.find('#oauth-redirect-home-button').hostNodes().simulate('click');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Redirect back to Tidepool App', {
        providerName: 'twiist',
        status: 'authorized',
      });

      let expectedActions = [
        routeAction('/patients?justLoggedIn=true&dataConnectionStatus=authorized&dataConnectionProviderName=twiist'),
      ];

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
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
      expect(wrapper.find('#banner-oauth-declined').hostNodes().text()).to.equal('You have declined connecting your Twiist data to Tidepool.');
    });

    it('should render the appropriate heading and subheading', () => {
      expect(wrapper.find('#oauth-heading').hostNodes().text()).to.equal('Connection Declined');
      expect(wrapper.find('#oauth-subheading').hostNodes().text()).to.equal('You can always decide to connect at a later time.');
    });

    it('should render the appropriate message text', () => {
      expect(wrapper.find('#oauth-message').hostNodes().text()).to.equal('We hope you enjoy your Tidepool experience.');
    });

    it('should render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('twiist', 'declined', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(wrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(0);
      expect(custodialWrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(1);

      defaultProps.trackMetric.resetHistory();
      custodialWrapper.find('#oauth-claim-account-button').hostNodes().simulate('click');

      sinon.assert.calledWith(defaultProps.trackMetric, 'Oauth - Connection - Claim Account', {
        providerName: 'twiist',
        status: 'declined',
      });

      let expectedActions = [
        routeAction('/login?signupKey=abc&signupEmail=patient%40mail.com'),
      ];

      const actions = store.getActions();
      expect(actions).to.eql(expectedActions);
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
      expect(wrapper.find('#banner-oauth-error').hostNodes().text()).to.equal('We were unable to determine your Twiist connection status.');
    });

    it('should render the appropriate heading and subheading', () => {
      expect(wrapper.find('#oauth-heading').hostNodes().text()).to.equal('Connection Error');
      expect(wrapper.find('#oauth-subheading').hostNodes().text()).to.equal('Hmm... That didn\'t work. Please try again.');
    });

    it('should not render any secondary message text', () => {
      expect(wrapper.find('#oauth-message').hostNodes()).to.have.lengthOf(0);
    });

    it('should NOT render a button that claims an account if the signup query params are provided', () => {
      const custodialWrapper = createWrapper('twiist', 'error', '?signupKey=abc&signupEmail=patient@mail.com');
      expect(custodialWrapper.find('#oauth-claim-account-button').hostNodes()).to.have.lengthOf(0);
    });
  });
});
