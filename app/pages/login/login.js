
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
  constructor(props) {
    super(props);

    this.state = {
      validationErrors: {},
      notification: null
    };
  }

  componentDidMount() {
    this.props.trackMetric('User Reached login page');

    if (config.HELP_LINK !== null) {
      // @ts-ignore
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

    this.doFetching();
  }

  componentDidUpdate(prevProps) {
    if (this.state.notification !== null && !_.isEqual(this.props, prevProps)) {
      // When language change, reset errors message, since they can't be translated
      this.setState({
        validationErrors: {},
        notification: null
      });
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
            <div className="login-simpleform">
              {form}
            </div>
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

  renderForm() {
    const { seedEmail, working, notification: propsNotification } = this.props;
    const { validationErrors, notification: stateNotification } = this.state;
    const submitButtonText = working ? t('Logging in...') : t('Login');
    const forgotPassword = this.renderForgotPassword();

    const formValues = {
      username: seedEmail,
      password: null,
    };

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={formValues}
        validationErrors={validationErrors}
        submitButtonText={submitButtonText}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        notification={stateNotification || propsNotification}>
          <div className="login-forgotpassword">
            {forgotPassword}
          </div>
      </SimpleForm>
    );
  }

  formInputs() {
    const pwdType = config.CAN_SEE_PWD_LOGIN ? 'passwordShowHide' : 'password';

    return [
      { name: 'username', placeholder: t('Email'), type: 'email', disabled: !_.isEmpty(this.props.seedEmail) },
      { name: 'password', placeholder: t('Password'), type: pwdType }
    ];
  }

  renderForgotPassword() {
    const logPasswordReset = () => {
      this.props.trackMetric('Clicked Forgot Password');
    };
    return <Link to="/request-password-reset" onClick={logPasswordReset}>{t('Forgot your password?')}</Link>;
  }

  handleSubmit = (formValues) => {
    if (this.props.working) {
      return;
    }

    let notification = null;
    const form = [
      { type: 'name', name: 'password', label: t('this field'), value: formValues.password },
      { type: 'email', name: 'username', label: t('this field'), value: formValues.username },
    ];
    const validationErrors = validateForm(form, false);

    if (!_.isEmpty(validationErrors)) {
      notification = {
        type: 'error',
        message: t('Some entries are invalid.')
      };
    }

    this.setState({
      validationErrors,
      notification
    }, () => {
      if (_.isEmpty(validationErrors)) {
        this.props.acknowledgeNotification('loggingIn');
        this.props.onSubmit(formValues);
      }
    });
  };

  doFetching() {
    const { fetchers } = this.props;
    if (_.isArray(fetchers)) {
      fetchers.forEach(fetcher => {
        if (_.isFunction(fetcher)) {
          fetcher();
        }
      });
    }
  }
}

Login.propTypes = {
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
Login.defaultProps = {
  seedEmail: null,
  notification: null,
};

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
    isInvite,
    seedEmail,
    trackMetric: ownProps.routes[0].trackMetric,
    onSubmit: dispatchProps.onSubmit.bind(null, api)
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Login);
