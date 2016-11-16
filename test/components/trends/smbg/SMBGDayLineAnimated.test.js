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

import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;

import SVGContainer from '../../../helpers/SVGContainer';
import SMBGDayLineAnimated from '../../../../src/components/trends/smbg/SMBGDayLineAnimated';

describe('SMBGDayLineAnimated', () => {
  let wrapper;
  const focusLine = sinon.spy();
  const unfocusLine = sinon.spy();
  const onSelectDay = sinon.spy();
  const grouped = true;
  const focusedDay = [];
  const date = '2016-08-14';
  const data = [
    { id: '0', value: 120, msPer24: 0 },
    { id: '1', value: 90, msPer24: 9000000 },
    { id: '2', value: 180, msPer24: 21600000 },
  ];

  const props = {
    date,
    data,
    xScale,
    yScale,
    focusLine,
    unfocusLine,
    grouped,
    focusedDay,
    onSelectDay,
  };
  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <SMBGDayLineAnimated {...props} />
      </SVGContainer>
    );
  });

  describe('when no data is provided', () => {
    let noDataWrapper;
    before(() => {
      const noDataProps = _.omit(props, 'data');

      noDataWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <SMBGDayLineAnimated {...noDataProps} />
        </SVGContainer>
      );
    });

    it('should render nothing', () => {
      expect(noDataWrapper.find(`#smbgDayLine-${date}`).length).to.equal(0);
    });
  });

  describe('when a data is provided', () => {
    it('should render a smbgDayLine <path>', () => {
      expect(wrapper.find(`#smbgDayLine-${date} path`).length).to.equal(1);
    });
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusLine.reset();
      props.unfocusLine.reset();
    });

    it('should call focusLine on mouseover of smbg line', () => {
      const smbgDayLine = wrapper
        .find(`#smbgDayLine-${date} path`);
      expect(focusLine.callCount).to.equal(0);
      smbgDayLine.simulate('mouseover');
      expect(focusLine.callCount).to.equal(1);
    });

    it('should call unfocusLine on mouseout of smbg line', () => {
      const smbgDayLine = wrapper
        .find(`#smbgDayLine-${date} path`);
      expect(unfocusLine.callCount).to.equal(0);
      smbgDayLine.simulate('mouseout');
      expect(unfocusLine.callCount).to.equal(1);
    });

    it('should call onSelectDay on double click of smbg line', () => {
      const smbgDayLine = wrapper
        .find(`#smbgDayLine-${date} path`);
      expect(onSelectDay.callCount).to.equal(0);
      smbgDayLine.simulate('doubleClick');
      expect(onSelectDay.callCount).to.equal(1);
    });
  });
});
