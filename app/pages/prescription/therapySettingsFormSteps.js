import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField } from 'formik';
import { Box, Text, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import get from 'lodash/get';

import { fieldsAreValid, getFieldError, getCondensedUnits } from '../../core/forms';
import i18next from '../../core/language';
import { Body2, Headline, OrderedList, Title } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import PopoverLabel from '../../components/elements/PopoverLabel';
import TextInput from '../../components/elements/TextInput';
import {
  deviceMeta,
  defaultUnits,
  insulinTypeOptions,
  trainingOptions,
} from './prescriptionFormConstants';

import {
  inputStyles,
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
          pumpType: get(deviceMeta(pumpType), 'manufacturerName')
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

  const cgmType = meta.initialSettings.cgmType.value;
  const cgmMeta = deviceMeta(cgmType)

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Title mb={3}>{t('Glucose Settings')}</Title>
      <Box px={3}>
        <PopoverLabel
            id='suspend-threshold'
            label={t('Suspend Threshold')}
            mb={2}
            popoverContent={(
              <Box p={3}>
                <Body2>
                  {t('The suspend threshold is a safety feature of the loop algorithm which affects both bolus and basal recommendations by Loop. If any predicted blood glucose is below this threshold, the Loop algorithm will issue a temporary basal rate of 0 U/hr')}
                </Body2>
              </Box>
            )}
          />
          <FastField
            as={TextInput}
            type="number"
            id="initialSettings.suspendThreshold.value"
            name="initialSettings.suspendThreshold.value"
            suffix={meta.initialSettings.bloodGlucoseUnits.value}
            error={getFieldError(meta.initialSettings.suspendThreshold)}
            {...cgmMeta.ranges.suspendThreshold}
            {...inputStyles}
          />
      </Box>
    </Box>
  );
};

GlucoseSettings.propTypes = fieldsetPropTypes;

export const InsulinSettings = props => {
  const { t, meta, ...themeProps } = props;

  const pumpType = meta.initialSettings.pumpType.value;
  const pumpMeta = deviceMeta(pumpType)

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Title mb={3}>{t('Insulin Settings')}</Title>
      <Box px={3}>
        <PopoverLabel
          id='insulin-model'
          label={t('Insulin Model')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Body2>
                {t('There are two insulin models to choose from which have different insulin activity curves which will affect the amount of active insulin at any given time. Duration of Insulin Activity for both models is 6 hours.')}
              </Body2>
              <Body2>
                <OrderedList>
                  <li>
                    {t('Rapid-Acting - Adults insulin model curve peaks at 75 minutes.')}
                  </li>
                  <li>
                    {t('Rapid-Acting - Children curve peaks at 65 minutes.')}
                  </li>
                </OrderedList>
              </Body2>
            </Box>
          )}
        />
        <FastField
          as={RadioGroup}
          variant="horizontal"
          id="initialSettings.insulinType"
          name="initialSettings.insulinType"
          options={insulinTypeOptions}
          error={getFieldError(meta.initialSettings.insulinType)}
          mb={3}
        />

        <PopoverLabel
          id='max-basal'
          label={t('Max Basal')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Body2>
                {t('The maximum basal rate is a safety feature of the Loop algorithm, which prevents the Loop algorithm from issuing a temporary basal rate greater than this amount.')}
              </Body2>
            </Box>
          )}
        />
        <FastField
          as={TextInput}
          type="number"
          id="initialSettings.basalRateMaximum.value"
          name="initialSettings.basalRateMaximum.value"
          suffix={getCondensedUnits(defaultUnits.basalRate)}
          error={getFieldError(meta.initialSettings.basalRateMaximum.value)}
          {...pumpMeta.ranges.basalRateMaximum}
          {...inputStyles}
        />

        <PopoverLabel
          id='max-bolus'
          label={t('Max Bolus')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Body2>
                {t('The maximum bolus parameter governs the maximum amount of bolus insulin that is allowed to be given in any single dose.')}
              </Body2>
            </Box>
          )}
        />
        <FastField
          as={TextInput}
          type="number"
          id="initialSettings.bolusAmountMaximum.value"
          name="initialSettings.bolusAmountMaximum.value"
          suffix={getCondensedUnits(defaultUnits.bolusAmount)}
          error={getFieldError(meta.initialSettings.bolusAmountMaximum.value)}
          {...pumpMeta.ranges.bolusAmountMaximum}
          {...inputStyles}
        />
      </Box>
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
