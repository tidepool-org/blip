/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import { scaleLinear } from 'd3-scale';

const trendsWidth = 864;
const trendsHeight = 360;

const trendsXScale = scaleLinear()
  .domain([0, 864e5])
  .range([0, trendsWidth]);

const trendsYScale = scaleLinear()
  .domain([40, 400])
  .range([trendsHeight, 0])
  .clamp(true);

const trends = { trendsWidth, trendsHeight, trendsXScale, trendsYScale };

const detailWidth = 864;
const detailHeight = 100;

const detailXScale = scaleLinear()
  .domain([0, 864e5])
  .range([0, detailWidth]);

const detailBasalScale = scaleLinear()
  .domain([0, 5])
  .range([detailHeight, 0]);

const detailBolusScale = scaleLinear()
  .domain([0, 15])
  .range([detailHeight, 0]);

const detail = { detailWidth, detailHeight, detailXScale, detailBasalScale, detailBolusScale };

export { detail, trends };
