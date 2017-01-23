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

import FocusedCBGSliceSegment from '../../../../src/components/trends/cbg/FocusedCBGSliceSegment';

describe('FocusedCBGSliceSegment', () => {
  const focusedSlice = {
    position: {
      left: 10,
      yPositions: {
        ninetiethQuantile: 90,
        thirdQuartile: 75,
      },
    },
  };
  const focusedSliceKeys = ['thirdQuartile', 'ninetiethQuantile'];

  it('renders nothing if there\'s no `focusedSlice` in props', () => {
    const wrapper = shallow(<FocusedCBGSliceSegment focusedSliceKeys={focusedSliceKeys} />);
    expect(wrapper.html()).to.be.null;
  });

  it('renders nothing if there\'s no `focusedSliceKeys` in props', () => {
    const wrapper = shallow(<FocusedCBGSliceSegment focusedSlice={focusedSlice} />);
    expect(wrapper.html()).to.be.null;
  });

  it('renders a single rect when `focusedSlice` and `focusedSliceKeys`', () => {
    const props = { focusedSlice, focusedSliceKeys };
    const wrapper = shallow(<FocusedCBGSliceSegment {...props} />);
    expect(wrapper.find('rect').length).to.equal(1);
  });
});
