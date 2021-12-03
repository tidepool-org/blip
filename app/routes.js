import _ from 'lodash';
import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { push } from 'connected-react-router';

import AppComponent from './pages/app';
import BrowserWarning from './pages/browserwarning';
import ClinicianDetails from './pages/cliniciandetails';
import ClinicDetails from './pages/clinicdetails';
import ClinicAdmin from './pages/clinicadmin';
import ClinicWorkspace from './pages/clinicworkspace';
import ClinicInvite from './pages/clinicinvite';
import ClinicianEdit from './pages/clinicianedit';
import Workspaces from './pages/workspaces';
import ConfirmPasswordReset from './pages/passwordreset/confirm';
import EmailVerification from './pages/emailverification';
import Login from './pages/login';
import { PrescriptionForm } from './pages/prescription';
import PatientData from './pages/patientdata';
import PatientNew from './pages/patientnew';
import PatientProfile from './pages/patientprofile/patientprofile';
import Patients from './pages/patients';
import RequestPasswordReset from './pages/passwordreset/request';
import Signup from './pages/signup';
import Terms from './pages/terms';
import UserProfile from './pages/userprofile';
import VerificationWithPassword from './pages/verificationwithpassword';
import Gate from './components/gate';

import utils from './core/utils';
import personUtils from './core/personutils';
import config from './config';

import * as actions from './redux/actions';
import { AccessManagement, InviteClinic, InviteMember } from './pages/share';

/**
 * This function checks if the user is using chrome - if they are not it will redirect
 * the user to a browser warning page
 *
 * @param  {Function} next
 */
export const requireChrome = (next, ...args) => (dispatch) => {
  if (!utils.isChrome()) {
    dispatch(push('/browser-warning'));
  } else {
    !!next && dispatch(next(...args));
  }
}

/**
 * This function redirects any requests that land on pages that should only be
 * visible when logged in if the user is logged out
 * It also redirects to the Terms of Use & Privacy Policy form if the user is logged in
 * but has not yet agreed to these
 *
 * @param  {Object} api
 *
 */
export const requireAuth = (api, cb = _.noop) => (dispatch, getState) => {
  const { blip: state } = getState();

  if (!api.user.isAuthenticated()) {
    dispatch(push('/login'));
  } else {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    if (!_.isEmpty(user)) {
      checkIfAcceptedTerms(user);
    } else {
      dispatch(actions.async.fetchUser(api, (err, user) => checkIfAcceptedTerms(user)));
    }

    function checkIfAcceptedTerms(user) {
      if (!personUtils.hasAcceptedTerms(user)) {
        dispatch(push('/terms'));
      }
      getClinicsForMember(user);
    }

    function getClinicsForMember(user) {
      if (
        config.CLINICS_ENABLED
        && !state.working.fetchingClinicsForClinician.inProgress
        && !state.working.fetchingClinicsForClinician.completed
        && !state.working.fetchingClinicsForClinician.notification
      ) {
        dispatch(actions.async.getClinicsForClinician(api, user.userid));
      }
      cb();
    }
  }
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when no data storage is set up if the user has data storage set up
 *
 * @param  {Object} api
 *
 */
export const requireAuthAndNoPatient = (api, cb = _.noop) => (dispatch, getState) => {
  const { blip: state } = getState();

  if (!api.user.isAuthenticated()) {
    dispatch(push('/login'));
  } else {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    if (!_.isEmpty(user)) {
      checkUserStatus(user);
    } else {
      dispatch(actions.async.fetchUser(api, (err, user) => checkUserStatus(user)));
    }
    function checkUserStatus(user) {
      if (!personUtils.hasAcceptedTerms(user)) {
        dispatch(push('/terms'));
      }
      if (personUtils.isPatient(user)) {
        dispatch(push('/patients'));
      }
      cb();
    }
  }
};

/**
 * This function ensures any logged in state is destroyed on entering a route
 *
 */
export const ensureNoAuth = (api, cb = _.noop) => () => {
  api.user.logout(cb);
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when logged out if the user is logged in
 *
 * @param  {Object} api
 */
export const requireNoAuth = (api, cb = _.noop) => (dispatch, getState) => {
  const { blip: state } = getState();
  if (api.user.isAuthenticated()) {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    const isClinicianAccount = personUtils.isClinicianAccount(user);
    const hasClinicProfile = !!_.get(user, ['profile', 'clinic'], false);
    const firstEmptyClinic = _.find(state.clinics, clinic => _.isEmpty(clinic.name) && !clinic.canMigrate);

    // We don't want to navigate forward to a workspace if a clinician who needs to set up their
    // profile, or a clinician profile, navigates to the root url with the browser back button
    if (isClinicianAccount && (firstEmptyClinic || !hasClinicProfile)) {
      if (firstEmptyClinic) dispatch(actions.sync.selectClinic(firstEmptyClinic.id));
      dispatch(push(state.clinicFlowActive || state.selectedClinicId ? '/clinic-details' : '/clinician-details'));
    } else {
      dispatch(push(state.clinicFlowActive || state.selectedClinicId ? '/workspaces' : '/patients'));
    }
  }
  cb();
};

/**
 * This function redirects any requests that land on pages that should only be
 * visible when the user hasn't yet verified their sign-up e-mail
 * if the user already has completed the e-mail verification
 *
 * @param  {Object} api
 */
export const requireNotVerified = (api, cb = _.noop) => (dispatch, getState) => {
  const { blip: state } = getState();
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
        const error = new Error('Error getting user at /email-verification');
        error.originalError = err;
        throw error;
      }

      checkIfVerified(user);
    }));
  }

  function checkIfVerified(userToCheck) {
    if (userToCheck.emailVerified === true) {
      if (!personUtils.hasAcceptedTerms(userToCheck)) {
        dispatch(push('/terms'));
        return;
      }
      dispatch(push('/patients'));
      return;
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
 * @param  {Object} api
 */
export const onUploaderPasswordReset = (api, cb = _.noop) => (dispatch) => {
  if (api.user.isAuthenticated()) {
    dispatch(push('/profile'));
  }
  cb()
}

/**
 * Creates the route map with authentication associated with each route built in.
 *
 * @param  {Object} appContext
 *
 * @return {Route} the react-router routes
 */
export const getRoutes = (appContext) => {
  let props = appContext.props;
  let api = props.api;
  const { blip: state } = appContext.store.getState();

  const boundRequireNoAuth = requireNoAuth.bind(null, api);
  const boundRequireAuth = requireAuth.bind(null, api);
  const boundRequireNotVerified = requireNotVerified.bind(null, api);
  const boundRequireAuthAndNoPatient = requireAuthAndNoPatient.bind(null, api);
  const boundRequireChrome = requireChrome.bind(null, boundRequireAuth);
  const boundEnsureNoAuth = ensureNoAuth.bind(null, api);
  const boundOnUploaderPasswordReset = onUploaderPasswordReset.bind(null, api);
  const authenticatedFallbackRoute = state.selectedClinicId ? '/workspaces' : '/patients';

  return (
    <Route path='/' {...props} render={routeProps => (
      <AppComponent {...routeProps} {...props}>
        <Switch>
          <Route exact path='/' render={routeProps => (<Gate onEnter={boundRequireNoAuth} key={routeProps.match.path}><Login {...routeProps} {...props} /></Gate>)} />
          <Route path='/login' render={routeProps => (<Gate onEnter={boundRequireNoAuth} key={routeProps.match.path}><Login {...routeProps} {...props} /></Gate>)} />
          <Route path='/terms' render={routeProps => (<Terms {...routeProps} {...props} />)} />
          <Route path='/signup' render={routeProps => (<Gate onEnter={boundRequireNoAuth} key={routeProps.match.path}><Signup {...routeProps} {...props} /></Gate>)} />
          <Route path='/clinician-details' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicianDetails {...routeProps} {...props} /></Gate>)} />
          {config.CLINICS_ENABLED && <Route path='/clinic-admin' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicAdmin {...routeProps} {...props} /></Gate>)} />}
          {config.CLINICS_ENABLED && <Route path='/clinic-details' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicDetails {...routeProps} {...props} /></Gate>)} />}
          {config.CLINICS_ENABLED && <Route path='/clinic-invite' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicInvite {...routeProps} {...props} /></Gate>)} />}
          {config.CLINICS_ENABLED && <Route path='/clinic-workspace/:tab?' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicWorkspace {...routeProps} {...props} /></Gate>)} />}
          {config.CLINICS_ENABLED && <Route path='/clinician-edit' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicianEdit {...routeProps} {...props} /></Gate>)} />}
          {config.CLINICS_ENABLED && <Route path='/workspaces' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><Workspaces {...routeProps} {...props} /></Gate>)} />}
          <Route path='/email-verification' render={routeProps => (<Gate onEnter={boundRequireNotVerified} key={routeProps.match.path}><EmailVerification {...routeProps} {...props} /></Gate>)} />
          <Route path='/profile' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><UserProfile {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><Patients {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients/new' render={routeProps => (<Gate onEnter={boundRequireAuthAndNoPatient} key={routeProps.match.path}><PatientNew {...routeProps} {...props} /></Gate>)} />
          {config.RX_ENABLED && <Route exact path='/prescriptions/new' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><PrescriptionForm {...routeProps} {...props} /></Gate>)} />}
          {config.RX_ENABLED && <Route exact path='/prescriptions/:id' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><PrescriptionForm {...routeProps} {...props} /></Gate>)} />}
          <Route exact path='/patients/:id/profile' render={routeProps => (<Gate onEnter={boundRequireChrome} key={routeProps.match.path}><PatientProfile {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients/:id/share' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><AccessManagement {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients/:id/share/member' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><InviteMember {...routeProps} {...props} /></Gate>)} />
          {config.CLINICS_ENABLED && <Route exact path='/patients/:id/share/clinic' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><InviteClinic {...routeProps} {...props} /></Gate>)} />}
          <Route exact path='/patients/:id/data' render={routeProps => (<Gate onEnter={boundRequireChrome} key={routeProps.match.path}><PatientData {...routeProps} {...props} /></Gate>)} />
          <Route path='/request-password-reset' render={routeProps => (<Gate onEnter={boundRequireNoAuth} key={routeProps.match.path}><RequestPasswordReset {...routeProps} {...props} /></Gate>)} />
          <Route path='/confirm-password-reset' render={routeProps => (<Gate onEnter={boundEnsureNoAuth} key={routeProps.match.path}><ConfirmPasswordReset {...routeProps} {...props} /></Gate>)} />
          <Route path='/request-password-from-uploader' render={routeProps => (<Gate onEnter={boundOnUploaderPasswordReset} key={routeProps.match.path}><RequestPasswordReset {...routeProps} {...props} /></Gate>)} />
          <Route path='/verification-with-password' render={routeProps => (<Gate onEnter={boundRequireNoAuth} key={routeProps.match.path}><VerificationWithPassword {...routeProps} {...props} /></Gate>)} />
          <Route path='/browser-warning' render={routeProps => (<BrowserWarning {...routeProps} {...props} />)} />
          <Route>
            { api.user.isAuthenticated() ? <Redirect to={authenticatedFallbackRoute} /> : <Redirect to='/login' /> }
          </Route>
        </Switch>
      </AppComponent>
    )} />
  );
}
