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
import FocusedSMBGRangeLabels
  from '../../../../src/components/trends/smbg/FocusedSMBGRangeLabels';
import styles
  from '../../../../src/components/trends/smbg/FocusedSMBGRangeLabels.css';

// TODO: test the different classes added if tooltipLeft is true??
// TODO: test BG display based on units?
// TODO: test absolute positioning?

describe('FocusedSMBGRangeLabels', () => {
  const focusedRange = {
    data: {
      id: '81000000',
      max: 300,
      mean: 180,
      min: 70,
      msX: 81000000,
      msFrom: 75600000,
      msTo: 86400000,
    },
    position: {
      left: 880,
      tooltipLeft: true,
      yPositions: {
        max: 250,
        mean: 300,
        min: 400,
      },
    },
  };

  describe('when no focused range', () => {
    it('should render nothing', () => {
      const minimalProps = {
        bgUnits: MMOLL_UNITS,
      };
      const wrapper = mount(
        <FocusedSMBGRangeLabels {...minimalProps} />
      );
      expect(wrapper.html()).to.be.null;
    });
  });

  describe('when range is focused', () => {
    let wrapper;

    before(() => {
      wrapper = mount(
        <FocusedSMBGRangeLabels
          bgUnits={MGDL_UNITS}
          focusedRange={focusedRange}
        />
      );
    });

    it('should render a mean value label', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.explainerText))).to.have.length(1);
    });

    it('should render two number labels (plus one for the mean value)', () => {
      expect(wrapper.find(formatClassesAsSelector(styles.number))).to.have.length(3);
    });
  });
});
