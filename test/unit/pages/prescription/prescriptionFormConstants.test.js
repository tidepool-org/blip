import _ from 'lodash';
import * as prescriptionFormConstants from '../../../../app/pages/prescription/prescriptionFormConstants';

/* global chai */
/* global describe */
/* global it */

const expect = chai.expect;

describe('prescriptionFormConstants', function() {
  it('should export the `dateFormat`', function() {
    expect(prescriptionFormConstants.dateFormat).to.equal('YYYY-MM-DD');
  });

  it('should export the `phoneRegex`', function() {
    expect(prescriptionFormConstants.phoneRegex).to.eql(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
  });

  it('should export the list of revision states', function() {
    expect(prescriptionFormConstants.revisionStates).to.be.an('array').and.to.eql([
      'draft',
      'pending',
      'submitted',
    ]);
  });

  it('should export the list pump device options', function() {
    expect(prescriptionFormConstants.pumpDeviceOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.pumpDeviceOptions, 'value')).to.eql([
      prescriptionFormConstants.placeholderDeviceIds.omnipod,
    ]);

    _.each(prescriptionFormConstants.pumpDeviceOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
      expect(device.extraInfo).to.be.an('object');
    })
  });

  it('should export the list cgm device options', function() {
    expect(prescriptionFormConstants.cgmDeviceOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.cgmDeviceOptions, 'value')).to.eql([
      prescriptionFormConstants.placeholderDeviceIds.dexcom,
    ]);

    _.each(prescriptionFormConstants.cgmDeviceOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
      expect(device.extraInfo).to.be.an('object');
    })
  });

  it('should export the default units', () => {
    expect(prescriptionFormConstants.defaultUnits).to.eql({
      basalRate: 'Units/hour',
      bolusAmount: 'Units',
      insulinCarbRatio: 'g/U',
      bloodGlucose: 'mg/dL',
    });
  });

  describe('warningThresholds', () => {
    const minBasal = 0.05;
    const maxBasal = 0.1;
    const meta = {
      initialSettings: { basalRateSchedule: { value: [
        { rate: minBasal },
        { rate: maxBasal },
      ] } },
    };

    const lowWarning = 'The value you have entered is lower than Tidepool typically recommends for most people.';
    const highWarning = 'The value you have entered is higher than Tidepool typically recommends for most people.';
    const basalRateMaximumWarning = 'Tidepool recommends that your maximum basal rate does not exceed 6 times your highest scheduled basal rate of 0.1 U/hr.';

    it('should export the warning thresholds with mg/dL as default bg unit', () => {
      expect(prescriptionFormConstants.warningThresholds(null, meta)).to.eql({
        basalRate: {
          low: { value: 0, message: lowWarning },
        },
        basalRateMaximum: {
          high: { value: maxBasal * 6 + 0.01, message: basalRateMaximumWarning },
        },
        bloodGlucoseTarget: {
          low: { value: 70, message: lowWarning },
          high: { value: 120, message: highWarning },
        },
        bolusAmountMaximum: {
          low: { value: 0, message: lowWarning },
          high: { value: 20, message: highWarning },
        },
        carbRatio: {
          low: { value: 3, message: lowWarning },
          high: { value: 28, message: highWarning },
        },
        insulinSensitivityFactor: {
          low: { value: 15, message: lowWarning },
          high: { value: 400, message: highWarning },
        },
        // suspendThreshold: {
        //   low: { value: 70, message: lowWarning },
        //   high: { value: 120, message: highWarning },
        // },
      });
    });

    it('should export the warning thresholds with mmoll/L as provided', () => {
      const thresholds = prescriptionFormConstants.warningThresholds('mmol/L', meta);

      expect(thresholds.bloodGlucoseTarget.low.value).to.equal(3.9);
      expect(thresholds.bloodGlucoseTarget.high.value).to.equal(6.7);

      expect(thresholds.insulinSensitivityFactor.low.value).to.equal(0.8);
      expect(thresholds.insulinSensitivityFactor.high.value).to.equal(22.2);

      // expect(thresholds.suspendThreshold.low.value).to.equal(3.9);
      // expect(thresholds.suspendThreshold.high.value).to.equal(6.7);
    });
  });

  describe('defaultValues', () => {
    it('should export the default values', () => {
      expect(prescriptionFormConstants.defaultValues()).to.eql({
        basalRate: 0.05,
        basalRateMaximum: 0,
        bolusAmountMaximum: 0,
      });
    });
  });

  describe('defaultRanges', () => {
    it('should export the default ranges with mg/dL as default bg unit', () => {
      expect(prescriptionFormConstants.defaultRanges()).to.eql({
        basalRate: { min: 0, max: 35, step: 0.05 },
        basalRateMaximum: { min: 0, max: 35, step: 0.25 },
        bloodGlucoseTarget: { min: 60, max: 180, step: 1 },
        bolusAmountMaximum: { min: 0, max: 30, step: 1 },
        carbRatio: { min: 1, max: 150, step: 1 },
        insulinSensitivityFactor: { min: 10, max: 500, step: 1 },
        // suspendThreshold: { min: 54, max: 180, step: 1 },
      });
    });

    it('should export the default ranges with mmoll/L as provided', () => {
      const ranges = prescriptionFormConstants.defaultRanges('mmol/L');

      expect(ranges.bloodGlucoseTarget.min).to.equal(3.3);
      expect(ranges.bloodGlucoseTarget.max).to.equal(10);
      expect(ranges.bloodGlucoseTarget.step).to.equal(0.1);

      expect(ranges.insulinSensitivityFactor.min).to.equal(0.6);
      expect(ranges.insulinSensitivityFactor.max).to.equal(27.8);
      expect(ranges.insulinSensitivityFactor.step).to.equal(0.1);

      // expect(ranges.suspendThreshold.min).to.equal(3);
      // expect(ranges.suspendThreshold.max).to.equal(10);
      // expect(ranges.suspendThreshold.step).to.equal(0.1);
    });
  });

  describe('deviceMeta', () => {
    describe('Omnipod device ID provided', () => {
      it('should export the device metadata with mg/dL as default bg unit', () => {
        expect(prescriptionFormConstants.deviceMeta(prescriptionFormConstants.placeholderDeviceIds.omnipod)).to.eql({
          manufacturerName: 'Omnipod',
          ranges: {
            basalRate: { min: 0.05, max: 30, step: 0.05 },
            basalRateMaximum: { min: 0, max: 30, step: 0.25 },
            bloodGlucoseTarget: { min: 60, max: 180, step: 1 },
            bolusAmountMaximum: { min: 0, max: 30, step: 1 },
            carbRatio: { min: 1, max: 150, step: 1 },
            insulinSensitivityFactor: { min: 10, max: 500, step: 1 },
            // suspendThreshold: { min: 54, max: 180, step: 1 },
          },
        });
      });

      it('should export the device metadata with mmoll/L as provided', () => {
        const meta = prescriptionFormConstants.deviceMeta(prescriptionFormConstants.placeholderDeviceIds.omnipod, 'mmol/L');

        expect(meta.ranges.bloodGlucoseTarget.min).to.equal(3.3);
      });
    });

    describe('Dexcom device ID provided', () => {
      it('should export the device metadata', () => {
        expect(prescriptionFormConstants.deviceMeta(prescriptionFormConstants.placeholderDeviceIds.dexcom)).to.eql({
          manufacturerName: 'Dexcom',
        });
      });
    });

    describe('Unknown device ID provided', () => {
      it('should export the device metadata with mg/dL as default bg unit', () => {
        expect(prescriptionFormConstants.deviceMeta('foo')).to.eql({
          manufacturerName: 'Unknown',
          ranges: prescriptionFormConstants.defaultRanges(),
        });
      });

      it('should export the device metadata with mmoll/L as provided', () => {
        const meta = prescriptionFormConstants.deviceMeta('foo', 'mmol/L');

        expect(meta.ranges.bloodGlucoseTarget.min).to.equal(3.3);
      });
    });
  });

  // it('should export the list the prescription account type options', function() {
  //   expect(prescriptionFormConstants.typeOptions).to.be.an('array');
  //   expect(_.map(prescriptionFormConstants.typeOptions, 'value')).to.eql([
  //     'patient',
  //     'caregiver',
  //   ]);

  //   _.each(prescriptionFormConstants.typeOptions, device => {
  //     expect(device.value).to.be.a('string');
  //     expect(device.label).to.be.a('string');
  //   })
  // });

  it('should export the list the prescription patient sex options', function() {
    expect(prescriptionFormConstants.sexOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.sexOptions, 'value')).to.eql([
      'female',
      'male',
      'undisclosed',
    ]);

    _.each(prescriptionFormConstants.sexOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list the prescription training options', function() {
    expect(prescriptionFormConstants.trainingOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.trainingOptions, 'value')).to.eql([
      'inPerson',
      'inModule',
    ]);

    _.each(prescriptionFormConstants.trainingOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
    })
  });

  // it('should export the list the prescription insulin type options', function() {
  //   expect(prescriptionFormConstants.insulinModelOptions).to.be.an('array');
  //   expect(_.map(prescriptionFormConstants.insulinModelOptions, 'value')).to.eql([
  //     'rapidAdult',
  //     'rapidChild',
  //   ]);

  //   _.each(prescriptionFormConstants.insulinModelOptions, device => {
  //     expect(device.value).to.be.a('string');
  //     expect(device.label).to.be.a('string');
  //   })
  // });

  // it('should export the list of valid country codes', function() {
  //   expect(prescriptionFormConstants.validCountryCodes).to.be.an('array').and.to.eql([1]);
  // });
});
