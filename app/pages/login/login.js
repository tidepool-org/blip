
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

import i18n from '../../core/language';
import * as actions from '../../redux/actions';
import utils from '../../core/utils';
import { validateForm } from '../../core/validation';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';
import config from '../../config';

const t = i18n.t.bind(i18n);

export class Login extends React.Component {
  static propTypes = {
    acknowledgeNotification: PropTypes.func.isRequired,
    confirmSignup: PropTypes.func.isRequired,
    fetchers: PropTypes.array.isRequired,
    isInvite: PropTypes.bool.isRequired,
    notification: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    seedEmail: PropTypes.string,
    trackMetric: PropTypes.func.isRequired,
    working: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    var formValues = {};
    var email = props.seedEmail;

    if (email) {
      formValues.username = email;
    }

    this.state = {
      formValues: formValues,
      validationErrors: {},
      notification: null
    };
  }

  formInputs = () => {
    let pwdType = config.CAN_SEE_PWD_LOGIN ? 'passwordShowHide' : 'password';

    return [
      { name: 'username', placeholder: t('Email'), type: 'email', disabled: !!this.props.seedEmail },
      { name: 'password', placeholder: t('Password'), type: pwdType }
    ];
  };

  componentDidMount() {
    if (this.props.trackMetric) {
      this.props.trackMetric('User Reached login page');
    }

    if (config.HELP_LINK !== null) {
      window.zESettings = {
        webWidget: {
          helpCenter: {
            filter: {
              category: '360001386093'
            }
          }
        }
      };
    }
  }

  render() {
    const form = this.renderForm();
    const inviteIntro = this.renderInviteIntroduction();
    const browserWarning = this.renderBrowserWarning();

    return (
      <div>
        <LoginNav
          page="login"
          hideLinks={Boolean(this.props.seedEmail)}
          trackMetric={this.props.trackMetric} />
        <LoginLogo />
        {inviteIntro}
        {browserWarning}
        <div className="container-small-outer login-form">
          <div className="container-small-inner login-form-box">
            <div className="login-simpleform">{form}</div>
          </div>
        </div>
      </div>
    );
  }

  renderInviteIntroduction = () => {
    if (!this.props.isInvite) {
      return null;
    }

    return (
      <div className='login-inviteIntro'>
        <p>{t('You\'ve been invited to Tidepool.')}</p><p>{t('Log in to view the invitation.')}</p>
      </div>
    );
  };

  renderBrowserWarning = () => {
    if (!utils.isChrome()) {
      return (
        <div className='login-browserWarning'>
          <br></br>
          <p>{t('BrowserWarning')}</p>
        </div>
      );
    }
  };

  renderForm = () => {
    var submitButtonText = this.props.working ? t('Logging in...') : t('Login');
    var forgotPassword = this.renderForgotPassword();

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        notification={this.state.notification || this.props.notification}>
        {<div className="login-forgotpassword">{forgotPassword}</div>}
      </SimpleForm>
    );
  };

  logPasswordReset = () => {
    this.props.trackMetric('Clicked Forgot Password');
  };

  renderForgotPassword = () => {
    return <Link to="/request-password-reset">{t('Forgot your password?')}</Link>;
  };

  handleSubmit = (formValues) => {
    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    const { user, options } = this.prepareFormValuesForSubmit(formValues);

    this.props.onSubmit(user, options);
  };

  resetFormStateBeforeSubmit = (formValues) => {
    this.props.acknowledgeNotification('loggingIn');
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  };

  validateFormValues = (formValues) => {
    var form = [
      { type: 'name', name: 'password', label: t('this field'), value: formValues.password },
      { type: 'email', name: 'username', label: t('this field'), value: formValues.username },
    ];

    var validationErrors = validateForm(form);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message: t('Some entries are invalid.')
        }
      });
    }

    return validationErrors;
  };

  prepareFormValuesForSubmit = (formValues) => {
    return {
      user: {
        username: formValues.username,
        password: formValues.password
      }
    };
  };

  doFetching = (nextProps) => {
    if (!nextProps.fetchers) {
      return;
    }
    nextProps.fetchers.forEach(fetcher => {
      fetcher();
    });
  };

  /**
   * Before rendering for first time
   * begin fetching any required data
   */
  UNSAFE_componentWillMount() {
    this.doFetching(this.props);
  }
}

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, other, api) => {
  if (other.signupKey) {
    return [
      dispatchProps.confirmSignup.bind(null, api, other.signupKey, other.signupEmail)
    ];
  }

  return [];
};

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.loggingIn.notification || state.blip.working.confirmingSignup.notification,
    working: state.blip.working.loggingIn.inProgress,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.login,
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  confirmSignup: actions.async.confirmSignup
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  let seedEmail = utils.getInviteEmail(ownProps.location) || utils.getSignupEmail(ownProps.location);
  let signupKey = utils.getSignupKey(ownProps.location);
  let isInvite = !_.isEmpty(utils.getInviteEmail(ownProps.location));
  let api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, dispatchProps, {
    fetchers: getFetchers(dispatchProps, ownProps, { signupKey, signupEmail: seedEmail }, api),
    isInvite: isInvite,
    seedEmail: seedEmail,
    trackMetric: ownProps.routes[0].trackMetric,
    onSubmit: dispatchProps.onSubmit.bind(null, api)
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Login);
