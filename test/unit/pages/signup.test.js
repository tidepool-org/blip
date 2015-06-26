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
    it('should render console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Signup />);
      expect(console.warn.callCount).to.equal(4);
      expect(console.warn.calledWith('Warning: Required prop `onSubmit` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `onSubmitSuccess` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `Signup`.')).to.equal(true);
      expect(console.warn.calledWith('Warning: Required prop `trackMetric` was not specified in `LoginNav`. Check the render method of `Signup`.')).to.equal(true);
    });

    it('should render without problems when trackMetric is set', function () {
      console.warn = sinon.stub();
      var props = {
        onSubmit: sinon.stub(),
        onSubmitSuccess: sinon.stub(),
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Signup, props);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});