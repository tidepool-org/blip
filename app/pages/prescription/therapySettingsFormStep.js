import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField } from 'formik';
import { Box, Text, BoxProps } from 'rebass/styled-components';
import bows from 'bows';

import { fieldsAreValid, getFieldError, getThresholdWarning } from '../../core/forms';
import i18next from '../../core/language';
import { Paragraph2, Headline, OrderedList, Title } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import PopoverLabel from '../../components/elements/PopoverLabel';
import TextInput from '../../components/elements/TextInput';
import ScheduleForm from './ScheduleForm';

import {
  deviceMeta,
  insulinModelOptions,
  stepValidationFields,
  trainingOptions,
  warningThresholds,
} from './prescriptionFormConstants';

import {
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
  const bgUnits = meta.initialSettings.bloodGlucoseUnits.value;
  const pumpId = meta.initialSettings.pumpId.value;
  const pumpMeta = deviceMeta(pumpId, bgUnits);

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Paragraph2>
        {t('Request for certified pump trainer (CPT) in-person training. Required (TBD) for patients new to {{pumpId}}.', {
          pumpId: pumpMeta.manufacturerName,
        })}
      </Paragraph2>
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
      <Paragraph2>
        {t('You have selected Tidepool Loop in-app tutorial self start. A request will not be sent for this patient to receive CPT training.')}
      </Paragraph2>
    </Box>
  );
};

InModuleTrainingNotification.propTypes = fieldsetPropTypes;

export const GlucoseSettings = props => {
  const { t, meta, ...themeProps } = props;
  const bgUnits = meta.initialSettings.bloodGlucoseUnits.value;
  const pumpId = meta.initialSettings.pumpId.value;
  const pumpMeta = deviceMeta(pumpId, bgUnits);
  const thresholds = warningThresholds(bgUnits);

  return (
    <Box {...fieldsetStyles} {...wideFieldsetStyles} {...borderedFieldsetStyles} {...themeProps}>
      <Title mb={3}>{t('Glucose Settings')}</Title>
      <Box px={3}>
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
            fieldArrayMeta={meta.initialSettings.bloodGlucoseTargetSchedule}
            fields={[
              {
                label: t('Lower Target'),
                name: 'low',
                suffix: bgUnits,
                threshold: thresholds.bloodGlucoseTarget,
                type: 'number',
              },
              {
                label: t('Upper Target'),
                name: 'high',
                suffix: bgUnits,
                threshold: thresholds.bloodGlucoseTarget,
                type: 'number',
              },
            ]}
            separator="-"
          />
        </Box>

        <PopoverLabel
            id='suspend-threshold'
            label={t('Suspend Threshold')}
            mb={2}
            popoverContent={(
              <Box p={3}>
                <Paragraph2>
                  {t('When your glucose is predicted to go below this value, the app will recommend a basal rate of 0 U/h and will not recommend a bolus.')}
                </Paragraph2>
              </Box>
            )}
          />
          <FastField
            as={TextInput}
            type="number"
            id="initialSettings.suspendThreshold.value"
            name="initialSettings.suspendThreshold.value"
            suffix={bgUnits}
            error={getFieldError(meta.initialSettings.suspendThreshold.value)}
            warning={getThresholdWarning(meta.initialSettings.suspendThreshold.value.value, thresholds.suspendThreshold)}
            {...pumpMeta.ranges.suspendThreshold}
            {...{ ...inputStyles, themeProps: { mb: 3 }}}
          />
      </Box>
    </Box>
  );
};

GlucoseSettings.propTypes = fieldsetPropTypes;

export const InsulinSettings = props => {
  const { t, meta, ...themeProps } = props;
  const bgUnits = meta.initialSettings.bloodGlucoseUnits.value;
  const pumpId = meta.initialSettings.pumpId.value;
  const pumpMeta = deviceMeta(pumpId, bgUnits);
  const thresholds = warningThresholds(bgUnits);

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
          error={getFieldError(meta.initialSettings.insulinModel)}
          mb={4}
        />

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
        <FastField
          as={TextInput}
          type="number"
          id="initialSettings.basalRateMaximum.value"
          name="initialSettings.basalRateMaximum.value"
          suffix={t('U/hr')}
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
          error={getFieldError(meta.initialSettings.bolusAmountMaximum.value)}
          warning={getThresholdWarning(meta.initialSettings.bolusAmountMaximum.value.value, thresholds.bolusAmountMaximum)}
          {...pumpMeta.ranges.bolusAmountMaximum}
          {...inputStyles}
        />

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
            fieldArrayMeta={meta.initialSettings.basalRateSchedule}
            fields={[
              {
                label: t('Basal rates values (in U/hr)'),
                name: 'rate',
                suffix: t('U/hr'),
                threshold: thresholds.basalRate,
                type: 'number',
                ...pumpMeta.ranges.basalRate,
              },
            ]}
          />
        </Box>

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
            fieldArrayMeta={meta.initialSettings.carbohydrateRatioSchedule}
            fields={[
              {
                label: t('1 U of insulin covers (g/U)'),
                name: 'amount',
                suffix: t('g/U'),
                threshold: thresholds.carbRatio,
                type: 'number',
                ...pumpMeta.ranges.carbRatio,
              },
            ]}
          />
        </Box>

        <PopoverLabel
          id='insulin-sensitivity-factors'
          label={t('Insulin sensitivity factors')}
          mb={2}
          popoverContent={(
            <Box p={3}>
              <Paragraph2>
                {t('Your insulin sensitivity factor (ISF) is the {{bgUnits}} drop in glucose expected from one unit of insulin.', { bgUnits })}
              </Paragraph2>
            </Box>
          )}
        />

        <Box {...scheduleGroupStyles} mb={3}>
          <ScheduleForm
            addButtonText={t('Add an additional insulin sensitivity factor')}
            fieldArrayName='initialSettings.insulinSensitivitySchedule'
            fieldArrayMeta={meta.initialSettings.insulinSensitivitySchedule}
            fields={[
              {
                label: t('1 U of insulin decreases BG by'),
                name: 'amount',
                suffix: bgUnits,
                threshold: thresholds.insulinSensitivityFactor,
                type: 'number',
                ...pumpMeta.ranges.insulinSensitivityFactor,
              },
            ]}
          />
        </Box>
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

const therapySettingsFormStep = (meta) => ({
  label: t('Enter Therapy Settings'),
  disableComplete: !fieldsAreValid(stepValidationFields[2][0], meta),
  panelContent: <TherapySettings meta={meta} />
});

export default therapySettingsFormStep;
