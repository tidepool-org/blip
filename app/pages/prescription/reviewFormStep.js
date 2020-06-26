import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box, Text, Flex, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import map from 'lodash/map';

import { fieldsAreValid, getFieldError } from '../../core/forms';
import i18next from '../../core/language';
import { Headline } from '../../components/elements/FontStyles';
import Checkbox from '../../components/elements/Checkbox';

import {
  fieldsetStyles,
  wideFieldsetStyles,
  borderedFieldsetStyles,
  checkboxStyles,
} from './prescriptionFormStyles';

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
    birthday,
    email,
  } = meta;

  const Row = ({label, value, index}) => (
    <Flex justifyContent="space-between" key={index}>
      <Text>{label}</Text>
      <Text>{value}</Text>
    </Flex>
  );

  const rows = [
    { label: t('Email'), value: meta.email.value },
  ];

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Headline mb={2}>{firstName.value} {lastName.value}</Headline>
      {map(rows, row => <Row {...row} />)}
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const TherapySettings = props => {
  const { t, meta, ...themeProps } = props;

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Headline mb={2}>{t('Confirm Therapy Settings')}</Headline>
      <Text>Therapy Settings here :)</Text>
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
