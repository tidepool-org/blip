/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var RequestPasswordReset = require('../../../../app/pages/passwordreset/request');

describe('RequestPasswordReset', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(RequestPasswordReset).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<RequestPasswordReset />);
      expect(console.warn.callCount).to.equal(3);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `RequestPasswordReset`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSubmit` was not specified in `RequestPasswordReset`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `LoginNav`. Check the render method of `RequestPasswordReset`.')).to.equal(true);
    });

    it('should render without problems when required props are set', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(RequestPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('formInputs', function() {
    it('should return array with one entry for email', function() {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(RequestPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var formInputs = render.formInputs();
      expect(formInputs.length).to.equal(1);
      expect(formInputs[0].name).to.equal('email');
      expect(formInputs[0].label).to.equal('Email');
      expect(formInputs[0].type).to.equal('email');
    });
  });

  describe('getInitialState', function() {
    it('should be in this expected format', function() {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(RequestPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var initialState = render.getInitialState();
      expect(initialState.working).to.equal(false);
      expect(initialState.success).to.equal(false);
      expect(Object.keys(initialState.formValues).length).to.equal(0);
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });
});