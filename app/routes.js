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
  const requireAuth = (nextState, replaceState) => {
    if(!appContext.api.user.isAuthenticated()) {
      replaceState({ nextPathname: nextState.location.pathname }, '/login');
    }
  };

  const requireNoAuth = (nextState, replaceState) => {
    if(appContext.api.user.isAuthenticated()) {
      replaceState({ nextPathname: nextState.location.pathname }, '/patients');
    }
  };

  return (
    <Route path='/' component={AppComponent} {...appContext.props}>
      <IndexRoute components={{login:Login}} onEnter={requireNoAuth} />
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