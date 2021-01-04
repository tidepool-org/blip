import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box, Flex, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import compact from 'lodash/compact';
import find from 'lodash/find';
import flattenDeep from 'lodash/flattenDeep';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import capitalize from 'lodash/capitalize';
import isArray from 'lodash/isArray';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import { components as vizComponents } from '@tidepool/viz';

import { fieldsAreValid, getThresholdWarning, getFieldError } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import { insulinModelOptions, stepValidationFields, warningThresholds } from './prescriptionFormConstants';
import i18next from '../../core/language';
import { convertMsPer24ToTimeString } from '../../core/datetime';
import { Body1, Headline, Paragraph1 } from '../../components/elements/FontStyles';
import Checkbox from '../../components/elements/Checkbox';
import Icon from '../../components/elements/Icon';
import baseTheme from '../../themes/baseTheme';
import PopoverLabel from '../../components/elements/PopoverLabel';

import {
  fieldsetStyles,
  checkboxStyles,
} from './prescriptionFormStyles';

const { ClipboardButton } = vizComponents;
const t = i18next.t.bind(i18next);
const log = bows('PrescriptionReview');

const fieldsetPropTypes = {
  ...BoxProps,
  pump: PropTypes.object,
  t: PropTypes.func.isRequired,
};

const emptyValueText = t('Not specified');

const patientRows = values => {
  const formikContext = useFormikContext();

  return [
    {
      label: t('Email'),
      value: get(values, 'email', emptyValueText),
      error: getFieldError('email', formikContext, true),
      step: [0, 2],
    },
    {
      label: t('Mobile Number'),
      value: get(values, 'phoneNumber.number', emptyValueText),
      error: getFieldError('phoneNumber.number', formikContext, true),
      step: [1, 0],
    },
    {
      label: t('Type of Account'),
      value: get(values, 'accountType') ? capitalize(values.accountType) : emptyValueText,
      error: getFieldError('accountType', formikContext, true),
      step: [0, 0],
    },
    {
      label: t('Birthdate'),
      value: get(values, 'birthday', emptyValueText),
      error: getFieldError('birthday', formikContext, true),
      step: [0, 1],
      initialFocusedInput: 'birthday',
    },
    {
      label: t('Gender'),
      value: get(values, 'sex') ? capitalize(values.sex) : emptyValueText,
      error: getFieldError('sex', formikContext, true),
      step: [1, 2],
    },
    {
      label: t('MRN'),
      value: get(values, 'mrn', emptyValueText),
      error: getFieldError('mrn', formikContext, true),
      step: [1, 1],
    },
  ];
};

const therapySettingsRows = (pump) => {
  const formikContext = useFormikContext();
  const { values } = formikContext;
  const bgUnits = get(values, 'initialSettings.bloodGlucoseUnits');
  const thresholds = warningThresholds(pump, bgUnits, values);

  return [
    {
      id: 'cpt-training',
      label: t('CPT Training Required'),
      value: (() => {
        if (!values.training) return emptyValueText;
        return values.training === 'inModule' ? t('Not required') : t('Required');
      })(),
      error: getFieldError('training', formikContext, true),
    },
    {
      id: 'glucose-safety-limit',
      label: t('Glucose Safety Limit'),
      value: (() => {
        if (!get(values, 'initialSettings.glucoseSafetyLimit')) return emptyValueText;
        return `${values.initialSettings.glucoseSafetyLimit} ${bgUnits}`;
      })(),
      warning: getThresholdWarning(get(values, 'initialSettings.glucoseSafetyLimit'), thresholds.glucoseSafetyLimit),
      error: getFieldError('initialSettings.glucoseSafetyLimit', formikContext, true),
    },
    {
      id: 'correction-range',
      label: t('Correction Range'),
      value: map(
        get(values, 'initialSettings.bloodGlucoseTargetSchedule'),
        ({ high, low, start }) => `${convertMsPer24ToTimeString(start)}: ${low} - ${high} ${bgUnits}`
      ),
      warning: map(
        get(values, 'initialSettings.bloodGlucoseTargetSchedule'),
        (val) => {
          const warnings = [];
          const lowWarning = getThresholdWarning(val.low, thresholds.bloodGlucoseTarget);
          const highWarning = getThresholdWarning(val.high, thresholds.bloodGlucoseTarget);

          if (lowWarning) warnings.push(t('Lower Target: {{lowWarning}}', { lowWarning }));
          if (highWarning) warnings.push(t('Upper Target: {{highWarning}}', { highWarning }));

          return warnings.length ? warnings : null;
        }
      ),
      error: map(
        get(values, 'initialSettings.bloodGlucoseTargetSchedule'),
        (val, index) => {
          const errors = [];
          const lowError = getFieldError(`initialSettings.bloodGlucoseTargetSchedule.${index}.low`, formikContext, true);
          const highError = getFieldError(`initialSettings.bloodGlucoseTargetSchedule.${index}.high`, formikContext, true);

          if (lowError) errors.push(lowError);
          if (highError) errors.push(highError);

          return errors.length ? errors : null;
        }
      ),
    },
    {
      id: 'premeal-range',
      label: t('Pre-meal Correction Range'),
      value: (() => {
        const lowValue = get(values, 'initialSettings.bloodGlucoseTargetPreprandial.low');
        const highValue = get(values, 'initialSettings.bloodGlucoseTargetPreprandial.high');
        return (lowValue && highValue) ? `${lowValue} - ${highValue} ${bgUnits}` : emptyValueText;
      })(),
      warning: (() => {
        const warnings = [];
        const lowWarning = getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPreprandial.low'), thresholds.bloodGlucoseTargetPreprandial);
        const highWarning = getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPreprandial.high'), thresholds.bloodGlucoseTargetPreprandial);

        if (lowWarning) warnings.push(t('Lower Target: {{lowWarning}}', { lowWarning }));
        if (highWarning) warnings.push(t('Upper Target: {{highWarning}}', { highWarning }));

        return warnings.length ? warnings : null;
      })(),
      error: (() => {
        const errors = [];
        const lowError = getFieldError('initialSettings.bloodGlucoseTargetPreprandial.low', formikContext, true);
        const highError = getFieldError('initialSettings.bloodGlucoseTargetPreprandial.high', formikContext, true);

        if (lowError) errors.push(lowError);
        if (highError) errors.push(highError);

        return errors.length ? errors : null;
      })(),
    },
    {
      id: 'workout-range',
      label: t('Workout Correction Range'),
      value: (() => {
        const lowValue = get(values, 'initialSettings.bloodGlucoseTargetPhysicalActivity.low');
        const highValue = get(values, 'initialSettings.bloodGlucoseTargetPhysicalActivity.high');
        return (lowValue && highValue) ? `${lowValue} - ${highValue} ${bgUnits}` : emptyValueText;
      })(),
      warning: (() => {
        const warnings = [];
        const lowWarning = getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPhysicalActivity.low'), thresholds.bloodGlucoseTargetPhysicalActivity);
        const highWarning = getThresholdWarning(get(values,'initialSettings.bloodGlucoseTargetPhysicalActivity.high'), thresholds.bloodGlucoseTargetPhysicalActivity);

        if (lowWarning) warnings.push(t('Lower Target: {{lowWarning}}', { lowWarning }));
        if (highWarning) warnings.push(t('Upper Target: {{highWarning}}', { highWarning }));

        return warnings.length ? warnings : null;
      })(),
      error: (() => {
        const errors = [];
        const lowError = getFieldError('initialSettings.bloodGlucoseTargetPhysicalActivity.low', formikContext, true);
        const highError = getFieldError('initialSettings.bloodGlucoseTargetPhysicalActivity.high', formikContext, true);

        if (lowError) errors.push(lowError);
        if (highError) errors.push(highError);

        return errors.length ? errors : null;
      })(),
    },
    {
      id: 'carb-ratio-schedule',
      label: t('Insulin to Carbohydrate Ratios'),
      value: map(
        get(values, 'initialSettings.carbohydrateRatioSchedule'),
        ({ amount, start }) => `${convertMsPer24ToTimeString(start)}: ${amount} g/U`
      ),
      warning: map(
        get(values, 'initialSettings.carbohydrateRatioSchedule'),
        (val) => getThresholdWarning(val.amount, thresholds.carbRatio)
      ),
      error: map(
        get(values, 'initialSettings.carbohydrateRatioSchedule'),
        (val, index) => getFieldError(`initialSettings.carbohydrateRatioSchedule.${index}.amount`, formikContext, true)
      ),
    },
    {
      id: 'basal-schedule',
      label: t('Basal Rates'),
      value: map(
        get(values, 'initialSettings.basalRateSchedule'),
        ({ rate, start }) => `${convertMsPer24ToTimeString(start)}: ${rate} U/hr`
      ),
      warning: map(
        get(values, 'initialSettings.basalRateSchedule'),
        (val) => getThresholdWarning(val.rate, thresholds.basalRate)
      ),
      error: map(
        get(values, 'initialSettings.basalRateSchedule'),
        (val, index) => getFieldError(`initialSettings.basalRateSchedule.${index}.rate`, formikContext, true)
      ),
    },
    {
      id: 'delivery-limits',
      label: t('Delivery Limits'),
      value: (() => {
        const deliveryLimits = [];

        if (get(values, 'initialSettings.basalRateMaximum.value')) {
          deliveryLimits.push(t('Max Basal: {{value}}', { value: `${values.initialSettings.basalRateMaximum.value} U/hr` }));
        }

        if (get(values, 'initialSettings.bolusAmountMaximum.value')) {
          deliveryLimits.push(t('Max Bolus: {{value}}', { value: `${values.initialSettings.bolusAmountMaximum.value} U` }));
        }
        return deliveryLimits;
      })(),
      warning: [
        getThresholdWarning(get(values, 'initialSettings.basalRateMaximum.value'), thresholds.basalRateMaximum),
        getThresholdWarning(get(values, 'initialSettings.bolusAmountMaximum.value'), thresholds.bolusAmountMaximum),
      ],
      error: [
        getFieldError('initialSettings.basalRateMaximum.value', formikContext, true),
        getFieldError('initialSettings.bolusAmountMaximum.value', formikContext, true),
      ],
    },
    {
      id: 'insulin-model',
      label: t('Insulin Model'),
      value: (() => {
        if (!get(values, 'initialSettings.insulinModel')) return emptyValueText;
        return get(find(insulinModelOptions, { value: get(values, 'initialSettings.insulinModel') }), 'label', '');
      })(),
      error: getFieldError('initialSettings.insulinModel', formikContext, true),
    },
    {
      id: 'isf-schedule',
      label: t('Insulin Sensitivity Factor'),
      value: map(
        get(values, 'initialSettings.insulinSensitivitySchedule'),
        ({ amount, start }) => `${convertMsPer24ToTimeString(start)}: ${amount} ${bgUnits}`
      ),
      warning: map(
        get(values, 'initialSettings.insulinSensitivitySchedule'),
        (val) => getThresholdWarning(val.amount, thresholds.insulinSensitivityFactor)
      ),
      error: map(
        get(values, 'initialSettings.insulinSensitivitySchedule'),
        (val, index) => getFieldError(`initialSettings.insulinSensitivitySchedule.${index}.amount`, formikContext, true)
      ),
    },
  ];
};

export const PatientInfo = props => {
  const {
    t,
    handlers: { activeStepUpdate },
    ...themeProps
  } = props;

  const initialFocusedInputRef = useInitialFocusedInput();

  const nameStep = [0, 1];
  const currentStep = [3, 0];

  const { values } = useFormikContext();

  const {
    firstName,
    lastName,
  } = values;

  const patientName = [firstName, lastName].join(' ');
  const rows = patientRows(values);

  const Row = ({ label, value, step, initialFocusedInput, error }) => (
    <Flex mb={4} justifyContent="space-between" alignItems="center">
      <Body1>{label}</Body1>
      <Box>
        <Flex alignItems="center">
          <Body1 mr={3} color={error ? 'feedback.danger' : 'text.primary'}>{value}</Body1>
          <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit {{label}}', { label })}
            title={t('Edit {{label}}', { label })}
            onClick={() => activeStepUpdate(step, currentStep, initialFocusedInput)}
          />
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <Box {...themeProps}>
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Headline color={(firstName && lastName) ? 'text.primary' : 'feedback.danger'} mr={2}>{patientName}</Headline>
        <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit Patient Name')}
            title={t('Edit Patient Name')}
            onClick={() => activeStepUpdate(nameStep, currentStep)}
            innerRef={initialFocusedInputRef}
          />
      </Flex>
      {map(rows, (row, index) => <Row {...row} key={index} />)}
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const TherapySettings = props => {
  const {
    t,
    handlers: { activeStepUpdate, generateTherapySettingsOrderText, handleCopyTherapySettingsClicked },
    pump,
    ...themeProps
  } = props;

  const therapySettingsStep = [2, 0];
  const currentStep = [3, 0];

  const { values } = useFormikContext();

  const {
    firstName,
    lastName,
  } = values;

  const patientName = [firstName, lastName].join(' ');

  const rows = therapySettingsRows(pump);

  const Row = ({ label, value, warning, id, index, error }) => {
    let rowValues = isArray(value) ? value : [value];
    if (isEmpty(rowValues)) rowValues = [emptyValueText];

    const warnings = compact(isArray(warning) ? warning : [warning]);
    const errors = compact(isArray(error) ? error : [error]);

    let valueColor = 'text.primary';
    if (errors.length || warnings.length) valueColor = errors.length ? 'feedback.danger' : 'feedback.warning';

    return (
      <Flex
        py={3}
        sx={{
          borderTop: index === 0 ? 'default' : 'none',
          borderBottom: 'default',
        }}
        alignItems="flex-start"
      >
        <Body1 flex="1">{label}</Body1>
        <Box flex="1">
          {map(rowValues, (val, i) => (
            <Flex key={i}>
              <Body1 color={valueColor} key={i} flexGrow={1}>{val}</Body1>
              {errors[i] && (
                <PopoverLabel
                  id={`${id}-${i}`}
                  width="auto"
                  popoverContent={(
                    <Box p={3}>
                      {map(isArray(errors[i]) ? errors[i] : errors, (message, i) => <Paragraph1 key={i}>{message}</Paragraph1>)}
                    </Box>
                  )}
                />
              )}
              {!errors[i] && warnings[i] && (
                <PopoverLabel
                  id={`${id}-${i}`}
                  width="auto"
                  popoverContent={(
                    <Box p={3}>
                      {map(isArray(warnings[i]) ? warnings[i] : warnings, (message, i) => <Paragraph1 key={i}>{message}</Paragraph1>)}
                    </Box>
                  )}
                />
              )}
            </Flex>
          ))}
        </Box>
      </Flex>
    );
  };

  return (
    <Box {...themeProps}>
      <Flex mb={3} alignItems="center" justifyContent="space-between">
        <Headline mr={2}>{t('Confirm Therapy Settings')}</Headline>
        <Box
          theme={baseTheme}
          sx={{
            button: {
              border: 'none',
              color: 'text.primary',
              paddingRight: 0,
              '&:hover,&:active': {
                border: 'none',
                color: 'text.primary',
                backgroundColor: 'transparent',
              },
            },
            '.success': {
              padding: '.25em 0 0',
              display: 'block',
              fontSize: '1.5em',
              textAlign: 'center',
              lineHeight: '1.125em',
            },
          }}
        >
          <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit therapy settings')}
            title={t('Edit therapy settings')}
            onClick={() => activeStepUpdate(therapySettingsStep, currentStep)}
          />

          <ClipboardButton
            buttonTitle={t('Copy therapy settings order as text')}
            buttonText={(
              <Icon
                variant="button"
                icon={FileCopyRoundedIcon}
                label={t('Copy therapy settings order as text')}
                title={t('Copy therapy settings order as text')}
              />
            )}
            successText={<span className="success">{t('✓')}</span>}
            onClick={handleCopyTherapySettingsClicked}
            getText={generateTherapySettingsOrderText.bind(null, [
              {
                label: t('Name'),
                value: patientName,
              },
              ...patientRows(values),
            ], therapySettingsRows(pump, values))}
          />
        </Box>
      </Flex>

      <Box mb={4} as={Body1}>{t('Are you sure you want to start {{patientName}} with the below therapy settings order?', { patientName })}</Box>

      <Box mb={4}>
        {map(rows, (row, index) => <Row {...row} index={index} key={index} />)}
      </Box>

      <Box mb={4}>
        <FastField
          as={Checkbox}
          id="therapySettingsReviewed"
          name="therapySettingsReviewed"
          checked={!!values.therapySettingsReviewed}
          required
          label={t('I have confirmed the therapy settings order for this patient')}
          {...checkboxStyles}
        />
      </Box>
    </Box>
  );
};

TherapySettings.propTypes = fieldsetPropTypes;

export const PrescriptionReview = translate()(props => {
  const { validateForm, values } = useFormikContext();

  // We consider the form fields to be ready for submission, so we validate the entire form when
  // values load to ensure that any error states can be shown to the user.
  React.useEffect(() => {
    validateForm();
  }, [values]);

  return (
    <Flex
      flexWrap="wrap"
      margin="auto"
      maxWidth="1280px"
    >
      <PatientInfo
        {...fieldsetStyles}
        flex="0 0 auto"
        alignSelf="flex-start"
        mb={4}
        px={4}
        py={3}
        width={[1, 1, 0.45, 0.35]}
        sx={{
          border: 'default',
        }}
        {...props}
      />
      <TherapySettings
        {...fieldsetStyles}
        flex="0 0 auto"
        mb={4}
        pr={[4, 4, 0, 0]}
        pl={[4, 4, 5, 7]}
        py={3}
        width={[1, 1, 0.55, 0.65]}
        {...props}
      />
    </Flex>
  );
});

const reviewFormStep = (schema, pump, handlers, values) => ({
  label: t('Review and Save Prescription'), // TODO: [Save | Send] depending on clinician role once implemented in backend
  completeText: t('Save Prescription'), // TODO: [Save | Send] depending on clinician role once implemented in backend
  disableComplete: !fieldsAreValid(flattenDeep(stepValidationFields), schema, values),
  panelContent: <PrescriptionReview pump={pump} handlers={handlers} />
});

export default reviewFormStep;
