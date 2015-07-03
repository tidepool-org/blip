/** @jsx React.DOM */

/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var EmailVerification = require('../../../app/pages/emailverification');

describe('EmailVerification', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(EmailVerification).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<EmailVerification />);
      expect(console.warn.callCount).to.equal(3);
      expect(console.warn.calledWith('Warning: Required prop `onSubmitResend` was not specified in `EmailVerification`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `EmailVerification`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `LoginNav`. Check the render method of `EmailVerification`.')).to.equal(true);
    });

    it('should render without problems when required props are present', function () {
      console.warn = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        onSubmitResend: sinon.stub()
      };
      var elem = React.createElement(EmailVerification, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});