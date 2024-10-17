import React from 'react';
import { withTranslation } from 'react-i18next';
import { FastField, Field, useFormikContext } from 'formik';
import { Box, Flex } from 'theme-ui';
import get from 'lodash/get';
import InputMask from 'react-input-mask';

import { getFieldError } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import { Caption, Headline } from '../../components/elements/FontStyles';

import {
  fieldsetStyles,
  condensedInputStyles,
  checkboxGroupStyles,
} from './prescriptionFormStyles';

import {
  sexOptions,
  cgmDeviceOptions,
  pumpDeviceOptions,
} from './prescriptionFormConstants';

export const PatientPhone = withTranslation()(props => {
  const { t } = props;
  const formikContext = useFormikContext();

  const {
    setFieldValue,
    setFieldTouched,
    values,
  } = formikContext;

  const patientName = get(values, 'firstName', t('the patient'));
  const initialFocusedInputRef = useInitialFocusedInput();

  return (
    <Box id='patient-phone-step' {...fieldsetStyles}>
      <Headline mb={4}>{t('What is the mobile phone number {{patientName}} will use with Tidepool Loop?', { patientName })}</Headline>
      <FastField
        as={({ innerRef }) => (
          <InputMask
            mask="(999) 999-9999"
            alwaysShowMask
            defaultValue={get(values, 'phoneNumber.number')}
            onBlur={e => {
              // Only set value if field contains at least one numeric digit
              const value = !!e.target.value.match(/(?=.*\d)/) ? e.target.value : '';
              setFieldTouched('phoneNumber.number');
              setFieldValue('phoneNumber.number', value);
            }}
          >
            <TextInput
              name="phoneNumber.number"
              id="phoneNumber.number"
              label={t('Phone Number')}
              error={getFieldError('phoneNumber.number', formikContext)}
              innerRef={innerRef}
              {...condensedInputStyles}
            />
          </InputMask>
        )}
        tabIndex={-1}
        innerRef={initialFocusedInputRef}
      />
      <Caption mt={5} mb={3}>
        {t('The patient\'s phone number may be used to provide direct assistance regarding their Tidepool account. Standard messaging rates may apply.')}
      </Caption>
    </Box>
  );
});

export const PatientMRN = withTranslation()(props => {
  const { t } = props;
  const formikContext = useFormikContext();
  const { values } = formikContext;
  const patientName = get(values, 'firstName', t('the patient'));
  const initialFocusedInputRef = useInitialFocusedInput();

  return (
    <Box id='patient-mrn-step' {...fieldsetStyles}>
      <Headline mb={4}>{t('What is {{patientName}}\'s Medical Record Number?', { patientName })}</Headline>
      <FastField
        as={TextInput}
        label={t('Medical Record Number')}
        id="mrn"
        name="mrn"
        error={getFieldError('mrn', formikContext)}
        innerRef={initialFocusedInputRef}
        {...condensedInputStyles}
      />
    </Box>
  );
});

export const PatientGender = withTranslation()(props => {
  const { t } = props;
  const formikContext = useFormikContext();
  const { values } = formikContext;
  const patientName = get(values, 'firstName', t('the patient'));
  const initialFocusedInputRef = useInitialFocusedInput();

  return (
    <Box id='patient-gender-step' {...fieldsetStyles}>
      <Headline mb={4}>{t('What is {{patientName}}\'s gender?', { patientName })}</Headline>
      <FastField
        as={RadioGroup}
        variant="verticalBordered"
        id="sex"
        name="sex"
        options={sexOptions}
        error={getFieldError('sex', formikContext)}
        innerRef={initialFocusedInputRef}
        onMouseDown={e => e.preventDefault()}
      />
    </Box>
  );
});

export const PatientDevices = withTranslation()(props => {
  const { t, devices, initialFocusedInput = 'initialSettings.pumpId' } = props;
  const formikContext = useFormikContext();

  const {
    values,
  } = formikContext;

  const patientName = get(values, 'firstName', t('the patient'));
  const initialFocusedInputRef = useInitialFocusedInput();

  return (
    <Box id='patient-devices-step' {...fieldsetStyles}>
      <Headline mb={4}>{t('Does {{patientName}} have the necessary prescriptions for Tidepool Loop compatible devices?', { patientName })}</Headline>
      <Flex {...checkboxGroupStyles}>
        <Box id='pump-device-selection'>
          <FastField
            as={RadioGroup}
            label={t('Please select an insulin pump.')}
            id="initialSettings.pumpId"
            name="initialSettings.pumpId"
            options={pumpDeviceOptions(devices)}
            error={getFieldError('initialSettings.pumpId', formikContext)}
            innerRef={initialFocusedInput === 'initialSettings.pumpId' ? initialFocusedInputRef : undefined}
            onMouseDown={e => e.preventDefault()}
          />
        </Box>
      </Flex>
      <Flex {...checkboxGroupStyles}>
        <Box id='cgm-device-selection'>
          <FastField
            as={RadioGroup}
            label={t('Please select a continuous glucose monitor.')}
            id="initialSettings.cgmId"
            name="initialSettings.cgmId"
            options={cgmDeviceOptions(devices)}
            error={getFieldError('initialSettings.cgmId', formikContext)}
            innerRef={initialFocusedInput === 'initialSettings.cgmId' ? initialFocusedInputRef : undefined}
            onMouseDown={e => e.preventDefault()}
          />
        </Box>
      </Flex>
    </Box>
  );
});
