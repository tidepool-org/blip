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
    it('should render console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Profile />);
      expect(console.warn.callCount).to.equal(2);
    });

    it('should render without problems when trackMetric is set', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Profile, props);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});