/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { BrowserRouter } from 'react-router-dom';
import { render, fireEvent, screen } from '@testing-library/react';

import { ConfirmPasswordReset } from '../../../../app/pages/passwordreset/confirm';
import { mapStateToProps } from '../../../../app/pages/passwordreset/confirm';

var assert = chai.assert;

describe('ConfirmPasswordReset', function () {
  let consoleErrorStub;

  beforeEach(function() {
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(function() {
    consoleErrorStub.restore();
  });
  it('should be exposed as a module and be of type function', function() {
    expect(typeof ConfirmPasswordReset).toEqual('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      render(<BrowserRouter><ConfirmPasswordReset {...props} /></BrowserRouter>);
      expect(consoleErrorStub.callCount).toEqual(0);
    });
  });

  describe('formInputs', function() {
    it('should return array with one entry for email', function() {
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      const { container } = render(<BrowserRouter><ConfirmPasswordReset {...props} /></BrowserRouter>);
      const inputs = container.querySelectorAll('input');

      expect(inputs.length).toEqual(3);
      expect(inputs[0].name).toEqual('email');
      expect(inputs[0].type).toEqual('email');
      expect(screen.getByLabelText('Email')).toBeTruthy();

      expect(inputs[1].name).toEqual('password');
      expect(inputs[1].type).toEqual('password');
      expect(screen.getByLabelText('New password')).toBeTruthy();
      expect(inputs[1].placeholder).toEqual('');

      expect(inputs[2].name).toEqual('passwordConfirm');
      expect(inputs[2].type).toEqual('password');
      expect(screen.getByLabelText('Confirm new password')).toBeTruthy();
      expect(inputs[2].placeholder).toEqual('');
    });
  });

  describe('initial state', function() {
    it('should be in this expected format', function() {
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      render(<BrowserRouter><ConfirmPasswordReset {...props} /></BrowserRouter>);

      expect(screen.getByLabelText('Email').value).toEqual('');
      expect(screen.getByLabelText('New password').value).toEqual('');
      expect(screen.getByLabelText('Confirm new password').value).toEqual('');
      expect(screen.queryByText('This field is required.')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('prepareFormValuesForSubmit', function() {
    it('should be in this expected format', function() {
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        resetKey: 'some-key',
        success: false,
        trackMetric: sinon.stub(),
        working: false
      };
      render(<BrowserRouter><ConfirmPasswordReset {...props} /></BrowserRouter>);

      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'foo@bar.com' } });
      fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'woowoo' } });
      fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'woowoo' } });
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(props.onSubmit.callCount).toEqual(1);
      expect(props.onSubmit.getCall(0).args[0]).toEqual(props.api);
      expect(props.onSubmit.getCall(0).args[1]).toEqual({
        key: 'some-key',
        email: 'foo@bar.com',
        password: 'woowoo',
      });
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
      expect(mutationTracker.hasMutated(tracked)).toBe(false);
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map working.confirmingPasswordReset.notification to notification', () => {
      expect(result.notification).toEqual(state.working.confirmingPasswordReset.notification);
    });

    it('should map working.confirmingPasswordReset.inProgress to working', () => {
      expect(result.working).toEqual(state.working.confirmingPasswordReset.inProgress);
    });

    it('should map passwordResetConfirmed to success', () => {
      expect(result.success).toEqual(state.passwordResetConfirmed);
    });
  });
});
