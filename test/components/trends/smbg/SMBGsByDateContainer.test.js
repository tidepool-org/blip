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

import { shallow } from 'enzyme';

import { THREE_HRS } from '../../../../src/utils/datetime';

import bgBounds from '../../../helpers/bgBounds';
import * as scales from '../../../helpers/scales';
const {
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;

import SMBGDateLineAnimated from '../../../../src/components/trends/smbg/SMBGDateLineAnimated';
import SMBGDatePointsAnimated from '../../../../src/components/trends/smbg/SMBGDatePointsAnimated';

import SMBGsByDateContainer
  from '../../../../src/components/trends/smbg/SMBGsByDateContainer';

describe('SMBGsByDateContainer', () => {
  let wrapper;

  const props = {
    bgBounds,
    data: [
      { id: '0', value: 120, msPer24: 0, localDate: '2016-08-28' },
      { id: '1', value: 90, msPer24: 9000000, localDate: '2016-08-28' },
      { id: '2', value: 180, msPer24: 21600000, localDate: '2016-08-28' },
    ],
    dates: ['2016-08-28'],
    focusedSmbg: {},
    grouped: true,
    lines: true,
    smbgOpts: {
      maxR: 7.5,
      r: 6,
    },
    tooltipLeftThreshold: THREE_HRS * 6,
    xScale,
    yScale,
  };

  before(() => {
    wrapper = shallow(<SMBGsByDateContainer {...props} />);
  });

  describe('when data is provided', () => {
    it('should render an SMBGLineAnimated for each date in dates', () => {
      expect(wrapper.find(SMBGDateLineAnimated).length).to.equal(props.dates.length);
    });

    it('should render an SMBGDatePointsAnimated for each date in dates', () => {
      expect(wrapper.find(SMBGDatePointsAnimated).length).to.equal(props.dates.length);
    });
  });

  describe('when no data is provided', () => {
    let noDataWrapper;
    before(() => {
      const noDataProps = _.assign({}, props, { data: [] });
      noDataWrapper = shallow(<SMBGsByDateContainer {...noDataProps} />);
    });

    it('should (still) render an SMBGLineAnimated for each date in dates', () => {
      expect(noDataWrapper.find(SMBGDateLineAnimated).length).to.equal(props.dates.length);
    });

    it('should (still) render an SMBGDatePointsAnimated for each date in dates', () => {
      expect(noDataWrapper.find(SMBGDatePointsAnimated).length).to.equal(props.dates.length);
    });
  });
});
