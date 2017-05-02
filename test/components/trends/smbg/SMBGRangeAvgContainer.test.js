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

import { shallow } from 'enzyme';

import * as scales from '../../../helpers/scales';
const {
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import bgBounds from '../../../helpers/bgBounds';
import { THREE_HRS } from '../../../../src/utils/datetime';
import SMBGRangeAvgContainer
  from '../../../../src/components/trends/smbg/SMBGRangeAvgContainer';
import SMBGRangeAnimated
  from '../../../../src/components/trends/smbg/SMBGRangeAnimated';

describe('SMBGRangeAvgContainer', () => {
  let wrapper;

  // six-hour bins for testing
  const binSize = THREE_HRS * 2;

  const props = {
    bgBounds,
    binSize,
    data: [],
    smbgRangeOverlay: true,
    tooltipLeftThreshold: 0,
    xScale,
    yScale,
    smbgComponent: SMBGRangeAnimated,
  };

  before(() => {
    wrapper = shallow(<SMBGRangeAvgContainer {...props} />);
  });

  describe('componentWillMount', () => {
    it('sets mungedData in state', () => {
      sinon.spy(SMBGRangeAvgContainer.prototype, 'componentWillMount');
      sinon.spy(SMBGRangeAvgContainer.prototype, 'setState');
      expect(SMBGRangeAvgContainer.prototype.componentWillMount.callCount).to.equal(0);
      expect(SMBGRangeAvgContainer.prototype.setState.callCount).to.equal(0);
      shallow(<SMBGRangeAvgContainer {...props} />);
      expect(SMBGRangeAvgContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(SMBGRangeAvgContainer.prototype.setState.callCount).to.equal(1);
      expect(SMBGRangeAvgContainer.prototype.setState.firstCall.args[0])
        .to.deep.equal({ mungedData:
          [{
            id: '10800000',
            max: undefined,
            mean: undefined,
            min: undefined,
            msX: 10800000,
            msFrom: 0,
            msTo: 21600000,
          }, {
            id: '32400000',
            max: undefined,
            mean: undefined,
            min: undefined,
            msX: 32400000,
            msFrom: 21600000,
            msTo: 43200000,
          }, {
            id: '54000000',
            max: undefined,
            mean: undefined,
            min: undefined,
            msX: 54000000,
            msFrom: 43200000,
            msTo: 64800000,
          }, {
            id: '75600000',
            max: undefined,
            mean: undefined,
            min: undefined,
            msX: 75600000,
            msFrom: 64800000,
            msTo: 86400000,
          }],
      });
    });
  });

  describe('componentWillReceiveProps', () => {
    it('remunges data if binSize has changed', () => {
      const instance = wrapper.instance();
      sinon.spy(instance, 'mungeData');
      expect(instance.mungeData.callCount).to.equal(0);
      wrapper.setProps({ binSize: 1000 * 60 * 60 * 3 });
      expect(instance.mungeData.callCount).to.equal(1);
      instance.mungeData.restore();
    });

    it('remunges data if data has changed', () => {
      const instance = wrapper.instance();
      sinon.spy(instance, 'mungeData');
      expect(instance.mungeData.callCount).to.equal(0);
      wrapper.setProps({
        data: [
          { id: 'b1', msPer24: 0, value: 90 },
          { id: 'b2', msPer24: 9000000, value: 90 },
        ],
      });
      expect(instance.mungeData.callCount).to.equal(1);
      instance.mungeData.restore();
    });
  });

  describe('render', () => {
    it('renders a <g> with class smbgAggContainer', () => {
      expect(wrapper.find('.smbgAggContainer').length).to.equal(1);
    });
  });
});
