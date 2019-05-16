/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';

import PatientBgUnits from '../../../app/components/patientBgUnits';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../app/core/constants';

const expect = chai.expect;

describe('PatientBgUnits', () => {
  const props = {
    editingAllowed: true,
    onUpdatePatientSettings: sinon.stub(),
    patient: { userid: 1234 },
    trackMetric: sinon.stub(),
    working: false,
  };

  const expectedInitialFormValues = {
    bgUnits: MGDL_UNITS,
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(
      <PatientBgUnits
        {...props}
      />
    );
  });

  afterEach(() => {
    props.onUpdatePatientSettings.reset();
    props.trackMetric.reset();
  });

  it('should be a function', () => {
    expect(PatientBgUnits).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.PatientBgUnits')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should set the initial state', () => {
    const expectedInitialState = {
      formValues: expectedInitialFormValues,
    };

    expect(wrapper.state()).to.eql(expectedInitialState);
  });

  describe('render', () => {
    it('should render a radio input group when editingAllowed prop is true', () => {
      const group = wrapper.find('.input-group-radios');
      const labels = wrapper.find('.input-group-radio-label');
      const radios = wrapper.find('input.input-group-radio-control[type="radio"]');

      expect(group).to.have.length(1);
      expect(radios).to.have.length(2);
      expect(labels.first().text()).to.include(MGDL_UNITS);
      expect(labels.last().text()).to.include(MMOLL_UNITS);
    });

    it('should render the BG units as text when editingAllowed prop is false', () => {
      wrapper.setProps({ editingAllowed: false });
      const content = wrapper.find('.bgUnits');

      expect(content).to.have.length(1);
      expect(content.text()).to.include(MGDL_UNITS);
    });
  });

  describe('getInitialFormValues', () => {
    it('should set appropriate default form values when no patient BG settings are provided', () => {
      expect(wrapper.state('formValues')).to.eql(expectedInitialFormValues);
    });

    it('should set appropriate initial form values for a patient who has BG unit settings set', () => {
      const newProps = _.assign({}, props, {
        patient: {
          settings: {
            units: {
              bg: MMOLL_UNITS,
            },
          },
        },
      });

      const expectedFormValues = {
        bgUnits: MMOLL_UNITS,
      };

      const element = mount(<PatientBgUnits {...newProps} />)
      expect(element.state('formValues')).to.eql(expectedFormValues);
    });
  });

  describe('handleChange', () => {
    let spy, radio1, radio2;

    beforeEach(() => {
      spy = sinon.spy(wrapper.instance(), 'handleChange');
      wrapper.instance().forceUpdate();

      radio1 = wrapper.find('.simple-form').first().find('.input-group').first().find('input').first();
      radio2 = wrapper.find('.simple-form').first().find('.input-group').first().find('input').last();
    });

    it('should update the form values in state when a form value changes', () => {
      expect(wrapper.state('formValues').bgUnits).to.equal(MGDL_UNITS);

      radio2.simulate('change', { target: { name: 'bgUnits', value: MMOLL_UNITS } });

      sinon.assert.calledOnce(spy);
      expect(wrapper.state('formValues').bgUnits).to.equal(MMOLL_UNITS);

      wrapper.setProps({
        patient: {
          userid: 1234,
          settings: { units: { bg: MMOLL_UNITS } }
        }
      });
      radio1.simulate('change', { target: { name: 'bgUnits', value: MGDL_UNITS } });

      sinon.assert.calledTwice(spy);
      expect(wrapper.state('formValues').bgUnits).to.equal(MGDL_UNITS);
    });

    it('should return without doing anything if the units selected match the current patient bg unit settings', () => {
      expect(wrapper.state('formValues').bgUnits).to.equal(MGDL_UNITS);

      radio1.simulate('change', { target: { name: 'bgUnits', value: MGDL_UNITS } });

      sinon.assert.callCount(props.onUpdatePatientSettings, 0);
      sinon.assert.callCount(props.trackMetric, 0);
      expect(wrapper.state('formValues').bgUnits).to.equal(MGDL_UNITS);
    });

    it('should return without doing anything if the working prop is set to true', () => {
      expect(wrapper.state('formValues').bgUnits).to.equal(MGDL_UNITS);

      wrapper.setProps({ working: true });
      radio2.simulate('change', { target: { name: 'bgUnits', value: MMOLL_UNITS } });

      sinon.assert.callCount(props.onUpdatePatientSettings, 0);
      sinon.assert.callCount(props.trackMetric, 0);
      expect(wrapper.state('formValues').bgUnits).to.equal(MGDL_UNITS);
    });

    it('should set the patient BG units', () => {
      radio2.simulate('change', { target: { name: 'bgUnits', value: MMOLL_UNITS } });

      sinon.assert.calledOnce(props.onUpdatePatientSettings);
      sinon.assert.calledWith(props.onUpdatePatientSettings, props.patient.userid, {
        bgTarget: { high: 10, low: 3.9 },
        units: { bg: MMOLL_UNITS },
      });
    });

    it('should track metrics when units are changed', () => {
      radio2.simulate('change', { target: { name: 'bgUnits', value: MMOLL_UNITS } });

      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'web - switched to mmoll');

      wrapper.setProps({
        patient: {
          userid: 1234,
          settings: { units: { bg: MMOLL_UNITS } }
        }
      });
      radio1.simulate('change', { target: { name: 'bgUnits', value: MGDL_UNITS } });

      sinon.assert.calledTwice(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'web - switched to mgdl');
    });
  });
});
