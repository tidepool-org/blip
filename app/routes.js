import React from 'react';
import { Route, IndexRoute } from 'react-router';

import AppComponent from './components/app';
import Patients from './pages/patients';
import Login from './pages/login';
import Signup from './pages/signup';
import Profile from './pages/profile';
import Patient from './pages/patient';
import PatientNew from './pages/patientnew';
import PatientData from './pages/patientdata';
import RequestPasswordReset from './pages/passwordreset/request';
import ConfirmPasswordReset from './pages/passwordreset/confirm';
import EmailVerification from './pages/emailverification';

/**
 * Creates the route map with authentication associated with each route built in.
 * 
 * @param  {Object} appContext
 * @return {Route} the react-router routes
 */
export default (appContext) => {
  /**
   * This function redirects any requests that land on pages that should only be
   * visible when logged in if the user is logged out
   * 
   * @param  {Object} nextState
   * @param  {Function} replaceState
   *
   * @return {boolean|null} returns true if hash mapping happened
   */
  const requireAuth = (nextState, replaceState) => {
    if(!appContext.api.user.isAuthenticated()) {
      replaceState(null, '/login');
    }
  };

  /**
   * This function redirects any requests that land on pages that should only be
   * visible when logged out if the user is logged in
   * 
   * @param  {Object} nextState
   * @param  {Function} replaceState
   *
   * @return {boolean|null} returns true if hash mapping happened
   */
  const requireNoAuth = (nextState, replaceState) => {
    if(appContext.api.user.isAuthenticated()) {
      replaceState(null, '/patients');
    }
  };

  /**
   * This function exists for backward compatibility and maps hash
   * urls to standard urls
   * 
   * @param  {Object} nextState
   * @param  {Function} replaceState
   *
   * @return {boolean|null} returns true if hash mapping happened
   */
  const hashToUrl = (nextState, replaceState) => {
    let path = nextState.location.pathname;
    let hash = nextState.location.hash;

    if((!path || path === '/') && hash) {
      replaceState(null, hash.substring(2));
      return true;
    }
  }

  /**
   * onEnter handler for IndexRoute.
   *
   * This function calls hashToUrl and requireNoAuth
   * 
   * @param  {Object} nextState
   * @param  {Function} replaceState
   */
  const onIndexRouteEnter = (nextState, replaceState) => {
    if (!hashToUrl(nextState, replaceState)) {
      requireNoAuth(nextState, replaceState);
    }
  }

  return (
    <Route path='/' component={AppComponent} {...appContext.props}>
      <IndexRoute components={{login:Login}} onEnter={onIndexRouteEnter} />
      <Route path='login' components={{login:Login}} onEnter={requireNoAuth} />
      <Route path='signup' components={{signup: Signup}} onEnter={requireNoAuth} />
      <Route path='email-verification' components={{emailVerification: EmailVerification}} onEnter={requireNoAuth} />
      <Route path='profile' components={{profile: Profile}} onEnter={requireAuth} />
      <Route path='patients' components={{patients: Patients}} onEnter={requireAuth} />
      <Route path='patients/new' components={{patientNew: PatientNew}} onEnter={requireAuth} />
      <Route path='patients/:id/profile' components={{patient: Patient}} onEnter={requireAuth} />
      <Route path='patients/:id/share' components={{patientShare: Patient}} onEnter={requireAuth} />
      <Route path='patients/:id/data' components={{patientData: PatientData}} onEnter={requireAuth} />
      <Route path='request-password-reset' components={{requestPasswordReset: RequestPasswordReset}} onEnter={requireNoAuth} />
      <Route path='confirm-password-reset' components={{ confirmPasswordReset: ConfirmPasswordReset}} onEnter={requireNoAuth} />
      <Route path='request-password-from-uploader' components={{ requestPasswordReset: RequestPasswordReset}} onEnter={requireNoAuth} />
    </Route>
  );
}