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

import _ from 'lodash';
import React from 'react';

import { mount } from 'enzyme';

import { formatClassesAsSelector } from '../../../helpers/cssmodules';

import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import SVGContainer from '../../../helpers/SVGContainer';

import { TWENTY_FOUR_HRS } from '../../../../src/utils/datetime';

import BackgroundWithTargetRange
  from '../../../../src/components/trends/common/BackgroundWithTargetRange';
import styles
  from '../../../../src/components/trends/common/BackgroundWithTargetRange.css';

describe('BackgroundWithTargetRange', () => {
  let wrapper;
  const props = {
    bgBounds: {
      veryHighThreshold: 300,
      targetUpperBound: 180,
      targetLowerBound: 80,
      veryLowThreshold: 55,
    },
    margins: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    svgDimensions: {
      width: trendsWidth,
      height: trendsHeight,
    },
    xScale,
    yScale,
  };

  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <BackgroundWithTargetRange {...props} />
      </SVGContainer>
    );
  });

  it('should render two rects above and below target range', () => {
    const nonTargetRects = wrapper.find(formatClassesAsSelector(styles.nonTargetBackground));
    expect(nonTargetRects).to.have.length(2);
    nonTargetRects.forEach((rect) => {
      expect(rect.is('rect')).to.be.true;
    });
  });

  it('should render one rect for the target range', () => {
    const { bgBounds: { targetUpperBound, targetLowerBound } } = props;
    const targetRect = wrapper.find(formatClassesAsSelector(styles.targetBackground));
    expect(targetRect).to.have.length(1);
    expect(targetRect.is('rect')).to.be.true;
    expect(targetRect.prop('y')).to.equal(yScale(targetUpperBound));
    const expectedHeight = yScale(targetLowerBound) - yScale(targetUpperBound);
    expect(targetRect.prop('height')).to.equal(expectedHeight);
  });

  it('should NOT render 3-hr dividing lines by default', () => {
    const threeHrLines = wrapper.find(formatClassesAsSelector(styles.threeHrLine));
    expect(threeHrLines).to.have.length(0);
  });

  describe('when `linesAtThreeHrs` prop is `true`', () => {
    let withLinesWrapper;

    before(() => {
      withLinesWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <BackgroundWithTargetRange {...props} linesAtThreeHrs />
        </SVGContainer>
      );
    });

    it('should render seven 3-hr dividing lines', () => {
      const threeHrLines = withLinesWrapper.find(formatClassesAsSelector(styles.threeHrLine));
      expect(threeHrLines).to.have.length(7);
      threeHrLines.forEach((line, i) => {
        expect(line.is('line')).to.be.true;
        expect(line.prop('x1')).to.equal(xScale((i + 1) * (TWENTY_FOUR_HRS / 8)));
        expect(line.prop('x2')).to.equal(xScale((i + 1) * (TWENTY_FOUR_HRS / 8)));
      });
    });
  });
});
