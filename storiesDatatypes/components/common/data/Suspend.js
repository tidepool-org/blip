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

import Suspend from '../../../../src/components/common/data/Suspend';

import SixHrScaleSVGDecorator, { HEIGHT, xScale } from '../../../helpers/SixHrScaleSVGDecorator';

const yScale = scaleLinear().domain([0, 15]).range([HEIGHT, 0]);

import * as suspends from '../../../../data/deviceEvent/fixtures';

const stories = storiesOf('Suspend', module);
stories.addDecorator(SixHrScaleSVGDecorator);

stories.add('single automated suspend', () => (
  <Suspend suspends={suspends.singleSuspend} xScale={xScale} yScale={yScale} />
), { notes: 'A single automated suspend' });
stories.add('multiple automated suspends', () => (
  <Suspend suspends={suspends.multipleSuspends} xScale={xScale} yScale={yScale} />
), { notes: 'A set of automated suspends' });
