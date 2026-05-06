/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
const expect = chai.expect;
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../app/keycloak', () => ({
  keycloak: {
    register: jest.fn(),
    login: jest.fn(),
  },
}));

import { keycloak } from '../../../app/keycloak';
import LoginNav from '../../../app/components/loginnav';

describe('LoginNav', function () {
  it('should be exposed as a module and be of type function', function () {
    expect(LoginNav).to.be.a('function');
  });

  let props = {
    trackMetric: sinon.stub(),
  };

  describe('render', function () {
    it('should render without problems when required props are present', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        const { container } = render(
          <BrowserRouter>
            <LoginNav {...props} />
          </BrowserRouter>
        );
        expect(container).to.be.ok;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });

  describe('keycloak', () => {
    let props = {
      trackMetric: sinon.stub(),
      keycloakConfig: {
        url: 'someUrl',
        initialized: true,
      }
    };

    beforeEach(() => {
      keycloak.register.mockClear();
    });

    it('should send users to keycloak register if keycloak is initialized', () => {
      const { getByText } = render(
        <BrowserRouter>
          <LoginNav {...props}></LoginNav>
        </BrowserRouter>
      );

      expect(keycloak.register.mock.calls.length).to.equal(0);
      fireEvent.click(getByText('Sign up'));
      expect(keycloak.register.mock.calls.length).to.equal(1);
      expect(keycloak.register.mock.calls[0][0]).to.eql({ redirectUri: window.location.origin });
    });
  });
});
