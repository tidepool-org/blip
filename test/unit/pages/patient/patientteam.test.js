/* global chai */

var React = require('react');
var TestUtils = require('react/lib/ReactTestUtils');
var expect = chai.expect;

var PatientTeam = require('../../../../app/pages/patient/patientteam');

describe('PatientTeam', function () {
  

  describe('render', function() {
    it('should console.warn when trackMetric not set', function () {
      console.warn = sinon.stub();
      var elem = TestUtils.renderIntoDocument(<PatientTeam/>);

      expect(elem).to.be.ok;
      expect(console.warn.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientTeam`.')).to.equal(true);
    });

    it('should not console.warn when trackMetric set', function() {
      console.warn = sinon.stub();
      var props = {
        trackMetric: function() {}
      };
      var patientElem = React.createElement(PatientTeam, props);
      var elem = TestUtils.renderIntoDocument(patientElem);

      expect(elem).to.be.ok;
      expect(console.warn.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should return an object when showModalOverlay is false', function() {
      console.warn = sinon.stub();
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
      expect(console.warn.callCount).to.equal(0);
    });
  });
});