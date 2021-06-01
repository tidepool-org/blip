import React from 'react';
import { translate } from 'react-i18next';
import { FastField, useFormikContext } from 'formik';
import { Box } from 'rebass/styled-components';
import bows from 'bows';
import InputMask from 'react-input-mask';
import get from 'lodash/get';

import { fieldsAreValid, getFieldError } from '../../core/forms';
import { useInitialFocusedInput } from '../../core/hooks';
import i18next from '../../core/language';
import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import { Caption, Headline } from '../../components/elements/FontStyles';
import { dateRegex, stepValidationFields, typeOptions } from './prescriptionFormConstants';
import { fieldsetStyles, condensedInputStyles } from './prescriptionFormStyles';

const t = i18next.t.bind(i18next);
const log = bows('PrescriptionAccount');

export const AccountType = translate()(props => {
  const { t } = props;
  const initialFocusedInputRef = useInitialFocusedInput();
  const formikContext = useFormikContext();

  return (
    <Box {...fieldsetStyles}>
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

export const PatientInfo = translate()(props => {
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
    <Box {...fieldsetStyles}>
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
            maskPlaceholder={dateInputFormat}
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

export const PatientEmail = translate()(props => {
  const { t } = props;
  const initialFocusedInputRef = useInitialFocusedInput();
  const formikContext = useFormikContext();

  const {
    setFieldTouched,
    setFieldValue,
    values,
  } = formikContext;

  const patientName = get(values, 'firstName');
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
    <Box {...fieldsetStyles}>
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

const accountFormSteps = (schema, initialFocusedInput, values) => ({
  label: t('Create Patient Account'),
  subSteps: [
    {
      disableComplete: !fieldsAreValid(stepValidationFields[0][0], schema, values),
      hideBack: true,
      onComplete: () => log('Account Type Complete'),
      panelContent: <AccountType />,
    },
    {
      disableComplete: !fieldsAreValid(stepValidationFields[0][1], schema, values),
      onComplete: () => log('Patient Info Complete'),
      panelContent: <PatientInfo initialFocusedInput={initialFocusedInput} />,
    },
    {
      disableComplete: !fieldsAreValid(stepValidationFields[0][2], schema, values),
      onComplete: () => log('Patient Email Complete'),
      panelContent: <PatientEmail />,
    },
  ],
});

export default accountFormSteps;
