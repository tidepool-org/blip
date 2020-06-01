import React from 'react';
import { translate } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box, Text } from 'rebass/styled-components';
import bows from 'bows';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import InputMask from 'react-input-mask';

import { fieldsAreValid } from '../../core/forms';
import i18next from '../../core/language';
import RadioGroup from '../../components/elements/RadioGroup';
import Checkbox from '../../components/elements/Checkbox';
import TextInput from '../../components/elements/TextInput';
import { Headline } from '../../components/elements/FontStyles';
import { sexOptions, cgmDeviceOptions, pumpDeviceOptions } from './prescriptionSchema';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionAccount');

export const PatientPhone = translate()(props => {
  const { t, meta } = props;

  const {
    setFieldValue,
    setFieldTouched,
  } = useFormikContext();

  return (
    <Box width={0.5} my={5} mx="auto">
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
              error={meta.phoneNumber.number.touched && meta.phoneNumber.number.error}
              themeProps={{ mb: 3 }}
            />
          </InputMask>
        )}
      />
      <Text mb={5}>
        {t('The patient\'s phone number may be used to provided direct assistance regarding their Tidepool account. Standard messaging rates may apply.')}
      </Text>
    </Box>
  );
});

export const PatientMRN = translate()(props => {
  const { t, meta } = props;

  return (
    <Box width={0.5} my={5} mx="auto">
      <Headline mb={4}>{t('What is the patient\'s Medical Record Number (MRN)?')}</Headline>
      <FastField
        as={TextInput}
        label={t('Medical Record Number')}
        id="mrn"
        name="mrn"
        error={meta.mrn.touched && meta.mrn.error}
        themeProps={{ mb: 3 }}
      />
    </Box>
  );
});

export const PatientGender = translate()(props => {
  const { t, meta } = props;

  return (
    <Box width={0.5} my={5} mx="auto">
      <Headline mb={4}>{t('What is the patient\'s gender?')}</Headline>
      <FastField
        as={RadioGroup}
        id="sex"
        name="sex"
        options={sexOptions}
        error={meta.sex.touched && meta.sex.error}
        themeProps={{ mb: 5 }}
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
    <Box width={0.5} my={5} mx="auto">
      <Headline mb={4}>{t('Does the patient have the necessary prescriptions for Tidepool Loop compatible devices?')}</Headline>
      <Box mb={3}>
        {map(pumpDeviceOptions, device => (
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
            error={meta.initialSettings.pumpType.touched && meta.initialSettings.pumpType.error}
          />
        ))}
      </Box>
      <Box mb={3}>
        {map(cgmDeviceOptions, device => (
          <FastField
            as={Checkbox}
            id="initialSettings.cgmType"
            name="initialSettings.cgmType"
            key={device.value}
            checked={!isEmpty(meta.initialSettings.cgmType.value)}
            label={device.label}
            onChange={e => {
              setFieldValue('initialSettings.cgmType', e.target.checked ? device.value : '')
            }}
            error={meta.initialSettings.cgmType.touched && meta.initialSettings.cgmType.error}
          />
        ))}
      </Box>
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
