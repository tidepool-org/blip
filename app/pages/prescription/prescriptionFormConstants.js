import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'rebass/styled-components';
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

export const defaultValues = (bgUnits = defaultUnits.bloodGlucose) => {
  const values = {
    basalRateMaximum: 5,
    bolusAmountMaximum: 10,
    suspendThreshold: 80,
  }

  if (bgUnits === MMOLL_UNITS) {
    values.suspendThreshold = roundBgTarget(translateBg(values.suspendThreshold, MMOLL_UNITS), MMOLL_UNITS);
  }

  return values;
};

export const defaultThresholds = (bgUnits = defaultUnits.bloodGlucose) => {
  const thresholds = {
    basalRateMaximum: { warning: 30 },
    bolusAmountMaximum: { warning: 30 },
    suspendThreshold: { warning: 30 },
  };

  if (bgUnits === MMOLL_UNITS) {
    thresholds.suspendThreshold = roundBgTarget(translateBg(thresholds.suspendThreshold, MMOLL_UNITS), MMOLL_UNITS);
  }

  return thresholds;
};

export const defaultRanges = (bgUnits = defaultUnits.bloodGlucose) => {
  const ranges = {
    basalRateMaximum: { min: 0, max: 30, step: 0.25 },
    bolusAmountMaximum: { min: 0, max: 30, step: 1 },
    suspendThreshold: { min: 54, max: 150, step: 1 },
  };

  if (bgUnits === MMOLL_UNITS) {
    ranges.suspendThreshold = roundBgTarget(translateBg(ranges.suspendThreshold, MMOLL_UNITS), MMOLL_UNITS);
  }

  return ranges;
};

// TODO: placeholder device-specific values until provided by the upcoming devices api.
export const deviceMeta = (deviceId, bgUnits = defaultUnits.bloodGlucose) => {
  const metaByDeviceId = {
    dexcomId: {
      manufacturerName: 'Dexcom',
      ranges: defaultRanges(bgUnits),
    },
    omnipodId: {
      manufacturerName: 'Omnipod',
      ranges: defaultRanges(bgUnits),
    },
  };

  return metaByDeviceId[deviceId] || {
    manufacturerName: 'Unknown',
    ranges: defaultRanges,
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
