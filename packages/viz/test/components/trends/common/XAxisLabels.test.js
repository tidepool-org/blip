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

import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
} = scales.trends;
import SVGContainer from '../../../helpers/SVGContainer';

import { TWENTY_FOUR_HRS } from '../../../../src/utils/datetime';

import XAxisLabels from '../../../../src/components/trends/common/XAxisLabels';

describe('XAxisLabels', () => {
  let wrapper;
  const props = {
    margins: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    xOffset: 0,
    xScale,
  };

  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <XAxisLabels {...props} />
      </SVGContainer>
    );
  });

  it('should render eight text labels at three hour intervals', () => {
    const labels = wrapper.find('text');
    expect(labels).to.have.length(8);
    // Enzyme forEach cannot be replaced by _.forEach
    // eslint-disable-next-line lodash/prefer-lodash-method
    labels.forEach((label, i) => {
      expect(label.prop('x')).to.equal(xScale(i * (TWENTY_FOUR_HRS / 8)));
    });
  });
});
