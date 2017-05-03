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
  trendsYScale: yScale,
} = scales.trends;
import bgBounds from '../../../helpers/bgBounds';
import SVGContainer from '../../../helpers/SVGContainer';

import { MGDL_UNITS } from '../../../../src/utils/constants';
import YAxisLabelsAndTicks from '../../../../src/components/trends/common/YAxisLabelsAndTicks';

describe('YAxisLabelsAndTicks', () => {
  let wrapper;
  const props = {
    bgPrefs: {
      bgBounds,
      bgUnits: MGDL_UNITS,
    },
    margins: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    yScale,
  };

  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <YAxisLabelsAndTicks {...props} />
      </SVGContainer>
    );
  });

  it('should render three tick lines and three text labels', () => {
    const lines = wrapper.find('line');
    expect(lines).to.have.length(4);
    expect(lines.at(0).prop('y1')).to.equal(yScale(props.bgPrefs.bgBounds.targetLowerBound));
    expect(lines.at(0).prop('y2')).to.equal(yScale(props.bgPrefs.bgBounds.targetLowerBound));
    expect(lines.at(1).prop('y1')).to.equal(yScale(props.bgPrefs.bgBounds.targetUpperBound));
    expect(lines.at(1).prop('y2')).to.equal(yScale(props.bgPrefs.bgBounds.targetUpperBound));
    expect(lines.at(2).prop('y1')).to.equal(yScale(props.bgPrefs.bgBounds.veryHighThreshold));
    expect(lines.at(2).prop('y2')).to.equal(yScale(props.bgPrefs.bgBounds.veryHighThreshold));
    expect(lines.at(3).prop('y1')).to.equal(yScale(props.bgPrefs.bgBounds.veryLowThreshold));
    expect(lines.at(3).prop('y2')).to.equal(yScale(props.bgPrefs.bgBounds.veryLowThreshold));
    const labels = wrapper.find('text');
    expect(labels).to.have.length(4);
    expect(labels.at(0).prop('y')).to.equal(yScale(props.bgPrefs.bgBounds.targetLowerBound));
    expect(labels.at(1).prop('y')).to.equal(yScale(props.bgPrefs.bgBounds.targetUpperBound));
    expect(labels.at(2).prop('y')).to.equal(yScale(props.bgPrefs.bgBounds.veryHighThreshold));
    expect(labels.at(3).prop('y')).to.equal(yScale(props.bgPrefs.bgBounds.veryLowThreshold));
  });
});
