import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField } from 'formik';
import { Box, Flex, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import map from 'lodash/map';
import get from 'lodash/get';
import capitalize from 'lodash/capitalize';
import isArray from 'lodash/isArray';
import EditRoundedIcon from '@material-ui/icons/EditRounded';

import { fieldsAreValid, getFieldError, getThresholdWarning } from '../../core/forms';
import { warningThresholds } from './prescriptionFormConstants';
import i18next from '../../core/language';
import { convertMsPer24ToTimeString } from '../../core/datetime';
import { Body1, Headline, Paragraph1 } from '../../components/elements/FontStyles';
import Checkbox from '../../components/elements/Checkbox';
import Icon from '../../components/elements/Icon';

import {
  fieldsetStyles,
  wideFieldsetStyles,
  borderedFieldsetStyles,
  checkboxStyles,
} from './prescriptionFormStyles';
import PopoverLabel from '../../components/elements/PopoverLabel';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionReview');

const fieldsetPropTypes = {
  ...BoxProps,
  meta: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export const PatientInfo = props => {
  const { t, meta, ...themeProps } = props;

  const {
    firstName,
    lastName,
  } = meta;

  const rows = [
    {
      label: t('Email'),
      value: meta.email.value,
      step: [0, 2],
    },
    {
      label: t('Mobile Number'),
      value: meta.phoneNumber.number.value,
      step: [1, 0],
    },
    {
      label: t('Type of Account'),
      value: capitalize(meta.type.value),
      step: [0, 0],
    },
    {
      label: t('Birthdate'),
      value: meta.birthday.value,
      step: [0, 1],
    },
    {
      label: t('Gender'),
      value: capitalize(meta.sex.value),
      step: [1, 2],
    },
    {
      label: t('MRN'),
      value: meta.mrn.value,
      step: [1, 1]
    },
  ];

  const Row = ({ label, value, step, index }) => (
    <Flex mb={4} justifyContent="space-between" alignItems="center" key={index}>
      <Body1>{label}</Body1>
      <Box>
        <Flex alignItems="center">
          <Body1 mr={1}>{value}</Body1>
          <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit {{label}}', { label })}
            onClick={() => console.log(`go to ${step.join(',')}`)}
          />
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Headline mr={1}>{firstName.value} {lastName.value}</Headline>
        <Icon
            variant="button"
            icon={EditRoundedIcon}
            label={t('Edit Patient Name')}
            onClick={() => console.log(`go to ${[0, 1].join(',')}`)}
          />
      </Flex>
      {map(rows, (row, index) => <Row {...row} index={index} />)}
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const TherapySettings = props => {
  const { t, meta, ...themeProps } = props;
  const bgUnits = meta.initialSettings.bloodGlucoseUnits.value;
  const therapySettingsStep = [2,0];
  const thresholds = warningThresholds(bgUnits);

  const rows = [
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
    {
      id: 'suspend-threshold',
      label: t('Suspend Threshold'),
      value: `${meta.initialSettings.suspendThreshold.value.value} ${bgUnits}`,
      warning: getThresholdWarning(meta.initialSettings.suspendThreshold.value.value, thresholds.suspendThreshold)
    },
    {
      id: 'insulin-model',
      label: t('Insulin Model'),
      value: meta.initialSettings.insulinType.value === 'rapidAdult' ? t('Rapid Acting - Adult') : t('Rapid Acting - Child'),
    },
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
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Flex mb={3} alignItems="center" justifyContent="space-between">
        <Headline>{t('Confirm Therapy Settings')}</Headline>
        <Icon
          variant="button"
          icon={EditRoundedIcon}
          label={t('Edit therapy settings')}
          onClick={() => console.log(`go to ${therapySettingsStep.join(',')}`)}
        />
      </Flex>

      <Box mb={4} as={Body1}>{t('Are you sure you want to start this patient on this therapy settings order?')}</Box>

      <Box mb={4}>
        {map(rows, (row, index) => <Row {...row} index={index} />)}
      </Box>

      <FastField
        as={Checkbox}
        id="therapySettingsReviewed"
        name="therapySettingsReviewed"
        checked={!!meta.therapySettingsReviewed.value}
        label={t('I have confirmed the therapy settings order for this patient')}
        error={getFieldError(meta.therapySettingsReviewed)}
        {...checkboxStyles}
      />
    </Box>
  );
};

TherapySettings.propTypes = fieldsetPropTypes;

export const PrescriptionReview = translate()(props => (
  <Flex>
    <PatientInfo mb={4} {...props} />
    <TherapySettings mb={4} {...props} />
  </Flex>
));

const therapySettingsFormSteps = (meta) => ({
  label: t('Enter Therapy Settings'),
  disableComplete: !fieldsAreValid([
    'therapySettingsReviewed',
  ], meta),
  panelContent: <PrescriptionReview meta={meta} />
});

export default therapySettingsFormSteps;
