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
import { TransitionMotion } from 'react-motion';

import { mount } from 'enzyme';

import * as scales from '../../../helpers/scales';
const {
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import bgBounds from '../../../helpers/bgBounds';
import SVGContainer from '../../../helpers/SVGContainer';

import { THREE_HRS } from '../../../../src/utils/datetime';
import CBGSliceAnimated from '../../../../src/components/trends/cbg/CBGSliceAnimated';

describe('CBGSliceAnimated', () => {
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
    bgBounds,
    datum,
    displayFlags: {
      cbg100Enabled: true,
      cbg80Enabled: true,
      cbg50Enabled: true,
      cbgMedianEnabled: true,
    },
    focusSlice,
    isFocused: false,
    tooltipLeftThreshold: 6 * THREE_HRS,
    unfocusSlice,
    xScale,
    yScale,
  };

  describe('when full datum and all `displayFlags` enabled', () => {
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSliceAnimated {...props} />
        </SVGContainer>
      );
    });

    it('should render a cbgSlice <g> with six <rect>s', () => {
      expect(wrapper.find(`#cbgSlice-${datum.id}`).length).to.equal(1);
      expect(wrapper.find('rect').length).to.equal(6);
    });

    it('should render the #median rect on top (i.e., last)', () => {
      expect(wrapper.find('rect').last().prop('id')).to.equal('median');
    });

    it('should vertically center the median rect on the value', () => {
      const medianRect = wrapper.find('rect').last();
      const slice = wrapper.find(CBGSliceAnimated);
      expect(wrapper.find(TransitionMotion).prop('styles')[5].style.median.val)
        .to.equal(yScale(slice.prop('datum').median) - slice.prop('medianHeight') / 2);
    });

    describe('animation', () => {
      it('should render a TransitionMotion component', () => {
        expect(wrapper.find(TransitionMotion).length).to.equal(1);
      });

      it('should define `defaultStyles` on the TransitionMotion component', () => {
        expect(wrapper.find(TransitionMotion).prop('defaultStyles')).to.exist;
      });

      it('should define a `willEnter` instance method', () => {
        expect(CBGSliceAnimated.prototype.willEnter).to.exist;
      });

      it('should define a `willLeave` instance method', () => {
        expect(CBGSliceAnimated.prototype.willLeave).to.exist;
      });
    });
  });

  describe('when only `cbg100Enabled`', () => {
    const cbg100EnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: true,
        cbg80Enabled: false,
        cbg50Enabled: false,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSliceAnimated {...cbg100EnabledProps} />
        </SVGContainer>
      );
    });

    it('should render #top10 and a #bottom10 <rect>s only', () => {
      expect(wrapper.find('rect').length).to.equal(2);
      expect(wrapper.find('#top10').length).to.equal(1);
      expect(wrapper.find('#bottom10').length).to.equal(1);
    });
  });

  describe('when only `cbg80Enabled`', () => {
    const cbg80EnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: true,
        cbg50Enabled: false,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSliceAnimated {...cbg80EnabledProps} />
        </SVGContainer>
      );
    });

    it('should render #upper15 and a #lower15 <rect>s only', () => {
      expect(wrapper.find('rect').length).to.equal(2);
      expect(wrapper.find('#upper15').length).to.equal(1);
      expect(wrapper.find('#lower15').length).to.equal(1);
    });
  });

  describe('when only `cbg50Enabled`', () => {
    const cbg50EnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: false,
        cbg50Enabled: true,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSliceAnimated {...cbg50EnabledProps} />
        </SVGContainer>
      );
    });

    it('should render a #innerQuartiles <rect> only', () => {
      expect(wrapper.find('rect').length).to.equal(1);
      expect(wrapper.find('#innerQuartiles').length).to.equal(1);
    });
  });

  describe('when only `cbgMedianEnabled`', () => {
    const cbgMedianEnabledProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: false,
        cbg50Enabled: false,
        cbgMedianEnabled: true,
      },
    });
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSliceAnimated {...cbgMedianEnabledProps} />
        </SVGContainer>
      );
    });

    it('should render a #median <rect> only', () => {
      expect(wrapper.find('rect').length).to.equal(1);
      expect(wrapper.find('#median').length).to.equal(1);
    });
  });

  describe('when full datum and no `displayFlags` enabled', () => {
    const allUncheckedProps = _.assign({}, props, {
      displayFlags: {
        cbg100Enabled: false,
        cbg80Enabled: false,
        cbg50Enabled: false,
        cbgMedianEnabled: false,
      },
    });
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSliceAnimated {...allUncheckedProps} />
        </SVGContainer>
      );
    });

    it('should render a TransitionMotion component but no <g> or <rect>s', () => {
      expect(wrapper.find(TransitionMotion).length).to.equal(1);
      expect(wrapper.find(`#cbgSlice-${datum.id}`).length).to.equal(0);
      expect(wrapper.find('rect').length).to.equal(0);
    });
  });

  describe('when datum with `undefined` statistics (i.e., gap in data)', () => {
    const gapInDataProps = _.assign({}, props, {
      datum: {
        id: '2700000',
        min: undefined,
        tenthQuantile: undefined,
        firstQuartile: undefined,
        median: undefined,
        thirdQuartile: undefined,
        ninetiethQuantile: undefined,
        max: undefined,
        msX: 2700000,
        msFrom: 1800000,
        msTo: 3600000,
      },
    });
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGSliceAnimated {...gapInDataProps} />
        </SVGContainer>
      );
    });

    it('should render a TransitionMotion component but no <g> or <rect>s', () => {
      expect(wrapper.find(TransitionMotion).length).to.equal(1);
      expect(wrapper.find(`#cbgSlice-${datum.id}`).length).to.equal(0);
      expect(wrapper.find('rect').length).to.equal(0);
    });
  });
});
