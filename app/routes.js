import _ from 'lodash';
import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AppComponent from './pages/app';
import Patients from './pages/patients';
import Login from './pages/login';
import Signup from './pages/signup';
import Profile from './pages/profile';
import PatientProfile from './pages/patient/patientprofile';
import PatientCareTeam from './pages/patient/patientcareteam'
import PatientNew from './pages/patientnew';
import PatientData from './pages/patientdata';
import RequestPasswordReset from './pages/passwordreset/request';
import ConfirmPasswordReset from './pages/passwordreset/confirm';
import EmailVerification from './pages/emailverification';
import Terms from './pages/terms';

import personUtils from './core/personutils';

/**
 * This function redirects any requests that land on pages that should only be
 * visible when logged in if the user is logged out
 * It also redirects to the Terms of Use & Privacy Policy form if the user is logged in
 * but has not yet agreed to these
 *
 * @param  {Object} nextState
 * @param  {Function} replace
 *
 * @return {boolean|null} returns true if hash mapping happened
 */
export const requireAuth = (api, store) => (nextState, replace, cb) => {
  let { blip: state } = store.getState();

  if (!api.user.isAuthenticated()) {
    replace('/login');
    return cb();
  } else {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    if (!_.isEmpty(user)) {
      checkIfAcceptedTerms(user);
    } else {
      api.user.get(function(err, user) {
        checkIfAcceptedTerms(user);
      });
    }
    function checkIfAcceptedTerms(user) {
      if (!personUtils.hasAcceptedTerms(user)) {
        replace('/terms');
      }
      cb();
    }
  }
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when no data storage is set up if the user has data storage set up
 *
 * @param  {Object} nextState
 * @param  {Function} replace
 *
 * @return {boolean|null} returns true if hash mapping happened
 */
export const requireAuthAndNoPatient = (api, store) => (nextState, replace, cb) => {
  let { blip: state } = store.getState();

  if (!api.user.isAuthenticated()) {
    replace('/login');
    return cb();
  } else {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    if (!_.isEmpty(user)) {
      checkIfPatient(user);
    } else {
      api.user.get(function(err, user) {
        checkIfPatient(user);
      });
    }
    function checkIfPatient(user) {
      if (personUtils.isPatient(user)) {
        replace('/patients');
      }
      cb();
    }
  }
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when logged out if the user is logged in
 *
 * @param  {Object} nextState
 * @param  {Function} replace
 *
 * @return {boolean|null} returns true if hash mapping happened
 */
export const requireNoAuth = (api) => (nextState, replace) => {
  if (api.user.isAuthenticated()) {
    replace('/patients');
  }
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when the user hasn't yet verified their sign-up e-mail
 * if the user already has completed the e-mail verification
 *
 * @param  {Object} nextState
 * @param  {Function} replace
 *
 * @return {boolean|null} returns true if hash mapping happened
 */
export const requireNotVerified = (api, store) => (nextState, replace, cb) => {
  let { blip: state } = store.getState();
  const user = _.get(state.allUsersMap, state.loggedInUserId, {});
  if (!_.isEmpty(user)) {
    checkIfVerified(user);
  } else {
    api.user.get(function(err, user) {
      if (err) {
        // we expect a 401 Unauthorized when navigating to /email-verification
        // when not logged in (e.g., in a new tab after initial sign-up)
        if (err.status === 401) {
          return cb();
        }
        throw new Error('Error getting user at /email-verification');
        return cb();
      }

      checkIfVerified(user);
    });
  }

  function checkIfVerified(userToCheck) {
    if (userToCheck.emailVerified === true) {
      if (!personUtils.hasAcceptedTerms(userToCheck)) {
        replace('/terms');
        return cb();
      }
      replace('/patients');
      return cb();
    }
    // we log the user out so that requireNoAuth will work properly
    // when they try to log in
    api.user.logout(() => {
      api.log('"Logged out" user after initial set-up so that /login is accessible');
    });
    cb();
  }
}

/**
 * This function redirects the /request-password-from-uploader route to the
 * account settings/profile page where the user can change password iff the user
 * is already logged in (with token stored) to blip in their browser
 *
 * @param  {Object} nextState
 * @param  {Function} replace
 *
 * @return {boolean|null} returns true if hash mapping happened
 */
export const onUploaderPasswordReset = (api) => (nextState, replace) => {
  if (api.user.isAuthenticated()) {
    replace('/profile');
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
 * @param  {Object} nextState
 * @param  {Function} replace
 */
export const onIndexRouteEnter = (api, store) => (nextState, replace) => {
  if (!hashToUrl(nextState, replace)) {
    requireNoAuth(api)(nextState, replace);
  }
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
  let props = appContext.props;
  let api = props.api;

  return (
    <Route path='/' component={AppComponent} {...props}>
      <IndexRoute component={Login} onEnter={onIndexRouteEnter(api, store)} />
      <Route path='login' component={Login} onEnter={requireNoAuth(api)} />
      <Route path='terms' components={Terms} />
      <Route path='signup' component={Signup} onEnter={requireNoAuth(api)} />
      <Route path='email-verification' component={EmailVerification} onEnter={requireNotVerified(api, store)} />
      <Route path='profile' component={Profile} onEnter={requireAuth(api, store)} />
      <Route path='patients' component={Patients} onEnter={requireAuth(api, store)} />
      <Route path='patients/new' component={PatientNew} onEnter={requireAuthAndNoPatient(api, store)} />
      <Route path='patients/:id/profile' component={PatientProfile} onEnter={requireAuth(api, store)} />
      <Route path='patients/:id/share' component={PatientCareTeam} onEnter={requireAuth(api, store)} />
      <Route path='patients/:id/data' component={PatientData} onEnter={requireAuth(api, store)} />
      <Route path='request-password-reset' component={RequestPasswordReset} onEnter={requireNoAuth(api)} />
      <Route path='confirm-password-reset' component={ConfirmPasswordReset} onEnter={requireNoAuth(api)} />
      <Route path='request-password-from-uploader' component={RequestPasswordReset} onEnter={onUploaderPasswordReset(api)} />
    </Route>
  );
}
