/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import { Signup } from '../../../app/pages/signup';

var expect = chai.expect;

describe('Signup', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Signup).to.be.a('function');
  });

  describe('render', function() {
    it('should console.error 3 times when showing waitlist', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Signup />);
      expect(console.error.callCount).to.equal(4);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `api` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Signup`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `working` was not specified in `Signup`.')).to.equal(true);
    });

    it('should render without problems when required props are set', function () {
      console.error = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        api: {},
        working: false,
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });

    it('should render signup-form when no key is set and no key is configured', function () {
      console.error = sinon.stub();
      var props = {
        configuredInviteKey: '',
        inviteKey: '',
        onSubmit: sinon.stub(),
        api: {},
        working: false,
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render waitlist form when key is set but is not valid', function () {
      console.error = sinon.stub();
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'wrong-key',
        onSubmit: sinon.stub(),
        api: {},
        working: false,
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var waitlist = TestUtils.findRenderedDOMComponentWithClass(render, 'waitlist');
    });

    it('should render signup-form when key is set and validates', function () {
      console.error = sinon.stub();
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'foobar',
        onSubmit: sinon.stub(),
        api: {},
        working: false,
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render signup-form when both key and email are set, even if key doesn\'t match configured key', function () {
      console.error = sinon.stub();
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'wrong-key',
        inviteEmail: 'gordonmdent@gmail.com',
        onSubmit: sinon.stub(),
        api: {},
        working: false,
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render signup-form when key is valid and email is empty', function () {
      console.error = sinon.stub();
      var props = {
        configuredInviteKey: 'foobar',
        inviteKey: 'foobar',
        inviteEmail: '',
        onSubmit: sinon.stub(),
        api: {},
        working: false,
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });
  });

  describe('getInitialState', function() {
    it('should return expected initial state', function() {
      console.error = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        api: {},
        working: false,
        trackMetric: sinon.stub(),
        inviteEmail: 'gordonmdent@gmail.com'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getInitialState();

      expect(state.loading).to.equal(true);
      expect(state.showWaitList).to.equal(false);
      expect(state.formValues.username).to.equal('gordonmdent@gmail.com');
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });
  });
});