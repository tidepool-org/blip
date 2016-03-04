/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import { ConfirmPasswordReset } from '../../../../app/pages/passwordreset/confirm';

var expect = chai.expect;

describe('ConfirmPasswordReset', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(ConfirmPasswordReset).to.be.a('function');
  });

  describe('render', function() {
    it('should console.error when required props are missing', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<ConfirmPasswordReset />);
      expect(console.error.callCount).to.equal(7);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `api` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `resetKey` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `acknowledgeNotification` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `working` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `success` was not specified in `ConfirmPasswordReset`.')).to.equal(true);
    });

    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        api: {},
        resetKey: 'some-key',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        acknowledgeNotification: sinon.stub(),
        working: false,
        success: false
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('formInputs', function() {
    it('should return array with one entry for email', function() {
      console.error = sinon.stub();
      var props = {
        api: {},
        resetKey: 'some-key',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        acknowledgeNotification: sinon.stub(),
        working: false,
        success: false
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
      console.error = sinon.stub();
      var props = {
        api: {},
        resetKey: 'some-key',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        acknowledgeNotification: sinon.stub(),
        working: false,
        success: false
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var initialState = render.getInitialState();
      expect(Object.keys(initialState.formValues).length).to.equal(0);
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });

  describe('prepareFormValuesForSubmit', function() {
    it('should be in this expected format', function() {
      console.error = sinon.stub();
      var props = {
        api: {},
        resetKey: 'some-key',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        acknowledgeNotification: sinon.stub(),
        working: false,
        success: false
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