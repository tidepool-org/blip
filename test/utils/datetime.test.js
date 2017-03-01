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

import * as datetime from '../../src/utils/datetime';

describe('datetime', () => {
  describe('THIRTY_MINS', () => {
    assert.isNumber(datetime.THIRTY_MINS);
  });

  describe('THREE_HRS', () => {
    it('should be an integer', () => {
      assert.isNumber(datetime.THREE_HRS);
    });
  });

  describe('TWENTY_FOUR_HRS', () => {
    it('should be an integer', () => {
      assert.isNumber(datetime.TWENTY_FOUR_HRS);
    });
  });

  describe('getAllDatesInRange', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.getAllDatesInRange);
    });

    it('should return an array containing the date `2016-11-06`', () => {
      const start = '2016-11-06T05:00:00.000Z';
      const end = '2016-11-07T06:00:00.000Z';
      expect(datetime.getAllDatesInRange(start, end, 'US/Central'))
        .to.deep.equal(['2016-11-06']);
    });
  });

  describe('getTimezoneFromTimePrefs', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.getTimezoneFromTimePrefs);
    });

    it('should return the `timezoneName` when timezoneAware is true', () => {
      const tz = 'Europe/Budapest';
      const timePrefs = {
        timezoneAware: true,
        timezoneName: tz,
      };
      expect(datetime.getTimezoneFromTimePrefs(timePrefs)).to.equal(tz);
    });

    it('should return `UTC` if timezoneAware is true but no timezoneName given', () => {
      const timePrefs1 = {
        timezoneAware: true,
      };
      const timePrefs2 = {
        timezoneAware: true,
        timezoneName: null,
      };
      const timePrefs3 = {
        timezoneAware: true,
        timezoneName: undefined,
      };
      expect(datetime.getTimezoneFromTimePrefs(timePrefs1)).to.equal('UTC');
      expect(datetime.getTimezoneFromTimePrefs(timePrefs2)).to.equal('UTC');
      expect(datetime.getTimezoneFromTimePrefs(timePrefs3)).to.equal('UTC');
    });

    it('should return `UTC` when timezoneAware is falsey', () => {
      const timePrefs1 = {
        timezoneAware: false,
        timezoneName: 'Europe/London',
      };
      const timePrefs2 = {
        timezoneName: 'Europe/London',
      };
      const timePrefs3 = {
        timezoneAware: null,
        timezoneName: 'Europe/London',
      };
      const timePrefs4 = {
        timezoneAware: undefined,
        timezoneName: 'Europe/London',
      };
      expect(datetime.getTimezoneFromTimePrefs(timePrefs1)).to.equal('UTC');
      expect(datetime.getTimezoneFromTimePrefs(timePrefs2)).to.equal('UTC');
      expect(datetime.getTimezoneFromTimePrefs(timePrefs3)).to.equal('UTC');
      expect(datetime.getTimezoneFromTimePrefs(timePrefs4)).to.equal('UTC');
    });
  });

  describe('timezoneAwareCeiling', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.timezoneAwareCeiling);
    });

    it('should error if passed a JavaScript Date for the `utc` param', () => {
      const fn = () => { datetime.timezoneAwareCeiling(new Date()); };
      expect(fn)
        .to.throw('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
    });

    it('should return the ceiling (= next midnight) for a datetime in a given timezone', () => {
      const dt = '2016-03-15T14:25:00.000Z';
      expect(datetime.timezoneAwareCeiling(dt, 'US/Pacific').toISOString())
        .to.equal('2016-03-16T07:00:00.000Z');
      const asInteger = Date.parse(dt);
      expect(datetime.timezoneAwareCeiling(asInteger, 'US/Pacific').toISOString())
        .to.equal('2016-03-16T07:00:00.000Z');
    });

    it('should return the same datetime if it already is a midnight in given timezone', () => {
      const dt = '2016-03-15T07:00:00.000Z';
      expect(datetime.timezoneAwareCeiling(dt, 'US/Pacific').toISOString())
        .to.equal(dt);
    });
  });

  describe('timezoneAwareOffset', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.timezoneAwareOffset);
    });

    it('should error if passed a JavaScript Date for the `utc` param', () => {
      const fn = () => { datetime.timezoneAwareOffset(new Date()); };
      expect(fn)
        .to.throw('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
    });

    it('should offset from noon to noon across DST', () => {
      const dt = '2016-03-13T17:00:00.000Z';
      expect(datetime.timezoneAwareOffset(dt, 'US/Central', {
        amount: -10,
        units: 'days',
      }).toISOString()).to.equal('2016-03-03T18:00:00.000Z');
    });
  });

  describe('localNoonBeforeTimestamp', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.localNoonBeforeTimestamp);
    });

    it('should error if passed a JavaScript Date for the `utc` param', () => {
      const fn = () => { datetime.localNoonBeforeTimestamp(new Date()); };
      expect(fn)
        .to.throw('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
    });

    it('[UTC, midnight input] should return the timestamp for the noon prior', () => {
      const dt = '2016-03-15T00:00:00.000Z';
      expect(datetime.localNoonBeforeTimestamp(dt, 'UTC').toISOString())
        .to.equal('2016-03-14T12:00:00.000Z');
      const asInteger = Date.parse(dt);
      expect(datetime.localNoonBeforeTimestamp(asInteger, 'UTC').toISOString())
        .to.equal('2016-03-14T12:00:00.000Z');
    });

    it('[UTC, anytime input] should return the timestamp for the noon prior', () => {
      const dt = '2016-03-14T02:36:25.342Z';
      expect(datetime.localNoonBeforeTimestamp(dt, 'UTC').toISOString())
        .to.equal('2016-03-14T12:00:00.000Z');
      const asInteger = Date.parse(dt);
      expect(datetime.localNoonBeforeTimestamp(asInteger, 'UTC').toISOString())
        .to.equal('2016-03-14T12:00:00.000Z');
    });

    it('[across DST] should return the timestamp for the noon prior', () => {
      const dt = '2016-03-14T05:00:00.000Z';
      expect(datetime.localNoonBeforeTimestamp(dt, 'US/Central').toISOString())
        .to.equal('2016-03-13T17:00:00.000Z');
      const asInteger = Date.parse(dt);
      expect(datetime.localNoonBeforeTimestamp(asInteger, 'US/Central').toISOString())
        .to.equal('2016-03-13T17:00:00.000Z');
    });
  });

  describe('millisecondsAsTimeOfDay', () => {
    const twoTwentyAfternoonMs = 1000 * 60 * 60 * 14 + 1000 * 60 * 20;
    const errorMsg = 'First argument must be a value in milliseconds per twenty-four hour day!';

    it('should be a function', () => {
      assert.isFunction(datetime.millisecondsAsTimeOfDay);
    });

    it('should error if no `milliseconds` provided', () => {
      const fn = () => { datetime.millisecondsAsTimeOfDay(); };
      expect(fn).throw(errorMsg);
    });

    it('should error if milliseconds < 0 or >= 864e5', () => {
      const fn0 = () => { datetime.millisecondsAsTimeOfDay(-1); };
      expect(fn0).to.throw(errorMsg);
      const fn1 = () => { datetime.millisecondsAsTimeOfDay(864e5 + 1); };
      expect(fn1).throw(errorMsg);
    });

    it('should error if JavaScript Date provided', () => {
      const fn = () => { datetime.millisecondsAsTimeOfDay(new Date()); };
      expect(fn).throw(errorMsg);
    });

    it('should translate durations of 0 and 864e5 to `12:00 am`', () => {
      expect(datetime.millisecondsAsTimeOfDay(0)).to.equal('12:00 am');
      expect(datetime.millisecondsAsTimeOfDay(864e5)).to.equal('12:00 am');
    });

    it('should translate duration of 1000 * 60 * 60 * 14 ⅓ to `2:20 pm`', () => {
      expect(datetime.millisecondsAsTimeOfDay(twoTwentyAfternoonMs))
        .to.equal('2:20 pm');
    });

    it('should use a custom format string passed as second arg', () => {
      expect(datetime.millisecondsAsTimeOfDay(twoTwentyAfternoonMs, 'kk🙃mm'))
        .to.equal('14🙃20');
    });
  });

  describe('formatDisplayDate', () => {
    const tzAwareLA = {
      timezoneAware: true,
      timezoneName: 'America/Los_Angeles',
    };
    const tzAwareNY = {
      timezoneAware: true,
      timezoneName: 'America/New_York',
    };
    const tzUnaware = {
      timezoneAware: false,
      timezoneName: null,
    };
    const utcString = '2016-09-05T04:00:00Z';
    const hammertime = Date.parse(utcString);

    it('should be a function', () => {
      assert.isFunction(datetime.formatDisplayDate);
    });

    it('should return "Sunday, September 4" for hammertime tzAware LA', () => {
      expect(datetime.formatDisplayDate(hammertime, tzAwareLA))
        .to.equal('Sunday, September 4');
    });

    it('should return "Sunday, September 4" for utcString tzAware LA', () => {
      expect(datetime.formatDisplayDate(utcString, tzAwareLA))
        .to.equal('Sunday, September 4');
    });

    it('should return "Monday, September 5" for hammertime tzAware NY', () => {
      expect(datetime.formatDisplayDate(hammertime, tzAwareNY))
        .to.equal('Monday, September 5');
    });

    it('should return "Monday, September 5" for utcString tzAware NY', () => {
      expect(datetime.formatDisplayDate(utcString, tzAwareNY))
        .to.equal('Monday, September 5');
    });

    it('should return "Monday, September 5" for hammertime tzUnaware', () => {
      expect(datetime.formatDisplayDate(hammertime, tzUnaware))
        .to.equal('Monday, September 5');
    });

    it('should return "Monday, September 5" for utcString tzUnaware', () => {
      expect(datetime.formatDisplayDate(utcString, tzUnaware))
        .to.equal('Monday, September 5');
    });

    it('should return "Sep 4" for hammertime tzAware LA "MMM D"', () => {
      expect(datetime.formatDisplayDate(hammertime, tzAwareLA, 'MMM D'))
        .to.equal('Sep 4');
    });

    it('should return "Sep 4" for utcString tzAware LA "MMM D"', () => {
      expect(datetime.formatDisplayDate(utcString, tzAwareLA, 'MMM D'))
        .to.equal('Sep 4');
    });

    it('should return "Sep 5" for hammertime tzAware NY "MMM D"', () => {
      expect(datetime.formatDisplayDate(hammertime, tzAwareNY, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should return "Sep 5" for utcString tzAware NY "MMM D"', () => {
      expect(datetime.formatDisplayDate(utcString, tzAwareNY, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should return "Sep 5" for hammertime tzUnaware "MMM D"', () => {
      expect(datetime.formatDisplayDate(hammertime, tzUnaware, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should return "Sep 5" for utcString tzUnaware "MMM D"', () => {
      expect(datetime.formatDisplayDate(utcString, tzUnaware, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should error if passed a JavaScript Date for the `utc` param', () => {
      const fn = () => { datetime.formatDisplayDate(new Date(), tzAwareLA); };
      expect(fn)
        .to.throw('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
    });
  });

  describe('getParsedTime', () => {
    const tzAware = {
      timezoneAware: true,
      timezoneName: 'America/New_York',
    };
    const tzUnaware = {
      timezoneAware: false,
      timezoneName: null,
    };
    const data = {
      time: '2016-09-23T23:00:00.000Z',
      deviceTime: '2016-09-23T19:00:00',
    };
    it('should return 1474671600000 for timezone aware', () => {
      expect(datetime.getParsedTime(data, tzAware)).to.equal(1474671600000);
    });
    it('should return 1474657200000 for timezone unaware', () => {
      expect(datetime.getParsedTime(data, tzUnaware)).to.equal(1474657200000);
    });
    it('should return false if time is not present in timezone aware', () => {
      expect(datetime.getParsedTime({}, tzAware)).to.be.false;
    });
    it('should return false if deviceTime is not present in timezone unaware', () => {
      expect(datetime.getParsedTime({}, tzUnaware)).to.be.false;
    });
    it('should error if time/deviceTime is not string timestamp', () => {
      const fn = () => { datetime.getParsedTime({ time: 'tuesday' }, tzAware); };
      expect(fn)
        .to.throw('time and deviceTime must be a ISO-formatted String timestamp');
    });
  });

  describe('midDayForDate', () => {
    const tzAware = {
      timezoneAware: true,
      timezoneName: 'America/North_Dakota/New_Salem',
    };
    const tzUnaware = {
      timezoneAware: false,
      timezoneName: null,
    };
    const localDate = '2016-09-23';
    const dstBegin = '2016-03-13';
    const dstEnd = '2016-11-06';

    it('should return "2016-09-23T17:00:00.000Z" if timezone aware', () => {
      expect(datetime.midDayForDate(localDate, tzAware)).to.equal('2016-09-23T17:00:00.000Z');
    });

    it('should return "2016-09-23T12:00:00.000Z" if timezone unaware', () => {
      expect(datetime.midDayForDate(localDate, tzUnaware)).to.equal('2016-09-23T12:00:00.000Z');
    });

    it('should return "2016-03-13T18:00:00.000Z" if on DST begin, timezone aware', () => {
      expect(datetime.midDayForDate(dstBegin, tzAware)).to.equal('2016-03-13T18:00:00.000Z');
    });

    it('should return "2016-03-13T12:00:00.000Z" if on DST begin, timezone unaware', () => {
      expect(datetime.midDayForDate(dstBegin, tzUnaware)).to.equal('2016-03-13T12:00:00.000Z');
    });

    it('should return "2016-11-06T17:00:00.000Z" if on DST end, timezone aware', () => {
      expect(datetime.midDayForDate(dstEnd, tzAware)).to.equal('2016-11-06T17:00:00.000Z');
    });

    it('should return "2016-11-06T12:00:00.000Z" if on DST end, timezone unaware', () => {
      expect(datetime.midDayForDate(dstEnd, tzUnaware)).to.equal('2016-11-06T12:00:00.000Z');
    });
  });
});
