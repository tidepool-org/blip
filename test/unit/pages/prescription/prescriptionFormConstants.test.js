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
      'omnipodId',
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
      'dexcomId',
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
    const lowWarning = 'The value you have chosen is lower than Tidepool generally recommends.';
    const highWarning = 'The value you have chosen is higher than Tidepool generally recommends.';

    it('should export the warning thresholds with mg/dL as default bg unit', () => {
      expect(prescriptionFormConstants.warningThresholds()).to.eql({
        basalRate: {
          low: { value: 0, message: lowWarning },
        },
        bloodGlucoseTarget: {
          low: { value: 70, message: lowWarning },
          high: { value: 120, message: highWarning },
        },
        bolusAmountMaximum: {
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
        suspendThreshold: {
          low: { value: 70, message: lowWarning },
          high: { value: 120, message: highWarning },
        },
      });
    });

    it('should export the warning thresholds with mmoll/L as provided', () => {
      const thresholds = prescriptionFormConstants.warningThresholds('mmol/L');

      expect(thresholds.bloodGlucoseTarget.low.value).to.equal(3.9);
      expect(thresholds.bloodGlucoseTarget.high.value).to.equal(6.7);

      expect(thresholds.insulinSensitivityFactor.low.value).to.equal(0.8);
      expect(thresholds.insulinSensitivityFactor.high.value).to.equal(22.2);

      expect(thresholds.suspendThreshold.low.value).to.equal(3.9);
      expect(thresholds.suspendThreshold.high.value).to.equal(6.7);
    });
  });

  describe('defaultValues', () => {
    it('should export the default values with mg/dL as default bg unit', () => {
      expect(prescriptionFormConstants.defaultValues()).to.eql({
        basalRate: 0.05,
        basalRateMaximum: 0,
        bloodGlucoseTarget: {
          high: 125,
          low: 112,
        },
        bolusAmountMaximum: 10,
        carbRatio: 10,
        insulinSensitivityFactor: 100,
        suspendThreshold: 80,
      });
    });

    it('should export the default values with mmoll/L as provided', () => {
      const values = prescriptionFormConstants.defaultValues('mmol/L');

      expect(values.bloodGlucoseTarget.high).to.equal(6.9);
      expect(values.bloodGlucoseTarget.low).to.equal(6.2);

      expect(values.insulinSensitivityFactor).to.equal(5.6);
      expect(values.suspendThreshold).to.equal(4.4);
    });
  });

  describe('defaultRanges', () => {
    it('should export the default ranges with mg/dL as default bg unit', () => {
      expect(prescriptionFormConstants.defaultRanges()).to.eql({
        basalRate: { min: 0, max: 35, step: 0.05 },
        basalRateMaximum: { min: 0, max: 35, step: 0.25 },
        bloodGlucoseTarget: { min: 60, max: 180, step: 1 },
        bolusAmountMaximum: { min: 0, max: 30, step: 1 },
        carbRatio: { min: 0, max: 250, step: 1 },
        insulinSensitivityFactor: { min: 0, max: 1000, step: 1 },
        suspendThreshold: { min: 54, max: 180, step: 1 },
      });
    });

    it('should export the default ranges with mmoll/L as provided', () => {
      const ranges = prescriptionFormConstants.defaultRanges('mmol/L');

      expect(ranges.bloodGlucoseTarget.min).to.equal(3.3);
      expect(ranges.bloodGlucoseTarget.max).to.equal(10);
      expect(ranges.bloodGlucoseTarget.step).to.equal(0.1);

      expect(ranges.insulinSensitivityFactor.min).to.equal(0);
      expect(ranges.insulinSensitivityFactor.max).to.equal(55.5);
      expect(ranges.insulinSensitivityFactor.step).to.equal(0.1);

      expect(ranges.suspendThreshold.min).to.equal(3);
      expect(ranges.suspendThreshold.max).to.equal(10);
      expect(ranges.suspendThreshold.step).to.equal(0.1);
    });
  });

  describe('deviceMeta', () => {
    describe('Omnipod device ID provided', () => {
      it('should export the device metadata with mg/dL as default bg unit', () => {
        expect(prescriptionFormConstants.deviceMeta('omnipodId')).to.eql({
          manufacturerName: 'Omnipod',
          ranges: {
            basalRate: { min: 0, max: 30, step: 0.05 },
            basalRateMaximum: { min: 0, max: 30, step: 0.25 },
            bloodGlucoseTarget: { min: 60, max: 180, step: 1 },
            bolusAmountMaximum: { min: 0, max: 30, step: 1 },
            carbRatio: { min: 0, max: 150, step: 1 },
            insulinSensitivityFactor: { min: 0, max: 1000, step: 1 },
            suspendThreshold: { min: 54, max: 180, step: 1 },
          },
        });
      });

      it('should export the device metadata with mmoll/L as provided', () => {
        const meta = prescriptionFormConstants.deviceMeta('omnipodId', 'mmol/L');

        expect(meta.ranges.bloodGlucoseTarget.min).to.equal(3.3);
      });
    });

    describe('Dexcom device ID provided', () => {
      it('should export the device metadata with mg/dL as default bg unit', () => {
        expect(prescriptionFormConstants.deviceMeta('dexcomId')).to.eql({
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

  it('should export the list the prescription account type options', function() {
    expect(prescriptionFormConstants.typeOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.typeOptions, 'value')).to.eql([
      'patient',
      'caregiver',
    ]);

    _.each(prescriptionFormConstants.typeOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
    })
  });

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

  it('should export the list the prescription insulin type options', function() {
    expect(prescriptionFormConstants.insulinTypeOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.insulinTypeOptions, 'value')).to.eql([
      'rapidAdult',
      'rapidChild',
    ]);

    _.each(prescriptionFormConstants.insulinTypeOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of valid country codes', function() {
    expect(prescriptionFormConstants.validCountryCodes).to.be.an('array').and.to.eql([1]);
  });
});
