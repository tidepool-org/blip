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
import _ from 'lodash';
import { assert, expect } from 'chai';

import * as bolusUtils from '../../src/utils/bolus';

/* eslint-disable no-unused-vars */

const normal = {
  normal: 5,
};

const cancelled = {
  normal: 2,
  expectedNormal: 5,
};

const immediatelyCancelled = {
  normal: 0,
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

const immediatelyCancelledExtendedWizard = {
  type: 'wizard',
  bgTarget: {
    target: 100,
  },
  bolus: {
    normal: 0,
    extended: 0,
    expectedNormal: 2,
    expectedExtended: 3,
    duration: 0,
    expectedDuration: 3600000,
    normalTime: '2017-11-11T05:45:52.000Z',
  },
  recommended: {
    net: 5,
    carb: 5,
    correction: 2,
  },
  carbInput: 75,
  bgInput: 280,
  insulinSensitivity: 70,
  insulinOnBoard: 10,
  insulinCarbRatio: 15,
  normalTime: '2017-11-11T05:45:52.000Z',
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

const withCarbInput = {
  type: 'wizard',
  bolus: {
    normal: 5,
  },
  recommended: {
    carb: 5,
    correction: 0,
    net: 5,
  },
  carbInput: 75,
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
      const obj = { type: 'wizard', bolus: { type: 'bolus', normal: 5 } };
      expect(bolusUtils.getBolusFromInsulinEvent(obj)).to.equal(obj.bolus);
    });
  });

  describe('getCarbs', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getCarbs);
    });

    it('should return NaN on a bolus (rather than wizard) event', () => {
      expect(Number.isNaN(bolusUtils.getCarbs(normal))).to.be.true;
    });

    it('should return `null` on a wizard that lacks `carbInput`', () => {
      expect(bolusUtils.getCarbs(override)).to.be.null;
      const overrideNullCarbInput = _.assign({}, override, { carbInput: null });
      expect(bolusUtils.getCarbs(overrideNullCarbInput)).to.be.null;
    });

    it('should return the `carbInput` from a wizard', () => {
      expect(bolusUtils.getCarbs(withCarbInput)).to.equal(withCarbInput.carbInput);
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

    it('should return the `expectedExtended` for an immediately cancelled extended', () => {
      expect(bolusUtils.getProgrammed(immediatelyCancelledExtended)).to.equal(
        immediatelyCancelledExtended.expectedExtended
      );
    });

    it(`should return the \`expectedNormal\` and \`expectedExtended\` for an immediately
        cancelled extended wizard`, () => {
      expect(bolusUtils.getProgrammed(immediatelyCancelledExtendedWizard)).to.equal(
        immediatelyCancelledExtendedWizard.bolus.expectedExtended +
        immediatelyCancelledExtendedWizard.bolus.expectedNormal
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

    it('should return the `extended` for an immediately cancelled extended', () => {
      expect(bolusUtils.getDelivered(immediatelyCancelledExtended)).to.equal(
        immediatelyCancelledExtended.extended
      );
    });

    it(`should return the \`normal\` and \`extended\` for an immediately
        cancelled extended wizard`, () => {
      expect(bolusUtils.getDelivered(immediatelyCancelledExtendedWizard)).to.equal(
        immediatelyCancelledExtendedWizard.bolus.extended +
        immediatelyCancelledExtendedWizard.bolus.normal
      );
    });
  });

  describe('getDuration', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getDuration);
    });

    it('should return `NaN` on any bolus that only has `normal` delivery', () => {
      expect(Number.isNaN(bolusUtils.getDuration(normal))).to.be.true;
      expect(Number.isNaN(bolusUtils.getDuration(cancelled))).to.be.true;
      expect(Number.isNaN(bolusUtils.getDuration(override))).to.be.true;
      expect(Number.isNaN(bolusUtils.getDuration(underride))).to.be.true;
    });

    it('should return the `duration` of any bolus with a `duration`', () => {
      expect(bolusUtils.getDuration(combo)).to.equal(combo.duration);
      expect(bolusUtils.getDuration(cancelledInExtendedCombo))
        .to.equal(cancelledInExtendedCombo.duration);
      expect(bolusUtils.getDuration(comboUnderrideCancelled))
        .to.equal(comboUnderrideCancelled.bolus.duration);
      expect(bolusUtils.getDuration(extended)).to.equal(extended.duration);
      expect(bolusUtils.getDuration(cancelledExtended)).to.equal(cancelledExtended.duration);
    });

    it('should return a `duration` that is 0', () => {
      expect(bolusUtils.getDuration(cancelledInNormalCombo))
        .to.equal(0);
      expect(bolusUtils.getDuration(immediatelyCancelledExtended))
        .to.equal(0);
    });
  });

  describe('getExtended', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getExtended);
    });

    it('should return `NaN` on any bolus that only has `normal` delivery', () => {
      expect(Number.isNaN(bolusUtils.getExtended(normal))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtended(cancelled))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtended(override))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtended(underride))).to.be.true;
    });

    it('should return the `extended` or any bolus with an `extended` portion', () => {
      expect(bolusUtils.getExtended(combo)).to.equal(combo.extended);
      expect(bolusUtils.getExtended(cancelledInExtendedCombo))
        .to.equal(cancelledInExtendedCombo.extended);
      expect(bolusUtils.getExtended(comboOverride)).to.equal(comboOverride.bolus.extended);
      expect(bolusUtils.getExtended(comboUnderrideCancelled))
        .to.equal(comboUnderrideCancelled.bolus.extended);
      expect(bolusUtils.getExtended(extended)).to.equal(extended.extended);
      expect(bolusUtils.getExtended(cancelledExtended)).to.equal(cancelledExtended.extended);
      expect(bolusUtils.getExtended(extendedUnderride)).to.equal(extendedUnderride.bolus.extended);
    });

    it('should return an `extended` value that is 0', () => {
      expect(bolusUtils.getExtended(cancelledInNormalCombo))
        .to.equal(0);
      expect(bolusUtils.getExtended(immediatelyCancelledExtended))
        .to.equal(0);
    });
  });

  describe('getExtendedPercentage', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getExtendedPercentage);
    });

    it('should return NaN on a non-combo bolus', () => {
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(normal))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(cancelled))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(override))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(underride))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(withNetRec))).to.be.true;
    });

    it('should return the extended percentage as a String with `%` suffix', () => {
      expect(bolusUtils.getExtendedPercentage(combo)).to.equal('67%');
      expect(bolusUtils.getExtendedPercentage(comboOverride)).to.equal('63%');
    });

    it('should calculate the extended percentage based on programmed values', () => {
      expect(bolusUtils.getExtendedPercentage(cancelledInNormalCombo)).to.equal('67%');
      expect(bolusUtils.getExtendedPercentage(cancelledInExtendedCombo)).to.equal('67%');
      expect(bolusUtils.getExtendedPercentage(comboUnderrideCancelled)).to.equal('75%');
    });

    it('should return NaN for an extended-only ("square") bolus', () => {
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(extended))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(cancelledExtended))).to.be.true;
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(immediatelyCancelledExtended)))
        .to.be.true;
      expect(Number.isNaN(bolusUtils.getExtendedPercentage(extendedUnderride))).to.be.true;
    });

    it(`should throw an error on a \`normal\`-cancelled \`combo\` bolus
        with no \`expectedExtended\``, () => {
      const fn = () => { bolusUtils.getExtendedPercentage(doesNotExist); };
      expect(fn).to.throw(
        'Combo bolus found with a cancelled `normal` portion and non-cancelled `extended`!'
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

  describe('getNormalPercentage', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getNormalPercentage);
    });

    it('should return NaN on a non-combo bolus', () => {
      expect(Number.isNaN(bolusUtils.getNormalPercentage(normal))).to.be.true;
      expect(Number.isNaN(bolusUtils.getNormalPercentage(cancelled))).to.be.true;
      expect(Number.isNaN(bolusUtils.getNormalPercentage(override))).to.be.true;
      expect(Number.isNaN(bolusUtils.getNormalPercentage(underride))).to.be.true;
      expect(Number.isNaN(bolusUtils.getNormalPercentage(withNetRec))).to.be.true;
    });

    it('should return the extended percentage as a String with `%` suffix', () => {
      expect(bolusUtils.getNormalPercentage(combo)).to.equal('33%');
      expect(bolusUtils.getNormalPercentage(comboOverride)).to.equal('38%');
    });

    it('should calculate the extended percentage based on programmed values', () => {
      expect(bolusUtils.getNormalPercentage(cancelledInNormalCombo)).to.equal('33%');
      expect(bolusUtils.getNormalPercentage(cancelledInExtendedCombo)).to.equal('33%');
      expect(bolusUtils.getNormalPercentage(comboUnderrideCancelled)).to.equal('25%');
    });

    it('should return NaN for an extended-only ("square") bolus', () => {
      expect(Number.isNaN(bolusUtils.getNormalPercentage(extended))).to.be.true;
      expect(Number.isNaN(bolusUtils.getNormalPercentage(cancelledExtended))).to.be.true;
      expect(Number.isNaN(bolusUtils.getNormalPercentage(immediatelyCancelledExtended)))
        .to.be.true;
      expect(Number.isNaN(bolusUtils.getNormalPercentage(extendedUnderride))).to.be.true;
    });

    it(`should throw an error on a \`normal\`-cancelled \`combo\` bolus
        with no \`expectedExtended\``, () => {
      const fn = () => { bolusUtils.getNormalPercentage(doesNotExist); };
      expect(fn).to.throw(
        'Combo bolus found with a cancelled `normal` portion and non-cancelled `extended`!'
      );
    });
  });

  describe('getTotalBolus', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.getTotalBolus);
    });

    it('should return 0 on an empty array', () => {
      expect(bolusUtils.getTotalBolus([])).to.equal(0);
    });

    it('should return the total actual delivered insulin on an assortment of boluses', () => {
      expect(bolusUtils.getTotalBolus([
        cancelled, // 2,
        cancelledInExtendedCombo, // 1.5,
        extendedUnderride, // 3,
        comboOverride, // 4
      ])).to.equal(10.5);
    });
  });

  describe('hasExtended', () => {
    it('should be a function', () => {
      assert.isFunction(bolusUtils.hasExtended);
    });

    it('should return `false` on any bolus that only has `normal` delivery', () => {
      expect(bolusUtils.hasExtended(normal)).to.be.false;
      expect(bolusUtils.hasExtended(cancelled)).to.be.false;
      expect(bolusUtils.hasExtended(override)).to.be.false;
      expect(bolusUtils.hasExtended(underride)).to.be.false;
      expect(bolusUtils.hasExtended(withNetRec)).to.be.false;
    });

    it('should return `true` on any bolus that has non-zero `extended` delivery', () => {
      expect(bolusUtils.hasExtended(combo)).to.be.true;
      expect(bolusUtils.hasExtended(cancelledInExtendedCombo)).to.be.true;
      expect(bolusUtils.hasExtended(comboOverride)).to.be.true;
      expect(bolusUtils.hasExtended(comboUnderrideCancelled)).to.be.true;
      expect(bolusUtils.hasExtended(extended)).to.be.true;
      expect(bolusUtils.hasExtended(cancelledExtended)).to.be.true;
      expect(bolusUtils.hasExtended(extendedUnderride)).to.be.true;
    });

    it('should return `true` on a bolus with zero `extended`, non-zero `expectedExtended`', () => {
      expect(bolusUtils.hasExtended(cancelledInNormalCombo)).to.be.true;
      expect(bolusUtils.hasExtended(immediatelyCancelledExtended)).to.be.true;
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

    it('should return `true` on an immediately cancelled `normal` bolus', () => {
      expect(bolusUtils.isInterruptedBolus(immediatelyCancelled)).to.be.true;
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
