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

import * as bolusUtils from '../../src/utils/bolus';

/* eslint-disable no-unused-vars */

const normal = {
  normal: 5,
};

const cancelled = {
  normal: 2,
  expectedNormal: 5,
};

const override = {
  type: 'wizard',
  bolus: {
    normal: 2,
  },
  recommended: {
    carb: 0,
    correction: 0,
  },
};

const underride = {
  type: 'wizard',
  bolus: {
    normal: 1,
  },
  recommended: {
    carb: 1,
    correction: 0.5,
  },
};

const combo = {
  normal: 1,
  extended: 2,
  duration: 36e5,
};

const cancelledInNormalCombo = {
  normal: 0.2,
  expectedNormal: 1,
  extended: 0,
  expectedExtended: 2,
  duration: 0,
  expectedDuration: 36e5,
};

const cancelledInExtendedCombo = {
  normal: 1,
  extended: 0.5,
  expectedExtended: 2,
  duration: 9e5,
  expectedDuration: 36e5,
};

const doesNotExist = {
  normal: 0.2,
  expectedNormal: 1,
  extended: 2,
  duration: 36e5,
};

const comboOverride = {
  type: 'wizard',
  bolus: {
    normal: 1.5,
    extended: 2.5,
  },
  recommended: {
    carb: 3,
  },
};

const comboUnderrideCancelled = {
  type: 'wizard',
  bolus: {
    normal: 1,
    extended: 1,
    expectedExtended: 3,
    duration: 1200000,
    expectedDuration: 3600000,
  },
  recommended: {
    carb: 5,
  },
};

const extended = {
  extended: 2,
  duration: 36e5,
};

const cancelledExtended = {
  extended: 0.2,
  expectedExtended: 2,
  duration: 36e4,
  expectedDuration: 36e5,
};

const immediatelyCancelledExtended = {
  extended: 0,
  expectedExtended: 2,
  duration: 0,
  expectedDuration: 36e5,
};

const extendedUnderride = {
  type: 'wizard',
  bolus: {
    extended: 3,
  },
  recommended: {
    correction: 3.5,
  },
};

const withNetRec = {
  type: 'wizard',
  bolus: {
    normal: 1,
  },
  recommended: {
    net: 2,
  },
};

describe('bolus utilities', () => {
  describe('getBolusFromInsulinEvent', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getBolusFromInsulinEvent);
    });

    it('should return any object that doesn\'t have an embedded bolus', () => {
      const obj = {};
      expect(bolusUtils.getBolusFromInsulinEvent(obj)).to.equal(obj);
    });

    it('errors on `null` or `undefined` ¯\\_(ツ)_/¯', () => {
      const fn1 = () => { bolusUtils.getBolusFromInsulinEvent(null); };
      const fn2 = () => { bolusUtils.getBolusFromInsulinEvent(undefined); };
      const fn3 = () => { bolusUtils.getBolusFromInsulinEvent(); };
      expect(fn1).to.throw();
      expect(fn2).to.throw();
      expect(fn3).to.throw();
    });

    it('should return the embedded `bolus` if it exists', () => {
      const obj = { bolus: 2 };
      expect(bolusUtils.getBolusFromInsulinEvent(obj)).to.equal(obj.bolus);
      const obj2 = { bolus: { type: 'bolus', normal: 5 } };
      expect(bolusUtils.getBolusFromInsulinEvent(obj2)).to.equal(obj2.bolus);
    });
  });

  describe('getProgrammed', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getProgrammed);
    });

    it('should return NaN if type `wizard` and no bolus attached', () => {
      expect(Number.isNaN(bolusUtils.getProgrammed({ type: 'wizard' }))).to.be.true;
    });

    it('should return the value of a no-frills `normal` bolus', () => {
      expect(bolusUtils.getProgrammed(normal)).to.equal(normal.normal);
    });

    it('should return the value of a no-frills `extended` bolus', () => {
      expect(bolusUtils.getProgrammed(extended)).to.equal(extended.extended);
    });

    it('should return the combined `normal` and `extended` of a no-frills `combo` bolus', () => {
      expect(bolusUtils.getProgrammed(combo)).to.equal(combo.normal + combo.extended);
    });

    it('should return the `expectedNormal` of a cancelled `normal` bolus', () => {
      expect(bolusUtils.getProgrammed(cancelled)).to.equal(cancelled.expectedNormal);
    });

    it('should return the `expectedExtended` of a cancelled `extended` bolus', () => {
      expect(bolusUtils.getProgrammed(cancelledExtended));
    });

    it(`should return the \`expectedNormal\` & \`expectedExtended\`
        of a \`normal\`-cancelled \`combo\` bolus`, () => {
      expect(bolusUtils.getProgrammed(cancelledInNormalCombo)).to.equal(
        cancelledInNormalCombo.expectedNormal + cancelledInNormalCombo.expectedExtended
      );
    });

    it(`should return the \`normal\` & \`expectedExtended\`
        of an \`extended\`-cancelled \`combo\` bolus`, () => {
      expect(bolusUtils.getProgrammed(cancelledInExtendedCombo)).to.equal(
        cancelledInExtendedCombo.normal + cancelledInExtendedCombo.expectedExtended
      );
    });

    it(`should throw an error on a \`normal\`-cancelled \`combo\` bolus
        with no \`expectedExtended\``, () => {
      const fn = () => { bolusUtils.getProgrammed(doesNotExist); };
      expect(fn).to.throw(
        'Combo bolus found with a cancelled `normal` portion and non-cancelled `extended`!'
      );
    });

    it('should return the `normal` of an underride', () => {
      expect(bolusUtils.getProgrammed(underride)).to.equal(underride.bolus.normal);
    });

    it('should return the `normal` of a `normal` override', () => {
      expect(bolusUtils.getProgrammed(override)).to.equal(override.bolus.normal);
    });

    it('should return the `extended` of an `extended` underride', () => {
      expect(bolusUtils.getProgrammed(extendedUnderride))
        .to.equal(extendedUnderride.bolus.extended);
    });

    it('should return the combined `normal` & `extended` of a `combo` override', () => {
      expect(bolusUtils.getProgrammed(comboOverride)).to.equal(
        comboOverride.bolus.normal + comboOverride.bolus.extended
      );
    });

    it(`should return the \`normal\` and \`expectedExtended\`
        of an \`extended\`-cancelled combo underride`, () => {
      expect(bolusUtils.getProgrammed(comboUnderrideCancelled)).to.equal(
        comboUnderrideCancelled.bolus.normal + comboUnderrideCancelled.bolus.expectedExtended
      );
    });
  });

  describe('getRecommended', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getRecommended);
    });

    it('should return NaN when no recommended exists (i.e., "quick" or manual bolus)', () => {
      expect(Number.isNaN(bolusUtils.getRecommended(normal))).to.be.true;
    });

    it('should return total when both `carb` and `correction` recs exist', () => {
      const { recommended: { carb, correction } } = underride;
      expect(bolusUtils.getRecommended(underride)).to.equal(carb + correction);
    });

    it('should return `carb` rec when only `carb` rec exists', () => {
      const { recommended: { carb } } = comboOverride;
      expect(bolusUtils.getRecommended(comboOverride)).to.equal(carb);
    });

    it('should return `correction` rec when only `correction` rec exists', () => {
      const { recommended: { correction } } = extendedUnderride;
      expect(bolusUtils.getRecommended(extendedUnderride)).to.equal(correction);
    });

    it('should return `net` rec when `net` rec exists', () => {
      const { recommended: { net } } = withNetRec;
      expect(bolusUtils.getRecommended(withNetRec)).to.equal(net);
    });

    it('should return 0 when no bolus recommended, even if overridden', () => {
      expect(bolusUtils.getRecommended(override)).to.equal(0);
    });
  });

  describe('getDelivered', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getDelivered);
    });

    it('should return NaN if type `wizard` and no bolus attached', () => {
      expect(Number.isNaN(bolusUtils.getDelivered({ type: 'wizard' }))).to.be.true;
    });

    it('should return the value of a no-frills `normal` bolus', () => {
      expect(bolusUtils.getDelivered(normal)).to.equal(normal.normal);
    });

    it('should return the value of a no-frills `extended` bolus', () => {
      expect(bolusUtils.getDelivered(extended)).to.equal(extended.extended);
    });

    it('should return the combined `normal` and `extended` of a no-frills `combo` bolus', () => {
      expect(bolusUtils.getDelivered(combo)).to.equal(combo.normal + combo.extended);
    });

    it('should return the delivered of a cancelled `normal` bolus', () => {
      expect(bolusUtils.getDelivered(cancelled)).to.equal(cancelled.normal);
    });

    it('should return the delivered of a cancelled `extended` bolus', () => {
      expect(bolusUtils.getDelivered(cancelledExtended)).to.equal(cancelledExtended.extended);
    });

    it('should return the `normal` of a `normal`-cancelled `combo` bolus', () => {
      expect(bolusUtils.getDelivered(cancelledInNormalCombo))
        .to.equal(cancelledInNormalCombo.normal);
    });

    it('should return the `normal` & `extended` of an `extended`-cancelled `combo` bolus', () => {
      expect(bolusUtils.getDelivered(cancelledInExtendedCombo)).to.equal(
        cancelledInExtendedCombo.normal + cancelledInExtendedCombo.extended
      );
    });

    it('should return the programmed & delivered of an underride', () => {
      expect(bolusUtils.getDelivered(underride)).to.equal(underride.bolus.normal);
    });

    it('should return the programmed & delivered of an override', () => {
      expect(bolusUtils.getDelivered(override)).to.equal(override.bolus.normal);
    });

    it('should return the programmed & delivered of an `extended` underride', () => {
      expect(bolusUtils.getDelivered(extendedUnderride)).to.equal(extendedUnderride.bolus.extended);
    });

    it('should return the the `normal` & `extended` of a `combo` override', () => {
      expect(bolusUtils.getDelivered(comboOverride)).to.equal(
        comboOverride.bolus.normal + comboOverride.bolus.extended
      );
    });

    it('should return the `normal` & `extended` of a cancelled `combo` underride', () => {
      expect(bolusUtils.getDelivered(comboUnderrideCancelled)).to.equal(
        comboUnderrideCancelled.bolus.normal + comboUnderrideCancelled.bolus.extended
      );
    });
  });

  describe('getMaxDuration', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getMaxDuration);
    });

    it('should return NaN if type `wizard` and no bolus attached', () => {
      expect(Number.isNaN(bolusUtils.getMaxDuration({ type: 'wizard' }))).to.be.true;
    });

    it('should return NaN on a non-`extended` bolus', () => {
      expect(Number.isNaN(bolusUtils.getMaxDuration(normal))).to.be.true;
    });

    it('should return `duration` of an `extended` bolus', () => {
      expect(bolusUtils.getMaxDuration(extended)).to.equal(extended.duration);
    });

    it('should return `expectedDuration` of a cancelled `extended` bolus', () => {
      expect(bolusUtils.getMaxDuration(cancelledExtended))
        .to.equal(cancelledExtended.expectedDuration);
    });

    it('should return `expectedDuration` of a cancelled `combo` underride', () => {
      expect(bolusUtils.getMaxDuration(comboUnderrideCancelled))
        .to.equal(comboUnderrideCancelled.bolus.expectedDuration);
    });

    it('should return `expectedDuration` of an immediately-cancelled `extended` bolus', () => {
      expect(bolusUtils.getMaxDuration(immediatelyCancelledExtended))
        .to.equal(immediatelyCancelledExtended.expectedDuration);
    });
  });

  describe('getMaxValue', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getMaxValue);
    });

    it('should return NaN if type `wizard` and no bolus attached', () => {
      expect(Number.isNaN(bolusUtils.getMaxValue({ type: 'wizard' }))).to.be.true;
    });

    it('should return the value of a no-frills `normal` bolus', () => {
      expect(bolusUtils.getMaxValue(normal)).to.equal(normal.normal);
    });

    it('should return the value of a no-frills `extended` bolus', () => {
      expect(bolusUtils.getMaxValue(extended)).to.equal(extended.extended);
    });

    it('should return the combined `normal` and `extended` of a no-frills `combo` bolus', () => {
      expect(bolusUtils.getMaxValue(combo)).to.equal(combo.normal + combo.extended);
    });

    it('should return the programmed value of a cancelled `normal` bolus', () => {
      expect(bolusUtils.getMaxValue(cancelled)).to.equal(cancelled.expectedNormal);
    });

    it('should return the programmed value of a cancelled `extended` bolus', () => {
      expect(bolusUtils.getMaxValue(cancelledExtended))
        .to.equal(cancelledExtended.expectedExtended);
    });

    it('should return the combined programmed values of a `normal`-cancelled `combo` bolus', () => {
      const { expectedNormal, expectedExtended } = cancelledInNormalCombo;
      expect(bolusUtils.getMaxValue(cancelledInNormalCombo))
        .to.equal(expectedNormal + expectedExtended);
    });

    it(`should return the combined programmed values
        of an \`extended\`-cancelled \`combo\` bolus`, () => {
      expect(bolusUtils.getMaxValue(cancelledInExtendedCombo))
        .to.equal(cancelledInExtendedCombo.normal + cancelledInExtendedCombo.expectedExtended);
    });

    it('should return the net recommendation in the case of an underride', () => {
      expect(bolusUtils.getMaxValue(underride)).to.equal(1.5);
    });

    it('should return the delivered in the case of an override', () => {
      expect(bolusUtils.getMaxValue(override)).to.equal(override.bolus.normal);
    });

    it('should return the net recommendation in the case of an `extended` underride', () => {
      expect(bolusUtils.getMaxValue(extendedUnderride)).to.equal(3.5);
    });

    it('should return the delivered in the case of a `combo` override', () => {
      expect(bolusUtils.getMaxValue(comboOverride)).to.equal(
        comboOverride.bolus.normal + comboOverride.bolus.extended
      );
    });

    it('should return the net recommendation in the case of a cancelled `combo` underride', () => {
      expect(bolusUtils.getMaxValue(comboUnderrideCancelled)).to.equal(5);
    });
  });

  describe('isInterruptedBolus', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.isInterruptedBolus);
    });

    it('should return `false` on a no-frills `normal` bolus', () => {
      expect(bolusUtils.isInterruptedBolus(normal)).to.be.false;
      expect(bolusUtils.isInterruptedBolus(withNetRec)).to.be.false;
    });

    it('should return `false` on a no-frills `extended` bolus', () => {
      expect(bolusUtils.isInterruptedBolus(extended)).to.be.false;
    });

    it('should return `false` on a no-frills `combo` bolus', () => {
      expect(bolusUtils.isInterruptedBolus(combo)).to.be.false;
    });

    it('should return `true` on a cancelled `normal` bolus', () => {
      expect(bolusUtils.isInterruptedBolus(cancelled)).to.be.true;
    });

    it('should return `true` on all types of cancelled `extended` bolus', () => {
      expect(bolusUtils.isInterruptedBolus(immediatelyCancelledExtended)).to.be.true;
      expect(bolusUtils.isInterruptedBolus(cancelledExtended)).to.be.true;
    });

    it('should return `true` on all types of cancelled `combo` boluses', () => {
      expect(bolusUtils.isInterruptedBolus(cancelledInNormalCombo)).to.be.true;
      expect(bolusUtils.isInterruptedBolus(cancelledInExtendedCombo)).to.be.true;
      expect(bolusUtils.isInterruptedBolus(comboUnderrideCancelled)).to.be.true;
    });

    it('should return `false` on an override or underride', () => {
      expect(bolusUtils.isInterruptedBolus(override)).to.be.false;
      expect(bolusUtils.isInterruptedBolus(underride)).to.be.false;
      expect(bolusUtils.isInterruptedBolus(comboOverride)).to.be.false;
      expect(bolusUtils.isInterruptedBolus(extendedUnderride)).to.be.false;
    });
  });

  describe('isOverride', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.isOverride);
    });

    it('should return `false` on all non-override boluses', () => {
      expect(bolusUtils.isOverride(normal)).to.be.false;
      expect(bolusUtils.isOverride(cancelled)).to.be.false;
      expect(bolusUtils.isOverride(underride)).to.be.false;
      expect(bolusUtils.isOverride(combo)).to.be.false;
      expect(bolusUtils.isOverride(cancelledInNormalCombo)).to.be.false;
      expect(bolusUtils.isOverride(cancelledInExtendedCombo)).to.be.false;
      expect(bolusUtils.isOverride(comboUnderrideCancelled)).to.be.false;
      expect(bolusUtils.isOverride(extended)).to.be.false;
      expect(bolusUtils.isOverride(cancelledExtended)).to.be.false;
      expect(bolusUtils.isOverride(immediatelyCancelledExtended)).to.be.false;
      expect(bolusUtils.isOverride(extendedUnderride)).to.be.false;
      expect(bolusUtils.isOverride(withNetRec)).to.be.false;
    });

    it('should return `true` on all overridden boluses', () => {
      expect(bolusUtils.isOverride(override)).to.be.true;
      expect(bolusUtils.isOverride(comboOverride)).to.be.true;
    });
  });

  describe('isUnderride', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.isUnderride);
    });

    it('should return `false` on all non-underride boluses', () => {
      expect(bolusUtils.isOverride(normal)).to.be.false;
      expect(bolusUtils.isOverride(cancelled)).to.be.false;
      expect(bolusUtils.isOverride(override)).to.be.true;
      expect(bolusUtils.isOverride(combo)).to.be.false;
      expect(bolusUtils.isOverride(cancelledInNormalCombo)).to.be.false;
      expect(bolusUtils.isOverride(cancelledInExtendedCombo)).to.be.false;
      expect(bolusUtils.isOverride(comboOverride)).to.be.true;
      expect(bolusUtils.isOverride(comboUnderrideCancelled)).to.be.false;
      expect(bolusUtils.isOverride(extended)).to.be.false;
      expect(bolusUtils.isOverride(cancelledExtended)).to.be.false;
      expect(bolusUtils.isOverride(immediatelyCancelledExtended)).to.be.false;
      expect(bolusUtils.isOverride(withNetRec)).to.be.false;
    });

    it('should return `true` on all underridden boluses', () => {
      expect(bolusUtils.isOverride(underride)).to.be.false;
      expect(bolusUtils.isOverride(extendedUnderride)).to.be.false;
    });
  });
});
