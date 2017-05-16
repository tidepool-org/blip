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

import { storiesOf } from '@kadira/storybook';
import { WithNotes } from '@kadira/storybook-addon-notes';

import Basal from '../../../../src/components/common/data/Basal';

import SixHrScaleSVGDecorator, { HEIGHT, xScale } from '../../../helpers/SixHrScaleSVGDecorator';

const yScale = scaleLinear().domain([0, 5]).range([HEIGHT, 0]);

import * as basals from '../../../../data/basal/fixtures';

storiesOf('Basal', module)
  .addDecorator(SixHrScaleSVGDecorator)
  .add('scheduled flat rate basal', () => {
    const notes = 'A twenty-four hour flat rate scheduled basal.';
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={[basals.scheduledFlat]} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('scheduled flat rate basal that is at the beginning of a basal series', () => {
    const notes = `A twenty-four hour flat rate scheduled basal that begins a basal series
     (i.e., there is no data or a gap between previous basal and start of the basal sequence).`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal
          basalSequence={[basals.scheduledFlatDiscontinuousStart]}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('scheduled flat rate basal that is at the end of a basal series', () => {
    const notes = `A five hour flat rate scheduled basal that concludes a basal series
     (i.e., there is no data or a gap between the end of this sequence and the next).`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal
          basalSequence={[basals.scheduledFlatDiscontinuousEnd]}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('scheduled flat rate basal that is isolated', () => {
    const notes = `A five hour flat rate scheduled basal that both begins and ends a basal series
     (i.e., there is no data or a gap between the beginning of this sequence and the previous
     as well as between the end of this sequence and the next).`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Basal basalSequence={[basals.isolatedFlatScheduled]} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('sequence of three scheduled basal rates', () => {
    const notes = `A four and a half hour sequence of three scheduled basal intervals
     at different rates.`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={basals.scheduledNonFlat} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('sequence of three scheduled basal rates at the beginning of a basal series', () => {
    const notes = `A four and a half hour sequence of three scheduled basal intervals
     at different rates that begins a basal series (i.e., there is no data
     or a gap between previous basal and start of the basal sequence).`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={basals.scheduledDiscontinuousStart} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('sequence of three scheduled basal rates at the end of a basal series', () => {
    const notes = `A four and a half hour sequence of three scheduled basal intervals
     at different rates that concludes a basal series (i.e., there is no data
     or a gap between the end of this sequence and the next).`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={basals.scheduledDiscontinuousEnd} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('sequence of three scheduled basal rates that is isolated', () => {
    const notes = `A four and a half hour sequence of three scheduled basal intervals
     at different rates that both begins and ends a basal series (i.e., there is no data
     or a gap between the beginning of this sequence and the previous
     as well as between the end of this sequence and the next).`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={basals.isolatedScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('negative temp basal entirely contained within a scheduled basal segment', () => {
    const notes = `A negative temp basal entirely contained within a scheduled basal
     segment (i.e., the temp basal does not cross any schedule boundaries).`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={[basals.simpleNegativeTemp]} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('positive temp basal entirely contained within a scheduled basal segment', () => {
    const notes = `A positive temp basal entirely contained within a scheduled basal
     segment (i.e., the temp basal does not cross any schedule boundaries).`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={[basals.simplePositiveTemp]} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('negative temp basal crossing two scheduled basal boundaries', () => {
    const notes = `A negative temp basal that crosses two scheduled basal boundaries over
     the course of its duration.`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={basals.negativeTempAcrossScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('positive temp basal crossing two scheduled basal boundaries', () => {
    const notes = `A negative temp basal that crosses two scheduled basal boundaries over
     the course of its duration.`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={basals.positiveTempAcrossScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('suspend basal entirely contained within a scheduled basal segment', () => {
    const notes = `A suspend basal entirely contained within a scheduled basal segment
     (i.e., the suspend basal does not cross any schedule boundaries).`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={[basals.simpleSuspend]} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('suspend basal crossing two scheduled basal boundaries', () => {
    const notes = `A suspend basal that crosses two scheduled basal boundaries over
     the course of its duration.`;
    return (
      <WithNotes notes={notes}>
        <Basal basalSequence={basals.suspendAcrossScheduled} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  });
