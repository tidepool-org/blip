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
  trendsHeight,
  trendsWidth,
  trendsXScale: xScale,
  trendsYScale: yScale,
} = scales.trends;
import bgBounds from '../../../helpers/bgBounds';
import SVGContainer from '../../../helpers/SVGContainer';

import {
  CBGDateTraceAnimated, mapDispatchToProps, mapStateToProps,
} from '../../../../src/components/trends/cbg/CBGDateTraceAnimated';

describe('CBGDateTraceAnimated', () => {
  const props = {
    bgBounds,
    data: [{
      id: 'a1b2c3',
      localDate: '2016-12-25',
      msPer24: 0,
      value: 100,
    }, {
      id: 'd4e5f6',
      localDate: '2016-12-25',
      msPer24: 43200000,
      value: 200,
    }],
    date: '2016-12-25',
    focusDateTrace: sinon.spy(),
    onSelectDate: sinon.spy(),
    unfocusDateTrace: sinon.spy(),
    userId: 'z1y2x3',
    xScale,
    yScale,
  };

  describe('when the `data` is an empty array', () => {
    let wrapper;
    before(() => {
      const noDataProps = _.assign({}, props, { data: [] });
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGDateTraceAnimated {...noDataProps} />
        </SVGContainer>
      );
    });

    it('should render a <g> with nothing in it', () => {
      expect(wrapper.find(`#cbgDateTrace-${props.date}`)).to.have.length(1);
      expect(wrapper.find('circle')).to.have.length(0);
    });
  });

  describe('when `data` is not empty', () => {
    let wrapper;
    before(() => {
      wrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <CBGDateTraceAnimated {...props} />
        </SVGContainer>
      );
    });

    it('should render a <g> with two <circle>s in it', () => {
      expect(wrapper.find(`#cbgDateTrace-${props.date}`)).to.have.length(1);
      expect(wrapper.find('circle')).to.have.length(2);
    });

    it('should render each circle centered on (scaled) `msPer24` and `value`', () => {
      const circles = wrapper.find('circle');
      const { data } = props;
      circles.forEach((circle, i) => { // eslint-disable-line lodash/prefer-lodash-method
        expect(circle.prop('cx')).to.equal(xScale(data[i].msPer24));
        expect(circle.prop('cy')).to.equal(yScale(data[i].value));
      });
    });

    describe('interactions', () => {
      describe('onClick', () => {
        it('should fire the onSelectDate function', () => {
          const circle = wrapper.find('circle').first();
          expect(props.onSelectDate.callCount).to.equal(0);
          circle.simulate('click');
          expect(props.onSelectDate.callCount).to.equal(1);
          expect(props.onSelectDate.args[0][0]).to.equal(props.data[0].localDate);
        });
      });

      describe('onMouseOver', () => {
        it('should fire the onFocusDate function', () => {
          const circle = wrapper.find('circle').first();
          expect(props.focusDateTrace.callCount).to.equal(0);
          circle.simulate('mouseover');
          expect(props.focusDateTrace.callCount).to.equal(1);
          expect(props.focusDateTrace.args[0][0]).to.equal(props.userId);
          expect(props.focusDateTrace.args[0][1]).to.exist;
          expect(props.focusDateTrace.args[0][2]).to.exist;
        });
      });

      describe('onMouseOut', () => {
        it('should fire the unfocusDateTrace function', () => {
          const circle = wrapper.find('circle').first();
          expect(props.unfocusDateTrace.callCount).to.equal(0);
          circle.simulate('mouseout');
          expect(props.unfocusDateTrace.callCount).to.equal(1);
        });
      });
    });
  });

  describe('mapStateToProps', () => {
    const state = {
      blip: { currentPatientInViewId: 'a1b2c3' },
    };

    it('should map blip.currentPatientInViewId to `userId`', () => {
      expect(mapStateToProps(state).userId).to.equal(state.blip.currentPatientInViewId);
    });
  });

  describe('mapDispatchToProps', () => {
    it('should return an object with a `focusDateTrace` key', () => {
      expect(mapDispatchToProps(sinon.stub())).to.have.property('focusDateTrace');
    });

    it('should return an object with a `unfocusDateTrace` key', () => {
      expect(mapDispatchToProps(sinon.stub())).to.have.property('unfocusDateTrace');
    });
  });
});
