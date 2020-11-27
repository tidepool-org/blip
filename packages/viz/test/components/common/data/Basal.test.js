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

import Basal from '../../../../src/components/common/data/Basal';
import { getBasalSequencePaths } from '../../../../src/modules/render/basal';
import { getBasalSequences, getBasalPathGroups } from '../../../../src/utils/basal';

import { scheduledFlat, automatedAndScheduled, automated } from '../../../../data/basal/fixtures';

describe('Basal', () => {
  it('should return `null` if input `basals` prop is empty', () => {
    const wrapper = shallow(
      <Basal basals={[]} xScale={detailXScale} yScale={detailBasalScale} />
    );
    expect(wrapper.html()).to.be.null;
  });

  it('should return a `<g>` with as many `<path>s` as are calculated for the input basals', () => {
    const sequences = getBasalSequences(scheduledFlat);
    const paths = getBasalSequencePaths(sequences[0], detailXScale, detailBasalScale);
    const wrapper = shallow(
      <Basal basals={scheduledFlat} xScale={detailXScale} yScale={detailBasalScale} />
    );
    expect(wrapper.find(`#basals-${scheduledFlat[0].id}-thru-${scheduledFlat[1].id}`).length).to.equal(1);
    expect(wrapper.find('path').length).to.equal(paths.length + 1);
  });

  it('should return automated and manual basal path and outline groupings', () => {
    const groups = getBasalPathGroups(automatedAndScheduled);
    const expectedGroupsLength = 3; // automated, manual, automated
    const expectedBordersLength = groups.length;
    const wrapper = shallow(
      <Basal basals={automatedAndScheduled} xScale={detailXScale} yScale={detailBasalScale} />
    );

    expect(groups.length).to.equal(expectedGroupsLength);
    expect(wrapper.find('path').length).to.equal(expectedGroupsLength + expectedBordersLength);
  });

  it('should return markers for each automated and manual basal path groupings, minus the first one', () => {
    const groups = getBasalPathGroups(automatedAndScheduled);
    const expectedGroupsLength = 3;
    const expectedMarkersLength = groups.length - 1;
    const wrapper = shallow(
      <Basal basals={automatedAndScheduled} xScale={detailXScale} yScale={detailBasalScale} />
    );

    expect(groups.length).to.equal(expectedGroupsLength);

    const basalsGroup = wrapper.find(`#basals-${automatedAndScheduled[0].id}-thru-${automatedAndScheduled[automatedAndScheduled.length - 1].id}`);
    expect(basalsGroup.length).to.equal(1);

    const markersGroup = basalsGroup.children('g');
    expect(markersGroup.length).to.equal(expectedMarkersLength);
    expect(markersGroup.find('line').length).to.equal(expectedMarkersLength);
    expect(markersGroup.find('circle').length).to.equal(expectedMarkersLength);
    expect(markersGroup.find('text').length).to.equal(expectedMarkersLength);
  });

  it('should not return markers if there is only one path grouping', () => {
    const groups = getBasalPathGroups(automated);
    const expectedGroupsLength = 1;
    const wrapper = shallow(
      <Basal basals={automated} xScale={detailXScale} yScale={detailBasalScale} />
    );

    expect(groups.length).to.equal(expectedGroupsLength);

    const basalsGroup = wrapper.find(`#basals-${automated[0].id}-thru-${automated[automated.length - 1].id}`);
    expect(basalsGroup.length).to.equal(1);

    const markersGroup = basalsGroup.children('g');
    expect(markersGroup.length).to.equal(0);
    expect(markersGroup.find('line').length).to.equal(0);
    expect(markersGroup.find('circle').length).to.equal(0);
    expect(markersGroup.find('text').length).to.equal(0);
  });
});
