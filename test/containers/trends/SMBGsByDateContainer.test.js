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

import { THREE_HRS } from '../../../src/utils/datetime';

import bgBounds from '../../helpers/bgBounds';
import * as scales from '../../helpers/scales';
const {
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;

import SMBGsByDateContainer
  from '../../../src/containers/trends/SMBGsByDateContainer';

describe('SMBGsByDateContainer', () => {
  let wrapper;

  const props = {
    bgBounds,
    data: [
      { id: '0', value: 120, msPer24: 0, localDate: '2016-08-28' },
      { id: '1', value: 90, msPer24: 9000000, localDate: '2016-08-28' },
      { id: '2', value: 180, msPer24: 21600000, localDate: '2016-08-28' },
    ],
    grouped: true,
    lines: true,
    focusedSmbg: {},
    focusSmbg: () => {},
    unfocusSmbg: () => {},
    xScale,
    yScale,
    smbgOpts: {
      maxR: 7.5,
      r: 6,
    },
    tooltipLeftThreshold: THREE_HRS * 6,
  };

  before(() => {
    wrapper = mount(<SMBGsByDateContainer {...props} />);
  });

  describe('when no data is provided', () => {
    let noDataWrapper;
    before(() => {
      const noDataProps = _.omit(props, 'data');
      noDataWrapper = mount(<SMBGsByDateContainer {...noDataProps} />);
    });

    it('should render nothing', () => {
      expect(noDataWrapper.find('#smbgsByDateContainer circle').length).to.equal(0);
      expect(noDataWrapper.find('#smbgsByDateContainer path').length).to.equal(0);
    });
  });

  describe('with data provided should render', () => {
    it('renders a <g> with id #smbgsByDateContainer', () => {
      expect(wrapper.find('#smbgsByDateContainer').length).to.equal(1);
    });
    describe('smbg day line', () => {
      it('is shown when lines option is true', () => {
        expect(wrapper.find('#smbgsByDateContainer path').length).to.equal(1);
      });
      it('is not shown when lines option is false', () => {
        props.lines = false;
        wrapper = mount(<SMBGsByDateContainer {...props} />);
        expect(wrapper.find('#smbgsByDateContainer path').length).to.equal(0);
      });
    });
    describe('focused smbg line', () => {
      it('is shown when lines option is false but we have a focusedSmbg', () => {
        props.lines = false;

        props.focusedSmbg = {
          dayPoints: props.data,
          smbgPosition: { top: 0, left: 0 },
          date: '2016-08-28',
          smbgDay: [{ value: 200 }],
          smbgPositions: [{ top: 0, left: 10 }, { top: 10, left: 50 }],
        };
        wrapper = mount(<SMBGsByDateContainer {...props} />);
        expect(wrapper.find('#smbgsByDateContainer path').length).to.equal(1);
      });
    });
    describe('smbg day points', () => {
      it('are shown', () => {
        expect(wrapper.find('#smbgsByDateContainer circle').length).to.equal(3);
      });
    });
  });
});
