import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';

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
const win = window;

export const Login = withTranslation()(class extends React.Component {
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
    routerState: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const formValues = {
      username : '',
      password: '',
      remember: true,
    };
    const email = props.seedEmail;

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
    const { t, keycloakConfig, fetchingInfo, signupEmail, signupKey, routerState } = this.props;
    const form = this.renderForm();
    const inviteIntro = this.renderInviteIntroduction();
    const loggingIn = this.props.working;
    const isLoading =
      fetchingInfo.inProgress ||
      !(fetchingInfo.completed || !!fetchingInfo.notification) ||
      (!!keycloakConfig.url && !keycloakConfig.initialized && !keycloakConfig.error);
    const isClaimFlow = !!signupEmail && !!signupKey;
    const login = keycloakConfig.url && keycloakConfig.initialized ? (
      <Button onClick={() => keycloak.login()} disabled={loggingIn}>
        {loggingIn ? t('Logging in...') : t('Login')}
      </Button>
    ) : (
      <div className="login-simpleform">{form}</div>
    );
    const dest = routerState?.location?.query?.dest;
    const hasDest = dest && dest !== '/';
    let redirectUri = win.location.origin;
    if (hasDest) {
      redirectUri += dest;
    }
    const urlParams = new URLSearchParams(routerState?.location?.search);
    const iss = urlParams.get('iss');
    const launch = urlParams.get('launch');
    let correlationId;
    if (iss && launch && !sessionStorage.getItem('smart_correlation_id')) {
      correlationId = crypto.randomUUID();
      sessionStorage.setItem('smart_correlation_id', correlationId);
      sessionStorage.setItem('smart_iss', iss);
      sessionStorage.setItem('smart_launch', launch);

      // adding these to the redirectUri causes Epic to fail with a query param too long error right now
      // redirectUri += `?iss=${iss}&launch=${launch}&correlation_id=${correlationId}`;
    }

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
        redirectUri: redirectUri,
      });
    }

    // forward to keycloak login when available
    if (
      (
        !this.props.isInvite &&
        keycloakConfig.initialized &&
        !loggingIn &&
        !this.props.isAuthenticated &&
        !isClaimFlow
      ) || keycloakConfig?.error === 'access_denied'
    ) {
      keycloak.createLoginUrl({
        redirectUri: redirectUri,
      }).then((url) => {
        const iss = sessionStorage.getItem('smart_iss') || urlParams.get('iss');
        const launch = sessionStorage.getItem('smart_launch') || urlParams.get('launch');
        const correlationId = sessionStorage.getItem('smart_correlation_id') || urlParams.get('correlation_id');

        if (iss && launch && correlationId) {
          const additionalParams = new URLSearchParams();
          additionalParams.append('aud', iss);
          additionalParams.append('iss', iss);
          additionalParams.append('launch', launch);
          additionalParams.append('correlation_id', correlationId);
          url += `&${additionalParams.toString()}`;
        }

        win.location.href = url;
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

    const submitButtonText = this.props.working ? t('Logging in...') : t('Login');
    const forgotPassword = this.renderForgotPassword();

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
    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    const validationErrors = this.validateFormValues(formValues);
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
    const form = [
      { type: 'name', name: 'password', label: t('this field'), value: formValues.password },
      { type: 'email', name: 'username', label: t('this field'), value: formValues.username },
    ];

    const validationErrors = validateForm(form);

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

const getFetchers = (dispatchProps, ownProps, other, api) => {
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
    routerState: state.router,
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.login,
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  confirmSignup: actions.async.confirmSignup
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const location = ownProps.location;
  const signupEmail = utils.getSignupEmail(location);
  const inviteEmail = utils.getInviteEmail(location);
  const seedEmail = inviteEmail || signupEmail;
  const signupKey = utils.getSignupKey(location);
  const isInvite = !_.isEmpty(inviteEmail);
  const api = ownProps.api;
  const isAuthenticated = api.user.isAuthenticated();
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
