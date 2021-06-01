import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'rebass/styled-components';
import isFinite from 'lodash/isFinite';
import get from 'lodash/get';
import map from 'lodash/map';
import max from 'lodash/max';
import mean from 'lodash/mean';
import min from 'lodash/min';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import moment from 'moment';

import i18next from '../../core/language';
import { LBS_PER_KG, MGDL_PER_MMOLL, MGDL_UNITS } from '../../core/constants';
import utils from '../../core/utils';
import { getFloatFromUnitsAndNanos } from '../../core/data';

const t = i18next.t.bind(i18next);

export const dateFormat = 'YYYY-MM-DD';
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const dateRegex = /^(.*)[-|/](.*)[-|/](.*)$/;

export const deviceIdMap = {
  dexcomG6: 'd25c3f1b-a2e8-44e2-b3a3-fd07806fc245',
  omnipodHorizon: '6678c377-928c-49b3-84c1-19e2dafaff8d',
};

export const validDeviceIds = {
  cgms: [
    deviceIdMap.dexcomG6,
  ],
  pumps: [
    deviceIdMap.omnipodHorizon,
  ],
};

export const deviceExtraInfo = {
  [deviceIdMap.dexcomG6]: (
    <Trans>
      Find information on how to prescribe Dexcom G6 sensors and transmitters and more <Link href="#">here</Link>.
    </Trans>
  ),
  [deviceIdMap.omnipodHorizon]: (
    <Trans>
      Find information on how to prescribe Omnipod products <Link href="#">here</Link>.
    </Trans>
  ),
};

export const pumpDeviceOptions = ({ pumps } = {}) => map(
  filter(pumps, pump => includes(validDeviceIds.pumps, pump.id)),
  pump => ({
    value: pump.id,
    label: t('{{displayName}}', { displayName: pump.displayName }),
    extraInfo: deviceExtraInfo[pump.id] || null,
  }),
);

export const cgmDeviceOptions = ({ cgms } = {}) => map(
  filter(cgms, cgm => includes(validDeviceIds.cgms, cgm.id)),
  cgm => ({
    value: cgm.id,
    label: t('{{displayName}}', { displayName: cgm.displayName }),
    extraInfo: deviceExtraInfo[cgm.id] || null,
  }),
);

export const defaultUnits = {
  basalRate: 'Units/hour',
  bloodGlucose: MGDL_UNITS,
  bolusAmount: 'Units',
  insulinCarbRatio: 'g/U',
  weight: 'kg',
};

export const getPumpGuardrail = (pump, path, fallbackValue) => getFloatFromUnitsAndNanos(get(pump, `guardRails.${path}`)) || fallbackValue;

export const getBgInTargetUnits = (bgValue, bgUnits, targetUnits) => {
  if (bgUnits === targetUnits || !isFinite(bgValue)) return bgValue;
  return utils.roundBgTarget(utils.translateBg(bgValue, targetUnits), targetUnits);
};

export const getBgStepInTargetUnits = (stepValue, stepUnits, targetUnits) => {
  if (stepUnits === targetUnits || !isFinite(stepValue)) return stepValue;
  return (stepUnits === MGDL_UNITS)
    ? stepValue * 0.1
    : stepValue * 10;
};

export const roundValueToIncrement = (value, increment = 1) => {
  const inverse = 1 / increment;
  return value ? Math.round(value * inverse) / inverse : value;
};

export const pumpRanges = (pump, bgUnits = defaultUnits.bloodGlucose, values) => {
  const ranges = {
    basalRate: {
      min: max([getPumpGuardrail(pump, 'basalRates.absoluteBounds.minimum', 0.05), 0.05]),
      max: min([getPumpGuardrail(pump, 'basalRates.absoluteBounds.maximum', 30), 30]),
      increment: getPumpGuardrail(pump, 'basalRates.absoluteBounds.increment', 0.05),
    },
    basalRateMaximum: {
      min: max(filter([
        getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.minimum', 0),
        max(map(get(values, 'initialSettings.basalRateSchedule'), 'rate')),
      ], isFinite)),
      max: min(filter([
        getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.maximum', 30),
        70 / min(map(get(values, 'initialSettings.carbohydrateRatioSchedule'), 'amount')),
      ], isFinite)),
      increment: getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.increment', 0.05),
    },
    bloodGlucoseTarget: {
      min: max(filter([
        getBgInTargetUnits(getPumpGuardrail(pump, 'correctionRange.absoluteBounds.minimum', 87), MGDL_UNITS, bgUnits),
        get(values, 'initialSettings.glucoseSafetyLimit'),
      ], isFinite)),
      max: getBgInTargetUnits(getPumpGuardrail(pump, 'correctionRange.absoluteBounds.maximum', 180), MGDL_UNITS, bgUnits),
      increment: getBgStepInTargetUnits(getPumpGuardrail(pump, 'correctionRange.absoluteBounds.increment', 1), MGDL_UNITS, bgUnits),
    },
    bloodGlucoseTargetPhysicalActivity: {
      min: max(filter([
        getBgInTargetUnits(getPumpGuardrail(pump, 'workoutCorrectionRange.absoluteBounds.minimum', 87), MGDL_UNITS, bgUnits),
        get(values, 'initialSettings.glucoseSafetyLimit'),
      ], isFinite)),
      max: getBgInTargetUnits(getPumpGuardrail(pump, 'workoutCorrectionRange.absoluteBounds.maximum', 250), MGDL_UNITS, bgUnits),
      increment: getBgStepInTargetUnits(getPumpGuardrail(pump, 'workoutCorrectionRange.absoluteBounds.increment', 1), MGDL_UNITS, bgUnits),
    },
    bloodGlucoseTargetPreprandial: {
      min: max(filter([
        getBgInTargetUnits(getPumpGuardrail(pump, 'glucoseSafetyLimit.absoluteBounds.minimum', 67), MGDL_UNITS, bgUnits),
        get(values, 'initialSettings.glucoseSafetyLimit'),
      ], isFinite)),
      max: getBgInTargetUnits(getPumpGuardrail(pump, 'preprandialCorrectionRange.absoluteBounds.maximum', 130), MGDL_UNITS, bgUnits),
      increment: getBgStepInTargetUnits(getPumpGuardrail(pump, 'preprandialCorrectionRange.absoluteBounds.increment', 1), MGDL_UNITS, bgUnits),
    },
    bolusAmountMaximum: {
      min: max([getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.minimum', 0.05), 0.05]),
      max: min([getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.maximum', 30), 30]),
      increment: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.increment', 0.05),
    },
    carbRatio: {
      min: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.minimum', 2),
      max: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.maximum', 150),
      increment: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.increment', 0.01),
      inputStep: 1,
    },
    insulinSensitivityFactor: {
      min: getBgInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.minimum', 10), MGDL_UNITS, bgUnits),
      max: getBgInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.maximum', 500), MGDL_UNITS, bgUnits),
      increment: getBgStepInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.increment', 1), MGDL_UNITS, bgUnits),
    },
    glucoseSafetyLimit: {
      min: getBgInTargetUnits(getPumpGuardrail(pump, 'glucoseSafetyLimit.absoluteBounds.minimum', 67), MGDL_UNITS, bgUnits),
      max: min(filter([
        getBgInTargetUnits(getPumpGuardrail(pump, 'glucoseSafetyLimit.absoluteBounds.maximum', 110), MGDL_UNITS, bgUnits),
        get(values, 'initialSettings.bloodGlucoseTargetPhysicalActivity.low'),
        get(values, 'initialSettings.bloodGlucoseTargetPreprandial.low'),
        min(map(get(values, 'initialSettings.bloodGlucoseTargetSchedule'), 'low')),
      ], isFinite)),
      increment: getBgStepInTargetUnits(getPumpGuardrail(pump, 'glucoseSafetyLimit.absoluteBounds.increment', 1), MGDL_UNITS, bgUnits),
    },
  };

  return ranges;
};

export const warningThresholds = (pump, bgUnits = defaultUnits.bloodGlucose, values) => {
  const lowWarning = t('The value you have chosen is lower than Tidepool generally recommends.');
  const highWarning = t('The value you have chosen is higher than Tidepool generally recommends.');
  const maxBasalRate = max(map(get(values, 'initialSettings.basalRateSchedule'), 'rate'));
  const bloodGlucoseTargetSchedules = get(values, 'initialSettings.bloodGlucoseTargetSchedule');
  const bloodGlucoseTargetSchedulesMin = min(filter(map(bloodGlucoseTargetSchedules, 'low'), isFinite));
  const bloodGlucoseTargetSchedulesMax = max(filter(map(bloodGlucoseTargetSchedules, 'high'), isFinite));

  let bloodGlucoseTargetSchedulesExtentsText = (isFinite(bloodGlucoseTargetSchedulesMin) && isFinite(bloodGlucoseTargetSchedulesMax))
    ? t(' ({{bloodGlucoseTargetSchedulesMin}}-{{bloodGlucoseTargetSchedulesMax}} {{bgUnits}})', {
      bloodGlucoseTargetSchedulesMin,
      bloodGlucoseTargetSchedulesMax,
      bgUnits,
    })
    : '';

  const thresholds = {
    basalRateMaximum: {
      high: isFinite(maxBasalRate) ? {
        value: parseFloat((maxBasalRate * 6.4).toFixed(2)),
        message: t('Tidepool recommends that your maximum basal rate does not exceed 6.4 times your highest scheduled basal rate of {{value}} U/hr.', {
          value: maxBasalRate,
        }),
      } : undefined,
      low: isFinite(maxBasalRate) ? {
        value: parseFloat((maxBasalRate * 2.1).toFixed(2)),
        message: t('Tidepool recommends that your maximum basal rate is at least 2.1 times your highest scheduled basal rate of {{value}} U/hr.', {
          value: maxBasalRate,
        }),
      } : undefined,
    },
    bloodGlucoseTarget: {
      low: {
        value: getBgInTargetUnits(getPumpGuardrail(pump, 'correctionRange.recommendedBounds.minimum', 100), MGDL_UNITS, bgUnits),
        message: lowWarning,
      },
      high: {
        value: getBgInTargetUnits(getPumpGuardrail(pump, 'correctionRange.recommendedBounds.maximum', 115), MGDL_UNITS, bgUnits),
        message: highWarning,
      },
    },
    bloodGlucoseTargetPhysicalActivity: {
      low: isFinite(bloodGlucoseTargetSchedulesMax) ? {
        value: bloodGlucoseTargetSchedulesMax,
        message: t(
          'Tidepool generally recommends a workout range higher than your normal correction range{{bloodGlucoseTargetSchedulesExtentsText}}.',
          { bloodGlucoseTargetSchedulesExtentsText }
        ),
      } : undefined,
      high: {
        value: getBgInTargetUnits(getPumpGuardrail(pump, 'workoutCorrectionRange.recommendedBounds.maximum', 180), MGDL_UNITS, bgUnits),
        message: highWarning,
      }
    },
    bloodGlucoseTargetPreprandial: {
      high: isFinite(bloodGlucoseTargetSchedulesMin) ? {
        value: bloodGlucoseTargetSchedulesMin,
        message: t(
          'Tidepool generally recommends a pre-meal range lower than your normal correction range{{bloodGlucoseTargetSchedulesExtentsText}}.',
          { bloodGlucoseTargetSchedulesExtentsText }
        ),
      } : undefined,
    },
    bolusAmountMaximum: {
      low: {
        value: getPumpGuardrail(pump, 'bolusAmountMaximum.recommendedBounds.minimum', 0.05),
        message: lowWarning,
      },
      high: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.maximum') >= 20 ? {
        value: getPumpGuardrail(pump, 'bolusAmountMaximum.recommendedBounds.maximum', 19.95),
        message: highWarning,
      } : undefined,
    },
    carbRatio: {
      low: {
        value: getPumpGuardrail(pump, 'carbohydrateRatio.recommendedBounds.minimum', 4),
        message: lowWarning,
      },
      high: {
        value: getPumpGuardrail(pump, 'carbohydrateRatio.recommendedBounds.maximum', 28),
        message: highWarning,
      },
    },
    insulinSensitivityFactor: {
      low: {
        value: getBgInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.recommendedBounds.minimum', 16), MGDL_UNITS, bgUnits),
        message: lowWarning,
      },
      high: {
        value: getBgInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.recommendedBounds.maximum', 399), MGDL_UNITS, bgUnits),
        message: highWarning,
      },
    },
    glucoseSafetyLimit: {
      low: {
        value: getBgInTargetUnits(getPumpGuardrail(pump, 'glucoseSafetyLimit.recommendedBounds.minimum', 74), MGDL_UNITS, bgUnits),
        message: lowWarning,
      },
      high: {
        value: getBgInTargetUnits(getPumpGuardrail(pump, 'glucoseSafetyLimit.recommendedBounds.maximum', 80), MGDL_UNITS, bgUnits),
        message: highWarning,
      },
    },
  };

  return thresholds;
};

/**
 * Determine dynamic default values for therapy settings as needed
 * @param {Object} pump object as provided by the devices api
 * @param {String} bgUnits one of mg/dL | mmol/L
 * @param {Object} values form values provided by formik context
 * @returns {Object} default values keyed by setting
 */
export const defaultValues = (pump, bgUnits = defaultUnits.bloodGlucose, values = {}) => {
  const {
    calculator: {
      recommendedBasalRate,
      recommendedInsulinSensitivity,
      recommendedCarbohydrateRatio,
    } = {},
  } = values;

  const maxBasalRate = max(map(get(values, 'initialSettings.basalRateSchedule'), 'rate'));
  const patientAge = moment().diff(moment(get(values, 'birthday'), dateFormat), 'years', true);
  const isPediatric = patientAge < 18;

  return {
    basalRate: recommendedBasalRate || 0.05,
    basalRateMaximum: isFinite(maxBasalRate)
      ? parseFloat((maxBasalRate * (isPediatric ? 3 : 3.5)).toFixed(2))
      : getPumpGuardrail(pump, 'basalRateMaximum.defaultValue', 0.05),
    bloodGlucoseTarget: {
      low: getBgInTargetUnits(100, MGDL_UNITS, bgUnits),
      high: getBgInTargetUnits(isPediatric ? 115 : 105, MGDL_UNITS, bgUnits),
    },
    bloodGlucoseTargetPhysicalActivity: {
      low: getBgInTargetUnits(150, MGDL_UNITS, bgUnits),
      high: getBgInTargetUnits(170, MGDL_UNITS, bgUnits),
    },
    bloodGlucoseTargetPreprandial: {
      low: getBgInTargetUnits(80, MGDL_UNITS, bgUnits),
      high: getBgInTargetUnits(100, MGDL_UNITS, bgUnits),
    },
    carbohydrateRatio: recommendedCarbohydrateRatio,
    insulinSensitivity: recommendedInsulinSensitivity,
    glucoseSafetyLimit: getBgInTargetUnits(isPediatric ? 80 : 75, MGDL_UNITS, bgUnits),
  };
};

/**
 * Calculate recommended therapy settings based on inputs provided by clinician
 * @param {Object} values form values provided by formik context
 * @returns {Object} recommended values keyed by setting
 */
export const calculateRecommendedTherapySettings = values => {
  const {
    calculator: {
      weight,
      weightUnits,
      totalDailyDose,
      totalDailyDoseScaleFactor,
    } = {},
    initialSettings: {
      bloodGlucoseUnits: bgUnits = defaultUnits.bloodGlucose
    } = {},
  } = values;

  const baseTotalDailyDoseInputs = [];

  if (isFinite(totalDailyDose) && isFinite(totalDailyDoseScaleFactor))
    baseTotalDailyDoseInputs.push(totalDailyDose * totalDailyDoseScaleFactor);

  if (isFinite(weight) && includes(['kg', 'lbs'], weightUnits))
    baseTotalDailyDoseInputs.push(weightUnits === 'lbs'
      ? weight / LBS_PER_KG / 2
      : weight / 2
    );

  const baseTotalDailyDose = mean(baseTotalDailyDoseInputs);

  return {
    recommendedBasalRate: roundValueToIncrement(baseTotalDailyDose / 2 / 24, 0.05),
    recommendedCarbohydrateRatio: roundValueToIncrement(450 / baseTotalDailyDose, 1),
    recommendedInsulinSensitivity: bgUnits === MGDL_UNITS
      ? roundValueToIncrement(1700 / baseTotalDailyDose, 1)
      : roundValueToIncrement(1700 / baseTotalDailyDose / MGDL_PER_MMOLL, 0.1),
  };
};

export const hasCalculatorResults = values => !!(get(values, 'calculator.recommendedBasalRate')
  && get(values, 'calculator.recommendedInsulinSensitivity')
  && get(values, 'calculator.recommendedCarbohydrateRatio'));

/**
 * Determine whether or not to update the default value of a field
 *
 * Scenarios when we want to update:
 * New prescription flow
 * - field in hydrated localStorage values is non-finite and field is untouched
 *
 * Edit prescription flow
 * - no initial value and untouched
 *
 * Single step edit from review page
 * - never
 *
 * @param {String} fieldPath path to the field in dot notation
 * @param {Object} formikContext context provided by useFormikContext()
 * @returns {Boolean}
 */
export const shouldUpdateDefaultValue = (fieldPath, formikContext) => {
  const {
    initialValues,
    status,
    touched,
  } = formikContext;

  const initialValuesSource = status.isPrescriptionEditFlow ? initialValues : status.hydratedValues;

  return (
    !status.isSingleStepEdit
    && !isFinite(get(initialValuesSource, fieldPath)) && !get(touched, fieldPath)
  );
};

export const revisionStateOptions = [
  { value: 'draft', label: t('Draft'), colorPalette: 'blues' },
  { value: 'pending', label: t('Pending Approval'), colorPalette: 'oranges' },
  { value: 'submitted', label: t('Submitted'), colorPalette: 'indigos' },
];

export const prescriptionStateOptions = [
  ...revisionStateOptions,
  { value: 'claimed', label: t('Claimed'), colorPalette: 'cyans' },
  { value: 'expired', label: t('Expired'), colorPalette: 'pinks' },
  { value: 'active', label: t('Active'), colorPalette: 'greens' },
  { value: 'inactive', label: t('Inactive'), colorPalette: 'purples' },
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

export const trainingOptions = [
  { value: 'inPerson', label: t('Yes, Patient requires in-person CPT training') },
  { value: 'inModule', label: t('No, Patient can self start with Tidepool Loop in-app tutorial') },
];

export const therapySettingsOptions = [
  { value: 'initial', label: t('Initial pump settings order') },
  { value: 'transferPumpSettings', label: t('Transfer pump settings') },
];

export const insulinModelOptions = [
  { value: 'rapidAdult', label: t('Rapid Acting - Adult') },
  { value: 'rapidChild', label: t('Rapid Acting - Child') },
];

export const calculatorMethodOptions = [
  { value: 'totalDailyDose', label: t('Total Daily Dose') },
  { value: 'weight', label: t('Weight') },
  { value: 'totalDailyDoseAndWeight', label: t('Total Daily Dose and Weight') },
];

export const totalDailyDoseScaleFactorOptions = [
  { value: 1, label: t('Use full total daily dose') },
  { value: 0.75, label: t('Use 0.75 total daily dose. Reduced dose, e.g. for MDI patients') },
];

export const weightUnitOptions = [
  { value: 'kg', label: t('kg') },
  { value: 'lbs', label: t('lbs') },
];

export const validCountryCodes = [1];

export const stepValidationFields = [
  [
    ['accountType'],
    ['firstName', 'lastName', 'birthday'],
    ['caregiverFirstName', 'caregiverLastName', 'email', 'emailConfirm'],
  ],
  [
    ['phoneNumber.number'],
    ['mrn'],
    ['sex'],
    ['initialSettings.pumpId', 'initialSettings.cgmId'],
  ],
  [
    ['calculator.method'],
    [
      'calculator.totalDailyDose',
      'calculator.totalDailyDoseScaleFactor',
      'calculator.weight',
      'calculator.weightUnits',
      'calculator.recommendedBasalRate',
      'calculator.recommendedInsulinSensitivity',
      'calculator.recommendedCarbohydrateRatio',
    ],
  ],
  [
    [
      'training',
      'initialSettings.glucoseSafetyLimit',
      'initialSettings.insulinModel',
      'initialSettings.basalRateMaximum.value',
      'initialSettings.bolusAmountMaximum.value',
      'initialSettings.bloodGlucoseTargetSchedule',
      'initialSettings.bloodGlucoseTargetPhysicalActivity',
      'initialSettings.bloodGlucoseTargetPreprandial',
      'initialSettings.basalRateSchedule',
      'initialSettings.carbohydrateRatioSchedule',
      'initialSettings.insulinSensitivitySchedule',
    ],
  ],
  [
    ['therapySettingsReviewed'],
  ],
];
