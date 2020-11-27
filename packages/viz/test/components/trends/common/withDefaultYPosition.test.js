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
import { shallow } from 'enzyme';

import bgBounds from '../../../helpers/bgBounds';
import DummyComponent from '../../../helpers/DummyComponent';
import * as scales from '../../../helpers/scales';
const {
  trendsYScale: yScale,
} = scales.trends;

import withDefaultYPosition from '../../../../src/components/trends/common/withDefaultYPosition';

describe('withDefaultYPosition', () => {
  const props = {
    bgBounds,
    yScale,
    foo: 'bar',
  };
  const ToRender = withDefaultYPosition(DummyComponent);
  let wrapper;
  before(() => {
    wrapper = shallow(<ToRender {...props} />);
  });

  it('should render the DummyComponent with an additional defaultY prop', () => {
    const dummy = wrapper.find(DummyComponent);
    expect(dummy.length).to.equal(1);
    const { targetLowerBound, targetUpperBound } = bgBounds;
    expect(dummy.prop('defaultY'))
      .to.equal(yScale(targetUpperBound - (targetUpperBound - targetLowerBound) / 2));
  });

  it('should also pass through all other props', () => {
    const dummy = wrapper.find(DummyComponent);
    expect(dummy.prop('bgBounds')).to.deep.equal(bgBounds);
    expect(dummy.prop('yScale')).to.equal(yScale);
    expect(dummy.prop('foo')).to.equal('bar');
  });
});
