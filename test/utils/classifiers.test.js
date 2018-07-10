/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017 Tidepool Project
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

/* eslint-disable max-len, lodash/prefer-lodash-method */

import { MMOLL_UNITS, MGDL_UNITS } from '../../src/utils/constants';
import generateClassifiers from '../../src/utils/classifiers';

const bgBounds = {
  [MGDL_UNITS]: {
    veryHighThreshold: 300,
    targetUpperBound: 180,
    targetLowerBound: 70,
    veryLowThreshold: 55,
  },
  [MMOLL_UNITS]: {
    veryHighThreshold: 16.7,
    targetUpperBound: 10.0,
    targetLowerBound: 3.9,
    veryLowThreshold: 3.1,
  },
};

const bgPrefs = {
  [MGDL_UNITS]: {
    bgBounds: bgBounds[MGDL_UNITS],
    bgUnits: MGDL_UNITS,
  },
  [MMOLL_UNITS]: {
    bgBounds: bgBounds[MMOLL_UNITS],
    bgUnits: MMOLL_UNITS,
  },
};

const classifiers = generateClassifiers(bgPrefs[MGDL_UNITS]);

describe('generateClassifiers', () => {
  describe('basal', () => {
    const classifier = classifiers.basal;
    it('should return no tags for a scheduled basal', () => {
      expect(classifier({ deliveryType: 'scheduled' })).to.deep.equal([]);
    });
    it('should return no tags for an automated basal', () => {
      expect(classifier({ deliveryType: 'automated' })).to.deep.equal([]);
    });
    it('should return `temp` for a temp basal', () => {
      expect(classifier({ deliveryType: 'temp' })).to.deep.equal(['temp']);
    });
    it('should return `suspended` for a temp basal', () => {
      expect(classifier({ deliveryType: 'suspended' })).to.deep.equal(['suspended']);
    });
  });

  describe('bolus', () => {
    const classifier = classifiers.bolus;
    it('should return `wizard` and `correction` tags for a correction-only bolus from wizard', () => {
      expect(classifier({
        wizard: { recommended: { correction: 1.0, carb: 0, net: 1.0 } },
        normal: 1.0,
      })).to.deep.equal(['wizard', 'correction']);
    });
    it('should return `wizard` and `override` for an underridden bolus', () => {
      expect(classifier({
        wizard: { recommended: { correction: 1.0, carb: 2.0, net: 3.0 } },
        normal: 1.5,
      })).to.deep.equal(['wizard', 'underride']);
    });
    it('should return `manual`, `extended`, and `interrupted` for an interrupted non-wizard extended bolus', () => {
      expect(classifier({
        extended: 5.0,
        expectedExtended: 5.5,
      })).to.deep.equal(['manual', 'interrupted', 'extended']);
    });
    it('is possible to get all tags but `manual` on a single bolus', () => {
      expect(classifier({
        extended: 1.2,
        expectedExtended: 2.0,
        wizard: { recommended: { correction: 2.5, carb: 0, net: 2.5 } },
      })).to.deep.equal(['wizard', 'underride', 'correction', 'interrupted', 'extended']);
    });
    it('net recommendation is what counts for determining override', () => {
      expect(classifier({
        wizard: { recommended: { correction: 2.5, carb: 0, net: 2.2 } },
        normal: 2.5,
      })).to.deep.equal(['wizard', 'override', 'correction']);
    });
    it('corner case: interrupted correction zero bolus', () => {
      expect(classifier({
        wizard: { recommended: { correction: 1.0, carb: 0, net: 1.0 } },
        normal: 0.0,
        expectedNormal: 1.0,
      })).to.deep.equal(['wizard', 'correction', 'interrupted']);
    });
    it('corner case: interrupt an override to recommended amount', () => {
      expect(classifier({
        wizard: { recommended: { correction: 3.0, carb: 5.0, net: 7.5 } },
        normal: 7.5,
        expectedNormal: 8.5,
      })).to.deep.equal(['wizard', 'override', 'interrupted']);
    });
    it('corner case: good intentions count! (interrupted bolus does not automatically = override)', () => {
      expect(classifier({
        wizard: { recommended: { correction: 2.5, carb: 0, net: 2.2 } },
        normal: 1.0,
        expectedNormal: 2.2,
      })).to.deep.equal(['wizard', 'correction', 'interrupted']);
    });
  });

  describe('smbg', () => {
    const classifier = classifiers.smbg;
    const classifierMmoll = generateClassifiers(bgPrefs[MMOLL_UNITS]).smbg;
    it('should classify a non-subTyped smbg as `meter`', () => {
      expect(classifier({ value: 25 })).includes('meter');
    });
    it('should classify a `linked` smbg as `meter`', () => {
      expect(classifier({ value: 25, subType: 'linked' })).includes('meter');
    });
    it('should classify a `manual` smbg as `manual`', () => {
      expect(classifier({ value: 25, subType: 'manual' })).includes('manual');
    });
    it('should classify an smbg below the very-low threshold as `veryLow`', () => {
      expect(classifier({ value: 5 })).to.deep.equal(['meter', 'veryLow']);
    });
    it('should classify an mmol/L smbg below the very-low threshold as `veryLow`', () => {
      expect(classifierMmoll({ value: 1.3 })).to.deep.equal(['meter', 'veryLow']);
    });
    it('should not return any category tags for an in-target value', () => {
      expect(classifier({ value: 120 })).to.deep.equal(['meter']);
    });
    it('should not return any category tags for an in-target mmol/L value', () => {
      expect(classifierMmoll({ value: 7.2 })).to.deep.equal(['meter']);
    });
    it('should classify an smbg above the high threshold as `veryHigh`', () => {
      expect(classifier({ value: 35 })).includes('meter');
      expect(classifier({ value: 310 })).to.deep.equal(['meter', 'veryHigh']);
    });
    it('should classify an mmol/L smbg above the high threshold as `veryHigh`', () => {
      expect(classifierMmoll({ value: 8 })).includes('meter');
      expect(classifierMmoll({ value: 22 })).to.deep.equal(['meter', 'veryHigh']);
    });
  });
});
/* eslint-enable max-len, lodash/prefer-lodash-method */
