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

/* jshint esversion:6 */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var i18next = require('i18next');

// At some time we could add test on other languages
var i18nconf = {
  locales        : ["en", "fr"],
  defaultLocale : "en",
};

i18next.init({
  fallbackLng: i18nconf.defaultLocale,
  lng: i18nconf.defaultLocale,
  // To allow . in keys
  keySeparator: false,
  // To allow : in keys
  nsSeparator: '|',
  // debug mode
  debug: false,
  // If the translation is empty, return the key instead
  returnEmptyString: false,
  resources: {
    en: {
      // Default namespace
      translation: require('./locales/en/translation.json')
    },
    fr: {
      // Default namespace
      translation: require('./locales/fr/translation.json')
    }
  }
});

var fmt = require('../js/data/util/format');
var { MGDL_UNITS, MMOLL_UNITS, BG_CLAMP_THRESHOLD } = require('../js/data/util/constants');

describe('format utility', function() {
  before(() => {
    i18next.changeLanguage('en');
  });
  
  describe('tooltipBG', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.tooltipBG);
    });

    it('should always return a string', function() {
      assert.isString(fmt.tooltipBG({value: 0.9999999999999999999999999}, MGDL_UNITS));
      assert.isString(fmt.tooltipBG({value: 0.9999999999999999999999999}, MMOLL_UNITS));
    });

    it('should return an integer string when units are mg/dL', function() {
      expect(fmt.tooltipBG({value: 0.9999999999999999999999999}, MGDL_UNITS)).to.equal('1');
    });

    it('should return a float string with one decimal place when units are mmol/L', function() {
      expect(fmt.tooltipBG({value: 0.9999999999999999999999999}, MMOLL_UNITS)).to.equal('1.0');
      expect(fmt.tooltipBG({value: 4.2222222222222222222222222}, MMOLL_UNITS)).to.equal('4.2');
    });

    it('should return a float string with one decimal place when no units', function() {
      expect(fmt.tooltipBG({value: 4.2222222222222222222222222})).to.equal('4.2');
    });

    it('should set the tooltip text to "High" for smbg values above the device threshold', function() {
      var datum = {
        type: 'smbg',
        value: 601,
        annotations: [
          {
            code: 'bg/out-of-range',
            threshold: BG_CLAMP_THRESHOLD[MGDL_UNITS],
            value: 'high',
          },
        ],
      };

      fmt.tooltipBG(datum);

      expect(datum.tooltipText).to.equal('High');
    });

    it('should set the tooltip text to "Hi" for cbg values above the device threshold', function() {
      var datum = {
        type: 'cbg',
        value: 601,
        annotations: [
          {
            code: 'bg/out-of-range',
            threshold: BG_CLAMP_THRESHOLD[MGDL_UNITS],
            value: 'high',
          },
        ],
      };

      fmt.tooltipBG(datum);

      expect(datum.tooltipText).to.equal('Hi');
    });

    it('should set the tooltip text to "Low" for smbg values below the device threshold', function() {
      var datum = {
        type: 'smbg',
        value: 39,
        annotations: [
          {
            code: 'bg/out-of-range',
            threshold: 40,
            value: 'low',
          },
        ],
      };

      fmt.tooltipBG(datum);

      expect(datum.tooltipText).to.equal('Low');
    });

    it('should set the tooltip text to "Lo" for cbg values below the device threshold', function() {
      var datum = {
        type: 'cbg',
        value: 39,
        annotations: [
          {
            code: 'bg/out-of-range',
            threshold: 40,
            value: 'low',
          },
        ],
      };

      fmt.tooltipBG(datum);

      expect(datum.tooltipText).to.equal('Lo');
    });
  });

  describe('tooltipValue', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.tooltipValue);
    });

    it('should always return a string', function() {
      assert.isString(fmt.tooltipValue(0));
      assert.isString(fmt.tooltipValue(0.9999999999999999999999999));
    });

    it('should return `0.0` when passed a value of 0', function() {
      expect(fmt.tooltipValue(0)).to.equal('0.0');
    });

    it('should return `1.075` when passed a value of 1.07499999999999999999', function() {
      expect(fmt.tooltipValue(1.07499999999999999999)).to.equal('1.075');
    });

    it('should remove right-hand zero padding where applicable', function() {
      expect(fmt.tooltipValue(1.200)).to.equal('1.2');
    });
  });

  describe('capitalize', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.capitalize);
    });

    it('should capitalize a string', function() {
      expect(fmt.capitalize('foo')).to.equal('Foo');
    });
  });

  describe('nameForDisplay', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.nameForDisplay);
    });

    it('should return the same name for display if no words longer than maxWordLength', function() {
      expect(fmt.nameForDisplay('food', 4)).to.equal('food');
      expect(fmt.nameForDisplay('I had a dream', 5)).to.equal('I had a dream');
      expect(fmt.nameForDisplay('In a world where people live forever', 7)).to.equal('In a world where people live forever');
    });

    it('should trim words that are longer than max word length', function() {
      expect(fmt.nameForDisplay('foody', 4)).to.equal('food...');
      expect(fmt.nameForDisplay('Derek Jonesy', 5)).to.equal('Derek Jones...');
      expect(fmt.nameForDisplay('testing123@tidepool.org', 12)).to.equal('testing123@t...');
    });
  });

  describe('textPreview', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.textPreview);
    });

    it('should return the same string if string length is less than preview length', function() {
      expect(fmt.textPreview('foo', 4)).to.equal('foo');
      expect(fmt.textPreview('I had a dream', 200)).to.equal('I had a dream');
      expect(fmt.textPreview('In a world where people live forever.', 50)).to.equal('In a world where people live forever.');
    });

    it('should return the return a segment of word is no spaces in sentence and previewLength is less than word length', function() {
      expect(fmt.textPreview('foobar', 5)).to.equal('fooba...');
    });

    it('should return the same string if string length is less than preview length', function() {
      expect(fmt.textPreview('foo', 3)).to.equal('foo');
      expect(fmt.textPreview('I had a dream', 13)).to.equal('I had a dream');
      expect(fmt.textPreview('In a world where people live forever.', 50)).to.equal('In a world where people live forever.');
    });

    it('should return the same string if string length is less than preview length', function() {
      expect(fmt.textPreview('foo bar', 3)).to.equal('foo...');
      expect(fmt.textPreview('I had a dream', 12)).to.equal('I had a...');
      expect(fmt.textPreview('In a world where people live forever.', 12)).to.equal('In a world...');
      expect(fmt.textPreview('In a world where people live forever.', 18)).to.equal('In a world where...');
    });
  });

  describe('dayAndDate', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.dayAndDate);
    });

    it('should return `Mon, Nov 17` on a UTC timestamp of midnight 11/17/2014', function() {
      var tstr = '2014-11-17T00:00:00.000Z';
      expect(fmt.dayAndDate(tstr)).to.equal('Mon, Nov 17');
    });

    it('should return `Mon, Nov 17` on a UTC timestamp of 8 a.m. 11/17/2014 when passed a Pacific DST offset', function() {
      var tstr = '2014-11-17T08:00:00.000Z';
      expect(fmt.dayAndDate(new Date(Date.parse(tstr) - 1).toISOString(), -480)).to.equal('Sun, Nov 16');
      expect(fmt.dayAndDate(tstr, -480)).to.equal('Mon, Nov 17');
    });
  });

  describe('fixFloatingPoint', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.fixFloatingPoint);
    });

    it('should return 1.075 when passed a value of 1.07499999999999999999', function() {
      expect(fmt.fixFloatingPoint(1.07499999999999999999)).to.equal(1.075);
    });
  });

  describe('percentage', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.percentage);
    });

    it('should return `-- %` when passed NaN', function() {
      expect(fmt.percentage(NaN)).to.equal('-- %');
    });

    it('should return an integer percentage when passed a value between 0.0 and 1.0', function() {
      expect(fmt.percentage(0.6666666666666666666666667)).to.equal('67%');
    });
  });

  describe('millisecondsAsTimeOfDay', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.millisecondsAsTimeOfDay);
    });

    it('should translate a value of milliseconds per 24 hours into a timestamp', function() {
      expect(fmt.millisecondsAsTimeOfDay(3900000)).to.equal('1:05 AM');
    });

    it('should translate in french a value of milliseconds per 24 hours into a timestamp', function() {
      i18next.changeLanguage('fr');
      expect(fmt.millisecondsAsTimeOfDay(3900000)).to.equal('1h05');
      i18next.changeLanguage('en');
    });
  });

  describe('timespan', function() {
    var MS_IN_HR = 3600000;
    it('should be a function', function() {
      assert.isFunction(fmt.timespan);
    });

    it('should return `over 21 min` on a datum with duration of 21 minutes', function() {
      expect(fmt.timespan({duration: 1260000})).to.equal('over 21 min');
    });

    it('should return `over 1 ¾ hr` on a datum wit a duration of 1.75 hours', function() {
      expect(fmt.timespan({duration: 1.75*MS_IN_HR})).to.equal('over 1 ¾ hr');
    });

    it('should return `over 6 ⅔ hrs` on a datum with a duration of 6.67 hours', function() {
      expect(fmt.timespan({duration: (20/3)*MS_IN_HR})).to.equal('over 6 ⅔ hrs');
    });
  });

  describe('timestamp', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.timestamp);
    });

    it('should return `1:00 am` on a UTC timestamp at 1 am', function() {
      expect(fmt.timestamp('2014-01-01T01:00:00.000Z')).to.equal('1:00 am');
    });

    it('should return `5:00 pm` on a UTC timestamp at 1 am with a Pacific non-DST offset', function() {
      expect(fmt.timestamp('2014-01-01T01:00:00.000Z', -480)).to.equal('5:00 pm');
    });
  });

  describe('timeChangeInfo', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.timeChangeInfo);
    });

    it('should error if `to` argument is not passed', function() {
      var err = 'You have not provided a `to` datetime string';
      var x = '2014-01-01T01:00:00';
      expect(fmt.timeChangeInfo.bind(fmt)).to.throw(err);
      expect(fmt.timeChangeInfo.bind(fmt, x)).to.throw(err);
      expect(fmt.timeChangeInfo.bind(fmt, null, x)).to.not.throw();
    });

    it('should return an object containing strings of times when both are on same day', function() {
      var x = '2014-01-01T01:00:00';
      var y = '2014-01-01T04:00:00';
      var y2 = '2014-01-01T23:00:00';
      expect(fmt.timeChangeInfo(x,y)).to.eql({type: 'Time Change', from: '1:00 am', to: '4:00 am', format: 'h:mm a'});
      expect(fmt.timeChangeInfo(x,y2)).to.eql({type: 'Time Change', from: '1:00 am', to: '11:00 pm', format: 'h:mm a'});
      expect(fmt.timeChangeInfo(y,y2)).to.eql({type: 'Time Change', from: '4:00 am', to: '11:00 pm', format: 'h:mm a'});
    });

    it('should label object as type Clock Drift Adjustment if difference is less than 8 minutes', function() {
      var x = '2014-01-01T01:00:00';
      var y = '2014-01-01T01:06:00';
      expect(fmt.timeChangeInfo(x,y)).to.eql({type: 'Clock Drift Adjustment', from: '1:00 am', to: '1:06 am', format: 'h:mm a'});
    });

    it('should return an object containing strings of times and date when values are on different days', function() {
      var x = '2014-01-01T01:00:00';
      var y = '2014-01-02T04:00:00';
      var y2 = '2014-01-30T04:00:00';
      expect(fmt.timeChangeInfo(x,y)).to.eql({type: 'Time Change', from: 'Jan 1, 1:00 am', to: 'Jan 2, 4:00 am', format: 'MMM D, h:mm a'});
      expect(fmt.timeChangeInfo(x,y2)).to.eql({type: 'Time Change', from: 'Jan 1, 1:00 am', to: 'Jan 30, 4:00 am', format: 'MMM D, h:mm a'});
    });

    it('should return an object containing strings of times and date when values are in different years', function() {
      var x = '2014-12-31T04:00:00';
      var y = '2015-01-01T01:00:00';
      var y2 = '2015-04-15T04:25:00';
      expect(fmt.timeChangeInfo(x,y)).to.eql({type: 'Time Change', from: 'Dec 31, 2014 4:00 am', to: 'Jan 1, 2015 1:00 am', format: 'MMM D, YYYY h:mm a'});
      expect(fmt.timeChangeInfo(x,y2)).to.eql({type: 'Time Change', from: 'Dec 31, 2014 4:00 am', to: 'Apr 15, 2015 4:25 am', format: 'MMM D, YYYY h:mm a'});
    });

    it('should return an object containing only the `to` time when `from` arg is falsey', function() {
      var x;
      var x1 = false;
      var x2 = null;
      var y = '2015-01-01T01:00:00';
      expect(fmt.timeChangeInfo(x,y)).to.eql({type: 'Time Change', from: undefined, to: '1:00 am', format: 'h:mm a'});
      expect(fmt.timeChangeInfo(x1,y)).to.eql({type: 'Time Change', from: undefined, to: '1:00 am', format: 'h:mm a'});
      expect(fmt.timeChangeInfo(x2,y)).to.eql({type: 'Time Change', from: undefined, to: '1:00 am', format: 'h:mm a'});
    });
  });

  describe('xAxisDayText', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.xAxisDayText);
    });

    it('should return `Wednesday, January 1` on a UTC timestamp at 1 am on first day of 2014', function() {
      expect(fmt.xAxisDayText('2014-01-01T01:00:00.000Z')).to.equal('Wednesday, January 1');
    });

    it('should return `Tuesday, December 31` on same UTC timestamp when passed a Pacific non-DST offset', function() {
      expect(fmt.xAxisDayText('2014-01-01T01:00:00.000Z', -480)).to.equal('Tuesday, December 31');
    });
  });

  describe('xAxisTickText', function() {
    it('should be a function', function() {
      assert.isFunction(fmt.xAxisTickText);
    });

    it('should return return `1 am` on a UTC timestamp at 1 am', function() {
      expect(fmt.xAxisTickText('2014-01-01T01:00:00.000Z')).to.equal('1 am');
    });

    it('should return `5 pm` on same UTC timestamp when passed a Pacific non-DST offset', function() {
      expect(fmt.xAxisTickText('2014-01-01T01:00:00.000Z', -480)).to.equal('5 pm');
    });

    it('should return `6 pm` on same UTC timestamp when passed a Pacific DST offset', function() {
      expect(fmt.xAxisTickText('2014-04-01T01:00:00.000Z', -420)).to.equal('6 pm');
    });
  });
});
