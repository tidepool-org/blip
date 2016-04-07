/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import { Signup } from '../../../app/pages/signup';
import { mapStateToProps } from '../../../app/pages/signup';

var assert = chai.assert;
var expect = chai.expect;

describe('Signup', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Signup).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        api: {},
        configuredInviteKey: '',
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        working: false
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
    
    it('should console.error when required props not set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Signup />);
      expect(console.error.callCount).to.equal(6);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `acknowledgeNotification` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `api` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `configuredInviteKey` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `working` was not specified in `Signup`.')).to.equal(true);
    });

    it('should render signup-form when no key is set and no key is configured', function () {
      var props = {
        configuredInviteKey: '',
        inviteKey: ''
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render waitlist form when key is set but is not valid', function () {
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'wrong-key'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var waitlist = TestUtils.findRenderedDOMComponentWithClass(render, 'waitlist');
    });

    it('should render signup-form when key is set and validates', function () {
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'foobar'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render signup-form when both key and email are set, even if key doesn\'t match configured key', function () {
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'wrong-key',
        inviteEmail: 'gordonmdent@gmail.com'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render signup-form when key is valid and email is empty', function () {
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'foobar',
        inviteEmail: ''
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });
  });

  describe('getInitialState', function() {
    it('should return expected initial state', function() {
      var props = {
        inviteEmail: 'gordonmdent@gmail.com'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getInitialState();

      expect(state.loading).to.equal(true);
      expect(state.showWaitList).to.equal(false);
      expect(state.formValues.username).to.equal(props.inviteEmail);
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      working: {
        signingUp: {
          inProgress: true,
          notification: {msg: 'Nothing to see here...'}
        }
      }
    };
    const result = mapStateToProps({blip: state});

    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });

    it('should map working.signingUp.notification to notification', () => {
      expect(result.notification).to.deep.equal(state.working.signingUp.notification);
    });

    it('should map working.signingUp.inProgress to working', () => {
      expect(result.working).to.equal(state.working.signingUp.inProgress);
    });
  });
});