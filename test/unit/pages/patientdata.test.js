/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import rewire from 'rewire';
import rewireModule from '../../utils/rewireModule';

var expect = chai.expect;

var PD = rewire('../../../app/pages/patientdata/patientdata.js');

var PatientData = PD.PatientData;

/**
 * Need to set window.config for config module
 */
window.config = {};

describe('PatientData', function () {
  // We must remember to require the base module when mocking dependencies,
  // otherwise dependencies mocked will be bound to the wrong scope!
  

  rewireModule(PD, {
    Basics: React.createClass({
      render: function() {
        return (<div className='fake-basics-view'></div>);
      }
    })
  });

  it('should be exposed as a module and be of type function', function() {
    expect(PatientData).to.be.a('function');
  });

  describe('render', function() {
    it('should warn when required props are not present', function() {
      console.error = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientData/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(5);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `timePrefs` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingPatient` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingPatientData` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `queryParams` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientData`.')).to.equal(true);
    });

    it ('should not warn when required props are set', function() {
      var props = {
        timePrefs: {
          timezoneAware: false,
          timezoneName: null
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        queryParams: {},
        trackMetric: sinon.stub()
      };

      console.error = sinon.spy();
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it ('should render the loading message and image when no data is present and fetchingPatient is true', function() {
      var props = {
        timePrefs: {
          timezoneAware: false,
          timezoneName: null
        },
        fetchingPatient: false,
        fetchingPatientData: true,
        queryParams: {},
        trackMetric: sinon.stub()
      };

      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-image');
      expect(x).to.be.ok;

      var y = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-loading-message');
      expect(y).to.be.ok;
    });

    it ('should render the no data message when no data is present and loading is false', function() {
      var props = {
        timePrefs: {
          timezoneAware: false,
          timezoneName: null
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        queryParams: {},
        trackMetric: sinon.stub()
      };

      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);

      expect(elem).to.be.ok;
      elem.setState({processingData: false});

      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message');
      expect(x).to.be.ok;
    });

    it ('should render the no data message when no data is present, isUserPatient and loading is false', function() {
      var props = {
        timePrefs: {
          timezoneAware: false,
          timezoneName: null
        },
        isUserPatient: true,
        fetchingPatient: false,
        fetchingPatientData: false,
        queryParams: {},
        trackMetric: sinon.stub()
      };

      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      elem.setState({processingData: false});
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message-no-data');
      expect(x).to.be.ok;
    });

    it ('should render the no data message when no data is present, isUserPatient and loading is false', function() {
      var props = {
        timePrefs: {
          timezoneAware: false,
          timezoneName: null
        },
        patient: {
          userid: 40
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        queryParams: {},
        trackMetric: sinon.stub()
      };

      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message');
      expect(x).to.be.ok;
    });

    it ('should render the no data message when no data is present for current patient', function() {
      var props = {
        timePrefs: {
          timezoneAware: false,
          timezoneName: null
        },
        patient: {
          userid: 40
        },
        patientData: {
          41: { data: [] }
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        queryParams: {},
        trackMetric: sinon.stub()
      };

      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'patient-data-message');
      expect(x).to.be.ok;
    });

    it ('should render when data is present for current patient', function() {
      var props = {
        timePrefs: {
          timezoneAware: false,
          timezoneName: null
        },
        patient: {
          userid: 40
        },
        patientData: {
          40: { data: [ 1, 2] }
        },
        fetchingPatient: false,
        fetchingPatientData: false,
        queryParams: {},
        trackMetric: sinon.stub()
      };

      var pdElem = React.createElement(PatientData, props);
      var elem = TestUtils.renderIntoDocument(pdElem);
      expect(elem).to.be.ok;
      elem.setState({processingData: false, processedPatientData: { data: [ { type: 'data', value: 100 }]}});
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
      expect(x).to.be.ok;
    });
  });
});
