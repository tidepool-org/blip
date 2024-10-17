import React from 'react';
import { withTranslation } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box } from 'theme-ui';
import InputMask from 'react-input-mask';
import get from 'lodash/get';

import { getFieldError } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import { Caption, Headline } from '../../components/elements/FontStyles';
import { dateRegex, typeOptions } from './prescriptionFormConstants';
import { fieldsetStyles, condensedInputStyles } from './prescriptionFormStyles';

export const AccountType = withTranslation()(props => {
  const { t } = props;
  const initialFocusedInputRef = useInitialFocusedInput();
  const formikContext = useFormikContext();

  return (
    <Box id="account-type-step" {...fieldsetStyles}>
      <Headline mb={4}>{t('Who are you creating an account for?')}</Headline>
      <FastField
        as={RadioGroup}
        variant="verticalBordered"
        id="accountType"
        name="accountType"
        options={typeOptions}
        error={getFieldError('accountType', formikContext)}
        innerRef={initialFocusedInputRef}
        onMouseDown={e => e.preventDefault()}
      />
    </Box>
  );
});

export const PatientInfo = withTranslation()(props => {
  const { t, initialFocusedInput = 'firstName' } = props;
  const formikContext = useFormikContext();

  const {
    setFieldValue,
    setFieldTouched,
    values,
  } = formikContext;

  const initialFocusedInputRef = useInitialFocusedInput();
  const dateInputFormat = 'MM/DD/YYYY';
  const maskFormat = dateInputFormat.replace(/[A-Z]/g, '9');

  return (
    <Box id="patient-info-step" {...fieldsetStyles}>
      <Headline mb={4}>{t('Please enter the patient\'s name and birthdate')}</Headline>
      <FastField
        as={TextInput}
        label={t('First Name')}
        id="firstName"
        name="firstName"
        error={getFieldError('firstName', formikContext)}
        innerRef={initialFocusedInput === 'firstName' ? initialFocusedInputRef : undefined}
        {...condensedInputStyles}
      />
      <FastField
        as={TextInput}
        label={t('Last Name')}
        id="lastName"
        name="lastName"
        error={getFieldError('lastName', formikContext)}
        {...condensedInputStyles}
      />
      <FastField
        as={({ innerRef }) => (
          <InputMask
            mask={maskFormat}
            maskPlaceholder={dateInputFormat.toLowerCase()}
            alwaysShowMask
            defaultValue={get(values, 'birthday', '').replace(dateRegex, '$2/$3/$1')}
            onBlur={e => {
              setFieldTouched('birthday');
              setFieldValue('birthday', e.target.value.replace(dateRegex, '$3-$1-$2'))
            }}
          >
            <TextInput
              name="birthday"
              id="birthday"
              label={t('Birthdate')}
              error={getFieldError('birthday', formikContext)}
              innerRef={innerRef}
              {...condensedInputStyles}
            />
          </InputMask>
        )}
        tabIndex={-1}
        innerRef={initialFocusedInput === 'birthday' ? initialFocusedInputRef : undefined}
      />
    </Box>
  );
});

export const PatientEmail = withTranslation()(props => {
  const { t } = props;
  const initialFocusedInputRef = useInitialFocusedInput();
  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const patientName = get(values, 'firstName', t('the patient'));
  const isCaregiverAccount = get(values, 'accountType') === 'caregiver';

  const initialFocusedInput = get(props, 'initialFocusedInput', isCaregiverAccount
    ? 'caregiverFirstName'
    : 'email'
  );

  const headline = isCaregiverAccount
    ? t('What is {{patientName}}\'s parent/guardian\'s name and email address?', { patientName })
    : t('What is {{patientName}}\'s email address?', { patientName });

  React.useEffect(() => {
    // Set these fields to empty strings to pass frontend validation since
    // they're hidden for non-caregiver accounts
    if (!isCaregiverAccount) {
      setFieldValue('caregiverFirstName', '');
      setFieldValue('caregiverLastName', '');
      setFieldTouched('caregiverFirstName');
      setFieldTouched('caregiverLastName');
    }
  }, []);

  return (
    <Box id="patient-email-step" {...fieldsetStyles}>
      <Headline mb={4}>{headline}</Headline>
      {isCaregiverAccount && (
        <FastField
          as={TextInput}
          label={t('First Name')}
          id="caregiverFirstName"
          name="caregiverFirstName"
          error={getFieldError('caregiverFirstName', formikContext)}
          innerRef={initialFocusedInput === 'caregiverFirstName' ? initialFocusedInputRef : undefined}
          {...condensedInputStyles}
        />
      )}
      {isCaregiverAccount && (
        <FastField
          as={TextInput}
          label={t('Last Name')}
          id="caregiverLastName"
          name="caregiverLastName"
          error={getFieldError('caregiverLastName', formikContext)}
          {...condensedInputStyles}
        />
      )}
      <FastField
        as={TextInput}
        label={t('Email Address')}
        id="email"
        name="email"
        error={getFieldError('email', formikContext)}
        innerRef={initialFocusedInput === 'email' ? initialFocusedInputRef : undefined}
        {...condensedInputStyles}
      />
      <FastField
        as={TextInput}
        label={t('Confirm Email Address')}
        id="emailConfirm"
        name="emailConfirm"
        error={getFieldError('emailConfirm', formikContext)}
        {...condensedInputStyles}
      />
      <Caption mt={5} mb={3}>
        {t('This email will be used for an account set up invitation to the end user and for all Tidepool correspondence.')}
      </Caption>
    </Box>
  );
});
