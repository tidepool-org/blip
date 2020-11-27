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

import * as basals from '../../../data/basal/fixtures';
import { detail } from '../../helpers/scales';
const { detailXScale, detailBasalScale, detailHeight } = detail;

import { calculateBasalPath, getBasalSequencePaths } from '../../../src/modules/render/basal';
import { getBasalSequences } from '../../../src/utils/basal';

describe('basal path generators', () => {
  describe('calculateBasalPath', () => {
    it('should be a function', () => {
      assert.isFunction(calculateBasalPath);
    });

    it('should produce path with `M` (moveTo) in the middle when basals are discontinuous', () => {
      expect(calculateBasalPath(
        basals.discontinuous, detailXScale, detailBasalScale, {
          endAtZero: false,
          flushBottomOffset: -0.5,
          isFilled: false,
          startAtZero: false,
        }
      ).match(/M /g).length).to.equal(3);
    });

    it('should render a zero temp or suspend basal flush with the bottom of the scale', () => {
      const offset = -0.5;
      const path = calculateBasalPath(
        basals.simpleSuspend, detailXScale, detailBasalScale, {
          endAtZero: false,
          flushBottomOffset: offset,
          isFilled: false,
          startAtZero: false,
        }
      );
      const flushWithBottomOfScale = detailBasalScale.range()[0] + offset;
      let count = 0;
      _.each(
        path.split('L'),
        (coords) => {
          if (parseFloat(coords.split(',')[1].trim()) === flushWithBottomOfScale) {
            count += 1;
          }
        }
      );
      expect(count).to.equal(2);
    });
  });

  describe('getBasalSequencePaths', () => {
    it('should be a function', () => {
      assert.isFunction(getBasalSequencePaths);
    });

    it('should error if basalSequence provided without a consistent `subType`', () => {
      const seq1 = [{
        type: 'basal',
        deliveryType: 'temp',
      }];
      const fn1 = () => { getBasalSequencePaths(seq1, detailXScale, detailBasalScale); };
      expect(fn1).to.throw('Cannot determine `subType` of basal sequence!');
      const seq2 = [{
        type: 'basal',
        subType: 'temp',
      }, {
        type: 'basal',
        subType: 'scheduled',
      }];
      const fn2 = () => { getBasalSequencePaths(seq2, detailXScale, detailBasalScale); };
      expect(fn2).to.throw('A basal sequence may contain only *one* `subType` of basal event.');
    });

    it(`should produce a path with type \`fill--scheduled\` for
       a scheduled flat-rate basal sequence`, () => {
      const paths = getBasalSequencePaths(
        getBasalSequences(basals.scheduledFlat)[0], detailXScale, detailBasalScale
      );
      expect(paths.length).to.equal(1);
      expect(paths[0].type).to.equal('fill--scheduled');
    });

    it(`should produce paths with types \`fill--temp\` and \`border--undelivered\` for
       a temp basal sequence`, () => {
      const paths = getBasalSequencePaths(
        getBasalSequences(basals.simplePositiveTemp)[1], detailXScale, detailBasalScale
      );
      expect(paths.length).to.equal(2);
      expect(paths[0].type).to.equal('fill--temp');
      expect(paths[1].type).to.equal('border--undelivered');
    });

    it(`should produce a path with type \`border--undelivered\` for
       a suspend basal sequence`, () => {
      const paths = getBasalSequencePaths(
        getBasalSequences(basals.suspendAcrossScheduled)[1], detailXScale, detailBasalScale
      );
      expect(paths.length).to.equal(1);
      expect(paths[0].type).to.equal('border--undelivered');
    });

    it(`should produce a path with type \`border--undelivered--automated\` for
       a suspend basal sequence suppressing automated delivery`, () => {
      const paths = getBasalSequencePaths(
        getBasalSequences(basals.automatedWithSuspend)[1], detailXScale, detailBasalScale
      );
      expect(paths.length).to.equal(1);
      expect(paths[0].type).to.equal('border--undelivered--automated');
    });

    it(`should render at the baseline for a suspend basal sequence suppressing
       automated delivery`, () => {
      const paths = getBasalSequencePaths(
        getBasalSequences(basals.automatedWithSuspend)[1], detailXScale, detailBasalScale
      );
      expect(paths.length).to.equal(1);
      expect(detailHeight).to.equal(100);

      // Initial move to and line at the baseline of 100
      expect(paths[0].d).to.match(/^M -?\d.,100 L -?\d.,100/);
    });
  });
});
