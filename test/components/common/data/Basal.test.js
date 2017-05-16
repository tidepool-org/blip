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

import React from 'react';
import { shallow } from 'enzyme';

import { detail } from '../../../helpers/scales';
const { detailXScale, detailBasalScale } = detail;

import Basal from '../../../../src/components/common/data/Basal';
import getBasalPaths from '../../../../src/modules/render/basal';

import { scheduledFlat } from '../../../../data/basal/fixtures';

describe('Basal', () => {
  it('should return a `<g>` with as many `<path>s` as are calculated for the basalSequence', () => {
    const paths = getBasalPaths([scheduledFlat], detailXScale, detailBasalScale);
    const wrapper = shallow(
      <Basal basalSequence={[scheduledFlat]} xScale={detailXScale} yScale={detailBasalScale} />
    );
    expect(wrapper.find(`#basalSequence-${scheduledFlat.id}`).length).to.equal(1);
    expect(wrapper.find('path').length).to.equal(paths.length);
  });
});
