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
import SMBGAvg from '../../../../src/components/trends/smbg/SMBGAvg';

describe('SMBGAvg', () => {
  let wrapper;
  const focusAvg = sinon.spy();
  const unfocusAvg = sinon.spy();
  const datum = {
    id: '5400000',
    max: 521,
    mean: 140,
    min: 22,
    msX: 5400000,
  };
  const props = {
    datum,
    focusAvg,
    tooltipLeftThreshold: THREE_HRS * 6,
    unfocusAvg,
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
        <SMBGAvg {...props} />
      </SVGContainer>
    );
  });

  describe('when a datum (overlay data) is not provided', () => {
    let noDatumWrapper;
    before(() => {
      const noDatumProps = _.omit(props, 'datum');

      noDatumWrapper = mount(
        <SVGContainer dimensions={{ width: trendsWidth, height: trendsHeight }}>
          <SMBGAvg {...noDatumProps} />
        </SVGContainer>
      );
    });

    it('should render nothing', () => {
      expect(noDatumWrapper.find(`#SMBGAvg-${datum.id}`).length).to.equal(0);
    });
  });

  describe('when a datum (overlay data) is provided', () => {
    it('should render a smbgAvg <g> with a <circle>', () => {
      expect(wrapper.find(`#smbgAvgGroup-${datum.id}`).length).to.equal(1);
      expect(wrapper.find(`#smbgAvgGroup-${datum.id} circle`).length).to.equal(1);
    });

    it('should render a median <circle>', () => {
      const medianCircle = wrapper
        .find(`#smbgAvgGroup-${datum.id} #smbgAvg-${datum.id}`).props();
      expect(medianCircle.cx).to.equal(54);
      expect(medianCircle.cy).to.equal(260);
    });
  });

  describe('interactions', () => {
    afterEach(() => {
      props.focusAvg.reset();
      props.unfocusAvg.reset();
    });

    it('should call focusAvg on mouseover of circle', () => {
      const avgCircle = wrapper
        .find(`#smbgAvgGroup-${datum.id} #smbgAvg-${datum.id}`);
      expect(focusAvg.callCount).to.equal(0);
      avgCircle.simulate('mouseover');
      expect(focusAvg.args[0][0]).to.deep.equal(datum);
      expect(focusAvg.args[0][1]).to.deep.equal({
        left: 54,
        tooltipLeft: false,
        yPositions: props.yPositions,
      });
      expect(focusAvg.callCount).to.equal(1);
    });

    it('should call unfocusAvg on mouseout of min/max rect', () => {
      const avgCircle = wrapper
        .find(`#smbgAvgGroup-${datum.id} #smbgAvg-${datum.id}`);
      expect(unfocusAvg.callCount).to.equal(0);
      avgCircle.simulate('mouseout');
      expect(unfocusAvg.callCount).to.equal(1);
    });
  });
});
