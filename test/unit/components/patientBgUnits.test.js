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
import { render, fireEvent } from '@testing-library/react';
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

  afterEach(() => {
    props.onUpdatePatientSettings.resetHistory();
    props.trackMetric.resetHistory();
  });

  it('should be a function', () => {
    expect(PatientBgUnits).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    try {
      const { container } = render(<PatientBgUnits {...props} />);

      expect(container.querySelector('.PatientBgUnits')).to.exist;
      expect(consoleErrorStub.callCount).to.equal(0);
    } finally {
      consoleErrorStub.restore();
    }
  });

  it('should set the initial state', () => {
    const { container } = render(<PatientBgUnits {...props} />);
    const radios = container.querySelectorAll('input.input-group-radio-control[type="radio"]');

    expect(radios.length).to.equal(2);
    expect(radios[0].checked).to.equal(true);
    expect(radios[1].checked).to.equal(false);
    expect(radios[0].value).to.equal(expectedInitialFormValues.bgUnits);
  });

  describe('render', () => {
    it('should render a radio input group when editingAllowed prop is true', () => {
      const { container } = render(<PatientBgUnits {...props} />);
      const group = container.querySelectorAll('.input-group-radios');
      const labels = container.querySelectorAll('.input-group-radio-label');
      const radios = container.querySelectorAll('input.input-group-radio-control[type="radio"]');

      expect(group.length).to.equal(1);
      expect(radios.length).to.equal(2);
      expect(labels[0].textContent).to.include(MGDL_UNITS);
      expect(labels[labels.length - 1].textContent).to.include(MMOLL_UNITS);
    });

    it('should render the BG units as text when editingAllowed prop is false', () => {
      const { container } = render(<PatientBgUnits {...props} editingAllowed={false} />);
      const content = container.querySelector('.bgUnits');

      expect(content).to.exist;
      expect(content.textContent).to.include(MGDL_UNITS);
    });
  });

  describe('getInitialFormValues', () => {
    it('should set appropriate default form values when no patient BG settings are provided', () => {
      const { container } = render(<PatientBgUnits {...props} editingAllowed={false} />);
      const bgUnitsEl = container.querySelector('.bgUnits');
      expect(bgUnitsEl).to.exist;
      expect(bgUnitsEl.textContent).to.eql(expectedInitialFormValues.bgUnits);
    });

    it('should set appropriate initial form values for a patient who has BG unit settings set', () => {
      const newProps = _.assign({}, props, {
        patient: {
          userid: 1234,
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

      const { container } = render(<PatientBgUnits {...newProps} editingAllowed={false} />);
      expect(container.querySelector('.bgUnits').textContent).to.eql(expectedFormValues.bgUnits);
    });
  });

  describe('handleChange', () => {
    it('should update the form values in state when a form value changes', () => {
      const { container, rerender } = render(<PatientBgUnits {...props} />);
      const radios = container.querySelectorAll('input.input-group-radio-control[type="radio"]');

      fireEvent.click(radios[1]);
      expect(radios[0].checked).to.equal(false);
      expect(radios[1].checked).to.equal(true);
      sinon.assert.calledOnce(props.onUpdatePatientSettings);

      rerender(
        <PatientBgUnits
          {...props}
          patient={{ userid: 1234, settings: { units: { bg: MMOLL_UNITS } } }}
        />
      );
      const updatedRadios = container.querySelectorAll('input.input-group-radio-control[type="radio"]');
      expect(updatedRadios[0].checked).to.equal(false);
      expect(updatedRadios[1].checked).to.equal(true);
      fireEvent.click(updatedRadios[0]);
      expect(updatedRadios[0].checked).to.equal(true);
      expect(updatedRadios[1].checked).to.equal(false);
      sinon.assert.calledTwice(props.onUpdatePatientSettings);
    });

    it('should return without doing anything if the units selected match the current patient bg unit settings', () => {
      const { container } = render(<PatientBgUnits {...props} />);
      const radio1 = container.querySelectorAll('input.input-group-radio-control[type="radio"]')[0];
      fireEvent.click(radio1);

      sinon.assert.callCount(props.onUpdatePatientSettings, 0);
      sinon.assert.callCount(props.trackMetric, 0);
    });

    it('should return without doing anything if the working prop is set to true', () => {
      const { container } = render(<PatientBgUnits {...props} working={true} />);
      const radio2 = container.querySelectorAll('input.input-group-radio-control[type="radio"]')[1];
      fireEvent.click(radio2);

      sinon.assert.callCount(props.onUpdatePatientSettings, 0);
      sinon.assert.callCount(props.trackMetric, 0);
    });

    it('should set the patient BG units', () => {
      const { container } = render(<PatientBgUnits {...props} />);
      const radio2 = container.querySelectorAll('input.input-group-radio-control[type="radio"]')[1];
      fireEvent.click(radio2);

      sinon.assert.calledOnce(props.onUpdatePatientSettings);
      sinon.assert.calledWith(props.onUpdatePatientSettings, props.patient.userid, {
        bgTarget: { high: 10, low: 3.9 },
        units: { bg: MMOLL_UNITS },
      });
    });

    it('should track metrics when units are changed', () => {
      const { container, rerender } = render(<PatientBgUnits {...props} />);
      let radios = container.querySelectorAll('input.input-group-radio-control[type="radio"]');
      fireEvent.click(radios[1]);

      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'web - switched to mmoll');

      rerender(
        <PatientBgUnits
          {...props}
          patient={{ userid: 1234, settings: { units: { bg: MMOLL_UNITS } } }}
        />
      );
      radios = container.querySelectorAll('input.input-group-radio-control[type="radio"]');
      fireEvent.click(radios[0]);

      sinon.assert.calledTwice(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'web - switched to mgdl');
    });
  });
});
