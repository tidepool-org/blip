/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-addons-test-utils';

import rewire from 'rewire';
import rewireModule from '../../utils/rewireModule';

var assert = chai.assert;
var expect = chai.expect;

var PD = rewire('../../../app/pages/patientdata/patientdata.js');
import { mapStateToProps } from '../../../app/pages/patientdata/patientdata.js';

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
    it ('should not warn when required props are set', function() {
      var props = {
        currentPatientInViewId: 'smestring',
        patientDataMap: {},
        patientNotesMap: {},
        patient: {},
        fetchingPatient: false,
        fetchingPatientData: false,
        isUserPatient: false,
        queryParams: {},
        onFetchMessageThread: sinon.stub(),
        onSaveComment: sinon.stub(),
        onEditMessage: sinon.stub(),
        onCreateMessage: sinon.stub(),
        user: {},
        trackMetric: sinon.stub(),
      };

      console.error = sinon.spy();
      // Try out using the spread props syntax in JSX
      var elem = TestUtils.renderIntoDocument(<PatientData {...props}/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should warn when required props are not present', function() {
      console.error = sinon.spy();
      var elem = TestUtils.renderIntoDocument(<PatientData/>);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(14);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `currentPatientInViewId` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `patientDataMap` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `patientNotesMap` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `patient` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingPatient` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `fetchingPatientData` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `isUserPatient` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `queryParams` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onFetchMessageThread` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onSaveComment` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onEditMessage` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `onCreateMessage` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `user` was not specified in `PatientData`.')).to.equal(true);
      expect(console.error.calledWith('Warning: Failed propType: Required prop `trackMetric` was not specified in `PatientData`.')).to.equal(true);
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
        trackMetric: sinon.stub(),
        currentPatientInViewId: '456kgkghs'
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
        trackMetric: sinon.stub(),
        currentPatientInViewId: '456kgkghs'
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
        trackMetric: sinon.stub(),
        currentPatientInViewId: '456kgkghs'
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
        trackMetric: sinon.stub(),
        currentPatientInViewId: '456kgkghs'
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
        trackMetric: sinon.stub(),
        currentPatientInViewId: '456kgkghs'
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
        trackMetric: sinon.stub(),
        currentPatientInViewId: '456kgkghs'
      };

      var pdElem = React.createElement(PatientData, props);
      var elem = TestUtils.renderIntoDocument(pdElem);
      expect(elem).to.be.ok;
      elem.setState({processingData: false, processedPatientData: { data: [ { type: 'data', value: 100 }]}});
      var x = TestUtils.findRenderedDOMComponentWithClass(elem, 'fake-basics-view');
      expect(x).to.be.ok;
    });
  });

  describe('mapStateToProps', () => {
    it('should be a function', () => {
      assert.isFunction(mapStateToProps);
    });
    describe('patient in view is logged-in user', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {
            userid: 'a1b2c3'
          }
        },
        currentPatientInViewId: 'a1b2c3',
        loggedInUserId: 'a1b2c3',
        patientDataMap: {
          a1b2c3: [1,2,3,4,5]
        },
        patientNotesMap: {
          a1b2c3: [{type: 'message'}]
        },
        messageThread: [{type: 'message'}],
        working: {
          fetchingPatient: {inProgress: false, notification: null},
          fetchingPatientData: {inProgress: false, notification: null}
        }
      };
      const result = mapStateToProps({blip: state});

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should set isUserPatient to true', () => {
        expect(result.isUserPatient).to.be.true;
      });

      it('should map allUsersMap.a1b2c3 to patient', () => {
        expect(result.patient).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should pass through patientDataMap', () => {
        expect(result.patientDataMap).to.deep.equal(state.patientDataMap);
      });

      it('should pass through patientNotesMap', () => {
        expect(result.patientNotesMap).to.deep.equal(state.patientNotesMap);
      });

      it('should pass through messageThread', () => {
        expect(result.messageThread).to.deep.equal(state.messageThread);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(state.working.fetchingPatient.inProgress);
      });

      it('should map working.fetchingPatientData.inProgress to fetchingPatientData', () => {
        expect(result.fetchingPatientData).to.equal(state.working.fetchingPatientData.inProgress);
      });
    });

    describe('patient in view is distinct from logged-in user', () => {
      const state = {
        allUsersMap: {
          a1b2c3: {
            userid: 'a1b2c3'
          },
          d4e5f6: {
            userid: 'd4e5f6'
          }
        },
        currentPatientInViewId: 'd4e5f6',
        loggedInUserId: 'a1b2c3',
        patientDataMap: {
          d4e5f6: [1,2,3,4,5]
        },
        patientNotesMap: {
          d4e5f6: [{type: 'message'}]
        },
        messageThread: [{type: 'message'}],
        working: {
          fetchingPatient: {inProgress: false, notification: null},
          fetchingPatientData: {inProgress: false, notification: null}
        }
      };
      const result = mapStateToProps({blip: state});

      it('should map allUsersMap.a1b2c3 to user', () => {
        expect(result.user).to.deep.equal(state.allUsersMap.a1b2c3);
      });

      it('should set isUserPatient to false', () => {
        expect(result.isUserPatient).to.be.false;
      });

      it('should map allUsersMap.d4e5f6 to patient', () => {
        expect(result.patient).to.deep.equal(state.allUsersMap.d4e5f6);
      });

      it('should pass through patientDataMap', () => {
        expect(result.patientDataMap).to.deep.equal(state.patientDataMap);
      });

      it('should pass through patientNotesMap', () => {
        expect(result.patientNotesMap).to.deep.equal(state.patientNotesMap);
      });

      it('should pass through messageThread', () => {
        expect(result.messageThread).to.deep.equal(state.messageThread);
      });

      it('should map working.fetchingPatient.inProgress to fetchingPatient', () => {
        expect(result.fetchingPatient).to.equal(state.working.fetchingPatient.inProgress);
      });

      it('should map working.fetchingPatientData.inProgress to fetchingPatientData', () => {
        expect(result.fetchingPatientData).to.equal(state.working.fetchingPatientData.inProgress);
      });
    });
  });
});
