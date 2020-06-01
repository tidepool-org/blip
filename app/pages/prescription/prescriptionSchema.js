import * as yup from 'yup';
import i18next from '../../core/language';
import map from 'lodash/map';
import moment from 'moment';

const t = i18next.t.bind(i18next);

export const dateFormat = 'YYYY-MM-DD';
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

const revisionStates = ['draft', 'pending', 'submitted'];

// TODO: placeholder device id's until provided by upcoming devices api
export const pumpDeviceOptions = [
  { value: 'omnipodId', label: t('Omnipod Horizon') },
];

export const cgmDeviceOptions = [
  { value: 'dexcomId', label: t('Dexcom G6') },
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

const validCountryCodes = [1];

export default yup.object().shape({
  id: yup.string(),
  state: yup.string()
    .oneOf(revisionStates, t('Please select a valid option')),
  type: yup.string()
    .oneOf(map(typeOptions, 'value'), t('Please select a valid option'))
    .required(t('Account type is required')),
  firstName: yup.string()
    .required(t('First name is required')),
  lastName: yup.string().required(t('Last name is required')),
  birthday: yup.string()
    .test('matchesDateFormat', t('Please enter a valid date in the requested format'), value => moment(value, dateFormat, true).isValid())
    .test('isPastDate', t('Please enter a date prior to today'), value => value < moment().format(dateFormat))
    .required(t('Patient\'s birthday is required')),
  email: yup.string()
    .email(t('Please enter a valid email address'))
    .required(t('Email address is required')),
  emailConfirm: yup.string()
    .oneOf([yup.ref('email')], t('Email address confirmation does not match'))
    .required(t('Email confirmation is required')),
  phoneNumber: yup.object().shape({
    countryCode: yup.number()
      .integer()
      .oneOf(validCountryCodes, t('Please set a valid country code'))
      .required(t('Country code is required')),
    number: yup.string()
      .matches(phoneRegex, t('Please enter a valid phone number'))
      .required(t('Patient phone number is required')),
  }),
  mrn: yup.string()
    .required(t('Patient MRN number is required')),
  sex: yup.string()
    .oneOf(map(sexOptions, 'value'), t('Please select a valid option'))
    .required(t('Patient gender is required')),
  initialSettings: yup.object().shape({
    pumpType: yup.string()
      .oneOf(map(pumpDeviceOptions, 'value'))
      .required(t('A pump type must be specified')),
    cgmType: yup.string()
      .oneOf(map(cgmDeviceOptions, 'value'))
      .required(t('A cgm type must be specified')),
  }),
});
