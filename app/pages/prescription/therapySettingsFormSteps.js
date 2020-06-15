import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { FastField, Field } from 'formik';
import { Box, Flex, Text, BoxProps } from 'rebass/styled-components';
import bows from 'bows';
import map from 'lodash/map';
import isInteger from 'lodash/isInteger';
import sortedLastIndexBy from 'lodash/sortedLastIndexBy';
import DeleteOutlineRoundedIcon from '@material-ui/icons/DeleteOutlineRounded';

import { fieldsAreValid, getFieldError, getCondensedUnits } from '../../core/forms';
import i18next from '../../core/language';
import { useFieldArray } from '../../core/hooks';
import { Body2, Headline, OrderedList, Title } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import PopoverLabel from '../../components/elements/PopoverLabel';
import TextInput from '../../components/elements/TextInput';
import Icon from '../../components/elements/Icon';
import Button from '../../components/elements/Button';

import {
  deviceMeta,
  defaultUnits,
  insulinTypeOptions,
  trainingOptions,
} from './prescriptionFormConstants';

import {
  inputStyles,
  inlineInputStyles,
  fieldsetStyles,
  wideFieldsetStyles,
  borderedFieldsetStyles,
} from './prescriptionFormStyles';
import { MS_IN_MIN, MS_IN_HOUR, MS_IN_DAY } from '../../core/constants';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionTherapySettings');

const fieldsetPropTypes = {
  ...BoxProps,
  meta: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

const convertMsPer24ToTimeString = msPer24 => {
  const hours = `0${new Date(msPer24).getUTCHours()}`.slice(-2);
  const minutes = `0${new Date(msPer24).getUTCMinutes()}`.slice(-2);
  return `${hours}:${minutes}`;
};

const convertTimeStringToMsPer24 = timeString => {
  const [hours, minutes] = map(timeString.split(':'), val => parseInt(val, 10));
  return (hours * MS_IN_HOUR) + (minutes * MS_IN_MIN);
}

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
      <Body2>
        {t('Request for certified pump trainer (CPT) in-person training. Required (TBD) for patients new to {{pumpId}}.', {
          pumpId: pumpMeta.manufacturerName,
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
  const bgUnits = meta.initialSettings.bloodGlucoseUnits.value;
  const cgmType = meta.initialSettings.cgmType.value;
  const cgmMeta = deviceMeta(cgmType, bgUnits);

  const [refs, setRefs] = React.useState([]);
  const [focusedId, setFocusedId] = React.useState();

  const [bloodGlucoseTargetSchedule, , { move, remove, replace, push }] = useFieldArray({ name: 'initialSettings.bloodGlucoseTargetSchedule' });
  const schedulesLength = bloodGlucoseTargetSchedule.value.length;

  React.useEffect(() => {
    // add or remove refs as the schedule length changes
    setRefs(refs => (
      Array(schedulesLength).fill().map((_, i) => refs[i] || React.createRef())
    ));
  }, [schedulesLength]);

  React.useEffect(() => {
    isInteger(focusedId) && refs[focusedId].current.focus();
  }, [focusedId]);

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
              <Body2>
                {t('The correction range is the glucose range that you would like the app to correct your glucose to by adjusting insulin dosing.')}
              </Body2>
            </Box>
          )}
        />

        <Box p={3} mb={3} bg="lightestGrey">
          <Box>
            {map(bloodGlucoseTargetSchedule.value, (schedule, index) => (
              <Flex key={index} alignItems="flex-start" mb={3}>
                <Field
                  as={TextInput}
                  label={index === 0 && t('Start Time')}
                  type="time"
                  readOnly={index === 0}
                  step={MS_IN_MIN * 30 / 1000}
                  value={convertMsPer24ToTimeString(schedule.start, 'hh:mm')}
                  onChange={e => {
                    const start = convertTimeStringToMsPer24(e.target.value);
                    const newValue = {...bloodGlucoseTargetSchedule.value[index], start};
                    const valuesCopy = [...bloodGlucoseTargetSchedule.value];
                    valuesCopy.splice(index, 1);
                    const newPos = sortedLastIndexBy(valuesCopy, newValue, function(o) { return o.start; });
                    replace(index, newValue);
                    move(index, newPos);
                    setFocusedId(newPos);
                  }}
                  onFocus={() => setFocusedId(index)}
                  onBlur={() => setFocusedId(undefined)}
                  innerRef={refs[index]}
                  id={`initialSettings.bloodGlucoseTargetSchedule.${index}.start`}
                  name={`initialSettings.bloodGlucoseTargetSchedule.${index}.start`}
                  error={getFieldError(meta.initialSettings.bloodGlucoseTargetSchedule, index, 'start')}
                  {...inlineInputStyles}
                />
                <FastField
                  as={TextInput}
                  label={index === 0 && t('Lower Target')}
                  type="number"
                  id={`initialSettings.bloodGlucoseTargetSchedule.${index}.low`}
                  name={`initialSettings.bloodGlucoseTargetSchedule.${index}.low`}
                  suffix={meta.initialSettings.bloodGlucoseUnits.value}
                  error={getFieldError(meta.initialSettings.bloodGlucoseTargetSchedule, index, 'low')}
                  {...inlineInputStyles}
                />
                <Text ml={3} mr={1} mt={index === 0 ? '33px' : '12px'}>-</Text>
                <FastField
                  as={TextInput}
                  label={index === 0 && t('Upper Target')}
                  type="number"
                  id={`initialSettings.bloodGlucoseTargetSchedule.${index}.high`}
                  name={`initialSettings.bloodGlucoseTargetSchedule.${index}.high`}
                  suffix={meta.initialSettings.bloodGlucoseUnits.value}
                  error={getFieldError(meta.initialSettings.bloodGlucoseTargetSchedule, index, 'high')}
                  {...inlineInputStyles}
                />
                <Icon
                  mx={2}
                  mt={2}
                  variant="button"
                  label="Delete"
                  icon={DeleteOutlineRoundedIcon}
                  onClick={() => remove(index)}
                  disabled={index === 0}
                  sx={{
                    visibility: index === 0 ? 'hidden' : 'visible',
                  }}
                />
              </Flex>
            ))}
            <Button
              variant="secondary"
              disabled={(() => {
                const lastSchedule = bloodGlucoseTargetSchedule.value[bloodGlucoseTargetSchedule.value.length - 1];
                return lastSchedule.start >= (MS_IN_DAY - (MS_IN_MIN * 30));
              })()}
              onClick={() => {
                const lastSchedule = bloodGlucoseTargetSchedule.value[bloodGlucoseTargetSchedule.value.length - 1];
                return push({
                  ...lastSchedule,
                  start: lastSchedule.start + (MS_IN_MIN * 30),
                });
              }}
            >
              {t('Add an additional correction range')}
            </Button>
          </Box>
        </Box>

        <PopoverLabel
            id='suspend-threshold'
            label={t('Suspend Threshold')}
            mb={2}
            popoverContent={(
              <Box p={3}>
                <Body2>
                  {t('When your glucose is predicted to go below this value, the app will recommend a basal rate of 0 U/h and will not recommend a bolus.')}
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
  const bgUnits = meta.initialSettings.bloodGlucoseUnits.value;
  const pumpId = meta.initialSettings.pumpId.value;
  const pumpMeta = deviceMeta(pumpId, bgUnits);

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
                {t('Tidepool Loop assumes that the insulin it has delivered is actively working to lower your glucose for 6 hours. This setting cannot be changed.')}
              </Body2>
              <Body2>
                {t('You can choose how Tidepool Loop measures the insulin’s peak activity according to one of these two insulin models that you’ll select now.')}
              </Body2>
              <Body2>
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
                {t('Maximum basal rate is the automatically adjusted basal rate that Tidepool Loop is allowed to enact to help reach your correction range.')}
              </Body2>
              <Body2>
                {t('For first time users of an automated system, Tidepool suggests you start with 3x your highest basal rate.')}
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
                {t('Maximum bolus is the highest bolus amount that you will allow Tidepool Loop to recommend at one time to cover carbs or bring down high glucose.')}
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
