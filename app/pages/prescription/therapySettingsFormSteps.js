import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Box, Text, BoxProps } from 'rebass/styled-components';
import bows from 'bows';

import { fieldsAreValid } from '../../core/forms';
import i18next from '../../core/language';
import { Headline } from '../../components/elements/FontStyles';

import {
  fieldsetStyles,
  wideFieldsetStyles,
  borderedFieldsetStyles,
} from './prescriptionFormStyles';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionTherapySettings');

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

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Headline mb={2}>{t('Tidepool Loop Order Form and Treatment Plan')}</Headline>
      <Text>{firstName.value} {lastName.value}</Text>
      <Text>{t('Date of Birth:')} {birthday.value}</Text>
      <Text>{t('Email:')} {email.value}</Text>
    </Box>
  );
};

PatientInfo.propTypes = fieldsetPropTypes;

export const TherapySettings = translate()(props => (
  <Box>
    <PatientInfo mb={4} {...props} />
  </Box>
));

const therapySettingsFormSteps = (meta) => ({
  label: t('Enter Therapy Settings'),
  disableComplete: !fieldsAreValid(['phoneNumber.number'], meta),
  panelContent: <TherapySettings meta={meta} />
});

export default therapySettingsFormSteps;
