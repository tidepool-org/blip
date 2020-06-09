import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'rebass/styled-components';
import i18next from '../../core/language';

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

export const typeOptions = [
  { value: 'patient', label: t('Patient') },
  { value: 'caregiver', label: t('Patient and caregiver') },
];

export const sexOptions = [
  { value: 'female', label: t('Female') },
  { value: 'male', label: t('Male') },
  { value: 'undisclosed', label: t('Prefer not to specify') },
];

export const validCountryCodes = [1];
