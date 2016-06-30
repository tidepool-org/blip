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

    it('should render without warnings when all required props provided', function () {
      console.error = sinon.stub();
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        signupEmail: 'g@a.com',
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
      console.error = sinon.stub();
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        signupEmail: 'g@a.com',
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
  });


  describe('handleInputChange', () => {
    it('should update formValues in state with changed value', () => {
      console.error = sinon.stub();
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        signupEmail: 'g@a.com',
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

      expect(render.getInitialState()).to.eql(expectedInitialState);

      render.handleInputChange({name: 'password', value: 'foo'});

      expect(render.state.formValues.password).to.equal('foo');
    });
  });

  describe('resetFormStateBeforeSubmit', () => {
    it('should update state ith supplied formValues and empty validation errors and notification', () => {
      console.error = sinon.stub();
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        signupEmail: 'g@a.com',
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
        }
      }
    };

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should return object with notification and working populated', () => {
      let mapped = mapStateToProps(state);

      expect(mapped.notification).to.equal(state.blip.working.verifyingCustodial.notification);
      expect(mapped.working).to.equal(state.blip.working.verifyingCustodial.inProgress);
    });
  });

  describe('isFormDisabled', () => {
    it('should return true if fetching user', () => {
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        signupEmail: 'g@a.com',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false,
        fetchingUser: true
      }

      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);

      expect(render.isFormDisabled()).to.be.true;
    });

    it('should return undefined otherwise', () => {
      let props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        signupEmail: 'g@a.com',
        signupKey: 'bar',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      }

      let elem = React.createElement(VerificationWithPassword, props);
      let render = TestUtils.renderIntoDocument(elem);

      expect(render.isFormDisabled()).to.be.undefined;
    });

  });
});
