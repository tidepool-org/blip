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

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import sinon from 'sinon';
import { expect } from 'chai';

import PatientBgUnits from '../../../app/components/patientBgUnits';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../app/core/constants';

describe('PatientBgUnits', () => {
  const props = {
    patient: { userid: 1234 },
  };

  before(() => {
    sinon.spy(console, 'error');
  });
  after(() => {
    console.error.restore();
  });

  it('should be a function', () => {
    expect(PatientBgUnits).to.be.a('function');
  });

  describe('render', () => {
    /** @type {import('enzyme').ReactWrapper<PatientBgUnits>} */
    let wrapper;

    afterEach(() => {
      wrapper.unmount();
    });

    it('should render without errors when provided all required props', () => {
      wrapper = mount(
        <PatientBgUnits
          {...props}
        />
      );
      expect(wrapper.find('.PatientBgUnits')).to.have.length(1);
      // @ts-ignore
      expect(console.error.callCount).to.equal(0);
    });

    it('should render the default glycemia units when missing from the props', () => {
      wrapper = mount(
        <PatientBgUnits
          {...props}
        />
      );
      expect(wrapper.find('.bgUnits').text()).to.be.equal(MGDL_UNITS);
    });

    it('should render the profile glycemia units when available', () => {
      const propsBgPrefs = {
        patient: {
          userid: 1234,
          settings: {
            units: { bg: MMOLL_UNITS }
          },
        },
      };
      wrapper = mount(
        <PatientBgUnits
          {...propsBgPrefs}
        />
      );
      expect(wrapper.find('.bgUnits').text()).to.be.equal(MMOLL_UNITS);
    });
  });
});
