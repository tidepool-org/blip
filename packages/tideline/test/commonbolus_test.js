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
      type: 'bolus',
      normal: 1.0
    },
    square: {
      type: 'bolus',
      extended: 2.0,
      duration: 3600000,
    },
    dual: {
      type: 'bolus',
      normal: 1.0,
      extended: 2.0,
      duration: 3600000
    },
    cancelled: {
      type: 'bolus',
      normal: 0.1,
      expectedNormal: 1.0
    },
    cancelledSquare: {
      type: 'bolus',
      extended: 0.2,
      expectedExtended: 2.0,
      duration: 360000,
      expectedDuration: 3600000
    },
    cancelledEarlyDual: {
      type: 'bolus',
      normal: 0.2,
      expectedNormal: 1.0,
      extended: 0.0,
      expectedExtended: 2.0,
      duration: 0,
      expectedDuration: 3600000
    },
    cancelledLateDual: {
      type: 'bolus',
      normal: 1.0,
      extended: 0.5,
      expectedExtended: 2.0,
      duration: 900000,
      expectedDuration: 3600000
    },
    immediatelyCancelledSquare: {
      type: 'bolus',
      extended: 0,
      expectedExtended: 2.0,
      duration: 0,
      expectedDuration: 3600000
    },
    underride: {
      type: 'wizard',
      bolus: {
        type: 'bolus',
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
        type: 'bolus',
        normal: 2.0
      },
      recommended: {
        carb: 0.0,
        correction: 0.0
      }
    },
    recommendedEmpty: {
      type: 'wizard',
      recommended: {
      },
      bolus: {
        type: 'bolus',
        normal: 0.3,
      }
    },
    recommendedEmptyBolus: {
      type: 'wizard',
      recommended: {
        net: 1.0,
      },
      bolus: {
        type: 'bolus'
      }
    },
    squareUnderride: {
      type: 'wizard',
      bolus: {
        type: 'bolus',
        extended: 3.0,
      },
      recommended: {
        correction: 3.5
      }
    },
    dualOverride: {
      type: 'wizard',
      bolus: {
        type: 'bolus',
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
        type: 'bolus',
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
        type: 'bolus',
        normal: 1.0
      },
      recommended: {
        net: 2.0
      }
    },
  };

  describe('getRecommended', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getRecommended);
    });

    it('should return NaN when no recommended', function() {
      expect(Number.isNaN(commonbolus.getRecommended(fixtures.normal))).to.be.true;
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
      expect(Number.isNaN(commonbolus.getMaxValue({type: 'wizard'}))).to.be.true;
    });

    it('should return the value of a run-of-the-mill normal bolus', function() {
      expect(commonbolus.getMaxValue(fixtures.normal)).to.equal(fixtures.normal.normal);
    });

    it('should return the programmed value of a cancelled normal bolus', function() {
      expect(commonbolus.getMaxValue(fixtures.cancelled)).to.equal(fixtures.cancelled.expectedNormal);
    });

    it('should return the delivered in the case of an override', function() {
      expect(commonbolus.getMaxValue(fixtures.override)).to.equal(fixtures.override.bolus.normal);
    });

    it('should return the programme bolus value when recommended is missing', () => {
      expect(commonbolus.getMaxValue(fixtures.recommendedEmpty)).to.be.equals(fixtures.recommendedEmpty.bolus.normal);
    });

    it('should return the recommended when bolus values not wrong', () => {
      expect(commonbolus.getMaxValue(fixtures.recommendedEmptyBolus)).to.be.equals(fixtures.recommendedEmptyBolus.recommended.net);
    });
  });

  describe('getDelivered', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getDelivered);
    });

    it('should return NaN if type `wizard` and no bolus attached', function() {
      expect(Number.isNaN(commonbolus.getDelivered({type: 'wizard'}))).to.be.true;
    });

    it('should return NaN if type `bolus` and missing normal value', function() {
      expect(Number.isNaN(commonbolus.getDelivered({type: 'bolus'}))).to.be.true;
    });

    it('should return the value of a run-of-the-mill normal bolus', function() {
      expect(commonbolus.getDelivered(fixtures.normal)).to.equal(fixtures.normal.normal);
    });

    it('should return the delivered of a cancelled normal bolus', function() {
      expect(commonbolus.getDelivered(fixtures.cancelled)).to.equal(fixtures.cancelled.normal);
    });
  });

  describe('getProgrammed', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getProgrammed);
    });

    it('should return NaN if type `wizard` and no bolus attached', function() {
      expect(Number.isNaN(commonbolus.getProgrammed({type: 'wizard'}))).to.be.true;
    });

    it('should return the value of a run-of-the-mill normal bolus', function() {
      expect(commonbolus.getProgrammed(fixtures.normal)).to.equal(fixtures.normal.normal);
    });

    it('should return the programmed of a cancelled normal bolus', function() {
      expect(commonbolus.getProgrammed(fixtures.cancelled)).to.equal(fixtures.cancelled.expectedNormal);
    });

    it('should return the value of an underride', function() {
      expect(commonbolus.getProgrammed(fixtures.underride)).to.equal(fixtures.underride.bolus.normal);
    });

    it('should return the value of an override', function() {
      expect(commonbolus.getProgrammed(fixtures.override)).to.equal(fixtures.override.bolus.normal);
    });
  });

  describe('getMaxDuration', function() {
    it('should be a function', function() {
      assert.isFunction(commonbolus.getMaxDuration);
    });

    it('should return NaN on an non-extended bolus', function() {
      expect(Number.isNaN(commonbolus.getMaxDuration(fixtures.normal))).to.be.true;
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
