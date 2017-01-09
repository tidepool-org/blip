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

import * as bgUtils from '../../src/utils/bloodglucose';

describe('blood glucose utilities', () => {
  describe('classifyBgValue', () => {
    const bgBounds = {
      targetUpperBound: 180,
      targetLowerBound: 70,
    };

    it('should be a function', () => {
      assert.isFunction(bgUtils.classifyBgValue);
    });

    it('should error if no `bgBounds` with numerical lower & upper bounds provided', () => {
      const fn1 = () => { bgUtils.classifyBgValue(null, 100); };
      expect(fn1).to.throw(
        'You must provide a `bgBounds` object with a `targetLowerBound` and a `targetUpperBound`!'
      );
      const fn2 = () => { bgUtils.classifyBgValue(undefined, 100); };
      expect(fn2).to.throw(
        'You must provide a `bgBounds` object with a `targetLowerBound` and a `targetUpperBound`!'
      );
      const fn3 = () => { bgUtils.classifyBgValue({}, 100); };
      expect(fn3).to.throw(
        'You must provide a `bgBounds` object with a `targetLowerBound` and a `targetUpperBound`!'
      );
      const fn4 = () => { bgUtils.classifyBgValue({ foo: 'bar' }, 100); };
      expect(fn4).to.throw(
        'You must provide a `bgBounds` object with a `targetLowerBound` and a `targetUpperBound`!'
      );
      const fn5 = () => {
        bgUtils.classifyBgValue({ targetLowerBound: 80, targetUpperBound: 'one eighty' }, 100);
      };
      expect(fn5).to.throw(
        'You must provide a `bgBounds` object with a `targetLowerBound` and a `targetUpperBound`!'
      );
    });

    it('should error if no `bgValue` or non-numerical `bgValue`', () => {
      const fn0 = () => { bgUtils.classifyBgValue(bgBounds); };
      expect(fn0).to.throw(
        'You must provide a positive, numerical blood glucose value to categorize!'
      );
      const fn1 = () => { bgUtils.classifyBgValue(bgBounds, null); };
      expect(fn1).to.throw(
        'You must provide a positive, numerical blood glucose value to categorize!'
      );
      const fn2 = () => { bgUtils.classifyBgValue(bgBounds, undefined); };
      expect(fn2).to.throw(
        'You must provide a positive, numerical blood glucose value to categorize!'
      );
      const fn3 = () => { bgUtils.classifyBgValue(bgBounds, {}); };
      expect(fn3).to.throw(
        'You must provide a positive, numerical blood glucose value to categorize!'
      );
      const fn4 = () => { bgUtils.classifyBgValue(bgBounds, -100); };
      expect(fn4).to.throw(
        'You must provide a positive, numerical blood glucose value to categorize!'
      );
      const fn5 = () => { bgUtils.classifyBgValue(bgBounds, 4.4); };
      expect(fn5).to.not.throw;
      const fn6 = () => { bgUtils.classifyBgValue(bgBounds, 100); };
      expect(fn6).to.not.throw;
    });

    it('should return `low` for a value < the `targetLowerBound`', () => {
      expect(bgUtils.classifyBgValue(bgBounds, 69)).to.equal('low');
    });

    it('should return `target` for a value equal to the `targetLowerBound`', () => {
      expect(bgUtils.classifyBgValue(bgBounds, 70)).to.equal('target');
    });

    it('should return `target` for a value > `targetLowerBound` and < `targetUpperBound`', () => {
      expect(bgUtils.classifyBgValue(bgBounds, 100)).to.equal('target');
    });

    it('should return `target` for a value equal to the `targetUpperBound`', () => {
      expect(bgUtils.classifyBgValue(bgBounds, 180)).to.equal('target');
    });

    it('should return `high` for a value > the `targetUpperBound`', () => {
      expect(bgUtils.classifyBgValue(bgBounds, 181)).to.equal('high');
    });
  });
});
