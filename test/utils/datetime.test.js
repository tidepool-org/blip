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

import * as datetime from '../../src/utils/datetime';

describe('datetime', () => {
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

  describe('formatDurationHours', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.formatDurationHours);
    });

    it('should return a default midnight `12,am` if no `duration` provided', () => {
      expect(datetime.formatDurationHours()).to.equal('12,am');
    });

    it('should return `12,am` for a zero duration', () => {
      expect(datetime.formatDurationHours(0)).to.equal('12,am');
    });

    it('should return `9,am` for a duration of 1000 * 60 * 60 * 9', () => {
      const nineMorningMs = 1000 * 60 * 60 * 9;
      expect(datetime.formatDurationHours(nineMorningMs)).to.equal('9,am');
    });

    it('should return `12,pm` for a duration of 1000 * 60 * 60 * 12.5', () => {
      const twelveThirtyAfternoonMs = 1000 * 60 * 60 * 12.5;
      expect(datetime.formatDurationHours(twelveThirtyAfternoonMs)).to.equal('12,pm');
    });
  });

  describe('formatDurationMinutes', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.formatDurationMinutes);
    });

    it('should return a default `00` if no `duration` provided', () => {
      expect(datetime.formatDurationMinutes()).to.equal('00');
    });

    it('should return `00` for a zero or sub-second duration', () => {
      expect(datetime.formatDurationMinutes(0)).to.equal('00');
      expect(datetime.formatDurationMinutes(999)).to.equal('00');
    });

    it('should return `25` for a 1000 * 60 * 25 duration', () => {
      const twentyFiveMinsMs = 1000 * 60 * 25;
      expect(datetime.formatDurationMinutes(twentyFiveMinsMs)).to.equal('25');
    });

    it('should return `30` for a duration of 1000 * 60 * 60 * 12.5', () => {
      const twelveThirtyAfternoonMs = 1000 * 60 * 60 * 12.5;
      expect(datetime.formatDurationMinutes(twelveThirtyAfternoonMs)).to.equal('30');
    });
  });

  describe('formatDurationToClocktime', () => {
    it('should be a function', () => {
      assert.isFunction(datetime.formatDurationToClocktime);
    });

    it('should return an object of defaults if no `duration` provided', () => {
      expect(datetime.formatDurationToClocktime()).to.deep.equal({
        hours: '12',
        minutes: '00',
        timeOfDay: 'am',
      });
    });

    it('should translate duration of 1000 * 60 * 60 * 14 ⅓ to `2`,`20`,`pm`', () => {
      const twoTwentyAfternoonMs = 1000 * 60 * 60 * 14 + 1000 * 60 * 20;
      expect(datetime.formatDurationToClocktime(twoTwentyAfternoonMs))
        .to.deep.equal({
          hours: '2',
          minutes: '20',
          timeOfDay: 'pm',
        });
    });
  });
});
