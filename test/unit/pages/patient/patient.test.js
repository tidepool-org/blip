/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global before */
/* global after */

import React from 'react';
import createReactClass from 'create-react-class';

var expect = chai.expect;

import Patient from '../../../../app/pages/patient/patient';
import { mount } from 'enzyme';

describe('Patient', function () {
  before(() => {
    Patient.__Rewire__('PatientInfo', createReactClass({
      render: function() {
        return (<div className='fake-patient-info-view'></div>);
      }
    }));
  });

  after(() => {
    Patient.__ResetDependency__('PatientInfo');
  });

  describe('render', function() {
    it('should render without problems when required props are present', function() {
      console.error = sinon.stub();
      var props = {
        acknowledgeNotification: sinon.stub(),
        fetchers: [],
        fetchingPatient: false,
        fetchingUser: false,
        trackMetric: sinon.stub(),
        dataSources: [],
        fetchDataSources: sinon.stub(),
        connectDataSource: sinon.stub(),
        disconnectDataSource: sinon.stub(),
      };
      var patientElem = React.createElement(Patient, props);
      var elem = mount(patientElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('getInitialState', function() {
    it('should return an object', function() {
      var props = {};
      var patientElem = React.createElement(Patient, props);
      var elem = mount(patientElem).childAt(0);
      var initialState = elem.instance().getInitialState();

      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.showModalOverlay).to.equal(false);
      expect(initialState.dialog).to.equal('');
    });
  });
});
