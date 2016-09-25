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

import { THREE_HRS } from '../../../../src/utils/datetime';
import SMBGRange from '../../../../src/components/trends/smbg/SMBGRange';

describe('SMBGRange', () => {
  let wrapper;
  const focusRange = sinon.spy();
  const unfocusRange = sinon.spy();
  const datum = {
    id: '5400000',
    max: 521,
    mean: 140,
    min: 22,
    msX: 5400000,
  };
  const props = {
    datum,
    focusRange,
    tooltipLeftThreshold: THREE_HRS * 6,
    unfocusRange,
    xScale,
    yPositions: {
      min: yScale(datum.min),
      mean: yScale(datum.mean),
      max: yScale(datum.max),
    },
  };
  before(() => {
    wrapper = mount(
      <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
        <SMBGRange {...props} />
      </SVGContainer>
    );
  });

  describe('when a datum (overlay data) is not provided', () => {
    let noDatumWrapper;
    before(() => {
      const noDatumProps = _.omit(props, 'datum');

      noDatumWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <SMBGRange {...noDatumProps} />
        </SVGContainer>
      );
    });

    it('should render nothing', () => {
      expect(noDatumWrapper.find(`#smbgRange-${datum.id}`).length).to.equal(0);
    });
  });

  describe('when a datum (overlay data) is provided', () => {
    it('should render a SMBGRange <rect>', () => {
      expect(wrapper.find(`#smbgRange-${datum.id} rect`).length).to.equal(1);
    });

    it('should render a min/max rect covering the whole yScale range', () => {
      const rangeRect = wrapper
        .find(`#smbgRange-${datum.id}`).props();
      expect(rangeRect.x).to.equal(45);
      expect(rangeRect.width).to.equal(18);
      expect(rangeRect.y).to.equal(0);
      expect(rangeRect.height).to.equal(trendsHeight);
    });
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusRange.reset();
      props.unfocusRange.reset();
    });

    it('should call focusRange on mouseover of min/max rect', () => {
      const rangeRect = wrapper
        .find(`#smbgRange-${datum.id}`);
      expect(focusRange.callCount).to.equal(0);
      rangeRect.simulate('mouseover');
      expect(focusRange.args[0][0]).to.deep.equal(datum);
      expect(focusRange.args[0][1]).to.deep.equal({
        left: 54,
        tooltipLeft: false,
        yPositions: props.yPositions,
      });
      expect(focusRange.callCount).to.equal(1);
    });

    it('should call unfocusRange on mouseout of min/max rect', () => {
      const rangeRect = wrapper
        .find(`#smbgRange-${datum.id}`);
      expect(unfocusRange.callCount).to.equal(0);
      rangeRect.simulate('mouseout');
      expect(unfocusRange.callCount).to.equal(1);
    });
  });
});
