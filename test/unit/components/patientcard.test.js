/* global chai */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var PatientCard = require('../../../app/components/patientcard');

describe('PatientCard', function () {
  
  describe('render', function() {
    it('should console.error when required props not set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PatientCard/>);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(2);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientCard`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `patient` was not specified in `PatientCard`.')).to.equal(true);
    });

    it('should not console.error when trackMetric and patient set', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {},
        patient: {}
      };
      var navbarElem = React.createElement(PatientCard, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });
});