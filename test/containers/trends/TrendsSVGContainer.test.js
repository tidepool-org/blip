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

import { TrendsSVGContainer } from '../../../src/containers/trends/TrendsSVGContainer';

import { MGDL_UNITS } from '../../../src/utils/constants';
import BackgroundWithTargetRange
  from '../../../src/components/trends/common/BackgroundWithTargetRange';
import CBGSlicesAnimationContainer
  from '../../../src/containers/trends/CBGSlicesAnimationContainer';
import SMBGRangeAvgAnimationContainer
  from '../../../src/containers/trends/SMBGRangeAvgAnimationContainer';
import TargetRangeLines from '../../../src/components/trends/common/TargetRangeLines';
import XAxisLabels from '../../../src/components/trends/common/XAxisLabels';
import XAxisTicks from '../../../src/components/trends/common/XAxisTicks';
import YAxisLabelsAndTicks from '../../../src/components/trends/common/YAxisLabelsAndTicks';

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
    bgUnits: MGDL_UNITS,
    // normally provided by react-dimensions wrapper but we test w/o that
    containerHeight: 520,
    // normally provided by react-dimensions wrapper but we test w/o that
    containerWidth: 960,
    cbgData: [],
    smbgData: [],
    focusRange: () => {},
    focusSlice: () => {},
    showingCbg: true,
    showingSmbg: false,
    smbgRangeOverlay: true,
    timezone: 'UTC',
    unfocusRange: () => {},
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

    describe('showing CGM data', () => {
      it('should render a CBGSlicesAnimationContainer', () => {
        expect(wrapper.find(CBGSlicesAnimationContainer)).to.have.length(1);
      });

      describe('when showingSmbg is false', () => {
        it('should not render an SMBGRangeAvgAnimationContainer', () => {
          expect(wrapper.prop('showingSmbg')).to.be.false;
          expect(wrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(0);
        });
      });
    });

    describe('showing BGM data', () => {
      describe('when smbgRangeOverlay is true', () => {
        it('should render an SMBGRangeAvgAnimationContainer for average and range', () => {
          const smbgRangeProps = _.assign(
            {}, props, { showingSmbg: true, smbgRangeOverlay: true }
          );
          const smbgRangeWrapper = mount(<TrendsSVGContainer {...smbgRangeProps} />);
          expect(smbgRangeWrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(2);
        });
      });

      describe('when smbgRangeOverlay is false', () => {
        it('should not render an SMBGRangeAvgAnimationContainer', () => {
          const smbgRangeProps = _.assign(
            {}, props, { showingSmbg: true, smbgRangeOverlay: false }
          );
          const smbgRangeWrapper = mount(<TrendsSVGContainer {...smbgRangeProps} />);
          expect(smbgRangeWrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(0);
        });
      });

      describe('when showingCbg is false', () => {
        it('should not render a CBGSlicesAnimationContainer', () => {
          const noCbgProps = _.assign({}, props, { showingCbg: false, showingSmbg: true });
          const noCbgWrapper = mount(<TrendsSVGContainer {...noCbgProps} />);
          expect(noCbgWrapper.prop('showingCbg')).to.be.false;
          expect(noCbgWrapper.find(CBGSlicesAnimationContainer)).to.have.length(0);
          expect(noCbgWrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(2);
        });
      });
    });
  });
});
