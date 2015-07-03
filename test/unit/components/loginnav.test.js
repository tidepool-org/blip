/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var LoginNav = require('../../../app/components/loginnav');

describe('LoginNav', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LoginNav).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<LoginNav />);
      expect(console.warn.callCount).to.equal(1);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `LoginNav`.')).to.equal(true);
    });

    it('should render without problems when required props are present', function () {
      console.warn = sinon.stub();
      var props = {
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(LoginNav, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});