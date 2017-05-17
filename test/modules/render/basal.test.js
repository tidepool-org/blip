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

// import * as basals from '../../../data/basal/fixtures';
import { detail } from '../../helpers/scales';
const { detailXScale, detailBasalScale } = detail;

import getBasalPaths, { calculateBasalPath } from '../../../src/modules/render/basal';

describe('basal path generators', () => {
  describe('calculateBasalPath', () => {
    it('should be a function', () => {
      assert.isFunction(calculateBasalPath);
    });
  });

  describe('getBasalPaths', () => {
    it('should be a function', () => {
      assert.isFunction(getBasalPaths);
    });

    it('should error if basalSequence provided without a consistent `subType`', () => {
      const seq1 = [{
        type: 'basal',
        deliveryType: 'temp',
      }];
      const fn1 = () => { getBasalPaths(seq1, detailXScale, detailBasalScale); };
      expect(fn1).to.throw('Cannot determine `subType` of basal sequence!');
      const seq2 = [{
        type: 'basal',
        subType: 'temp',
      }, {
        type: 'basal',
        subType: 'scheduled',
      }];
      const fn2 = () => { getBasalPaths(seq2, detailXScale, detailBasalScale); };
      expect(fn2).to.throw('A basal sequence may contain only *one* `subType` of basal event.');
    });
  });
});
