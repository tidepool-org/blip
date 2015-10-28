/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var LogoutOverlay = require('../../../app/components/logoutoverlay');

describe('LogoutOverlay', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LogoutOverlay).to.be.a('function');
  });

  describe('render', function() {

    it('should render without problems', function () {
      console.warn = sinon.stub();
      var props = {};
      var elem = React.createElement(LogoutOverlay, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    console.warn = sinon.stub();
      var props = {};
      var elem = React.createElement(LogoutOverlay, props);
      var render = TestUtils.renderIntoDocument(elem);
      
      var state = render.getInitialState();

      expect(state.fadeOut).to.equal(false);
  });
});