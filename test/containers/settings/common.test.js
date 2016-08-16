/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as common from '../../../src/containers/settings/common';

const settingsData = require('../../../data/pumpSettings/tandem/flatrate.json');
const multirateSettingsData = require('../../../data/pumpSettings/tandem/multirate.json');

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
      expect(
        common.getTime(settingsData.basalSchedules.Normal, 0)
      ).to.equal('12:00 am');
    });
    it('should return nothing if there is no match', () => {
      expect(
        common.getTime(settingsData.basalSchedules.Normal, 999999)
      ).to.equal('');
    });
  });
  describe('getBasalRate', () => {
    it('should return the formatted rate', () => {
      expect(
        common.getBasalRate(settingsData.basalSchedules.Normal, 0)
      ).to.equal('0.450');
    });
    it('should return nothing if there is no match', () => {
      expect(
        common.getBasalRate(settingsData.basalSchedules.Normal, 999999)
      ).to.equal('');
    });
  });
  describe('getTotalBasalRates', () => {
    it('should return the rate total flat rate settings', () => {
      expect(
        common.getTotalBasalRates(settingsData.basalSchedules.Normal)
      ).to.equal('0.450');
    });
    it('should return the rate total for multi rate settings', () => {
      expect(
        common.getTotalBasalRates(multirateSettingsData.basalSchedules.Sick)
      ).to.equal('2.275');
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
  describe('getDeviceMeta', () => {
    it('should return the name, schedule and date uploaded device', () => {
      expect(
        common.getDeviceMeta(settingsData)
      ).to.have.property('name').equal('DevId0987654321');
      expect(
        common.getDeviceMeta(settingsData)
      ).to.have.property('schedule').equal('Normal');
      expect(
        common.getDeviceMeta(settingsData)
      ).to.have.property('uploaded').not.equal('unknown');
    });
    it('should return the name, schedule and date uploaded as unknown', () => {
      expect(
        common.getDeviceMeta({})
      ).to.have.property('name').equal('unknown');
      expect(
        common.getDeviceMeta({})
      ).to.have.property('schedule').equal('unknown');
      expect(
        common.getDeviceMeta({})
      ).to.have.property('uploaded').equal('unknown');
    });
  });
});
