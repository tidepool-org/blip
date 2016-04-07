/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

var React = require('react');
var ReactDOM = require('react-dom');
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
      var patientCardElem = React.createElement(PatientCard, props);
      var elem = TestUtils.renderIntoDocument(patientCardElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('remove yourself from a care team for another patient (not logged-in user)', function() {
    var renderedDOMElem;

    beforeEach(function() {
      var props = {
        trackMetric: function() {},
        patient: {
          profile: {
            fullName: 'Jane Doe'
          },
          permissions: {
            note: {},
            view: {}
          }
        }
      };
      var patientCardElem = React.createElement(PatientCard, props);
      var elem = TestUtils.renderIntoDocument(patientCardElem);
      renderedDOMElem = ReactDOM.findDOMNode(elem);
    });

    it('should render a patientcard-leave with delete icon and title text', function() {
      var patientCardLeave = renderedDOMElem.querySelectorAll('.patientcard-leave');
      var leaveLink = renderedDOMElem.querySelectorAll('a');
      var deleteIcon = renderedDOMElem.querySelectorAll('.icon-delete');
      expect(patientCardLeave.length).to.equal(1);
      expect(deleteIcon.length).to.equal(1);
      expect(leaveLink[1].title).to.equal('Remove yourself from Jane Doe\'s care team.');
    });

    it('should render a confirmation overlay when you click to remove yourself from a care team', function() {
      var leaveLink = renderedDOMElem.querySelectorAll('a');
      TestUtils.Simulate.click(leaveLink[1]);
      var overlay = renderedDOMElem.querySelectorAll('.ModalOverlay-content');
      expect(overlay.length).to.equal(1);
    });
  });
});