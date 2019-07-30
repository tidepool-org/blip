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

/* eslint-disable max-len */

import _ from 'lodash';
import * as bgUtils from '../../src/utils/bloodglucose';

import { MS_IN_MIN } from '../../src/utils/constants';

describe('blood glucose utilities', () => {
  const bgBounds = {
    veryHighThreshold: 300,
    targetUpperBound: 180,
    targetLowerBound: 70,
    veryLowThreshold: 55,
  };

  describe('classifyBgValue', () => {
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

    describe('three-way classification (low, target, high)', () => {
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

    describe('five-way classification (veryLow, low, target, high, veryHigh)', () => {
      it('should return `veryLow` for a value < the `veryLowThreshold`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 54, 'fiveWay')).to.equal('veryLow');
      });

      it('should return `low` for a value equal to the `veryLowThreshold`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 55, 'fiveWay')).to.equal('low');
      });

      it('should return `low` for a value < the `targetLowerBound`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 69, 'fiveWay')).to.equal('low');
      });

      it('should return `target` for a value equal to the `targetLowerBound`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 70, 'fiveWay')).to.equal('target');
      });

      it('should return `target` for a value > `targetLowerBound` and < `targetUpperBound`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 100, 'fiveWay')).to.equal('target');
      });

      it('should return `target` for a value equal to the `targetUpperBound`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 180, 'fiveWay')).to.equal('target');
      });

      it('should return `high` for a value > the `targetUpperBound`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 181, 'fiveWay')).to.equal('high');
      });

      it('should return `high` for a value equal to the `veryHighThreshold`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 300, 'fiveWay')).to.equal('high');
      });

      it('should return `veryHigh` for a value > the `veryHighThreshold`', () => {
        expect(bgUtils.classifyBgValue(bgBounds, 301, 'fiveWay')).to.equal('veryHigh');
      });
    });
  });

  describe('classifyCvValue', () => {
    it('should return `target` for any value <= 0.36', () => {
      expect(bgUtils.classifyCvValue(36)).to.equal('target');
      expect(bgUtils.classifyCvValue(35.9)).to.equal('target');
    });

    it('should return `high` for any value > 0.36', () => {
      expect(bgUtils.classifyCvValue(36.1)).to.equal('high');
    });
  });

  describe('generateBgRangeLabels', () => {
    const bounds = {
      mgdl: {
        veryHighThreshold: 300.12345,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 55,
      },
      mmoll: {
        veryHighThreshold: 16.666667,
        targetUpperBound: 10,
        targetLowerBound: 3.9,
        veryLowThreshold: 3.1,
      },
    };

    it('should generate formatted range labels for mg/dL BG prefs', () => {
      const bgPrefs = {
        bgBounds: bounds.mgdl,
        bgUnits: 'mg/dL',
      };

      const result = bgUtils.generateBgRangeLabels(bgPrefs);

      expect(result).to.eql({
        veryLow: 'below 55 mg/dL',
        low: 'between 55 - 70 mg/dL',
        target: 'between 70 - 180 mg/dL',
        high: 'between 180 - 300 mg/dL',
        veryHigh: 'above 300 mg/dL',
      });
    });

    it('should generate condensed formatted range labels for mg/dL BG prefs when condensed option set', () => {
      const bgPrefs = {
        bgBounds: bounds.mgdl,
        bgUnits: 'mg/dL',
      };

      const result = bgUtils.generateBgRangeLabels(bgPrefs, { condensed: true });

      expect(result).to.eql({
        veryLow: '<55',
        low: '55-70',
        target: '70-180',
        high: '180-300',
        veryHigh: '>300',
      });
    });

    it('should generate formatted range labels for mmol/L BG prefs', () => {
      const bgPrefs = {
        bgBounds: bounds.mmoll,
        bgUnits: 'mmol/L',
      };

      const result = bgUtils.generateBgRangeLabels(bgPrefs);

      expect(result).to.eql({
        veryLow: 'below 3.1 mmol/L',
        low: 'between 3.1 - 3.9 mmol/L',
        target: 'between 3.9 - 10.0 mmol/L',
        high: 'between 10.0 - 16.7 mmol/L',
        veryHigh: 'above 16.7 mmol/L',
      });
    });

    it('should generate condensed formatted range labels for mmol/L BG prefs when condensed option set', () => {
      const bgPrefs = {
        bgBounds: bounds.mmoll,
        bgUnits: 'mmol/L',
      };

      const result = bgUtils.generateBgRangeLabels(bgPrefs, { condensed: true });

      expect(result).to.eql({
        veryLow: '<3.1',
        low: '3.1-3.9',
        target: '3.9-10.0',
        high: '10.0-16.7',
        veryHigh: '>16.7',
      });
    });
  });

  describe('convertToMmolL', () => {
    it('should be a function', () => {
      assert.isFunction(bgUtils.convertToMmolL);
    });

    it('should return 2.2202991964182135 when given 40', () => {
      expect(bgUtils.convertToMmolL(40)).to.equal(2.2202991964182135);
    });

    it('should return 22.202991964182132 when given 400', () => {
      expect(bgUtils.convertToMmolL(400)).to.equal(22.202991964182132);
    });
  });

  describe('reshapeBgClassesToBgBounds', () => {
    const bgPrefs = {
      bgClasses: {
        'very-high': { boundary: 600 },
        high: { boundary: 300 },
        target: { boundary: 180 },
        low: { boundary: 70 },
        'very-low': { boundary: 54 },
      },
      bgUnits: 'mg/dL',
    };

    it('should be a function', () => {
      assert.isFunction(bgUtils.reshapeBgClassesToBgBounds);
    });

    it('should extract and reshape `bgClasses` to `bgBounds`', () => {
      expect(bgUtils.reshapeBgClassesToBgBounds(bgPrefs)).to.deep.equal({
        veryHighThreshold: 300,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 54,
      });
    });
  });

  describe('getOutOfRangeThreshold', () => {
    it('should return a high out-of-range threshold for a high datum', () => {
      const datum = {
        type: 'smbg',
        value: 601,
        annotations: [
          {
            code: 'bg/out-of-range',
            threshold: 600,
            value: 'high',
          },
        ],
      };

      expect(bgUtils.getOutOfRangeThreshold(datum)).to.deep.equal({
        high: 600,
      });
    });

    it('should return a low out-of-range threshold for a low datum', () => {
      const datum = {
        type: 'smbg',
        value: 32,
        annotations: [
          {
            code: 'bg/out-of-range',
            threshold: 40,
            value: 'low',
          },
        ],
      };

      expect(bgUtils.getOutOfRangeThreshold(datum)).to.deep.equal({
        low: 40,
      });
    });

    it('should return null for an in-range datum', () => {
      const datum = {
        type: 'smbg',
        value: 100,
      };

      expect(bgUtils.getOutOfRangeThreshold(datum)).to.equal(null);
    });
  });

  describe('weightedCGMCount', () => {
    it('should return a count of 1 for every cgm datum by default', () => {
      const data = _.map(_.range(0, 10), () => ({
        deviceId: 'Dexcom_XXXXXXX',
        type: 'cbg',
      }));

      expect(bgUtils.weightedCGMCount(data)).to.equal(data.length);
    });

    it('should return a count of 1 for every cgm datum by default when missing the deviceId property', () => {
      const data = _.map(_.range(0, 10), () => ({
        type: 'cbg',
      }));

      expect(bgUtils.weightedCGMCount(data)).to.equal(data.length);
    });

    it('should return a count of 3 for every FreeStyle Libre cgm datum by default', () => {
      const data = _.map(_.range(0, 10), () => ({
        deviceId: 'AbbottFreeStyleLibre_XXXXXXX',
        type: 'cbg',
      }));

      expect(bgUtils.weightedCGMCount(data)).to.equal(data.length * 3);
    });

    it('should properly handle a mix of FreeStyle Libre and Dexcom data', () => {
      const data = _.map(_.range(0, 10), () => ({
        deviceId: 'Dexcom_XXXXXXX',
      })).concat(_.map(_.range(0, 10), () => ({
        deviceId: 'AbbottFreeStyleLibre_XXXXXXX',
        type: 'cbg',
      })));

      expect(bgUtils.weightedCGMCount(data)).to.equal(40);
    });
  });

  describe('cgmSampleFrequency', () => {
    it('should get the CGM sample frequency in milliseconds from a CGM data point', () => {
      const dexcomDatum = {
        deviceId: 'Dexcom_XXXXXXX',
      };
      expect(bgUtils.cgmSampleFrequency(dexcomDatum)).to.equal(5 * MS_IN_MIN);

      const libreDatum = {
        deviceId: 'AbbottFreeStyleLibre_XXXXXXX',
      };
      expect(bgUtils.cgmSampleFrequency(libreDatum)).to.equal(15 * MS_IN_MIN);
    });
  });
});
/* eslint-enable max-len */
