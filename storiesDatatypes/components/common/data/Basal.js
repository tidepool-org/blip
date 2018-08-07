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
import { scaleLinear } from 'd3-scale';

import { storiesOf } from '@storybook/react';

import Basal from '../../../../src/components/common/data/Basal';

import SixHrScaleSVGDecorator, { HEIGHT, xScale } from '../../../helpers/SixHrScaleSVGDecorator';

const yScale = scaleLinear().domain([0, 5]).range([HEIGHT, 0]);

import * as basals from '../../../../data/basal/fixtures';

const stories = storiesOf('Basal', module);

stories.addDecorator(SixHrScaleSVGDecorator);
stories.add('scheduled flat rate basal', () => (
  <Basal basals={basals.scheduledFlat} xScale={xScale} yScale={yScale} />
), {
  notes: 'A twenty-four hour flat rate scheduled basal in two segments (because crosses midnight).',
});

stories.add('scheduled basals', () => (
  <Basal basals={basals.scheduledNonFlat} xScale={xScale} yScale={yScale} />
), {
  notes: 'A set of scheduled basal segments, uninterrupted.',
});

stories.add('automated basals', () => (
  <Basal basals={basals.automated} xScale={xScale} yScale={yScale} />
), {
  notes: 'A set of automated basal segments, uninterrupted.',
});

stories.add('automated basals with suspend', () => (
  <Basal basals={basals.automatedWithSuspend} xScale={xScale} yScale={yScale} />
), {
  notes: 'A set of automated basal segments, with a suspend.',
});

stories.add('automated and scheduled basals', () => (
  <Basal basals={basals.automatedAndScheduled} xScale={xScale} yScale={yScale} />
), {
  notes: 'A set of automated and scheduled basal segments, uninterrupted.',
});

stories.add('simple negative temp basal', () => (
  <Basal basals={basals.simpleNegativeTemp} xScale={xScale} yScale={yScale} />
), {
  notes: 'A negative temp basal entirely contained within one scheduled basal segment.',
});

stories.add('simple positive temp basal', () => (
  <Basal basals={basals.simplePositiveTemp} xScale={xScale} yScale={yScale} />
), {
  notes: 'A positive temp basal entirely contained within one scheduled basal segment.',
});

stories.add('simple suspend basal', () => (
  <Basal basals={basals.simpleSuspend} xScale={xScale} yScale={yScale} />
), {
  notes: 'A suspend basal entirely contained within one scheduled basal segment.',
});

stories.add('negative temp basal across schedule boundary', () => (
  <Basal basals={basals.negativeTempAcrossScheduled} xScale={xScale} yScale={yScale} />
), {
  notes: 'A negative temp basal that cross a basal schedule boundary.',
});

stories.add('positive temp basal across schedule boundary', () => (
  <Basal basals={basals.positiveTempAcrossScheduled} xScale={xScale} yScale={yScale} />
), {
  notes: 'A positive temp basal that cross a basal schedule boundary.',
});

stories.add('suspend basal across schedule boundary', () => (
  <Basal basals={basals.suspendAcrossScheduled} xScale={xScale} yScale={yScale} />
), {
  notes: 'A suspend basal that cross a basal schedule boundary.',
});

stories.add('scheduled flat rate basal with two discontinuities', () => (
  <Basal basals={basals.discontinuous} xScale={xScale} yScale={yScale} />
), {
  notes: 'A twenty-four hour flat rate scheduled basal in two segments (because crosses midnight), but with two discontinuities of five minutes just before midnight and at one a.m..',
});

/* eslint-enable max-len */
