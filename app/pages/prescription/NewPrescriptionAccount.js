import React from 'react';
import { translate } from 'react-i18next';
import { useFormikContext, FastField } from 'formik';
import { Box, Text } from 'rebass/styled-components';
import bows from 'bows';
import moment from 'moment';

import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import DatePicker from '../../components/elements/DatePicker';
import { Headline } from '../../components/elements/FontStyles';

const log = bows('NewPrescriptionAccount');

export const AccountType = translate()((props) => {
  const { t } = props;
  const { getFieldMeta } = useFormikContext();

  const meta = {
    type: getFieldMeta('type'),
  };

  return (
    <Box width={0.5} my={5} mx="auto">
      <Headline mb={4}>{t('Who are you creating your account for?')}</Headline>
      <FastField
        as={RadioGroup}
        id="type"
        name="type"
        options={[
          { value: 'patient', label: t('Patient') },
          { value: 'caregiver', label: t('Patient and caregiver') },
        ]}
        error={meta.type.touched && meta.type.error}
        themeProps={{ mb: 5 }}
      />
    </Box>
  );
});

export const PatientInfo = translate()((props) => {
  const { t } = props;
  const { setFieldValue, setFieldTouched, values, getFieldMeta } = useFormikContext();

  const meta = {
    firstName: getFieldMeta('firstName'),
    lastName: getFieldMeta('lastName'),
    birthday: getFieldMeta('birthday'),
  };

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
      <FastField
        as={DatePicker}
        label={t('Patient\'s Birthday')}
        id="birthday"
        name="birthday"
        date={values.birthday ? moment.utc(values.birthday) : null}
        onDateChange={newDate => {
          setFieldValue('birthday', newDate.toISOString())
        }}
        onFocusChange={newFocused => {
          if (!newFocused) setFieldTouched('birthday', true)
        }}
        error={meta.birthday.touched && meta.birthday.error}
        themeProps={{ mb: 5 }}
      />
    </Box>
  );
});

export const PatientEmail = translate()((props) => {
  const { t } = props;
  const { getFieldMeta } = useFormikContext();

  const meta = {
    email: getFieldMeta('email'),
    emailConfirm: getFieldMeta('emailConfirm'),
  };

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

const accountSteps = () => {
  const {errors, touched, values} = useFormikContext();

  log('errors', errors);
  log('touched', touched);
  log('values', values);

  return {
    label: 'Create Patient Account',
    onComplete: () => log('Patient Account Created'),
    subSteps: [
      {
        disableComplete: !values.type,
        hideBack: true,
        onComplete: () => log('Account Type Complete'),
        panelContent: <AccountType />
      },
      {
        disableComplete: !values.firstName || !values.lastName,
        onComplete: log('Patient Info Complete'),
        panelContent: <PatientInfo />,
      },
      {
        disableComplete: !values.email || !values.emailConfirm,
        onComplete: log('Patient Email Complete'),
        panelContent: <PatientEmail />,
      },
    ],
  };
};

export default accountSteps;
