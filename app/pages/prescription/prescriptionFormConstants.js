import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'rebass/styled-components';
import defaultsDeep from 'lodash/defaultsDeep';
import map from 'lodash/map';
import max from 'lodash/max';

import i18next from '../../core/language';
import { MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';
import utils from '../../core/utils';

const t = i18next.t.bind(i18next);

export const dateFormat = 'YYYY-MM-DD';
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export const revisionStates = ['draft', 'pending', 'submitted'];

// TODO: hard-coded device id's until provided by upcoming devices api
export const placeholderDeviceIds = {
  dexcom: 'd25c3f1b-a2e8-44e2-b3a3-fd07806fc245',
  omnipod: '6678c377-928c-49b3-84c1-19e2dafaff8d',
};

export const pumpDeviceOptions = [
  {
    value: placeholderDeviceIds.omnipod,
    label: t('Omnipod Horizon'),
    extraInfo: (
      <Trans>
        Find information on how to prescribe Omnipod products <Link href="#">here</Link>.
      </Trans>
    ),
  },
];

export const cgmDeviceOptions = [
  {
    value: placeholderDeviceIds.dexcom,
    label: t('Dexcom G6'),
    extraInfo: (
      <Trans>
        Find information on how to prescribe Dexcom G6 sensors and transmitters and more <Link href="#">here</Link>.
      </Trans>
    ),
  },
];

export const defaultUnits = {
  basalRate: 'Units/hour',
  bolusAmount: 'Units',
  insulinCarbRatio: 'g/U',
  bloodGlucose: MGDL_UNITS,
};

export const defaultValues = (bgUnits = defaultUnits.bloodGlucose) => {
  const values = {
    basalRate: 0.05,
    basalRateMaximum: 0,
    bolusAmountMaximum: 0,
  };

  return values;
};

export const defaultRanges = (bgUnits = defaultUnits.bloodGlucose) => {
  const ranges = {
    basalRate: { min: 0, max: 35, step: 0.05 }, // will need to enforce step in case user types in invalid value
    basalRateMaximum: { min: 0, max: 35, step: 0.25 },
    bloodGlucoseTarget: { min: 60, max: 180, step: 1 },
    bolusAmountMaximum: { min: 0, max: 30, step: 1 },
    carbRatio: { min: 1, max: 150, step: 1 },
    insulinSensitivityFactor: { min: 10, max: 500, step: 1 },
    suspendThreshold: { min: 54, max: 180, step: 1 },
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

export const warningThresholds = (bgUnits = defaultUnits.bloodGlucose, meta) => {
  const lowWarning = t('The value you have entered is lower than Tidepool typically recommends for most people.');
  const highWarning = t('The value you have entered is higher than Tidepool typically recommends for most people.');

  const maxBasalRate = max(map(meta.initialSettings.basalRateSchedule.value, 'rate'));
  const basalRateMaximumWarning = t('Tidepool recommends that your maximum basal rate does not exceed 6 times your highest scheduled basal rate of {{value}} U/hr.', {
    value: maxBasalRate,
  });

  const thresholds = {
    basalRate: {
      low: { value: 0, message: lowWarning },
    },
    basalRateMaximum: {
      high: { value: maxBasalRate * 6 + 0.01, message: basalRateMaximumWarning }
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

// TODO: placeholder device-specific values until provided by the upcoming devices api.
export const deviceMeta = (deviceId, bgUnits = defaultUnits.bloodGlucose) => {
  const metaByDeviceId = {
    [placeholderDeviceIds.dexcom]: {
      manufacturerName: 'Dexcom',
    },
    [placeholderDeviceIds.omnipod]: {
      manufacturerName: 'Omnipod',
      ranges: defaultsDeep({
        basalRate: { min: 0.05, max: 30 },
        basalRateMaximum: { max: 30 },
      }, defaultRanges(bgUnits))
    },
  };

  return metaByDeviceId[deviceId] || {
    manufacturerName: 'Unknown',
    ranges: defaultRanges(bgUnits),
  };
};

// export const typeOptions = [
//   { value: 'patient', label: t('Patient') },
//   { value: 'caregiver', label: t('Patient and caregiver') },
// ];

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
    // ['type'],
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
