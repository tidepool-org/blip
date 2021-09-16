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

import { MGDL_UNITS, MMOLL_UNITS } from 'tideline';

export const BG_DATA_TYPES = [
  'cbg',
  'smbg',
];

export const DIABETES_DATA_TYPES = [
  ...BG_DATA_TYPES,
  'basal',
  'bolus',
  'wizard',
  'food',
  'physicalActivity',
];

export const DEFAULT_BG_TARGETS = {
  [MGDL_UNITS]: {
    low: 70,
    high: 180,
  },
  [MMOLL_UNITS]: {
    low: 3.9,
    high: 10.0,
  },
};

export const DEFAULT_BG_SETTINGS = {
  bgTarget: DEFAULT_BG_TARGETS[MGDL_UNITS],
  units: {
    bg: MGDL_UNITS,
  },
};
