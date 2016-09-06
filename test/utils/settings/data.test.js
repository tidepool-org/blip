/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as data from '../../../src/utils/settings/data';

const multirateSettingsData = require('../../../data/pumpSettings/medtronic/multirate.json');
const settingsData = require('../../../data/pumpSettings/tandem/flatrate.json');
const timedSettingsData = require('../../../data/pumpSettings/tandem/multirate.json');

describe('data', () => {
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
      .and.contain({ start: '06:00 pm', columnTwo: '4.2', columnThree: '8.3' });
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
      .and.contain({ start: '02:30 am', amount: 22 })
      .and.contain({ start: '06:00 am', amount: 17 })
      .and.contain({ start: '05:30 pm', amount: 6 });
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
      .and.contain({ start: '02:30 am', rate: '0.850' })
      .and.contain({ start: '06:00 am', rate: '0.900' })
      .and.contain({ start: '05:30 pm', rate: '0.850' })
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
        start: '03:30 am',
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
        start: '08:00 pm',
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
  describe('DISPLAY_PRESCION_PLACES', () => {
    it('should be 3', () => {
      expect(data.DISPLAY_PRESCION_PLACES).to.equal(3);
    });
  });
  describe('MMOLL_UNITS', () => {
    it('should be mmol/L', () => {
      expect(data.MMOLL_UNITS).to.equal('mmol/L');
    });
  });
  describe('MGDL_UNITS', () => {
    it('should be mg/dL', () => {
      expect(data.MGDL_UNITS).to.equal('mg/dL');
    });
  });
  describe('getScheduleLabel', () => {
    it('should return the formatted time', () => {
      expect(
        data.getScheduleLabel('one', 'two')
      ).to.equal('one');
    });
    it('should return the formatted time', () => {
      expect(
        data.getScheduleLabel('one', 'one')
      ).to.equal('one (Active at upload)');
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
  });
  describe('getDeviceMeta', () => {
    it('should return the name, schedule and date uploaded device', () => {
      expect(
        data.getDeviceMeta(settingsData)
      ).to.have.property('name').equal('DevId0987654321');
      expect(
        data.getDeviceMeta(settingsData)
      ).to.have.property('schedule').equal('Normal');
      expect(
        data.getDeviceMeta(settingsData)
      ).to.have.property('uploaded').not.equal('unknown');
    });
    it('should return the name, schedule and date uploaded as unknown', () => {
      expect(
        data.getDeviceMeta({})
      ).to.have.property('name').equal('unknown');
      expect(
        data.getDeviceMeta({})
      ).to.have.property('schedule').equal('unknown');
      expect(
        data.getDeviceMeta({})
      ).to.have.property('uploaded').equal('unknown');
    });
  });
});
