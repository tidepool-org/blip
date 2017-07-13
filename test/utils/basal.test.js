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

import * as basals from '../../data/basal/fixtures';
import * as basalUtils from '../../src/utils/basal';

describe('basal utilties', () => {
  describe('getBasalSequences', () => {
    it('should be a function', () => {
      assert.isFunction(basalUtils.getBasalSequences);
    });

    it('should return one sequence for scheduled flat-rate basals across midnight', () => {
      expect(basalUtils.getBasalSequences(basals.scheduledFlat))
        .to.deep.equal([basals.scheduledFlat]);
    });

    it('should return one sequence for uninterrupted scheduled basals', () => {
      expect(basalUtils.getBasalSequences(basals.scheduledNonFlat))
        .to.deep.equal([basals.scheduledNonFlat]);
    });

    it(`should return three sequences for scheduled basals interrupted by
       a non-schedule-crossing temp basal (or suspend)`, () => {
      expect(basalUtils.getBasalSequences(basals.simpleNegativeTemp))
        .to.deep.equal([
          basals.simpleNegativeTemp.slice(0, 3),
          basals.simpleNegativeTemp.slice(3, 4),
          basals.simpleNegativeTemp.slice(4),
        ]);
    });

    it(`should return four sequences for scheduled basals interrupted by
      a schedule-crossing temp basal (or suspend)`, () => {
      expect(basalUtils.getBasalSequences(basals.suspendAcrossScheduled))
        .to.deep.equal([
          basals.suspendAcrossScheduled.slice(0, 3),
          basals.suspendAcrossScheduled.slice(3, 4),
          basals.suspendAcrossScheduled.slice(4, 5),
          basals.suspendAcrossScheduled.slice(5),
        ]);
    });
  });

  describe('getTotalBasal', () => {
    it('should be a function', () => {
      assert.isFunction(basalUtils.getTotalBasal);
    });

    it('should return 0 on an empty array', () => {
      expect(basalUtils.getTotalBasal([])).to.equal(0);
    });

    it('should return 0 on an array consisting of only 0 basals', () => {
      expect(basalUtils.getTotalBasal([{
        duration: 36e5,
        rate: 0,
      }, {
        duration: 23 * 36e5,
        rate: 0,
      }])).to.equal(0);
    });

    it('should return 11.25 on 3 hrs of 0.25 U/hr basal and 21 hrs of 0.5 U/hr', () => {
      expect(basalUtils.getTotalBasal([{
        duration: 36e5 * 3,
        rate: 0.25,
      }, {
        duration: 21 * 36e5,
        rate: 0.5,
      }])).to.equal(11.25);
    });
  });
});
