/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var commonbolus = require('../js/plot/util/commonbolus');

describe('common bolus functions', function() {
  var fixtures = {
    normal: {
      normal: 1.0
    },
    square: {
      extended: 2.0,
      duration: 3600000,
    },
    dual: {
      normal: 1.0,
      extended: 2.0,
      duration: 3600000
    },
    cancelled: {
      normal: 0.1,
      expectedNormal: 1.0
    },
    cancelledSquare: {
      extended: 0.2,
      expectedExtended: 2.0,
      duration: 360000,
      expectedDuration: 3600000
    },
    cancelledEarlyDual: {
      normal: 0.2,
      expectedNormal: 1.0,
      extended: 0.0,
      expectedExtended: 2.0,
      duration: 0,
      expectedDuration: 3600000
    },
    cancelledLateDual: {
      normal: 1.0,
      extended: 0.5,
      expectedExtended: 2.0,
      duration: 900000,
      expectedDuration: 3600000
    },
    immediatelyCancelledSquare: {
      extended: 0,
      expectedExtended: 2.0,
      duration: 0,
      expectedDuration: 3600000
    },
    underride: {
      type: 'wizard',
      bolus: {
        normal: 1.0
      },
      recommended: {
        carb: 1.0,
        correction: 0.5
      }
    },
    override: {
      type: 'wizard',
      bolus: {
        normal: 2.0
      },
      recommended: {
        carb: 0.0,
        correction: 0.0
      }
    },
    squareUnderride: {
      type: 'wizard',
      bolus: {
        extended: 3.0,
      },
      recommended: {
        correction: 3.5
      }
    },
    dualOverride: {
      type: 'wizard',
      bolus: {
        normal: 1.5,
        extended: 2.5
      },
      recommended: {
        carb: 3.0
      }
    },
    dualUnderrideCancelled: {
      type: 'wizard',
      bolus: {
        normal: 1.0,
        extended: 1.0,
        expectedExtended: 3.0,
        duration: 1200000,
        expectedDuration: 3600000
      },
      recommended: {
        carb: 5.0
      }
    },
    withNetRec: {
      type: 'wizard',
      bolus: {
        normal: 1.0
      },
      recommended: {
        net: 2.0
      }
    }
  };

  describe('getRecommended', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getRecommended);
    });

    it('should return NaN when no recommended', function() {
      expect(isNaN(commonbolus.getRecommended(fixtures.normal))).to.be.true;
    });

    it('should return 0.0 when override of suggestion of no bolus', function() {
      expect(commonbolus.getRecommended(fixtures.override)).to.equal(0.0);
    });

    it('should return total when both carb and correction recs exist', function() {
      var rec = fixtures.underride.recommended;
      expect(commonbolus.getRecommended(fixtures.underride)).to.equal(rec.carb + rec.correction);
    });

    it('should return carb rec when only carb rec exists', function() {
      expect(commonbolus.getRecommended(fixtures.dualOverride)).to.equal(fixtures.dualOverride.recommended.carb);
    });

    it('should return correction rec when only correction rec exists', function() {
      expect(commonbolus.getRecommended(fixtures.squareUnderride)).to.equal(fixtures.squareUnderride.recommended.correction);
    });

    it('should return net rec when net rec exists', function() {
      expect(commonbolus.getRecommended(fixtures.withNetRec)).to.equal(fixtures.withNetRec.recommended.net);
    });
  });

  describe('getMaxValue', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getMaxValue);
    });

    it('should return NaN if type `wizard` and no bolus attached', function() {
      expect(isNaN(commonbolus.getMaxValue({type: 'wizard'}))).to.be.true;
    });

    it('should return the value of a run-of-the-mill normal bolus', function() {
      expect(commonbolus.getMaxValue(fixtures.normal)).to.equal(fixtures.normal.normal);
    });

    it('should return the value of a run-of-the-mill square bolus', function() {
      expect(commonbolus.getMaxValue(fixtures.square)).to.equal(fixtures.square.extended);
    });

    it('should return the combined normal and extended of a run-of-the-mill dual-wave bolus', function() {
      var total = fixtures.dual.normal + fixtures.dual.extended;
      expect(commonbolus.getMaxValue(fixtures.dual)).to.equal(total);
    });

    it('should return the programmed value of a cancelled normal bolus', function() {
      expect(commonbolus.getMaxValue(fixtures.cancelled)).to.equal(fixtures.cancelled.expectedNormal);
    });

    it('should return the programmed value of a cancelled extended bolus', function() {
      expect(commonbolus.getMaxValue(fixtures.cancelledSquare)).to.equal(fixtures.cancelledSquare.expectedExtended);
    });

    it('should return the combo programmed values of an early cancelled dual-wave bolus', function() {
      var total = fixtures.cancelledEarlyDual.expectedNormal + fixtures.cancelledEarlyDual.expectedExtended;
      expect(commonbolus.getMaxValue(fixtures.cancelledEarlyDual)).to.equal(total);
    });

    it('should return the combo programmed values of a late cancelled dual-wave bolus', function() {
      var total = fixtures.cancelledLateDual.normal + fixtures.cancelledLateDual.expectedExtended;
      expect(commonbolus.getMaxValue(fixtures.cancelledLateDual)).to.equal(total);
    });

    it('should return the recommendation in the case of an underride', function() {
      var rec = commonbolus.getRecommended(fixtures.underride);
      expect(commonbolus.getMaxValue(fixtures.underride)).to.equal(rec);
    });

    it('should return the delivered in the case of an override', function() {
      expect(commonbolus.getMaxValue(fixtures.override)).to.equal(fixtures.override.bolus.normal);
    });

    it('should return the recommendation in the case of a square underride', function() {
      var rec = commonbolus.getRecommended(fixtures.squareUnderride);
      expect(commonbolus.getMaxValue(fixtures.squareUnderride)).to.equal(rec);
    });

    it('should return the delivered in the case of a dual-wave override', function() {
      var total = fixtures.dualOverride.bolus.normal + fixtures.dualOverride.bolus.extended;
      expect(commonbolus.getMaxValue(fixtures.dualOverride)).to.equal(total);
    });

    it('should return the recommendation in the case of a cancelled dual-wave underride', function() {
      var rec = commonbolus.getRecommended(fixtures.dualUnderrideCancelled);
      expect(commonbolus.getMaxValue(fixtures.dualUnderrideCancelled)).to.equal(rec);
    });
  });

  describe('getDelivered', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getDelivered);
    });

    it('should return NaN if type `wizard` and no bolus attached', function() {
      expect(isNaN(commonbolus.getDelivered({type: 'wizard'}))).to.be.true;
    });

    it('should return the value of a run-of-the-mill normal bolus', function() {
      expect(commonbolus.getDelivered(fixtures.normal)).to.equal(fixtures.normal.normal);
    });

    it('should return the value of a run-of-the-mill square bolus', function() {
      expect(commonbolus.getDelivered(fixtures.square)).to.equal(fixtures.square.extended);
    });

    it('should return the combined normal and extended of a run-of-the-mill dual-wave bolus', function() {
      var total = fixtures.dual.normal + fixtures.dual.extended;
      expect(commonbolus.getDelivered(fixtures.dual)).to.equal(total);
    });

    it('should return the delivered of a cancelled normal bolus', function() {
      expect(commonbolus.getDelivered(fixtures.cancelled)).to.equal(fixtures.cancelled.normal);
    });

    it('should return the delivered of a cancelled square bolus', function() {
      expect(commonbolus.getDelivered(fixtures.cancelledSquare)).to.equal(fixtures.cancelledSquare.extended);
    });

    it('should return the combined delivered of an early cancelled dual-wave bolus', function() {
      expect(commonbolus.getDelivered(fixtures.cancelledEarlyDual)).to.equal(fixtures.cancelledEarlyDual.normal);
    });

    it('should return the combined delivered of a late cancelled dual-wave bolus', function() {
      var total = fixtures.cancelledLateDual.normal + fixtures.cancelledLateDual.extended;
      expect(commonbolus.getDelivered(fixtures.cancelledLateDual)).to.equal(total);
    });

    it('should return the value of an underride', function() {
      expect(commonbolus.getDelivered(fixtures.underride)).to.equal(fixtures.underride.bolus.normal);
    });

    it('should return the value of an override', function() {
      expect(commonbolus.getDelivered(fixtures.override)).to.equal(fixtures.override.bolus.normal);
    });

    it('should return the value of a square underride', function() {
      expect(commonbolus.getDelivered(fixtures.squareUnderride)).to.equal(fixtures.squareUnderride.bolus.extended);
    });

    it('should return the value of a dual-wave override', function() {
      var total = fixtures.dualOverride.bolus.normal + fixtures.dualOverride.bolus.extended;
      expect(commonbolus.getDelivered(fixtures.dualOverride)).to.equal(total);
    });

    it('should return the delivered of a cancelled dual-wave underride', function() {
      var total = fixtures.dualUnderrideCancelled.bolus.normal + fixtures.dualUnderrideCancelled.bolus.extended;
      expect(commonbolus.getDelivered(fixtures.dualUnderrideCancelled)).to.equal(total);
    });
  });

  describe('getProgrammed', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getProgrammed);
    });

    it('should return NaN if type `wizard` and no bolus attached', function() {
      expect(isNaN(commonbolus.getProgrammed({type: 'wizard'}))).to.be.true;
    });

    it('should return the value of a run-of-the-mill normal bolus', function() {
      expect(commonbolus.getProgrammed(fixtures.normal)).to.equal(fixtures.normal.normal);
    });

    it('should return the value of a run-of-the-mill square bolus', function() {
      expect(commonbolus.getProgrammed(fixtures.square)).to.equal(fixtures.square.extended);
    });

    it('should return the combined normal and extended of a run-of-the-mill dual-wave bolus', function() {
      var total = fixtures.dual.normal + fixtures.dual.extended;
      expect(commonbolus.getProgrammed(fixtures.dual)).to.equal(total);
    });

    it('should return the programmed of a cancelled normal bolus', function() {
      expect(commonbolus.getProgrammed(fixtures.cancelled)).to.equal(fixtures.cancelled.expectedNormal);
    });

    it('should return the programmed of a cancelled square bolus', function() {
      expect(commonbolus.getProgrammed(fixtures.cancelledSquare)).to.equal(fixtures.cancelledSquare.expectedExtended);
    });

    it('should return the combined programmed of an early cancelled dual-wave bolus', function() {
      var total = fixtures.cancelledEarlyDual.expectedNormal + fixtures.cancelledEarlyDual.expectedExtended;
      expect(commonbolus.getProgrammed(fixtures.cancelledEarlyDual)).to.equal(total);
    });

    it('should return the combined programmed of a late cancelled dual-wave bolus', function() {
      var total = fixtures.cancelledLateDual.normal + fixtures.cancelledLateDual.expectedExtended;
      expect(commonbolus.getProgrammed(fixtures.cancelledLateDual)).to.equal(total);
    });

    it('should return the value of an underride', function() {
      expect(commonbolus.getProgrammed(fixtures.underride)).to.equal(fixtures.underride.bolus.normal);
    });

    it('should return the value of an override', function() {
      expect(commonbolus.getProgrammed(fixtures.override)).to.equal(fixtures.override.bolus.normal);
    });

    it('should return the value of a square underride', function() {
      expect(commonbolus.getProgrammed(fixtures.squareUnderride)).to.equal(fixtures.squareUnderride.bolus.extended);
    });

    it('should return the value of a dual-wave override', function() {
      var total = fixtures.dualOverride.bolus.normal + fixtures.dualOverride.bolus.extended;
      expect(commonbolus.getProgrammed(fixtures.dualOverride)).to.equal(total);
    });

    it('should return the programmed of a cancelled dual-wave underride', function() {
      var total = fixtures.dualUnderrideCancelled.bolus.normal + fixtures.dualUnderrideCancelled.bolus.expectedExtended;
      expect(commonbolus.getProgrammed(fixtures.dualUnderrideCancelled)).to.equal(total);
    });
  });

  describe('getMaxDuration', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getMaxDuration);
    });

    it('should return NaN on an non-extended bolus', function() {
      expect(isNaN(commonbolus.getMaxDuration(fixtures.normal))).to.be.true;
    });

    it('should return duration of a square bolus', function() {
      expect(commonbolus.getMaxDuration(fixtures.square)).to.equal(fixtures.square.duration);
    });

    it('should return expectedDuration of a cancelled square bolus', function() {
      expect(commonbolus.getMaxDuration(fixtures.cancelledSquare)).to.equal(fixtures.cancelledSquare.expectedDuration);
    });

    it('should return expectedDuration of a cancelled dual-wave underride', function() {
      expect(commonbolus.getMaxDuration(fixtures.dualUnderrideCancelled)).to.equal(fixtures.dualUnderrideCancelled.bolus.expectedDuration);
    });

    it('should return expectedDuration of an immediately cancelled square bolus (duration = 0)', function() {
      expect(commonbolus.getMaxDuration(fixtures.immediatelyCancelledSquare)).to.equal(fixtures.immediatelyCancelledSquare.expectedDuration);
    });
  });
});