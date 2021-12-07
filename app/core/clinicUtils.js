import * as yup from 'yup';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import countries from 'i18n-iso-countries';

import states from './validation/states';
import postalCodes from './validation/postalCodes';
import i18next from './language';
import { phoneRegex } from '../pages/prescription/prescriptionFormConstants';

const t = i18next.t.bind(i18next);

export const roles = [
  { value: 'clinic_manager', label: t('Clinic Manager') },
  { value: 'diabetes_educator', label: t('Diabetes Educator') },
  { value: 'endocrinologist', label: t('Endocrinologist') },
  { value: 'front_desk', label: t('Front Desk') },
  { value: 'information_technology', label: t('IT/Technology') },
  { value: 'medical_assistant', label: t('Medical Assistant') },
  { value: 'nurse', label: t('Nurse/Nurse Practitioner') },
  { value: 'primary_care_physician', label: t('Primary Care Physician') },
  { value: 'physician_assistant', label: t('Physician Assistant') },
  { value: 'pharmacist', label: t('Pharmacist') },
  { value: 'health_student', label: t('Health Professions Student') },
  { value: 'other', label: t('Other') },
];

export const clinicTypes = [
  { value: 'provider_practice', label: t('Provider Practice') },
  { value: 'healthcare_system', label: t('Healthcare System') },
  { value: 'veterinary_clinic', label: t('Veterinary Clinic') },
  { value: 'other', label: t('Other') },
];

export const clinicSizes = [
  { value: '0-249', label: t('0-249') },
  { value: '250-499', label: t('250-499') },
  { value: '500-999', label: t('500-999') },
  { value: '1000+', label: t('1000+') },
];

export const clinicValuesFromClinic = (clinic) => ({
  name: get(clinic, 'name', ''),
  address: get(clinic, 'address', ''),
  city: get(clinic, 'city', ''),
  state: get(clinic, 'state', ''),
  postalCode: get(clinic, 'postalCode', ''),
  country: get(clinic, 'country', 'US'),
  phoneNumbers: [
    {
      type: 'Office',
      number: get(clinic, 'phoneNumbers.0.number', ''),
    },
  ],
  clinicType: get(clinic, 'clinicType', ''),
  clinicSize: get(clinic, 'clinicSize', ''),
  website: get(clinic, 'website', ''),
});

export const clinicSchema = yup.object().shape({
  name: yup.string().required(t('Please enter an organization name')),
  address: yup.string().required(t('Please enter an address')),
  city: yup.string().required(t('Please enter a city')),
  country: yup
    .string()
    .oneOf(keys(countries.getAlpha2Codes()))
    .required(t('Please enter a country')),
  state: yup
    .string()
    .required(t('Please enter a state'))
    .when('country', (country, schema) => !includes(keys(states), country)
      ? schema.required(t('Please enter a state'))
      : schema.oneOf(keys(states[country]), t('Please enter a valid state'))
    ),
  postalCode: yup
    .string()
    .required(t('Please enter a zip/postal code'))
    .when('country', (country, schema) => !includes(keys(postalCodes), country)
      ? schema.required(t('Please enter a zip/postal code'))
      : schema.matches(postalCodes[country], t('Please enter a valid zip/postal code'))
    ),
  phoneNumbers: yup.array().of(
    yup.object().shape({
      type: yup.string().required(),
      number: yup
        .string()
        .matches(phoneRegex, t('Please enter a valid phone number'))
        .required(t('Clinic phone number is required')),
    }),
  ),
  clinicType: yup
    .string()
    .oneOf(map(clinicTypes, 'value'))
    .required(t('Please select a clinic type')),
  clinicSize: yup
    .string()
    .oneOf(map(clinicSizes, 'value'))
    .required(t('Please select an organization size')),
  website: yup
    .string()
    .url(({ value }) => /^https?:\/\//.test(value)
      ? t('Please enter a valid website address')
      : t('Please enter a valid website address with https:// at the beginning')
    ),
});
