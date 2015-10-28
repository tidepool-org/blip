/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var Profile = require('../../../app/pages/profile');

describe('Profile', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Profile).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Profile />);
      expect(console.warn.callCount).to.equal(2);
    });

    it('should render without problems when required props are set', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Profile, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should return expected initial state', function() {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub(),
        user: {
          profile: {
            fullName: 'Gordon Dent'
          },
          username: 'foobar'
        }
      };
      var elem = React.createElement(Profile, props);
      var render = TestUtils.renderIntoDocument(elem);
      var state = render.getInitialState();

      expect(state.formValues.username).to.equal('foobar');
      expect(state.formValues.fullName).to.equal('Gordon Dent');
      expect(Object.keys(state.validationErrors).length).to.equal(0);
      expect(state.notification).to.equal(null);
    });


    it('should take a step back through history on clicking back button', function() {
      window.history.back = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Profile, props);
      var render = TestUtils.renderIntoDocument(elem);
      var backButton = TestUtils.findRenderedDOMComponentWithClass(render, 'js-back');

      expect(props.trackMetric.callCount).to.equal(0);
      expect(window.history.back.callCount).to.equal(0);
      TestUtils.Simulate.click(backButton);
      expect(props.trackMetric.callCount).to.equal(1);
      expect(window.history.back.callCount).to.equal(1);
    });
  });


});