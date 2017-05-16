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

import { scaleLinear } from 'd3-scale';
import React from 'react';

export const WIDTH = 345;
export const HEIGHT = 145;

const longestTick = 40;

const SixHrScaleSVGDecorator = (story) => (
  <svg width={WIDTH} height={HEIGHT + longestTick}>
    <g transform="translate(115,0)">
      <rect x={-115} y={0} width={115} height={HEIGHT} fill="#DCE4E7" />
      <rect x={0} y={0} width={115} height={HEIGHT} fill="#D3DBDD" />
      <rect x={115} y={0} width={115} height={HEIGHT} fill="#E3EAED" />
      <line x1={0} x2={0} y1={0} y2={HEIGHT} strokeWidth={3} stroke="white" />
      <line x1={0} x2={0} y1={HEIGHT} y2={HEIGHT + longestTick} stroke="#B9C8D0" />
      <text dominantBaseline="hanging" fill="#727375" fontSize={14} x={-110} y={HEIGHT + 5}>
        9 pm
      </text>
      <line x1={-115} x2={-115} y1={HEIGHT} y2={HEIGHT + 20} stroke="#B9C8D0" />
      <text dominantBaseline="hanging" fill="#727375" fontSize={14} x={5} y={HEIGHT + 5}>
        12 am
      </text>
      <text dominantBaseline="hanging" fill="#CCCCCC" fontSize={14} x={5} y={HEIGHT + 25}>
        Monday, March 6
      </text>
      <line x1={115} x2={115} y1={HEIGHT} y2={HEIGHT + 20} stroke="#B9C8D0" />
      <text dominantBaseline="hanging" fill="#727375" fontSize={14} x={120} y={HEIGHT + 5}>
        3 am
      </text>
    </g>
    {story()}
  </svg>
);

export const xScale = scaleLinear().domain([0, 216e5]).range([115, WIDTH]);

export default SixHrScaleSVGDecorator;
