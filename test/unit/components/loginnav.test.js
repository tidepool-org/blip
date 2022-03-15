/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

import React from 'react';
import { createMount } from '@material-ui/core/test-utils';
import { createElement } from 'react';
import { renderIntoDocument } from 'react-dom/test-utils';
const expect = chai.expect;
import { BrowserRouter } from 'react-router-dom';

import LoginNav from '../../../app/components/loginnav';

describe('LoginNav', function () {
  let mount = createMount();
  it('should be exposed as a module and be of type function', function () {
    expect(LoginNav).to.be.a('function');
  });

  let props = {
    trackMetric: sinon.stub(),
  };

  describe('render', function () {
    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();

      var elem = createElement(LoginNav, props);
      var wrapper = createElement(BrowserRouter, null, elem);
      var render = renderIntoDocument(wrapper);
      expect(render).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('keycloak', () => {
    let keycloakMock = {
      register: sinon.stub(),
    };

    before(() => {
      LoginNav.__Rewire__('config', { KEYCLOAK_URL: 'someUrl' });
      LoginNav.__Rewire__('keycloak', keycloakMock);
    });
    after(() => {
      LoginNav.__ResetDependency__('config');
      LoginNav.__ResetDependency__('keycloak');
    });

    it('should send users to keycloak register if KEYCLOAK_URL is set', () => {
      const wrapper = mount(
        <BrowserRouter>
          <LoginNav {...props}></LoginNav>
        </BrowserRouter>
      );
      const link = wrapper.find('Link');
      expect(keycloakMock.register.callCount).to.equal(0);
      link.simulate('click');
      expect(keycloakMock.register.callCount).to.equal(1);
    });
  });
});
