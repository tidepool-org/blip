/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import mutationTracker from 'object-invariant-test-helper';

import { ConfirmPasswordReset } from '../../../../app/pages/passwordreset/confirm';
import { mapStateToProps } from '../../../../app/pages/passwordreset/confirm';

var assert = chai.assert;
var expect = chai.expect;

describe('ConfirmPasswordReset', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(ConfirmPasswordReset).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
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
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();
      var formInputs = render.formInputs();
      expect(formInputs.length).to.equal(3);
      expect(formInputs[0].name).to.equal('email');
      expect(formInputs[0].label).to.equal('Email');
      expect(formInputs[0].type).to.equal('email');

      expect(formInputs[1].name).to.equal('password');
      expect(formInputs[1].label).to.equal('New password');
      expect(formInputs[1].type).to.equal('password');
      expect(formInputs[1].placeholder).to.be.undefined;

      expect(formInputs[2].name).to.equal('passwordConfirm');
      expect(formInputs[2].label).to.equal('Confirm new password');
      expect(formInputs[2].type).to.equal('password');
      expect(formInputs[2].placeholder).to.be.undefined;
    });
  });

  describe('getInitialState', function() {
    it('should be in this expected format', function() {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem);
      var initialState = render.getWrappedInstance().getInitialState();
      expect(Object.keys(initialState.formValues).length).to.equal(0);
      expect(Object.keys(initialState.validationErrors).length).to.equal(0);
      expect(initialState.notification).to.equal(null);
    });
  });

  describe('prepareFormValuesForSubmit', function() {
    it('should be in this expected format', function() {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      var elem = React.createElement(ConfirmPasswordReset, props);
      var render = TestUtils.renderIntoDocument(elem).getWrappedInstance();
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

  describe('mapStateToProps', () => {
    const state = {
      passwordResetConfirmed: false,
      working: {
        confirmingPasswordReset: {inProgress: true, notification: null}
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map working.confirmingPasswordReset.notification to notification', () => {
      expect(result.notification).to.equal(state.working.confirmingPasswordReset.notification);
    });

    it('should map working.confirmingPasswordReset.inProgress to working', () => {
      expect(result.working).to.equal(state.working.confirmingPasswordReset.inProgress);
    });

    it('should map passwordResetConfirmed to success', () => {
      expect(result.success).to.equal(state.passwordResetConfirmed);
    });
  });
});
