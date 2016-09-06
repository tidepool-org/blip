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

import { TrendsSVGContainer } from '../../../src/containers/trends/TrendsSVGContainer';

import BackgroundWithTargetRange
  from '../../../src/components/trends/common/BackgroundWithTargetRange';
import XAxisLabels from '../../../src/components/trends/common/XAxisLabels';
import XAxisTicks from '../../../src/components/trends/common/XAxisTicks';
import YAxisLabelsAndTicks from '../../../src/components/trends/common/YAxisLabelsAndTicks';
import CBGSlicesAnimationContainer
  from '../../../src/containers/trends/CBGSlicesAnimationContainer';
import TargetRangeLines from '../../../src/components/trends/common/TargetRangeLines';

function makeScale(scale) {
  // eslint-disable-next-line no-param-reassign
  scale.range = sinon.stub().returns([0, 10]);
  return scale;
}

describe('TrendsSVGContainer', () => {
  const props = {
    bgBounds: {
      veryHighThreshold: 300,
      targetUpperBound: 180,
      targetLowerBound: 80,
      veryLowThreshold: 60,
    },
    bgUnits: 'mg/dL',
    // normally provided by react-dimensions wrapper but we test w/o that
    containerHeight: 520,
    // normally provided by react-dimensions wrapper but we test w/o that
    containerWidth: 960,
    data: [],
    focusSlice: () => {},
    showingCbg: true,
    showingSmbg: false,
    timezone: 'UTC',
    unfocusSlice: () => {},
    xScale: makeScale(() => {}),
    yScale: makeScale(() => {}),
  };

  afterEach(() => {
    props.xScale.range.reset();
    props.yScale.range.reset();
  });

  describe('componentWillMount', () => {
    it('should set the range of the xScale', () => {
      sinon.spy(TrendsSVGContainer.prototype, 'componentWillMount');
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(0);
      mount(<TrendsSVGContainer {...props} />);
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(props.xScale.range.callCount).to.equal(3);
      expect(props.xScale.range.firstCall.args[0]).to.deep.equal([48, 942]);
      // called twice as getter in TargetRangeLines
      expect(props.xScale.range.secondCall.args[0]).to.be.undefined;
      expect(props.xScale.range.thirdCall.args[0]).to.be.undefined;
      TrendsSVGContainer.prototype.componentWillMount.restore();
    });

    it('should set the range of the yScale', () => {
      sinon.spy(TrendsSVGContainer.prototype, 'componentWillMount');
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(0);
      mount(<TrendsSVGContainer {...props} />);
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(props.yScale.range.callCount).to.equal(1);
      expect(props.yScale.range.firstCall.args[0]).to.deep.equal([480, 80]);
      TrendsSVGContainer.prototype.componentWillMount.restore();
    });
  });

  describe('render', () => {
    let wrapper;
    before(() => {
      wrapper = mount(<TrendsSVGContainer {...props} />);
    });

    it('should render a BackgroundWithTargetRange', () => {
      expect(wrapper.find(BackgroundWithTargetRange)).to.have.length(1);
    });

    it('should render a XAxisLabels', () => {
      expect(wrapper.find(XAxisLabels)).to.have.length(1);
    });

    it('should render a XAxisTicks', () => {
      expect(wrapper.find(XAxisTicks)).to.have.length(1);
    });

    it('should render a YAxisLabelsAndTicks', () => {
      expect(wrapper.find(YAxisLabelsAndTicks)).to.have.length(1);
    });

    it('should render a CBGSlicesAnimationContainer', () => {
      expect(wrapper.find(CBGSlicesAnimationContainer)).to.have.length(1);
    });

    it('should render a TargetRangeLines', () => {
      expect(wrapper.find(TargetRangeLines)).to.have.length(1);
    });

    it('should render the TargetRangeLines on top', () => {
      expect(wrapper.children().last().is(TargetRangeLines)).to.be.true;
    });
  });
});
