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

import { shallow } from 'enzyme';

import { TrendsSVGContainer } from '../../../src/containers/trends/TrendsSVGContainer';

import { MGDL_UNITS } from '../../../src/utils/constants';
import BackgroundWithTargetRange
  from '../../../src/components/trends/common/BackgroundWithTargetRange';
import CBGSlicesContainer
  from '../../../src/containers/trends/CBGSlicesContainer';
import SMBGRangeAvgAnimationContainer
  from '../../../src/containers/trends/SMBGRangeAvgAnimationContainer';
import NoData from '../../../src/components/trends/common/NoData';
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
    cbgData: [{ id: 'a2b3c4', msPer24: 6000, value: 180 }],
    smbgData: [{ id: 'a2b3c4', localDate: '2016-07-04', msPer24: 6000, value: 180 }],
    displayFlags: {
      cbg100Enabled: false,
      cbg80Enabled: true,
      cbg50Enabled: true,
      cbgMedianEnabled: true,
    },
    focusRange: () => {},
    focusSlice: () => {},
    focusSmbg: () => {},
    onSelectDay: () => {},
    showingCbg: true,
    showingSmbg: false,
    smbgGrouped: true,
    smbgLines: true,
    smbgRangeOverlay: true,
    timezone: 'UTC',
    unfocusRange: () => {},
    unfocusSlice: () => {},
    unfocusSmbg: () => {},
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
      shallow(<TrendsSVGContainer {...props} />);
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(props.xScale.range.callCount).to.equal(1);
      expect(props.xScale.range.firstCall.args[0]).to.deep.equal([48, 942]);
      TrendsSVGContainer.prototype.componentWillMount.restore();
    });

    it('should set the range of the yScale', () => {
      sinon.spy(TrendsSVGContainer.prototype, 'componentWillMount');
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(0);
      shallow(<TrendsSVGContainer {...props} />);
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(props.yScale.range.callCount).to.equal(1);
      expect(props.yScale.range.firstCall.args[0]).to.deep.equal([480, 80]);
      TrendsSVGContainer.prototype.componentWillMount.restore();
    });
  });

  describe('render', () => {
    let wrapper;
    before(() => {
      wrapper = shallow(<TrendsSVGContainer {...props} />);
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

    it('should render a CBGSlicesContainer', () => {
      expect(wrapper.find(CBGSlicesContainer)).to.have.length(1);
    });

    it('should render a TargetRangeLines', () => {
      expect(wrapper.find(TargetRangeLines)).to.have.length(1);
    });

    it('should render the TargetRangeLines on top', () => {
      expect(wrapper.children().last().is(TargetRangeLines)).to.be.true;
    });

    describe('showing CGM data', () => {
      it('should render a CBGSlicesContainer', () => {
        expect(wrapper.find(CBGSlicesContainer)).to.have.length(1);
      });

      describe('when showingSmbg is false', () => {
        it('should not render an SMBGRangeAvgAnimationContainer', () => {
          expect(wrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(0);
        });
      });

      it('should render a no data message when there are no cbg values', () => {
        const noCBGDataProps = _.assign({}, props, { cbgData: [] });
        const noDataWrapper = shallow(<TrendsSVGContainer {...noCBGDataProps} />);
        expect(noDataWrapper.find(NoData)).to.have.length(1);
        expect(noDataWrapper.find(NoData).prop('dataType')).to.equal('cbg');
      });
    });

    describe('showing BGM data', () => {
      describe('when smbgRangeOverlay is true', () => {
        it('should render an SMBGRangeAvgAnimationContainer each for average and range', () => {
          const smbgRangeProps = _.assign(
            {}, props, { showingSmbg: true, smbgRangeOverlay: true }
          );
          const smbgRangeWrapper = shallow(<TrendsSVGContainer {...smbgRangeProps} />);
          expect(smbgRangeWrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(2);
        });
      });

      describe('when smbgRangeOverlay is false', () => {
        it('should not render an SMBGRangeAvgAnimationContainer', () => {
          const smbgRangeProps = _.assign(
            {}, props, { showingSmbg: true, smbgRangeOverlay: false }
          );
          const smbgRangeWrapper = shallow(<TrendsSVGContainer {...smbgRangeProps} />);
          expect(smbgRangeWrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(0);
        });
      });

      describe('when showingCbg is false', () => {
        it('should not render a CBGSlicesContainer', () => {
          const noCbgProps = _.assign({}, props, { showingCbg: false, showingSmbg: true });
          const noCbgWrapper = shallow(<TrendsSVGContainer {...noCbgProps} />);
          expect(noCbgWrapper.find(CBGSlicesContainer)).to.have.length(0);
          expect(noCbgWrapper.find(SMBGRangeAvgAnimationContainer)).to.have.length(2);
        });
      });

      it('should render a no data message when there are no smbg values', () => {
        const noSMBGDataProps = _.assign(
          {}, props, { showingCbg: false, showingSmbg: true, smbgData: [] }
        );
        const noDataWrapper = shallow(<TrendsSVGContainer {...noSMBGDataProps} />);
        expect(noDataWrapper.find(NoData)).to.have.length(1);
        expect(noDataWrapper.find(NoData).prop('dataType')).to.equal('smbg');
      });
    });
  });
});
