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
  const patient = {
    profile: {
      fullName: 'Mary Smith',
      patient: {
        diagnosisDate: '1990-01-31',
        birthday: '1983-01-31',
      },
    },
  };

  const fakeChildAcct = {
    profile: {
      fullName: 'Mary Smith',
      patient: {
        isOtherPerson: true,
        fullName: 'My Kid',
        diagnosisDate: '1990-01-31',
        birthday: '1983-01-31',
      },
    },
  };

  describe('THIRTY_MINS', () => {
    assert.isNumber(datetime.THIRTY_MINS);
  });

  describe('ONE_HR', () => {
    assert.isNumber(datetime.ONE_HR);
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

  describe('formatBirthdate', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.formatBirthdate);
    });

    it('should format birthdate extracted from normal patient object', () => {
      expect(datetime.formatBirthdate(patient)).to.equal('Jan 31, 1983');
    });

    it('should format birthdate extracted from fake child account patient object', () => {
      expect(datetime.formatBirthdate(fakeChildAcct)).to.equal('Jan 31, 1983');
    });
  });

  describe('formatClocktimeFromMsPer24', () => {
    const twoTwentyAfternoonMs = 1000 * 60 * 60 * 14 + 1000 * 60 * 20;
    const errorMsg = 'First argument must be a value in milliseconds per twenty-four hour day!';

    it('should be a function', () => {
      assert.isFunction(datetime.formatClocktimeFromMsPer24);
    });

    it('should error if no `milliseconds` provided', () => {
      const fn = () => { datetime.formatClocktimeFromMsPer24(); };
      expect(fn).throw(errorMsg);
    });

    it('should error if milliseconds < 0 or >= 864e5', () => {
      const fn0 = () => { datetime.formatClocktimeFromMsPer24(-1); };
      expect(fn0).to.throw(errorMsg);
      const fn1 = () => { datetime.formatClocktimeFromMsPer24(864e5 + 1); };
      expect(fn1).throw(errorMsg);
    });

    it('should error if JavaScript Date provided', () => {
      const fn = () => { datetime.formatClocktimeFromMsPer24(new Date()); };
      expect(fn).throw(errorMsg);
    });

    it('should translate durations of 0 and 864e5 to `12:00 am`', () => {
      expect(datetime.formatClocktimeFromMsPer24(0)).to.equal('12:00 am');
      expect(datetime.formatClocktimeFromMsPer24(864e5)).to.equal('12:00 am');
    });

    it('should translate duration of 1000 * 60 * 60 * 14 ⅓ to `2:20 pm`', () => {
      expect(datetime.formatClocktimeFromMsPer24(twoTwentyAfternoonMs))
        .to.equal('2:20 pm');
    });

    it('should use a custom format string passed as second arg', () => {
      expect(datetime.formatClocktimeFromMsPer24(twoTwentyAfternoonMs, 'kk🙃mm'))
        .to.equal('14🙃20');
    });
  });

  describe('formatDiagnosisDate', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.formatDiagnosisDate);
    });

    it('should format diagnosisDate extracted from patient object', () => {
      expect(datetime.formatDiagnosisDate(patient)).to.equal('Jan 31, 1990');
    });

    it('should format diagnosisDate extracted from fake child account patient object', () => {
      expect(datetime.formatDiagnosisDate(fakeChildAcct)).to.equal('Jan 31, 1990');
    });
  });

  describe('formatDuration', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.formatDuration);
    });

    it('should properly format a 30 minute duration', () => {
      expect(datetime.formatDuration(36e5 / 2)).to.equal('30 min');
    });

    it('should properly format a 1 hr duration', () => {
      expect(datetime.formatDuration(36e5)).to.equal('1 hr');
    });

    it('should properly format a 1.25 hr duration', () => {
      expect(datetime.formatDuration(36e5 + 36e5 / 4)).to.equal('1¼ hr');
    });

    it('should properly format a 1.33333 hr duration', () => {
      expect(datetime.formatDuration(36e5 + 36e5 / 3)).to.equal('1⅓ hr');
    });

    it('should properly format a 1.5 hr duration', () => {
      expect(datetime.formatDuration(36e5 + 36e5 / 2)).to.equal('1½ hr');
    });

    it('should properly format a 1.66667 hr duration', () => {
      expect(datetime.formatDuration(36e5 + 36e5 * (2 / 3))).to.equal('1⅔ hr');
    });

    it('should properly format a 1.75 hr duration', () => {
      expect(datetime.formatDuration(36e5 + 36e5 * (3 / 4))).to.equal('1¾ hr');
    });

    it('should properly format a 1.1 hr duration', () => {
      expect(datetime.formatDuration(36e5 + 36e5 / 10)).to.equal('1 hr 6 min');
    });

    it('should properly format a 2 hr duration', () => {
      expect(datetime.formatDuration(2 * 36e5)).to.equal('2 hrs');
    });

    it('should properly format a 2.25 hr duration', () => {
      expect(datetime.formatDuration(2 * 36e5 + 36e5 / 4)).to.equal('2¼ hrs');
    });

    it('should properly format a 2.33333 hr duration', () => {
      expect(datetime.formatDuration(2 * 36e5 + 36e5 / 3)).to.equal('2⅓ hrs');
    });

    it('should properly format a 2.5 hr duration', () => {
      expect(datetime.formatDuration(2 * 36e5 + 36e5 / 2)).to.equal('2½ hrs');
    });

    it('should properly format a 2.66667 hr duration', () => {
      expect(datetime.formatDuration(2 * 36e5 + 36e5 * (2 / 3))).to.equal('2⅔ hrs');
    });

    it('should properly format a 2.75 hr duration', () => {
      expect(datetime.formatDuration(2 * 36e5 + 36e5 * (3 / 4))).to.equal('2¾ hrs');
    });

    it('should properly format a 2.1 hr duration', () => {
      expect(datetime.formatDuration(2 * 36e5 + 36e5 / 10)).to.equal('2 hrs 6 min');
    });
  });

  describe('formatLocalizedFromUTC', () => {
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
      assert.isFunction(datetime.formatLocalizedFromUTC);
    });

    it('should return "Sunday, September 4" for hammertime tzAware LA', () => {
      expect(datetime.formatLocalizedFromUTC(hammertime, tzAwareLA))
        .to.equal('Sunday, September 4');
    });

    it('should return "Sunday, September 4" for utcString tzAware LA', () => {
      expect(datetime.formatLocalizedFromUTC(utcString, tzAwareLA))
        .to.equal('Sunday, September 4');
    });

    it('should return "Monday, September 5" for hammertime tzAware NY', () => {
      expect(datetime.formatLocalizedFromUTC(hammertime, tzAwareNY))
        .to.equal('Monday, September 5');
    });

    it('should return "Monday, September 5" for utcString tzAware NY', () => {
      expect(datetime.formatLocalizedFromUTC(utcString, tzAwareNY))
        .to.equal('Monday, September 5');
    });

    it('should return "Monday, September 5" for hammertime tzUnaware', () => {
      expect(datetime.formatLocalizedFromUTC(hammertime, tzUnaware))
        .to.equal('Monday, September 5');
    });

    it('should return "Monday, September 5" for utcString tzUnaware', () => {
      expect(datetime.formatLocalizedFromUTC(utcString, tzUnaware))
        .to.equal('Monday, September 5');
    });

    it('should return "Sep 4" for hammertime tzAware LA "MMM D"', () => {
      expect(datetime.formatLocalizedFromUTC(hammertime, tzAwareLA, 'MMM D'))
        .to.equal('Sep 4');
    });

    it('should return "Sep 4" for utcString tzAware LA "MMM D"', () => {
      expect(datetime.formatLocalizedFromUTC(utcString, tzAwareLA, 'MMM D'))
        .to.equal('Sep 4');
    });

    it('should return "Sep 5" for hammertime tzAware NY "MMM D"', () => {
      expect(datetime.formatLocalizedFromUTC(hammertime, tzAwareNY, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should return "Sep 5" for utcString tzAware NY "MMM D"', () => {
      expect(datetime.formatLocalizedFromUTC(utcString, tzAwareNY, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should return "Sep 5" for hammertime tzUnaware "MMM D"', () => {
      expect(datetime.formatLocalizedFromUTC(hammertime, tzUnaware, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should return "Sep 5" for utcString tzUnaware "MMM D"', () => {
      expect(datetime.formatLocalizedFromUTC(utcString, tzUnaware, 'MMM D'))
        .to.equal('Sep 5');
    });

    it('should error if passed a JavaScript Date for the `utc` param', () => {
      const fn = () => { datetime.formatLocalizedFromUTC(new Date(), tzAwareLA); };
      expect(fn)
        .to.throw('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
    });
  });

  describe('getHammertimeFromDatumWithTimePrefs', () => {
    const tzAware = {
      timezoneAware: true,
      timezoneName: 'US/Central',
    };
    const tzNaive = {
      timezoneAware: false,
      timezoneName: null,
    };
    const datum = {
      time: '2016-09-23T23:00:00.000Z',
      deviceTime: '2016-09-23T19:00:00',
    };

    it('should return 1474671600000 for timezone aware', () => {
      expect(datetime.getHammertimeFromDatumWithTimePrefs(datum, tzAware)).to.equal(1474671600000);
    });

    it('should return 1474657200000 for timezone unaware', () => {
      expect(datetime.getHammertimeFromDatumWithTimePrefs(datum, tzNaive)).to.equal(1474657200000);
    });

    it('should return `null` if `time` is not present on datum when timezone-aware', () => {
      expect(datetime.getHammertimeFromDatumWithTimePrefs({}, tzAware)).to.be.null;
    });

    it('should return `null` if `deviceTime` is not present on datum when timezone-naive', () => {
      expect(datetime.getHammertimeFromDatumWithTimePrefs({}, tzNaive)).to.be.null;
    });

    it('should error if time/deviceTime is not string timestamp', () => {
      const fn = () => {
        datetime.getHammertimeFromDatumWithTimePrefs({ time: 'tuesday' }, tzAware);
      };
      expect(fn).to.throw(
        'Check your input datum; could not parse `time` or `deviceTime` with Date.parse.'
      );
    });
  });

  describe('getLocalizedCeiling', () => {
    const timePrefs = { timezoneAware: true, timezoneName: 'US/Pacific' };
    it('should be a function', () => {
      assert.isFunction(datetime.getLocalizedCeiling);
    });

    it('should error if passed a JavaScript Date for the `utc` param', () => {
      const fn = () => { datetime.getLocalizedCeiling(new Date()); };
      expect(fn)
        .to.throw('`utc` must be a ISO-formatted String timestamp or integer hammertime!');
    });

    it('should return the ceiling (= next midnight) for a datetime in a given timezone', () => {
      const dt = '2016-03-15T14:25:00.000Z';
      expect(datetime.getLocalizedCeiling(dt, timePrefs).toISOString())
        .to.equal('2016-03-16T07:00:00.000Z');
      const asInteger = Date.parse(dt);
      expect(datetime.getLocalizedCeiling(asInteger, timePrefs).toISOString())
        .to.equal('2016-03-16T07:00:00.000Z');
    });

    it('should return the same datetime if it already is a midnight in given timezone', () => {
      const dt = '2016-03-15T07:00:00.000Z';
      expect(datetime.getLocalizedCeiling(dt, timePrefs).toISOString())
        .to.equal(dt);
    });
  });
});
