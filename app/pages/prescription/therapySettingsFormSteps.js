import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField } from 'formik';
import { Box, Text, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import get from 'lodash/get';

import { fieldsAreValid, getFieldError } from '../../core/forms';
import i18next from '../../core/language';
import { Body2, Headline, Title } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import { deviceSpecificValues, trainingOptions } from './prescriptionFormConstants';

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

export const PatientTraining = props => {
  const { t, meta, ...themeProps } = props;
  const pumpType = meta.initialSettings.pumpType.value;

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Body2>
        {t('Request for certified pump trainer (CPT) in-person training. Required (TBD) for patients new to {{pumpType}}.', {
          pumpType: get(deviceSpecificValues[pumpType], 'manufacturerName')
        })}
      </Body2>
      <FastField
        as={RadioGroup}
        variant="vertical"
        id="training"
        name="training"
        options={trainingOptions}
        error={getFieldError(meta.training)}
      />
    </Box>
  );
};

PatientTraining.propTypes = fieldsetPropTypes;

export const InModuleTrainingNotification = props => {
  const { t, meta, ...themeProps } = props;

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Body2>
        {t('You have selected Tidepool Loop in-app tutorial self start. A request will not be sent for this patient to receive CPT training.')}
      </Body2>
    </Box>
  );
};

InModuleTrainingNotification.propTypes = fieldsetPropTypes;

export const GlucoseSettings = props => {
  const { t, meta, ...themeProps } = props;

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Title>{t('Glucose Settings')}</Title>
    </Box>
  );
};

GlucoseSettings.propTypes = fieldsetPropTypes;

export const InsulinSettings = props => {
  const { t, meta, ...themeProps } = props;

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Title>{t('Insulin Settings')}</Title>
    </Box>
  );
};

InsulinSettings.propTypes = fieldsetPropTypes;

export const TherapySettings = translate()(props => (
  <Box>
    <PatientInfo mb={4} {...props} />
    <PatientTraining mt={0} mb={4} {...props} />
    {props.meta.training.value === 'inModule' && <InModuleTrainingNotification mt={0} mb={4} {...props} />}
    <GlucoseSettings mt={0} mb={4} {...props} />
    <InsulinSettings mt={0} {...props} />
  </Box>
));

const therapySettingsFormSteps = (meta) => ({
  label: t('Enter Therapy Settings'),
  disableComplete: !fieldsAreValid(['training'], meta),
  panelContent: <TherapySettings meta={meta} />
});

export default therapySettingsFormSteps;
