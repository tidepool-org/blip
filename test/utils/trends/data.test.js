/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

/* eslint-env node, mocha */

import { range } from 'd3-array';

import * as utils from '../../../src/utils/trends/data';

describe('[trends] data utils', () => {
  describe('findTimeOfDayBin', () => {
    it('should be a function', () => {
      assert.isFunction(utils.findTimeOfDayBin);
    });

    describe('error conditions', () => {
      it('should error on a negative msPer24', () => {
        const fn = () => (utils.findTimeOfDayBin(1, -1));
        expect(fn).to.throw('`msPer24` < 0 or >= 86400000 is invalid!');
      });

      it('should error on a msPer24 = 864e5', () => {
        const fn = () => (utils.findTimeOfDayBin(1, 86400000));
        expect(fn).to.throw('`msPer24` < 0 or >= 86400000 is invalid!');
      });

      it('should error on a msPer24 > 864e5', () => {
        const fn = () => (utils.findTimeOfDayBin(1, 86400001));
        expect(fn).to.throw('`msPer24` < 0 or >= 86400000 is invalid!');
      });
    });

    describe('when `binSize` is one hour (3600000ms)', () => {
      const binSize = 1000 * 60 * 60;

      it('should assign a bin of `1800000` to a datum at time 0', () => {
        expect(utils.findTimeOfDayBin(binSize, 0)).to.equal(1800000);
      });

      it('should assign a bin of `1800000` to a datum at time 3600000', () => {
        expect(utils.findTimeOfDayBin(binSize, 3600000)).to.equal(1800000);
      });

      it('should assign a bin of `5400000` to a datum at time 3600001', () => {
        expect(utils.findTimeOfDayBin(binSize, 3600001)).to.equal(5400000);
      });

      it('should assign a bin of `5400000` to a datum at time 7199999', () => {
        expect(utils.findTimeOfDayBin(binSize, 7199999)).to.equal(5400000);
      });
    });

    describe('when `binSize` is thirty minutes (1800000ms)', () => {
      const binSize = 1000 * 60 * 30;

      it('should assign a bin of `900000` to a datum at time 0', () => {
        expect(utils.findTimeOfDayBin(binSize, 0)).to.equal(900000);
      });

      it('should assign a bin of `2700000` to a datum at time 3600000', () => {
        expect(utils.findTimeOfDayBin(binSize, 3600000)).to.equal(2700000);
      });

      it('should assign a bin of `4500000` to a datum at time 3600001', () => {
        expect(utils.findTimeOfDayBin(binSize, 3600001)).to.equal(4500000);
      });

      it('should assign a bin of `6300000` to a datum at time 7199999', () => {
        expect(utils.findTimeOfDayBin(binSize, 7199999)).to.equal(6300000);
      });
    });
  });

  describe('mungeDataForBin', () => {
    const bin = 900000;
    const binKey = bin.toString();
    const binSize = 1000 * 60 * 30;
    const min = 0;
    const max = 100;
    const data = range(min, max + 1);

    const res = utils.mungeDataForBin(binKey, binSize, data);

    it('should be a function', () => {
      assert.isFunction(utils.mungeDataForBin);
    });

    it('should add the `binKey` as the `id` on the resulting object', () => {
      assert.isString(res.id);
      expect(res.id).to.equal(binKey);
    });

    it('should add the minimum as the `min` on the resulting object', () => {
      expect(res.min).to.equal(min);
    });

    it('should add the 10th quantile as the `tenthQuantile` on the resulting object', () => {
      expect(res.tenthQuantile).to.equal(10);
    });

    it('should add the first quartile as the `firstQuartile` on the resulting object', () => {
      expect(res.firstQuartile).to.equal(25);
    });

    it('should add the median as `median` on the resulting object', () => {
      expect(res.median).to.equal(50);
    });

    it('should add the third quartile as the `thirdQuartile` on the resulting object', () => {
      expect(res.thirdQuartile).to.equal(75);
    });

    it('should add the 90th quantile as the `ninetiethQuantile` on the resulting object', () => {
      expect(res.ninetiethQuantile).to.equal(90);
    });

    it('should add the maximum as the `max` on the resulting object', () => {
      expect(res.max).to.equal(max);
    });

    it('should add the bin as `msX` on the resulting object', () => {
      expect(res.msX).to.equal(bin);
    });

    it('should add a `msFrom` to the resulting object half a bin earlier', () => {
      expect(res.msFrom).to.equal(0);
    });

    it('should add a `msTo` to the resulting object half a bin later', () => {
      expect(res.msTo).to.equal(1800000);
    });
  });
});
