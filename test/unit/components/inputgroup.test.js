/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var InputGroup = require('../../../app/components/inputgroup');

describe('InputGroup', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(InputGroup).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function () {
      console.warn = sinon.stub();
      var props = {
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(InputGroup, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});