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
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import * as actions from '../../redux/actions';

import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';

import utils from '../../core/utils';

export var EmailVerification = translate()(React.createClass({
  propTypes: {
    acknowledgeNotification: React.PropTypes.func.isRequired,
    notification: React.PropTypes.object,
    onSubmitResend: React.PropTypes.func.isRequired,
    resent: React.PropTypes.bool.isRequired,
    sent: React.PropTypes.oneOfType([
      React.PropTypes.bool,
      React.PropTypes.string,
    ]),
    trackMetric: React.PropTypes.func.isRequired,
    working: React.PropTypes.bool.isRequired
  },
  componentWillUnmount: function() {
    this.props.acknowledgeNotification('resendingEmailVerification');
  },
  formInputs: function() {
    const { t } = this.props;
    return [
      {name: 'email', label: t('Email'), type: 'email'}
    ];
  },
  getInitialState: function() {
    return {
      formValues: {},
      validationErrors: {}
    };
  },
  render: function() {
    const { t, sent } = this.props;
    var content;
    var loginPage;

    if (this.props.sent) {
      loginPage = 'signup';
      content = (
        <Trans className="EmailVerification-intro" i18nKey="html.emailverification-instructions">
          <div className="EmailVerification-title">Keeping your data private and secure is important to us!</div>
          <div className="EmailVerification-instructions">
            <p>
              Please click the link in the email we just sent you at
              <br/>
                <strong>{{sent}}</strong>
              <br/>
              to verify and activate your account.
            </p>
          </div>
        </Trans>
      );
    }
    else {
      loginPage = 'login';
      content = (
        <div className="EmailVerification-content">
          <div className="EmailVerification-intro">
            <div className="EmailVerification-title">{t('Hey, you\'re not verified yet.')}</div>
              <div className="EmailVerification-instructions">
                <p>{t('Check your email and follow the link there. (We need to confirm that you are really you.)')}</p>
              </div>
          </div>
          <div className="container-small-outer">
            <div className="EmailVerification-resend-note">
              <p>{t('Do you want us to resend the email? Enter the address you used to signup below.')}</p>
            </div>
            <div className="container-small-inner login-form-box">
              <div className="EmailVerification-form">{this.renderForm()}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="EmailVerification">
        <LoginNav
          page={loginPage}
          hideLinks={false}
          trackMetric={this.props.trackMetric} />
        <LoginLogo />
        {content}
      </div>
    );
  },
  renderForm: function() {
    const { t } = this.props;
    var submitButtonText = this.props.working ? t('Sending email...') : t('Resend');

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        notification={this.props.notification}/>
    );
  },
  handleSubmit: function(formValues) {
    var self = this;

    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }
    this.props.onSubmitResend(formValues.email);
  },
  resetFormStateBeforeSubmit: function(formValues) {
    this.props.acknowledgeNotification('resendingEmailVerification');
    this.setState({
      formValues: formValues,
      validationErrors: {}
    });
  },
  validateFormValues: function(formValues) {
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
  }
}));

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.resendingEmailVerification.notification,
    working: state.blip.working.resendingEmailVerification.inProgress,
    resent: state.blip.resentEmailVerification,
    sent: state.blip.sentEmailVerification
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  submitResend: actions.async.resendEmailVerification,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, _.omit(dispatchProps, 'submitResend'), {
    onSubmitResend: dispatchProps.submitResend.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(EmailVerification);

