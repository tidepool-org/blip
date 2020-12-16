import React from 'react';
import { translate } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box, Flex } from 'rebass/styled-components';
import bows from 'bows';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import InputMask from 'react-input-mask';

import { fieldsAreValid, getFieldError } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import i18next from '../../core/language';
import RadioGroup from '../../components/elements/RadioGroup';
import Checkbox from '../../components/elements/Checkbox';
import TextInput from '../../components/elements/TextInput';
import { Caption, Headline } from '../../components/elements/FontStyles';

import {
  fieldsetStyles,
  condensedInputStyles,
  checkboxGroupStyles,
  checkboxStyles,
} from './prescriptionFormStyles';

import {
  sexOptions,
  cgmDeviceOptions,
  pumpDeviceOptions,
  stepValidationFields,
} from './prescriptionFormConstants';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionAccount');

export const PatientPhone = translate()(props => {
  const { t } = props;
  const { values } = useFormikContext();
  const patientName = get(values, 'firstName');
  const initialFocusedInputRef = useInitialFocusedInput();

  const {
    setFieldValue,
    setFieldTouched,
  } = useFormikContext();

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('What is the mobile phone number {{patientName}} will use with Tidepool Loop?', { patientName })}</Headline>
      <FastField
        as={({innerRef}) => (
          <InputMask
            mask="(999) 999-9999"
            alwaysShowMask
            defaultValue={get(values, 'phoneNumber.number')}
            onBlur={e => {
              setFieldTouched('phoneNumber.number', true);
              setFieldValue('phoneNumber.number', e.target.value);
            }}
          >
            <TextInput
              name="phoneNumber.number"
              id="phoneNumber.number"
              label={t('Phone Number')}
              error={getFieldError('phoneNumber.number', useFormikContext())}
              innerRef={innerRef}
              {...condensedInputStyles}
            />
          </InputMask>
        )}
        innerRef={initialFocusedInputRef}
      />
      <Caption mt={5} mb={3}>
        {t('The patient\'s phone number may be used to provide direct assistance regarding their Tidepool account. Standard messaging rates may apply.')}
      </Caption>
    </Box>
  );
});

export const PatientMRN = translate()(props => {
  const { t } = props;
  const { values } = useFormikContext();
  const patientName = get(values, 'firstName');
  const initialFocusedInputRef = useInitialFocusedInput();

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('What is {{patientName}}\'s Medical Record Number?', { patientName })}</Headline>
      <FastField
        as={TextInput}
        label={t('Medical Record Number')}
        id="mrn"
        name="mrn"
        error={getFieldError('mrn', useFormikContext())}
        innerRef={initialFocusedInputRef}
        {...condensedInputStyles}
      />
    </Box>
  );
});

export const PatientGender = translate()(props => {
  const { t } = props;
  const { values } = useFormikContext();
  const patientName = get(values, 'firstName');
  const initialFocusedInputRef = useInitialFocusedInput();

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('What is the {{patientName}}\'s gender?', { patientName })}</Headline>
      <FastField
        as={RadioGroup}
        variant="verticalBordered"
        id="sex"
        name="sex"
        options={sexOptions}
        error={getFieldError('sex', useFormikContext())}
        innerRef={initialFocusedInputRef}
      />
    </Box>
  );
});

export const PatientDevices = translate()(props => {
  const { t, devices } = props;
  const { values } = useFormikContext();
  const patientName = get(values, 'firstName');
  const initialFocusedInputRef = useInitialFocusedInput();

  const {
    setFieldValue,
  } = useFormikContext();

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('Does {{patientName}} have the necessary prescriptions for Tidepool Loop compatible devices?', { patientName })}</Headline>
      <Flex {...checkboxGroupStyles}>
        {map(pumpDeviceOptions(devices), device => (
          <React.Fragment key={device.value}>
            <FastField
              as={Checkbox}
              id="initialSettings.pumpId"
              name="initialSettings.pumpId"
              key={device.value}
              checked={!isEmpty(get(values, 'initialSettings.pumpId', ''))}
              label={device.label}
              onChange={e => {
                setFieldValue('initialSettings.pumpId', e.target.checked ? device.value : '')
              }}
              error={getFieldError('initialSettings.pumpId', useFormikContext())}
              innerRef={initialFocusedInputRef}
              {...checkboxStyles}
            />
            <Caption mt={1}>{device.extraInfo}</Caption>
          </React.Fragment>
        ))}
      </Flex>
      <Flex {...checkboxGroupStyles}>
        {map(cgmDeviceOptions(devices), device => (
          <React.Fragment key={device.value}>
            <FastField
              as={Checkbox}
              id="initialSettings.cgmId"
              name="initialSettings.cgmId"
              checked={!isEmpty(get(values, 'initialSettings.cgmId', ''))}
              label={device.label}
              onChange={e => {
                setFieldValue('initialSettings.cgmId', e.target.checked ? device.value : '')
              }}
              error={getFieldError('initialSettings.cgmId', useFormikContext())}
              {...checkboxStyles}
            />
            <Caption mt={1}>{device.extraInfo}</Caption>
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
});

const profileFormSteps = (schema, devices, values) => ({
  label: t('Complete Patient Profile'),
  subSteps: [
    {
      disableComplete: !fieldsAreValid(stepValidationFields[1][0], schema, values),
      onComplete: () => log('Patient Phone Number Complete'),
      panelContent: <PatientPhone />
    },
    {
      disableComplete: !fieldsAreValid(stepValidationFields[1][1], schema, values),
      onComplete: () => log('Patient MRN Complete'),
      panelContent: <PatientMRN />,
    },
    {
      disableComplete: !fieldsAreValid(stepValidationFields[1][2], schema, values),
      onComplete: () => log('Patient Gender Complete'),
      panelContent: <PatientGender />,
    },
    {
      disableComplete: !fieldsAreValid(stepValidationFields[1][3], schema, values),
      onComplete: () => log('Patient Devices Complete'),
      panelContent: <PatientDevices devices={devices} />,
    },
  ],
});

export default profileFormSteps;
