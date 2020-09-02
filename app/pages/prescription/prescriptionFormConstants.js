import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'rebass/styled-components';
import isNumber from 'lodash/isNumber';
import get from 'lodash/get';
import map from 'lodash/map';
import max from 'lodash/max';
import filter from 'lodash/filter';
import includes from 'lodash/includes';

import i18next from '../../core/language';
import { MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';
import utils from '../../core/utils';
import { getFloatFromUnitsAndNanos } from '../../core/data';

const t = i18next.t.bind(i18next);

export const dateFormat = 'YYYY-MM-DD';
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export const revisionStates = ['draft', 'pending', 'submitted'];

export const deviceIdMap = {
  dexcomG6: 'd25c3f1b-a2e8-44e2-b3a3-fd07806fc245',
  omnipodHorizon: '6678c377-928c-49b3-84c1-19e2dafaff8d',
};

export const validDeviceIds = {
  cgms: [
    deviceIdMap.dexcomG6,
  ],
  pumps: [
    deviceIdMap.omnipodHorizon,
  ],
};

export const deviceExtraInfo = {
  [deviceIdMap.dexcomG6]: (
    <Trans>
      Find information on how to prescribe Dexcom G6 sensors and transmitters and more <Link href="#">here</Link>.
    </Trans>
  ),
  [deviceIdMap.omnipodHorizon]: (
    <Trans>
      Find information on how to prescribe Omnipod products <Link href="#">here</Link>.
    </Trans>
  ),
};

export const pumpDeviceOptions = ({ pumps } = {}) => map(
  filter(pumps, pump => includes(validDeviceIds.pumps, pump.id)),
  pump => ({
    value: pump.id,
    label: t('{{displayName}}', { displayName: pump.displayName }),
    extraInfo: deviceExtraInfo[pump.id] || null,
  }),
);

export const cgmDeviceOptions = ({ cgms } = {}) => map(
  filter(cgms, cgm => includes(validDeviceIds.cgms, cgm.id)),
  cgm => ({
    value: cgm.id,
    label: t('{{displayName}}', { displayName: cgm.displayName }),
    extraInfo: deviceExtraInfo[cgm.id] || null,
  }),
);

export const defaultUnits = {
  basalRate: 'Units/hour',
  bolusAmount: 'Units',
  insulinCarbRatio: 'g/U',
  bloodGlucose: MGDL_UNITS,
};

export const getPumpGuardrail = (pump, path, fallbackValue) => getFloatFromUnitsAndNanos(get(pump, `guardRails.${path}`)) || fallbackValue;

export const pumpRanges = (pump, bgUnits = defaultUnits.bloodGlucose, meta) => {
  const suspendThreshold = get(meta, 'initialSettings.suspendThreshold.value.value');
  let minBloodGlucoseTarget = getPumpGuardrail(pump, 'correctionRange.absoluteBounds.minimum', 60);

  if (isNumber(suspendThreshold)) minBloodGlucoseTarget = (bgUnits === MGDL_UNITS)
    ? suspendThreshold
    : utils.roundBgTarget(utils.translateBg(suspendThreshold, MGDL_UNITS), MGDL_UNITS);

  const ranges = {
    basalRate: {
      min: getPumpGuardrail(pump, 'basalRates.absoluteBounds.minimum', 0),
      max: getPumpGuardrail(pump, 'basalRates.absoluteBounds.maximum', 35),
      step: getPumpGuardrail(pump, 'basalRates.absoluteBounds.increment', 0.05),
    }, // will need to enforce step in case user types in invalid value
    basalRateMaximum: {
      min: getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.minimum', 0),
      max: getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.maximum', 35),
      step: getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.increment', 0.25),
    },
    bloodGlucoseTarget: {
      min: minBloodGlucoseTarget,
      max: getPumpGuardrail(pump, 'correctionRange.absoluteBounds.maximum', 180),
      step: getPumpGuardrail(pump, 'correctionRange.absoluteBounds.increment', 1),
    },
    bolusAmountMaximum: {
      min: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.minimum', 0),
      max: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.maximum', 30),
      step: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.increment', 1),
    },
    carbRatio: {
      min: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.minimum', 1),
      max: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.maximum', 150),
      step: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.increment', 1),
    },
    insulinSensitivityFactor: {
      min: getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.minimum', 10),
      max: getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.maximum', 500),
      step: getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.increment', 1),
    },
    suspendThreshold: {
      min: getPumpGuardrail(pump, 'suspendThreshold.absoluteBounds.minimum', 54),
      max: getPumpGuardrail(pump, 'suspendThreshold.absoluteBounds.maximum', 180),
      step: getPumpGuardrail(pump, 'suspendThreshold.absoluteBounds.increment', 1),
    },
  };

  if (bgUnits === MMOLL_UNITS) {
    ranges.bloodGlucoseTarget.min = utils.roundBgTarget(utils.translateBg(ranges.bloodGlucoseTarget.min, MMOLL_UNITS), MMOLL_UNITS);
    ranges.bloodGlucoseTarget.max = utils.roundBgTarget(utils.translateBg(ranges.bloodGlucoseTarget.max, MMOLL_UNITS), MMOLL_UNITS);
    ranges.bloodGlucoseTarget.step = 0.1;

    ranges.insulinSensitivityFactor.min = utils.roundBgTarget(utils.translateBg(ranges.insulinSensitivityFactor.min, MMOLL_UNITS), MMOLL_UNITS);
    ranges.insulinSensitivityFactor.max = utils.roundBgTarget(utils.translateBg(ranges.insulinSensitivityFactor.max, MMOLL_UNITS), MMOLL_UNITS);
    ranges.insulinSensitivityFactor.step = 0.1;

    ranges.suspendThreshold.min = utils.roundBgTarget(utils.translateBg(ranges.suspendThreshold.min, MMOLL_UNITS), MMOLL_UNITS);
    ranges.suspendThreshold.max = utils.roundBgTarget(utils.translateBg(ranges.suspendThreshold.max, MMOLL_UNITS), MMOLL_UNITS);
    ranges.suspendThreshold.step = 0.1;
  }

  return ranges;
};

export const warningThresholds = (pump, bgUnits = defaultUnits.bloodGlucose, meta) => {
  const lowWarning = t('The value you have entered is lower than Tidepool typically recommends for most people.');
  const highWarning = t('The value you have entered is higher than Tidepool typically recommends for most people.');

  const maxBasalRate = max(map(meta.initialSettings.basalRateSchedule.value, 'rate'));
  const basalRateMaximumWarning = t('Tidepool recommends that your maximum basal rate does not exceed 6 times your highest scheduled basal rate of {{value}} U/hr.', {
    value: maxBasalRate,
  });

  const thresholds = {
    basalRateMaximum: {
      high: { value: maxBasalRate * 6 + 0.01, message: basalRateMaximumWarning }
    },
    bloodGlucoseTarget: {
      low: {
        value: getPumpGuardrail(pump, 'correctionRange.recommendedBounds.minimum', 70),
        message: lowWarning,
      },
      high: {
        value: getPumpGuardrail(pump, 'correctionRange.recommendedBounds.maximum', 120),
        message: highWarning,
      },
    },
    bolusAmountMaximum: {
      low: {
        value: getPumpGuardrail(pump, 'bolusAmountMaximum.recommendedBounds.minimum', 0),
        message: lowWarning,
      },
      high: {
        value: getPumpGuardrail(pump, 'bolusAmountMaximum.recommendedBounds.maximum', 20),
        message: highWarning,
      },
    },
    carbRatio: {
      low: {
        value: getPumpGuardrail(pump, 'carbohydrateRatio.recommendedBounds.minimum', 3),
        message: lowWarning,
      },
      high: {
        value: getPumpGuardrail(pump, 'carbohydrateRatio.recommendedBounds.maximum', 28),
        message: highWarning,
      },
    },
    insulinSensitivityFactor: {
      low: {
        value: getPumpGuardrail(pump, 'insulinSensitivity.recommendedBounds.minimum', 15),
        message: lowWarning,
      },
      high: {
        value: getPumpGuardrail(pump, 'insulinSensitivity.recommendedBounds.maximum', 400),
        message: highWarning,
      },
    },
    suspendThreshold: {
      low: {
        value: getPumpGuardrail(pump, 'suspendThreshold.recommendedBounds.minimum', 70),
        message: lowWarning,
      },
      high: {
        value: getPumpGuardrail(pump, 'suspendThreshold.recommendedBounds.maximum', 120),
        message: highWarning,
      },
    },
  };

  if (bgUnits === MMOLL_UNITS) {
    thresholds.bloodGlucoseTarget.low.value = utils.roundBgTarget(utils.translateBg(thresholds.bloodGlucoseTarget.low.value, MMOLL_UNITS), MMOLL_UNITS);
    thresholds.bloodGlucoseTarget.high.value = utils.roundBgTarget(utils.translateBg(thresholds.bloodGlucoseTarget.high.value, MMOLL_UNITS), MMOLL_UNITS);

    thresholds.insulinSensitivityFactor.low.value = utils.roundBgTarget(utils.translateBg(thresholds.insulinSensitivityFactor.low.value, MMOLL_UNITS), MMOLL_UNITS);
    thresholds.insulinSensitivityFactor.high.value = utils.roundBgTarget(utils.translateBg(thresholds.insulinSensitivityFactor.high.value, MMOLL_UNITS), MMOLL_UNITS);

    thresholds.suspendThreshold.low.value = utils.roundBgTarget(utils.translateBg(thresholds.suspendThreshold.low.value, MMOLL_UNITS), MMOLL_UNITS);
    thresholds.suspendThreshold.high.value = utils.roundBgTarget(utils.translateBg(thresholds.suspendThreshold.high.value, MMOLL_UNITS), MMOLL_UNITS);
  }

  return thresholds;
};

export const typeOptions = [
  { value: 'patient', label: t('Patient') },
  { value: 'caregiver', label: t('Patient and caregiver') },
];

export const sexOptions = [
  { value: 'female', label: t('Female') },
  { value: 'male', label: t('Male') },
  { value: 'undisclosed', label: t('Prefer not to specify') },
];

export const trainingOptions = [
  { value: 'inPerson', label: t('Yes, Patient requires in-person CPT training') },
  { value: 'inModule', label: t('No, Patient can self start with Tidepool Loop in-app tutorial') },
];

// export const insulinModelOptions = [
//   { value: 'rapidAdult', label: t('Rapid Acting Adult') },
//   { value: 'rapidChild', label: t('Rapid Acting Child') },
// ];

export const validCountryCodes = [1];

export const stepValidationFields = [
  [
    ['type'],
    ['firstName', 'lastName', 'birthday'],
    ['email', 'emailConfirm'],
  ],
  [
    ['phoneNumber.number'],
    ['mrn'],
    ['sex'],
    ['initialSettings.pumpId', 'initialSettings.cgmId'],
  ],
  [
    [
      'training',
      'initialSettings.suspendThreshold.value',
      // 'initialSettings.insulinModel',
      'initialSettings.basalRateMaximum.value',
      'initialSettings.bolusAmountMaximum.value',
      'initialSettings.bloodGlucoseTargetSchedule',
      'initialSettings.basalRateSchedule',
      'initialSettings.carbohydrateRatioSchedule',
      'initialSettings.insulinSensitivitySchedule',
    ],
  ],
  [
    ['therapySettingsReviewed'],
  ],
];
