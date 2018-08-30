/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { mount, shallow } from 'enzyme';

import PatientSettings from '../../../../app/pages/patient/patientsettings';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../../app/core/constants';

const expect = chai.expect;

describe('PatientSettings', function () {
  let wrapper;
  const props = {
    editingAllowed: true,
    patient: {},
    onUpdatePatientSettings: sinon.stub(),
    trackMetric: sinon.stub(),
  };

  beforeEach(() => {
    wrapper = mount(<PatientSettings {...props} />);
  });

  afterEach(() => {
    props.onUpdatePatientSettings.reset();
    props.trackMetric.reset();
  });

  it('should be a function', () => {
    expect(PatientSettings).to.be.a('function');
  });


  describe('render', function() {
    it('should render without errors when provided all required props', () => {
      console.error = sinon.stub();

      expect(wrapper.find('.PatientSettings')).to.have.length(1);
      expect(console.error.callCount).to.equal(0);
    });

    it('should display default BG settings when not provided by the patient prop', () => {
      wrapper.setProps({
        patient: {
          settings: {},
        },
      });
      expect(wrapper.find('.IncrementalInput--low').text()).to.equal('70 mg/dL');
      expect(wrapper.find('.IncrementalInput--high').text()).to.equal('180 mg/dL');

      wrapper.setProps({
        patient: {
          settings: {
            units: {
              bg: MMOLL_UNITS,
            },
          },
        },
      });
      expect(wrapper.find('.IncrementalInput--low').text()).to.equal('3.9 mmol/L');
      expect(wrapper.find('.IncrementalInput--high').text()).to.equal('10.0 mmol/L');
    });

    it('should display a patient\'s BG settings with proper formatting when provided by the patient prop', () => {
      wrapper.setProps({
        patient: {
          settings: {
            bgTarget: {
              low: 60,
              high: 190,
            },
            units: {
              bg: MGDL_UNITS,
            },
          },
        },
      });
      expect(wrapper.find('.IncrementalInput--low').text()).to.equal('60 mg/dL');
      expect(wrapper.find('.IncrementalInput--high').text()).to.equal('190 mg/dL');

      wrapper.setProps({
        patient: {
          settings: {
            bgTarget: {
              low: 4,
              high: 12.3,
            },
            units: {
              bg: MMOLL_UNITS,
            },
          },
        },
      });
      expect(wrapper.find('.IncrementalInput--low').text()).to.equal('4.0 mmol/L');
      expect(wrapper.find('.IncrementalInput--high').text()).to.equal('12.3 mmol/L');
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
    const elem = TestUtils.renderIntoDocument(patientSettingsElem).getWrappedInstance();

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

    it('should return an object with default mmol/L settings when reset link is clicked', function() {
      const props = {
        editingAllowed: true,
        user: {},
        patient: {
          userid: 1234,
          settings: {
            units: {
              bg: MMOLL_UNITS,
            },
          },
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
          low: 3.9,
          high: 10,
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
    let patientSettings;
    beforeEach(() => {
      props.trackMetric.reset();
      wrapper = mount(
        <PatientSettings
          {...props}
        />
      );
      patientSettings = wrapper.instance().getWrappedInstance();
    });

    it('should update state with an error when lower bound is greater than upper bound', function() {
      patientSettings.onIncrementChange('high', 65, MGDL_UNITS);
      expect(patientSettings.state.error.low).to.equal(true);
      expect(patientSettings.state.error.high).to.equal(false);
    });

    it('should update state with no error when lower bound is less than upper bound', function() {
      patientSettings.onIncrementChange('high', 65, MGDL_UNITS);
      expect(patientSettings.state.error.low).to.equal(true);
      expect(patientSettings.state.error.high).to.equal(false);
      patientSettings.onIncrementChange('high', 80, MGDL_UNITS);
      expect(patientSettings.state.error.low).to.equal(false);
      expect(patientSettings.state.error.high).to.equal(false);
    });

    it('should track metric for lower bound change only once', function() {
      expect(props.trackMetric.callCount).to.equal(0);
      patientSettings.onIncrementChange('low', 90, MGDL_UNITS);
      patientSettings.onIncrementChange('low', 95, MGDL_UNITS);
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('should track metric for upper bound change only once', function() {
      expect(props.trackMetric.callCount).to.equal(0);
      patientSettings.onIncrementChange('high', 150, MGDL_UNITS);
      patientSettings.onIncrementChange('high', 155, MGDL_UNITS);
      expect(props.trackMetric.callCount).to.equal(1);
    });

    it('should call onUpdatePatientSettings with new settings', function() {
      patientSettings.onIncrementChange('high', 165, MGDL_UNITS);
      expect(props.onUpdatePatientSettings.calledWith(1234, {
        bgTarget: {
          low: 70,
          high: 165,
        },
      })).to.be.true;
    });
  });

});
