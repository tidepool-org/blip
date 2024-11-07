import * as yup from 'yup';
import i18next from '../../core/language';
import find from 'lodash/find';
import includes from 'lodash/includes';
import map from 'lodash/map';
import max from 'lodash/max';
import moment from 'moment';
import { MGDL_UNITS, MMOLL_UNITS, MS_IN_DAY } from '../../core/constants';
import utils from '../../core/utils';

import {
  calculatorMethodOptions,
  cgmDeviceOptions,
  dateFormat,
  defaultUnits,
  insulinModelOptions,
  phoneRegex,
  pumpDeviceOptions,
  pumpRanges,
  revisionStateOptions,
  sexOptions,
  therapySettingsOptions,
  totalDailyDoseScaleFactorOptions,
  trainingOptions,
  typeOptions,
  validCountryCodes,
  weightUnitOptions,
} from './prescriptionFormConstants';

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

export default (devices, pumpId, bgUnits = defaultUnits.bloodGlucose, values) => {
  const pump = find(devices.pumps, { id: pumpId });
  const ranges = pumpRanges(pump, bgUnits, values);

  const deviceOptions = {
    pumps: pumpDeviceOptions(devices),
    cgms: cgmDeviceOptions(devices),
  }

  const rangeError = key => t('Please select a value between {{min}}-{{max}}', {
    min: utils.roundToNearest(ranges[key].min, ranges[key].increment || 1),
    max: utils.roundToNearest(ranges[key].max, ranges[key].increment || 1),
  });

  const equalToOrAboveLow = key => (value, ctx) => {
    const defaultMin = utils.roundToNearest(ranges[key].min, ranges[key].increment || 1);
    const min = utils.roundToNearest(max([parseFloat(ctx.parent.low), ranges[key].min]), ranges[key].increment || 1);
    return value >= parseFloat(min) || ctx.createError({ message: rangeError(key).replace(defaultMin, min) });
  };

  return yup.object().shape({
    id: yup.string(),
    accessCode: yup.string(),
    state: yup.string()
      .oneOf(map(revisionStateOptions, 'value'), t('Please set a valid prescription status')),
    accountType: yup.string()
      .oneOf(map(typeOptions, 'value'), t('Please select a valid option'))
      .required(t('Account type is required')),
    firstName: yup.string()
      .required(t('First name is required')),
    lastName: yup.string()
      .required(t('Last name is required')),
    caregiverFirstName: yup.mixed().notRequired().when('accountType', {
      is: 'caregiver',
      then: () => yup.string().required(t('First name is required')),
    }),
    caregiverLastName: yup.mixed().notRequired().when('accountType', {
      is: 'caregiver',
      then: () => yup.string().required(t('Last name is required')),
    }),
    birthday: yup.date()
      .transform((value, originalValue) => {
        value = moment(originalValue, dateFormat, true);
        return value.isValid() ? value.toDate() : new Date('');
      })
      .min(moment().subtract(130, 'years').format(dateFormat), t('Please enter a date within the last 130 years'))
      .max(moment().endOf('day').format(dateFormat), t('Please enter a date that is not in the future'))
      .required(t('Patient\'s birthday is required')),
    email: yup.string()
      .matches(utils.emailRegex, t('Please enter a valid email address'))
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
    mrn: yup.string(),
    sex: yup.string()
      .oneOf(map(sexOptions, 'value'), t('Please select a valid option'))
      .required(t('Patient gender is required')),
    calculator: yup.object().shape({
      method: yup.string()
        .oneOf(map(calculatorMethodOptions, 'value')),
      totalDailyDose: yup.mixed().notRequired().when('method', {
        is: method => includes(['totalDailyDose', 'totalDailyDoseAndWeight'], method),
        then: () => yup.number()
          .min(0)
          .required(t('Total Daily Dose is required')),
      }),
      totalDailyDoseScaleFactor: yup.mixed().notRequired().when('method', {
        is: method => includes(['totalDailyDose', 'totalDailyDoseAndWeight'], method),
        then: () => yup.number()
          .oneOf(map(totalDailyDoseScaleFactorOptions, 'value'))
          .required(),
      }),
      weight: yup.mixed().notRequired().when('method', {
        is: method => includes(['weight', 'totalDailyDoseAndWeight'], method),
        then: () => yup.number()
          .min(0)
          .required(t('Weight is required')),
      }),
      weightUnits: yup.string()
        .oneOf(map(weightUnitOptions, 'value')),
      recommendedBasalRate: yup.mixed().notRequired().when('method', {
        is: method => includes(map(calculatorMethodOptions, 'value'), method),
        then: () => yup.number()
          .min(0)
          .required(),
      }),
      recommendedInsulinSensitivity: yup.mixed().notRequired().when('method', {
        is: method => includes(map(calculatorMethodOptions, 'value'), method),
        then: () => yup.number()
          .min(0)
          .required(),
      }),
      recommendedCarbohydrateRatio: yup.mixed().notRequired().when('method', {
        is: method => includes(map(calculatorMethodOptions, 'value'), method),
        then: () => yup.number()
          .min(0)
          .required(),
      }),
    }),
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
        .min(ranges.glucoseSafetyLimit.min, rangeError('glucoseSafetyLimit'))
        .max(ranges.glucoseSafetyLimit.max, rangeError('glucoseSafetyLimit'))
        .required(t('Glucose safety limit is required')),
      basalRateMaximum: yup.object().shape({
        value: yup.number()
          .min(ranges.basalRateMaximum.min, rangeError('basalRateMaximum'))
          .max(ranges.basalRateMaximum.max, rangeError('basalRateMaximum'))
          .required(t('Max basal rate is required')),
        units: yup.string()
          .default(defaultUnits.basalRate),
      }),
      bolusAmountMaximum: yup.object().shape({
        value: yup.number()
          .min(ranges.bolusAmountMaximum.min, rangeError('bolusAmountMaximum'))
          .max(ranges.bolusAmountMaximum.max, rangeError('bolusAmountMaximum'))
          .required(t('Max bolus amount is required')),
        units: yup.string()
          .default(defaultUnits.bolusAmount),
      }),
      bloodGlucoseTargetSchedule: yup.array().of(
        yup.object().shape({
          low: yup.number()
            .min(ranges.bloodGlucoseTarget.min, rangeError('bloodGlucoseTarget'))
            .max(ranges.bloodGlucoseTarget.max, rangeError('bloodGlucoseTarget'))
            .required(t('Low target is required')),
          high: yup.number()
            .test('min', null, equalToOrAboveLow('bloodGlucoseTarget'))
            .max(ranges.bloodGlucoseTarget.max, rangeError('bloodGlucoseTarget'))
            .required(t('High target is required')),
          start: yup.number()
            .integer()
            .min(0)
            .max(MS_IN_DAY)
            .required(t('Start time is required')),
        }),
      ),
      bloodGlucoseTargetPhysicalActivity: yup.object().shape({
        low: yup.number()
          .min(ranges.bloodGlucoseTargetPhysicalActivity.min, rangeError('bloodGlucoseTargetPhysicalActivity'))
          .max(ranges.bloodGlucoseTargetPhysicalActivity.max, rangeError('bloodGlucoseTargetPhysicalActivity'))
          .required(t('Low target is required')),
        high: yup.number()
          .test('min', null, equalToOrAboveLow('bloodGlucoseTargetPhysicalActivity'))
          .max(ranges.bloodGlucoseTargetPhysicalActivity.max, rangeError('bloodGlucoseTargetPhysicalActivity'))
          .required(t('High target is required')),
      }),
      bloodGlucoseTargetPreprandial: yup.object().shape({
        low: yup.number()
          .min(ranges.bloodGlucoseTargetPreprandial.min, rangeError('bloodGlucoseTargetPreprandial'))
          .max(ranges.bloodGlucoseTargetPreprandial.max, rangeError('bloodGlucoseTargetPreprandial'))
          .required(t('Low target is required')),
        high: yup.number()
          .test('min', null, equalToOrAboveLow('bloodGlucoseTargetPreprandial'))
          .max(ranges.bloodGlucoseTargetPreprandial.max, rangeError('bloodGlucoseTargetPreprandial'))
          .required(t('High target is required')),
      }),
      basalRateSchedule: yup.array().of(
        yup.object().shape({
          rate: yup.number()
            .min(ranges.basalRate.min, rangeError('basalRate'))
            .max(ranges.basalRate.max, rangeError('basalRate'))
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
            .min(ranges.carbRatio.min, rangeError('carbRatio'))
            .max(ranges.carbRatio.max, rangeError('carbRatio'))
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
            .min(ranges.insulinSensitivityFactor.min, rangeError('insulinSensitivityFactor'))
            .max(ranges.insulinSensitivityFactor.max, rangeError('insulinSensitivityFactor'))
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
      .oneOf(map(trainingOptions, 'value'), t('Please select a valid option')),
    therapySettings: yup.string()
      .oneOf(map(therapySettingsOptions, 'value'), t('Please select a valid option')),
    therapySettingsReviewed: yup.boolean()
      .test('isTrue', t('Please confirm the therapy settings for this patient'), value => (value === true)),
  });
};
