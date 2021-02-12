import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField, Field, useFormikContext } from 'formik';
import { Box, Flex, Text, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import each from 'lodash/each';
import get from 'lodash/get';
import map from 'lodash/map';
import max from 'lodash/max';

import { fieldsAreValid, getFieldError, getThresholdWarning } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import i18next from '../../core/language';
import { Paragraph2, Headline, OrderedList, Title } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import PopoverLabel from '../../components/elements/PopoverLabel';
import TextInput from '../../components/elements/TextInput';
import ScheduleForm from './ScheduleForm';

import {
  defaultValues,
  insulinModelOptions,
  pumpRanges,
  roundValueToIncrement,
  shouldUpdateDefaultValue,
  stepValidationFields,
  trainingOptions,
  warningThresholds,
} from './prescriptionFormConstants';

import {
  inlineInputStyles,
  inputStyles,
  fieldsetStyles,
  wideFieldsetStyles,
  borderedFieldsetStyles,
  scheduleGroupStyles,
} from './prescriptionFormStyles';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionTherapySettings');

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
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Headline mb={2}>{t('Tidepool Loop Order Form and Treatment Plan')}</Headline>
      <Text>{firstName} {lastName}</Text>
      <Text>{t('Date of Birth:')} {birthday}</Text>
      <Text>{t('Email:')} {email}</Text>
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const PatientTraining = props => {
  const { t, pump, ...themeProps } = props;
  const initialFocusedInputRef = useInitialFocusedInput();
  const formikContext = useFormikContext();

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
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
      />
    </Box>
  );
};

PatientTraining.propTypes = fieldsetPropTypes;

export const InModuleTrainingNotification = props => {
  const { t, pump, ...themeProps } = props;

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Paragraph2>
        {t('You have selected Tidepool Loop in-app tutorial self start. A request will not be sent for this patient to receive CPT training.')}
      </Paragraph2>
    </Box>
  );
};

InModuleTrainingNotification.propTypes = fieldsetPropTypes;

export const GlucoseSettings = props => {
  const { t, pump, ...themeProps } = props;
  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;
  const ranges = pumpRanges(pump, bgUnits, values);
  const thresholds = warningThresholds(pump, bgUnits, values);

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
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
            setFieldValue('initialSettings.glucoseSafetyLimit', roundValueToIncrement(e.target.value, ranges.glucoseSafetyLimit.increment));
          }}
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
            addButtonText={t('Add an additional correction range')}
            fieldArrayName='initialSettings.bloodGlucoseTargetSchedule'
            fields={[
              {
                label: t('Lower Target'),
                name: 'low',
                suffix: bgUnits,
                threshold: thresholds.bloodGlucoseTarget,
                type: 'number',
                ...ranges.bloodGlucoseTarget,
              },
              {
                label: t('Upper Target'),
                name: 'high',
                suffix: bgUnits,
                threshold: thresholds.bloodGlucoseTarget,
                type: 'number',
                ...ranges.bloodGlucoseTarget,
              },
            ]}
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

        <Flex mb={5} alignItems="flex-start">
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
              setFieldValue('initialSettings.bloodGlucoseTargetPreprandial.low', roundValueToIncrement(e.target.value, ranges.bloodGlucoseTargetPreprandial.increment));
            }}
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
              setFieldValue('initialSettings.bloodGlucoseTargetPreprandial.high', roundValueToIncrement(e.target.value, ranges.bloodGlucoseTargetPreprandial.increment));
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

        <Flex mb={3} alignItems="flex-start">
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
              setFieldValue('initialSettings.bloodGlucoseTargetPhysicalActivity.low', roundValueToIncrement(e.target.value, ranges.bloodGlucoseTargetPhysicalActivity.increment));
            }}
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
              setFieldValue('initialSettings.bloodGlucoseTargetPhysicalActivity.high', roundValueToIncrement(e.target.value, ranges.bloodGlucoseTargetPhysicalActivity.increment));
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
  const { t, pump, ...themeProps } = props;
  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;
  const ranges = pumpRanges(pump, bgUnits, values);
  const thresholds = warningThresholds(pump, bgUnits, values);

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Title mb={3}>{t('Insulin Settings')}</Title>
      <Box px={3}>
        <PopoverLabel
          id='insulin-to-carb-ratios'
          label={t('Insulin to carb ratios')}
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
            addButtonText={t('Add an additional carb ratio')}
            fieldArrayName='initialSettings.carbohydrateRatioSchedule'
            fields={[
              {
                label: t('1 U of insulin covers (g/U)'),
                name: 'amount',
                suffix: t('g/U'),
                threshold: thresholds.carbRatio,
                type: 'number',
                ...ranges.carbRatio,
              },
            ]}
          />
        </Box>

        <PopoverLabel
          id='basal-rates'
          label={t('Basal rates')}
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
            addButtonText={t('Add an additional basal rate')}
            fieldArrayName='initialSettings.basalRateSchedule'
            fields={[
              {
                label: t('Basal rates values (in U/hr)'),
                name: 'rate',
                suffix: t('U/hr'),
                threshold: thresholds.basalRate,
                type: 'number',
                ...ranges.basalRate,
              },
            ]}
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
          error={getFieldError('initialSettings.basalRateMaximum.value', formikContext)}
          warning={getThresholdWarning(get(values,'initialSettings.basalRateMaximum.value'), thresholds.basalRateMaximum)}
          onBlur={e => {
            setFieldTouched('initialSettings.basalRateMaximum.value');
            setFieldValue('initialSettings.basalRateMaximum.value', roundValueToIncrement(e.target.value, ranges.basalRateMaximum.increment));
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
            setFieldValue('initialSettings.bolusAmountMaximum.value', roundValueToIncrement(e.target.value, ranges.bolusAmountMaximum.increment));
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
                {t('You can choose how Tidepool Loop measures the insulin’s peak activity according to one of these two insulin models that you’ll select now.')}
              </Paragraph2>
              <Paragraph2>
                <OrderedList>
                  <li>
                    {t('Rapid-Acting - Adult Model')}<br />
                    {t('This model assumes peak insulin activity at {{minutes}} minutes.', { minutes: 75 })}
                  </li>
                  <li>
                    {t('Rapid-Acting - Child Model')}<br />
                    {t('This model assumes peak insulin activity at {{minutes}} minutes.', { minutes: 65 })}
                  </li>
                </OrderedList>
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

        <PopoverLabel
          id='insulin-sensitivity-factors'
          label={t('Insulin sensitivity factors')}
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
            addButtonText={t('Add an additional insulin sensitivity factor')}
            fieldArrayName='initialSettings.insulinSensitivitySchedule'
            fields={[
              {
                label: t('1 U of insulin decreases BG by'),
                name: 'amount',
                suffix: bgUnits,
                threshold: thresholds.insulinSensitivityFactor,
                type: 'number',
                ...ranges.insulinSensitivityFactor,
              },
            ]}
            useFastField
          />
        </Box>
      </Box>
    </Box>
  );
};

InsulinSettings.propTypes = fieldsetPropTypes;

export const TherapySettings = translate()(props => {
  const formikContext = useFormikContext();

  const {
    setFieldValue,
    values,
  } = formikContext;

  const bgUnits = values.initialSettings.bloodGlucoseUnits;
  const ranges = pumpRanges(props.pump, bgUnits, values);
  const defaults = defaultValues(props.pump, bgUnits, values);
  const maxBasalRate = max(map(get(values, 'initialSettings.basalRateSchedule'), 'rate'));

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
  ];

  each(fieldsWithDefaults, field => {
    React.useEffect(() => {
      if (shouldUpdateDefaultValue(field.path, formikContext)) {
        setFieldValue(field.path, roundValueToIncrement(field.defaultValue, field.increment));
      }
    }, field.dependancies || []);
  });

  return (
    <Box>
      <PatientInfo mb={4} {...props} />
      <PatientTraining mt={0} mb={4} {...props} />
      {values.training === 'inModule' && <InModuleTrainingNotification mt={0} mb={4} {...props} />}
      <GlucoseSettings mt={0} mb={4} {...props} />
      <InsulinSettings mt={0} {...props} />
    </Box>
  );
});

const therapySettingsFormStep = (schema, pump, values) => ({
  label: t('Enter Therapy Settings'),
  disableComplete: !fieldsAreValid(stepValidationFields[3][0], schema, values),
  panelContent: <TherapySettings pump={pump} />
});

export default therapySettingsFormStep;
