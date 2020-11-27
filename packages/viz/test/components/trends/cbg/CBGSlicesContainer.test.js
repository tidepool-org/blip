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

import _ from 'lodash';
import React from 'react';

import { mount } from 'enzyme';

import * as scales from '../../../helpers/scales';
const {
  trendsWidth: width,
  trendsHeight: height,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import bgBounds from '../../../helpers/bgBounds';

import { THREE_HRS, TWENTY_FOUR_HRS } from '../../../../src/utils/datetime';
import CBGSlicesContainer
  from '../../../../src/components/trends/cbg/CBGSlicesContainer';
import CBGSliceAnimated from '../../../../src/components/trends/cbg/CBGSliceAnimated';

describe('CBGSlicesContainer', () => {
  let wrapper;

  // six-hour bins for testing
  const binSize = THREE_HRS * 2;

  const props = {
    bgBounds,
    binSize,
    data: [],
    displayFlags: {},
    margins: { top: 0, left: 0, bottom: 0, right: 0 },
    svgDimensions: { width, height },
    tooltipLeftThreshold: 0,
    xScale,
    yScale,
  };

  before(() => {
    wrapper = mount(<CBGSlicesContainer {...props} />);
  });

  describe('componentWillMount', () => {
    it('sets mungedData in state', () => {
      sinon.spy(CBGSlicesContainer.prototype, 'UNSAFE_componentWillMount');
      sinon.spy(CBGSlicesContainer.prototype, 'setState');
      expect(CBGSlicesContainer.prototype.UNSAFE_componentWillMount.callCount).to.equal(0);
      expect(CBGSlicesContainer.prototype.setState.callCount).to.equal(0);
      mount(<CBGSlicesContainer {...props} />);
      expect(CBGSlicesContainer.prototype.UNSAFE_componentWillMount.callCount).to.equal(1);
      expect(CBGSlicesContainer.prototype.setState.callCount).to.equal(1);
      const undefineds = {
        firstQuartile: undefined,
        max: undefined,
        median: undefined,
        min: undefined,
        ninetiethQuantile: undefined,
        tenthQuantile: undefined,
        thirdQuartile: undefined,
      };
      expect(CBGSlicesContainer.prototype.setState.firstCall.args[0])
        .to.deep.equal({ mungedData: [
          _.assign({ id: '10800000', msFrom: 0, msTo: 21600000, msX: 10800000 }, undefineds),
          _.assign({ id: '32400000', msFrom: 21600000, msTo: 43200000, msX: 32400000 }, undefineds),
          _.assign({ id: '54000000', msFrom: 43200000, msTo: 64800000, msX: 54000000 }, undefineds),
          _.assign({ id: '75600000', msFrom: 64800000, msTo: 86400000, msX: 75600000 }, undefineds),
        ] });
    });
  });

  describe('componentWillReceiveProps', () => {
    it('remunges data if binSize has changed', () => {
      const instance = wrapper.instance();
      sinon.spy(instance, 'mungeData');
      expect(instance.mungeData.callCount).to.equal(0);
      wrapper.setProps({ binSize: THREE_HRS });
      expect(instance.mungeData.callCount).to.equal(1);
      instance.mungeData.restore();
    });

    it('remunges data if data has changed', () => {
      const instance = wrapper.instance();
      sinon.spy(instance, 'mungeData');
      expect(instance.mungeData.callCount).to.equal(0);
      wrapper.setProps({ data: [{ id: 'a2b3c4', msPer24: 6000, value: 180 }] });
      expect(instance.mungeData.callCount).to.equal(1);
      instance.mungeData.restore();
    });
  });

  describe('render', () => {
    it('should render proper number of CBGSliceAnimated components for the `binSize`', () => {
      expect(wrapper.find(CBGSliceAnimated).length)
        .to.equal(TWENTY_FOUR_HRS / wrapper.prop('binSize'));
    });
  });
});
