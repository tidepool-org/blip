/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as common from '../../../src/containers/settings/common';

const settingsData = require('../../../data/pumpSettings/tandem/flatrate.json');

describe('common', () => {
  describe('DISPLAY_PRESCION_PLACES', () => {
    it('should be 3', () => {
      expect(common.DISPLAY_PRESCION_PLACES).to.equal(3);
    });
  });
  describe('MMOLL_UNITS', () => {
    it('should be mmol/L', () => {
      expect(common.MMOLL_UNITS).to.equal('mmol/L');
    });
  });
  describe('MGDL_UNITS', () => {
    it('should be mg/dL', () => {
      expect(common.MGDL_UNITS).to.equal('mg/dL');
    });
  });
  describe('getTime', () => {
    it('should return the formatted time', () => {
      expect(common.getTime(settingsData.basalSchedules.Normal, 0)).to.equal('12:00 am');
    });
    it('should return nothing if there is no match', () => {
      expect(common.getTime(settingsData.basalSchedules.Normal, 999999)).to.equal('');
    });
  });
  describe('getRate', () => {
    it('should return the formatted rate', () => {
      expect(common.getRate(settingsData.basalSchedules.Normal, 0)).to.equal('0.450');
    });
    it('should return nothing if there is no match', () => {
      expect(common.getRate(settingsData.basalSchedules.Normal, 999999)).to.equal('');
    });
  });
  describe('getBloodGlucoseValue', () => {
    it('should return the formatted Blood Glucose value', () => {
      expect(
        common.getBloodGlucoseValue(settingsData.bgTargets.Normal, 'target', 0, 'mmol/L')
      ).to.equal('5.0');
    });
    it('should return nothing if there is no match', () => {
      expect(
        common.getBloodGlucoseValue(settingsData.bgTargets.Normal, 'target', 999999, 'mmol/L')
      ).to.equal('0.0');
    });
  });
  describe('getScheduleNames', () => {
    it('should return the schedule names for a type', () => {
      expect(
        common.getScheduleNames(settingsData.basalSchedules)
      ).to.have.length(2).and.contain('Normal').and.contain('Sick');
    });
  });
  describe('getValue', () => {
    it('should return value for a named field and start time', () => {
      expect(
        common.getValue(settingsData.bgTargets.Normal, 'target', 0)
      ).to.equal(4.9956731919409805);
    });
    it('should return nothing if there is no match', () => {
      expect(
        common.getValue(settingsData.bgTargets.Normal, 'blah', 0)
      ).to.equal('');
    });
  });
});
