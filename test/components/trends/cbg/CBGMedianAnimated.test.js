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
import { TransitionMotion } from 'react-motion';
import { mount } from 'enzyme';

import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import bgBounds from '../../../helpers/bgBounds';
import SVGContainer from '../../../helpers/SVGContainer';

import { CBGMedianAnimated } from '../../../../src/components/trends/cbg/CBGMedianAnimated';

describe('CBGMedianAnimated', () => {
  const datum = {
    id: '2700000',
    min: 22,
    tenthQuantile: 60,
    firstQuartile: 100,
    median: 140,
    thirdQuartile: 180,
    ninetiethQuantile: 245,
    max: 521,
    msX: 2700000,
    msFrom: 1800000,
    msTo: 3600000,
  };
  const props = {
    bgBounds,
    datum,
    defaultY: 100,
    displayingMedian: true,
    showingCbgDateTraces: false,
    sliceWidth: 10,
    xScale,
    yScale,
  };

  describe('when `displayingMedian` is true', () => {
    let wrapper;
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGMedianAnimated {...props} />
        </SVGContainer>
      );
    });

    it('should render a single <rect>', () => {
      expect(wrapper.find('rect').length).to.equal(1);
    });

    it('should vertically center the median <rect> on the value', () => {
      const median = wrapper.find(CBGMedianAnimated);
      const sliceWidth = median.prop('sliceWidth');
      const strokeWidth = sliceWidth / 8;
      const medianWidth = sliceWidth - strokeWidth;
      const medianHeight = medianWidth * 0.75;

      expect(wrapper.find(TransitionMotion).prop('styles')[0].style.median.val)
        .to.equal(yScale(median.prop('datum').median) - medianHeight / 2);
    });
  });
});
