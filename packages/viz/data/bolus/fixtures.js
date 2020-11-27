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
 * for tests we use a scale (e.g., detailBolusScale exported fromtest/helpers/scales)
 * with a range of 0 to 15, so new fixtures should be limited to a max value of no more than 15
 */

const ONE_AM = Date.parse('1970-01-01T01:00:00.000Z');
const ONE_HR = 36e5;

export const normal = {
  type: 'bolus',
  normal: 6.25,
  utc: ONE_AM,
  id: '61b4d2ffc5a74d2b80b5a9ef44bf5c35',
};

export const interruptedNormal = {
  type: 'bolus',
  normal: 5,
  expectedNormal: 6.25,
  utc: ONE_AM,
  id: 'a30ebc79aab0453097182cb0b456f511',
};

export const underrideNormal = {
  type: 'wizard',
  carbInput: 80,
  recommended: {
    net: 10,
    carb: 8,
    correction: 2,
  },
  id: 'bbb9b4f9b58040e48c685066b0a28ec0',
  bolus: {
    type: 'bolus',
    normal: 8,
    utc: ONE_AM,
    id: '9ebaa1c5ecc44e96be0abd20a213ae33',
  },
};

export const zeroUnderride = {
  type: 'wizard',
  carbInput: 20,
  recommended: {
    net: 2,
    carb: 2,
    correction: 0,
  },
  id: 'b50524a4dcf44841affb7ad79a43f5ca',
  bolus: {
    type: 'bolus',
    normal: 0,
    utc: ONE_AM,
    id: '20ed9117f14146eca5eeb65744fb8b3b',
  },
};

export const overrideNormal = {
  type: 'wizard',
  carbInput: 20,
  recommended: {
    net: 0.5,
    carb: 2,
    correction: -1.5,
  },
  id: '986d84dfbca845bcbd4fbd99018008f2',
  bolus: {
    type: 'bolus',
    normal: 2,
    utc: ONE_AM,
    id: '3f9d0429e7dd4c2e8d9de1f3d64b1d79',
  },
};

export const zeroOverride = {
  type: 'wizard',
  carbInput: 20,
  recommended: {
    net: 0,
    carb: 2,
    correction: -2.5,
  },
  id: '32913fb32282410a8bc646a7cdecec96',
  bolus: {
    type: 'bolus',
    normal: 2,
    utc: ONE_AM,
    id: '604447fccdf64ae097fa5626bceb83a7',
  },
};

export const underrideAndInterruptedNormal = {
  type: 'wizard',
  carbInput: 80,
  recommended: {
    net: 10,
    carb: 8,
    correction: 2,
  },
  id: '9605a117c8794d3daf6e8999470001c9',
  bolus: {
    type: 'bolus',
    normal: 5,
    expectedNormal: 8,
    utc: ONE_AM,
    id: '492b727fc81444c1ace8a680fe9d9d84',
  },
};

export const overrideAndInterruptedNormal = {
  type: 'wizard',
  carbInput: 60,
  recommended: {
    net: 5,
    carb: 6,
    correction: -1,
  },
  id: '340fb65556c9483d904c590b48075334',
  bolus: {
    type: 'bolus',
    normal: 3,
    expectedNormal: 6.5,
    utc: ONE_AM,
    id: '34fb3ee442b9417f9cb75ad2159d0ce4',
  },
};

export const normalNextToExtended = {
  type: 'bolus',
  normal: 4.5,
  utc: ONE_AM - ONE_HR,
  id: 'a3267d29badc4a6290865efb85e514f8',
};

export const extended = {
  type: 'bolus',
  extended: 4.5,
  duration: ONE_HR * 2,
  utc: ONE_AM,
  id: 'e7315de43ca640c39c6d96e632ad1597',
};

export const normalNextToInterruptedExtended = {
  type: 'bolus',
  normal: 2,
  utc: ONE_AM - ONE_HR,
  id: 'a3267d29badc4a6290865efb85e514f8',
};

export const interruptedExtended = {
  type: 'bolus',
  extended: 2,
  expectedExtended: 4.5,
  duration: (4 / 9) * ONE_HR * 2,
  expectedDuration: ONE_HR * 2,
  utc: ONE_AM,
  id: '394920ee271d4d4f9698f218eacab93e',
};

export const overrideExtended = {
  type: 'wizard',
  carbInput: 40,
  recommended: {
    carb: 4,
    correction: 0,
    net: 4,
  },
  id: '34ca42f0b98e4449b2b0c3571c9179d2',
  bolus: {
    type: 'bolus',
    extended: 5,
    duration: ONE_HR,
    utc: ONE_AM,
    id: 'caab15e17371454fb33394fce298da4f',
  },
};

export const underrideExtended = {
  type: 'wizard',
  carbInput: 40,
  recommended: {
    carb: 4,
    correction: 0,
    net: 4,
  },
  id: '34ca42f0b98e4449b2b0c3571c9179d2',
  bolus: {
    type: 'bolus',
    extended: 2,
    duration: ONE_HR,
    utc: ONE_AM,
    id: 'caab15e17371454fb33394fce298da4f',
  },
};

export const interruptedUnderrideExtended = {
  type: 'wizard',
  carbInput: 40,
  recommended: {
    carb: 4,
    correction: 0,
    net: 4,
  },
  id: '562f9c0526114185a43cd811abccd580',
  bolus: {
    type: 'bolus',
    extended: 1.5,
    expectedExtended: 2,
    duration: ONE_HR * (3 / 4),
    expectedDuration: ONE_HR,
    utc: ONE_AM,
    id: '6fff287cea9f4dd6b5804fbc5427e78d',
  },
};

export const combo = {
  type: 'bolus',
  normal: 4,
  extended: 2,
  duration: ONE_HR * 2,
  utc: ONE_AM,
  id: 'c9a88ae2fa004577b17d1fb53d918635',
};

export const interruptedDuringNormalCombo = {
  type: 'bolus',
  normal: 2,
  expectedNormal: 4,
  extended: 0,
  expectedExtended: 2,
  duration: 0,
  expectedDuration: ONE_HR * 2,
  utc: ONE_AM,
  id: 'd96f44a8a6884e2ca358cd76ba1cf9db',
};

export const interruptedDuringExtendedCombo = {
  type: 'bolus',
  normal: 4,
  extended: 2,
  expectedExtended: 3,
  duration: ONE_HR * 2,
  expectedDuration: ONE_HR * 3,
  utc: ONE_AM,
  id: 'd0f343a8878749eab89a6d02bc6d8c4f',
};

export const underrideCombo = {
  type: 'wizard',
  carbInput: 80,
  recommended: {
    carb: 8,
    correction: 1.25,
    net: 8.75,
  },
  id: '284e8de0ad1b481fb5e47657bc5ad20b',
  bolus: {
    type: 'bolus',
    normal: 4.75,
    extended: 2,
    duration: ONE_HR,
    utc: ONE_AM,
    id: '873c0c9e96f842a889621f3107cacc3c',
  },
};

export const overrideCombo = {
  type: 'wizard',
  carbInput: 80,
  recommended: {
    carb: 8,
    correction: 1.25,
    net: 8.75,
  },
  id: '2ed2af071b354d80b89a00435f077ba1',
  bolus: {
    type: 'bolus',
    normal: 5.75,
    extended: 5,
    duration: ONE_HR,
    utc: ONE_AM,
    id: '4f052761d63b4787a532ee7f906d2e86',
  },
};

export const interruptedOverrideCombo = {
  type: 'wizard',
  carbInput: 80,
  recommended: {
    carb: 8,
    correction: 1.25,
    net: 8.75,
  },
  id: 'cf73a3732a254583ae4fa1a20003be4d',
  bolus: {
    type: 'bolus',
    normal: 5.75,
    extended: 2.5,
    expectedExtended: 5,
    duration: ONE_HR * 2,
    expectedDuration: ONE_HR * 4,
    utc: ONE_AM,
    id: '85b9f452e9534f399390040e326d6dc2',
  },
};
