import _ from 'lodash';
import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AppComponent from './pages/app';
import BrowserWarning from './pages/browserwarning';
import ClinicianDetails from './pages/cliniciandetails';
import ConfirmPasswordReset from './pages/passwordreset/confirm';
import EmailVerification from './pages/emailverification';
import Login from './pages/login';
import PatientData from './pages/patientdata';
import PatientNew from './pages/patientnew';
import PatientProfile from './pages/patientprofile/patientprofile';
import Patients from './pages/patients';
import RequestPasswordReset from './pages/passwordreset/request';
import Share from './pages/share/share';
import Signup from './pages/signup';
import TermsPage from './pages/terms';
import UserProfile from './pages/userprofile';
import VerificationWithPassword from './pages/verificationwithpassword';


import utils from './core/utils';
import personUtils from './core/personutils';

import * as actions from './redux/actions';
import config from './config';

/**
 * This function checks if the user is using chrome - if they are not it will redirect
 * the user to a browser warning page
 *
 * @param  {Object} utils
 * @param  {Function} next
 */
export const requiresChrome = (utils, next) => (nextState, replace, cb) => {
  if (!utils.isAcceptedBrowser()) {
    replace('/browser-warning');
    if (_.isFunction(cb)) {
      cb();
    }
  } else if (_.isFunction(next)) {
    next(nextState, replace, cb);
  }
}

/**
 * This function redirects any requests that land on pages that should only be
 * visible when logged in if the user is logged out
 * It also redirects to the Terms of Use & Privacy Policy form if the user is logged in
 * but has not yet agreed to these
 *
 * @param  {Object} api
 * @param  {Object} store *
 * @return {(nextState, replace, cb) => void} Function for the router
 */
export const requireAuth = (api, store) => (nextState, replace, cb) => {
  const { blip: state } = store.getState();
  const { dispatch } = store;

  function checkIfAcceptedTerms(user) {
    const isPatientPage = nextState.location.pathname === '/patients';
    const isTermsPage = nextState.location.pathname === '/terms';
    const termsAccepted = personUtils.hasAcceptedTerms(user);

    if (isTermsPage && termsAccepted && !isPatientPage) {
      replace('/patients');
    } else if (!termsAccepted && !isTermsPage) {
      replace('/terms');
    }
    cb();
  }

  if (!api.user.isAuthenticated()) {
    replace('/login');
    return cb();
  } else {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    if (!_.isEmpty(user)) {
      checkIfAcceptedTerms(user);
    } else {
      dispatch(actions.async.fetchUser(api, (err, user) => checkIfAcceptedTerms(user)));
    }
  }
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when no data storage is set up if the user has data storage set up
 *
 * @param  {Object} api
 * @param  {Object} store
 * @return {(nextState, replace, cb) => void} Function for the router
 *
 */
export const requireAuthAndNoPatient = (api, store) => (nextState, replace, cb) => {
  const { blip: state } = store.getState();
  const { dispatch } = store;

  function checkUserStatus(user) {
    if (!personUtils.hasAcceptedTerms(user)) {
      replace('/terms');
    } else if (personUtils.isPatient(user)) {
      replace('/patients');
    }
    cb();
  }

  if (!api.user.isAuthenticated()) {
    replace('/login');
    return cb();
  } else {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    if (!_.isEmpty(user)) {
      checkUserStatus(user);
    } else {
      dispatch(actions.async.fetchUser(api, (err, user) => checkUserStatus(user)));
    }
  }
};

/**
 * This function ensures any logged in state is destroyed on entering a route
 *
 * @param  {Object} api
 * @return {(nextState, replace, cb) => void} Function for the router
 */
export const ensureNoAuth = (api) => (nextState, replace, cb) => {
  api.user.logout(cb);
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when logged out if the user is logged in
 *
 * @param  {Object} api
 * @return {(nextState, replace, cb) => void} Function for the router
 */
export const requireNoAuth = (api) => (nextState, replace, cb) => {
  if (api.user.isAuthenticated()) {
    replace('/patients');
  }

  if (_.isFunction(cb)) {
    cb();
  }
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when logged out (if the user is logged in) and allowed as per a boolean
 *
 * @param  {Object} api
 * @return {(nextState, replace, cb) => void} Function for the router
 */
export const requireNoAuthAndPatientSignupAllowed = (api) => (nextState, replace, cb) => {
  if (api.user.isAuthenticated()) {
    // If user is authenticated, there is no way he can go to signup
    replace('/patients');
  } else if (!config.ALLOW_SIGNUP_PATIENT) {
    // if user is not authenticated, he needs to be allowed to create personal account per the configuration
    replace('/signup');
  }

  if (_.isFunction(cb)) {
    cb();
  }
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when the user hasn't yet verified their sign-up e-mail
 * if the user already has completed the e-mail verification
 *
 * @param  {Object} api
 * @param  {Object} store
 * @return {(nextState, replace, cb) => void} Function for the router
 */
export const requireNotVerified = (api, store) => (nextState, replace, cb) => {
  function checkIfVerified(userToCheck) {
    if (userToCheck.emailVerified === true) {
      const termsAccepted = personUtils.hasAcceptedTerms(userToCheck);
      if (termsAccepted) {
        replace('/patients');
      } else {
        replace('/terms');
      }
      return cb();
    }
    // we log the user out so that requireNoAuth will work properly
    // when they try to log in
    api.user.logout(() => {
      api.log('"Logged out" user after initial set-up so that /login is accessible');
    });
    cb();
  }

  const { blip: state } = store.getState();
  const { dispatch } = store;
  const user = _.get(state.allUsersMap, state.loggedInUserId, {});
  if (!_.isEmpty(user)) {
    checkIfVerified(user);
  } else {
    dispatch(actions.async.fetchUser(api, (err, user) => {
      if (err) {
        // we expect a 401 Unauthorized when navigating to /email-verification
        // when not logged in (e.g., in a new tab after initial sign-up)
        if (err.status === 401) {
          return cb();
        }
        throw new Error('Error getting user at /email-verification');
      }

      checkIfVerified(user);
    }));
  }
}

/**
 * This function redirects the /request-password-from-uploader route to the
 * account settings/profile page where the user can change password iff the user
 * is already logged in (with token stored) to blip in their browser
 *
 * @param  {Object} api
 * @return {(nextState, replace, cb) => void} Function for the router
 */
export const onUploaderPasswordReset = (api) => (nextState, replace, cb) => {
  if (api.user.isAuthenticated()) {
    replace('/profile');
  }

  if (_.isFunction(cb)) {
    cb();
  }
}

/**
 * This function exists for backward compatibility and maps hash
 * urls to standard urls
 *
 * @param  {Object} nextState
 * @param  {Function} replace
 *
 * @return {boolean|null} returns true if hash mapping happened
 */
export const hashToUrl = (nextState, replace) => {
  let path = nextState.location.pathname;
  let hash = nextState.location.hash;

  if ((!path || path === '/') && hash) {
    replace(hash.substring(1));
    return true;
  }
}

/**
 * onEnter handler for IndexRoute.
 *
 * This function calls hashToUrl and requireNoAuth
 *
 * @param  {Object} api
 * @return {(nextState, replace, cb) => void} Function for the router
 */
export const onIndexRouteEnter = (api) => (nextState, replace, cb) => {
  if (!hashToUrl(nextState, replace)) {
    requireNoAuth(api)(nextState, replace, cb);
  }

  if (_.isFunction(cb)) {
    cb();
  }
}

/**
 * onEnter handler for all non specified routes
 *
 * This function redirects logged in users to patients
 * and non-logged in users to the login page
 * @param {Object} api see app/core/api.js
 * @returns {(nextState: Object, replace: Function, cb: Function) => void}
 */
export const onOtherRouteEnter = (api) => (nextState, replace, cb) => {
  if (api.user.isAuthenticated()) {
    replace('/patients');
  } else {
    replace('/login');
  }
  cb();
}

const trackPage = (api, next) => (nextState, replace, cb) => {
  api.metrics.track('setCustomUrl', nextState.location.pathname, () => {
    if (_.isFunction(next)) {
      next(nextState, replace, cb);
    } else if (_.isFunction(cb)) {
      cb();
    }
  });
}

/**
 * Creates the route map with authentication associated with each route built in.
 *
 * @param  {Object} appContext
 * @param {Object} store
 *
 * @return {Route} the react-router routes
 */
export const getRoutes = (appContext, store) => {
  const TOKEN_LOCAL_KEY = 'authToken';
  const localStore = window.localStorage;
  let props = appContext.props;
  let api = props.api;

  // If Blip is opened with portal-front, we may end-up having
  // the localStorage key 'authToken' but not being authenticated yet.
  // Set the user token to simulate the login process
  let authToken = localStore.getItem(TOKEN_LOCAL_KEY);
  if (!api.user.isAuthenticated() && authToken !== null) {
    api.user.setToken(authToken);
  }

  return (
    <Route path='/' component={AppComponent} {...props}>
      <IndexRoute component={Login} onEnter={trackPage(api, onIndexRouteEnter(api))} />
      <Route path='login' component={Login} onEnter={trackPage(api, requireNoAuth(api))} />
      <Route path='terms' components={TermsPage} onEnter={trackPage(api, requireAuth(api, store))} />
      <Route path='signup' component={Signup} onEnter={trackPage(api, requireNoAuth(api))} />
      <Route path='signup/personal' component={Signup} onEnter={trackPage(api, requireNoAuthAndPatientSignupAllowed(api))} />
      <Route path='signup/clinician' component={Signup} onEnter={trackPage(api, requireNoAuth(api))} />
      <Route path='clinician-details' component={ClinicianDetails} onEnter={trackPage(api, requireAuth(api, store))} />
      <Route path='email-verification' component={EmailVerification} onEnter={trackPage(api, requireNotVerified(api, store))} />
      <Route path='profile' component={UserProfile} onEnter={trackPage(api, requireAuth(api, store))} />
      <Route path='patients' component={Patients} onEnter={trackPage(api, requireAuth(api, store))} />
      <Route path='patients/new' component={PatientNew} onEnter={trackPage(api, requireAuthAndNoPatient(api, store))} />
      <Route path='patients/:id/profile' component={PatientProfile} onEnter={trackPage(api, requiresChrome(utils, requireAuth(api, store)))} />
      <Route path='patients/:id/share' component={Share} onEnter={trackPage(api, requiresChrome(utils, requireAuth(api, store)))} />
      <Route path='patients/:id/data' component={PatientData} onEnter={trackPage(api, requiresChrome(utils, requireAuth(api, store)))} />
      <Route path='request-password-reset' component={RequestPasswordReset} onEnter={trackPage(api, requireNoAuth(api))} />
      <Route path='confirm-password-reset' component={ConfirmPasswordReset} onEnter={trackPage(api, ensureNoAuth(api))} />
      <Route path='request-password-from-uploader' component={RequestPasswordReset} onEnter={trackPage(api, onUploaderPasswordReset(api))} />
      <Route path='verification-with-password' component={VerificationWithPassword} onEnter={trackPage(api, requireNoAuth(api))} />
      <Route path='browser-warning' component={BrowserWarning} onEnter={trackPage(api, null)} />
      <Route path='*' onEnter={trackPage(api, onOtherRouteEnter(api))} />
    </Route>
  );
}

export default getRoutes;
