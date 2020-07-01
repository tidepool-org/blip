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

const NINE_PM = Date.parse('1969-12-31T21:00:00.000Z');
const NINE_TEN_PM = Date.parse('1969-12-31T21:10:00.000Z');
const NINE_FIFTEEN_PM = Date.parse('1969-12-31T21:15:00.000Z');
const NINE_TWENTY_PM = Date.parse('1969-12-31T21:20:00.000Z');
const NINE_TWENTY_FIVE_PM = Date.parse('1969-12-31T21:25:00.000Z');
const NINE_THIRTY_PM = Date.parse('1969-12-31T21:30:00.000Z');
const TEN_PM = Date.parse('1969-12-31T22:00:00.000Z');
const MIDNIGHT = Date.parse('1970-01-01T00:00:00.000Z');
const ONE_AM = Date.parse('1970-01-01T01:00:00.000Z');
const THREE_AM = Date.parse('1970-01-01T03:00:00.000Z');
const FIVE_FORTY_AM = Date.parse('1970-01-01T05:40:00.000Z');
const FIVE_FORTY_FIVE_AM = Date.parse('1970-01-01T05:45:00.000Z');
const FIVE_FIFTY_AM = Date.parse('1970-01-01T05:50:00.000Z');
const FIVE_FIFTY_FIVE_AM = Date.parse('1970-01-01T05:55:00.000Z');
const ONE_HR = 36e5;
const FIVE_MINS = 5 * 60 * 1000;
const TWENTY_MINS = 20 * 60 * 1000;

export const scheduledFlat = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: '429383ed98244320a6f361bc22b22f88',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 24,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'c535f9be8e7344e4a15db7f7ba02ba71',
}];

export const scheduledNonFlat = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: '2eb21eeec78e44b8ab266b25341ddc61',
}, {
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
  duration: ONE_HR * 6,
  rate: 1.95,
  utc: THREE_AM,
  id: '937c572fed1440ceae0fc430dd8c7183',
}];

export const automated = [{
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS * 2,
  rate: 2.25,
  utc: NINE_PM,
  id: '2eb21eeec78e44b8ab266b25341ddc61',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 2.05,
  utc: NINE_TEN_PM,
  id: 'cd9939963ff94ad8b8399fad3e6cbeec',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: NINE_FIFTEEN_PM,
  id: 'd46c5bf13e784d11a8e1ef417675c2b8',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.35,
  utc: NINE_TWENTY_PM,
  id: '937c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.35,
  utc: NINE_TWENTY_FIVE_PM,
  id: 'a37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.9,
  utc: NINE_THIRTY_PM,
  id: 'b37c572fed1440ceae0fc430dd8c7183',
}];

export const automatedWithSuspend = [{
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS * 2,
  rate: 2.25,
  utc: NINE_PM,
  id: '2eb21eeec78e44b8ab266b25341ddc61',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 2.05,
  utc: NINE_TEN_PM,
  id: 'cd9939963ff94ad8b8399fad3e6cbeec',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: NINE_FIFTEEN_PM,
  id: 'd46c5bf13e784d11a8e1ef417675c2b8',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.35,
  utc: NINE_TWENTY_PM,
  id: '937c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'suspend',
  duration: FIVE_MINS * 7,
  rate: 0,
  utc: NINE_TWENTY_FIVE_PM,
  id: 'a37c572fed1440ceae0fc430dd8c7183',
  suppressed: {
    type: 'basal',
    subType: 'automated',
    rate: 1,
  },
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.9,
  utc: TEN_PM,
  id: 'b37c572fed1440ceae0fc430dd8c7183',
}];

export const automatedAndScheduled = [{
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS * 2,
  rate: 2.25,
  utc: NINE_PM,
  id: '2eb21eeec78e44b8ab266b25341ddc61',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 2.05,
  utc: NINE_TEN_PM,
  id: 'cd9939963ff94ad8b8399fad3e6cbeec',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: NINE_FIFTEEN_PM,
  id: 'd46c5bf13e784d11a8e1ef417675c2b8',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.35,
  utc: NINE_TWENTY_PM,
  id: '937c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 1.35,
  utc: NINE_TWENTY_FIVE_PM,
  id: 'a37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS * 6,
  rate: 1.9,
  utc: NINE_THIRTY_PM,
  id: 'b37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 2,
  rate: 1.75,
  utc: TEN_PM,
  id: 'c37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 1.55,
  utc: MIDNIGHT,
  id: 'd37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 2 + TWENTY_MINS * 2,
  rate: 2.25,
  utc: THREE_AM,
  id: 'e37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 2.15,
  utc: FIVE_FORTY_AM,
  id: '037c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 2.35,
  utc: FIVE_FORTY_FIVE_AM,
  id: 'f37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 2.45,
  utc: FIVE_FIFTY_AM,
  id: 'g37c572fed1440ceae0fc430dd8c7183',
}, {
  type: 'basal',
  subType: 'automated',
  duration: FIVE_MINS,
  rate: 2.35,
  utc: FIVE_FIFTY_FIVE_AM,
  id: 'h37c572fed1440ceae0fc430dd8c7183',
}];

export const simpleNegativeTemp = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: 'cf100060c7a9458b9120fc3bac311ab8',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '16bfac32cf8b44cba75b2abef7e61a38',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: ONE_AM,
  id: 'dd91c341abd34ab584b916a5b005c3f4',
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR,
  rate: 0.875,
  utc: ONE_AM + FIVE_MINS,
  id: '653a2be67d7543eb89f2c46827eb8049',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS * 11,
  rate: 1.75,
  utc: THREE_AM - ONE_HR + FIVE_MINS,
  id: 'ee9ef0fbf8c147da965318941679a9fa',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 6,
  rate: 1.95,
  utc: THREE_AM,
  id: 'ada4be7bde634253915833e7939527f4',
}];

export const simplePositiveTemp = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: '15cc827a17c343598248c82cc6dcd42c',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '8dc7d0ec5298471caee55daad232de84',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: ONE_AM,
  id: 'b4d9cb8caf434c218cac57dfb4bb33e4',
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR,
  rate: 2.1,
  utc: ONE_AM + FIVE_MINS,
  id: '56e2cab854ca460ab49fcce8b7e4461f',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS * 11,
  rate: 1.75,
  utc: THREE_AM - ONE_HR + FIVE_MINS,
  id: 'e4eb973de02849649dca15ce94709407',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 6,
  rate: 1.95,
  utc: THREE_AM,
  id: 'df2cc06c414943d98e4b9f3203216945',
}];

export const simpleSuspend = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: 'ce87726e252d4131bfebab3d2d701554',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '9f20881f15974ea2b423af658189cbf6',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: ONE_AM,
  id: '21582dc803e144c18233047ee4066610',
}, {
  type: 'basal',
  subType: 'suspend',
  duration: ONE_HR,
  rate: 0,
  utc: ONE_AM + FIVE_MINS,
  id: '7ea491a67561400485bc024009ad14ce',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS * 11,
  rate: 1.75,
  utc: THREE_AM - ONE_HR + FIVE_MINS,
  id: '6e1ef18abb874d89a7f80dfbd068e5ca',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 6,
  rate: 1.95,
  utc: THREE_AM,
  id: '68a5f511014c4c77a8b2c89884170812',
}];

export const negativeTempAcrossScheduled = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: '02fd6e14e8a14e84b8b8e21eb4122f3a',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: 'ac3d148f455d4fd69381b210012f5f17',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: ONE_AM,
  id: '2bee661bca4141fa9a82184fd10b5339',
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 2 - FIVE_MINS,
  rate: 0.875,
  utc: ONE_AM + FIVE_MINS,
  id: 'bda15cb3e8184df5bd4298ccf4fdaf2c',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: TWENTY_MINS,
  rate: 0.975,
  utc: THREE_AM,
  id: 'c9410aea728c47e181449e6cd9eae2d7',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.95,
  },
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 6 - TWENTY_MINS,
  rate: 1.95,
  utc: THREE_AM + TWENTY_MINS,
  id: '4b4aa223a4404a50bfda7ba76e1e1fda',
}];

export const positiveTempAcrossScheduled = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: '62cf69bfcc354419afd1e99c45d809f6',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '0eb1fa7848fb4fadaa3efc87f78d2d22',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: ONE_AM,
  id: 'bdc755d0081e4be6a33c43c899fcff10',
}, {
  type: 'basal',
  subType: 'temp',
  duration: ONE_HR * 2 - FIVE_MINS,
  rate: 2.1875,
  utc: ONE_AM + FIVE_MINS,
  id: '6a6615e63f714dcb819857eda7da9d5e',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'temp',
  duration: TWENTY_MINS,
  rate: 2.4375,
  utc: THREE_AM,
  id: 'b4b5af3003bd422590a3a25c21a5c355',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.95,
  },
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 6 - TWENTY_MINS,
  rate: 1.95,
  utc: THREE_AM + TWENTY_MINS,
  id: '9b3c5fd4b95144c9acbf347245e8c0bf',
}];

export const suspendAcrossScheduled = [{
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 3,
  rate: 2.25,
  utc: NINE_PM,
  id: '79f6d356ebf240648a567df366783a3f',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '93c0dfcc67a24d06aa63fdb1d3bc590d',
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: FIVE_MINS,
  rate: 1.75,
  utc: ONE_AM,
  id: 'ba709dfd1f864d11b8b896799bddbb6d',
}, {
  type: 'basal',
  subType: 'suspend',
  duration: ONE_HR * 2 - FIVE_MINS,
  rate: 0,
  utc: ONE_AM + FIVE_MINS,
  id: '9f073a2beee54f979fedebd6d5153282',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.75,
  },
}, {
  type: 'basal',
  subType: 'suspend',
  duration: TWENTY_MINS,
  rate: 0,
  utc: THREE_AM,
  id: 'eeaf13afb6a149b1af6d6c4d92c4b0f9',
  suppressed: {
    type: 'basal',
    subType: 'scheduled',
    rate: 1.95,
  },
}, {
  type: 'basal',
  subType: 'scheduled',
  duration: ONE_HR * 6 - TWENTY_MINS,
  rate: 1.95,
  utc: THREE_AM + TWENTY_MINS,
  id: '451b557b6596486ead7d7ddcd23edc84',
}];

export const discontinuous = [{
  type: 'basal',
  subType: 'scheduled',
  discontinuousEnd: true,
  duration: ONE_HR * 3 - FIVE_MINS,
  rate: 2.25,
  utc: NINE_PM,
  id: 'b357cc381d604bf1b1cb531d59b7cfa0',
}, {
  type: 'basal',
  subType: 'scheduled',
  discontinuousEnd: true,
  discontinuousStart: true,
  duration: ONE_HR,
  rate: 2.25,
  utc: MIDNIGHT,
  id: '0b4cfc99ce4e4d40bfc1fe5e73f74046',
}, {
  type: 'basal',
  subType: 'scheduled',
  discontinuousStart: true,
  duration: ONE_HR * 23 - FIVE_MINS,
  rate: 2.25,
  utc: ONE_AM + FIVE_MINS,
  id: '570640bac6d54d4ab6ae8d90cb7f0020',
}];
