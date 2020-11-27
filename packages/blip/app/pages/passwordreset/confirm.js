/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import _ from 'lodash';

import * as actions from '../../redux/actions';

import config from '../../config';
import i18n from '../../core/language';
import utils from '../../core/utils';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';

const t = i18n.t.bind(i18n);
class ConfirmPasswordResetPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      working: false,
      success: false,
      validationErrors: {},
      notification: null
    };
  }

  formInputs() {
    return [
      { name: 'email', label: t('Email'), type: 'email' },
      {
        name: 'password',
        label: t('New password'),
        type: 'password'
      },
      {
        name: 'passwordConfirm',
        label: t('Confirm new password'),
        type: 'password'
      }
    ];
  }

  render() {
    var content;
    if (this.props.success) {
      content = (
        <div className="PasswordReset-intro">
          <div className="PasswordReset-title">{t('Success!')}</div>
          <div className="PasswordReset-instructions">
            <p>{t('Your password was changed successfully. You can now log in with your new password.')}</p>
          </div>
          <div className="PasswordReset-button">
            <Link className="btn btn-primary" to="/login">{t('Log in')}</Link>
          </div>
        </div>
      );
    } else {
      content = (
        <div>
          <div className="PasswordReset-intro">
            <div className="PasswordReset-title">{t('Change your password')}</div>
          </div>
          <div className="PasswordReset-form">{this.renderForm()}</div>
          <div className="PasswordReset-link">
            <Link to="/login">{t('Cancel')}</Link>
          </div>
        </div>
      );
    }

    return (
      <div className="PasswordReset">
        <LoginNav
          hideLinks={true}
          trackMetric={this.props.trackMetric} />
        <LoginLogo />
        <div className="container-small-outer login-form">
          <div className="container-small-inner login-form-box">
            {content}
          </div>
        </div>
      </div>
    );
  }

  renderForm() {
    const submitButtonText = this.state.working ? t('Saving...') : t('Save');

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={{ email: '', password: '', passwordConfirm: '' }}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.state.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification} />
    );
  }

  handleSubmit = (formValues) => {
    if (this.state.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);

    this.props.onSubmit(formValues);
  };

  resetFormStateBeforeSubmit(formValues) {
    this.props.acknowledgeNotification('confirmingPasswordReset');
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  }

  validateFormValues(formValues) {
    const validationErrors = {};
    const IS_REQUIRED = t('This field is required.');

    if (!formValues.email) {
      validationErrors.email = IS_REQUIRED;
    }

    if (formValues.email && !utils.validateEmail(formValues.email)) {
      validationErrors.email = t('Invalid email address.');
    }

    if (!formValues.password) {
      validationErrors.password = IS_REQUIRED;
    }

    if (formValues.password && formValues.password.length < config.PASSWORD_MIN_LENGTH) {
      validationErrors.password = t('Password must be at least {{minLength}} characters long.', { minLength: config.PASSWORD_MIN_LENGTH });
    }

    if (formValues.password) {
      if (!formValues.passwordConfirm) {
        validationErrors.passwordConfirm = IS_REQUIRED;
      }
      else if (formValues.passwordConfirm !== formValues.password) {
        validationErrors.passwordConfirm = t('Passwords don\'t match.');
      }
    }

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
      });
    }

    return validationErrors;
  }

  prepareFormValuesForSubmit(formValues) {
    return {
      key: this.props.resetKey,
      email: formValues.email,
      password: formValues.password
    };
  }
}


ConfirmPasswordResetPage.propTypes = {
  acknowledgeNotification: PropTypes.func.isRequired,
  notification: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  resetKey: PropTypes.string.isRequired,
  success: PropTypes.bool.isRequired,
  trackMetric: PropTypes.func.isRequired,
  working: PropTypes.bool.isRequired
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

function mapStateToProps(state) {
  return {
    notification: state.blip.working.confirmingPasswordReset.notification,
    working: state.blip.working.confirmingPasswordReset.inProgress,
    success: state.blip.passwordResetConfirmed
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.confirmPasswordReset,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  const api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, dispatchProps, {
    resetKey: ownProps.location.query.resetKey,
    trackMetric: ownProps.routes[0].trackMetric,
    onSubmit: dispatchProps.onSubmit.bind(null, api)
  });
};

export { mapStateToProps, ConfirmPasswordResetPage };
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ConfirmPasswordResetPage);
