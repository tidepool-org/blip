/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as dataProcessing from '../../../src/containers/settings/dataProcessing';

const multirateData = require('../../../data/pumpSettings/medtronic/multirate.json');

describe('dataProcessing', () => {
  describe('processBgTargetData', () => {
    it('should return 3 items', () => {
      expect(
        dataProcessing.processBgTargetData(
          multirateData.bgTarget,
          multirateData.units.bg,
          { columnTwo: 'low', columnThree: 'high' },
        )
      ).to.have.length(3);
    });
    it('should return formatted objects', () => {
      expect(
        dataProcessing.processBgTargetData(
          multirateData.bgTarget,
          multirateData.units.bg,
          { columnTwo: 'low', columnThree: 'high' },
        )[1]
      ).to.deep.equal({ start: '11:30 am', columnTwo: '4.4', columnThree: '6.7' });
    });
  });
  describe('processCarbRatioData', () => {
    it('should return 4 items', () => {
      expect(
        dataProcessing.processCarbRatioData(
          multirateData.carbRatio,
        )
      ).to.have.length(4);
    });
    it('should return formatted objects', () => {
      expect(
        dataProcessing.processCarbRatioData(
          multirateData.carbRatio,
        )[1]
      ).to.deep.equal({ start: '02:30 am', amount: 22 });
    });
  });
  describe('processSensitivityData', () => {
    it('should return 1 item', () => {
      expect(
        dataProcessing.processSensitivityData(
          multirateData.insulinSensitivity,
          multirateData.units.bg,
        )
      ).to.have.length(1);
    });
    it('should return formatted objects', () => {
      expect(
        dataProcessing.processSensitivityData(
          multirateData.insulinSensitivity,
          multirateData.units.bg,
        )[0]
      ).to.deep.equal({ start: '12:00 am', amount: '1.8' });
    });
  });
});
