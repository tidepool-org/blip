import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import * as actions from '../../redux/actions';

import config from '../../config';

import utils from '../../core/utils';
import LoginLogo from '../../components/loginlogo/loginlogo';
import SimpleForm from '../../components/simpleform';

export var ConfirmPasswordReset = translate()(class extends React.Component {
  static propTypes = {
    acknowledgeNotification: PropTypes.func.isRequired,
    api: PropTypes.object.isRequired,
    notification: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    resetKey: PropTypes.string.isRequired,
    success: PropTypes.bool.isRequired,
    trackMetric: PropTypes.func.isRequired,
    working: PropTypes.bool.isRequired
  };

  state = {
    working: false,
    success: false,
    formValues: {},
    validationErrors: {},
    notification: null
  };

  formInputs = () => {
    const { t } = this.props;
    return [
      {name: 'email', label: t('Email'), type: 'email'},
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
  };

  render() {
    const { t } = this.props;
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
    }
    else {
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
        <LoginLogo />
        <div className="container-small-outer login-form">
          <div className="container-small-inner login-form-box">
            {content}
          </div>
        </div>
      </div>
    );
  }

  renderForm = () => {
    const { t } = this.props;
    var submitButtonText = this.state.working ? t('Saving...') : t('Save');

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.state.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification}/>
    );
  };

  handleSubmit = (formValues) => {
    var self = this;

    if (this.state.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);

    this.props.onSubmit(this.props.api, formValues);
  };

  resetFormStateBeforeSubmit = (formValues) => {
    this.props.acknowledgeNotification('confirmingPasswordReset');
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  };

  validateFormValues = (formValues) => {
    const { t } = this.props;
    var validationErrors = {};
    var IS_REQUIRED = t('This field is required.');
    var INVALID_EMAIL = t('Invalid email address.');
    var SHORT_PASSWORD = t('Password must be at least {{minLength}} characters long.', {minLength: config.PASSWORD_MIN_LENGTH});

    if (!formValues.email) {
      validationErrors.email = IS_REQUIRED;
    }

    if (formValues.email && !utils.validateEmail(formValues.email)) {
      validationErrors.email = INVALID_EMAIL;
    }

    if (!formValues.password) {
      validationErrors.password = IS_REQUIRED;
    }

    if (formValues.password && formValues.password.length < config.PASSWORD_MIN_LENGTH) {
      validationErrors.password = SHORT_PASSWORD;
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
  };

  prepareFormValuesForSubmit = (formValues) => {
    return {
      key: this.props.resetKey,
      email: formValues.email,
      password: formValues.password
    };
  };
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
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
  return Object.assign({}, stateProps, dispatchProps, {
    resetKey: ownProps.location.query.resetKey,
    trackMetric: ownProps.trackMetric,
    api: ownProps.api,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ConfirmPasswordReset);
