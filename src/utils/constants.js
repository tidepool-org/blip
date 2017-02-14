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

export const BG_HIGH = 'High';
export const BG_LOW = 'Low';

const STIFFNESS = 180;
const DAMPING = 40;
const PRECISION = 0.1;

export const springConfig = { stiffness: STIFFNESS, damping: DAMPING, precision: PRECISION };

export const MGDL_CLAMP_TOP = 400;
export const MMOLL_CLAMP_TOP = 22.5;

export const MGDL_UNITS = 'mg/dL';
export const MMOLL_UNITS = 'mmol/L';

const ONE_WEEK = 7;
const TWO_WEEKS = 14;
const FOUR_WEEKS = 28;

export const trends = { extentSizes: { ONE_WEEK, TWO_WEEKS, FOUR_WEEKS } };
