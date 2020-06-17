import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'rebass/styled-components';
import defaultsDeep from 'lodash/defaultsDeep';

import i18next from '../../core/language';
import { MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';
import { translateBg, roundBgTarget } from '../../core/utils';

const t = i18next.t.bind(i18next);

export const dateFormat = 'YYYY-MM-DD';
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export const revisionStates = ['draft', 'pending', 'submitted'];

// TODO: placeholder device id's until provided by upcoming devices api
export const pumpDeviceOptions = [
  {
    value: 'omnipodId',
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
    value: 'dexcomId',
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

export const warningThresholds = (bgUnits = defaultUnits.bloodGlucose) => {
  const lowWarning = t('The value you have chosen is lower than Tidepool generally recommends.');
  const highWarning = t('The value you have chosen is higher than Tidepool generally recommends.');

  const thresholds = {
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
  };

  if (bgUnits === MMOLL_UNITS) {
    thresholds.bloodGlucoseTarget.low.value = roundBgTarget(translateBg(thresholds.bloodGlucoseTarget.low.value, MMOLL_UNITS), MMOLL_UNITS);
    thresholds.bloodGlucoseTarget.high.value = roundBgTarget(translateBg(thresholds.bloodGlucoseTarget.high.value, MMOLL_UNITS), MMOLL_UNITS);

    thresholds.insulinSensitivityFactor.low.value = roundBgTarget(translateBg(thresholds.insulinSensitivityFactor.low.value, MMOLL_UNITS), MMOLL_UNITS);
    thresholds.insulinSensitivityFactor.high.value = roundBgTarget(translateBg(thresholds.insulinSensitivityFactor.high.value, MMOLL_UNITS), MMOLL_UNITS);

    thresholds.suspendThreshold.low.value = roundBgTarget(translateBg(thresholds.suspendThreshold.low.value, MMOLL_UNITS), MMOLL_UNITS);
    thresholds.suspendThreshold.high.value = roundBgTarget(translateBg(thresholds.suspendThreshold.high.value, MMOLL_UNITS), MMOLL_UNITS);
  }

  return thresholds;
};

export const defaultValues = (bgUnits = defaultUnits.bloodGlucose) => {
  const values = {
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
  }

  if (bgUnits === MMOLL_UNITS) {
    values.bloodGlucoseTarget = {
      high: roundBgTarget(translateBg(values.bloodGlucoseTarget.high, MMOLL_UNITS), MMOLL_UNITS),
      low: roundBgTarget(translateBg(values.bloodGlucoseTarget.low, MMOLL_UNITS), MMOLL_UNITS),
    }

    values.insulinSensitivityFactor = roundBgTarget(translateBg(values.insulinSensitivityFactor, MMOLL_UNITS), MMOLL_UNITS);
    values.suspendThreshold = roundBgTarget(translateBg(values.suspendThreshold, MMOLL_UNITS), MMOLL_UNITS);
  }

  return values;
};

export const defaultRanges = (bgUnits = defaultUnits.bloodGlucose) => {
  const ranges = {
    basalRate: { min: 0, max: 35, step: 0.05 }, // will need to enforce step in case user types in invalid value
    basalRateMaximum: { min: 0, max: 35, step: 0.25 },
    bloodGlucoseTarget: { min: 60, max: 180, step: 1 },
    bolusAmountMaximum: { min: 0, max: 30, step: 1 },
    carbRatio: { min: 0, max: 250, step: 1 },
    insulinSensitivityFactor: { min: 0, max: 1000, step: 1 },
    suspendThreshold: { min: 54, max: 180, step: 1 },
  };

  if (bgUnits === MMOLL_UNITS) {
    ranges.bloodGlucoseTarget.min = roundBgTarget(translateBg(ranges.bloodGlucoseTarget.min, MMOLL_UNITS), MMOLL_UNITS);
    ranges.bloodGlucoseTarget.max = roundBgTarget(translateBg(ranges.bloodGlucoseTarget.max, MMOLL_UNITS), MMOLL_UNITS);
    ranges.bloodGlucoseTarget.step = 0.1;

    ranges.insulinSensitivityFactor.min = roundBgTarget(translateBg(ranges.insulinSensitivityFactor.min, MMOLL_UNITS), MMOLL_UNITS);
    ranges.insulinSensitivityFactor.max = roundBgTarget(translateBg(ranges.insulinSensitivityFactor.max, MMOLL_UNITS), MMOLL_UNITS);
    ranges.insulinSensitivityFactor.step = 0.1;

    ranges.suspendThreshold.min = roundBgTarget(translateBg(ranges.suspendThreshold.min, MMOLL_UNITS), MMOLL_UNITS);
    ranges.suspendThreshold.max = roundBgTarget(translateBg(ranges.suspendThreshold.max, MMOLL_UNITS), MMOLL_UNITS);
    ranges.suspendThreshold.step = 0.1;
  }

  return ranges;
};

// TODO: placeholder device-specific values until provided by the upcoming devices api.
export const deviceMeta = (deviceId, bgUnits = defaultUnits.bloodGlucose) => {
  const metaByDeviceId = {
    dexcomId: {
      manufacturerName: 'Dexcom',
    },
    omnipodId: {
      manufacturerName: 'Omnipod',
      ranges: defaultsDeep({
        basalRate: { max: 30 },
        basalRateMaximum: { max: 30 },
        carbRatio: { max: 150 },
      }, defaultRanges(bgUnits))
    },
  };

  return metaByDeviceId[deviceId] || {
    manufacturerName: 'Unknown',
    ranges: defaultRanges(bgUnits),
  };
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

export const insulinTypeOptions = [
  { value: 'rapidAdult', label: t('Rapid Acting Adult') },
  { value: 'rapidChild', label: t('Rapid Acting Child') },
];

export const validCountryCodes = [1];
