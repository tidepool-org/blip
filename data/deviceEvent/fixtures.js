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

/*
 * NB: the fixtures here are *not* accurate Tidepool data model references
 * rather, they are minimal viable post-processed fixtures
 * including all & only the properties/values necessary for rendering
 *
 * for tests we use a scale (e.g., detailBasalScale exported fromtest/helpers/scales)
 * with a range of 0 to 5, so new fixtures should be limited to a max rate of no more than 5
 */

const TEN_PM = Date.parse('1969-12-31T22:00:00.000Z');
const MIDNIGHT = Date.parse('1970-01-01T00:00:00.000Z');
const ONE_AM = Date.parse('1970-01-01T01:00:00.000Z');

const ONE_HR = 36e5;
const FIVE_MINS = 5 * 60 * 1000;
const TWENTY_MINS = 20 * 60 * 1000;

export const singleSuspend = [
  {
    type: 'deviceEvent',
    subType: 'status',
    status: 'suspended',
    duration: FIVE_MINS,
    utc: MIDNIGHT,
    id: 'p2nt1v2fbnolg91sivpj8me7fvv96v7u',
  },
];

export const multipleSuspends = [
  {
    type: 'deviceEvent',
    subType: 'status',
    status: 'suspended',
    duration: FIVE_MINS,
    utc: TEN_PM,
    id: 'p2nt1v2fbnolg91sivpj8me7fvv96v7u',
  },
  {
    type: 'deviceEvent',
    subType: 'status',
    status: 'suspended',
    duration: TWENTY_MINS,
    utc: MIDNIGHT,
    id: 'c2conf8pvuahc30rhtqdqnth9u2smef3',
  },
  {
    type: 'deviceEvent',
    subType: 'status',
    status: 'suspended',
    duration: ONE_HR,
    utc: ONE_AM,
    id: '505fos0locslfpj0ps3g598p961cugs3',
  },
];

export const suspendsWithoutDuration = [
  {
    type: 'deviceEvent',
    subType: 'status',
    status: 'suspended',
    utc: MIDNIGHT,
    id: 'p2nt1v2fbnolg91sivpj8me7fvv96v7u',
  },
  {
    type: 'deviceEvent',
    subType: 'status',
    status: 'suspended',
    duration: TWENTY_MINS,
    utc: MIDNIGHT,
    id: 'c2conf8pvuahc30rhtqdqnth9u2smef3',
  },
];
