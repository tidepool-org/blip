/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
var assert = chai.assert;
var expect = chai.expect;

import comp, { mapStateToProps } from '../../../app/pages/verificationwithpassword/verificationwithpassword';

describe('VerificationWithPassword', () => {
  it('should be a function', () => {
    assert.isFunction(comp);
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
