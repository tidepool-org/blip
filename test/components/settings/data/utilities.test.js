/* eslint-env node, mocha */
/* eslint no-console: 0*/

import * as utilities from '../../../../src/components/settings/data/utilities';

const settingsData = require('../../../../data/pumpSettings/tandem/flatrate.json');
const multirateSettingsData = require('../../../../data/pumpSettings/tandem/multirate.json');

describe('utilities', () => {
  describe('DISPLAY_PRESCION_PLACES', () => {
    it('should be 3', () => {
      expect(utilities.DISPLAY_PRESCION_PLACES).to.equal(3);
    });
  });
  describe('MMOLL_UNITS', () => {
    it('should be mmol/L', () => {
      expect(utilities.MMOLL_UNITS).to.equal('mmol/L');
    });
  });
  describe('MGDL_UNITS', () => {
    it('should be mg/dL', () => {
      expect(utilities.MGDL_UNITS).to.equal('mg/dL');
    });
  });
  describe('getFormattedTime', () => {
    it('should return the formatted time', () => {
      expect(
        utilities.getFormattedTime(0)
      ).to.equal('12:00 am');
      expect(
        utilities.getFormattedTime(9000000)
      ).to.equal('02:30 am');
    });
  });
  describe('getScheduleLabel', () => {
    it('should return the formatted time', () => {
      expect(
        utilities.getScheduleLabel('one', 'two')
      ).to.equal('one');
    });
    it('should return the formatted time', () => {
      expect(
        utilities.getScheduleLabel('one', 'one')
      ).to.equal('one (Active at upload)');
    });
  });
  describe('getTimedSchedules', () => {
    it('should return the timed settings schedule names', () => {
      expect(
        utilities.getTimedSchedules(settingsData.basalSchedules)
      )
      .to.have.length(2)
      .to.contain({ name: 'Normal', position: 0 })
      .and.contain({ name: 'Sick', position: 1 });
    });
  });
  describe('getBasalRate', () => {
    it('should return the formatted rate', () => {
      expect(
        utilities.getBasalRate(multirateSettingsData.basalSchedules[0].value, 0)
      ).to.equal('0.350');
    });
    it('should return nothing if there is no match', () => {
      expect(
        utilities.getBasalRate(multirateSettingsData.basalSchedules[0].value, 999999)
      ).to.equal('');
    });
  });
  describe('getTotalBasalRates', () => {
    it('should return the rate total for multi rate settings', () => {
      expect(
        utilities.getTotalBasalRates(
          multirateSettingsData.basalSchedules[0].value,
        )
      ).to.equal('15.938');
    });
  });
  describe('getBloodGlucoseValue', () => {
    it('should return the formatted Blood Glucose value', () => {
      expect(
        utilities.getBloodGlucoseValue(settingsData.bgTargets.Normal, 'target', 0, 'mmol/L')
      ).to.equal('5.0');
    });
    it('should return nothing if there is no match', () => {
      expect(
        utilities.getBloodGlucoseValue(settingsData.bgTargets.Normal, 'target', 999999, 'mmol/L')
      ).to.equal('0.0');
    });
  });
  describe('getValue', () => {
    it('should return value for a named field and start time', () => {
      expect(
        utilities.getValue(settingsData.bgTargets.Normal, 'target', 0)
      ).to.equal(4.9956731919409805);
    });
    it('should return nothing if there is no match', () => {
      expect(
        utilities.getValue(settingsData.bgTargets.Normal, 'blah', 0)
      ).to.equal('');
    });
  });
  describe('getDeviceMeta', () => {
    it('should return the name, schedule and date uploaded device', () => {
      expect(
        utilities.getDeviceMeta(settingsData)
      ).to.have.property('name').equal('DevId0987654321');
      expect(
        utilities.getDeviceMeta(settingsData)
      ).to.have.property('schedule').equal('Normal');
      expect(
        utilities.getDeviceMeta(settingsData)
      ).to.have.property('uploaded').not.equal('unknown');
    });
    it('should return the name, schedule and date uploaded as unknown', () => {
      expect(
        utilities.getDeviceMeta({})
      ).to.have.property('name').equal('unknown');
      expect(
        utilities.getDeviceMeta({})
      ).to.have.property('schedule').equal('unknown');
      expect(
        utilities.getDeviceMeta({})
      ).to.have.property('uploaded').equal('unknown');
    });
  });
});

