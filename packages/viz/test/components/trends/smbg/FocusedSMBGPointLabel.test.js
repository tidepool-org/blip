/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import { formatClassesAsSelector } from '../../../helpers/cssmodules';

import { MGDL_UNITS, MMOLL_UNITS } from '../../../../src/utils/constants';
import FocusedSMBGPointLabel
  from '../../../../src/components/trends/smbg/FocusedSMBGPointLabel';
import styles
  from '../../../../src/components/trends/smbg/FocusedSMBGPointLabel.css';

// TODO: test BG display based on units?
// TODO: test absolute positioning?

describe('FocusedSMBGPointLabel', () => {
  const focusedPoint = {
    allPositions: [
      { left: 215.625, top: 200 },
      { left: 327.375, top: 190 },
      { left: 550.875, top: 180 },
    ],
    allSmbgsOnDate: [
      { value: 180 },
      { value: 190 },
      { value: 200 },
    ],
    date: '2016-09-28',
    datum: {
      deviceTime: '2016-09-28T14:47:06',
      msPer24: 53226000,
      subType: 'manual',
      time: '2016-09-28T18:47:06.000Z',
      value: 200,
    },
    position: {
      left: 550.875,
      top: 180,
    },
  };
  const timePrefs = {
    timezoneAware: false,
    timezoneName: null,
  };
  const bgPrefs = {
    bgClasses: {
      'very-high': { boundary: 600 },
      high: { boundary: 300 },
      target: { boundary: 180 },
      low: { boundary: 70 },
      'very-low': { boundary: 54 },
    },
    bgUnits: MGDL_UNITS,
  };

  describe('when no focused datum', () => {
    it('should render nothing', () => {
      const minimalProps = {
        bgPrefs: {
          bgUnits: MMOLL_UNITS,
        },
      };
      const wrapper = mount(
        <FocusedSMBGPointLabel {...minimalProps} />
      );
      expect(wrapper.html()).to.be.null;
    });
  });

  describe('when focused and lines turned off and grouped', () => {
    let wrapper;

    before(() => {
      wrapper = mount(
        <FocusedSMBGPointLabel
          bgPrefs={bgPrefs}
          focusedPoint={focusedPoint}
          lines={false}
          grouped
          timePrefs={timePrefs}
        />
      );
    });

    it('should render individual point tooltips', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(2);
    });
    it('should render a detailed individual point tooltip', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.dateTime))).to.have.length(1);
    });
  });

  describe('when focused and lines turned off and not grouped', () => {
    let wrapper;

    before(() => {
      wrapper = mount(
        <FocusedSMBGPointLabel
          bgPrefs={bgPrefs}
          focusedPoint={focusedPoint}
          lines={false}
          grouped={false}
          timePrefs={timePrefs}
        />
      );
    });

    it('should render individual point tooltips', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(2);
    });
    it('should render a detailed individual point tooltip', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.dateTime))).to.have.length(1);
    });
  });

  describe('when focused and lines turned on and grouped', () => {
    let wrapper;

    before(() => {
      wrapper = mount(
        <FocusedSMBGPointLabel
          bgPrefs={bgPrefs}
          focusedPoint={focusedPoint}
          lines
          grouped
          timePrefs={timePrefs}
        />
      );
    });

    it('should render individual point tooltips', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(3);
    });
    it('should render a generic individual point tooltip', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.explainerText))).to.have.length(1);
    });
  });

  describe('when focused and lines turned on and not grouped', () => {
    let wrapper;

    before(() => {
      wrapper = mount(
        <FocusedSMBGPointLabel
          bgPrefs={bgPrefs}
          focusedPoint={focusedPoint}
          lines
          grouped={false}
          timePrefs={timePrefs}
        />
      );
    });

    it('should render individual point tooltips', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(3);
    });
    it('should render a generic individual point tooltip', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.explainerText))).to.have.length(1);
    });
  });
});
