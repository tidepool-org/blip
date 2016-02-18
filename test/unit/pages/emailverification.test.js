/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
var expect = chai.expect;

import { EmailVerification } from '../../../app/pages/emailverification';

describe('EmailVerification', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(EmailVerification).to.be.a('function');
  });

  describe('render', function() {
    it('should console.error when required props are missing', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<EmailVerification />);
      expect(console.error.callCount).to.equal(4);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmitResend` was not specified in `EmailVerification`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `EmailVerification`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `api` was not specified in `EmailVerification`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `working` was not specified in `EmailVerification`.')).to.equal(true);
    });

    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        onSubmitResend: sinon.stub(),
        api: {},
        working: false
      };
      var elem = React.createElement(EmailVerification, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});