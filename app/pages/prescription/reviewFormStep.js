import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField } from 'formik';
import { Box, Flex, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import map from 'lodash/map';
import capitalize from 'lodash/capitalize';
import isArray from 'lodash/isArray';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import { components as vizComponents } from '@tidepool/viz';

import { fieldsAreValid, getThresholdWarning } from '../../core/forms';
import { stepValidationFields, warningThresholds } from './prescriptionFormConstants';
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
  meta: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

const patientRows = meta => ([
  {
    label: t('Email'),
    value: meta.email.value,
    step: [0, 1],
  },
  {
    label: t('Mobile Number'),
    value: meta.phoneNumber.number.value,
    step: [1, 0],
  },
  // {
  //   label: t('Type of Account'),
  //   value: capitalize(meta.type.value),
  //   step: [0, 0],
  // },
  {
    label: t('Birthdate'),
    value: meta.birthday.value,
    step: [0, 0],
  },
  {
    label: t('Gender'),
    value: capitalize(meta.sex.value),
    step: [1, 2],
  },
  {
    label: t('MRN'),
    value: meta.mrn.value,
    step: [1, 1],
  },
]);

const therapySettingsRows = meta => {
  const bgUnits = meta.initialSettings.bloodGlucoseUnits.value;
  const thresholds = warningThresholds(bgUnits);

  return [
    {
      id: 'cpt-training',
      label: t('CPT Training Required'),
      value: meta.training.value === 'inModule' ? t('Not required') : t('Required'),
    },
    {
      id: 'correction-range',
      label: t('Correction Range'),
      value: map(
        meta.initialSettings.bloodGlucoseTargetSchedule.value,
        ({ high, low, start }) => `${convertMsPer24ToTimeString(start)}: ${low} - ${high} ${bgUnits}`
      ),
      warning: map(
        meta.initialSettings.bloodGlucoseTargetSchedule.value,
        (val) => {
          const warnings = [];
          const lowWarning = getThresholdWarning(val.low, thresholds.bloodGlucoseTarget);
          const highWarning = getThresholdWarning(val.high, thresholds.bloodGlucoseTarget);

          if (lowWarning) warnings.push(t('Lower Target: {{lowWarning}}', { lowWarning }));
          if (highWarning) warnings.push(t('Upper Target: {{highWarning}}', { highWarning }));

          return warnings.length ? warnings : null;
        }
      ),
    },
    // {
    //   id: 'suspend-threshold',
    //   label: t('Suspend Threshold'),
    //   value: `${meta.initialSettings.suspendThreshold.value.value} ${bgUnits}`,
    //   warning: getThresholdWarning(meta.initialSettings.suspendThreshold.value.value, thresholds.suspendThreshold)
    // },
    // {
    //   id: 'insulin-model',
    //   label: t('Insulin Model'),
    //   value: meta.initialSettings.insulinModel.value === 'rapidAdult' ? t('Rapid Acting - Adult') : t('Rapid Acting - Child'), // TODO: use option labels, and empty string if missing
    // },
    {
      id: 'delivery-limits',
      label: t('Delivery Limits'),
      value: [
        t('Max Basal: {{value}}', { value: `${meta.initialSettings.basalRateMaximum.value.value} U/hr` }),
        t('Max Bolus: {{value}}', { value: `${meta.initialSettings.bolusAmountMaximum.value.value} U` }),
      ],
      warning: [
        null,
        getThresholdWarning(meta.initialSettings.bolusAmountMaximum.value.value, thresholds.bolusAmountMaximum)
      ]
    },
    {
      id: 'basal-schedule',
      label: t('Basal Rates'),
      value: map(
        meta.initialSettings.basalRateSchedule.value,
        ({ rate, start }) => `${convertMsPer24ToTimeString(start)}: ${rate} U/hr`
      ),
      warning: map(
        meta.initialSettings.basalRateSchedule.value,
        (val) => getThresholdWarning(val.rate, thresholds.basalRate)
      ),
    },
    {
      id: 'isf-schedule',
      label: t('Insulin Sensitivity Factor'),
      value: map(
        meta.initialSettings.insulinSensitivitySchedule.value,
        ({ amount, start }) => `${convertMsPer24ToTimeString(start)}: ${amount} ${bgUnits}`
      ),
      warning: map(
        meta.initialSettings.insulinSensitivitySchedule.value,
        (val) => getThresholdWarning(val.amount, thresholds.insulinSensitivityFactor)
      ),
    },
    {
      id: 'carb-ratio-schedule',
      label: t('Insulin to Carbohydrate Ratios'),
      value: map(
        meta.initialSettings.carbohydrateRatioSchedule.value,
        ({ amount, start }) => `${convertMsPer24ToTimeString(start)}: ${amount} g/U`
      ),
      warning: map(
        meta.initialSettings.carbohydrateRatioSchedule.value,
        (val) => getThresholdWarning(val.amount, thresholds.carbRatio)
      ),
    },
  ];
};

export const PatientInfo = props => {
  const {
    t,
    handlers: { activeStepUpdate },
    meta,
    ...themeProps
  } = props;

  const nameStep = [0, 0];
  const currentStep = [3, 0];

  const {
    firstName,
    lastName,
  } = meta;

  const patientName = `${firstName.value} ${lastName.value}`;
  const rows = patientRows(meta);

  const Row = ({ label, value, step, index }) => (
    <Flex mb={4} justifyContent="space-between" alignItems="center" key={index}>
      <Body1>{label}</Body1>
      <Box>
        <Flex alignItems="center">
          <Body1 mr={2}>{value}</Body1>
          <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit {{label}}', { label })}
            onClick={() => activeStepUpdate(step, currentStep)}
          />
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <Box {...themeProps}>
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Headline mr={2}>{patientName}</Headline>
        <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit Patient Name')}
            onClick={() => activeStepUpdate(nameStep, currentStep)}
          />
      </Flex>
      {map(rows, (row, index) => <Row {...row} index={index} />)}
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const TherapySettings = props => {
  const {
    t,
    handlers: { activeStepUpdate, generateTherapySettingsText, handleCopyTherapySettingsClicked },
    meta,
    ...themeProps
  } = props;

  const therapySettingsStep = [2, 0];
  const currentStep = [3, 0];

  const {
    firstName,
    lastName,
  } = meta;

  const patientName = `${firstName.value} ${lastName.value}`;

  const rows = therapySettingsRows(meta);

  const Row = ({ label, value, warning, id, index }) => {
    const values = isArray(value) ? value : [value];
    const warnings = isArray(warning) ? warning: [warning];
    const colors = map(warnings, message => message ? 'feedback.warning' : 'text.primary');

    return (
      <Flex
        py={3}
        sx={{
          borderTop: index === 0 ? 'default' : 'none',
          borderBottom: 'default',
        }}
        alignItems="flex-start"
        key={index}
      >
        <Body1 flex="1">{label}</Body1>
        <Box flex="1">
          {map(values, (val, i) => (
            <Flex>
              <Body1 color={colors[i]} key={i} flexGrow={1}>{val}</Body1>
              {warnings[i] && (
                <PopoverLabel
                  id={`${id}-${i}`}
                  width="auto"
                  popoverContent={(
                    <Box p={3}>
                      {isArray(warnings[i])
                        ? map(warnings[i], message => <Paragraph1>{message}</Paragraph1>)
                        : <Paragraph1>{warnings[i]}</Paragraph1>
                      }
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
        <Icon
          variant="button"
          icon={EditRoundedIcon}
          label={t('Edit therapy settings')}
          onClick={() => activeStepUpdate(therapySettingsStep, currentStep)}
        />
      </Flex>

      <Box mb={4} as={Body1}>{t('Are you sure you want to start this patient on this therapy settings order?')}</Box>

      <Box mb={4}>
        {map(rows, (row, index) => <Row {...row} index={index} />)}
      </Box>

      <Box mb={4}>
        <FastField
          as={Checkbox}
          id="therapySettingsReviewed"
          name="therapySettingsReviewed"
          checked={!!meta.therapySettingsReviewed.value}
          required
          label={t('I have confirmed the therapy settings order for this patient')}
          {...checkboxStyles}
        />
      </Box>

      <Box
        mb={4}
        theme={baseTheme}
        sx={{
          button: {
            border: 'input',
            color: 'text.primary',
            '&:hover,&:active': {
              backgroundColor: 'blueGreyDark',
              borderColor: 'blueGreyDark',
            },
          },
        }}
      >
        <ClipboardButton
          buttonTitle={t('For email or notes')}
          buttonText={t('Copy therapy settings order as text')}
          onSuccess={handleCopyTherapySettingsClicked}
          getText={generateTherapySettingsText.bind(null, [
            {
              label: t('Name'),
              value: patientName,
            },
            ...patientRows(meta),
          ], therapySettingsRows(meta))}
        />
      </Box>
    </Box>
  );
};

TherapySettings.propTypes = fieldsetPropTypes;

export const PrescriptionReview = translate()(props => (
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
));

const reviewFormStep = (meta, handlers) => ({
  label: t('Review and Save Prescription'), // TODO: [Save | Send] depending on clinician role once implemented in backend
  completeText: t('Save Prescription'), // TODO: [Save | Send] depending on clinician role once implemented in backend
  disableComplete: !fieldsAreValid(stepValidationFields[3][0], meta),
  panelContent: <PrescriptionReview meta={meta} handlers={handlers} />
});

export default reviewFormStep;
