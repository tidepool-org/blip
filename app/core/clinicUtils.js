import * as yup from 'yup';
import get from 'lodash/get';
import includes from 'lodash/includes';
import keys from 'lodash/keys';
import map from 'lodash/map';
import moment from 'moment';
import countries from 'i18n-iso-countries';

import states from './validation/states';
import postalCodes from './validation/postalCodes';
import i18next from './language';
import { phoneRegex } from '../pages/prescription/prescriptionFormConstants';
import { MGDL_UNITS, MMOLL_UNITS } from '../core/constants';

const t = i18next.t.bind(i18next);

yup.setLocale({
  mixed: {
    notType: ({ type }) => {
      let msg = t(`Please enter a valid ${type}`);

      if (type === 'date') {
        msg += t(' in the requested format');
      }

      return msg;
    },
  },
});

export const dateFormat = 'YYYY-MM-DD';
export const dateRegex = /^(.*)[-|/](.*)[-|/](.*)$/;

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
  { value: 'researcher', label: t('Research Organization') },
  { value: 'other', label: t('Other') },
];

export const clinicSizes = [
  { value: '0-249', label: t('0-249') },
  { value: '250-499', label: t('250-499') },
  { value: '500-999', label: t('500-999') },
  { value: '1000+', label: t('1000+') },
];

export const preferredBgUnits = [
  { value: MGDL_UNITS, label: MGDL_UNITS },
  { value: MMOLL_UNITS, label: MMOLL_UNITS },
];

export const maxClinicPatientTags = 20;

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
  preferredBgUnits: get(clinic, 'preferredBgUnits', ''),
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
  preferredBgUnits: yup
    .string()
    .oneOf(map(preferredBgUnits, 'value'))
    .required(t('Please select your preferred BG units')),
  website: yup
    .string()
    .url(({ value }) => /^https?:\/\//.test(value)
      ? t('Please enter a valid website address')
      : t('Please enter a valid website address with https:// at the beginning')
    ),
});

export const clinicPatientTagSchema = yup.object().shape({
  name: yup.string()
    .max(20, t('Tag name max length is ${max} characters'))
    .matches(/^[\p{L}\p{N}_+><-]{1}[\p{L}\p{N}\s_+><-]*$/u, t('Allowed special characters: - _ + > <'))
})

/**
 * yup schema for patient form
 * @function patientSchema
 * @param {Object} [config]
 * @param {Object} [config.mrnSettings]
 * @param {boolean} [config.mrnSettings.required] - whether or not the MRN field is required
 * @returns {Object} yup schema
 *
 * @example
 * import { patientSchema } from 'core/clinicUtils';
 *
 * const schema = patientSchema({ mrnSettings:{ required: true } });
 *
 */
export const patientSchema = (config) => yup.object().shape({
  fullName: yup.string().required(t('Please enter the patient\'s full name')),
  birthDate: yup.date()
    .transform((value, originalValue) => {
      value = moment(originalValue, dateFormat, true);
      return value.isValid() ? value.toDate() : new Date('');
    })
    .min(moment().subtract(130, 'years').format(dateFormat), t('Please enter a date within the last 130 years'))
    .max(moment().subtract(1, 'day').format(dateFormat), t('Please enter a date prior to today'))
    .required(t('Patient\'s birthday is required')),
  mrn: config?.mrnSettings?.required ? yup.string().required(t('Patient\'s MRN is required')) : yup.string(),
  email: yup.string().email(t('Please enter a valid email address')),
  connectDexcom: yup.boolean(),
  dataSources: yup.array().of(
    yup.object().shape({
      providerName: yup.string(),
      state: yup.string().oneOf(['pending', 'pendingReconnect', 'connected', 'error', 'disconnected']),
    }),
  ),
  tags: yup.array().of(
    yup.string()
  ),
});
