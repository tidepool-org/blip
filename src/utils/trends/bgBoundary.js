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

/**
 * findClassForValue
 * @param {Number} bgValue - integer blood glucose value in mg/dL
 *
 * @return {string} class(s) to be used for the given bgValue
 */
export function findClassForValue(bgValue) {
  const classes = {
    'very-low': { boundary: 60 },
    low: { boundary: 80 },
    target: { boundary: 180 },
    high: { boundary: 200 },
    'very-high': { boundary: 300 },
  };

  if (bgValue < classes['very-low'].boundary) {
    return 'bg-low';
  } else if ((bgValue >= classes['very-low'].boundary) && (bgValue < classes.low.boundary)) {
    return 'bg-low circle-open';
  } else if ((bgValue >= classes.low.boundary) && (bgValue <= classes.target.boundary)) {
    return 'bg-target';
  } else if ((bgValue > classes.target.boundary) && (bgValue <= classes.high.boundary)) {
    return 'bg-high circle-open';
  }
  return 'bg-high';
}
