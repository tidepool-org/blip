import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { bindActionCreators } from 'redux';
import _ from 'lodash';

import * as actions from '../../redux/actions';

import LoginLogo from '../../components/loginlogo/loginlogo';
import SimpleForm from '../../components/simpleform';
import mailIcon from './images/mail_icon.svg';
import utils from '../../core/utils';

const StyledMailIcon = styled.div`
  text-align: center;
  img {
    height: 350px;
  }
`;
export var EmailVerification = translate()(class extends React.Component {
  static propTypes = {
    acknowledgeNotification: PropTypes.func.isRequired,
    notification: PropTypes.object,
    onSubmitResend: PropTypes.func.isRequired,
    resent: PropTypes.bool.isRequired,
    sent: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.string,
    ]),
    trackMetric: PropTypes.func.isRequired,
    working: PropTypes.bool.isRequired
  };

  state = {
    formValues: {},
    validationErrors: {}
  };

  componentWillUnmount() {
    this.props.acknowledgeNotification('resendingEmailVerification');
  };

  formInputs = () => {
    const { t } = this.props;
    return [
      {name: 'email', label: t('Email'), type: 'email'}
    ];
  };

  render() {
    const { t, sent } = this.props;
    var content;
    var loginPage;

    if (this.props.sent) {
      loginPage = 'signup';
      content = (
        <>
          <StyledMailIcon>
            <img src={mailIcon} />
          </StyledMailIcon>
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
        </>
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
        <LoginLogo />
        {content}
      </div>
    );
  };

  renderForm = () => {
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
    this.props.onSubmitResend(formValues.email);
  };

  resetFormStateBeforeSubmit = (formValues) => {
    this.props.acknowledgeNotification('resendingEmailVerification');
    this.setState({
      formValues: formValues,
      validationErrors: {}
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
  var api = ownProps.api;
  return Object.assign({}, stateProps, _.omit(dispatchProps, 'submitResend'), {
    onSubmitResend: dispatchProps.submitResend.bind(null, api),
    trackMetric: ownProps.trackMetric,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(EmailVerification);

