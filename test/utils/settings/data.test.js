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

import * as data from '../../../src/utils/settings/data';

const multirateSettingsData = require('../../../data/pumpSettings/medtronic/multirate.json');
const settingsData = require('../../../data/pumpSettings/tandem/flatrate.json');
const timedSettingsData = require('../../../data/pumpSettings/tandem/multirate.json');

describe('[settings] data utils', () => {
  describe('processBgTargetData', () => {
    it('should return formatted objects', () => {
      expect(
        data.processBgTargetData(
          multirateSettingsData.bgTarget,
          multirateSettingsData.units.bg,
          { columnTwo: 'low', columnThree: 'high' },
        )
      )
      .to.have.length(3)
      .to.contain({ start: '12:00 am', columnTwo: '3.9', columnThree: '7.8' })
      .and.contain({ start: '11:30 am', columnTwo: '4.4', columnThree: '6.7' })
      .and.contain({ start: '6:00 pm', columnTwo: '4.2', columnThree: '8.3' });
    });
  });

  describe('processCarbRatioData', () => {
    it('should return formatted objects', () => {
      expect(
        data.processCarbRatioData(
          multirateSettingsData.carbRatio,
        )
      )
      .to.have.length(4)
      .to.contain({ start: '12:00 am', amount: 24 })
      .and.contain({ start: '2:30 am', amount: 22 })
      .and.contain({ start: '6:00 am', amount: 17 })
      .and.contain({ start: '5:30 pm', amount: 6 });
    });
  });

  describe('processSensitivityData', () => {
    it('should return formatted objects', () => {
      expect(
        data.processSensitivityData(
          multirateSettingsData.insulinSensitivity,
          multirateSettingsData.units.bg,
        )
      )
      .to.have.length(1)
      .and.contain({ start: '12:00 am', amount: '1.8' });
    });
  });

  describe('processBasalRateData', () => {
    it('should return formatted objects', () => {
      expect(
        data.processBasalRateData(
          multirateSettingsData.basalSchedules[0],
        )
      )
      .to.have.length(5)
      .to.contain({ start: '12:00 am', rate: '0.750' })
      .and.contain({ start: '2:30 am', rate: '0.850' })
      .and.contain({ start: '6:00 am', rate: '0.900' })
      .and.contain({ start: '5:30 pm', rate: '0.850' })
      .and.contain({ start: '12:00 am', rate: '0.750' })
      .and.contain({ start: 'Total', rate: '20.725' });
    });

    it('should cope with empty shedules', () => {
      expect(
        data.processBasalRateData(
          multirateSettingsData.basalSchedules[1],
        )
      )
      .to.have.length(1)
      .to.contain({ start: '-', rate: '-' });
      expect(
        data.processBasalRateData({
          name: 'Foo',
          value: [{
            start: 0,
          }],
        })
      )
      .to.have.length(1)
      .to.contain({ start: '-', rate: '-' });
    });
  });

  describe('processTimedSettings', () => {
    it('should return formatted objects', () => {
      expect(
        data.processTimedSettings(
          timedSettingsData,
          { name: 'Sick', position: 1 },
          timedSettingsData.units.bg,
        )
      )
      .to.have.length(5)
      .to.contain({
        start: '12:00 am',
        rate: '0.350',
        bgTarget: '5.3',
        carbRatio: 7,
        insulinSensitivity: '2.6',
      })
      .and.contain({
        start: '3:30 am',
        rate: '0.225',
        bgTarget: '5.0',
        carbRatio: 10,
        insulinSensitivity: '4.5',
      })
      .and.contain({
        start: '10:00 am',
        rate: '1.075',
        bgTarget: '5.0',
        carbRatio: 10,
        insulinSensitivity: '4.5',
      })
      .and.contain({
        start: '8:00 pm',
        rate: '0.625',
        bgTarget: '5.0',
        carbRatio: 9,
        insulinSensitivity: '4.5',
      })
      .and.contain({
        start: 'Total',
        rate: '15.938',
        bgTarget: '',
        carbRatio: '',
        insulinSensitivity: '',
      });
    });
  });

  describe('getScheduleLabel', () => {
    it('should return an object of the basal schedule label parts', () => {
      expect(data.getScheduleLabel('one', 'two')).to.deep.equal({
        main: 'one',
        secondary: '',
        units: 'U/hr',
      });
    });

    it('should provide "Active at upload" in `secondary` if schedule names match', () => {
      expect(data.getScheduleLabel('one', 'one')).to.deep.equal({
        main: 'one',
        secondary: 'Active at upload',
        units: 'U/hr',
      });
    });

    it('should return an empty string for `units` if given `noUnits` option', () => {
      expect(data.getScheduleLabel('one', 'one', true)).to.deep.equal({
        main: 'one',
        secondary: 'Active at upload',
        units: '',
      });
    });
  });

  describe('getTimedSchedules', () => {
    it('should return the timed settings schedule names', () => {
      expect(
        data.getTimedSchedules(settingsData.basalSchedules)
      )
      .to.have.length(2)
      .to.contain({ name: 'Normal', position: 0 })
      .and.contain({ name: 'Sick', position: 1 });
    });
  });

  describe('getTotalBasalRates', () => {
    it('should return the rate total for multi rate settings', () => {
      expect(
        data.getTotalBasalRates(
          multirateSettingsData.basalSchedules[0].value,
        )
      ).to.equal('20.725');
    });

    it('should return the rate total for flatrate settings', () => {
      expect(
        data.getTotalBasalRates(
          settingsData.basalSchedules[0].value,
        )
      ).to.equal('10.800');
    });
  });

  describe('getDeviceMeta', () => {
    const timePrefs = {
      timezoneAware: false,
      timezoneName: null,
    };
    it('[timezone-naive] should return the serial, schedule and date uploaded device', () => {
      expect(
        data.getDeviceMeta(settingsData, timePrefs)
      ).to.have.property('serial').equal('0987654321');
      expect(
        data.getDeviceMeta(settingsData, timePrefs)
      ).to.have.property('schedule').equal('Normal');
      expect(
        data.getDeviceMeta(settingsData, timePrefs)
      ).to.have.property('uploaded').equal('Jul 12, 2016');
    });

    it('[timezone-aware] should return the serial, schedule and date uploaded device', () => {
      const timezoneAwarePrefs = {
        timezoneAware: true,
        timezoneName: 'US/Mountain',
      };
      expect(
        data.getDeviceMeta(settingsData, timezoneAwarePrefs)
      ).to.have.property('serial').equal('0987654321');
      expect(
        data.getDeviceMeta(settingsData, timezoneAwarePrefs)
      ).to.have.property('schedule').equal('Normal');
      expect(
        data.getDeviceMeta(settingsData, timezoneAwarePrefs)
      ).to.have.property('uploaded').equal('Jul 13, 2016');
    });

    it('should return the serial, schedule and date uploaded as unknown', () => {
      expect(
        data.getDeviceMeta({}, timePrefs)
      ).to.have.property('serial').equal('unknown');
      expect(
        data.getDeviceMeta({}, timePrefs)
      ).to.have.property('schedule').equal('unknown');
      expect(
        data.getDeviceMeta({}, timePrefs)
      ).to.have.property('uploaded').equal('unknown');
    });
  });

  describe('startTimeAndValue', () => {
    const valueKey = 'whatever';
    it('should return an array of "Start Time" and "Value" column descriptions', () => {
      expect(data.startTimeAndValue(valueKey)).to.deep.equal([{
        key: 'start', label: 'Start time',
      }, {
        key: valueKey, label: 'Value',
      }]);
    });
  });
});
