
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

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router';
import _ from 'lodash';

import * as actions from '../../redux/actions';
import i18n from '../../core/language';
import utils from '../../core/utils';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';

const t = i18n.t.bind(i18n);
class RequestPasswordResetPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: false,
      validationErrors: {},
      notification: null
    };
  }

  formInputs() {
    return [
      { name: 'email', label: t('Email'), type: 'email' }
    ];
  }

  render() {
    let content;
    if (this.state.success) {
      content = (
        <div className="PasswordReset-intro">
          <div className="PasswordReset-title">{t('Email sent!')}</div>
          <div className="PasswordReset-instructions">
            <p>{t('Check your email and follow the instructions to reset your password.')}</p>
          </div>
        </div>
      );
    } else {
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
        <LoginNav
          hideLinks={true}
          trackMetric={this.props.trackMetric} />
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

  renderForm() {
    const submitButtonText = this.props.working ? t('Sending email...') : t('Send reset link');

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={{ email: '' }}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification || this.props.notification} />
    );
  }

  handleSubmit = (formValues) => {
    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit();

    const validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    this.props.trackMetric('Request password reset');
    this.props.onSubmit(formValues.email);
    this.setState({
      success: true
    });
  };

  resetFormStateBeforeSubmit() {
    this.props.acknowledgeNotification('requestingPasswordReset');
    this.setState({
      validationErrors: {},
      notification: null
    });
  }

  validateFormValues(formValues) {
    const validationErrors = {};
    if (!formValues.email) {
      validationErrors.email = t('This field is required.');
    }

    if (formValues.email && !utils.validateEmail(formValues.email)) {
      validationErrors.email = t('Invalid email address.');
    }

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors
      });
    }

    return validationErrors;
  }
}

RequestPasswordResetPage.propTypes = {
  acknowledgeNotification: PropTypes.func.isRequired,
  notification: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  working: PropTypes.bool.isRequired
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

function mapStateToProps(state) {
  return {
    notification: state.blip.working.requestingPasswordReset.notification,
    working: state.blip.working.requestingPasswordReset.inProgress
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.requestPasswordReset,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, dispatchProps, {
    trackMetric: ownProps.routes[0].trackMetric,
    onSubmit: dispatchProps.onSubmit.bind(null, api)
  });
};

export { mapStateToProps, RequestPasswordResetPage };
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(RequestPasswordResetPage);
