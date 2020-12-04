import * as yup from 'yup';
import i18next from '../../core/language';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import moment from 'moment';
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY } from '../../core/constants';

import {
  dateFormat,
  defaultUnits,
  phoneRegex,
  revisionStates,
  pumpDeviceOptions,
  cgmDeviceOptions,
  insulinModelOptions,
  pumpRanges,
  typeOptions,
  sexOptions,
  trainingOptions,
  validCountryCodes,
} from './prescriptionFormConstants';

const t = i18next.t.bind(i18next);

export default (devices, pumpId, bgUnits = defaultUnits.bloodGlucose) => {
  const pump = find(devices.pumps, { id: pumpId });
  const ranges = pumpRanges(pump);

  // console.log('ranges.bloodGlucoseTargetPhysicalActivity', ranges.bloodGlucoseTargetPhysicalActivity);
  // console.log('ranges.bloodGlucoseTargetPreprandial', ranges.bloodGlucoseTargetPreprandial);
  // console.log('ranges.bloodGlucoseTarget', ranges.bloodGlucoseTarget);

  const deviceOptions = {
    pumps: pumpDeviceOptions(devices),
    cgms: cgmDeviceOptions(devices),
  }

  const rangeErrors = {
    basalRate: `Basal rate out of range. Please select a value between ${ranges.basalRate.min}-${ranges.basalRate.max}`,
    basalRateMaximum: `Basal limit out of range. Please select a value between ${ranges.basalRateMaximum.min}-${ranges.basalRateMaximum.max}`,
    bloodGlucoseTargetMin: `Correction target out of range. Please select a value between ${ranges.bloodGlucoseTarget.min}-${ranges.bloodGlucoseTarget.max}`,
    bloodGlucoseTargetMax: `Correction target out of range. Please select a value below ${ranges.bloodGlucoseTarget.max}`,
    bloodGlucoseTargetPhysicalActivityMin: `Correction target out of range. Please select a value between ${ranges.bloodGlucoseTargetPhysicalActivity.min}-${ranges.bloodGlucoseTargetPhysicalActivity.max}`,
    bloodGlucoseTargetPhysicalActivityMax: `Correction target out of range. Please select a value below ${ranges.bloodGlucoseTargetPhysicalActivity.max}`,
    bloodGlucoseTargetPreprandialMin: `Correction target out of range. Please select a value between ${ranges.bloodGlucoseTargetPreprandial.min}-${ranges.bloodGlucoseTargetPreprandial.max}`,
    bloodGlucoseTargetPreprandialMax: `Correction target out of range. Please select a value below ${ranges.bloodGlucoseTargetPreprandial.max}`,
    bolusAmountMaximum: `Bolus limit out of range. Please select a value between ${ranges.bolusAmountMaximum.min}-${ranges.bolusAmountMaximum.max}`,
    carbRatio: `Insulin-to-carb ratio of range. Please select a value between ${ranges.carbRatio.min}-${ranges.carbRatio.max}`,
    insulinSensitivityFactor: `Sensitivity factor out of range. Please select a value between ${ranges.insulinSensitivityFactor.min}-${ranges.insulinSensitivityFactor.max}`,
    glucoseSafetyLimit: `Threshold out of range. Please select a value between ${ranges.glucoseSafetyLimit.min}-${ranges.glucoseSafetyLimit.max}`,
  };

  // console.log('rangeErrors', rangeErrors);

  return yup.object().shape({
    id: yup.string(),
    state: yup.string()
      .oneOf(revisionStates, t('Please select a valid option')),
    accountType: yup.string()
      .oneOf(map(typeOptions, 'value'), t('Please select a valid option'))
      .required(t('Account type is required')),
    firstName: yup.string()
      .required(t('First name is required')),
    lastName: yup.string()
      .required(t('Last name is required')),
    caregiverFirstName: yup.string().when('accountType', {
      is: 'caregiver',
      then: yup.string().required(t('First name is required')),
    }),
    caregiverLastName: yup.string().when('accountType', {
      is: 'caregiver',
      then: yup.string().required(t('Last name is required')),
    }),
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
        .oneOf(map(deviceOptions.pumps, 'value'))
        .required(t('A pump type must be specified')),
      cgmId: yup.string()
        .oneOf(map(deviceOptions.cgms, 'value'))
        .required(t('A cgm type must be specified')),
      insulinModel: yup.string()
        .oneOf(map(insulinModelOptions, 'value'))
        .required(t('An insulin model must be specified')),
      glucoseSafetyLimit: yup.number()
        .min(ranges.glucoseSafetyLimit.min, rangeErrors.glucoseSafetyLimit)
        .max(ranges.glucoseSafetyLimit.max, rangeErrors.glucoseSafetyLimit)
        .required(t('Suspend threshold is required')),
      basalRateMaximum: yup.object().shape({
        value: yup.number()
          .min(ranges.basalRateMaximum.min, rangeErrors.basalRateMaximum)
          .max(ranges.basalRateMaximum.max, rangeErrors.basalRateMaximum)
          .required(t('Max basal rate is required')),
        units: yup.string()
          .default(defaultUnits.basalRate),
      }),
      bolusAmountMaximum: yup.object().shape({
        value: yup.number()
          .min(ranges.bolusAmountMaximum.min, rangeErrors.bolusAmountMaximum)
          .max(ranges.bolusAmountMaximum.max, rangeErrors.bolusAmountMaximum)
          .required(t('Max bolus amount is required')),
        units: yup.string()
          .default(defaultUnits.bolusAmount),
      }),
      bloodGlucoseTargetSchedule: yup.array().of(
        yup.object().shape({
          context: yup.object().shape({
            min: yup.number().default(ranges.bloodGlucoseTarget.min),
          }),
          high: yup.number()
            .min(yup.ref('low') || yup.ref('context.min'), rangeErrors.bloodGlucoseTargetMin.replace(ranges.bloodGlucoseTarget.min, '${min}'))
            .max(ranges.bloodGlucoseTarget.max, rangeErrors.bloodGlucoseTargetMax)
            .required(t('High target is required')),
          low: yup.number()
            .min(yup.ref('context.min') || ranges.bloodGlucoseTarget.min, rangeErrors.bloodGlucoseTargetMin.replace(ranges.bloodGlucoseTarget.min, '${min}'))
            .max(ranges.bloodGlucoseTarget.max, rangeErrors.bloodGlucoseTargetMax)
            .required(t('Low target is required')),
          start: yup.number()
            .integer()
            .min(0)
            .max(MS_IN_DAY)
            .required(t('Start time is required')),
        }),
      ),
      bloodGlucoseTargetPhysicalActivity: yup.object().shape({
        context: yup.object().shape({
          min: yup.number().default(ranges.bloodGlucoseTargetPhysicalActivity.min),
        }),
        high: yup.number()
          .min(yup.ref('low') || yup.ref('context.min'), rangeErrors.bloodGlucoseTargetPhysicalActivityMin.replace(ranges.bloodGlucoseTargetPhysicalActivity.min, '${min}'))
          .max(ranges.bloodGlucoseTargetPhysicalActivity.max, rangeErrors.bloodGlucoseTargetPhysicalActivityMax)
          .required(t('High target is required')),
        low: yup.number()
          .min(yup.ref('context.min') || ranges.bloodGlucoseTargetPhysicalActivity.min, rangeErrors.bloodGlucoseTargetMin.replace(ranges.bloodGlucoseTargetPhysicalActivity.min, '${min}'))
          .max(ranges.bloodGlucoseTargetPhysicalActivity.max, rangeErrors.bloodGlucoseTargetPhysicalActivity)
          .required(t('Low target is required')),
      }),
      bloodGlucoseTargetPreprandial: yup.object().shape({
        context: yup.object().shape({
          max: yup.number().default(ranges.bloodGlucoseTargetPreprandial.max),
        }),
        high: yup.number()
          .min(yup.ref('low') || ranges.bloodGlucoseTargetPreprandial.min, rangeErrors.bloodGlucoseTargetPreprandialMin.replace(ranges.bloodGlucoseTargetPreprandial.min, '${min}'))
          .max(yup.ref('context.max'), rangeErrors.bloodGlucoseTargetPreprandialMax.replace(ranges.bloodGlucoseTargetPreprandial.max, '${max}'))
          .required(t('High target is required')),
        low: yup.number()
          .min(ranges.bloodGlucoseTargetPreprandial.min, rangeErrors.bloodGlucoseTargetPreprandialMin)
          .max(yup.ref('context.max'), rangeErrors.bloodGlucoseTargetPreprandialMax.replace(ranges.bloodGlucoseTargetPreprandial.max, '${max}'))
          .required(t('Low target is required')),
      }),
      basalRateSchedule: yup.array().of(
        yup.object().shape({
          rate: yup.number()
            .min(ranges.basalRate.min, rangeErrors.basalRate)
            .max(ranges.basalRate.max, rangeErrors.basalRate)
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
            .min(ranges.carbRatio.min, rangeErrors.carbRatio)
            .max(ranges.carbRatio.max, rangeErrors.carbRatio)
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
            .min(ranges.insulinSensitivityFactor.min, rangeErrors.insulinSensitivityFactor)
            .max(ranges.insulinSensitivityFactor.max, rangeErrors.insulinSensitivityFactor)
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
