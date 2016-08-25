/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as dataProcessing from '../../../src/containers/settings/dataProcessing';

const multirateData = require('../../../data/pumpSettings/medtronic/multirate.json');

describe('dataProcessing', () => {
  describe('processBgTargetData', () => {
    it('should return formatted objects', () => {
      expect(
        dataProcessing.processBgTargetData(
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
        dataProcessing.processCarbRatioData(
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
        dataProcessing.processSensitivityData(
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
        dataProcessing.processBasalRateData(
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
        dataProcessing.processBasalRateData(
          multirateData.basalSchedules[1],
        )
      )
      .to.have.length(1)
      .to.contain({ start: '-', rate: '-' });
    });
  });
});
