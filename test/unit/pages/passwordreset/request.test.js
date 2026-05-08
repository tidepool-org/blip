/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { RequestPasswordReset } from '../../../../app/pages/passwordreset/request';
import { mapStateToProps } from '../../../../app/pages/passwordreset/request';

var assert = chai.assert;

describe('RequestPasswordReset', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(typeof RequestPasswordReset).toEqual('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      render(<BrowserRouter><RequestPasswordReset {...props} /></BrowserRouter>);
      expect(console.error.callCount).toEqual(0);
    });
  });

  describe('formInputs', function() {
    it('should return array with one entry for email', function() {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      const { container } = render(<BrowserRouter><RequestPasswordReset {...props} /></BrowserRouter>);
      const inputs = container.querySelectorAll('input');

      expect(inputs.length).toEqual(1);
      expect(inputs[0].name).toEqual('email');
      expect(inputs[0].type).toEqual('email');
      expect(screen.getByLabelText('Email')).toBeTruthy();
    });
  });

  describe('initial state', function() {
    it('should be in this expected format', function() {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      render(<BrowserRouter><RequestPasswordReset {...props} /></BrowserRouter>);

      expect(screen.getByText('Forgot your password?')).toBeTruthy();
      expect(screen.getByLabelText('Email').value).toEqual('');
      expect(screen.queryByText('This field is required.')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        requestingPasswordReset: {inProgress: true, notification: {type: 'alert', message: 'Hi!'}}
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

    it('should map working.requestingPasswordReset.notification to notification', () => {
      expect(result.notification).toEqual(state.working.requestingPasswordReset.notification);
    });

    it('should map working.requestingPasswordReset.inProgress to working', () => {
      expect(result.working).toEqual(state.working.requestingPasswordReset.inProgress);
    });

    describe('when some state is `null`', () => {
    const state = {
      working: {
        requestingPasswordReset: {inProgress: true, notification: null}
      }
    };
      const result = mapStateToProps({blip: state});

      it('should map working.requestingPasswordReset.notification to notification', () => {
        expect(result.notification).toBeNull();
      });
    });
  });
});
