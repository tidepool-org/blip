/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
var assert = chai.assert;
var expect = chai.expect;

import { VerificationWithPassword, mapStateToProps } from '../../../app/pages/verificationwithpassword/verificationwithpassword';

describe('VerificationWithPassword', () => {
  it('should be a function', () => {
    assert.isFunction(VerificationWithPassword);
  });

  describe('render', function() {
    it('should render with 8 warnings when no props provided', function () {
      console.error = sinon.stub();
      var props = {};
      var elem = React.createElement(VerificationWithPassword, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(8);
    });

    it('should render without wanrings when all required props provided', function () {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: 'foo',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      var elem = React.createElement(VerificationWithPassword, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      blip: {
        working: {
          verifyingCustodial: {
            notification: null,
            inProgress: false
          }
        },
        signupKey: 'foobar'
      }
    };
    
    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should return object with notification, signupKey and working populated', () => {
      let mapped = mapStateToProps(state);

      expect(mapped.notification).to.equal(state.blip.working.verifyingCustodial.notification);
      expect(mapped.working).to.equal(state.blip.working.verifyingCustodial.inProgress);
      expect(mapped.signupKey).to.equal(state.blip.signupKey);
    });
  });
});
