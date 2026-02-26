/* global describe */
/* global it */

import React from 'react';
import mutationTracker from 'object-invariant-test-helper';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import sinon from 'sinon';

import { EmailVerification, mapStateToProps } from '../../../app/pages/emailverification';

describe('EmailVerification', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(typeof EmailVerification).toBe('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        var props = {
          acknowledgeNotification: sinon.stub(),
          onSubmitResend: sinon.stub(),
          resent: false,
          sent: true,
          trackMetric: sinon.stub(),
          working: false
        };
        render(<BrowserRouter><EmailVerification {...props} /></BrowserRouter>);
        expect(console.error.callCount).toBe(0);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      resentEmailVerification: false,
      sentEmailVerification: false,
      working: {
        resendingEmailVerification: {inProgress: true, notification: {type: 'alert', message: 'Hi!'}}
      }
    };

    const tracked = mutationTracker.trackObj(state);
    const result = mapStateToProps({blip: state});

    it('should not mutate the state', () => {
      expect(mutationTracker.hasMutated(tracked)).toBe(false);
    });

    it('should be a function', () => {
      expect(typeof mapStateToProps).toBe('function');
    });

    it('should map working.resendingEmailVerification.notification to notification', () => {
      expect(result.notification).toEqual(state.working.resendingEmailVerification.notification);
    });

    it('should map working.resendingEmailVerification.inProgress to working', () => {
      expect(result.working).toEqual(state.working.resendingEmailVerification.inProgress);
    });

    it('should map resentEmailVerification to resent', () => {
      expect(result.resent).toEqual(state.resentEmailVerification);
    });

    it('should map sentEmailVerification to sent', () => {
      expect(result.sent).toEqual(state.sentEmailVerification);
    });

    describe('when some state is `null`', () => {
      const state = {
        resentEmailVerification: false,
        sentEmailVerification: false,
        working: {
          resendingEmailVerification: {inProgress: true, notification: null}
        }
      };
      const result = mapStateToProps({blip: state});

      it('should map working.resendingEmailVerification.notification to notification', () => {
        expect(result.notification).toBeNull();
      });
    });
  });
});
