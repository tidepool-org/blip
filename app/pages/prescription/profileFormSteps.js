import React from 'react';
import { translate } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box, Flex } from 'rebass/styled-components';
import bows from 'bows';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import InputMask from 'react-input-mask';

import { fieldsAreValid, getFieldError } from '../../core/forms';
import i18next from '../../core/language';
import RadioGroup from '../../components/elements/RadioGroup';
import Checkbox from '../../components/elements/Checkbox';
import TextInput from '../../components/elements/TextInput';
import { Caption, Headline } from '../../components/elements/FontStyles';
import { sexOptions, cgmDeviceOptions, pumpDeviceOptions } from './prescriptionFormConstants';
import { fieldsetStyles, inputStyles, checkboxGroupStyles, checkboxStyles } from './prescriptionFormStyles';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionAccount');

export const PatientPhone = translate()(props => {
  const { t, meta } = props;

  const {
    setFieldValue,
    setFieldTouched,
  } = useFormikContext();

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('What is the patient\'s phone number?')}</Headline>
      <FastField
        as={() => (
          <InputMask
            mask="(999) 999-9999"
            alwaysShowMask
            defaultValue={meta.phoneNumber.number.value}
            onBlur={e => {
              setFieldTouched('phoneNumber.number', true);
              setFieldValue('phoneNumber.number', e.target.value);
            }}
          >
            <TextInput
              name="phoneNumber.number"
              id="phoneNumber.number"
              label={t('Patient Phone Number')}
              error={getFieldError(meta.phoneNumber.number)}
              {...inputStyles}
            />
          </InputMask>
        )}
      />
      <Caption>
        {t('The patient\'s phone number may be used to provide direct assistance regarding their Tidepool account. Standard messaging rates may apply.')}
      </Caption>
    </Box>
  );
});

export const PatientMRN = translate()(props => {
  const { t, meta } = props;

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('What is the patient\'s Medical Record Number (MRN)?')}</Headline>
      <FastField
        as={TextInput}
        label={t('Medical Record Number')}
        id="mrn"
        name="mrn"
        error={getFieldError(meta.mrn)}
        {...inputStyles}
      />
    </Box>
  );
});

export const PatientGender = translate()(props => {
  const { t, meta } = props;

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('What is the patient\'s gender?')}</Headline>
      <FastField
        as={RadioGroup}
        variant="verticalBordered"
        id="sex"
        name="sex"
        options={sexOptions}
        error={getFieldError(meta.sex)}
      />
    </Box>
  );
});

export const PatientDevices = translate()(props => {
  const { t, meta } = props;

  const {
    setFieldValue,
  } = useFormikContext();

  return (
    <Box {...fieldsetStyles}>
      <Headline mb={4}>{t('Does the patient have the necessary prescriptions for Tidepool Loop compatible devices?')}</Headline>
      <Flex {...checkboxGroupStyles}>
        {map(pumpDeviceOptions, device => (
          <React.Fragment key={device.value}>
            <FastField
              as={Checkbox}
              id="initialSettings.pumpType"
              name="initialSettings.pumpType"
              key={device.value}
              checked={!isEmpty(meta.initialSettings.pumpType.value)}
              label={device.label}
              onChange={e => {
                setFieldValue('initialSettings.pumpType', e.target.checked ? device.value : '')
              }}
              error={getFieldError(meta.initialSettings.pumpType)}
              {...checkboxStyles}
            />
            <Caption mt={1}>{device.extraInfo}</Caption>
          </React.Fragment>
        ))}
      </Flex>
      <Flex {...checkboxGroupStyles}>
        {map(cgmDeviceOptions, device => (
          <React.Fragment key={device.value}>
            <FastField
              as={Checkbox}
              id="initialSettings.cgmType"
              name="initialSettings.cgmType"
              checked={!isEmpty(meta.initialSettings.cgmType.value)}
              label={device.label}
              onChange={e => {
                setFieldValue('initialSettings.cgmType', e.target.checked ? device.value : '')
              }}
              error={getFieldError(meta.initialSettings.cgmType)}
              {...checkboxStyles}
            />
            <Caption mt={1}>{device.extraInfo}</Caption>
          </React.Fragment>
        ))}
      </Flex>
    </Box>
  );
});

const accountFormSteps = (meta) => ({
  label: t('Complete Patient Profile'),
  subSteps: [
    {
      disableComplete: !fieldsAreValid(['phoneNumber.number'], meta),
      onComplete: () => log('Patient Phone Number Complete'),
      panelContent: <PatientPhone meta={meta} />
    },
    {
      disableComplete: !fieldsAreValid(['mrn'], meta),
      onComplete: () => log('Patient MRN Complete'),
      panelContent: <PatientMRN meta={meta} />,
    },
    {
      disableComplete: !fieldsAreValid(['sex'], meta),
      onComplete: () => log('Patient Gender Complete'),
      panelContent: <PatientGender meta={meta} />,
    },
    {
      disableComplete: !fieldsAreValid(['initialSettings.pumpType', 'initialSettings.cgmType'], meta),
      onComplete: () => log('Patient Devices Complete'),
      panelContent: <PatientDevices meta={meta} />,
    },
  ],
});

export default accountFormSteps;
