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

import bgBounds from '../../../helpers/bgBounds';

import { TrendsSVGContainer } from '../../../../src/components/trends/common/TrendsSVGContainer';

import { MGDL_UNITS } from '../../../../src/utils/constants';
import Background
  from '../../../../src/components/trends/common/Background';
import CBGSlicesContainer
  from '../../../../src/components/trends/cbg/CBGSlicesContainer';
import SMBGRangeAvgContainer
  from '../../../../src/components/trends/smbg/SMBGRangeAvgContainer';
import NoData from '../../../../src/components/trends/common/NoData';
import TargetRangeLines from '../../../../src/components/trends/common/TargetRangeLines';
import XAxisLabels from '../../../../src/components/trends/common/XAxisLabels';
import XAxisTicks from '../../../../src/components/trends/common/XAxisTicks';
import YAxisLabelsAndTicks from '../../../../src/components/trends/common/YAxisLabelsAndTicks';

function makeScale(scale) {
  // eslint-disable-next-line no-param-reassign
  scale.range = sinon.stub().returns([0, 10]);
  return scale;
}

describe('TrendsSVGContainer', () => {
  const props = {
    activeDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    bgPrefs: {
      bgBounds,
      bgUnits: MGDL_UNITS,
    },
    // normally provided by react-sizeme wrapper but we test w/o that
    size: {
      width: 960,
      height: 520,
    },
    dates: [],
    cbgData: [{ id: 'a2b3c4', localDate: '2017-01-01', msPer24: 6000, value: 180 }],
    smbgData: [{ id: 'a2b3c4', localDate: '2016-07-04', msPer24: 6000, value: 180 }],
    displayFlags: {
      cbg100Enabled: false,
      cbg80Enabled: true,
      cbg50Enabled: true,
      cbgMedianEnabled: true,
    },
    onSelectDate: () => {},
    showingCbg: true,
    showingCbgDateTraces: false,
    showingSmbg: false,
    smbgGrouped: true,
    smbgLines: true,
    smbgRangeOverlay: true,
    timezone: 'UTC',
    xScale: makeScale(() => {}),
    yScale: makeScale(() => {}),
  };

  afterEach(() => {
    props.xScale.range.resetHistory();
    props.yScale.range.resetHistory();
  });

  describe('setScales', () => {
    it('should set the range of the xScale', () => {
      sinon.spy(TrendsSVGContainer.prototype, 'setScales');
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(0);
      shallow(<TrendsSVGContainer {...props} />);
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(1);
      expect(props.xScale.range.callCount).to.equal(1);
      expect(props.xScale.range.firstCall.args[0]).to.deep.equal([48, 942]);
      TrendsSVGContainer.prototype.setScales.restore();
    });

    it('should set the range of the yScale', () => {
      sinon.spy(TrendsSVGContainer.prototype, 'setScales');
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(0);
      shallow(<TrendsSVGContainer {...props} />);
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(1);
      expect(props.yScale.range.callCount).to.equal(1);
      expect(props.yScale.range.firstCall.args[0]).to.deep.equal([480, 80]);
      TrendsSVGContainer.prototype.setScales.restore();
    });
  });

  describe('componentWillMount', () => {
    it('should call the `setScales` method', () => {
      sinon.spy(TrendsSVGContainer.prototype, 'setScales');
      sinon.spy(TrendsSVGContainer.prototype, 'componentWillMount');
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(0);
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(0);
      shallow(<TrendsSVGContainer {...props} />);
      expect(TrendsSVGContainer.prototype.componentWillMount.callCount).to.equal(1);
      expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(1);
      TrendsSVGContainer.prototype.componentWillMount.restore();
      TrendsSVGContainer.prototype.setScales.restore();
    });
  });

  describe('componentWillReceiveProps', () => {
    describe('when yScale changes', () => {
      it('should call the `setScales` method', () => {
        sinon.spy(TrendsSVGContainer.prototype, 'setScales');
        const container = shallow(<TrendsSVGContainer {...props} />);
        TrendsSVGContainer.prototype.setScales.resetHistory();
        expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(0);

        container.setProps({ yScale: _.assign({}, props.yScale, { changed: true }) });
        expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(1);

        TrendsSVGContainer.prototype.setScales.restore();
      });
    });

    describe('when yScale does not change', () => {
      it('should not call the `setScales` method', () => {
        sinon.spy(TrendsSVGContainer.prototype, 'setScales');
        const container = shallow(<TrendsSVGContainer {...props} />);
        TrendsSVGContainer.prototype.setScales.resetHistory();
        expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(0);

        container.setProps({ someChange: true });
        expect(TrendsSVGContainer.prototype.setScales.callCount).to.equal(0);

        TrendsSVGContainer.prototype.setScales.restore();
      });
    });

    describe('when showingCbgDateTraces is true', () => {
      let wrapper;
      beforeEach(() => {
        const showingCbgDateTracesProps = _.assign({}, props, { showingCbgDateTraces: true });
        wrapper = shallow(<TrendsSVGContainer {...showingCbgDateTracesProps} />);
      });

      describe('when a cbg slice segment has been focused long enough', () => {
        it('should set focusedSegmentDataGroupedByDate in state', () => {
          sinon.spy(TrendsSVGContainer.prototype, 'componentWillReceiveProps');
          sinon.spy(TrendsSVGContainer.prototype, 'setState');
          const focusedSlice = {
            data: {
              msFrom: 0,
              msTo: 10000,
              ninetiethQuantile: 200,
              thirdQuartile: 75,
            },
          };
          const focusedSliceKeys = ['thirdQuartile', 'ninetiethQuantile'];
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({ cbgData: props.cbgData, focusedSlice, focusedSliceKeys });
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(2);
          expect(TrendsSVGContainer.prototype.setState.args[0][0]).to.deep.equal({
            size: {
              width: 960,
              height: 520,
            },
            chartWidth: 960 - 70,
          });
          expect(TrendsSVGContainer.prototype.setState.args[1][0]).to.deep.equal({
            focusedSegmentDataGroupedByDate: {
              '2017-01-01': props.cbgData,
            },
          });
          TrendsSVGContainer.prototype.componentWillReceiveProps.restore();
          TrendsSVGContainer.prototype.setState.restore();
        });
      });

      describe('when you\'ve moved to focus a different cbg slice segment', () => {
        it('should calculate new focusedSegmentDataGroupedByDate object', () => {
          sinon.spy(TrendsSVGContainer.prototype, 'componentWillReceiveProps');
          sinon.spy(TrendsSVGContainer.prototype, 'setState');
          const focusedSlice = {
            data: {
              msFrom: 0,
              msTo: 10000,
              firstQuartile: 25,
              thirdQuartile: 75,
            },
          };
          const focusedSliceKeys = ['firstQuartile', 'thirdQuartile'];
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({ focusedSlice, focusedSliceKeys });
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(2);
          expect(TrendsSVGContainer.prototype.setState.args[1][0]).to.deep.equal({
            focusedSegmentDataGroupedByDate: {},
          });
          TrendsSVGContainer.prototype.componentWillReceiveProps.restore();
          TrendsSVGContainer.prototype.setState.restore();
        });
      });

      describe('when you\'ve just stopped focusing a cbg slice segment', () => {
        it('should reset focusedSegmentDataGroupedByDate to `null` in state', () => {
          sinon.spy(TrendsSVGContainer.prototype, 'componentWillReceiveProps');
          sinon.spy(TrendsSVGContainer.prototype, 'setState');
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({
            focusedSlice: null, focusedSliceKeys: null, showingCbgDateTraces: false,
          });
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(2);
          expect(TrendsSVGContainer.prototype.setState.args[1][0]).to.deep.equal({
            focusedSegmentDataGroupedByDate: null,
          });
          TrendsSVGContainer.prototype.componentWillReceiveProps.restore();
          TrendsSVGContainer.prototype.setState.restore();
        });
      });
    });

    describe('when showingCbgDateTraces is false', () => {
      let wrapper;
      beforeEach(() => {
        wrapper = shallow(<TrendsSVGContainer {...props} />);
      });

      describe('when you haven\'t focused a cbg slice segment', () => {
        it('should not set the `focusedSegmentDataGroupedByDate` state in componentWillReceiveProps', () => {
          sinon.spy(TrendsSVGContainer.prototype, 'componentWillReceiveProps');
          sinon.spy(TrendsSVGContainer.prototype, 'setState');
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({
            activeDays: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true,
            },
          });
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.args[0][0]).to.not.include.keys('focusedSegmentDataGroupedByDate');
          TrendsSVGContainer.prototype.componentWillReceiveProps.restore();
          TrendsSVGContainer.prototype.setState.restore();
        });
      });

      describe('when you\'ve just focused a cbg slice segment', () => {
        it('should not set the `focusedSegmentDataGroupedByDate` state in componentWillReceiveProps', () => {
          sinon.spy(TrendsSVGContainer.prototype, 'componentWillReceiveProps');
          sinon.spy(TrendsSVGContainer.prototype, 'setState');
          const focusedSlice = {
            data: {
              msFrom: 0,
              msTo: 10000,
              ninetiethQuantile: 200,
              thirdQuartile: 75,
            },
          };
          const focusedSliceKeys = ['thirdQuartile', 'ninetiethQuantile'];
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(0);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(0);
          wrapper.setProps({ cbgData: props.cbgData, focusedSlice, focusedSliceKeys });
          expect(TrendsSVGContainer.prototype.componentWillReceiveProps.callCount).to.equal(1);
          expect(TrendsSVGContainer.prototype.setState.callCount).to.equal(1);
          TrendsSVGContainer.prototype.componentWillReceiveProps.restore();
          TrendsSVGContainer.prototype.setState.restore();
        });
      });
    });
  });

  describe('render', () => {
    let wrapper;
    before(() => {
      wrapper = shallow(<TrendsSVGContainer {...props} />);
    });

    it('should render a Background', () => {
      expect(wrapper.find(Background)).to.have.length(1);
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
      expect(wrapper.find('svg').children().last().is(TargetRangeLines)).to.be.true;
    });

    describe('showing CGM data', () => {
      it('should render a CBGSlicesContainer', () => {
        expect(wrapper.find(CBGSlicesContainer)).to.have.length(1);
      });

      it('should render a unselected all data message when all days unselected', () => {
        const unselectedProps = _.assign({}, props, { cbgData: [], activeDays: { monday: false } });
        const unselectedWrapper = shallow(<TrendsSVGContainer {...unselectedProps} />);
        expect(unselectedWrapper.find(NoData)).to.have.length(1);
        expect(unselectedWrapper.find(NoData).prop('unselectedAllData')).to.be.true;
      });

      describe('when showingSmbg is false', () => {
        it('should not render an SMBGRangeAvgContainer', () => {
          expect(wrapper.find(SMBGRangeAvgContainer)).to.have.length(0);
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
      it('should render a unselected all data message when all days unselected', () => {
        const unselectedProps = _.assign(
          {},
          props,
          { showingCbg: false, showingSmbg: true, smbgData: [], activeDays: { monday: false } }
        );
        const unselectedWrapper = shallow(<TrendsSVGContainer {...unselectedProps} />);
        expect(unselectedWrapper.find(NoData)).to.have.length(1);
        expect(unselectedWrapper.find(NoData).prop('unselectedAllData')).to.be.true;
      });

      describe('when smbgRangeOverlay is true', () => {
        it('should render an SMBGRangeAvgContainer each for range and mean', () => {
          const smbgRangeProps = _.assign(
            {}, props, { showingSmbg: true, smbgRangeOverlay: true }
          );
          const smbgRangeWrapper = shallow(<TrendsSVGContainer {...smbgRangeProps} />);
          expect(smbgRangeWrapper.find(SMBGRangeAvgContainer)).to.have.length(2);
        });
      });

      describe('when smbgRangeOverlay is false', () => {
        it('should render SMBGRangeAvgContainers with empty data (to get exit animation)', () => {
          const smbgRangeProps = _.assign(
            {}, props, { showingSmbg: true, smbgRangeOverlay: false }
          );
          const smbgRangeWrapper = shallow(<TrendsSVGContainer {...smbgRangeProps} />);
          const rangeAvgContainer = smbgRangeWrapper.find(SMBGRangeAvgContainer);
          expect(rangeAvgContainer).to.have.length(2);
          // eslint-disable-next-line lodash/prefer-lodash-method
          rangeAvgContainer.forEach((container) => {
            expect(container.prop('data')).to.deep.equal([]);
          });
        });
      });

      describe('when showingCbg is false', () => {
        it('should not render a CBGSlicesContainer', () => {
          const noCbgProps = _.assign({}, props, { showingCbg: false, showingSmbg: true });
          const noCbgWrapper = shallow(<TrendsSVGContainer {...noCbgProps} />);
          expect(noCbgWrapper.find(CBGSlicesContainer)).to.have.length(0);
          expect(noCbgWrapper.find(SMBGRangeAvgContainer)).to.have.length(2);
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
