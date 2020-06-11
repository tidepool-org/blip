import * as yup from 'yup';
import i18next from '../../core/language';
import map from 'lodash/map';
import moment from 'moment';
import { MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';

import {
  dateFormat,
  defaultUnits,
  deviceMeta,
  phoneRegex,
  revisionStates,
  pumpDeviceOptions,
  cgmDeviceOptions,
  insulinTypeOptions,
  typeOptions,
  sexOptions,
  trainingOptions,
  validCountryCodes,
} from './prescriptionFormConstants';

const t = i18next.t.bind(i18next);

export default (pumpId, cgmType, bgUnits = defaultUnits.bloodGlucose) => {
  const pumpMeta = deviceMeta(pumpId, bgUnits);
  const cgmMeta = deviceMeta(cgmType, bgUnits);

  return yup.object().shape({
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
      bloodGlucoseUnits: yup.string()
        .oneOf([MGDL_UNITS, MMOLL_UNITS], t('Please set a valid blood glucose units option'))
        .default(bgUnits),
      pumpId: yup.string()
        .oneOf(map(pumpDeviceOptions, 'value'))
        .required(t('A pump type must be specified')),
      cgmType: yup.string()
        .oneOf(map(cgmDeviceOptions, 'value'))
        .required(t('A cgm type must be specified')),
      insulinType: yup.string()
        .oneOf(map(insulinTypeOptions, 'value'))
        .required(t('A cgm type must be specified')),
      suspendThreshold: yup.object().shape({
        value: yup.number()
          .min(cgmMeta.ranges.suspendThreshold.min, `Threshold out of range. Please select a value between ${cgmMeta.ranges.suspendThreshold.min}-${cgmMeta.ranges.suspendThreshold.max}`)
          .max(cgmMeta.ranges.suspendThreshold.max, `Threshold out of range. Please select a value between ${cgmMeta.ranges.suspendThreshold.min}-${cgmMeta.ranges.suspendThreshold.max}`),
        units: yup.string().default(bgUnits),
      }),
      basalRateMaximum: yup.object().shape({
        value: yup.number()
          .min(pumpMeta.ranges.basalRateMaximum.min)
          .max(pumpMeta.ranges.basalRateMaximum.max),
        units: yup.string()
          .default(defaultUnits.basalRate),
      }),
      bolusAmountMaximum: yup.object().shape({
        value: yup.number()
          .min(pumpMeta.ranges.bolusAmountMaximum.min)
          .max(pumpMeta.ranges.bolusAmountMaximum.max),
        units: yup.string()
          .default(defaultUnits.bolusAmount),
      }),
    }),
    training: yup.string()
      .oneOf(map(trainingOptions, 'value'), t('Please select a valid option'))
      .required(t('Training type is required')),
  });
};
