/* global chai */
/* global describe */
/* global sinon */
/* global it */

window.config = {};

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var Patients = require('../../../app/pages/patients');

describe('Patients', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(Patients).to.be.a('function');
  });

  describe('render', function() {
    it('should console.error when required props are missing', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<Patients />);
      expect(console.error.callCount).to.equal(1);
    });

    it('should render without problems when trackMetric is set', function () {
      console.error = sinon.stub();
      var props = {
        trackMetric: sinon.stub()
      };
      var elem = React.createElement(Patients, props);
      var render = TestUtils.renderIntoDocument(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});