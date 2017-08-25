/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { shallow } from 'enzyme';

import PatientSettings from '../../../../app/pages/patient/patientsettings';
import { MGDL_UNITS } from '../../../../app/core/constants';

const expect = chai.expect;

describe('PatientSettings', function () {

  describe('render', function() {
    it('should render without problems when required props are present', () => {
      console.error = sinon.spy();
      const props = {
        editingAllowed: true,
        onUpdatePatientSettings: sinon.stub(),
        trackMetric: sinon.stub(),
      };

      const patientSettingsElem = React.createElement(PatientSettings, props);
      const elem = TestUtils.renderIntoDocument(patientSettingsElem);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });
  });

  describe('initial state', function() {
    const props = {
      editingAllowed: true,
      user: {},
      patient: {},
      onUpdatePatientSettings: sinon.stub(),
      trackMetric: sinon.stub(),
    };

    const patientSettingsElem = React.createElement(PatientSettings, props);
    const elem = TestUtils.renderIntoDocument(patientSettingsElem);

    const initialState = elem.state;

    it('should return an object with tracked set to false for low and high bounds', function() {
      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.tracked.low).to.equal(false);
      expect(initialState.tracked.high).to.equal(false);
    });

    it('should return an object with error set to false for low and high bounds', function() {
      expect(Object.keys(initialState).length).to.equal(2);
      expect(initialState.error.low).to.equal(false);
      expect(initialState.error.high).to.equal(false);
    });
  });

  describe('resetRange', function() {
    it('should return an object with default settings when reset link is clicked', function() {
      const props = {
        editingAllowed: true,
        user: {},
        patient: {
          userid: 1234,
        },
        onUpdatePatientSettings: sinon.stub(),
        trackMetric: sinon.stub(),
      };

      const patientSettingsElem = React.createElement(PatientSettings, props);
      const elem = TestUtils.renderIntoDocument(patientSettingsElem);
      const resetRangeLink = TestUtils.findRenderedDOMComponentWithClass(elem, 'PatientSettings-reset');

      expect(props.onUpdatePatientSettings.callCount).to.equal(0);
      TestUtils.Simulate.click(resetRangeLink);
      expect(props.onUpdatePatientSettings.callCount).to.equal(1);
      expect(props.onUpdatePatientSettings.calledWith(1234, {
        bgTarget: {
          low: 70,
          high: 180,
        },
      })).to.be.true;
    });
  });

  describe('onIncrementChange', function() {
    const props = {
      editingAllowed: true,
      user: {},
      patient: {
        userid: 1234,
      },
      onUpdatePatientSettings: sinon.stub(),
      trackMetric: sinon.stub(),
    };

    let wrapper;
    beforeEach(() => {
      props.trackMetric.reset();
      wrapper = shallow(
        <PatientSettings
          {...props}
        />
      );
    });

    it('should update state with an error when lower bound is greater than upper bound', function() {
      wrapper.instance().onIncrementChange('high', 65, MGDL_UNITS);
      expect(wrapper.state().error.low).to.equal(true);
      expect(wrapper.state().error.high).to.equal(false);
    });

    it('should update state with no error when lower bound is less than upper bound', function() {
      wrapper.instance().onIncrementChange('high', 65, MGDL_UNITS);
      expect(wrapper.state().error.low).to.equal(true);
      expect(wrapper.state().error.high).to.equal(false);
      wrapper.instance().onIncrementChange('high', 80, MGDL_UNITS);
      expect(wrapper.state().error.low).to.equal(false);
      expect(wrapper.state().error.high).to.equal(false);
    });

    it('should track metric for lower bound change only once', function() {
      expect(props.trackMetric.callCount).to.equal(0);
      wrapper.instance().onIncrementChange('low', 90, MGDL_UNITS);
      wrapper.instance().onIncrementChange('low', 95, MGDL_UNITS);
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('should track metric for upper bound change only once', function() {
      expect(props.trackMetric.callCount).to.equal(0);
      wrapper.instance().onIncrementChange('high', 150, MGDL_UNITS);
      wrapper.instance().onIncrementChange('high', 155, MGDL_UNITS);
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('should call onUpdatePatientSettings with new settings', function() {
      wrapper.instance().onIncrementChange('high', 165, MGDL_UNITS);
      expect(props.onUpdatePatientSettings.calledWith(1234, {
        bgTarget: {
          low: 70,
          high: 165,
        },
      })).to.be.true;
    });
  });

});
