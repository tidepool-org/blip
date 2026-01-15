import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { colors as vizColors } from '@tidepool/viz';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import utils from '../../core/utils';
import { validateForm } from '../../core/validation';
import { dateRegex } from '../../core/clinicUtils';
import TextInput from '../../components/elements/TextInput';
import { Box } from 'theme-ui';
import Button from '../../components/elements/Button';
import InputMask from 'react-input-mask';

import {
  SignupWizardContainer,
  SignupWizardContents,
  SignupWizardActions,
} from '../../components/SignupWizard';

const styleProps = {
  titleContainer: {
    fontSize: 2,
    display: 'flex',
    justifyContent: 'center',
    color: vizColors.blue50,
    my: 2,
  },
  subtitleContainer: {
    fontSize: 1,
    display: 'flex',
    justifyContent: 'center',
    color: vizColors.blue50,
    my: 2,
  },
  inputFieldContainer: {
    py: 2,
  },
  confirmButton: {
    minWidth: '160px',
  },
};

const Notification = ({ notification = null }) => {
  if (!notification?.message) return null;

  const type = notification.type || 'alert';
  const className = [
    'simple-form-notification',
    'simple-form-notification-' + type,
    'js-form-notification',
  ].join(' ');

  return <div className={className}>{notification.message}</div>;
};

const SIGNUP_WORKFLOW = {
  DEFAULT: 'DEFAULT',
  EHR: 'EHR',
};

const useSignupWorkflow = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);

  // If there is a restrictedToken in the GET params, we assume that the user
  // is coming in from the EHR C2C flow. Otherwise, we assume they are coming
  // in from the default "Claim Your Account" email flow.
  const restrictedToken = queryParams.get('restrictedToken');

  if (!!restrictedToken) return SIGNUP_WORKFLOW.EHR;

  return SIGNUP_WORKFLOW.DEFAULT;
};

const VerificationWithPassword = ({
  api,
  fetchingUser,
  user,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();

  const signupWorkflow = useSignupWorkflow();
  const signupKey = utils.getSignupKey(location);
  const signupEmail = utils.getSignupEmail(location);

  const propsNotification = useSelector(state => state.blip.working.verifyingCustodial.notification);
  const working = useSelector(state => state.blip.working.verifyingCustodial.inProgress);

  const [formValues, setFormValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const handleInputChange = (name, value) => {
    setFormValues(prevState => ({ ...prevState, [name]: value }));
  };

  const resetFormStateBeforeSubmit = (formValues) => {
    setFormValues(formValues);
    setValidationErrors({});
    setNotification(null);
  };

  const validateFormValues = (formValues) => {
    const [year, month, day] = formValues.birthday?.split('-');
    const birthdayForValidation = { year, month, day };

    const form = [
      { type: 'date', name: 'birthday', label: t('birthday'), value: birthdayForValidation },
      { type: 'password', name: 'password', label: t('password'), value: formValues.password},
      { type: 'confirmPassword', name: 'passwordConfirm', label: t('confirm password'), value: formValues.passwordConfirm, prerequisites: { password: formValues.password } }
    ];
    const validationErrors = validateForm(form, true);

    if (!_.isEmpty(validationErrors)) {
      setValidationErrors({ validationErrors });
      setNotification({ type: 'error', message: t('Some entries are invalid.')});
    }

    return validationErrors;
  };

  const handleSubmit = (evt) => {
    if (evt) evt.preventDefault();

    if (working) return;

    const formValuesToSubmit = { ...formValues };

    resetFormStateBeforeSubmit(formValuesToSubmit);
    const validationErrors = validateFormValues(formValuesToSubmit);

    if (!_.isEmpty(validationErrors)) return;

    const { birthday, password } = formValues;
    dispatch(actions.async.verifyCustodial(api, signupKey, signupEmail, birthday, password));
  };

  const disabled = fetchingUser && !user;

  const titleCopy = signupWorkflow === SIGNUP_WORKFLOW.EHR
    ? t('Optional: Setup Your Account')
    : t('Setup Your Account');

  return (
    <SignupWizardContainer>
      <SignupWizardContents>
        <Box sx={styleProps.titleContainer}>
          {titleCopy}
        </Box>

        <Box sx={styleProps.subtitleContainer}>
          {t('Set a password to access your data from home')}
        </Box>

        <Box sx={styleProps.inputFieldContainer}>
          <TextInput // Password Field
            type="password"
            name="password"
            label={t('Create Password')}
            value={formValues.password || ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={disabled}
            error={validationErrors.password}
            width="100%"
          />
        </Box>

        <Box sx={styleProps.inputFieldContainer}>
          <TextInput // Confirm Password Field
            type="password"
            name="passwordConfirm"
            label={t('Confirm password')}
            value={formValues.passwordConfirm || ''}
            onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
            disabled={disabled}
            error={validationErrors.passwordConfirm}
            width="100%"
          />
        </Box>

        <Box sx={styleProps.inputFieldContainer}>
          <InputMask // Birthdate Field
            mask="99/99/9999"
            maskPlaceholder="mm/dd/yyyy"
            value={(formValues.birthday || '').replace(dateRegex, '$2/$3/$1')}
            const onChange={(e) => handleInputChange('birthday', e.target.value.replace(dateRegex, '$3-$1-$2'))}
            onBlur={(e) => handleInputChange('birthday', e.target.value.replace(dateRegex, '$3-$1-$2'))}
            disabled={disabled}
          >
            <TextInput
              name="birthday"
              label={t('Birthday')}
              placeholder="mm/dd/yyyy"
              variant="condensed"
              error={validationErrors.birthday}
              width="100%"
            />
          </InputMask>
        </Box>
      </SignupWizardContents>

      <SignupWizardActions>
        <Button
          id="verificationWithPasswordConfirm"
          variant="primary"
          onClick={handleSubmit}
          processing={working}
          disabled={disabled}
          sx={styleProps.confirmButton}
        >
          {working ? t('Setting up...') : t('Confirm')}
        </Button>

        <Notification notification={notification || propsNotification}/>
      </SignupWizardActions>
    </SignupWizardContainer>
  );
};

export default VerificationWithPassword;
