/* global describe */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
import chai from 'chai';
import sinon from 'sinon';
import LoginLogo from '../../../app/components/loginlogo';

const { expect } = chai;

describe('LoginLogo', function () {
  let consoleError = null;
  before(() => {
    consoleError = console.error;
    console.error = sinon.stub();
  });
  after(() => {
    console.error = consoleError;
  });
  it('should be exposed as a module and be of type function', function() {
    expect(LoginLogo).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      const elem = <LoginLogo />;
      TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});
