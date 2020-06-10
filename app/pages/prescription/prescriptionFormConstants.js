import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'rebass/styled-components';
import i18next from '../../core/language';
import { MGDL_UNITS } from '../../core/constants';

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

export const defaultValues = {
  basalRateMaximum: 5,
  bolusAmountMaximum: 10,
  suspendThreshold: 80,
}

export const defaultThresholds = {
  basalRateMaximum: { warning: 30 },
  bolusAmountMaximum: { warning: 30 },
  suspendThreshold: { warning: 30 },
};

export const defaultRanges = {
  basalRateMaximum: { min: 0, max: 30, step: 0.25 },
  bolusAmountMaximum: { min: 0, max: 30, step: 1 },
  suspendThreshold: { min: 54, max: 150, step: 1 },
};

// TODO: placeholder device-specific values until provided by the upcoming devices api.
export const deviceMeta = deviceId => {
  const metaByDeviceId = {
    dexcomId: {
      manufacturerName: 'Dexcom',
      ranges: defaultRanges,
    },
    omnipodId: {
      manufacturerName: 'Omnipod',
      ranges: defaultRanges,
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
