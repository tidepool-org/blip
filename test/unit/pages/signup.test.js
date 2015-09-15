/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
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
      expect(console.warn.calledWith('Warning: Required prop `onSubmit` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSubmitSuccess` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `checkInviteKey` was not specified in `Signup`.')).to.equal(true);
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

    it('should render waitlist when no key is set', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) { cb(true); },
        trackMetric: sinon.stub(),
        inviteKey: ''
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
    });

    it('should render signup form when key is set but is not valid', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) { cb(false); },
        trackMetric: sinon.stub(),
        inviteKey: 'foobar'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(render, 'waitlist');
    });

    it('should render signup form when key is set and validates', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        checkInviteKey: function(x, cb) { cb(true); },
        trackMetric: sinon.stub(),
        inviteKey: 'foobar'
      };
      var elem = React.createElement(Signup, props);
      var render = TestUtils.renderIntoDocument(elem);
      var refreshButton = TestUtils.findRenderedDOMComponentWithClass(render, 'signup-form');
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