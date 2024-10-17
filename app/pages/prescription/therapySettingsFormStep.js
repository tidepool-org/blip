import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { FastField, Field, useFormikContext } from 'formik';
import { Box, Flex, Text, BoxProps } from 'theme-ui';
import each from 'lodash/each';
import get from 'lodash/get';
import includes from 'lodash/includes';
import map from 'lodash/map';
import max from 'lodash/max';
import { default as _values } from 'lodash/values';

import { getFieldError, getThresholdWarning, onChangeWithDependantFields } from '../../core/forms';
import utils from '../../core/utils';
import { useInitialFocusedInput } from '../../core/hooks';
import { Paragraph2, Body2, Headline, Title } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import PopoverLabel from '../../components/elements/PopoverLabel';
import TextInput from '../../components/elements/TextInput';
import ScheduleForm from './ScheduleForm';
import SettingsCalculatorResults from './SettingsCalculatorResults';

import {
  defaultValues,
  dependantFields,
  hasCalculatorResults,
  insulinModelOptions,
  pumpRanges,
  shouldUpdateDefaultValue,
  trainingOptions,
  warningThresholds,
} from './prescriptionFormConstants';

import {
  inlineInputStyles,
  inputStyles,
  wideBorderedFieldsetStyles,
  scheduleGroupStyles,
} from './prescriptionFormStyles';

const fieldsetPropTypes = {
  ...BoxProps,
  t: PropTypes.func.isRequired,
  pump: PropTypes.object,
};

export const PatientInfo = props => {
  const { t, pump, ...themeProps } = props;

  const {
    values: {
      firstName,
      lastName,
      birthday,
      email,
    }
  } = useFormikContext();

  return (
    <Box {...wideBorderedFieldsetStyles} {...themeProps}>
      <Headline mb={2}>{t('Tidepool Loop Order Form and Treatment Plan')}</Headline>
      <Text sx={{ display: 'block' }}>{firstName} {lastName}</Text>
      <Text sx={{ display: 'block' }}>{t('Date of Birth:')} {birthday}</Text>
      <Text sx={{ display: 'block' }}>{t('Email:')} {email}</Text>
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const DefaultCalculatorSettings = props => {
  const { t, pump, ...themeProps } = props;
  const { values } = useFormikContext();
  const totalDailyDose = get(values, 'calculator.totalDailyDose');
  const weight = get(values, 'calculator.weight');
  const weightUnits = get(values, 'calculator.weightUnits');

  return (
    <Box {...wideBorderedFieldsetStyles} {...themeProps}>
      <Body2 mb={3}>
        {t('Recommended default settings from AACE calculator:')}
      </Body2>
      {totalDailyDose && <Text mb={1}><strong>{t('Total Daily Dose:')}</strong> {totalDailyDose} {t('U')}</Text>}
      {weight && <Text mb={1}><strong>{t('Weight:')}</strong> {weight} {weightUnits}</Text>}
      <SettingsCalculatorResults mt={3} />
    </Box>
  );
};

DefaultCalculatorSettings.propTypes = fieldsetPropTypes;

export const PatientTraining = props => {
  const { t, pump, ...themeProps } = props;
  const initialFocusedInputRef = useInitialFocusedInput();
  const formikContext = useFormikContext();

  return (
    <Box {...wideBorderedFieldsetStyles} {...themeProps}>
      <Paragraph2>
        {t('Request for certified pump trainer (CPT) in-person training. Required (TBD) for patients new to {{displayName}}.', {
          displayName: get(pump, 'displayName'),
        })}
      </Paragraph2>
      <FastField
        as={RadioGroup}
        variant="vertical"
        id="training"
        name="training"
        options={trainingOptions}
        error={getFieldError('training', formikContext)}
        innerRef={initialFocusedInputRef}
        onMouseDown={e => e.preventDefault()}
      />
    </Box>
  );
};

PatientTraining.propTypes = fieldsetPropTypes;

export const InModuleTrainingNotification = props => {
  const { t, pump, ...themeProps } = props;

  return (
    <Box {...wideBorderedFieldsetStyles} {...themeProps}>
      <Paragraph2>
        {t('You have selected Tidepool Loop in-app tutorial self start. A request will not be sent for this patient to receive CPT training.')}
      </Paragraph2>
    </Box>
  );
};

InModuleTrainingNotification.propTypes = fieldsetPropTypes;

export const GlucoseSettings = props => {
  const { t, pump, ranges, thresholds, ...themeProps } = props;
  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;
  const { schedules: bloodGlucoseTargetSchedule, ...bloodGlucoseTargetRange } = ranges.bloodGlucoseTarget;

  return (
    <Box {...wideBorderedFieldsetStyles} {...themeProps}>
      <Title mb={3}>{t('Glucose Settings')}</Title>
      <Box px={3}>
        <PopoverLabel
          id='glucose-safety-limit'
          label={t('Glucose Safety Limit')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('When your glucose is predicted to go below this value, the app will recommend a basal rate of 0 U/h and will not recommend a bolus.')}
              </Paragraph2>
            </Box>
          )}
        />
        <Field
          as={TextInput}
          type="number"
          id="initialSettings.glucoseSafetyLimit"
          name="initialSettings.glucoseSafetyLimit"
          suffix={bgUnits}
          error={getFieldError('initialSettings.glucoseSafetyLimit', formikContext)}
          warning={getThresholdWarning(get(values,'initialSettings.glucoseSafetyLimit'), thresholds.glucoseSafetyLimit)}
          onBlur={e => {
            setFieldTouched('initialSettings.glucoseSafetyLimit');
            setFieldValue('initialSettings.glucoseSafetyLimit', utils.roundToNearest(e.target.value, ranges.glucoseSafetyLimit.increment));
          }}
          onChange={onChangeWithDependantFields('initialSettings.glucoseSafetyLimit', dependantFields['initialSettings.glucoseSafetyLimit'], formikContext)}
          step={ranges.glucoseSafetyLimit.increment}
          {...ranges.glucoseSafetyLimit}
          {...{ ...inputStyles, themeProps: { mb: 4 }}}
        />

        <PopoverLabel
          id='correction-range'
          label={t('Correction Range')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('The correction range is the glucose range that you would like the app to correct your glucose to by adjusting insulin dosing.')}
              </Paragraph2>
            </Box>
          )}
        />

        <Box {...scheduleGroupStyles}>
          <ScheduleForm
            addButtonText={t('+ Add an Additional Correction Range')}
            fieldArrayName='initialSettings.bloodGlucoseTargetSchedule'
            fields={[
              {
                dependantFields: dependantFields['initialSettings.bloodGlucoseTargetSchedule.low'],
                label: t('Lower Target'),
                name: 'low',
                suffix: bgUnits,
                threshold: thresholds.bloodGlucoseTarget,
                type: 'number',
                ...bloodGlucoseTargetRange,
              },
              {
                label: t('Upper Target'),
                name: 'high',
                suffix: bgUnits,
                threshold: thresholds.bloodGlucoseTarget,
                type: 'number',
                ...bloodGlucoseTargetRange,
              },
            ]}
            {...bloodGlucoseTargetSchedule}
            separator="-"
          />
        </Box>

        <PopoverLabel
          id='premeal-range'
          label={t('Pre-meal Correction Range')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('The pre-meal correction range is the glucose range that you would like the app to correct your glucose to by adjusting insulin dosing when activated up to one hour before eating so that you begin a meal in a lower target range.')}
              </Paragraph2>
            </Box>
          )}
        />

        <Flex mb={5} sx={{ alignItems: 'flex-start' }}>
          <Field
            as={TextInput}
            label={t('Lower Target')}
            type="number"
            id="initialSettings.bloodGlucoseTargetPreprandial.low"
            name="initialSettings.bloodGlucoseTargetPreprandial.low"
            suffix={bgUnits}
            error={getFieldError('initialSettings.bloodGlucoseTargetPreprandial.low', formikContext)}
            warning={getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPreprandial.low'), thresholds.bloodGlucoseTargetPreprandial)}
            onBlur={e => {
              setFieldTouched('initialSettings.bloodGlucoseTargetPreprandial.low');
              setFieldValue('initialSettings.bloodGlucoseTargetPreprandial.low', utils.roundToNearest(e.target.value, ranges.bloodGlucoseTargetPreprandial.increment));
            }}
            onChange={onChangeWithDependantFields('initialSettings.bloodGlucoseTargetPreprandial.low', dependantFields['initialSettings.bloodGlucoseTargetPreprandial.low'], formikContext)}
            step={ranges.bloodGlucoseTargetPreprandial.increment}
            {...ranges.bloodGlucoseTargetPreprandial}
            {...inlineInputStyles}
          />
          <Text ml={3} mr={1} mt="33px">-</Text>
          <Field
            as={TextInput}
            label={t('Upper Target')}
            type="number"
            id="initialSettings.bloodGlucoseTargetPreprandial.high"
            name="initialSettings.bloodGlucoseTargetPreprandial.high"
            suffix={bgUnits}
            error={getFieldError('initialSettings.bloodGlucoseTargetPreprandial.high', formikContext)}
            warning={getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPreprandial.high'), thresholds.bloodGlucoseTargetPreprandial)}
            onBlur={e => {
              setFieldTouched('initialSettings.bloodGlucoseTargetPreprandial.high');
              setFieldValue('initialSettings.bloodGlucoseTargetPreprandial.high', utils.roundToNearest(e.target.value, ranges.bloodGlucoseTargetPreprandial.increment));
            }}
            step={ranges.bloodGlucoseTargetPreprandial.increment}
            {...ranges.bloodGlucoseTargetPreprandial}
            {...inlineInputStyles}
          />
        </Flex>

        <PopoverLabel
          id='workout-range'
          label={t('Workout Correction Range')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('The workout correction range is the glucose range that you would like the app to correct your glucose to by adjusting insulin dosing when activated before, during, or after physical activity to reduce the risk of low glucose events.')}
              </Paragraph2>
            </Box>
          )}
        />

        <Flex mb={3} sx={{ alignItems: 'flex-start' }}>
          <Field
            as={TextInput}
            label={t('Lower Target')}
            type="number"
            id="initialSettings.bloodGlucoseTargetPhysicalActivity.low"
            name="initialSettings.bloodGlucoseTargetPhysicalActivity.low"
            suffix={bgUnits}
            error={getFieldError('initialSettings.bloodGlucoseTargetPhysicalActivity.low', formikContext)}
            warning={getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPhysicalActivity.low'), thresholds.bloodGlucoseTargetPhysicalActivity)}
            onBlur={e => {
              setFieldTouched('initialSettings.bloodGlucoseTargetPhysicalActivity.low');
              setFieldValue('initialSettings.bloodGlucoseTargetPhysicalActivity.low', utils.roundToNearest(e.target.value, ranges.bloodGlucoseTargetPhysicalActivity.increment));
            }}
            onChange={onChangeWithDependantFields('initialSettings.bloodGlucoseTargetPhysicalActivity.low', dependantFields['initialSettings.bloodGlucoseTargetPhysicalActivity.low'], formikContext)}
            step={ranges.bloodGlucoseTargetPhysicalActivity.increment}
            {...ranges.bloodGlucoseTargetPhysicalActivity}
            {...inlineInputStyles}
          />
          <Text ml={3} mr={1} mt="33px">-</Text>
          <Field
            as={TextInput}
            label={t('Upper Target')}
            type="number"
            id="initialSettings.bloodGlucoseTargetPhysicalActivity.high"
            name="initialSettings.bloodGlucoseTargetPhysicalActivity.high"
            suffix={bgUnits}
            error={getFieldError('initialSettings.bloodGlucoseTargetPhysicalActivity.high', formikContext)}
            warning={getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPhysicalActivity.high'), thresholds.bloodGlucoseTargetPhysicalActivity)}
            onBlur={e => {
              setFieldTouched('initialSettings.bloodGlucoseTargetPhysicalActivity.high');
              setFieldValue('initialSettings.bloodGlucoseTargetPhysicalActivity.high', utils.roundToNearest(e.target.value, ranges.bloodGlucoseTargetPhysicalActivity.increment));
            }}
            step={ranges.bloodGlucoseTargetPhysicalActivity.increment}
            {...ranges.bloodGlucoseTargetPhysicalActivity}
            {...inlineInputStyles}
          />
        </Flex>
      </Box>
    </Box>
  );
};

GlucoseSettings.propTypes = fieldsetPropTypes;

export const InsulinSettings = props => {
  const { t, pump, ranges, thresholds, ...themeProps } = props;
  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;
  const { schedules: carbRatioSchedule, ...carbRatioRange } = ranges.carbRatio;
  const { schedules: basalRateSchedule, ...basalRateRange } = ranges.basalRate;
  const { schedules: insulinSensitivityFactorSchedule, ...insulinSensitivityFactorRange } = ranges.insulinSensitivityFactor;

  return (
    <Box {...wideBorderedFieldsetStyles} {...themeProps}>
      <Title mb={3}>{t('Insulin Settings')}</Title>
      <Box px={3}>
        <PopoverLabel
          id='insulin-to-carb-ratios'
          label={t('Insulin to Carb Ratios')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('Your carb ratio is the number of grams of carbohydrate covered by one unit of insulin.')}
              </Paragraph2>
            </Box>
          )}
        />

        <Box {...scheduleGroupStyles}>
          <ScheduleForm
            addButtonText={t('+ Add an Additional Carb Ratio')}
            fieldArrayName='initialSettings.carbohydrateRatioSchedule'
            fields={[
              {
                dependantFields: dependantFields['initialSettings.carbohydrateRatioSchedule.amount'],
                label: t('1 U of Insulin Covers (g/U)'),
                name: 'amount',
                setDependantsTouched: false,
                suffix: t('g/U'),
                threshold: thresholds.carbRatio,
                type: 'number',
                ...carbRatioRange,
              },
            ]}
            {...carbRatioSchedule}
          />
        </Box>

        <PopoverLabel
          id='basal-rates'
          label={t('Basal Rates')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('Your basal rate of insulin is the number of units per hour that you want to use to cover your background insulin needs.')}
              </Paragraph2>
            </Box>
          )}
        />

        <Box {...scheduleGroupStyles}>
          <ScheduleForm
            addButtonText={t('+ Add an Additional Basal Rate')}
            fieldArrayName='initialSettings.basalRateSchedule'
            fields={[
              {
                dependantFields: dependantFields['initialSettings.basalRateSchedule.rate'],
                label: t('Basal Rate Values (U/hr)'),
                name: 'rate',
                setDependantsTouched: false,
                suffix: t('U/hr'),
                threshold: thresholds.basalRate,
                type: 'number',
                ...basalRateRange,
              },
            ]}
            {...basalRateSchedule}
          />
        </Box>

        <PopoverLabel
          id='insulin-sensitivity-factors'
          label={t('Insulin Sensitivity Factors')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('Your insulin sensitivity factor (ISF) is the {{bgUnits}} drop in glucose expected from one unit of insulin.', { bgUnits })}
              </Paragraph2>
              <Paragraph2>
                {t('If you are unsure, Tidepool’s recommendation is to start with 1700 / TDD.')}
              </Paragraph2>
            </Box>
          )}
        />

        <Box {...scheduleGroupStyles} mb={3}>
          <ScheduleForm
            addButtonText={t('+ Add an Additional Insulin Sensitivity Factor')}
            fieldArrayName='initialSettings.insulinSensitivitySchedule'
            fields={[
              {
                label: t('1 U of Insulin Decreases BG by'),
                name: 'amount',
                suffix: bgUnits,
                threshold: thresholds.insulinSensitivityFactor,
                type: 'number',
                ...insulinSensitivityFactorRange,
              },
            ]}
            {...insulinSensitivityFactorSchedule}
            useFastField
          />
        </Box>

        <PopoverLabel
          id='max-basal'
          label={t('Max Basal')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('Maximum basal rate is the automatically adjusted basal rate that Tidepool Loop is allowed to enact to help reach your correction range.')}
              </Paragraph2>
              <Paragraph2>
                {t('For first time users of an automated system, Tidepool suggests you start with 3x your highest basal rate.')}
              </Paragraph2>
            </Box>
          )}
        />
        <Field
          as={TextInput}
          type="number"
          id="initialSettings.basalRateMaximum.value"
          name="initialSettings.basalRateMaximum.value"
          suffix={t('U/hr')}
          error={getFieldError('initialSettings.basalRateMaximum.value', formikContext, false)}
          warning={getThresholdWarning(get(values,'initialSettings.basalRateMaximum.value'), thresholds.basalRateMaximum)}
          onBlur={e => {
            setFieldTouched('initialSettings.basalRateMaximum.value');
            setFieldValue('initialSettings.basalRateMaximum.value', utils.roundToNearest(e.target.value, ranges.basalRateMaximum.increment));
          }}
          step={ranges.basalRateMaximum.increment}
          {...ranges.basalRateMaximum}
          {...inputStyles}
        />

        <PopoverLabel
          id='max-bolus'
          label={t('Max Bolus')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('Maximum bolus is the highest bolus amount that you will allow Tidepool Loop to recommend at one time to cover carbs or bring down high glucose.')}
              </Paragraph2>
            </Box>
          )}
        />
        <FastField
          as={TextInput}
          type="number"
          id="initialSettings.bolusAmountMaximum.value"
          name="initialSettings.bolusAmountMaximum.value"
          suffix={t('U')}
          error={getFieldError('initialSettings.bolusAmountMaximum.value', formikContext)}
          warning={getThresholdWarning(get(values,'initialSettings.bolusAmountMaximum.value'), thresholds.bolusAmountMaximum)}
          onBlur={e => {
            setFieldTouched('initialSettings.bolusAmountMaximum.value');
            setFieldValue('initialSettings.bolusAmountMaximum.value', utils.roundToNearest(e.target.value, ranges.bolusAmountMaximum.increment));
          }}
          step={ranges.bolusAmountMaximum.increment}
          {...ranges.bolusAmountMaximum}
          {...inputStyles}
        />

        <PopoverLabel
          id='insulin-model'
          label={t('Insulin Model')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('Tidepool Loop assumes that the insulin it has delivered is actively working to lower your glucose for 6 hours. This setting cannot be changed.')}
              </Paragraph2>
              <Paragraph2>
                {t('You can choose how Tidepool Loop measures the insulin’s peak activity according to one of these two insulin models that you\'ll select now.')}
              </Paragraph2>
              <Paragraph2>
                <Box as='ol' variant="lists.ordered">
                  <li>
                    {t('Rapid-Acting - Adult Model')}<br />
                    {t('This model assumes peak insulin activity at {{minutes}} minutes.', { minutes: 75 })}
                  </li>
                  <li>
                    {t('Rapid-Acting - Child Model')}<br />
                    {t('This model assumes peak insulin activity at {{minutes}} minutes.', { minutes: 65 })}
                  </li>
                </Box>
              </Paragraph2>
            </Box>
          )}
        />
        <FastField
          as={RadioGroup}
          variant="horizontal"
          id="initialSettings.insulinModel"
          name="initialSettings.insulinModel"
          options={insulinModelOptions}
          error={getFieldError('initialSettings.insulinModel', formikContext)}
          mb={4}
        />
      </Box>
    </Box>
  );
};

InsulinSettings.propTypes = fieldsetPropTypes;

export const TherapySettings = withTranslation()(props => {
  const formikContext = useFormikContext();

  const {
    setFieldValue,
    touched,
    validateForm,
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;
  const maxBasalRate = max(map(get(values, 'initialSettings.basalRateSchedule'), 'rate'));
  const bloodGlucoseTargetSchedules = get(values, 'initialSettings.bloodGlucoseTargetSchedule');
  const carbohydrateRatioSchedules = get(values, 'initialSettings.carbohydrateRatioSchedule');
  const glucoseSafetyLimit = get(values, 'initialSettings.glucoseSafetyLimit');
  const bloodGlucoseTargetPhysicalActivityLow = get(values, 'initialSettings.bloodGlucoseTargetPhysicalActivity.low');
  const bloodGlucoseTargetPreprandialLow = get(values, 'initialSettings.bloodGlucoseTargetPreprandial.low');

  // Only re-calculate thresholds, ranges, and defaults when relevant dependancy values change
  const thresholds = React.useMemo(() => warningThresholds(props.pump, bgUnits, values), [
    maxBasalRate,
    bloodGlucoseTargetSchedules,
  ]);

  const ranges = React.useMemo(() => pumpRanges(props.pump, bgUnits, values), [
    maxBasalRate,
    carbohydrateRatioSchedules,
    bloodGlucoseTargetSchedules,
    bloodGlucoseTargetPhysicalActivityLow,
    bloodGlucoseTargetPreprandialLow,
    glucoseSafetyLimit,
  ]);

  const defaults = React.useMemo(() => defaultValues(props.pump, bgUnits, values, touched), [
    maxBasalRate,
    touched?.initialSettings?.basalRateMaximum?.value,
    values?.calculator,
  ]);

  const fieldsWithDefaults = [
    {
      path: 'initialSettings.glucoseSafetyLimit',
      defaultValue: defaults.glucoseSafetyLimit,
      increment: ranges.glucoseSafetyLimit.increment,
    },
    {
      path: 'initialSettings.bloodGlucoseTargetSchedule[0].low',
      defaultValue: defaults.bloodGlucoseTarget.low,
      increment: ranges.bloodGlucoseTarget.increment,
    },
    {
      path: 'initialSettings.bloodGlucoseTargetSchedule[0].high',
      defaultValue: defaults.bloodGlucoseTarget.high,
      increment: ranges.bloodGlucoseTarget.increment,
    },
    {
      path: 'initialSettings.bloodGlucoseTargetPhysicalActivity.low',
      defaultValue: defaults.bloodGlucoseTargetPhysicalActivity.low,
      increment: ranges.bloodGlucoseTarget.increment,
    },
    {
      path: 'initialSettings.bloodGlucoseTargetPhysicalActivity.high',
      defaultValue: defaults.bloodGlucoseTargetPhysicalActivity.high,
      increment: ranges.bloodGlucoseTarget.increment,
    },
    {
      path: 'initialSettings.bloodGlucoseTargetPreprandial.low',
      defaultValue: defaults.bloodGlucoseTargetPreprandial.low,
      increment: ranges.bloodGlucoseTarget.increment,
    },
    {
      path: 'initialSettings.bloodGlucoseTargetPreprandial.high',
      defaultValue: defaults.bloodGlucoseTargetPreprandial.high,
      increment: ranges.bloodGlucoseTarget.increment,
    },
    {
      path: 'initialSettings.basalRateMaximum.value',
      defaultValue: defaults.basalRateMaximum,
      increment: ranges.basalRateMaximum.increment,
      dependancies: [maxBasalRate],
    },
    {
      path: 'initialSettings.basalRateSchedule[0].rate',
      defaultValue: defaults.basalRate,
      increment: ranges.basalRate.increment,
    },
    {
      path: 'initialSettings.carbohydrateRatioSchedule[0].amount',
      defaultValue: defaults.carbohydrateRatio,
      increment: ranges.carbRatio.increment,
    },
    {
      path: 'initialSettings.insulinSensitivitySchedule[0].amount',
      defaultValue: defaults.insulinSensitivity,
      increment: ranges.insulinSensitivityFactor.increment,
    },
  ];

  each(fieldsWithDefaults, field => {
    React.useEffect(() => {
      if (field.defaultValue && shouldUpdateDefaultValue(field.path, formikContext)) {
        setFieldValue(field.path, utils.roundToNearest(field.defaultValue, field.increment));
      }
    }, field.dependancies || [field.defaultValue]);
  });

  React.useEffect(() => {
    validateForm();
  }, []);

  return (
    <Box id="therapy-settings-step">
      <PatientInfo mb={4} {...props} />
      {hasCalculatorResults(values) && <DefaultCalculatorSettings mt={0} mb={4} {...props} />}
      {!includes(props.skippedFields, 'training') && <PatientTraining mt={0} mb={4} {...props} />}
      {values.training === 'inModule' && <InModuleTrainingNotification mt={0} mb={4} {...props} />}
      <GlucoseSettings mt={0} mb={4} {...{ ranges, thresholds, ...props }} />
      <InsulinSettings mt={0} {...{ ranges, thresholds, ...props }} />
    </Box>
  );
});
