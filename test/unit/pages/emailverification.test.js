/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import mutationTracker from 'object-invariant-test-helper';

var assert = chai.assert;
var expect = chai.expect;

import { EmailVerification } from '../../../app/pages/emailverification';
import { mapStateToProps } from '../../../app/pages/emailverification';

describe('EmailVerification', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(EmailVerification).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        onSubmitResend: sinon.stub(),
        resent: false,
        sent: true,
        trackMetric: sinon.stub(),
        working: false
      };
      var elem = React.createElement(EmailVerification, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
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
      expect(mutationTracker.hasMutated(tracked)).to.be.false;
    });

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map working.resendingEmailVerification.notification to notification', () => {
      expect(result.notification).to.equal(state.working.resendingEmailVerification.notification);
    });

    it('should map working.resendingEmailVerification.inProgress to working', () => {
      expect(result.working).to.equal(state.working.resendingEmailVerification.inProgress);
    });

    it('should map resentEmailVerification to resent', () => {
      expect(result.resent).to.equal(state.resentEmailVerification);
    });

    it('should map sentEmailVerification to sent', () => {
      expect(result.sent).to.equal(state.sentEmailVerification);
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
        expect(result.notification).to.be.null;
      });
    });
  });
});
