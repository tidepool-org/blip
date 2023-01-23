import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next';

import * as actions from '../../redux/actions';

import { Link } from 'react-router-dom';
import _ from 'lodash';

import utils from '../../core/utils';
import { validateForm } from '../../core/validation';

import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo/loginlogo';
import SimpleForm from '../../components/simpleform';
import Button from '../../components/elements/Button';
import { components as vizComponents} from '@tidepool/viz';
const { Loader } = vizComponents;
import { keycloak } from '../../keycloak';
let win = window;

export let Login = translate()(class extends React.Component {
  static propTypes = {
    acknowledgeNotification: PropTypes.func.isRequired,
    confirmSignup: PropTypes.func.isRequired,
    fetchers: PropTypes.array.isRequired,
    isInvite: PropTypes.bool.isRequired,
    notification: PropTypes.object,
    onSubmit: PropTypes.func.isRequired,
    seedEmail: PropTypes.string,
    trackMetric: PropTypes.func.isRequired,
    working: PropTypes.bool.isRequired,
    keycloakConfig: PropTypes.object,
    fetchingInfo: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    signupEmail: PropTypes.string,
    signupKey: PropTypes.string,
  };

  constructor(props) {
    super(props);
    var formValues = {
      username : '',
      password: '',
      remember: true,
    };
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
    const { t } = this.props;

    return [
      { name: 'username', placeholder: t('Email'), type: 'email', disabled: !!this.props.seedEmail, autoFocus: true },
      { name: 'password', placeholder: t('Password'), type: 'password' },
      { name: 'remember', label: t('Remember me'), type: 'checkbox' }
    ];
  };

  render() {
    const { t, keycloakConfig, fetchingInfo, signupEmail, signupKey } = this.props;
    var form = this.renderForm();
    var inviteIntro = this.renderInviteIntroduction();
    var loggingIn = this.props.working;
    var isLoading =
      fetchingInfo.inProgress ||
      !(fetchingInfo.completed || !!fetchingInfo.notification) ||
      (!!keycloakConfig.url && !keycloakConfig.initialized && !keycloakConfig.error);
    var isClaimFlow = !!signupEmail && !!signupKey;
    var login = keycloakConfig.url && keycloakConfig.initialized ? (
      <Button onClick={() => keycloak.login()} disabled={loggingIn}>
        {loggingIn ? t('Logging in...') : t('Login')}
      </Button>
    ) : (
      <div className="login-simpleform">{form}</div>
    );

    // for those accepting an invite, forward to keycloak login when available
    if (
      this.props.isInvite &&
      keycloakConfig.initialized &&
      !loggingIn &&
      !this.props.isAuthenticated &&
      !isClaimFlow
    ) {
      keycloak.login({
        loginHint: this.props.seedEmail,
        redirectUri: win.location.origin
      });
    }

    // forward to keycloak login when available
    if (
      (
        keycloakConfig.initialized &&
        !loggingIn &&
        !this.props.isAuthenticated &&
        !isClaimFlow
      ) || keycloakConfig?.error === 'access_denied'
    ) {
      keycloak.login({
        redirectUri: win.location.origin,
      });
      return <></>;
    }

    return (
      <div className="login">
        <Loader show={isLoading} overlay={true} />
        <LoginNav
          page="login"
          hideLinks={Boolean(this.props.seedEmail)}
          trackMetric={this.props.trackMetric}
          keycloakConfig={this.props.keycloakConfig}
        />
        <LoginLogo />
        {inviteIntro}
        <div className="container-small-outer login-form">
          <div className="container-small-inner login-form-box">
            {isLoading ? null : login}
          </div>
        </div>
      </div>
    );
  }

  renderInviteIntroduction = () => {
    const { t } = this.props;
    if (!this.props.isInvite) {
      return null;
    }

    return (
      <div className='login-inviteIntro'>
        <p>{t('You\'ve been invited to Tidepool.')}</p><p>{t('Log in to view the invitation.')}</p>
      </div>
    );
  };

  renderForm = () => {
    const { t } = this.props;

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
    const { t } = this.props;
    return <Link to="/request-password-reset">{t('Forgot your password?')}</Link>;
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
    const { t } = this.props;
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
      },
      options: {
        remember: formValues.remember,
        location: this.props.location
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
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, other, api) => {
  if (other.signupKey && !other.confirmingSignup.inProgress) {
    return [
      dispatchProps.confirmSignup.bind(null, api, other.signupKey, other.signupEmail)
    ];
  }

  return [];
}

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.loggingIn.notification || state.blip.working.confirmingSignup.notification,
    working: state.blip.working.loggingIn.inProgress,
    fetchingInfo: state.blip.working.fetchingInfo,
    keycloakConfig: state.blip.keycloakConfig,
    confirmingSignup: state.blip.working.confirmingSignup,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.login,
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  confirmSignup: actions.async.confirmSignup
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  let location = ownProps.location;
  let signupEmail = utils.getSignupEmail(location);
  let inviteEmail = utils.getInviteEmail(location);
  let seedEmail = inviteEmail || signupEmail;
  let signupKey = utils.getSignupKey(location);
  let isInvite = !_.isEmpty(inviteEmail);
  let api = ownProps.api;
  let isAuthenticated = api.user.isAuthenticated();
  return Object.assign({}, stateProps, dispatchProps, {
    fetchers: getFetchers(dispatchProps, ownProps, { signupKey, signupEmail: seedEmail, confirmingSignup: stateProps.confirmingSignup }, api),
    isAuthenticated: isAuthenticated,
    isInvite: isInvite,
    seedEmail: seedEmail,
    trackMetric: ownProps.trackMetric,
    onSubmit: dispatchProps.onSubmit.bind(null, api),
    location: location,
    signupEmail: signupEmail,
    signupKey: signupKey,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Login);
