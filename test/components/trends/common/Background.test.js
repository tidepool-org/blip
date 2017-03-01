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

import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import SVGContainer from '../../../helpers/SVGContainer';

import { TWENTY_FOUR_HRS } from '../../../../src/utils/datetime';

import Background
  from '../../../../src/components/trends/common/Background';
import styles
  from '../../../../src/components/trends/common/Background.css';

describe('Background', () => {
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
        <Background {...props} />
      </SVGContainer>
    );
  });

  it('should render one rect for the chart background', () => {
    expect(wrapper.find('rect').length).to.equal(1);
    expect(wrapper.find('rect').hasClass((styles.background))).to.be.true;
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
          <Background {...props} linesAtThreeHrs />
        </SVGContainer>
      );
    });

    it('should render seven 3-hr dividing lines', () => {
      const threeHrLines = withLinesWrapper.find(formatClassesAsSelector(styles.threeHrLine));
      expect(threeHrLines).to.have.length(7);
      // Enzyme forEach cannot be replaced by _.forEach
      // eslint-disable-next-line lodash/prefer-lodash-method
      threeHrLines.forEach((line, i) => {
        expect(line.is('line')).to.be.true;
        expect(line.prop('x1')).to.equal(xScale((i + 1) * (TWENTY_FOUR_HRS / 8)));
        expect(line.prop('x2')).to.equal(xScale((i + 1) * (TWENTY_FOUR_HRS / 8)));
      });
    });
  });
});
