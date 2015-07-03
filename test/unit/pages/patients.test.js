/** @jsx React.DOM */

/* global chai */
window.config = {};

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var Patients = require('../../../app/pages/patients');

describe('Patients', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Patients).to.be.a('function');
  });

  describe('render', function() {
    it('should console.warn when required props are missing', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Patients />);
      expect(console.warn.callCount).to.equal(1);
    });

    it('should render without problems when trackMetric is set', function () {
      console.warn = sinon.stub();
      var props = {
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.warn.callCount).to.equal(0);
    });
  });
});