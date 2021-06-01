import PropTypes from 'prop-types';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import { Link } from 'react-router-dom';
import { translate } from 'react-i18next';
import _ from 'lodash';

import utils from '../../core/utils';
import LoginLogo from '../../components/loginlogo/loginlogo';
import SimpleForm from '../../components/simpleform';

export let RequestPasswordReset = translate()(class extends React.Component {
  static propTypes = {
    acknowledgeNotification: PropTypes.func.isRequired,
    api: PropTypes.object.isRequired,
    notification: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    working: PropTypes.bool.isRequired
  };

  state = {
    success: false,
    formValues: {},
    validationErrors: {},
    notification: null
  };

  formInputs = () => {
    const { t } = this.props;
    return [
      {name: 'email', label: t('Email'), type: 'email'}
    ];
  };

  render() {
    const { t } = this.props;
    var content;
    if (this.state.success) {
      content = (
        <div className="PasswordReset-intro">
          <div className="PasswordReset-title">{t('Email sent!')}</div>
          <div className="PasswordReset-instructions">
            <p>{t('Check your email and follow the instructions to reset your password.')}</p>
          </div>
        </div>
      );
    }
    else {
      content = (
        <div>
          <div className="PasswordReset-intro">
            <div className="PasswordReset-title">{t('Forgot your password?')}</div>
            <div className="PasswordReset-instructions">
              {t('Please enter your email address.')}
            </div>
          </div>
          <div className="PasswordReset-form">{this.renderForm()}</div>
        </div>
      );
    }

    return (
      <div className="PasswordReset">
        <LoginLogo />
        <div className="container-small-outer PasswordReset-form-container">
          <div className="container-small-inner login-form-box">
            {content}
            <div className="PasswordReset-link">
              <Link to="/login">{t('Return to login')}</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderForm = () => {
    const { t } = this.props;
    var submitButtonText = this.props.working ? t('Sending email...') : t('Send reset link');

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification || this.props.notification}/>
    );
  };

  handleSubmit = (formValues) => {
    var self = this;

    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    this.props.onSubmit(this.props.api, formValues.email);
    this.setState({
      success: true
    })
  };

  resetFormStateBeforeSubmit = (formValues) => {
    this.props.acknowledgeNotification('requestingPasswordReset');
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

    if (!formValues.email) {
      validationErrors.email = IS_REQUIRED;
    }

    if (formValues.email && !utils.validateEmail(formValues.email)) {
      validationErrors.email = INVALID_EMAIL;
    }

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
      });
    }

    return validationErrors;
  };
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.requestingPasswordReset.notification,
    working: state.blip.working.requestingPasswordReset.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.requestPasswordReset,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  const api = ownProps.api;
  return Object.assign({}, stateProps, dispatchProps, {
    trackMetric: ownProps.trackMetric,
    api: ownProps.api
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(RequestPasswordReset);
