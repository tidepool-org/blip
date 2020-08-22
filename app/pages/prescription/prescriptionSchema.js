import * as yup from 'yup';
import i18next from '../../core/language';
import map from 'lodash/map';
import moment from 'moment';
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY } from '../../core/constants';

import {
  dateFormat,
  defaultUnits,
  deviceMeta,
  phoneRegex,
  revisionStates,
  pumpDeviceOptions,
  cgmDeviceOptions,
  // insulinModelOptions,
  // typeOptions,
  sexOptions,
  trainingOptions,
  validCountryCodes,
} from './prescriptionFormConstants';

const t = i18next.t.bind(i18next);

export default (pumpId, bgUnits = defaultUnits.bloodGlucose) => {
  const pumpMeta = deviceMeta(pumpId, bgUnits);

  const rangeErrors = {
    basalRate: `Basal rate out of range. Please select a value between ${pumpMeta.ranges.basalRate.min}-${pumpMeta.ranges.basalRate.max}`,
    basalRateMaximum: `Basal limit out of range. Please select a value between ${pumpMeta.ranges.basalRateMaximum.min}-${pumpMeta.ranges.basalRateMaximum.max}`,
    bloodGlucoseTargetMin: `Correction target out of range. Please select a value between ${pumpMeta.ranges.bloodGlucoseTarget.min}-${pumpMeta.ranges.bloodGlucoseTarget.max}`,
    bloodGlucoseTargetMax: `Correction target out of range. Please select a value below ${pumpMeta.ranges.bloodGlucoseTarget.max}`,
    bolusAmountMaximum: `Bolus limit out of range. Please select a value between ${pumpMeta.ranges.bolusAmountMaximum.min}-${pumpMeta.ranges.bolusAmountMaximum.max}`,
    carbRatio: `Insulin-to-carb ratio of range. Please select a value between ${pumpMeta.ranges.carbRatio.min}-${pumpMeta.ranges.carbRatio.max}`,
    insulinSensitivityFactor: `Sensitivity factor out of range. Please select a value between ${pumpMeta.ranges.insulinSensitivityFactor.min}-${pumpMeta.ranges.insulinSensitivityFactor.max}`,
    suspendThreshold: `Threshold out of range. Please select a value between ${pumpMeta.ranges.suspendThreshold.min}-${pumpMeta.ranges.suspendThreshold.max}`,
  };

  return yup.object().shape({
    id: yup.string(),
    state: yup.string()
      .oneOf(revisionStates, t('Please select a valid option')),
    // type: yup.string()
    //   .oneOf(map(typeOptions, 'value'), t('Please select a valid option'))
    //   .required(t('Account type is required')),
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
      cgmId: yup.string()
        .oneOf(map(cgmDeviceOptions, 'value'))
        .required(t('A cgm type must be specified')),
      // insulinModel: yup.string()
      //   .oneOf(map(insulinModelOptions, 'value'))
      //   .required(t('An insulin model must be specified')),
      suspendThreshold: yup.object().shape({
        value: yup.number()
          .min(pumpMeta.ranges.suspendThreshold.min, rangeErrors.suspendThreshold)
          .max(pumpMeta.ranges.suspendThreshold.max, rangeErrors.suspendThreshold)
          .required(t('Suspend threshold is required')),
        units: yup.string().default(bgUnits),
      }),
      basalRateMaximum: yup.object().shape({
        value: yup.number()
          .min(pumpMeta.ranges.basalRateMaximum.min, rangeErrors.basalRateMaximum)
          .max(pumpMeta.ranges.basalRateMaximum.max, rangeErrors.basalRateMaximum)
          .required(t('Max basal rate is required')),
        units: yup.string()
          .default(defaultUnits.basalRate),
      }),
      bolusAmountMaximum: yup.object().shape({
        value: yup.number()
          .min(pumpMeta.ranges.bolusAmountMaximum.min, rangeErrors.bolusAmountMaximum)
          .max(pumpMeta.ranges.bolusAmountMaximum.max, rangeErrors.bolusAmountMaximum)
          .required(t('Max bolus amount is required')),
        units: yup.string()
          .default(defaultUnits.bolusAmount),
      }),
      bloodGlucoseTargetSchedule: yup.array().of(
        yup.object().shape({
          context: yup.object().shape({
            min: yup.number().default(pumpMeta.ranges.bloodGlucoseTarget.min),
          }),
          high: yup.number()
            .min(yup.ref('low') || yup.ref('context.min'), rangeErrors.bloodGlucoseTargetMin.replace(pumpMeta.ranges.bloodGlucoseTarget.min, '${min}'))
            .max(pumpMeta.ranges.bloodGlucoseTarget.max, rangeErrors.bloodGlucoseTargetMax)
            .required(t('High target is required')),
          low: yup.number()
            .min(yup.ref('context.min') || pumpMeta.ranges.bloodGlucoseTarget.min, rangeErrors.bloodGlucoseTargetMin.replace(pumpMeta.ranges.bloodGlucoseTarget.min, '${min}'))
            .max(pumpMeta.ranges.bloodGlucoseTarget.max, rangeErrors.bloodGlucoseTargetMax)
            .required(t('Low target is required')),
          start: yup.number()
            .integer()
            .min(0)
            .max(MS_IN_DAY)
            .required(t('Start time is required')),
        }),
      ),
      basalRateSchedule: yup.array().of(
        yup.object().shape({
          rate: yup.number()
            .min(pumpMeta.ranges.basalRate.min, rangeErrors.basalRate)
            .max(pumpMeta.ranges.basalRate.max, rangeErrors.basalRate)
            .required(t('Basal rate is required')),
          start: yup.number()
            .integer()
            .min(0)
            .max(MS_IN_DAY)
            .required(t('Start time is required')),
        }),
      ),
      carbohydrateRatioSchedule: yup.array().of(
        yup.object().shape({
          amount: yup.number()
            .min(pumpMeta.ranges.carbRatio.min, rangeErrors.carbRatio)
            .max(pumpMeta.ranges.carbRatio.max, rangeErrors.carbRatio)
            .required(t('Insulin-to-carb ratio is required')),
          start: yup.number()
            .integer()
            .min(0)
            .max(MS_IN_DAY)
            .required(t('Start time is required')),
        }),
      ),
      insulinSensitivitySchedule: yup.array().of(
        yup.object().shape({
          amount: yup.number()
            .min(pumpMeta.ranges.insulinSensitivityFactor.min, rangeErrors.insulinSensitivityFactor)
            .max(pumpMeta.ranges.insulinSensitivityFactor.max, rangeErrors.insulinSensitivityFactor)
            .required(t('Sensitivity factor is required')),
          start: yup.number()
            .integer()
            .min(0)
            .max(MS_IN_DAY)
            .required(t('Start time is required')),
        }),
      ),
    }),
    training: yup.string()
      .oneOf(map(trainingOptions, 'value'), t('Please select a valid option'))
      .required(t('Training type is required')),
    therapySettingsReviewed: yup.boolean()
      .test('isTrue', t('Please confirm the therapy settings for this patient'), value => (value === true)),
  });
};
