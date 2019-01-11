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

/* eslint-disable max-len */

import React from 'react';
import { shallow } from 'enzyme';

import { detail } from '../../../helpers/scales';
const { detailXScale, detailBasalScale } = detail;

import Suspend from '../../../../src/components/common/data/Suspend';

import { singleSuspend, multipleSuspends, suspendsWithoutDuration } from '../../../../data/deviceEvent/fixtures';

describe('Suspend', () => {
  it('should return `null` if input `suspends` prop is empty', () => {
    const wrapper = shallow(
      <Suspend suspends={[]} xScale={detailXScale} yScale={detailBasalScale} />
    );
    expect(wrapper.html()).to.be.null;
  });

  it('should return a `<g>` with as many markers as required', () => {
    const wrapper = shallow(
      <Suspend suspends={singleSuspend} xScale={detailXScale} yScale={detailBasalScale} />
    );
    expect(wrapper.find(`#suspends-${singleSuspend[0].id}-thru-${singleSuspend[singleSuspend.length - 1].id}`).length).to.equal(1);
    expect(wrapper.find('line').length).to.equal(singleSuspend.length * 2);
    expect(wrapper.find('circle').length).to.equal(singleSuspend.length * 2);
    expect(wrapper.find('text').length).to.equal(singleSuspend.length * 2);
    const multiWrapper = shallow(
      <Suspend suspends={multipleSuspends} xScale={detailXScale} yScale={detailBasalScale} />
    );
    expect(multiWrapper.find(`#suspends-${multipleSuspends[0].id}-thru-${multipleSuspends[multipleSuspends.length - 1].id}`).length).to.equal(1);
    expect(multiWrapper.find('line').length).to.equal(multipleSuspends.length * 2);
    expect(multiWrapper.find('circle').length).to.equal(multipleSuspends.length * 2);
    expect(multiWrapper.find('text').length).to.equal(multipleSuspends.length * 2);
  });

  it('should not render suspend markers for suspends without durations', () => {
    const wrapper = shallow(
      <Suspend suspends={suspendsWithoutDuration} xScale={detailXScale} yScale={detailBasalScale} />
    );
    expect(wrapper.find(`#suspends-${suspendsWithoutDuration[0].id}-thru-${suspendsWithoutDuration[suspendsWithoutDuration.length - 1].id}`).length).to.equal(1);
    expect(wrapper.find('line').length).to.equal(2);
    expect(wrapper.find('circle').length).to.equal(2);
    expect(wrapper.find('text').length).to.equal(2);
  });
});
