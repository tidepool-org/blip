import _ from 'lodash';
import moment from 'moment';
import * as prescriptionFormConstants from '../../../../app/pages/prescription/prescriptionFormConstants';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../../app/core/constants';

/* global chai */
/* global context */
/* global describe */
/* global it */

const expect = chai.expect;

const devices = {
  cgms: [{ id: prescriptionFormConstants.deviceIdMap.dexcomG6 }],
  pumps: [{ id: prescriptionFormConstants.deviceIdMap.omnipodHorizon }],
};

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

  it('should export a device-id map with known device IDs', () => {
    expect(prescriptionFormConstants.deviceIdMap).to.eql({
      dexcomG6: 'd25c3f1b-a2e8-44e2-b3a3-fd07806fc245',
      omnipodHorizon: '6678c377-928c-49b3-84c1-19e2dafaff8d',
    });
  });

  it('should export a list of valid cgms and pumps', () => {
    expect(prescriptionFormConstants.validDeviceIds).to.be.an('object').with.keys([
      'cgms',
      'pumps',
    ]);
    expect(prescriptionFormConstants.validDeviceIds.cgms).to.be.an('array').and.contain(prescriptionFormConstants.deviceIdMap.dexcomG6);
    expect(prescriptionFormConstants.validDeviceIds.pumps).to.be.an('array').and.contain(prescriptionFormConstants.deviceIdMap.omnipodHorizon);
  });

  it('should export a JSX element for extra info about each device', () => {
    expect(prescriptionFormConstants.deviceExtraInfo).to.be.an('object').and.have.keys([
      prescriptionFormConstants.deviceIdMap.dexcomG6,
      prescriptionFormConstants.deviceIdMap.omnipodHorizon,
    ]);
    _.each(prescriptionFormConstants.deviceExtraInfo, info => {
      expect(info).to.be.an('object');
      expect(info.props).to.be.an('object').and.have.keys(['children']);
    });
  });

  it('should export the list of the pump device options', function() {
    const pumpDeviceOptions = prescriptionFormConstants.pumpDeviceOptions(devices);
    expect(pumpDeviceOptions).to.be.an('array');
    expect(_.map(pumpDeviceOptions, 'value')).to.eql([
      prescriptionFormConstants.deviceIdMap.omnipodHorizon,
    ]);

    _.each(pumpDeviceOptions, device => {
      expect(device.value).to.be.a('string');
      expect(device.label).to.be.a('string');
      expect(device.extraInfo).to.be.an('object');
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
      expect(device.extraInfo).to.be.an('object');
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
      },
    };

    it('should return the pump guard rail at a given path as a float', () => {
      expect(prescriptionFormConstants.getPumpGuardrail(pump, 'guardRail1')).to.equal(0.9);
      expect(prescriptionFormConstants.getPumpGuardrail(pump, 'guardRail2.nested')).to.equal(8.012);
    });

    it('should fall back to provided value if guard rail cannot be provided from path', () => {
      expect(prescriptionFormConstants.getPumpGuardrail(pump, 'guardRail3', 'foo')).to.equal('foo');
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

  describe('roundValueToIncrement', () => {
    it('should round provided value to specified increment', () => {
      expect(prescriptionFormConstants.roundValueToIncrement(1.355, .01)).to.equal(1.36);
      expect(prescriptionFormConstants.roundValueToIncrement(1.355, .1)).to.equal(1.4);
      expect(prescriptionFormConstants.roundValueToIncrement(1.355, 1)).to.equal(1);
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
        guardRails: {
          basalRates: { absoluteBounds: {
            minimum: { units: 1, nanos: 0 },
            maximum: { units: 11, nanos: 0 },
            increment: { units: 1, nanos: 0 },
          } },
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
        basalRate: { min: 1, max: 11, increment: 1 },
        basalRateMaximum: { min: 2, max: 12, increment: 2 },
        bloodGlucoseTarget: { min: 3, max: 13, increment: 3 },
        bolusAmountMaximum: { min: 4, max: 14, increment: 4 },
        carbRatio: { min: 5, max: 15, increment: 5, inputStep: 1 },
        insulinSensitivityFactor: { min: 6, max: 16, increment: 6 },
        bloodGlucoseTargetPreprandial: { min: 9, max: 17, increment: 7 }, // Uses the glucoseSafetyLimit min since it's higher
        bloodGlucoseTargetPhysicalActivity: { min: 8, max: 18, increment: 8 },
        glucoseSafetyLimit: { min: 9, max: 19, increment: 9 },
      });
    });

    it('should export the default ranges with mg/dL as default bg unit if pump is not provided', () => {
      expect(prescriptionFormConstants.pumpRanges()).to.eql({
        basalRate: { min: 0.05, max: 30, increment: 0.05 },
        basalRateMaximum: { min: 0, max: 30, increment: 0.05 },
        bloodGlucoseTarget: { min: 87, max: 180, increment: 1 },
        bolusAmountMaximum: { min: 0.05, max: 30, increment: 0.05 },
        carbRatio: { min: 2, max: 150, increment: 0.01, inputStep: 1 },
        insulinSensitivityFactor: { min: 10, max: 500, increment: 1 },
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
          }).basalRateMaximum.min).to.equal(0);

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
        it('should return a default value of 3.5x the max basal rate for basalRateMaximum', () => {
          const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
            birthday,
            initialSettings: { basalRateSchedule: [
              { rate: 0.05 },
              { rate: 0.15 },
              { rate: 0.1 },
            ] },
          });

          expect(result.basalRateMaximum).to.equal(0.53);
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

    it('should return a default value for basalRate when not provided by calculator', () => {
      const result = prescriptionFormConstants.defaultValues(pump, MGDL_UNITS, {
        calculator: {
          recommendedBasalRate: undefined,
        },
      });

      expect(result.basalRate).to.equal(0.05);
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

        const expectedBasalRate = prescriptionFormConstants.roundValueToIncrement(expectedTDDInput / 2 / 24, 0.05);
        expect(expectedBasalRate).to.equal(0.25);

        const expectedCarbohydrateRatio = prescriptionFormConstants.roundValueToIncrement(450 / expectedTDDInput, 1);
        expect(expectedCarbohydrateRatio).to.equal(36);

        const expectedInsulinSensitivity = prescriptionFormConstants.roundValueToIncrement(1700 / expectedTDDInput, 1);
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
});
