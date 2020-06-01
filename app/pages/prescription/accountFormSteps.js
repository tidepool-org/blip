import React from 'react';
import { translate } from 'react-i18next';
import { FastField, Field, useFormikContext } from 'formik';
import { Box, Text } from 'rebass/styled-components';
import bows from 'bows';
import InputMask from 'react-input-mask';

import { fieldsAreValid } from '../../core/forms';
import i18next from '../../core/language';
import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import { Headline } from '../../components/elements/FontStyles';
import { typeOptions, dateFormat } from './prescriptionSchema';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionAccount');

export const AccountType = translate()(props => {
  const { t, meta } = props;

  return (
    <Box width={0.5} my={5} mx="auto">
      <Headline mb={4}>{t('Who are you creating your account for?')}</Headline>
      <FastField
        as={RadioGroup}
        id="type"
        name="type"
        options={typeOptions}
        error={meta.type.touched && meta.type.error}
        themeProps={{ mb: 5 }}
      />
    </Box>
  );
});

export const PatientInfo = translate()(props => {
  const { t, meta } = props;

  const {
    setFieldValue,
    setFieldTouched,
  } = useFormikContext();

  const dateFormatRegex = /^(.*)[-|/](.*)[-|/](.*)$/;
  const dateInputFormat = 'MM/DD/YYYY';
  const maskFormat = dateInputFormat.replace(/[A-Z]/g, '9');

  return (
    <Box width={0.5} my={5} mx="auto">
      <Headline mb={4}>{t('Please enter patient\'s name and birthdate')}</Headline>
      <FastField
        as={TextInput}
        label={t('First Name')}
        id="firstName"
        name="firstName"
        error={meta.firstName.touched && meta.firstName.error}
        themeProps={{ mb: 3 }}
      />
      <FastField
        as={TextInput}
        label={t('Last Name')}
        id="lastName"
        name="lastName"
        error={meta.lastName.touched && meta.lastName.error}
        themeProps={{ mb: 3 }}
      />
      <Field
        as={() => (
          <InputMask
            mask={maskFormat}
            maskPlaceholder={dateInputFormat}
            alwaysShowMask
            defaultValue={meta.birthday.value.replace(dateFormatRegex, '$2/$3/$1')}
            onBlur={e => {
              setFieldTouched('birthday', true);
              setFieldValue('birthday', e.target.value.replace(dateFormatRegex, '$3-$1-$2'))
            }}
          >
            <TextInput
              name="birthday"
              id="birthday"
              label={t('Patient\'s Birthday')}
              error={meta.birthday.touched && meta.birthday.error}
              themeProps={{ mb: 5 }}
            />
          </InputMask>
        )}
      />
    </Box>
  );
});

export const PatientEmail = translate()(props => {
  const { t, meta } = props;

  return (
    <Box width={0.5} my={5} mx="auto">
      <Headline mb={4}>{t('What is the patient\'s email address?')}</Headline>
      <FastField
        as={TextInput}
        label={t('Email Address')}
        id="email"
        name="email"
        error={meta.email.touched && meta.email.error}
        themeProps={{ mb: 3 }}
      />
      <FastField
        as={TextInput}
        label={t('Confirm Email Address')}
        id="emailConfirm"
        name="emailConfirm"
        error={meta.emailConfirm.touched && meta.emailConfirm.error}
        themeProps={{ mb: 5 }}
      />
      <Text mb={5}>
        {t('This email will be used for an account set up request to the end user and for all Tidepool correspondence.')}
      </Text>
    </Box>
  );
});

const accountFormSteps = meta => ({
  label: t('Create Patient Account'),
  subSteps: [
    {
      disableComplete: !fieldsAreValid(['type'], meta),
      hideBack: true,
      onComplete: () => log('Account Type Complete'),
      panelContent: <AccountType meta={meta} />
    },
    {
      disableComplete: !fieldsAreValid(['firstName', 'lastName', 'birthday'], meta),
      onComplete: () => log('Patient Info Complete'),
      panelContent: <PatientInfo meta={meta} />,
    },
    {
      disableComplete: !fieldsAreValid(['email', 'emailConfirm'], meta),
      onComplete: () => log('Patient Email Complete'),
      panelContent: <PatientEmail meta={meta} />,
    },
  ],
});

export default accountFormSteps;
