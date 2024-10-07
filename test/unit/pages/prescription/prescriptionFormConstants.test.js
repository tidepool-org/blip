import _ from 'lodash';
import moment from 'moment';
import * as prescriptionFormConstants from '../../../../app/pages/prescription/prescriptionFormConstants';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../../app/core/constants';
import utils from '../../../../app/core/utils';

/* global chai */
/* global context */
/* global describe */
/* global it */
/* global sinon */
/* global afterEach */
/* global beforeEach */

const expect = chai.expect;

const devices = {
  cgms: [{ id: prescriptionFormConstants.deviceIdMap.dexcomG6 }],
  pumps: [{ id: prescriptionFormConstants.deviceIdMap.palmtree }],
};

describe('prescriptionFormConstants', function() {
  it('should export the `dateFormat`', function() {
    expect(prescriptionFormConstants.dateFormat).to.equal('YYYY-MM-DD');
  });

  it('should export the `dateRegex`', function() {
    expect(prescriptionFormConstants.dateRegex).to.eql(/^(.*)[-|/](.*)[-|/](.*)$/);
  });

  it('should export the `phoneRegex`', function() {
    expect(prescriptionFormConstants.phoneRegex).to.eql(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);
  });

  it('should export the list of revision states', function() {
    expect(prescriptionFormConstants.revisionStateOptions).to.be.an('array').and.to.eql([
      {
        colorPalette: 'blues',
        label: 'Draft',
        value: 'draft',
      },
      {
        colorPalette: 'oranges',
        label: 'Pending Approval',
        value: 'pending',
      },
      {
        colorPalette: 'indigos',
        label: 'Submitted',
        value: 'submitted',
      },
    ]);
  });

  it('should export a device-id map with known device IDs', () => {
    expect(prescriptionFormConstants.deviceIdMap).to.eql({
      cgmSimulator: 'c97bd194-5e5e-44c1-9629-4cb87be1a4c9',
      dexcomG6: 'd25c3f1b-a2e8-44e2-b3a3-fd07806fc245',
      palmtree: 'c524b5b0-632e-4125-8f6a-df9532d8f6fe',
    });
  });

  it('should export a list of valid cgms and pumps', () => {
    expect(prescriptionFormConstants.validDeviceIds).to.be.an('object').with.keys([
      'cgms',
      'pumps',
    ]);
    expect(prescriptionFormConstants.validDeviceIds.cgms).to.be.an('array').and.contain(prescriptionFormConstants.deviceIdMap.dexcomG6);
    expect(prescriptionFormConstants.validDeviceIds.pumps).to.be.an('array').and.contain(prescriptionFormConstants.deviceIdMap.palmtree);
  });

  it('should export extra details about each device', () => {
    expect(prescriptionFormConstants.deviceDetails).to.be.an('object').and.have.keys([
      prescriptionFormConstants.deviceIdMap.cgmSimulator,
      prescriptionFormConstants.deviceIdMap.dexcomG6,
      prescriptionFormConstants.deviceIdMap.palmtree,
    ]);

    _.each(prescriptionFormConstants.deviceDetails, (details, deviceId) => {
      expect(details).to.have.keys(['description']);
    });
  });

  it('should export the list of the pump device options', function() {
    const pumpDeviceOptions = prescriptionFormConstants.pumpDeviceOptions(devices);
    expect(pumpDeviceOptions).to.be.an('array');
    expect(_.map(pumpDeviceOptions, 'value')).to.eql([
      prescriptionFormConstants.deviceIdMap.palmtree,
    ]);

    _.each(pumpDeviceOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
      expect(device.description).to.be.an('object');
    })
  });

  it('should export the list of the cgm device options', function() {
    const cgmDeviceOptions = prescriptionFormConstants.cgmDeviceOptions(devices);
    expect(cgmDeviceOptions).to.be.an('array');
    expect(_.map(cgmDeviceOptions, 'value')).to.eql([
      prescriptionFormConstants.deviceIdMap.dexcomG6,
    ]);

    _.each(cgmDeviceOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
      expect(device.description).to.be.an('object');
    })
  });

  it('should export the default units', () => {
    expect(prescriptionFormConstants.defaultUnits).to.eql({
      basalRate: 'Units/hour',
      bloodGlucose: 'mg/dL',
      bolusAmount: 'Units',
      insulinCarbRatio: 'g/U',
      weight: 'kg',
    });
  });

  describe('getPumpGuardrail', () => {
    const pump = {
      guardRails: {
        guardRail1: {
          units: 0,
          nanos: 900000000,
        },
        guardRail2: {
          nested: {
            units: 8,
            nanos: 12000000,
          },
        },
        guardRail4: null,
      },
    };

    it('should return the pump guard rail at a given path as a float', () => {
      expect(prescriptionFormConstants.getPumpGuardrail(pump, 'guardRail1')).to.equal(0.9);
      expect(prescriptionFormConstants.getPumpGuardrail(pump, 'guardRail2.nested')).to.equal(8.012);
    });

    it('should fall back to provided value if guard rail cannot be provided from path', () => {
      expect(prescriptionFormConstants.getPumpGuardrail(pump, 'guardRail3', 'foo')).to.equal('foo');
    });

    it('should fall back to provided value if guard rail provided from path is null', () => {
      expect(prescriptionFormConstants.getPumpGuardrail(pump, 'guardRail4', 'bar')).to.equal('bar');
    });
  });

  describe('getBgInTargetUnits', () => {
    it('should return a bg value in target units', () => {
      expect(prescriptionFormConstants.getBgInTargetUnits(120, MGDL_UNITS, MMOLL_UNITS)).to.equal(6.7);
      expect(prescriptionFormConstants.getBgInTargetUnits(6.7, MMOLL_UNITS, MGDL_UNITS)).to.equal(120);
    });

    it('should return a bg value as provided if current units = target units', () => {
      expect(prescriptionFormConstants.getBgInTargetUnits(120, MGDL_UNITS, MGDL_UNITS)).to.equal(120);
      expect(prescriptionFormConstants.getBgInTargetUnits(6.7, MMOLL_UNITS, MMOLL_UNITS)).to.equal(6.7);
    });

    it('should return a bg value as provided if it not a finite number', () => {
      expect(prescriptionFormConstants.getBgInTargetUnits(NaN, MGDL_UNITS, MGDL_UNITS)).to.be.NaN;
      expect(prescriptionFormConstants.getBgInTargetUnits(Infinity, MGDL_UNITS, MGDL_UNITS)).to.equal(Infinity);
      expect(prescriptionFormConstants.getBgInTargetUnits('foo', MGDL_UNITS, MGDL_UNITS)).to.equal('foo');
    });
  });

  describe('getBgStepInTargetUnits', () => {
    it('should return 1/10 of a mg/dL step value when targeting mmol/L units', () => {
      expect(prescriptionFormConstants.getBgStepInTargetUnits(5, MGDL_UNITS, MMOLL_UNITS)).to.equal(0.5);
    });

    it('should return 10 times a mmol/L step value when targeting mg/dL units', () => {
      expect(prescriptionFormConstants.getBgStepInTargetUnits(0.5, MMOLL_UNITS, MGDL_UNITS)).to.equal(5);
    });

    it('should return a bg value as provided if current units = target units', () => {
      expect(prescriptionFormConstants.getBgStepInTargetUnits(5, MGDL_UNITS, MGDL_UNITS)).to.equal(5);
      expect(prescriptionFormConstants.getBgStepInTargetUnits(0.5, MMOLL_UNITS, MMOLL_UNITS)).to.equal(0.5);
    });

    it('should return a bg value as provided if it not a finite number', () => {
      expect(prescriptionFormConstants.getBgStepInTargetUnits(NaN, MGDL_UNITS, MGDL_UNITS)).to.be.NaN;
      expect(prescriptionFormConstants.getBgStepInTargetUnits(Infinity, MGDL_UNITS, MGDL_UNITS)).to.equal(Infinity);
      expect(prescriptionFormConstants.getBgStepInTargetUnits('foo', MGDL_UNITS, MGDL_UNITS)).to.equal('foo');
    });
  });

  describe('warningThresholds', () => {
    const lowWarning = 'The value you have chosen is lower than Tidepool generally recommends.';
    const highWarning = 'The value you have chosen is higher than Tidepool generally recommends.';

    it('should export the pump-specific warning thresholds with mg/dL as default bg unit if pump is provided', () => {
      const pump = {
        guardRails: {
          correctionRange: { recommendedBounds: {
            minimum: { units: 10, nanos: 0 },
            maximum: { units: 100, nanos: 0 },
          } },
          workoutCorrectionRange: { recommendedBounds: {
            minimum: { units: 11, nanos: 0 },
            maximum: { units: 110, nanos: 0 },
          } },
          bolusAmountMaximum: {
            absoluteBounds: {
              maximum: { units: 220, nanos: 0 },
            },
            recommendedBounds: {
              minimum: { units: 20, nanos: 0 },
              maximum: { units: 200, nanos: 0 },
            }
          },
          carbohydrateRatio: { recommendedBounds: {
            minimum: { units: 30, nanos: 0 },
            maximum: { units: 300, nanos: 0 },
          } },
          insulinSensitivity: { recommendedBounds: {
            minimum: { units: 40, nanos: 0 },
            maximum: { units: 400, nanos: 0 },
          } },
          glucoseSafetyLimit: { recommendedBounds: {
            minimum: { units: 50, nanos: 0 },
            maximum: { units: 500, nanos: 0 },
          } },
        },
      };

      expect(prescriptionFormConstants.warningThresholds(pump)).to.eql({
        basalRateMaximum: {
          high: undefined,
          low: undefined,
        },
        bloodGlucoseTarget: {
          low: { value: 10, message: lowWarning },
          high: { value: 100, message: highWarning },
        },
        bloodGlucoseTargetPhysicalActivity: {
          low: undefined,
          high: { value: 110, message: highWarning },
        },
        bloodGlucoseTargetPreprandial: {
          high: undefined,
        },
        bolusAmountMaximum: {
          low: { value: 20, message: lowWarning },
          high: { value: 200, message: highWarning },
        },
        carbRatio: {
          low: { value: 30, message: lowWarning },
          high: { value: 300, message: highWarning },
        },
        insulinSensitivityFactor: {
          low: { value: 40, message: lowWarning },
          high: { value: 400, message: highWarning },
        },
        glucoseSafetyLimit: {
          low: { value: 50, message: lowWarning },
          high: { value: 500, message: highWarning },
        },
      });
    });

    it('should export the default warning thresholds with mg/dL as default bg unit if pump is not provided', () => {
      expect(prescriptionFormConstants.warningThresholds()).to.eql({
        basalRateMaximum: {
          high: undefined,
          low: undefined,
        },
        bloodGlucoseTarget: {
          low: { value: 100, message: lowWarning },
          high: { value: 115, message: highWarning },
        },
        bloodGlucoseTargetPhysicalActivity: {
          low: undefined,
          high: { value: 180, message: highWarning },
        },
        bloodGlucoseTargetPreprandial: {
          high: undefined,
        },
        bolusAmountMaximum: {
          low: { value: 0.05, message: lowWarning },
          high: undefined,
        },
        carbRatio: {
          low: { value: 4, message: lowWarning },
          high: { value: 28, message: highWarning },
        },
        insulinSensitivityFactor: {
          low: { value: 16, message: lowWarning },
          high: { value: 399, message: highWarning },
        },
        glucoseSafetyLimit: {
          low: { value: 74, message: lowWarning },
          high: { value: 80, message: highWarning },
        },
      });
    });

    it('should export the default warning thresholds with mmoll/L as provided by bgUnits arg if pump is not provided', () => {
      const thresholds = prescriptionFormConstants.warningThresholds(undefined, MMOLL_UNITS);

      expect(thresholds.bloodGlucoseTarget.low.value).to.equal(5.6);
      expect(thresholds.bloodGlucoseTarget.high.value).to.equal(6.4);

      expect(thresholds.insulinSensitivityFactor.low.value).to.equal(0.9);
      expect(thresholds.insulinSensitivityFactor.high.value).to.equal(22.1);

      expect(thresholds.glucoseSafetyLimit.low.value).to.equal(4.1);
      expect(thresholds.glucoseSafetyLimit.high.value).to.equal(4.4);
    });

    context('thresholds updated by other therapy settings values', () => {
      describe('basalRateMaximum', () => {
        it('should set high to the Highest Scheduled Basal Rate x 6.4', () => {
          const result = prescriptionFormConstants.warningThresholds(undefined, MGDL_UNITS, {
            initialSettings: { basalRateSchedule: [{ rate: 0.05 }, { rate: 0.1 }], }
          }).basalRateMaximum;

          expect(result.high.value).to.equal(0.64);
          expect(result.high.message).to.equal('Tidepool recommends that your maximum basal rate does not exceed 6.4 times your highest scheduled basal rate of 0.1 U/hr.');
        });

        it('should set low to the Highest Scheduled Basal Rate x 2.1', () => {
          const result = prescriptionFormConstants.warningThresholds(undefined, MGDL_UNITS, {
            initialSettings: { basalRateSchedule: [{ rate: 0.05 }, { rate: 0.1 }], }
          }).basalRateMaximum;

          expect(result.low.value).to.equal(0.21);
          expect(result.low.message).to.equal('Tidepool recommends that your maximum basal rate is at least 2.1 times your highest scheduled basal rate of 0.1 U/hr.');
        });
      });

      describe('bloodGlucoseTargetPhysicalActivity', () => {
        it('should set low to the Correction Range Upper Bound', () => {
          const result = prescriptionFormConstants.warningThresholds(undefined, MGDL_UNITS, {
            initialSettings: { bloodGlucoseTargetSchedule: [{ low: 30, high: 50 }, { low: 25, high: 45 }], }
          }).bloodGlucoseTargetPhysicalActivity;

          expect(result.low.value).to.equal(50);
          expect(result.low.message).to.equal('Tidepool generally recommends a workout range higher than your normal correction range (25-50 mg/dL).');
        });
      });

      describe('bloodGlucoseTargetPreprandial', () => {
        it('should set high to the Correction Range Lower Bound', () => {
          const result = prescriptionFormConstants.warningThresholds(undefined, MGDL_UNITS, {
            initialSettings: { bloodGlucoseTargetSchedule: [{ low: 30, high: 50 }, { low: 25, high: 45 }], }
          }).bloodGlucoseTargetPreprandial;

          expect(result.high.value).to.equal(25);
          expect(result.high.message).to.equal('Tidepool generally recommends a pre-meal range lower than your normal correction range (25-50 mg/dL).');
        });
      });

      describe('bolusAmountMaximum', () => {
        it('should set high to `undefined` if pump supported maximum < 20, else default to 19.95', () => {
          const result = prescriptionFormConstants.warningThresholds({
            guardRails: { bolusAmountMaximum: { absoluteBounds: {
              maximum: { units: 20, nanos: 0 },
            } } },
          }).bolusAmountMaximum;

          expect(result.high.value).to.equal(19.95);
          expect(result.high.message).to.equal(highWarning);

          expect(prescriptionFormConstants.warningThresholds({
            guardRails: { bolusAmountMaximum: { absoluteBounds: {
              maximum: { units: 19, nanos: 0 },
            } } },
          }).bolusAmountMaximum.high).to.be.undefined;
        });
      });
    });
  });

  describe('pumpRanges', () => {
    it('should export the pump-specific ranges with mg/dL as default bg unit if pump is provided', () => {
      const pump = {
        id: prescriptionFormConstants.deviceIdMap.palmtree,
        guardRails: {
          basalRates: {
            absoluteBounds: {
              minimum: { units: 1, nanos: 0 },
              maximum: { units: 11, nanos: 0 },
              increment: { units: 1, nanos: 0 },
            },
            maxSegments: 24,
          },
          basalRateMaximum: { absoluteBounds: {
            minimum: { units: 2, nanos: 0 },
            maximum: { units: 12, nanos: 0 },
            increment: { units: 2, nanos: 0 },
          } },
          correctionRange: { absoluteBounds: {
            minimum: { units: 3, nanos: 0 },
            maximum: { units: 13, nanos: 0 },
            increment: { units: 3, nanos: 0 },
          } },
          bolusAmountMaximum: { absoluteBounds: {
            minimum: { units: 4, nanos: 0 },
            maximum: { units: 14, nanos: 0 },
            increment: { units: 4, nanos: 0 },
          } },
          carbohydrateRatio: { absoluteBounds: {
            minimum: { units: 5, nanos: 0 },
            maximum: { units: 15, nanos: 0 },
            increment: { units: 5, nanos: 0 },
            inputStep: 1,
          } },
          insulinSensitivity: { absoluteBounds: {
            minimum: { units: 6, nanos: 0 },
            maximum: { units: 16, nanos: 0 },
            increment: { units: 6, nanos: 0 },
          } },
          preprandialCorrectionRange: { absoluteBounds: {
            minimum: { units: 7, nanos: 0 },
            maximum: { units: 17, nanos: 0 },
            increment: { units: 7, nanos: 0 },
          } },
          workoutCorrectionRange: { absoluteBounds: {
            minimum: { units: 8, nanos: 0 },
            maximum: { units: 18, nanos: 0 },
            increment: { units: 8, nanos: 0 },
          } },
          glucoseSafetyLimit: { absoluteBounds: {
            minimum: { units: 9, nanos: 0 },
            maximum: { units: 19, nanos: 0 },
            increment: { units: 9, nanos: 0 },
          } },
        },
      };

      expect(prescriptionFormConstants.pumpRanges(pump)).to.eql({
        basalRate: { min: 1, max: 11, increment: 1, schedules: { max: 24, minutesIncrement: 30 } },
        basalRateMaximum: { min: 2, max: 12, increment: 2 },
        bloodGlucoseTarget: { min: 3, max: 13, increment: 3, schedules: { max: 48, minutesIncrement: 30 } },
        bolusAmountMaximum: { min: 4, max: 14, increment: 4 },
        carbRatio: { min: 5, max: 15, increment: 5, schedules: { max: 48, minutesIncrement: 30 } },
        insulinSensitivityFactor: { min: 6, max: 16, increment: 6, schedules: { max: 48, minutesIncrement: 30 } },
        bloodGlucoseTargetPreprandial: { min: 9, max: 17, increment: 7 }, // Uses the glucoseSafetyLimit min since it's higher
        bloodGlucoseTargetPhysicalActivity: { min: 8, max: 18, increment: 8 },
        glucoseSafetyLimit: { min: 9, max: 19, increment: 9 },
      });
    });

    it('should export the default ranges with mg/dL as default bg unit if pump is not provided', () => {
      expect(prescriptionFormConstants.pumpRanges()).to.eql({
        basalRate: { min: 0.05, max: 30, increment: 0.05, schedules: { max: 48, minutesIncrement: 30 } },
        basalRateMaximum: { min: 0.05, max: 30, increment: 0.05 },
        bloodGlucoseTarget: { min: 87, max: 180, increment: 1, schedules: { max: 48, minutesIncrement: 30 } },
        bolusAmountMaximum: { min: 0.05, max: 30, increment: 0.05 },
        carbRatio: { min: 2, max: 150, increment: 0.1, schedules: { max: 48, minutesIncrement: 30 } },
        insulinSensitivityFactor: { min: 10, max: 500, increment: 1, schedules: { max: 48, minutesIncrement: 30 } },
        bloodGlucoseTargetPreprandial: { min: 67, max: 130, increment: 1 },
        bloodGlucoseTargetPhysicalActivity: { min: 87, max: 250, increment: 1 },
        glucoseSafetyLimit: { min: 67, max: 110, increment: 1 },
      });
    });

    it('should set the min bloodGlucoseTarget value to the set value of the glucoseSafetyLimit field', () => {
      const values = {
        initialSettings: {
          glucoseSafetyLimit: 90,
        },
      };

      expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, values).bloodGlucoseTarget.min).to.equal(90);
    });

    it('should export the default ranges with mmoll/L as provided by bgUnits arg if pump is not provided', () => {
      const ranges = prescriptionFormConstants.pumpRanges(undefined, MMOLL_UNITS);

      expect(ranges.bloodGlucoseTarget.min).to.equal(4.8);
      expect(ranges.bloodGlucoseTarget.max).to.equal(10);
      expect(ranges.bloodGlucoseTarget.increment).to.equal(0.1);

      expect(ranges.bloodGlucoseTargetPhysicalActivity.min).to.equal(4.8);
      expect(ranges.bloodGlucoseTargetPhysicalActivity.max).to.equal(13.9);
      expect(ranges.bloodGlucoseTargetPhysicalActivity.increment).to.equal(0.1);

      expect(ranges.bloodGlucoseTargetPreprandial.min).to.equal(3.7);
      expect(ranges.bloodGlucoseTargetPreprandial.max).to.equal(7.2);
      expect(ranges.bloodGlucoseTargetPreprandial.increment).to.equal(0.1);

      expect(ranges.insulinSensitivityFactor.min).to.equal(0.6);
      expect(ranges.insulinSensitivityFactor.max).to.equal(27.8);
      expect(ranges.insulinSensitivityFactor.increment).to.equal(0.1);

      expect(ranges.glucoseSafetyLimit.min).to.equal(3.7);
      expect(ranges.glucoseSafetyLimit.max).to.equal(6.1);
      expect(ranges.glucoseSafetyLimit.increment).to.equal(0.1);
    });

    context('guardrails updated by other therapy settings values', () => {
      describe('basalRateMaximum', () => {
        it('should set min to the higher of the default minimum guardrail (0) or Highest Scheduled Basal Rate', () => {
          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { basalRateSchedule: [] }
          }).basalRateMaximum.min).to.equal(0.05);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { basalRateSchedule: [ { rate: 1 }, { rate: 2 } ] }
          }).basalRateMaximum.min).to.equal(2);
        });

        it('should set max to the lower of the default maximum guardrail (30) or 70 / Lowest Carb Ratio', () => {
          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { carbohydrateRatioSchedule: [ { amount: 1 }, { rate: 2 } ] }
          }).basalRateMaximum.max).to.equal(30);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { carbohydrateRatioSchedule: [ { amount: 5 } ] }
          }).basalRateMaximum.max).to.equal(14);
        });
      });

      describe('bloodGlucoseTarget', () => {
        it('should set min to the higher of the default minimum guardrail (87) or Glucose Safety Limit', () => {
          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { glucoseSafetyLimit: 80 }
          }).bloodGlucoseTarget.min).to.equal(87);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { glucoseSafetyLimit: 90 }
          }).bloodGlucoseTarget.min).to.equal(90);
        });
      });

      describe('bloodGlucoseTargetPhysicalActivity', () => {
        it('should set min to the higher of the default minimum guardrail (87) Glucose Safety Limit', () => {
          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { glucoseSafetyLimit: 67 }
          }).bloodGlucoseTargetPhysicalActivity.min).to.equal(87);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { glucoseSafetyLimit: 90 }
          }).bloodGlucoseTargetPhysicalActivity.min).to.equal(90);
        });
      });

      describe('bloodGlucoseTargetPreprandial', () => {
        it('should set min to the higher of the default minimum glucose safety limit guardrail (67) or user-set Glucose Safety Limit', () => {
          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { glucoseSafetyLimit: undefined }
          }).bloodGlucoseTargetPreprandial.min).to.equal(67);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: { glucoseSafetyLimit: 90 }
          }).bloodGlucoseTargetPreprandial.min).to.equal(90);
        });
      });

      describe('glucoseSafetyLimit', () => {
        it('should set max to the lower of the default minimum guardrail (110) or minimum Correction Range , Workout Correction Range, or Pre-Meal Correction Range', () => {
          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: {
              bloodGlucoseTargetPhysicalActivity: { low: 125},
              bloodGlucoseTargetPreprandial: { low: 125},
              bloodGlucoseTargetSchedule: [{ low: 125 }, { low: 115 }],
            },
          }).glucoseSafetyLimit.max).to.equal(110);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: {
              bloodGlucoseTargetPhysicalActivity: { low: 100},
              bloodGlucoseTargetPreprandial: { low: 125},
              bloodGlucoseTargetSchedule: [{ low: 125 }, { low: 115 }],
            },
          }).glucoseSafetyLimit.max).to.equal(100);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: {
              bloodGlucoseTargetPhysicalActivity: { low: 120},
              bloodGlucoseTargetPreprandial: { low: 90},
              bloodGlucoseTargetSchedule: [{ low: 125 }, { low: 115 }],
            },
          }).glucoseSafetyLimit.max).to.equal(90);

          expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, {
            initialSettings: {
              bloodGlucoseTargetPhysicalActivity: { low: 120},
              bloodGlucoseTargetPreprandial: { low: 120},
              bloodGlucoseTargetSchedule: [{ low: 125 }, { low: 85 }],
            },
          }).glucoseSafetyLimit.max).to.equal(85);
        });
      });
    });
  });

  describe('dependantFields', () => {
    expect(prescriptionFormConstants.dependantFields).to.eql({
      'initialSettings.glucoseSafetyLimit': [
        'initialSettings.bloodGlucoseTargetSchedule.$.low',
        'initialSettings.bloodGlucoseTargetSchedule.$.high',
        'initialSettings.bloodGlucoseTargetPreprandial.low',
        'initialSettings.bloodGlucoseTargetPreprandial.high',
        'initialSettings.bloodGlucoseTargetPhysicalActivity.low',
        'initialSettings.bloodGlucoseTargetPhysicalActivity.high',
      ],
      'initialSettings.bloodGlucoseTargetSchedule.low': ['initialSettings.glucoseSafetyLimit'],
      'initialSettings.bloodGlucoseTargetPreprandial.low': ['initialSettings.glucoseSafetyLimit'],
      'initialSettings.bloodGlucoseTargetPhysicalActivity.low': ['initialSettings.glucoseSafetyLimit'],
      'initialSettings.basalRateSchedule.rate': ['initialSettings.basalRateMaximum.value'],
      'initialSettings.carbohydrateRatioSchedule.amount': ['initialSettings.basalRateMaximum.value'],
    });
  });

  describe('defaultValues', () => {
    const pump = {
      guardRails: {
        basalRateMaximum: {
          defaultValue: {
            units: 0,
            nanos: 100000000,
          },
        },
      },
    };

    context('pediatric patient', () => {
      const birthday = moment().subtract(18, 'years').add(1, 'day').toISOString();

      context('max basal rate is not set', () => {
        it('should return a default value from pump guardrails for basalRateMaximum', () => {
          const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
            birthday,
          });

          expect(result.basalRateMaximum).to.equal(0.1);
        });
      });

      context('max basal rate is set', () => {
        it('should return a default value of 3x the max basal rate for basalRateMaximum', () => {
          const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
            birthday,
            initialSettings: { basalRateSchedule: [
              { rate: 0.05 },
              { rate: 0.15 },
              { rate: 0.1 },
            ] },
          });

          expect(result.basalRateMaximum).to.equal(0.45);
        });
      });

      it('should return a default value for bloodGlucoseTarget in mg/dL units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
          birthday,
        });

        expect(result.bloodGlucoseTarget.low).to.equal(100);
        expect(result.bloodGlucoseTarget.high).to.equal(115);
      });

      it('should return a default value for bloodGlucoseTarget in mmol/L units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MMOLL_UNITS, {
          birthday,
        });

        expect(result.bloodGlucoseTarget.low).to.equal(5.6);
        expect(result.bloodGlucoseTarget.high).to.equal(6.4);
      });

      it('should return a default value for glucoseSafetyLimit in mg/dL units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
          birthday,
        });

        expect(result.glucoseSafetyLimit).to.equal(80);
      });

      it('should return a default value for glucoseSafetyLimit in mmol/L units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MMOLL_UNITS, {
          birthday,
        });

        expect(result.glucoseSafetyLimit).to.equal(4.4);
      });
    });

    context('adult patient', () => {
      const birthday = moment().subtract(18, 'years').toISOString();

      context('max basal rate is not set', () => {
        it('should return a default value from pump guardrails for basalRateMaximum', () => {
          const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
            birthday,
          });

          expect(result.basalRateMaximum).to.equal(0.1);
        });
      });

      context('max basal rate is set', () => {
        it('should return a default value of 3.5x the max basal rate for basalRateMaximum, rounded to the nearest increment', () => {
          const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
            birthday,
            initialSettings: { basalRateSchedule: [
              { rate: 0.05 },
              { rate: 0.15 },
              { rate: 0.1 },
            ] },
          });

          expect(result.basalRateMaximum).to.equal(0.55);
        });
      });

      it('should return a default value for bloodGlucoseTarget in mg/dL units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
          birthday,
        });

        expect(result.bloodGlucoseTarget.low).to.equal(100);
        expect(result.bloodGlucoseTarget.high).to.equal(105);
      });

      it('should return a default value for bloodGlucoseTarget in mmol/L units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MMOLL_UNITS, {
          birthday,
        });

        expect(result.bloodGlucoseTarget.low).to.equal(5.6);
        expect(result.bloodGlucoseTarget.high).to.equal(5.8);
      });

      it('should return a default value for glucoseSafetyLimit in mg/dL units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
          birthday,
        });

        expect(result.glucoseSafetyLimit).to.equal(75);
      });

      it('should return a default value for glucoseSafetyLimit in mmol/L units', () => {
        const result = prescriptionFormConstants.defaultValues(pump, MMOLL_UNITS, {
          birthday,
        });

        expect(result.glucoseSafetyLimit).to.equal(4.2);
      });
    });

    it('should return a default value for basalRate as provided by calculator', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
        calculator: {
          recommendedBasalRate: 0.2,
        },
      });

      expect(result.basalRate).to.equal(0.2);
    });

    it('should return undefined value for basalRate when not provided by calculator', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
        calculator: {
          recommendedBasalRate: undefined,
        },
      });

      expect(result.basalRate).to.be.undefined;
    });

    it('should return a default value for insulinSensitivity as provided by calculator', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
        calculator: {
          recommendedInsulinSensitivity: 200,
        },
      });

      expect(result.insulinSensitivity).to.equal(200);
    });

    it('should return a default value for carbohydrateRatio as provided by calculator', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
        calculator: {
          recommendedCarbohydrateRatio: 20,
        },
      });

      expect(result.carbohydrateRatio).to.equal(20);
    });

    it('should return a default value for bloodGlucoseTargetPhysicalActivity in mg/dL units', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS);

      expect(result.bloodGlucoseTargetPhysicalActivity.low).to.equal(150);
      expect(result.bloodGlucoseTargetPhysicalActivity.high).to.equal(170);
    });

    it('should return a default value for bloodGlucoseTargetPhysicalActivity in mmol/L units', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MMOLL_UNITS);

      expect(result.bloodGlucoseTargetPhysicalActivity.low).to.equal(8.3);
      expect(result.bloodGlucoseTargetPhysicalActivity.high).to.equal(9.4);
    });

    it('should return a default value for bloodGlucoseTargetPreprandial in mg/dL units', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS);

      expect(result.bloodGlucoseTargetPreprandial.low).to.equal(80);
      expect(result.bloodGlucoseTargetPreprandial.high).to.equal(100);
    });

    it('should return a default value for bloodGlucoseTargetPreprandial in mmol/L units', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MMOLL_UNITS);

      expect(result.bloodGlucoseTargetPreprandial.low).to.equal(4.4);
      expect(result.bloodGlucoseTargetPreprandial.high).to.equal(5.6);
    });
  });

  describe('calculateRecommendedTherapySettings', () => {
    context('total daily dose and tdd scale factor provided', () => {
      const values = {
        calculator: {
          totalDailyDose: 10,
          totalDailyDoseScaleFactor: 1,
        },
      };

      it('should provide a recommended basal rate', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings(values).recommendedBasalRate).to.equal(0.2);
      });

      it('should provide a recommended basal rate using a reduced daily dose scale factor', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings({
          calculator: {
            ...values.calculator,
            totalDailyDoseScaleFactor: 0.5,
          },
        }).recommendedBasalRate).to.equal(0.1);
      });

      it('should provide a recommended carb ratio', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings(values).recommendedCarbohydrateRatio).to.equal(45);
      });

      it('should provide a recommended insulin sensitivity in mg/dL by default', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings(values).recommendedInsulinSensitivity).to.equal(170);
      });

      it('should provide a recommended insulin sensitivity in mmol/L when provided bgUnits are mmol/L', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings({
          ...values,
          initialSettings: {
            bloodGlucoseUnits: MMOLL_UNITS,
          },
        }).recommendedInsulinSensitivity).to.equal(9.4);
      });
    });

    context('weight and weight units provided', () => {
      const values = {
        calculator: {
          weight: 30,
          weightUnits: 'kg',
        },
      };

      it('should provide a recommended basal rate', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings(values).recommendedBasalRate).to.equal(0.3);
      });

      it('should provide a recommended carb ratio', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings(values).recommendedCarbohydrateRatio).to.equal(30);
      });

      it('should provide a recommended insulin sensitivity in mg/dL by default', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings(values).recommendedInsulinSensitivity).to.equal(113);
      });

      it('should provide a recommended insulin sensitivity in mmol/L when provided bgUnits are mmol/L', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings({
          ...values,
          initialSettings: {
            bloodGlucoseUnits: MMOLL_UNITS,
          },
        }).recommendedInsulinSensitivity).to.equal(6.3);
      });

      it('should provide recommended values when weight units are lbs', () => {
        expect(prescriptionFormConstants.calculateRecommendedTherapySettings({
          calculator: {
            ...values.calculator,
            weightUnits: 'lbs',
          },
        })).to.eql({
          recommendedBasalRate: 0.15,
          recommendedCarbohydrateRatio: 66,
          recommendedInsulinSensitivity: 250,
        });
      });
    });

    context('total daily dose and weight provided', () => {
      it('should calculate using a derived total daily dose input averaged from the provided weight and tdd values', () => {
        const weight = 30;
        const totalDailyDose = 10;

        const expectedTDDInput = _.mean([
          totalDailyDose,
          weight / 2,
        ]);

        expect(expectedTDDInput).to.equal(12.5);

        const expectedBasalRate = utils.roundToNearest(expectedTDDInput / 2 / 24, 0.05);
        expect(expectedBasalRate).to.equal(0.25);

        const expectedCarbohydrateRatio = utils.roundToNearest(450 / expectedTDDInput, 1);
        expect(expectedCarbohydrateRatio).to.equal(36);

        const expectedInsulinSensitivity = utils.roundToNearest(1700 / expectedTDDInput, 1);
        expect(expectedInsulinSensitivity).to.equal(136);

        expect(prescriptionFormConstants.calculateRecommendedTherapySettings({
          calculator: {
            weight,
            weightUnits: 'kg',
            totalDailyDose,
            totalDailyDoseScaleFactor: 1,
          },
        })).to.eql({
          recommendedBasalRate: expectedBasalRate,
          recommendedCarbohydrateRatio: expectedCarbohydrateRatio,
          recommendedInsulinSensitivity: expectedInsulinSensitivity,
        });
      });
    });
  });

  describe('hasCalculatorResults', () => {
    const values = {
      calculator: {
        recommendedBasalRate: 0.5,
        recommendedInsulinSensitivity: 25,
        recommendedCarbohydrateRatio: 20,
      }
    };

    it('should return `true` if stored calculator field contains values for recommended basal rate, sensitivity factor, and carb ratio', () => {
      expect(prescriptionFormConstants.hasCalculatorResults(values)).to.be.true;
    });

    it('should return `false` if stored calculator field is missing values for recommended basal rate, sensitivity factor, or carb ratio', () => {
      expect(prescriptionFormConstants.hasCalculatorResults({ calculator: { ...values.calculator, recommendedBasalRate: undefined } })).to.be.false;
      expect(prescriptionFormConstants.hasCalculatorResults({ calculator: { ...values.calculator, recommendedInsulinSensitivity: undefined } })).to.be.false;
      expect(prescriptionFormConstants.hasCalculatorResults({ calculator: { ...values.calculator, recommendedCarbohydrateRatio: undefined } })).to.be.false;
    });
  });

  describe('shouldUpdateDefaultValue', () => {
    const initialValue = {
      initialValues: { field: { path: 30 } },
    };

    const noInitialValue = {
      initialValues: { field: { path: undefined } },
    };

    const touched = {
      touched: { field: { path: true } },
    };

    const notTouched = {
      touched: { field: { path: false } },
    };

    const hydratedValue = {
      hydratedValues: { field: { path: 20 } },
    };

    const noHydratedValue = {
      hydratedValues: { field: { path: undefined } },
    };

    const singleStepEdit = {
      isSingleStepEdit: true,
    };

    const prescriptionEditFlow = {
      isPrescriptionEditFlow: true,
    };

    context('new prescription flow', () => {
      it('should return `true` if field in hydrated localStorage values is non-finite and field is untouched', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          status: { ...noHydratedValue },
          ...notTouched,
        })).to.equal(true);
      });

      it('should return `false` if field in hydrated localStorage values is finite and field is untouched but is in single step edit mode', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          status: { ...noHydratedValue, ...singleStepEdit },
          ...notTouched,
        })).to.equal(false);
      });

      it('should return `false` if field in hydrated localStorage values is finite and field is untouched', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          status: { ...hydratedValue },
          ...notTouched,
        })).to.equal(false);
      });

      it('should return `false` if field in hydrated localStorage values is non-finite and field is touched', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          status: { ...noHydratedValue },
          ...touched,
        })).to.equal(false);
      });
    });

    context('edit prescription flow', () => {
      const prescriptionEditFlowContext = {
        status: {
          ...prescriptionEditFlow,
        },
      };

      const prescriptionEditFlowSingleStepContext = {
        status: {
          ...prescriptionEditFlow,
          ...singleStepEdit,
        },
      };

      it('should return `true` if field in initial values is non-finite and field is untouched', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          ...prescriptionEditFlowContext,
          ...noInitialValue,
          ...notTouched,
        })).to.equal(true);
      });

      it('should return `false` if field in initial values is non-finite and field is untouched but is in single step edit mode', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          ...prescriptionEditFlowSingleStepContext,
          ...noInitialValue,
          ...notTouched,
        })).to.equal(false);
      });

      it('should return `false` if field in initial values is finite and field is untouched', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          ...prescriptionEditFlowContext,
          ...initialValue,
          ...notTouched,
        })).to.equal(false);
      });

      it('should return `false` if field in initial values is non-finite and field is touched', () => {
        expect(prescriptionFormConstants.shouldUpdateDefaultValue('field.path', {
          ...prescriptionEditFlowContext,
          ...noInitialValue,
          ...touched,
        })).to.equal(false);
      });
    });
  });

  it('should export the list of the prescription account type options', function() {
    expect(prescriptionFormConstants.typeOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.typeOptions, 'value')).to.eql([
      'patient',
      'caregiver',
    ]);

    _.each(prescriptionFormConstants.typeOptions, device => {
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of the prescription patient sex options', function() {
    expect(prescriptionFormConstants.sexOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.sexOptions, 'value')).to.eql([
      'female',
      'male',
      'undisclosed',
    ]);

    _.each(prescriptionFormConstants.sexOptions, device => {
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of the prescription training options', function() {
    expect(prescriptionFormConstants.trainingOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.trainingOptions, 'value')).to.eql([
      'inPerson',
      'inModule',
    ]);

    _.each(prescriptionFormConstants.trainingOptions, device => {
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of the prescription insulin type options', function() {
    expect(prescriptionFormConstants.insulinModelOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.insulinModelOptions, 'value')).to.eql([
      'rapidAdult',
      'rapidChild',
    ]);

    _.each(prescriptionFormConstants.insulinModelOptions, device => {
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of the calculator method options', function() {
    expect(prescriptionFormConstants.calculatorMethodOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.calculatorMethodOptions, 'value')).to.eql([
      'totalDailyDose',
      'weight',
      'totalDailyDoseAndWeight',
    ]);

    _.each(prescriptionFormConstants.calculatorMethodOptions, device => {
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of the calculator tdd scale factor options', function() {
    expect(prescriptionFormConstants.totalDailyDoseScaleFactorOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.totalDailyDoseScaleFactorOptions, 'value')).to.eql([
      1,
      0.75,
    ]);

    _.each(prescriptionFormConstants.totalDailyDoseScaleFactorOptions, device => {
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of the calculator weight unit options', function() {
    expect(prescriptionFormConstants.weightUnitOptions).to.be.an('array');
    expect(_.map(prescriptionFormConstants.weightUnitOptions, 'value')).to.eql([
      'kg',
      'lbs',
    ]);

    _.each(prescriptionFormConstants.weightUnitOptions, device => {
      expect(device.label).to.be.a('string');
    })
  });

  it('should export the list of valid country codes', function() {
    expect(prescriptionFormConstants.validCountryCodes).to.be.an('array').and.to.eql([1]);
  });

  describe('getFormSteps', () => {
    let defaultValues;
    const goodValues = {
      // account fields
      accountType: 'goodField',
      firstName: 'goodField',
      lastName: 'goodField',
      caregiverFirstName: 'goodField',
      caregiverLastName: 'goodField',
      birthday: 'goodField',
      email: 'goodField',
      emailConfirm: 'goodField',

      // profile fields
      phoneNumber: {
        number: 'goodField',
      },
      mrn: 'goodField',
      sex: 'goodField',

      // calculator fields
      calculator: {
        method: 'goodField',
        totalDailyDose: 'goodField',
        totalDailyDoseScaleFactor: 'goodField',
        weight: 'goodField',
        weightUnits: 'goodField',
        recommendedBasalRate: 'goodField',
        recommendedInsulinSensitivity: 'goodField',
        recommendedCarbohydrateRatio: 'goodField',
      },

      // therapy settings fields
      training: 'goodField',
      initialSettings: {
        glucoseSafetyLimit: 'goodField',
        insulinModel: 'goodField',
        basalRateMaximum: { value: 'goodField' },
        bolusAmountMaximum: { value: 'goodField' },
        bloodGlucoseTargetSchedule: 'goodField',
        bloodGlucoseTargetPhysicalActivity: 'goodField',
        bloodGlucoseTargetPreprandial: 'goodField',
        basalRateSchedule: 'goodField',
        carbohydrateRatioSchedule: 'goodField',
        insulinSensitivitySchedule: 'goodField',
        cgmId: prescriptionFormConstants.deviceIdMap.dexcomG6,
        pumpId: prescriptionFormConstants.deviceIdMap.palmtree,
      },

      // review fields
      therapySettingsReviewed: 'goodField',
    };

    const defaultOptions = {
      skippedFields: [],
      isEditable: true,
      isPrescriber: true,
      initialFocusedInput: 'myInput',
      isSingleStepEdit: false,
      stepAsyncState: null,
    };

    const validateSyncAt = sinon.stub().callsFake((fieldKey, values) => {
      if (_.get(values, fieldKey) === 'badField') {
        throw('error');
      }
    });

    const schema = { validateSyncAt };
    const invalidateValue = fieldPath => {
      defaultValues = _.cloneDeep(goodValues);
      _.set(defaultValues, fieldPath, 'badField');
    }

    const handlers = {
      activeStepUpdate: sinon.stub(),
      clearCalculator: sinon.stub(),
    };

    const devices = {
      cgms: [{ id: prescriptionFormConstants.deviceIdMap.dexcomG6 }],
      pumps: [{ id: prescriptionFormConstants.deviceIdMap.palmtree }],
    };

    beforeEach(() => {
      defaultValues = _.cloneDeep(goodValues);
    });

    describe('account form steps', () => {
      const accountFormSteps = (values = defaultValues, options = defaultOptions) => _.find(prescriptionFormConstants.getFormSteps(schema, devices, values, handlers, options), { key: 'account' });

      it('should include the step label', () => {
        expect(accountFormSteps().label).to.equal('Create Patient Account');
      });

      it('should include the step subSteps with initialFocusedInput passed to 2nd substep', () => {
        const subSteps = accountFormSteps().subSteps;

        expect(subSteps).to.be.an('array').and.have.lengthOf(3);

        _.each(subSteps, (subStep, index) => {
          expect(subStep.panelContent.type).to.be.a('function');
          if (index === 1) expect(subStep.panelContent.props.initialFocusedInput).to.equal('myInput');
        });
      });

      it('should disable the complete button for any invalid fields within a subStep', () => {
        const subSteps = accountFormSteps().subSteps;
        expect(subSteps[0].disableComplete).to.be.false;
        expect(subSteps[1].disableComplete).to.be.false;
        expect(subSteps[2].disableComplete).to.be.false;

        expect(accountFormSteps(invalidateValue('accountType')).subSteps[0].disableComplete).to.be.true;
        expect(accountFormSteps(invalidateValue('firstName')).subSteps[1].disableComplete).to.be.true;
        expect(accountFormSteps(invalidateValue('lastName')).subSteps[1].disableComplete).to.be.true;
        expect(accountFormSteps(invalidateValue('birthday')).subSteps[1].disableComplete).to.be.true;
        expect(accountFormSteps(invalidateValue('caregiverFirstName')).subSteps[2].disableComplete).to.be.true;
        expect(accountFormSteps(invalidateValue('caregiverLastName')).subSteps[2].disableComplete).to.be.true;
        expect(accountFormSteps(invalidateValue('email')).subSteps[2].disableComplete).to.be.true;
        expect(accountFormSteps(invalidateValue('emailConfirm')).subSteps[2].disableComplete).to.be.true;
      });

      it('should hide the back button for the first subStep', () => {
        expect(accountFormSteps().subSteps[0].hideBack).to.be.true;
        expect(accountFormSteps().subSteps[1].hideBack).to.be.undefined;
        expect(accountFormSteps().subSteps[2].hideBack).to.be.undefined;
      });
    });

    describe('profile form steps', () => {
      const profileFormSteps = (values = defaultValues, options = defaultOptions) => _.find(prescriptionFormConstants.getFormSteps(schema, devices, values, handlers, options), { key: 'profile' });

      it('should include the step label', () => {
        expect(profileFormSteps().label).to.equal('Complete Patient Profile');
      });

      it('should include the step subSteps with devices passed to 4th substep', () => {
        const subSteps = profileFormSteps().subSteps;

        expect(subSteps).to.be.an('array').and.have.lengthOf(4);

        _.each(subSteps, (subStep, index) => {
          expect(subStep.panelContent.type).to.be.a('function');
          if (index === 3) expect(subStep.panelContent.props.devices).to.eql(devices);
        });
      });

      it('should disable the complete button for any invalid fields within a subStep', () => {
        const subSteps = profileFormSteps().subSteps;
        expect(subSteps[0].disableComplete).to.be.false;
        expect(subSteps[1].disableComplete).to.be.false;
        expect(subSteps[2].disableComplete).to.be.false;
        expect(subSteps[3].disableComplete).to.be.false;

        expect(profileFormSteps(invalidateValue('phoneNumber.number')).subSteps[0].disableComplete).to.be.true;
        expect(profileFormSteps(invalidateValue('mrn')).subSteps[1].disableComplete).to.be.true;
        expect(profileFormSteps(invalidateValue('sex')).subSteps[2].disableComplete).to.be.true;
        expect(profileFormSteps(invalidateValue('initialSettings.pumpId')).subSteps[3].disableComplete).to.be.true;
        expect(profileFormSteps(invalidateValue('initialSettings.cgmId')).subSteps[3].disableComplete).to.be.true;
      });

      it('should not hide the back button for the any subSteps', () => {
        expect(profileFormSteps().subSteps[0].hideBack).to.be.undefined;
        expect(profileFormSteps().subSteps[1].hideBack).to.be.undefined;
        expect(profileFormSteps().subSteps[2].hideBack).to.be.undefined;
        expect(profileFormSteps().subSteps[3].hideBack).to.be.undefined;
      });
    });

    describe('settings calculator form steps', () => {
      const settingsCalculatorFormSteps = (values = defaultValues, options = defaultOptions) => _.find(prescriptionFormConstants.getFormSteps(schema, devices, values, handlers, options), { key: 'calculator' });

      it('should include the step label', () => {
        expect(settingsCalculatorFormSteps().label).to.equal('Therapy Settings Calculator');
      });

      it('should set the onSkip handler', () => {
        expect(settingsCalculatorFormSteps().onSkip).to.equal(handlers.clearCalculator);
      });

      it('should include the step subSteps', () => {
        const subSteps = settingsCalculatorFormSteps().subSteps;
        expect(subSteps).to.be.an('array').and.have.lengthOf(2);
      });

      it('should disable the complete button for any invalid fields within a subStep', () => {
        const subSteps = settingsCalculatorFormSteps().subSteps;
        expect(subSteps[0].disableComplete).to.be.false;
        expect(subSteps[1].disableComplete).to.be.false;

        expect(settingsCalculatorFormSteps(invalidateValue('calculator.method')).subSteps[0].disableComplete).to.be.true;
        expect(settingsCalculatorFormSteps(invalidateValue('calculator.totalDailyDose')).subSteps[1].disableComplete).to.be.true;
        expect(settingsCalculatorFormSteps(invalidateValue('calculator.totalDailyDoseScaleFactor')).subSteps[1].disableComplete).to.be.true;
        expect(settingsCalculatorFormSteps(invalidateValue('calculator.weight')).subSteps[1].disableComplete).to.be.true;
        expect(settingsCalculatorFormSteps(invalidateValue('calculator.weightUnits')).subSteps[1].disableComplete).to.be.true;
        expect(settingsCalculatorFormSteps(invalidateValue('calculator.recommendedBasalRate')).subSteps[1].disableComplete).to.be.true;
        expect(settingsCalculatorFormSteps(invalidateValue('calculator.recommendedInsulinSensitivity')).subSteps[1].disableComplete).to.be.true;
        expect(settingsCalculatorFormSteps(invalidateValue('calculator.recommendedCarbohydrateRatio')).subSteps[1].disableComplete).to.be.true;
      });

      it('should not hide the back button for the any subSteps', () => {
        expect(settingsCalculatorFormSteps().subSteps[0].hideBack).to.be.undefined;
        expect(settingsCalculatorFormSteps().subSteps[1].hideBack).to.be.undefined;
      });
    });

    describe('therapy settings form step', () => {
      const therapySettingsFormStep = (values = defaultValues, options = defaultOptions) => _.find(prescriptionFormConstants.getFormSteps(schema, devices, values, handlers, options), { key: 'therapySettings' });

      it('should include the step label', () => {
        expect(therapySettingsFormStep().label).to.equal('Enter Therapy Settings');
      });

      it('should include panel content with pump passed along', () => {
        const subSteps = therapySettingsFormStep().subSteps;

        expect(subSteps).to.be.an('array').and.have.lengthOf(1);
        expect(subSteps[0].panelContent.type).to.be.a('function');
        expect(subSteps[0].panelContent.props.pump).to.eql(devices.pumps[0]);
      });

      it('should disable the complete button for any invalid fields', () => {
        expect(therapySettingsFormStep().subSteps[0].disableComplete).to.be.false;
        expect(therapySettingsFormStep(invalidateValue('training')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.glucoseSafetyLimit')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.insulinModel')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.basalRateMaximum.value')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.bolusAmountMaximum.value')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetSchedule')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPhysicalActivity')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPreprandial')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.basalRateSchedule')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.carbohydrateRatioSchedule')).subSteps[0].disableComplete).to.be.true;
        expect(therapySettingsFormStep(invalidateValue('initialSettings.insulinSensitivitySchedule')).subSteps[0].disableComplete).to.be.true;
      });

      it('should not hide the back button', () => {
        expect(therapySettingsFormStep().subSteps[0].hideBack).to.be.undefined;
      });
    });

    describe('review form step', () => {
      const reviewFormStep = (values = defaultValues, options = defaultOptions) => _.find(prescriptionFormConstants.getFormSteps(schema, devices, values, handlers, options), { key: 'review' });

      afterEach(() => {
        handlers.activeStepUpdate.resetHistory();
      });

      it('should include the step label for a clinician with prescriber permissions', () => {
        expect(reviewFormStep().label).to.equal('Review and Send Tidepool Loop Start Order');
      });

      it('should include the step label for a clinician without prescriber permissions', () => {
        expect(reviewFormStep(defaultValues, { ...defaultOptions, isPrescriber: false }).label).to.equal('Review and Save Tidepool Loop Start Order');
      });

      it('should include the custom next button text for a clinician with prescriber permissions', () => {
        expect(reviewFormStep().subSteps[0].completeText).to.equal('Send Final Tidepool Loop Start Order');
      });

      it('should include the custom next button text for a clinician without prescriber permissions', () => {
        expect(reviewFormStep(defaultValues, { ...defaultOptions, isPrescriber: false }).subSteps[0].completeText).to.equal('Save Pending Tidepool Loop Start Order');
      });

      it('should include panel content with devices and handlers passed along as props', () => {
        const subSteps = reviewFormStep().subSteps;

        expect(subSteps).to.be.an('array').and.have.lengthOf(1);
        expect(subSteps[0].panelContent.type).to.be.a('function');
        expect(subSteps[0].panelContent.props.devices).to.eql(devices);
        expect(subSteps[0].panelContent.props.handlers).to.eql(handlers);
      });

      it('should disable the complete button if the any of the prescriptions fields are invalid', () => {
        expect(reviewFormStep().subSteps[0].disableComplete).to.be.false;
        expect(reviewFormStep(invalidateValue('accountType')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('firstName')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('lastName')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('birthday')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('caregiverFirstName')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('caregiverLastName')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('email')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('emailConfirm')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('phoneNumber.number')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('mrn')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('sex')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.method')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.totalDailyDose')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.totalDailyDoseScaleFactor')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.weight')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.weightUnits')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.recommendedBasalRate')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.recommendedInsulinSensitivity')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('calculator.recommendedCarbohydrateRatio')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('training')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.pumpId')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.cgmId')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.glucoseSafetyLimit')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.insulinModel')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.basalRateMaximum.value')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.bolusAmountMaximum.value')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.bloodGlucoseTargetSchedule')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPhysicalActivity')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.bloodGlucoseTargetPreprandial')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.basalRateSchedule')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.carbohydrateRatioSchedule')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('initialSettings.insulinSensitivitySchedule')).subSteps[0].disableComplete).to.be.true;
        expect(reviewFormStep(invalidateValue('therapySettingsReviewed')).subSteps[0].disableComplete).to.be.true;
      });

      it('should not hide the back button', () => {
        expect(reviewFormStep().subSteps[0].hideBack).to.be.undefined;
      });
    });

    it('should skip the fields listed in `skippedFields` option', () => {
      const skippedFields =[
        'calculator',
        'mrn',
        'phoneNumber',
        'training',
      ];

      const formSteps = prescriptionFormConstants.getFormSteps(schema, devices, defaultValues, handlers, { ...defaultOptions, skippedFields })

      // nothing excluded from account step
      expect(formSteps).to.have.lengthOf(4);
      expect(formSteps[0].label).to.equal('Create Patient Account');
      expect(formSteps[0].subSteps).to.have.lengthOf(3)

      // 2 substeps excluded from profile step
      expect(formSteps[1].label).to.equal('Complete Patient Profile');
      expect(formSteps[1].subSteps).to.have.lengthOf(2)

      // substeps containing phone number and mrn are excluded
      expect(formSteps[1].subSteps[0].fields).to.eql(['sex']);
      expect(formSteps[1].subSteps[1].fields).to.eql(['initialSettings.pumpId', 'initialSettings.cgmId']);

      // 3rd step is normally calculator, but is therapy settings instead
      expect(formSteps[2].label).to.equal('Enter Therapy Settings');
      expect(formSteps[2].subSteps).to.have.lengthOf(1)

      // training field is excluded
      expect(formSteps[2].subSteps[0].fields).to.eql([
        'initialSettings.glucoseSafetyLimit',
        'initialSettings.insulinModel',
        'initialSettings.basalRateMaximum.value',
        'initialSettings.bolusAmountMaximum.value',
        'initialSettings.bloodGlucoseTargetSchedule',
        'initialSettings.bloodGlucoseTargetPhysicalActivity',
        'initialSettings.bloodGlucoseTargetPreprandial',
        'initialSettings.basalRateSchedule',
        'initialSettings.carbohydrateRatioSchedule',
        'initialSettings.insulinSensitivitySchedule',
      ]);
    });
  });
});
