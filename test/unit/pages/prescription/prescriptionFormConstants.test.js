import _ from 'lodash';
import * as prescriptionFormConstants from '../../../../app/pages/prescription/prescriptionFormConstants';
import { MGDL_UNITS } from '../../../../app/core/constants';

/* global chai */
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

  it('should export the list pump device options', function() {
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

  it('should export the list cgm device options', function() {
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
      bolusAmount: 'Units',
      insulinCarbRatio: 'g/U',
      bloodGlucose: 'mg/dL',
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

    it('should export the pump-specific warning thresholds with mg/dL as default bg unit if pump is provided', () => {
      const pump = {
        guardRails: {
          correctionRange: { recommendedBounds: {
            minimum: { units: 10, nanos: 0 },
            maximum: { units: 100, nanos: 0 },
          } },
          bolusAmountMaximum: { recommendedBounds: {
            minimum: { units: 20, nanos: 0 },
            maximum: { units: 200, nanos: 0 },
          } },
          carbohydrateRatio: { recommendedBounds: {
            minimum: { units: 30, nanos: 0 },
            maximum: { units: 300, nanos: 0 },
          } },
          insulinSensitivity: { recommendedBounds: {
            minimum: { units: 40, nanos: 0 },
            maximum: { units: 400, nanos: 0 },
          } },
          suspendThreshold: { recommendedBounds: {
            minimum: { units: 50, nanos: 0 },
            maximum: { units: 500, nanos: 0 },
          } },
        },
      };

      expect(prescriptionFormConstants.warningThresholds(pump, null, meta)).to.eql({
        basalRateMaximum: {
          high: { value: maxBasal * 6 + 0.01, message: basalRateMaximumWarning },
        },
        bloodGlucoseTarget: {
          low: { value: 10, message: lowWarning },
          high: { value: 100, message: highWarning },
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
        suspendThreshold: {
          low: { value: 50, message: lowWarning },
          high: { value: 500, message: highWarning },
        },
      });
    });

    it('should export the default warning thresholds with mg/dL as default bg unit if pump is not provided', () => {
      expect(prescriptionFormConstants.warningThresholds(undefined, null, meta)).to.eql({
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
        suspendThreshold: {
          low: { value: 70, message: lowWarning },
          high: { value: 120, message: highWarning },
        },
      });
    });

    it('should export the default warning thresholds with mmoll/L as provided by bgUnits arg if pump is not provided', () => {
      const thresholds = prescriptionFormConstants.warningThresholds(undefined, 'mmol/L', meta);

      expect(thresholds.bloodGlucoseTarget.low.value).to.equal(3.9);
      expect(thresholds.bloodGlucoseTarget.high.value).to.equal(6.7);

      expect(thresholds.insulinSensitivityFactor.low.value).to.equal(0.8);
      expect(thresholds.insulinSensitivityFactor.high.value).to.equal(22.2);

      expect(thresholds.suspendThreshold.low.value).to.equal(3.9);
      expect(thresholds.suspendThreshold.high.value).to.equal(6.7);
    });
  });

  describe('pumpRanges', () => {
    it('should export the pump-specific ranges with mg/dL as default bg unit if pump is provided', () => {
      const pump = {
        guardRails: {
          basalRates: { absoluteBounds: {
            minimum: { units: 10, nanos: 0 },
            maximum: { units: 100, nanos: 0 },
            increment: { units: 1, nanos: 0 },
          } },
          basalRateMaximum: { absoluteBounds: {
            minimum: { units: 20, nanos: 0 },
            maximum: { units: 200, nanos: 0 },
            increment: { units: 2, nanos: 0 },
          } },
          correctionRange: { absoluteBounds: {
            minimum: { units: 30, nanos: 0 },
            maximum: { units: 300, nanos: 0 },
            increment: { units: 3, nanos: 0 },
          } },
          bolusAmountMaximum: { absoluteBounds: {
            minimum: { units: 40, nanos: 0 },
            maximum: { units: 400, nanos: 0 },
            increment: { units: 4, nanos: 0 },
          } },
          carbohydrateRatio: { absoluteBounds: {
            minimum: { units: 50, nanos: 0 },
            maximum: { units: 500, nanos: 0 },
            increment: { units: 5, nanos: 0 },
          } },
          insulinSensitivity: { absoluteBounds: {
            minimum: { units: 60, nanos: 0 },
            maximum: { units: 600, nanos: 0 },
            increment: { units: 6, nanos: 0 },
          } },
          suspendThreshold: { absoluteBounds: {
            minimum: { units: 70, nanos: 0 },
            maximum: { units: 700, nanos: 0 },
            increment: { units: 7, nanos: 0 },
          } },
        },
      };

      expect(prescriptionFormConstants.pumpRanges(pump)).to.eql({
        basalRate: { min: 10, max: 100, step: 1 },
        basalRateMaximum: { min: 20, max: 200, step: 2 },
        bloodGlucoseTarget: { min: 30, max: 300, step: 3 },
        bolusAmountMaximum: { min: 40, max: 400, step: 4 },
        carbRatio: { min: 50, max: 500, step: 5 },
        insulinSensitivityFactor: { min: 60, max: 600, step: 6 },
        suspendThreshold: { min: 70, max: 700, step: 7 },
      });
    });

    it('should export the default ranges with mg/dL as default bg unit if pump is not provided', () => {
      expect(prescriptionFormConstants.pumpRanges()).to.eql({
        basalRate: { min: 0, max: 35, step: 0.05 },
        basalRateMaximum: { min: 0, max: 35, step: 0.25 },
        bloodGlucoseTarget: { min: 60, max: 180, step: 1 },
        bolusAmountMaximum: { min: 0, max: 30, step: 1 },
        carbRatio: { min: 1, max: 150, step: 1 },
        insulinSensitivityFactor: { min: 10, max: 500, step: 1 },
        suspendThreshold: { min: 54, max: 180, step: 1 },
      });
    });

    it('should set the min bloodGlucoseTarget value to the set value of the suspendThreshold field', () => {
      const meta = {
        initialSettings: {
          suspendThreshold: {
            value: {
              value: 78,
            },
          },
        },
      };

      expect(prescriptionFormConstants.pumpRanges(undefined, MGDL_UNITS, meta).bloodGlucoseTarget.min).to.equal(78);
    });

    it('should export the default ranges with mmoll/L as provided by bgUnits arg if pump is not provided', () => {
      const ranges = prescriptionFormConstants.pumpRanges(undefined, 'mmol/L');

      expect(ranges.bloodGlucoseTarget.min).to.equal(3.3);
      expect(ranges.bloodGlucoseTarget.max).to.equal(10);
      expect(ranges.bloodGlucoseTarget.step).to.equal(0.1);

      expect(ranges.insulinSensitivityFactor.min).to.equal(0.6);
      expect(ranges.insulinSensitivityFactor.max).to.equal(27.8);
      expect(ranges.insulinSensitivityFactor.step).to.equal(0.1);

      expect(ranges.suspendThreshold.min).to.equal(3);
      expect(ranges.suspendThreshold.max).to.equal(10);
      expect(ranges.suspendThreshold.step).to.equal(0.1);
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
