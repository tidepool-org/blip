/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as processing from '../../../../src/components/settings/data/processing';

const multirateData = require('../../../../data/pumpSettings/medtronic/multirate.json');

const timedSettingsData = require('../../../../data/pumpSettings/tandem/multirate.json');

describe('processing', () => {
  describe('processBgTargetData', () => {
    it('should return formatted objects', () => {
      expect(
        processing.processBgTargetData(
          multirateData.bgTarget,
          multirateData.units.bg,
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
        processing.processCarbRatioData(
          multirateData.carbRatio,
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
        processing.processSensitivityData(
          multirateData.insulinSensitivity,
          multirateData.units.bg,
        )
      )
      .to.have.length(1)
      .and.contain({ start: '12:00 am', amount: '1.8' });
    });
  });
  describe('processBasalRateData', () => {
    it('should return formatted objects', () => {
      expect(
        processing.processBasalRateData(
          multirateData.basalSchedules[0],
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
        processing.processBasalRateData(
          multirateData.basalSchedules[1],
        )
      )
      .to.have.length(1)
      .to.contain({ start: '-', rate: '-' });
    });
  });
  describe('processTimedSettings', () => {
    it('should return formatted objects', () => {
      expect(
        processing.processTimedSettings(
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
});
