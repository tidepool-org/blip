import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import InputMask from 'react-input-mask';
import { useLocation } from 'react-router-dom';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import utils from '../../core/utils';
import { validateForm } from '../../core/validation';
import { dateRegex } from '../../core/clinicUtils';
import SignupWizardContainer from '../../components/SignupWizardContainer/SignupWizardContainer';
import TextInput from '../../components/elements/TextInput';

var MODEL_DATE_FORMAT = 'YYYY-MM-DD';

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

const VerificationWithPassword = ({
  api,
  fetchingUser,
  user,
  trackMetric = _.noop,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();

  const signupKey = utils.getSignupKey(location);
  const signupEmail = utils.getSignupEmail(location);

  const propsNotification = useSelector(state => state.blip.working.verifyingCustodial.notification);
  const working = useSelector(state => state.blip.working.verifyingCustodial.inProgress);

  const [formValues, setFormValues] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const disabled = fetchingUser && !user;

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

  return (
    <SignupWizardContainer>
      <form className="simple-form">
        <div className="simple-form-inputs">
          <InputMask
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

          <TextInput
            type="password"
            name="password"
            label={t('Create Password')}
            value={formValues.password || ''}
            onChange={(e) => handleInputChange('password', e.target.value)}
            disabled={disabled}
            error={validationErrors.password}
            width="100%"
          />

          <TextInput
            type="password"
            name="passwordConfirm"
            label={t('Confirm password')}
            value={formValues.passwordConfirm || ''}
            onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
            disabled={disabled}
            error={validationErrors.passwordConfirm}
            width="100%"
          />
        </div>

        <div className="simple-form-action-group">
          <button
            className="simple-form-submit btn btn-primary js-form-submit"
            onClick={handleSubmit}
            disabled={disabled || working}
          >
            {working ? t('Setting up...') : t('Confirm')}
          </button>
          <Notification notification={notification || propsNotification}/>
        </div>
      </form>
    </SignupWizardContainer>
  );
};

export default VerificationWithPassword;
