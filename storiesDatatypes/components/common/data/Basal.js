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
import { scaleLinear } from 'd3-scale';

import { storiesOf } from '@storybook/react';
import { WithNotes } from '@storybook/addon-notes';

import Basal from '../../../../src/components/common/data/Basal';

import SixHrScaleSVGDecorator, { HEIGHT, xScale } from '../../../helpers/SixHrScaleSVGDecorator';

const yScale = scaleLinear().domain([0, 5]).range([HEIGHT, 0]);

import * as basals from '../../../../data/basal/fixtures';

storiesOf('Basal', module)
  .addDecorator(SixHrScaleSVGDecorator)
  .add('scheduled flat rate basal', () => {
    const notes = `A twenty-four hour flat rate scheduled basal in two segments
     (because crosses midnight).`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.scheduledFlat} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('scheduled basals', () => {
    const notes = 'A set of scheduled basal segments, uninterrupted.';
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.scheduledNonFlat} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('automated basals', () => {
    const notes = 'A set of automated basal segments, uninterrupted.';
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.automated} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('automated basals with suspend', () => {
    const notes = 'A set of automated basal segments, with a suspend.';
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.automatedWithSuspend} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('automated and scheduled basals', () => {
    const notes = 'A set of automated and scheduled basal segments, uninterrupted.';
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.automatedAndScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('simple negative temp basal', () => {
    const notes = `A negative temp basal entirely contained within one scheduled
     basal segment.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.simpleNegativeTemp} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('simple positive temp basal', () => {
    const notes = `A positive temp basal entirely contained within one scheduled
     basal segment.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.simplePositiveTemp} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('simple suspend basal', () => {
    const notes = `A suspend basal entirely contained within one scheduled
     basal segment.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.simpleSuspend} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('negative temp basal across schedule boundary', () => {
    const notes = 'A negative temp basal that cross a basal schedule boundary.';
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.negativeTempAcrossScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('positive temp basal across schedule boundary', () => {
    const notes = 'A positive temp basal that cross a basal schedule boundary.';
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.positiveTempAcrossScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('suspend basal across schedule boundary', () => {
    const notes = 'A suspend basal that cross a basal schedule boundary.';
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.suspendAcrossScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('scheduled flat rate basal with two discontinuities', () => {
    const notes = `A twenty-four hour flat rate scheduled basal in two segments
     (because crosses midnight), but with two discontinuities of five minutes just
     before midnight and at one a.m..`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basals={basals.discontinuous} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  });
