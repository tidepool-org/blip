/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var Login = require('../../../app/pages/login');

describe('Login', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Login).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Login />);
      expect(console.warn.callCount).to.equal(5);
      expect(console.warn.calledWith('Warning: Required prop `onSubmit` was not specified in `Login`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSubmitSuccess` was not specified in `Login`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSubmitNotAuthorized` was not specified in `Login`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `Login`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `LoginNav`. Check the render method of `Login`.')).to.equal(true);
    });

    it('should render without problems when required props are present', function () {
      console.warn = sinon.stub();
      var props = {
        trackMetric: sinon.stub(),
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        onSubmitNotAuthorized: sinon.stub(),
      };
      var elem = React.createElement(Login, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});