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
  trendsWidth: width,
  trendsHeight: height,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;

import CBGSlicesAnimationContainer
  from '../../../src/containers/trends/CBGSlicesAnimationContainer';

describe('CBGSlicesAnimationContainer', () => {
  let wrapper;

  // six-hour bins for testing
  const binSize = 1000 * 60 * 60 * 6;

  const props = {
    binSize,
    data: [],
    focusSlice: () => {},
    margins: { top: 0, left: 0, bottom: 0, right: 0 },
    svgDimensions: { width, height },
    unfocusSlice: () => {},
    xScale,
    yScale,
  };

  before(() => {
    wrapper = mount(<CBGSlicesAnimationContainer {...props} />);
  });

  describe('componentWillMount', () => {
    it('sets mungedData in state', () => {
      sinon.spy(CBGSlicesAnimationContainer.prototype, 'componentWillMount');
      sinon.spy(CBGSlicesAnimationContainer.prototype, 'setState');
      expect(CBGSlicesAnimationContainer.prototype.componentWillMount.callCount).to.equal(0);
      expect(CBGSlicesAnimationContainer.prototype.setState.callCount).to.equal(0);
      mount(<CBGSlicesAnimationContainer {...props} />);
      expect(CBGSlicesAnimationContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(CBGSlicesAnimationContainer.prototype.setState.callCount).to.equal(1);
      expect(CBGSlicesAnimationContainer.prototype.setState.firstCall.args[0])
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
      wrapper.setProps({ data: [{ msPer24: 0, value: 90 }] });
      expect(instance.mungeData.callCount).to.equal(1);
      instance.mungeData.restore();
    });
  });
});
