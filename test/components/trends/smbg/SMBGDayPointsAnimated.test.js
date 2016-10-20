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
import SMBGDayPointsAnimated from '../../../../src/components/trends/smbg/SMBGDayPointsAnimated';

describe('SMBGDayPointsAnimated', () => {
  let wrapper;
  const focusSmbg = sinon.spy();
  const unfocusSmbg = sinon.spy();
  const grouped = true;
  const focusedDay = [];
  const date = '2016-08-14';
  const data = [
    { id: '0', value: 120, msPer24: 0 },
    { id: '1', value: 90, msPer24: 9000000 },
    { id: '2', value: 180, msPer24: 21600000 },
  ];
  const smbgOpts = {
    maxR: 7.5,
    r: 6,
  };

  const props = {
    date,
    data,
    xScale,
    yScale,
    focusSmbg,
    unfocusSmbg,
    grouped,
    focusedDay,
    smbgOpts,
  };
  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <SMBGDayPointsAnimated {...props} />
      </SVGContainer>
    );
  });

  describe('when no data is provided', () => {
    let noDataWrapper;
    before(() => {
      const noDataProps = _.omit(props, 'data');

      noDataWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <SMBGDayPointsAnimated {...noDataProps} />
        </SVGContainer>
      );
    });

    it('should render nothing', () => {
      expect(noDataWrapper.find(`#smbgDayPoints-${date}`).length).to.equal(0);
    });
  });

  describe('when a data is provided', () => {
    it('should render a smbgDayPoints <circle>', () => {
      expect(wrapper.find(`#smbgDayPoints-${date} circle`).length).to.equal(3);
    });
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusSmbg.reset();
      props.unfocusSmbg.reset();
    });

    it('should call focusSmbg on mouseover of smbg circle', () => {
      const smbgCircle = wrapper
        .find(`#smbg-${data[0].id}`);
      expect(focusSmbg.callCount).to.equal(0);
      smbgCircle.simulate('mouseover');
      expect(focusSmbg.args[0][0]).to.deep.equal(data[0]);
      expect(focusSmbg.callCount).to.equal(1);
    });

    it('should call unfocusSmbg on mouseout of smbg circle', () => {
      const smbgCircle = wrapper
        .find(`#smbg-${data[0].id}`);
      expect(unfocusSmbg.callCount).to.equal(0);
      smbgCircle.simulate('mouseout');
      expect(unfocusSmbg.callCount).to.equal(1);
    });
  });
});
