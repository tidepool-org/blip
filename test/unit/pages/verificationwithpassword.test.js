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
      let props = {};
      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(8);
    });

    it('should render without wanrings when all required props provided', function () {
      console.error = sinon.stub();
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: 'foo',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('getInitialState', () => {
    it('should return an Object that matches expectedInitialState', () => {
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: 'foo',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      }
      let expectedInitialState = {
        loading: true,
        formValues: {},
        validationErrors: {},
        notification: null
      };

      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);

      expect(render.getInitialState()).to.eql(expectedInitialState);
    });

    it('should return an Object that matches expectedInitialState with inviteEmail when set in props', () => {
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: 'foo',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false,
        inviteEmail: 'bill@ted.com'
      }
      let expectedInitialState = {
        loading: true,
        formValues: {
          username: props.inviteEmail
        },
        validationErrors: {},
        notification: null
      };

      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);

      expect(render.getInitialState()).to.eql(expectedInitialState);
    });
  });


  describe('handleInputChange', () => {
    it('should update formValues in state with changed value', () => {
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: 'foo',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false,
        inviteEmail: 'bill@ted.com'
      }
      let expectedInitialState = {
        loading: true,
        formValues: {
          username: props.inviteEmail
        },
        validationErrors: {},
        notification: null
      };

      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);

      expect(render.getInitialState()).to.eql(expectedInitialState);

      render.handleInputChange({name: 'username', value: 'dean@frank.co.uk'});

      expect(render.state.formValues.username).to.equal('dean@frank.co.uk');
    });
  });

  describe('resetFormStateBeforeSubmit', () => {
    it('should update state ith supplied formValues and empty validation errors and notification', () => {
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: 'foo',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false,
        inviteEmail: 'bill@ted.com'
      }
      let expectedInitialState = {
        loading: true,
        formValues: {
          username: props.inviteEmail
        },
        validationErrors: {},
        notification: null
      };

      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);

      let intermediateState = {
        validationErrors: {
          username: 'This is not valid'
        }
      };
      render.setState(intermediateState);
      
      expect(render.state.validationErrors).to.eql(intermediateState.validationErrors);

      render.resetFormStateBeforeSubmit({});

      expect(render.state).to.eql({
        loading: false,
        formValues: {},
        validationErrors: {},
        notification: null
      });
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
