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

import * as scales from '../../helpers/scales';
const {
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;

import SMBGRangeAvgAnimationContainer
  from '../../../src/containers/trends/SMBGRangeAvgAnimationContainer';

describe('SMBGRangeAvgAnimationContainer', () => {
  let wrapper;

  // six-hour bins for testing
  const binSize = 1000 * 60 * 60 * 6;

  const props = {
    binSize,
    data: [],
    focusRange: () => {},
    smbgRangeOverlay: true,
    tooltipLeftThreshold: 0,
    unfocusRange: () => {},
    xScale,
    yScale,
  };

  before(() => {
    wrapper = mount(<SMBGRangeAvgAnimationContainer {...props} />);
  });

  describe('componentWillMount', () => {
    it('sets mungedData in state', () => {
      sinon.spy(SMBGRangeAvgAnimationContainer.prototype, 'componentWillMount');
      sinon.spy(SMBGRangeAvgAnimationContainer.prototype, 'setState');
      expect(SMBGRangeAvgAnimationContainer.prototype.componentWillMount.callCount).to.equal(0);
      expect(SMBGRangeAvgAnimationContainer.prototype.setState.callCount).to.equal(0);
      mount(<SMBGRangeAvgAnimationContainer {...props} />);
      expect(SMBGRangeAvgAnimationContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(SMBGRangeAvgAnimationContainer.prototype.setState.callCount).to.equal(1);
      expect(SMBGRangeAvgAnimationContainer.prototype.setState.firstCall.args[0])
        .to.deep.equal({ mungedData: [] });
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
      wrapper.setProps({ data: [{ id: 'a1b2c3', msPer24: 0, value: 90 }] });
      expect(instance.mungeData.callCount).to.equal(1);
      instance.mungeData.restore();
    });
  });

  describe('render', () => {
    it('renders a <g> with id #smbgRangeAvgAnimationContainer', () => {
      expect(wrapper.find('#smbgRangeAvgAnimationContainer').length).to.equal(1);
    });
  });
});
