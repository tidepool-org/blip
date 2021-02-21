/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-dom/test-utils');
var expect = chai.expect;

var LogoutOverlay = require('../../../app/components/logoutoverlay');

describe('LogoutOverlay', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LogoutOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var props = {};
      var elem = React.createElement(LogoutOverlay, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('initial state', function() {
    it('should have fadeOut initially equal to false', function() {
      console.error = sinon.stub();
      var props = {};
      var elem = React.createElement(LogoutOverlay, props);
      var render = TestUtils.renderIntoDocument(elem);

      var state = render.getWrappedInstance().state;

      expect(state.fadeOut).to.equal(false);
    })
  });
});
