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
import { SMBGAvgAnimated } from '../../../../src/components/trends/smbg/SMBGAvgAnimated';

describe('SMBGAvgAnimated', () => {
  let wrapper;
  const focus = sinon.spy();
  const unfocus = sinon.spy();
  const datum = {
    id: '5400000',
    max: 521,
    mean: 140,
    min: 22,
    msX: 5400000,
  };
  const props = {
    bgBounds,
    datum,
    defaultY: 100,
    focus,
    tooltipLeftThreshold: THREE_HRS * 6,
    unfocus,
    xScale,
    yScale,
  };
  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <SMBGAvgAnimated {...props} />
      </SVGContainer>
    );
  });

  describe('when datum with `undefined` statistics (i.e., gap in data)', () => {
    let noDatumWrapper;
    before(() => {
      const noDatumProps = _.assign({}, props, {
        datum: {
          id: '5400000',
          max: undefined,
          mean: undefined,
          min: undefined,
          msX: 5400000,
        },
      });

      noDatumWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <SMBGAvgAnimated {...noDatumProps} />
        </SVGContainer>
      );
    });

    it('should render a TransitionMotion component but no <circle>', () => {
      expect(noDatumWrapper.find(TransitionMotion).length).to.equal(1);
      expect(noDatumWrapper.find(`#smbgAvg-${datum.id}`).length).to.equal(0);
    });
  });

  describe('when a datum (overlay data) is provided', () => {
    it('should render a smbgAvg <circle>', () => {
      expect(wrapper.find(`#smbgAvg-${datum.id} circle`).length).to.equal(1);
    });

    it('should render a median <circle>', () => {
      const medianCircle = wrapper
        .find(`#smbgAvg-${datum.id}`).props();
      const style = wrapper.find(TransitionMotion).prop('styles')[0].style;
      expect(medianCircle.cx).to.equal(54);
      expect(style.cy.val).to.equal(260);
    });
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focus.reset();
      props.unfocus.reset();
    });

    it('should call focus on mouseover of circle', () => {
      const avgCircle = wrapper
        .find(`#smbgAvg-${datum.id}`);
      expect(focus.callCount).to.equal(0);
      avgCircle.simulate('mouseover');
      expect(focus.args[0][0]).to.deep.equal(datum);
      expect(focus.args[0][1]).to.deep.equal({
        left: 54,
        tooltipLeft: false,
        yPositions: {
          max: yScale(datum.max),
          mean: yScale(datum.mean),
          min: yScale(datum.min),
        },
      });
      expect(focus.callCount).to.equal(1);
    });

    it('should call unfocus on mouseout of min/max rect', () => {
      const avgCircle = wrapper
        .find(`#smbgAvg-${datum.id}`);
      expect(unfocus.callCount).to.equal(0);
      avgCircle.simulate('mouseout');
      expect(unfocus.callCount).to.equal(1);
    });
  });
});
