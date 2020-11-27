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
import { TransitionMotion } from 'react-motion';

import { mount } from 'enzyme';

import bgBounds from '../../../helpers/bgBounds';
import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;

import SVGContainer from '../../../helpers/SVGContainer';
import { SMBGDateLineAnimated } from '../../../../src/components/trends/smbg/SMBGDateLineAnimated';

describe('SMBGDateLineAnimated', () => {
  let wrapper;
  const focusLine = sinon.spy();
  const unfocusLine = sinon.spy();
  const onSelectDate = sinon.spy();
  const grouped = true;
  const focusedDay = [];
  const date = '2016-08-14';
  const data = [
    { id: '0', value: 120, msPer24: 0 },
    { id: '1', value: 90, msPer24: 9000000 },
    { id: '2', value: 180, msPer24: 21600000 },
  ];

  const props = {
    bgBounds,
    date,
    data,
    focusedDay,
    focusLine,
    grouped,
    onSelectDate,
    unfocusLine,
    xScale,
    yScale,
  };

  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <SMBGDateLineAnimated {...props} />
      </SVGContainer>
    );
  });

  describe('when an empty array of data is provided', () => {
    let noDataWrapper;
    before(() => {
      const noDataProps = _.omit(props, 'data');

      noDataWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <SMBGDateLineAnimated {...noDataProps} />
        </SVGContainer>
      );
    });

    it('should render a TransitionMotion component but no <path>', () => {
      expect(noDataWrapper.find(`#smbgDateLine-${date}`).length).to.equal(1);
      expect(noDataWrapper.find(TransitionMotion).length).to.equal(1);
      expect(noDataWrapper.find('path').length).to.equal(0);
    });
  });

  describe('when a data is provided', () => {
    it('should render a smbgDateLine <path>', () => {
      expect(wrapper.find(`#smbgDateLine-${date} path`).length).to.equal(1);
    });
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusLine.resetHistory();
      props.unfocusLine.resetHistory();
    });

    it('should call focusLine on mouseover of smbg line', () => {
      const smbgDateLine = wrapper
        .find(`#smbgDateLine-${date} path`);
      expect(focusLine.callCount).to.equal(0);
      smbgDateLine.simulate('mouseover');
      expect(focusLine.callCount).to.equal(1);
    });

    it('should call unfocusLine on mouseout of smbg line', () => {
      const smbgDateLine = wrapper
        .find(`#smbgDateLine-${date} path`);
      expect(unfocusLine.callCount).to.equal(0);
      smbgDateLine.simulate('mouseout');
      expect(unfocusLine.callCount).to.equal(1);
    });

    it('should call onSelectDate on click of smbg line', () => {
      const smbgDateLine = wrapper
        .find(`#smbgDateLine-${date} path`);
      expect(onSelectDate.callCount).to.equal(0);
      smbgDateLine.simulate('click');
      expect(onSelectDate.callCount).to.equal(1);
    });
  });
});
