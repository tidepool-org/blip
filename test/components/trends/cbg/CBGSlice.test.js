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

import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import SVGContainer from '../../../helpers/SVGContainer';

import CBGSlice from '../../../../src/components/trends/cbg/CBGSlice';

describe('CBGSlice', () => {
  let wrapper;
  const focusSlice = sinon.spy();
  const unfocusSlice = sinon.spy();
  const datum = {
    id: '2700000',
    min: 22,
    tenthQuantile: 60,
    firstQuartile: 100,
    median: 140,
    thirdQuartile: 180,
    ninetiethQuantile: 245,
    max: 521,
    msX: 2700000,
    msFrom: 1800000,
    msTo: 3600000,
  };
  const props = {
    aSliceIsFocused: false,
    datum,
    focusSlice,
    isFocused: false,
    unfocusSlice,
    xScale,
    yPositions: {
      min: yScale(datum.min),
      tenthQuantile: yScale(datum.tenthQuantile),
      firstQuartile: yScale(datum.firstQuartile),
      median: yScale(datum.median),
      thirdQuartile: yScale(datum.thirdQuartile),
      ninetiethQuantile: yScale(datum.ninetiethQuantile),
      max: yScale(datum.max),
    },
  };
  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <CBGSlice {...props} />
      </SVGContainer>
    );
  });

  describe('when a datum (slice data) is not provided', () => {
    let noDatumWrapper;
    before(() => {
      const noDatumProps = _.omit(props, 'datum');

      noDatumWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSlice {...noDatumProps} />
        </SVGContainer>
      );
    });

    it('should render nothing', () => {
      expect(noDatumWrapper.find(`#cbgSlice-${datum.id}`).length).to.equal(0);
      expect(noDatumWrapper.find(`#cbgSlice-${datum.id} rect`).length).to.equal(0);
      expect(noDatumWrapper.find(`#cbgSlice-${datum.id} circle`).length).to.equal(0);
    });
  });

  describe('when a datum (slice data) is provided', () => {
    it('should render a cbgSlice <g> with three <rect>s and one <circle>', () => {
      expect(wrapper.find(`#cbgSlice-${datum.id}`).length).to.equal(1);
      expect(wrapper.find(`#cbgSlice-${datum.id} rect`).length).to.equal(3);
      expect(wrapper.find(`#cbgSlice-${datum.id} circle`).length).to.equal(1);
    });

    it('should render a min/max rect covering the whole yScale range', () => {
      const rangeRect = wrapper
        .find(`#cbgSlice-${datum.id} #rangeSlice-${datum.id}`).props();
      expect(rangeRect.x).to.equal(18);
      expect(rangeRect.width).to.equal(18);
      expect(rangeRect.y).to.equal(0);
      expect(rangeRect.height).to.equal(trendsHeight);
    });

    it('should render a 10th-90th quantile rect', () => {
      const outerRect = wrapper
        .find(`#cbgSlice-${datum.id} #outerSlice-${datum.id}`).props();
      expect(outerRect.x).to.equal(18);
      expect(outerRect.width).to.equal(18);
      expect(outerRect.y).to.equal(155);
      expect(outerRect.height).to.equal(340 - 155);
    });

    it('should render a 1st-3rd quartiles rect', () => {
      const quartilesRect = wrapper
        .find(`#cbgSlice-${datum.id} #quartileSlice-${datum.id}`).props();
      expect(quartilesRect.x).to.equal(18);
      expect(quartilesRect.width).to.equal(18);
      expect(quartilesRect.y).to.equal(220);
      expect(quartilesRect.height).to.equal(300 - 220);
    });

    it('should render a median <circle>', () => {
      const medianCircle = wrapper
        .find(`#cbgSlice-${datum.id} #individualMedian-${datum.id}`).props();
      expect(medianCircle.cx).to.equal(27);
      expect(medianCircle.cy).to.equal(260);
    });
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusSlice.reset();
      props.unfocusSlice.reset();
    });

    it('should call focusSlice on mouseover of min/max rect', () => {
      const rangeRect = wrapper
        .find(`#cbgSlice-${datum.id} #rangeSlice-${datum.id}`);
      expect(focusSlice.callCount).to.equal(0);
      rangeRect.simulate('mouseover');
      expect(focusSlice.args[0][0]).to.deep.equal(datum);
      expect(focusSlice.args[0][1]).to.deep.equal({
        left: 27,
        tooltipLeft: false,
        topOptions: props.yPositions,
      });
      expect(focusSlice.args[0][2]).to.deep.equal(['min', 'max']);
      expect(focusSlice.callCount).to.equal(1);
    });

    it('should call focusSlice on mouseover of 10th-90th quantile rect', () => {
      const outerRect = wrapper
        .find(`#cbgSlice-${datum.id} #outerSlice-${datum.id}`);
      expect(focusSlice.callCount).to.equal(0);
      outerRect.simulate('mouseover');
      expect(focusSlice.args[0][0]).to.deep.equal(datum);
      expect(focusSlice.args[0][1]).to.deep.equal({
        left: 27,
        tooltipLeft: false,
        topOptions: props.yPositions,
      });
      expect(focusSlice.args[0][2]).to.deep.equal(['tenthQuantile', 'ninetiethQuantile']);
      expect(focusSlice.callCount).to.equal(1);
    });

    it('should call focusSlice on mouseover of 1st-3rd quartile rect', () => {
      const quartilesRect = wrapper
        .find(`#cbgSlice-${datum.id} #quartileSlice-${datum.id}`);
      expect(focusSlice.callCount).to.equal(0);
      quartilesRect.simulate('mouseover');
      expect(focusSlice.args[0][0]).to.deep.equal(datum);
      expect(focusSlice.args[0][1]).to.deep.equal({
        left: 27,
        tooltipLeft: false,
        topOptions: props.yPositions,
      });
      expect(focusSlice.args[0][2]).to.deep.equal(['firstQuartile', 'thirdQuartile']);
      expect(focusSlice.callCount).to.equal(1);
    });

    it('should call focusSlice on mouseover of median circle', () => {
      const medianCircle = wrapper
        .find(`#cbgSlice-${datum.id} #individualMedian-${datum.id}`);
      expect(focusSlice.callCount).to.equal(0);
      medianCircle.simulate('mouseover');
      expect(focusSlice.args[0][0]).to.deep.equal(datum);
      expect(focusSlice.args[0][1]).to.deep.equal({
        left: 27,
        tooltipLeft: false,
        topOptions: props.yPositions,
      });
      expect(focusSlice.args[0][2]).to.deep.equal(['median']);
      expect(focusSlice.callCount).to.equal(1);
    });

    it('should call unfocusSlice on mouseout of min/max rect', () => {
      const rangeRect = wrapper
        .find(`#cbgSlice-${datum.id} #rangeSlice-${datum.id}`);
      expect(unfocusSlice.callCount).to.equal(0);
      rangeRect.simulate('mouseout');
      expect(unfocusSlice.callCount).to.equal(1);
    });

    it('should call unfocusSlice on mouseout of 10th-90th quantile rect', () => {
      const outerRect = wrapper
        .find(`#cbgSlice-${datum.id} #outerSlice-${datum.id}`);
      expect(unfocusSlice.callCount).to.equal(0);
      outerRect.simulate('mouseout');
      expect(unfocusSlice.callCount).to.equal(1);
    });

    it('should call unfocusSlice on mouseout of 1st-3rd quartile rect', () => {
      const quartilesRect = wrapper
        .find(`#cbgSlice-${datum.id} #quartileSlice-${datum.id}`);
      expect(unfocusSlice.callCount).to.equal(0);
      quartilesRect.simulate('mouseout');
      expect(unfocusSlice.callCount).to.equal(1);
    });

    it('should call unfocusSlice on mouseout of median circle', () => {
      const medianCircle = wrapper
        .find(`#cbgSlice-${datum.id} #individualMedian-${datum.id}`);
      expect(unfocusSlice.callCount).to.equal(0);
      medianCircle.simulate('mouseout');
      expect(unfocusSlice.callCount).to.equal(1);
    });
  });
});
