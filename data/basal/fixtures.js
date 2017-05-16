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
  * for tests and stories, we use a scale (e.g., detailBasalScale exported fromtest/helpers/scales)
  * with a range of 0 to 5, so new fixtures should be limited to a max rate of no more than 5
  */

const MIDNIGHT = Date.parse('1970-01-01T00:00:00.000Z');
const ONE_AM = Date.parse('1970-01-01T01:00:00.000Z');
const THREE_AM = Date.parse('1970-01-01T03:00:00.000Z');
const ONE_HR = 36e5;

export const scheduledFlat = {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 24,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '429383ed98244320a6f361bc22b22f88',
};

export const scheduledFlatDiscontinuousStart = {
  type: 'basal',
  subType: 'scheduled',
  discontinuousStart: true,
  duration: ONE_HR * 24,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'dc1a67d35f0b4751bdad88cd78b0e7d4',
};

export const scheduledFlatDiscontinuousEnd = {
  type: 'basal',
  subType: 'scheduled',
  discontinuousEnd: true,
  duration: ONE_HR * 5,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'ab05bd930a344d5a8b4932123f7c33ff',
};

export const isolatedFlatScheduled = {
  type: 'basal',
  subType: 'scheduled',
  discontinuousEnd: true,
  discontinuousStart: true,
  duration: ONE_HR * 5,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'c08daa45793d4c69925e0a658c16a76c',
};

export const scheduledNonFlat = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'cd9939963ff94ad8b8399fad3e6cbeec',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 2,
  rate: 1.75,
  utc: ONE_AM,
  id: 'd46c5bf13e784d11a8e1ef417675c2b8',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 1.5,
  rate: 1.95,
  utc: THREE_AM,
  id: '937c572fed1440ceae0fc430dd8c7183',
}];

export const scheduledDiscontinuousStart = [{
  type: 'basal',
  subType: 'scheduled',
  discontinuousStart: true,
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '7c686d7c34e1417e81d3d3695c4529ee',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 2,
  rate: 1.75,
  utc: ONE_AM,
  id: 'e140793008654669966964a332b0a359',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 1.5,
  rate: 1.95,
  utc: THREE_AM,
  id: '50fa7438c5e042e89b0c5a55768e0836',
}];

export const scheduledDiscontinuousEnd = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'c4be1b33595a4c858a6ba4b1622b7978',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 2,
  rate: 1.75,
  utc: ONE_AM,
  id: 'dba8763c13ec44dfadda74ab19914de2',
}, {
  type: 'basal',
  subType: 'scheduled',
  discontinuousEnd: true,
  duration: ONE_HR * 1.5,
  rate: 1.95,
  utc: THREE_AM,
  id: 'c0682b41ad8e42f3ad3ceaaece3379ca',
}];

export const isolatedScheduled = [{
  type: 'basal',
  subType: 'scheduled',
  discontinuousStart: true,
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'f69870a4b81a4ba7952b4e45f19d6b34',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 2,
  rate: 1.75,
  utc: ONE_AM,
  id: '3743820a838d41f092adfcf190de8a4b',
}, {
  type: 'basal',
  subType: 'scheduled',
  discontinuousEnd: true,
  duration: ONE_HR * 1.5,
  rate: 1.95,
  utc: THREE_AM,
  id: '1cdfeb654e5946c9afe3983cd0b642c1',
}];

export const simpleNegativeTemp = {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 3,
  rate: 1.6,
  utc: MIDNIGHT,
  id: '653a2be67d7543eb89f2c46827eb8049',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 3.2,
  },
};

export const simplePositiveTemp = {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 3,
  rate: 3.2,
  utc: MIDNIGHT,
  id: '9f7b9b71e5c743aeb7da7037462881b7',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 2.4,
  },
};

export const negativeTempAcrossScheduled = [{
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR,
  rate: 1.6875,
  utc: MIDNIGHT,
  id: '2e0a98d23e2641c0bbd65c3e8d6da018',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 2.25,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 2,
  rate: 1.3125,
  utc: ONE_AM,
  id: '8fa9636d626843e28c5503595a9d1674',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 1.5,
  rate: 1.4625,
  utc: THREE_AM,
  id: '1114580333fc4df4acd8405a58ba23bb',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.95,
  },
}];

export const positiveTempAcrossScheduled = [{
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR,
  rate: 3.375,
  utc: MIDNIGHT,
  id: 'ef008c51ef414f99af6b6e4368f82461',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 2.25,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 2,
  rate: 2.625,
  utc: ONE_AM,
  id: '939bb4dd2af447d7b6cb53cc44a07a13',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 1.5,
  rate: 2.925,
  utc: THREE_AM,
  id: '8aa421781b634b30b1b5e3f4f8c2d4d5',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.95,
  },
}];

export const simpleSuspend = {
  type: 'basal',
  subType: 'suspend',
  duration: ONE_HR * 3,
  rate: 0,
  utc: MIDNIGHT,
  id: '3f116e943e2a4c1daf0508208cde0ff9',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 2.25,
  },
};

export const suspendAcrossScheduled = [{
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR,
  rate: 0,
  utc: MIDNIGHT,
  id: '5271ce77596148d49d341b0f3bac5b24',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 2.25,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 2,
  rate: 0,
  utc: ONE_AM,
  id: 'ec5065fa629b4c05a6cf6b07ccaf1e91',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 1.5,
  rate: 0,
  utc: THREE_AM,
  id: 'ea50da4d379f45a5a6cf51920dba2d02',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.95,
  },
}];
