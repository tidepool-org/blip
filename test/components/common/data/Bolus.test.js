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
import { shallow } from 'enzyme';

import { detail } from '../../../helpers/scales';
const { detailXScale, detailBolusScale } = detail;

import Bolus from '../../../../src/components/common/data/Bolus';
import getBolusPaths from '../../../../src/modules/render/bolus';

import { normal, underrideNormal, zeroUnderride } from '../../../../data/bolus/fixtures';

const BOLUS_OPTS = {
  bolusWidth: 12,
  extendedLineThickness: 2,
  interruptedLineThickness: 2,
  triangleHeight: 5,
};

describe('Bolus', () => {
  it('should return `null` if no paths calculated from insulinEvent', () => {
    const wrapper = shallow(
      <Bolus insulinEvent={zeroUnderride} xScale={detailXScale} yScale={detailBolusScale} />
    );
    expect(wrapper.html()).to.be.null;
  });

  it('should return a `<g>` with as many `<path>s` as are calculated for the insulinEvent', () => {
    const paths = getBolusPaths(normal, detailXScale, detailBolusScale, BOLUS_OPTS);
    const wrapper = shallow(
      <Bolus insulinEvent={normal} xScale={detailXScale} yScale={detailBolusScale} />
    );
    expect(wrapper.find(`#bolus-${normal.id}`).length).to.equal(1);
    expect(wrapper.find('path').length).to.equal(paths.length);
    expect(wrapper.find('circle').length).to.equal(0);
    expect(wrapper.find('text').length).to.equal(0);
  });

  it('should include a <circle> and <text> for carbs if insulinEvent has `carbInput`', () => {
    const wrapper = shallow(
      <Bolus insulinEvent={underrideNormal} xScale={detailXScale} yScale={detailBolusScale} />
    );
    expect(wrapper.find('circle').length).to.equal(1);
    expect(wrapper.find('text').length).to.equal(1);
  });
});
