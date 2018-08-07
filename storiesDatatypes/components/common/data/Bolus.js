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

import Bolus from '../../../../src/components/common/data/Bolus';

import SixHrScaleSVGDecorator, { HEIGHT, xScale } from '../../../helpers/SixHrScaleSVGDecorator';

const yScale = scaleLinear().domain([0, 15]).range([HEIGHT, 0]);

import * as boluses from '../../../../data/bolus/fixtures';

const stories = storiesOf('Bolus', module);

stories.addDecorator(SixHrScaleSVGDecorator);
stories.add('normal bolus', () => (
  <Bolus insulinEvent={boluses.normal} xScale={xScale} yScale={yScale} />
));

stories.add('interrupted bolus', () => (
  <Bolus insulinEvent={boluses.interruptedNormal} xScale={xScale} yScale={yScale} />
));

stories.add('underride on a normal bolus', () => (
  <Bolus insulinEvent={boluses.underrideNormal} xScale={xScale} yScale={yScale} />
), {
  notes: 'A normal bolus where only 8 out of 10 recommended units were programmed and delivered.',
});

stories.add('not rendered: zero underride on a normal bolus', () => (
  <Bolus insulinEvent={boluses.zeroUnderride} xScale={xScale} yScale={yScale} />
), {
  notes: 'A normal bolus where zero units were delivered of a 2 unit delivery recommendation.',
});

stories.add('override on a normal bolus', () => (
  <Bolus insulinEvent={boluses.overrideNormal} xScale={xScale} yScale={yScale} />
), {
  notes: 'A normal bolus where half a unit was recommended and 2 were programmed and delivered',
});

stories.add('zero override on a normal bolus', () => (
  <Bolus insulinEvent={boluses.zeroOverride} xScale={xScale} yScale={yScale} />
), {
  notes: 'A normal bolus where zero units of insulin were recommended but a bolus of 2 units was programmed & delivered.',
});

stories.add('underride and interrupt a normal bolus', () => (
  <Bolus
    insulinEvent={boluses.underrideAndInterruptedNormal}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A normal bolus where only 8 out of 10 recommended units were programmed and the bolus was interrupted after 5 untis of delivery.',
});

stories.add('override and interrupt on a normal bolus', () => (
  <Bolus
    insulinEvent={boluses.overrideAndInterruptedNormal}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A normal bolus where 5 units were recommended, 6.5 were programmed, and only 3 were delivered.',
});

stories.add('extended ("square") bolus', () => (
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
), {
  notes: 'A bolus consisting entirely of 4.5 units of extended delivery, plus a 4.5 unit normal bolus for height comparison.',
});

stories.add('interrupted extended ("square") bolus', () => (
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
), {
  notes: 'A bolus consisting entirely of 4.5 units of extended delivery that was interrupted after 2 units of delivery, plus a 2 unit normal bolus for height comparison.',
});

stories.add('override on an extended ("square") bolus', () => (
  <Bolus
    insulinEvent={boluses.overrideExtended}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A bolus consisting entirely of 5 units of extended delivery where only 4 units of insulin were recommended for delivery.',
});

stories.add('underride on an extended ("square") bolus', () => (
  <Bolus
    insulinEvent={boluses.underrideExtended}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A bolus consisting entirely of 2 units of extended delivery where 4 units of insulin were recommended for delivery.',
});

stories.add('interrupted underride on an extended bolus', () => (
  <Bolus
    insulinEvent={boluses.interruptedUnderrideExtended}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A bolus consisting of 2 programmed units of extended delivery where 4 units of insulin were recommended and the bolus was interrupted after 1.5 units of delivery.',
});

stories.add('combo bolus', () => (
  <Bolus
    insulinEvent={boluses.combo}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A bolus consisting of 4 units of immediately delivered insulin and 2 units of delivery extended over two hours.',
});

stories.add('interrupted combo bolus (during the immediately delievered portion)', () => (
  <Bolus
    insulinEvent={boluses.interruptedDuringNormalCombo}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A combo bolus consisting of 4 units of programmed immediately delivered insulin and 2 units of extended delivery that was interrupted after only 2 units of the immediate delivery.',
});

stories.add('interrupted combo bolus (during the extended delivery portion)', () => (
  <Bolus
    insulinEvent={boluses.interruptedDuringExtendedCombo}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A combo bolus consisting of 4 units of programmed immediately delivered insulin and 3 units of extended delivery that was interrupted after all the immediate delivery completed and two thirds of the extended delivery completed.',
});

stories.add('underride on a combo bolus', () => (
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
), {
  notes: "A combo bolus consisting of 4.75 units of immediately delivered insulin and 2 units of extended delivery insulin, while 8.75 total units of insulin were recommended for delivery, an 'underride' of 2 units, plus a 2 unit normal bolus for height comparison.",
});

stories.add('override on a combo bolus', () => (
  <Bolus
    insulinEvent={boluses.overrideCombo}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A combo bolus consisting of 5.75 units of immediately delivered insulin and 5 units of extended delivery insulin, while only 8.75 total units of insulin were recommended for delivery.',
});

stories.add('override on a combo bolus interrupted during extended delivery', () => (
  <Bolus
    insulinEvent={boluses.interruptedOverrideCombo}
    xScale={xScale}
    yScale={yScale}
  />
), {
  notes: 'A combo bolus consisting of 5.75 units of immediately delivered insulin and 5 programmed units of extended delivery insulin, while only 8.75 total units of insulin were recommended for delivery, and the delivery was interrupted after 2.5 units of extended delivery.',
});

/* eslint-enable max-len */
