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

import Bolus from '../../../../src/components/common/data/Bolus';

import SixHrScaleSVGDecorator, { HEIGHT, xScale } from '../../../helpers/SixHrScaleSVGDecorator';

const yScale = scaleLinear().domain([0, 15]).range([HEIGHT, 0]);

import * as boluses from '../../../../data/bolus/fixtures';

storiesOf('Bolus', module)
  .addDecorator(SixHrScaleSVGDecorator)
  .add('normal bolus', () => (
    <WithNotes notes="Just a normal bolus that hasn't been interrupted or over/under-ridden...">
      <Bolus insulinEvent={boluses.normal} xScale={xScale} yScale={yScale} />
    </WithNotes>
  ))
  .add('interrupted bolus', () => (
    <WithNotes notes="A normal bolus that was interrupted at 5 out of 6.25 units programmed.">
      <Bolus insulinEvent={boluses.interruptedNormal} xScale={xScale} yScale={yScale} />
    </WithNotes>
  ))
  .add('underride on a normal bolus', () => {
    const notes = `A normal bolus where only 8 out of 10 recommended units were
     programmed and delivered.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus insulinEvent={boluses.underrideNormal} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('not rendered: zero underride on a normal bolus', () => {
    const notes = `A normal bolus where zero units were delivered of a 2 unit
     delivery recommendation.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus insulinEvent={boluses.zeroUnderride} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('override on a normal bolus', () => {
    const notes = `A normal bolus where half a unit was recommended and 2 were
     programmed and delivered`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus insulinEvent={boluses.overrideNormal} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('zero override on a normal bolus', () => {
    const notes = `A normal bolus where zero units of insulin were recommended
     but a bolus of 2 units was programmed & delivered.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus insulinEvent={boluses.zeroOverride} xScale={xScale} yScale={yScale} />
      </WithNotes>
    );
  })
  .add('underride and interrupt a normal bolus', () => {
    const notes = `A normal bolus where only 8 out of 10 recommended units were
     programmed and the bolus was interrupted after 5 untis of delivery.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.underrideAndInterruptedNormal}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('override and interrupt on a normal bolus', () => {
    const notes = `A normal bolus where 5 units were recommended, 6.5 were programmed,
     and only 3 were delivered.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.overrideAndInterruptedNormal}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('extended ("square") bolus', () => {
    const notes = `A bolus consisting entirely of 4.5 units of extended delivery,
     plus a 4.5 unit normal bolus for height comparison.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <g>
          <Bolus
            insulinEvent={boluses.normalNextToExtended}
            xScale={xScale}
            yScale={yScale}
          />
          <Bolus
            insulinEvent={boluses.extended}
            xScale={xScale}
            yScale={yScale}
          />
        </g>
      </WithNotes>
    );
  })
  .add('interrupted extended ("square") bolus', () => {
    const notes = `A bolus consisting entirely of 4.5 units of extended delivery
     that was interrupted after 2 units of delivery,
     plus a 2 unit normal bolus for height comparison.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <g>
          <Bolus
            insulinEvent={boluses.normalNextToInterruptedExtended}
            xScale={xScale}
            yScale={yScale}
          />
          <Bolus
            insulinEvent={boluses.interruptedExtended}
            xScale={xScale}
            yScale={yScale}
          />
        </g>
      </WithNotes>
    );
  })
  .add('override on an extended ("square") bolus', () => {
    const notes = `A bolus consisting entirely of 5 units of extended delivery
     where only 4 units of insulin were recommended for delivery.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.overrideExtended}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('underride on an extended ("square") bolus', () => {
    const notes = `A bolus consisting entirely of 2 units of extended delivery
     where 4 units of insulin were recommended for delivery.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.underrideExtended}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('interrupted underride on an extended bolus', () => {
    const notes = `A bolus consisting of 2 programmed units of extended delivery
     where 4 units of insulin were recommended and the bolus was interrupted
     after 1.5 units of delivery.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.interruptedUnderrideExtended}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('combo bolus', () => {
    const notes = `A bolus consisting of 4 units of immediately delivered insulin
     and 2 units of delivery extended over two hours.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.combo}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('interrupted combo bolus (during the immediately delievered portion)', () => {
    const notes = `A combo bolus consisting of 4 units of programmed immediately delivered
     insulin and 2 units of extended delivery that was interrupted after only 2 units
     of the immediate delivery.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.interruptedDuringNormalCombo}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('interrupted combo bolus (during the extended delivery portion)', () => {
    const notes = `A combo bolus consisting of 4 units of programmed immediately delivered
     insulin and 3 units of extended delivery that was interrupted after all the
     immediate delivery completed and two thirds of the extended delivery completed.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <Bolus
          insulinEvent={boluses.interruptedDuringExtendedCombo}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('underride on a combo bolus', () => {
    const notes = `A combo bolus consisting of 4.75 units of immediately delivered insulin
     and 2 units of extended delivery insulin, while 8.75 total units of insulin were
     recommended for delivery, an "underride" of 2 units,
     plus a 2 unit normal bolus for height comparison.`;
    return (
      <WithNotes notes={notes.replace('\n', '')}>
        <g>
          <Bolus
            insulinEvent={boluses.normalNextToInterruptedExtended}
            xScale={xScale}
            yScale={yScale}
          />
          <Bolus
            insulinEvent={boluses.underrideCombo}
            xScale={xScale}
            yScale={yScale}
          />
        </g>
      </WithNotes>
    );
  })
  .add('override on a combo bolus', () => {
    const notes = `A combo bolus consisting of 5.75 units of immediately delivered insulin
     and 5 units of extended delivery insulin, while only 8.75 total units of insulin were
     recommended for delivery.`;
    return (
      <WithNotes notes={notes.replace('/n', '')}>
        <Bolus
          insulinEvent={boluses.overrideCombo}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  })
  .add('override on a combo bolus interrupted during extended delivery', () => {
    const notes = `A combo bolus consisting of 5.75 units of immediately delivered insulin
     and 5 programmed units of extended delivery insulin, while only 8.75 total units of insulin
     were recommended for delivery, and the delivery was interrupted after 2.5 units of
     extended delivery.`;
    return (
      <WithNotes notes={notes.replace('/n', '')}>
        <Bolus
          insulinEvent={boluses.interruptedOverrideCombo}
          xScale={xScale}
          yScale={yScale}
        />
      </WithNotes>
    );
  });
