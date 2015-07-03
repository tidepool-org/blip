/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var ConfirmPasswordReset = require('../../../../app/pages/passwordreset/confirm');

describe('ConfirmPasswordReset', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(ConfirmPasswordReset).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<ConfirmPasswordReset />);
      expect(console.warn.callCount).to.equal(4);
      expect(console.warn.calledWith('Warning: Required prop `resetKey` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSubmit` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `LoginNav`. Check the render method of `ConfirmPasswordReset`.')).to.equal(true);
    });

    it('should render without problems when required props are set', function () {
      console.warn = sinon.stub();
      var props = {
        resetKey: 'some-key',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
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
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var formInputs = render.formInputs();
      expect(formInputs.length).to.equal(3);
      expect(formInputs[0].name).to.equal('email');
      expect(formInputs[0].label).to.equal('Email');
      expect(formInputs[0].type).to.equal('email');

      expect(formInputs[1].name).to.equal('password');
      expect(formInputs[1].label).to.equal('New password');
      expect(formInputs[1].type).to.equal('password');
      expect(formInputs[1].placeholder).to.equal('******');

      expect(formInputs[2].name).to.equal('passwordConfirm');
      expect(formInputs[2].label).to.equal('Confirm new password');
      expect(formInputs[2].type).to.equal('password');
      expect(formInputs[2].placeholder).to.equal('******');
    });
  });

  describe('getInitialState', function() {
    it('should be in this expected format', function() {
      console.warn = sinon.stub();
      var props = {
        resetKey: 'some-key',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var initialState = render.getInitialState();
      expect(initialState.working).to.equal(false);
      expect(initialState.success).to.equal(false);
      expect(Object.keys(initialState.formValues).length).to.equal(0);
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });

  describe('prepareFormValuesForSubmit', function() {
    it('should be in this expected format', function() {
      console.warn = sinon.stub();
      var props = {
        resetKey: 'some-key',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var vals = {
        email: 'foo@bar.com',
        password: 'woowoo'
      };
      var formValues = render.prepareFormValuesForSubmit(vals);
      expect(formValues.key).to.equal('some-key');
      expect(formValues.email).to.equal('foo@bar.com');
      expect(formValues.password).to.equal('woowoo');
    });
  });
});