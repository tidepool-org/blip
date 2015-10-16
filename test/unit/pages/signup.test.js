

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var Signup = require('../../../app/pages/signup');

describe('Signup', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Signup).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn 4 time when showing waitlist', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Signup />);
      expect(console.warn.callCount).to.equal(4);
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `onSubmit` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `onSubmitSuccess` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `checkInviteKey` was not specified in `Signup`.')).to.equal(true);
    });

    it('should render without problems when required props are set', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });

    it('should render signup-form when no key is set but checkInviteKey returns true', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) { return cb(true); },
        trackMetric: sinon.stub(),
        inviteKey: ''
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render waitlist form when key is set but is not valid', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) { return cb(false); },
        trackMetric: sinon.stub(),
        inviteKey: 'wrong-key'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var waitlist = TestUtils.findRenderedDOMComponentWithClass(render, 'waitlist');
    });

    it('should render signup-form when key is set and validates', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) { return cb(true); },
        trackMetric: sinon.stub(),
        inviteKey: 'foobar'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render signup-form when both key and email are set and checkInviteKey is not used', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) {
          //in the case of having both an email and a key the invite key isn't checked client side
          //so changing the return value will not change the test outcome
          return cb(true);
        },
        trackMetric: sinon.stub(),
        inviteKey: 'foobar',
        inviteEmail: 'gordonmdent@gmail.com'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render signup-form when key is valid and email is empty', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) {
          return cb(true);
        },
        trackMetric: sinon.stub(),
        inviteKey: 'foobar',
        inviteEmail: ''
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var signupForm = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });
  });

  describe('getInitialState', function() {
    it('should return expect initial state', function() {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: sinon.stub(),
        trackMetric: sinon.stub(),
        inviteEmail: 'gordonmdent@gmail.com'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getInitialState();

      expect(state.working).to.equal(false);
      expect(state.loading).to.equal(true);
      expect(state.showWaitList).to.equal(false);
      expect(state.formValues.username).to.equal('gordonmdent@gmail.com');
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });
  });
});