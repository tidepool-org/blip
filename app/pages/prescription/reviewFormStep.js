import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box, Flex, BoxProps } from 'theme-ui';
import compact from 'lodash/compact';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import reject from 'lodash/reject';
import capitalize from 'lodash/capitalize';
import trim from 'lodash/trim';
import isArray from 'lodash/isArray';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import PrintRoundedIcon from '@material-ui/icons/PrintRounded';
import { components as vizComponents } from '@tidepool/viz';

import { getThresholdWarning, getFieldError } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import { cgmDeviceOptions, dateRegex, getFieldStepMap, insulinModelOptions, pumpDeviceOptions, warningThresholds } from './prescriptionFormConstants';
import i18next from '../../core/language';
import { convertMsPer24ToTimeString } from '../../core/datetime';
import personUtils from '../../core/personutils';
import { useToasts } from '../../providers/ToastProvider';
import { Body1, Headline, Paragraph1 } from '../../components/elements/FontStyles';
import Checkbox from '../../components/elements/Checkbox';
import Icon from '../../components/elements/Icon';
import baseTheme from '../../themes/baseTheme';
import PopoverLabel from '../../components/elements/PopoverLabel';
import Button from '../../components/elements/Button';

import {
  fieldsetStyles,
  checkboxStyles,
} from './prescriptionFormStyles';

const { ClipboardButton } = vizComponents;
const t = i18next.t.bind(i18next);

const fieldsetPropTypes = {
  ...BoxProps,
  pump: PropTypes.object,
  t: PropTypes.func.isRequired,
};

const emptyValueText = t('Not specified');

const patientRows = (devices, formikContext, skippedFields = [], fieldStepMap = {}) => {
  const { values } = formikContext;
  const pumpDevices = pumpDeviceOptions(devices);
  const cgmDevices = cgmDeviceOptions(devices);
  const skipDeviceSelection = cgmDevices.length === 1 && pumpDevices.length === 1;
  const pumpId = get(values, 'initialSettings.pumpId');
  const pump = find(devices.pumps, { id: pumpId })
  const cgmId = get(values, 'initialSettings.cgmId');
  const cgm = find(devices.cgms, { id: cgmId });

  const rows = [
    {
      label: t('Email'),
      value: get(values, 'email', emptyValueText),
      error: getFieldError('email', formikContext, true),
      initialFocusedInput: 'email',
      step: fieldStepMap.email,
    },
    {
      label: t('Mobile Number'),
      value: get(values, 'phoneNumber.number', emptyValueText),
      error: get(values, 'phoneNumber.number') && getFieldError('phoneNumber.number', formikContext, true),
      skipped: includes(skippedFields, 'phoneNumber'),
      step: fieldStepMap['phoneNumber.number'],
    },
    {
      label: t('Type of Account'),
      value: get(values, 'accountType') ? capitalize(values.accountType) : emptyValueText,
      error: getFieldError('accountType', formikContext, true),
      step: fieldStepMap.accountType,
    },
    {
      label: t('Birthdate'),
      value: get(values, 'birthday', emptyValueText).replace(dateRegex, '$2/$3/$1'),
      error: getFieldError('birthday', formikContext, true),
      initialFocusedInput: 'birthday',
      step: fieldStepMap.birthday,
    },
    {
      label: t('Gender'),
      value: get(values, 'sex') ? capitalize(values.sex) : emptyValueText,
      error: getFieldError('sex', formikContext, true),
      step: fieldStepMap.sex,
    },
    {
      label: t('MRN'),
      value: get(values, 'mrn', emptyValueText),
      error: getFieldError('mrn', formikContext, true),
      skipped: includes(skippedFields, 'mrn'),
      step: fieldStepMap.mrn,
    },
    {
      label: t('Insulin Pump'),
      value: get(pump, 'displayName', emptyValueText),
      error: getFieldError('mrn', formikContext, true),
      initialFocusedInput: 'initialSettings.pumpId',
      skipped: skipDeviceSelection || includes(skippedFields, 'initialSettings.pumpId'),
      step: fieldStepMap['initialSettings.pumpId'],
    },
    {
      label: t('Continuous Glucose Monitor'),
      value: get(cgm, 'displayName', emptyValueText),
      error: getFieldError('initialSettings.cgmId', formikContext, true),
      initialFocusedInput: 'initialSettings.cgmId',
      skipped: skipDeviceSelection || includes(skippedFields, 'initialSettings.cgmId'),
      step: fieldStepMap['initialSettings.cgmId'],
    },
    {
      label: t('Activation Code'),
      value: get(values, 'accessCode', emptyValueText),
      skipped: values?.state !== 'submitted',
    },
  ];

  if (values.accountType === 'caregiver') {
    const fullName = personUtils.fullnameFromSplitNames(values.caregiverFirstName, values.caregiverLastName);

    rows.splice(3, 0, {
      label: t('Caregiver Name'),
      value: isEmpty(trim(fullName)) ? emptyValueText : fullName,
      error: getFieldError('caregiverFirstName', formikContext, true) || getFieldError('caregiverLastName', formikContext, true) || isEmpty(values.caregiverFirstName) || isEmpty(values.caregiverLastName),
      initialFocusedInput: 'caregiverFirstName',
      step: fieldStepMap.caregiverFirstName,
    });
  }

  return reject(rows, { skipped: true });
};

const therapySettingsRows = (devices, formikContext, skippedFields = []) => {
  const { values } = formikContext;
  const bgUnits = get(values, 'initialSettings.bloodGlucoseUnits');
  const pumpId = get(values, 'initialSettings.pumpId');
  const pump = find(devices.pumps, { id: pumpId });
  const thresholds = warningThresholds(pump, bgUnits, values);

  const rows = [
    {
      id: 'cpt-training',
      label: t('CPT Training Required'),
      value: (() => {
        if (!values.training) return emptyValueText;
        return values.training === 'inModule' ? t('Not required') : t('Required');
      })(),
      error: getFieldError('training', formikContext, true),
      skipped: includes(skippedFields, 'training'),
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

  return reject(rows, { skipped: true });
};

export const PatientInfo = props => {
  const {
    t,
    currentStep,
    devices,
    fieldStepMap,
    handlers: { activeStepUpdate },
    isEditable,
    skippedFields,
    ...themeProps
  } = props;

  const initialFocusedInputRef = useInitialFocusedInput();

  const nameStep = fieldStepMap.firstName;
  const formikContext = useFormikContext();

  const { values } = formikContext;

  const {
    firstName,
    lastName,
  } = values;

  const patientName = [firstName, lastName].join(' ');
  const rows = patientRows(devices, formikContext, skippedFields, fieldStepMap);

  const Row = ({ label, value, step, initialFocusedInput, error }) => (
    <Flex mb={4} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
      <Body1>{label}</Body1>
      <Box>
        <Flex sx={{ alignItems: 'center' }}>
          <Body1 mr={3} sx={{ color: (isEditable && error) ? 'feedback.danger' : 'text.primary' }}>{value}</Body1>
          {isEditable && <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit {{label}}', { label })}
            title={t('Edit {{label}}', { label })}
            onClick={() => activeStepUpdate(step, currentStep, initialFocusedInput)}
          />}
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <Box {...themeProps}>
      <Flex mb={4} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Headline sx={{ color: (firstName && lastName) || !isEditable ? 'text.primary' : 'feedback.danger' }} mr={2}>{patientName}</Headline>
        {isEditable && <Icon
          variant="button"
          icon={EditRoundedIcon}
          label={t('Edit Patient Name')}
          title={t('Edit Patient Name')}
          onClick={() => activeStepUpdate(nameStep, currentStep)}
          innerRef={initialFocusedInputRef}
        />}
      </Flex>
      {map(rows, (row, index) => <Row {...row} key={index} />)}
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const TherapySettings = props => {
  const {
    t,
    currentStep,
    devices,
    fieldStepMap,
    handlers: {
      activeStepUpdate,
      generateTherapySettingsOrderText,
      handleCopyTherapySettingsClicked,
      handlePrintTherapySettingsClicked,
    },
    isEditable,
    skippedFields,
    ...themeProps
  } = props;

  const therapySettingsStep = fieldStepMap['initialSettings.basalRateSchedule'];

  const [copying, setCopying] = React.useState(false);
  const [printing, setPrinting] = React.useState(false);
  const formikContext = useFormikContext();
  const { values } = formikContext;

  const {
    firstName,
    lastName,
  } = values;

  const patientName = [firstName, lastName].join(' ');

  const rows = therapySettingsRows(devices, formikContext, skippedFields);

  const Row = ({ label, value, warning, id, index, error }) => {
    let rowValues = isArray(value) ? value : [value];
    if (isEmpty(rowValues)) rowValues = [emptyValueText];

    const warnings = isArray(warning) ? warning : [warning];
    const errors = isArray(error) ? error : [error];

    let valueColor = (i) => {
      let color = 'text.primary';
      if (errors[i] || warnings[i]) color = errors[i] ? 'feedback.danger' : 'feedback.warning';
      return color;
    }

    return (
      <Flex
        py={3}
        sx={{
          borderTop: index === 0 ? 'default' : 'none',
          borderBottom: isEditable || (index < rows.length - 1) ? 'default' : 'none',
          alignItems: 'flex-start',
        }}
      >
        <Body1 sx={{ flex: '1' }}>{label}</Body1>
        <Box sx={{ flex: '1' }}>
          {map(rowValues, (val, i) => (
            <Flex key={i}>
              <Body1  key={i} sx={{ flexGrow: 1, color: valueColor(i) }}>{val}</Body1>
              {errors[i] && (
                <PopoverLabel
                  id={`${id}-${i}`}
                  sx={{ width: 'auto' }}
                  popoverContent={(
                    <Box p={3}>
                      {map(compact(isArray(errors[i]) ? errors[i] : [errors[i]]), (message, i) => <Paragraph1 key={i}>{message}</Paragraph1>)}
                    </Box>
                  )}
                />
              )}
              {!errors[i] && warnings[i] && (
                <PopoverLabel
                  id={`${id}-${i}`}
                  sx={{ width: 'auto' }}
                  popoverContent={(
                    <Box p={3}>
                      {map(compact(isArray(warnings[i]) ? warnings[i] : [warnings[i]]), (message, i) => <Paragraph1 key={i}>{message}</Paragraph1>)}
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

  const title = isEditable ? t('Confirm Therapy Settings') : t('Therapy Settings');

  const subtitle = isEditable
    ? t('Are you sure you want to start {{patientName}} with the below therapy settings order?', { patientName })
    : t('The following therapy settings order has been submitted for {{patientName}}', { patientName });

  return (
    <Box {...themeProps}>
      <Flex mb={5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Headline mr={2}>{title}</Headline>
        <Flex
          theme={baseTheme}
          sx={{
            columnGap: 2,
            alignItems: 'center',
          }}
        >
          {isEditable && (
            <Button
              id="edit-therapy-settings"
              variant="secondaryCondensed"
              icon={EditRoundedIcon}
              iconPosition="left"
              iconFontSize="15px"
              label={t('Edit therapy settings')}
              onClick={() => activeStepUpdate(therapySettingsStep, currentStep)}
            >
              {t('Edit')}
            </Button>
          )}

          {!isEditable && (
            <Button
              id="print-therapy-settings-order"
              variant="primaryCondensed"
              icon={PrintRoundedIcon}
              iconPosition="left"
              iconFontSize="15px"
              label={t('Print therapy settings order')}
              processing={printing}
              onClick={() => {
                setPrinting(true);

                handlePrintTherapySettingsClicked(
                  [
                    {
                      label: t('Name'),
                      value: patientName,
                    },
                    ...patientRows(devices, formikContext, skippedFields, fieldStepMap),
                  ],
                  therapySettingsRows(devices, formikContext, skippedFields),
                  pdf => {
                    setPrinting(false);

                    if (pdf?.prescription?.url) {
                      if (self.printWindowRef && !self.printWindowRef.closed) {
                        // If we already have a ref to a PDF window, (re)use it
                        self.printWindowRef.location.href = pdf.prescription.url;
                      } else {
                        // Otherwise, we create and open a new PDF window ref.
                        self.printWindowRef = window.open(pdf.prescription.url);
                      }

                      setTimeout(() => {
                        if (self.printWindowRef) {
                          self.printWindowRef.focus();
                          self.printWindowRef.print();
                        }
                      }, 100);
                    }
                  }
                );
              }}
            >
              {t('Print')}
            </Button>
          )}

          <Button
            p={0}
            id="copy-therapy-settings-order"
            variant="secondaryCondensed"
            icon={copying ? CheckRoundedIcon : FileCopyRoundedIcon}
            iconPosition="left"
            iconFontSize={copying ? '16px' : '14px'}
            label={t('Copy therapy settings order as text')}
            sx={{
              '.icon': { position: 'absolute', left: '16px' },
              button: {
                fontSize: 0,
                borderColor: 'transparent',
                x: 0,
                y: 0,
                color: 'text.primary',
                '&:hover,&:active': {
                  borderColor: 'transparent',
                  color: 'text.primary',
                  backgroundColor: 'transparent',
                },
                py: '6px',
                pr: '16px',
                pl: '38px',
              }
            }}
          >
            <ClipboardButton
              buttonTitle={t('Copy therapy settings order as text')}
              buttonText={t('Copy as Text')}
              successText={t('Copy as Text')}
              onClick={() => {
                setCopying(true);
                handleCopyTherapySettingsClicked();
              }}
              onComplete={() => {
                setCopying(false);
              }}
              getText={generateTherapySettingsOrderText.bind(null, [
                {
                  label: t('Name'),
                  value: patientName,
                },
                ...patientRows(devices, formikContext, skippedFields, fieldStepMap),
              ], therapySettingsRows(devices, formikContext, skippedFields))}
            />
          </Button>
        </Flex>
      </Flex>

      <Box mb={4} as={Body1}>{subtitle}</Box>

      <Box mb={4}>
        {map(rows, (row, index) => <Row {...row} index={index} key={index} />)}
      </Box>

      {isEditable && <Box mb={4}>
        <FastField
          as={Checkbox}
          id="therapySettingsReviewed"
          name="therapySettingsReviewed"
          checked={!!values.therapySettingsReviewed}
          required
          label={t('I have confirmed the therapy settings order for this patient')}
          {...checkboxStyles}
        />
      </Box>}
    </Box>
  );
};

TherapySettings.propTypes = fieldsetPropTypes;

export const PrescriptionReview = withTranslation()(props => {
  const stepperId = 'prescription-form-steps';
  const params = () => new URLSearchParams(location.search);
  const activeStepParamKey = `${stepperId}-step`;
  const activeStepsParam = params().get(activeStepParamKey);
  const activeStep = activeStepsParam ? parseInt(activeStepsParam.split(',')[0], 10) : undefined;
  const activeSubStep = activeStepsParam ? parseInt(activeStepsParam.split(',')[1], 10) : undefined;
  const currentStep = [activeStep, activeSubStep];
  const fieldStepMap = getFieldStepMap(props.steps);

  const { validateForm, values } = useFormikContext();

  // At this point we consider the prescription ready to send so we ensure the values are validated
  // so that we can highlight any fields that are in an invalid state with error styling
  React.useEffect(() => {
    validateForm();
  }, [values]);

  return (
    <Flex
      id="prescription-review-step"
      sx={{
        flexWrap: 'wrap',
        margin: 'auto',
        maxWidth: '1280px',
      }}
    >
      <PatientInfo
        {...fieldsetStyles}
        flex="0 0 auto"
        mb={4}
        px={4}
        py={3}
        sx={{
          ...fieldsetStyles.sx,
          alignSelf: 'flex-start',
          flex: '0 0 auto',
          width: ['100%', null, '45%', '35%'],
          border: 'default',
        }}
        currentStep={currentStep}
        fieldStepMap={fieldStepMap}
        {...props}
      />
      <TherapySettings
        {...fieldsetStyles}
        mb={4}
        pr={[4, 4, 0, 0]}
        pl={[4, 4, 5, 7]}
        pb={3}
        sx={{
          ...fieldsetStyles.sx,
          flex: '0 0 auto',
          width: ['100%', null, '55%', '65%'],
        }}
        currentStep={currentStep}
        fieldStepMap={fieldStepMap}
        {...props}
      />
    </Flex>
  );
});
