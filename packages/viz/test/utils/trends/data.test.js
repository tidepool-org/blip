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

import { range, shuffle } from 'd3-array';

import * as utils from '../../../src/utils/trends/data';

describe('[trends] data utils', () => {
  describe('determineRangeBoundaries', () => {
    it('should be a function', () => {
      assert.isFunction(utils.determineRangeBoundaries);
    });

    it('should return the max of all provided `low` thresholds', () => {
      expect(utils.determineRangeBoundaries([{
        value: 'low',
        threshold: 20,
      }, {
        value: 'low',
        threshold: 25,
      }, {
        value: 'low',
        threshold: 15,
      }])).to.deep.equal({ low: 25 });
    });

    it('should return the min of all provided `high` thresholds', () => {
      expect(utils.determineRangeBoundaries([{
        value: 'high',
        threshold: 650,
      }, {
        value: 'high',
        threshold: 500,
      }, {
        value: 'high',
        threshold: 600,
      }])).to.deep.equal({ high: 500 });
    });

    it('should return both boundaries when a mix of out-of-range objects is provided', () => {
      expect(utils.determineRangeBoundaries([{
        value: 'high',
        threshold: 500,
      }, {
        value: 'low',
        threshold: 20,
      }, {
        value: 'low',
        threshold: 40,
      }])).to.deep.equal({ low: 40, high: 500 });
    });
  });

  describe('findBinForTimeOfDay', () => {
    it('should be a function', () => {
      assert.isFunction(utils.findBinForTimeOfDay);
    });

    describe('error conditions', () => {
      it('should error on a negative msPer24', () => {
        const fn = () => (utils.findBinForTimeOfDay(1, -1));
        expect(fn).to.throw('`msPer24` < 0 or >= 86400000 is invalid!');
      });

      it('should error on a msPer24 = 864e5', () => {
        const fn = () => (utils.findBinForTimeOfDay(1, 86400000));
        expect(fn).to.throw('`msPer24` < 0 or >= 86400000 is invalid!');
      });

      it('should error on a msPer24 > 864e5', () => {
        const fn = () => (utils.findBinForTimeOfDay(1, 86400001));
        expect(fn).to.throw('`msPer24` < 0 or >= 86400000 is invalid!');
      });
    });

    describe('when `binSize` is one hour (3600000ms)', () => {
      const binSize = 1000 * 60 * 60;

      it('should assign a bin of `1800000` to a datum at time 0', () => {
        expect(utils.findBinForTimeOfDay(binSize, 0)).to.equal(1800000);
      });

      it('should assign a bin of `1800000` to a datum at time 3599999', () => {
        expect(utils.findBinForTimeOfDay(binSize, 3599999)).to.equal(1800000);
      });

      it('should assign a bin of `5400000` to a datum at time 3600000', () => {
        expect(utils.findBinForTimeOfDay(binSize, 3600000)).to.equal(5400000);
      });

      it('should assign a bin of `5400000` to a datum at time 7199999', () => {
        expect(utils.findBinForTimeOfDay(binSize, 7199999)).to.equal(5400000);
      });
    });

    describe('when `binSize` is thirty minutes (1800000ms)', () => {
      const binSize = 1000 * 60 * 30;

      it('should assign a bin of `900000` to a datum at time 0', () => {
        expect(utils.findBinForTimeOfDay(binSize, 0)).to.equal(900000);
      });

      it('should assign a bin of `2700000` to a datum at time 3599999', () => {
        expect(utils.findBinForTimeOfDay(binSize, 3599999)).to.equal(2700000);
      });

      it('should assign a bin of `4500000` to a datum at time 3600000', () => {
        expect(utils.findBinForTimeOfDay(binSize, 3600000)).to.equal(4500000);
      });

      it('should assign a bin of `6300000` to a datum at time 7199999', () => {
        expect(utils.findBinForTimeOfDay(binSize, 7199999)).to.equal(6300000);
      });
    });
  });

  describe('findDatesIntersectingWithCbgSliceSegment', () => {
    const focusedSlice = {
      data: {
        msFrom: 0,
        msTo: 10,
        ninetiethQuantile: 90,
        thirdQuartile: 75,
      },
    };
    const focusedSliceKeys = ['thirdQuartile', 'ninetiethQuantile'];
    const cbgData = [{
      // ms in range, value = bottom of range
      localDate: '2016-12-31',
      msPer24: 5,
      value: 75,
    }, {
      // ms in range, value = top of range
      localDate: '2016-12-25',
      msPer24: 5,
      value: 90,
    }, {
      // ms in range, value in range
      localDate: '2016-12-30',
      msPer24: 5,
      value: 80,
    }, {
      // ms at bottom (= in range), value in range
      localDate: '2016-12-26',
      msPer24: 0,
      value: 80,
    }, {
      // ms at top (out of range), value in range
      localDate: '2017-01-05',
      msPer24: 10,
      value: 80,
    }, {
      // ms in range, value below range
      localDate: '2017-01-01',
      msPer24: 5,
      value: 10,
    }, {
      // ms in range, value above range
      localDate: '2017-01-02',
      msPer24: 5,
      value: 95,
    }];

    it('should be a function', () => {
      assert.isFunction(utils.findDatesIntersectingWithCbgSliceSegment);
    });

    it('returns an empty array on empty data', () => {
      expect(utils.findDatesIntersectingWithCbgSliceSegment(
        [], focusedSlice, focusedSliceKeys
      )).to.deep.equal([]);
    });

    it('should find four intersecting 2016 dates', () => {
      expect(utils.findDatesIntersectingWithCbgSliceSegment(
        cbgData, focusedSlice, focusedSliceKeys
      )).to.deep.equal([
        '2016-12-25',
        '2016-12-26',
        '2016-12-30',
        '2016-12-31',
      ]);
    });
  });

  describe('findOutOfRangeAnnotations', () => {
    it('should be a function', () => {
      assert.isFunction(utils.findOutOfRangeAnnotations);
    });

    it('should return an empty array if none of the data is annotated `bg/out-of-range`', () => {
      expect(utils.findOutOfRangeAnnotations([])).to.deep.equal([]);
      expect(utils.findOutOfRangeAnnotations([{}, {}, {}])).to.deep.equal([]);
      expect(utils.findOutOfRangeAnnotations([{}, { annotations: [{ code: 'foo' }] }]))
        .to.deep.equal([]);
    });

    it('should return an array of the annotations w/unique thresholds', () => {
      expect(utils.findOutOfRangeAnnotations([{
        annotations: [{
          code: 'bg/out-of-range',
          value: 'high',
          threshold: 500,
        }],
      }, {
        annotations: [{
          code: 'bg/out-of-range',
          value: 'low',
          threshold: 25,
        }],
      }, {
        annotations: [{
          code: 'bg/out-of-range',
          value: 'high',
          threshold: 500,
        }],
      }])).to.deep.equal([{
        value: 'high',
        threshold: 500,
      }, {
        value: 'low',
        threshold: 25,
      }]);
    });
  });

  describe('calculateCbgStatsForBin', () => {
    const bin = 900000;
    const binKey = bin.toString();
    const binSize = 1000 * 60 * 30;
    const min = 0;
    const max = 100;
    const data = shuffle(range(min, max + 1));

    const res = utils.calculateCbgStatsForBin(binKey, binSize, data);

    it('should be a function', () => {
      assert.isFunction(utils.calculateCbgStatsForBin);
    });

    it('should produce result full of `undefined`s on empty values array', () => {
      const emptyValsRes = utils.calculateCbgStatsForBin(binKey, binSize, []);
      assert.isObject(emptyValsRes);
      expect(emptyValsRes).to.deep.equal({
        id: binKey,
        min: undefined,
        tenthQuantile: undefined,
        firstQuartile: undefined,
        median: undefined,
        thirdQuartile: undefined,
        ninetiethQuantile: undefined,
        max: undefined,
        msX: bin,
        msFrom: 0,
        msTo: bin * 2,
      });
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

    describe('when an array of out-of-range annotations is provided', () => {
      const outOfRange = [{
        value: 'low',
        threshold: 25,
      }, {
        value: 'low',
        threshold: 40,
      }, {
        value: 'high',
        threshold: 500,
      }, {
        value: 'high',
        threshold: 400,
      }];
      const resWithOutOfRange = utils.calculateCbgStatsForBin(binKey, binSize, data, outOfRange);

      it('should add `outOfRangeThresholds` to the resulting object', () => {
        expect(resWithOutOfRange.outOfRangeThresholds).to.deep.equal({
          low: 40,
          high: 400,
        });
      });
    });
  });

  describe('calculateSmbgStatsForBin', () => {
    const bin = 5400000;
    const binKey = bin.toString();
    const binSize = 1000 * 60 * 60 * 3;
    const min = 0;
    const max = 100;
    const data = shuffle(range(min, max + 1));

    const res = utils.calculateSmbgStatsForBin(binKey, binSize, data);

    it('should be a function', () => {
      assert.isFunction(utils.calculateSmbgStatsForBin);
    });

    it('should produce result full of `undefined`s on empty values array', () => {
      const emptyValsRes = utils.calculateSmbgStatsForBin(binKey, binSize, []);
      assert.isObject(emptyValsRes);
      expect(emptyValsRes).to.deep.equal({
        id: binKey,
        min: undefined,
        mean: undefined,
        max: undefined,
        msX: bin,
        msFrom: 0,
        msTo: bin * 2,
      });
    });

    it('should add the `binKey` as the `id` on the resulting object', () => {
      assert.isString(res.id);
      expect(res.id).to.equal(binKey);
    });

    it('should add the minimum as the `min` on the resulting object', () => {
      expect(res.min).to.equal(min);
    });

    it('should add the mean as the `mean` on the resulting object', () => {
      expect(res.mean).to.equal(50);
    });

    it('should add the maximum as the `max` on the resulting object', () => {
      expect(res.max).to.equal(max);
    });

    it('should add the bin as `msX` on the resulting object', () => {
      expect(res.msX).to.equal(bin);
    });

    describe('when an array of out-of-range annotations is provided', () => {
      const outOfRange = [{
        value: 'low',
        threshold: 25,
      }, {
        value: 'low',
        threshold: 40,
      }, {
        value: 'high',
        threshold: 500,
      }, {
        value: 'high',
        threshold: 400,
      }];
      const resWithOutOfRange = utils.calculateSmbgStatsForBin(binKey, binSize, data, outOfRange);

      it('should add `outOfRangeThresholds` to the resulting object', () => {
        expect(resWithOutOfRange.outOfRangeThresholds).to.deep.equal({
          low: 40,
          high: 400,
        });
      });
    });
  });

  describe('categorizeSmbgSubtype', () => {
    const missingSubtype = {};
    const manualSubtype = {
      subType: 'manual',
    };
    const nonManualSubtype = {
      subType: 'linked',
    };
    it('should be a function', () => {
      assert.isFunction(utils.categorizeSmbgSubtype);
    });
    it('should categorize a non-subTyped smbg as `meter`', () => {
      expect(utils.categorizeSmbgSubtype(missingSubtype)).to.equal('meter');
    });

    it('should categorize a `linked` smbg as `meter`', () => {
      expect(utils.categorizeSmbgSubtype(nonManualSubtype)).to.equal('meter');
    });

    it('should categorize a `manual` smbg as `manual`', () => {
      expect(utils.categorizeSmbgSubtype(manualSubtype)).to.equal('manual');
    });
  });
});
