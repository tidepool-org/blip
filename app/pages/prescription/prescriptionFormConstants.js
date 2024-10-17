import React from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'theme-ui';
import bows from 'bows';
import each from 'lodash/each';
import find from 'lodash/find';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import isFinite from 'lodash/isFinite';
import map from 'lodash/map';
import max from 'lodash/max';
import mean from 'lodash/mean';
import min from 'lodash/min';
import noop from 'lodash/noop';
import filter from 'lodash/filter';
import includes from 'lodash/includes';
import reduce from 'lodash/reduce';
import reject from 'lodash/reject';
import moment from 'moment';

import i18next from '../../core/language';
import { LBS_PER_KG, MGDL_PER_MMOLL, MGDL_UNITS } from '../../core/constants';
import utils from '../../core/utils';
import { getFloatFromUnitsAndNanos } from '../../core/data';
import { fieldsAreValid } from '../../core/forms';

import { AccountType, PatientEmail, PatientInfo } from './accountFormSteps';
import { PatientDevices, PatientGender, PatientMRN, PatientPhone } from './profileFormSteps';
import { CalculatorInputs, CalculatorMethod } from './settingsCalculatorFormSteps';
import { TherapySettings } from './therapySettingsFormStep';
import { PrescriptionReview } from './reviewFormStep';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionForm');

export const dateFormat = 'YYYY-MM-DD';
export const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
export const dateRegex = /^(.*)[-|/](.*)[-|/](.*)$/;

export const deviceIdMap = {
  cgmSimulator: 'c97bd194-5e5e-44c1-9629-4cb87be1a4c9',
  dexcomG6: 'd25c3f1b-a2e8-44e2-b3a3-fd07806fc245',
  palmtree: 'c524b5b0-632e-4125-8f6a-df9532d8f6fe',
};

export const validDeviceIds = {
  cgms: [
    deviceIdMap.dexcomG6,
  ],
  pumps: [
    deviceIdMap.palmtree,
  ],
};

export const deviceDetails = {
  [deviceIdMap.dexcomG6]: {
    description: (
      <Trans>
        Find information on how to prescribe Dexcom G6 sensors and transmitters and more <Link to="#">here</Link>.
      </Trans>
    ),
  },
  [deviceIdMap.cgmSimulator]: {
    description: null,
  },
  [deviceIdMap.palmtree]: {
    description: (
      <Trans>
        Find information on how to prescribe Palmtree products <Link to="#">here</Link>.
      </Trans>
    ),
  },
};

export const pumpDeviceOptions = ({ pumps } = {}) => map(
  filter(pumps, pump => includes(validDeviceIds.pumps, pump.id)),
  pump => ({
    value: pump.id,
    label: t('{{displayName}}', { displayName: pump.displayName }),
    ...(deviceDetails[pump.id] || {}),
  }),
);

export const cgmDeviceOptions = ({ cgms } = {}) => map(
  filter(cgms, cgm => includes(validDeviceIds.cgms, cgm.id)),
  cgm => ({
    value: cgm.id,
    label: t('{{displayName}}', { displayName: cgm.displayName }),
    ...(deviceDetails[cgm.id] || {}),
  }),
);

export const defaultUnits = {
  basalRate: 'Units/hour',
  bloodGlucose: MGDL_UNITS,
  bolusAmount: 'Units',
  insulinCarbRatio: 'g/U',
  weight: 'kg',
};

export const getPumpGuardrail = (pump, path, fallbackValue) => {
  const guardrail = get(pump, `guardRails.${path}`);
  return guardrail ? getFloatFromUnitsAndNanos(get(pump, `guardRails.${path}`)) : fallbackValue;
};

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

export const pumpRanges = (pump, bgUnits = defaultUnits.bloodGlucose, values) => {
  const maxBasalRate = max(map(get(values, 'initialSettings.basalRateSchedule'), 'rate'));
  const maxAllowedBasalRate = getPumpGuardrail(pump, 'basalRates.absoluteBounds.maximum', 30);

  const ranges = {
    basalRate: {
      min: getPumpGuardrail(pump, 'basalRates.absoluteBounds.minimum', 0.05),
      max: maxAllowedBasalRate,
      increment: getPumpGuardrail(pump, 'basalRates.absoluteBounds.increment', 0.05),
      schedules: { max: pump?.guardRails?.basalRates?.maxSegments || 48, minutesIncrement: 30 },
    },
    basalRateMaximum: {
      min: max(filter([
        getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.minimum', 0.05),
        min([
          max([maxBasalRate, getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.minimum', 0.05)]),
          maxAllowedBasalRate,
        ]),
      ], isFinite)),
      max: min(filter([
        getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.maximum', 30),
        max([
          70 / min(map(get(values, 'initialSettings.carbohydrateRatioSchedule'), 'amount')),
          parseFloat((maxBasalRate * 6.4).toFixed(2))
        ]),
      ], val => isFinite(val) && parseInt(val) > 0)),
      increment: getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.increment', 0.05),
    },
    bloodGlucoseTarget: {
      min: max(filter([
        getBgInTargetUnits(getPumpGuardrail(pump, 'correctionRange.absoluteBounds.minimum', 87), MGDL_UNITS, bgUnits),
        get(values, 'initialSettings.glucoseSafetyLimit'),
      ], isFinite)),
      max: getBgInTargetUnits(getPumpGuardrail(pump, 'correctionRange.absoluteBounds.maximum', 180), MGDL_UNITS, bgUnits),
      increment: getBgStepInTargetUnits(getPumpGuardrail(pump, 'correctionRange.absoluteBounds.increment', 1), MGDL_UNITS, bgUnits),
      schedules: { max: 48, minutesIncrement: 30 },
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
      min: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.minimum', 0.05),
      max: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.maximum', 30),
      increment: getPumpGuardrail(pump, 'bolusAmountMaximum.absoluteBounds.increment', 0.05),
    },
    carbRatio: {
      min: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.minimum', 2),
      max: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.maximum', 150),
      increment: getPumpGuardrail(pump, 'carbohydrateRatio.absoluteBounds.increment', 0.1),
      schedules: { max: 48, minutesIncrement: 30 },
    },
    insulinSensitivityFactor: {
      min: getBgInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.minimum', 10), MGDL_UNITS, bgUnits),
      max: getBgInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.maximum', 500), MGDL_UNITS, bgUnits),
      increment: getBgStepInTargetUnits(getPumpGuardrail(pump, 'insulinSensitivity.absoluteBounds.increment', 1), MGDL_UNITS, bgUnits),
      schedules: { max: 48, minutesIncrement: 30 },
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

export const dependantFields = {
  'initialSettings.glucoseSafetyLimit': [
    'initialSettings.bloodGlucoseTargetSchedule.$.low',
    'initialSettings.bloodGlucoseTargetSchedule.$.high',
    'initialSettings.bloodGlucoseTargetPreprandial.low',
    'initialSettings.bloodGlucoseTargetPreprandial.high',
    'initialSettings.bloodGlucoseTargetPhysicalActivity.low',
    'initialSettings.bloodGlucoseTargetPhysicalActivity.high',
  ],
  'initialSettings.bloodGlucoseTargetSchedule.low': ['initialSettings.glucoseSafetyLimit'],
  'initialSettings.bloodGlucoseTargetPreprandial.low': ['initialSettings.glucoseSafetyLimit'],
  'initialSettings.bloodGlucoseTargetPhysicalActivity.low': ['initialSettings.glucoseSafetyLimit'],
  'initialSettings.basalRateSchedule.rate': ['initialSettings.basalRateMaximum.value'],
  'initialSettings.carbohydrateRatioSchedule.amount': ['initialSettings.basalRateMaximum.value'],
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
export const defaultValues = (pump, bgUnits = defaultUnits.bloodGlucose, values = {}, touched = {}) => {
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
  const isPalmtree = pump.id === deviceIdMap.palmtree;

  let bloodGlucoseTarget = {
    low: getBgInTargetUnits(100, MGDL_UNITS, bgUnits),
    high: getBgInTargetUnits(105, MGDL_UNITS, bgUnits),
  };

  if (isPalmtree) {
    bloodGlucoseTarget = {
      low: getBgInTargetUnits(115, MGDL_UNITS, bgUnits),
      high: getBgInTargetUnits(125, MGDL_UNITS, bgUnits),
    };
  } else if (isPediatric) {
    bloodGlucoseTarget = {
      low: getBgInTargetUnits(100, MGDL_UNITS, bgUnits),
      high: getBgInTargetUnits(115, MGDL_UNITS, bgUnits),
    };
  }

  return {
    basalRate: recommendedBasalRate || getPumpGuardrail(pump, 'basalRates.defaultValue', undefined),
    basalRateMaximum: isFinite(maxBasalRate) && !touched?.initialSettings?.basalRateMaximum?.value
      ? utils.roundToNearest(
        min([
          parseFloat((maxBasalRate * (isPediatric ? 3 : 3.5))),
          getPumpGuardrail(pump, 'basalRateMaximum.absoluteBounds.maximum', 30)
        ]),
        getPumpGuardrail(pump, 'basalRateMaximum.increment', 0.05)
      ) : getPumpGuardrail(pump, 'basalRateMaximum.defaultValue', 0.05),
    bloodGlucoseTarget,
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
    glucoseSafetyLimit: getBgInTargetUnits(isPediatric || isPalmtree ? 80 : 75, MGDL_UNITS, bgUnits),
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
    recommendedBasalRate: utils.roundToNearest(baseTotalDailyDose / 2 / 24, 0.05),
    recommendedCarbohydrateRatio: utils.roundToNearest(450 / baseTotalDailyDose, 1),
    recommendedInsulinSensitivity: bgUnits === MGDL_UNITS
      ? utils.roundToNearest(1700 / baseTotalDailyDose, 1)
      : utils.roundToNearest(1700 / baseTotalDailyDose / MGDL_PER_MMOLL, 0.1),
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

  const initialValuesSource = {
    ...initialValues,
    ...(status.hydratedValues || {}),
  };

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

export const getFormSteps = (schema, devices, values, handlers, options = {}) => {
  const {
    skippedFields = [],
    isEditable,
    isPrescriber,
    initialFocusedInput,
    isSingleStepEdit,
    stepAsyncState,
  } = options;

  const pumpId = get(values, 'initialSettings.pumpId', deviceIdMap.palmtree);
  const pump = find(devices.pumps, { id: pumpId });

  const allSteps = [
    {
      key: 'account',
      label: t('Create Patient Account'),
      onComplete: isSingleStepEdit ? noop : handlers.stepSubmit,
      asyncState: isSingleStepEdit ? null : stepAsyncState,
      subSteps: [
        {
          fields: ['accountType'],
          hideBack: true,
          onComplete: () => log('Account Type Complete'),
          panelContent: <AccountType />,
        },
        {
          fields: ['firstName', 'lastName', 'birthday'],
          onComplete: () => log('Patient Info Complete'),
          panelContent: <PatientInfo initialFocusedInput={initialFocusedInput} />,
        },
        {
          fields: ['caregiverFirstName', 'caregiverLastName', 'email', 'emailConfirm'],
          onComplete: () => log('Patient Email Complete'),
          panelContent: <PatientEmail initialFocusedInput={initialFocusedInput} />,
        },
      ],
    },
    {
      key: 'profile',
      label: t('Complete Patient Profile'),
      onComplete: isSingleStepEdit ? noop : handlers.stepSubmit,
      asyncState: isSingleStepEdit ? null : stepAsyncState,
      subSteps: [
        {
          fields: ['phoneNumber.number'],
          onComplete: () => log('Patient Phone Number Complete'),
          panelContent: <PatientPhone />
        },
        {
          fields: ['mrn'],
          onComplete: () => log('Patient MRN Complete'),
          panelContent: <PatientMRN />,
        },
        {
          fields: ['sex'],
          onComplete: () => log('Patient Gender Complete'),
          panelContent: <PatientGender />,
        },
        {
          fields: ['initialSettings.pumpId', 'initialSettings.cgmId'],
          onComplete: () => log('Patient Devices Complete'),
          panelContent: <PatientDevices devices={devices} initialFocusedInput={initialFocusedInput} />,
        },
      ],
    },
    {
      key: 'calculator',
      label: t('Therapy Settings Calculator'),
      optional: true,
      onSkip: handlers.clearCalculator,
      onEnter: handlers.goToFirstSubStep,
      onComplete: handlers.stepSubmit,
      asyncState: stepAsyncState,
      subSteps: [
        {
          fields: ['calculator.method'],
          onComplete: () => log('Calculator Method Complete'),
          panelContent: <CalculatorMethod onMethodChange={() => {
            handlers.clearCalculatorInputs();
            handlers.clearCalculatorResults();
          }} />,
        },
        {
          fields: [
            'calculator.totalDailyDose',
            'calculator.totalDailyDoseScaleFactor',
            'calculator.weight',
            'calculator.weightUnits',
            'calculator.recommendedBasalRate',
            'calculator.recommendedInsulinSensitivity',
            'calculator.recommendedCarbohydrateRatio',
          ],
          onComplete: () => log('Calculator Inputs Complete'),
          panelContent: <CalculatorInputs schema={schema} />
        },
      ],
    },
    {
      key: 'therapySettings',
      label: t('Enter Therapy Settings'),
      onComplete: isSingleStepEdit ? noop : handlers.stepSubmit,
      asyncState: isSingleStepEdit ? null : stepAsyncState,
      subSteps: [
        {
          fields: [
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
          panelContent: <TherapySettings pump={pump} skippedFields={skippedFields} />,
        },
      ],
    },
    {
      key: 'review',
      label: t('Review and {{action}} Tidepool Loop Start Order', { action: isPrescriber ? 'Send' : 'Save' }),
      onComplete: handlers.stepSubmit,
      asyncState: stepAsyncState,
      subSteps: [
        {
          fields: ['therapySettingsReviewed'],
          completeText: t('{{action}} Tidepool Loop Start Order', { action: isPrescriber ? 'Send Final' : 'Save Pending' }),
          panelContent: <PrescriptionReview devices={devices} handlers={handlers} isEditable={isEditable} skippedFields={skippedFields} />
        },
      ],
    },
  ];

  const addCommonStepProps = step => ({
    ...step,
    completeText: isSingleStepEdit ? t('Update and Review') : step.completeText,
    backText: isSingleStepEdit ? t('Cancel Update') : step.backText,
    hideBack: isSingleStepEdit ? false : step.hideBack,
    disableBack: isSingleStepEdit ? false : step.disableBack,
    onComplete: isSingleStepEdit ? handlers.singleStepEditComplete : step.onComplete,
    onBack: isSingleStepEdit ? handlers.singleStepEditComplete.bind(null, true) : step.onBack,
  });

  const enabledFields = [];

  const formSteps = reduce(allSteps, (result, step) => {
    if (includes(skippedFields, step.key)) return result;

    const subSteps = reduce(step.subSteps, (subStepResult, subStep) => {
      const fields = reject(subStep.fields, field => includes(skippedFields, field) || includes(skippedFields, field.split('.')[0]));
      if (!fields.length) return subStepResult;

      enabledFields.push(...fields);

      let disableComplete = !fieldsAreValid(fields, schema, values);

      if (!disableComplete) {
        if (includes(fields, 'calculator.method')) {
          disableComplete = isEmpty(get(values, 'calculator.method'));
        }
        if (includes(fields, 'therapySettingsReviewed')) {
          disableComplete = !fieldsAreValid(enabledFields, schema, values);
        }
      }

      subStepResult.push(addCommonStepProps({
        ...subStep,
        fields,
        disableComplete,
      }));

      return subStepResult;
    }, []);

    if (subSteps.length) result.push(addCommonStepProps({
      ...step,
      subSteps,
    }));

    return result;
  }, []);

  return formSteps;
};

export const getFieldStepMap = steps => reduce(steps, (fieldMap, step, stepIndex) => {
  each(map(step.subSteps, 'fields'), (fieldsArr, subStepIndex) => {
    each(fieldsArr, field => {
      fieldMap[field] = [stepIndex, subStepIndex];
    });
  });

  return fieldMap;
}, {});
