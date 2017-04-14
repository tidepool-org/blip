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

import getBolusPaths from '../../../../src/modules/render/bolus';
import Bolus from '../../../../src/components/common/data/Bolus';

import SixHrScaleSVGDecorator, { HEIGHT, xScale } from '../../../helpers/SixHrScaleSVGDecorator';

const yScale = scaleLinear().domain([0, 10]).range([HEIGHT, 0]);

const ONE_AM = '2017-03-06T09:00:00.000Z';

const BOLUS_OPTS = { bolusWidth: 12, interruptedLineThickness: 2 };

storiesOf('Bolus', module)
  .addDecorator(SixHrScaleSVGDecorator)
  .add('normal bolus', () => {
    const bolus = {
      type: 'bolus',
      subType: 'normal',
      normal: 6.25,
      normalTime: ONE_AM,
      id: '61b4d2ffc5a74d2b80b5a9ef44bf5c35',
    };
    const paths = getBolusPaths(bolus, xScale, yScale, BOLUS_OPTS);
    return (
      <WithNotes notes="Just a normal bolus that hasn't been interrupted or over/under-ridden...">
        <Bolus bolus={bolus} paths={paths} />
      </WithNotes>
    );
  })
  .add('interrupted bolus', () => {
    const bolus = {
      type: 'bolus',
      subType: 'normal',
      normal: 5,
      expectedNormal: 6.25,
      normalTime: ONE_AM,
      id: 'a30ebc79aab0453097182cb0b456f511',
    };
    const paths = getBolusPaths(bolus, xScale, yScale, BOLUS_OPTS);
    return (
      <WithNotes notes="A normal bolus that was interrupted at 5 out of 6.25 units requested.">
        <Bolus bolus={bolus} paths={paths} />
      </WithNotes>
    );
  });
