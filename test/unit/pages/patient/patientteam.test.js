/* global chai */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var PatientTeam = require('../../../../app/pages/patient/patientteam');

describe('PatientTeam', function () {
  

  describe('render', function() {
    it('should console.error when trackMetric not set', function () {
      console.error = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PatientTeam/>);

      expect(elem).to.be.ok;
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientTeam`.')).to.equal(true);
    });

    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var patientElem = React.createElement(PatientTeam, props);
      var elem = TestUtils.renderIntoDocument(patientElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should return an object when showModalOverlay is false', function() {
      console.error = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var patientElem = React.createElement(PatientTeam, props);
      var elem = TestUtils.renderIntoDocument(patientElem);
      var initialState = elem.getInitialState();

      expect(Object.keys(initialState).length).to.equal(4);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
      expect(initialState.invite).to.equal(false);
      expect(initialState.editing).to.equal(false);
      expect(console.error.callCount).to.equal(0);
    });
  });
});