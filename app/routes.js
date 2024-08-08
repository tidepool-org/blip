import _ from 'lodash';
import React from 'react';
import async from 'async';
import { Route, Switch, Redirect } from 'react-router-dom';
import { push } from 'connected-react-router';

import AppComponent from './pages/app';
import BrowserWarning from './pages/browserwarning';
import ClinicDetails from './pages/clinicdetails';
import ClinicAdmin from './pages/clinicadmin';
import ClinicWorkspace from './pages/clinicworkspace';
import { TideDashboard } from './pages/dashboard';
import ClinicInvite from './pages/clinicinvite';
import ClinicianEdit from './pages/clinicianedit';
import Workspaces from './pages/workspaces';
import ConfirmPasswordReset from './pages/passwordreset/confirm';
import EmailVerification from './pages/emailverification';
import Login from './pages/login';
import { PrescriptionForm } from './pages/prescription';
import OAuthConnection from './pages/oauth/OAuthConnection';
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
import UploadRedirect from './pages/uploadredirect';
import LoggedOut from './pages/loggedout';

import utils from './core/utils';
import personUtils from './core/personutils';
import config from './config';

import * as actions from './redux/actions';
import { AccessManagement, ShareInvite } from './pages/share';
import * as ErrorMessages from './redux/constants/errorMessages';

/**
 * This function checks if the user is using a supported browser - if they are not it will redirect
 * the user to a browser warning page
 *
 * @param  {Function} next
 */
export const requireSupportedBrowser = (next, ...args) => (dispatch) => {
  if (!utils.isSupportedBrowser()) {
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
  const { blip: state, router: routerState } = getState();

  const routes = {
    patients: '/patients',
    newPatient: '/patients/new',
    workspaces: '/workspaces',
    clinicDetails: '/clinic-details',
    clinicWorkspace: '/clinic-workspace',
    dashboard: '/dashboard',
  };

  if (!api.user.isAuthenticated()) {
    let dest = '';
    if (routerState?.location?.pathname) {
      dest = `?dest=${encodeURIComponent(routerState.location.pathname + routerState.location.search + routerState.location.hash)}`;
    }
    dispatch(push(`/login${dest}`));
  } else {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    if (!_.isEmpty(user)) {
      checkIfAcceptedTerms(null, user);
    } else {
      dispatch(actions.async.fetchUser(api, (err, user) => checkIfAcceptedTerms(err, user)));
    }

    function checkIfAcceptedTerms(err, user) {
      if (err) return cb();

      if (!personUtils.hasAcceptedTerms(user)) {
        dispatch(push('/terms'));
      }

      getClinicsForMember(user);
    }

    function getClinicsForMember(user) {
      if (
        !state.working.fetchingClinicsForClinician.inProgress
        && !state.working.fetchingClinicsForClinician.completed
        && !state.working.fetchingClinicsForClinician.notification
        || (
          // We should also run these checks for path restrictions in the event that the clinic
          // migration was triggered, but failed. Otherwise, a user could theoretically navigate
          // to restricted Clinic UI without completing the migration process.
          state.working.triggeringInitialClinicMigration.completed === false
        )
      ) {
        const fetchers = {
          clinics: cb => dispatch(actions.async.getClinicsForClinician(api, user.userid, { limit: 1000, offset: 0 }, cb)),
          invites: cb => dispatch(actions.async.fetchClinicianInvites(api, user.userid, cb)),
        };

        async.parallel(async.reflectAll(fetchers), (err, results) => {
          const errors = _.mapValues(results, ({error}) => error);
          const values = _.mapValues(results, ({value}) => value);

          const currentPathname = routerState.location?.pathname;
          const isClinicianAccount = personUtils.isClinicianAccount(user);
          const hasClinicianRole = _.includes(user.roles, 'clinician');
          const hasLegacyClinicRole = _.includes(user.roles, 'clinic');
          const hasClinicProfile = !!_.get(user, ['profile', 'clinic'], false);
          const firstEmptyOrUnmigratedClinic = _.find(values.clinics, clinic => _.isEmpty(clinic.clinic?.name) || clinic.clinic?.canMigrate);

          const unrestrictedClinicUIRoutes = [
            routes.clinicDetails,
            routes.workspaces,
          ];

          const restrictedClinicUIRoutes = [
            '/clinic-admin',
            '/clinic-invite',
            '/clinic-profile',
            '/clinic-workspace',
            '/clinician-edit',
            '/prescriptions',
          ];

          const isClinicUIRoute = _.some([...unrestrictedClinicUIRoutes, ...restrictedClinicUIRoutes], route => _.startsWith(currentPathname, route));
          const isRestrictedClinicUIRoute = _.some(restrictedClinicUIRoutes, route => _.startsWith(currentPathname, route));

          if (err || errors?.clinics) {
            // In this case, we can't reliably know whether a user even has associated clinics,
            // let alone the migration/profile state, so we send them to the patients page if they
            // are on any Clinic UI route, except for the clinician account details route, where
            // missing clinic information would be irrelevant.
            if (isClinicUIRoute && !_.startsWith(currentPathname, routes.clinicDetails)) dispatch(push(routes.patients));
            return cb();
          }

          if (hasLegacyClinicRole && (firstEmptyOrUnmigratedClinic || !hasClinicProfile)) {
            // Navigate to the appropriate page for a legacy clinician user or team member who needs to
            // complete the setup process
            if (firstEmptyOrUnmigratedClinic) dispatch(actions.async.selectClinic(api, firstEmptyOrUnmigratedClinic.clinic.id));
            const routeState = { selectedClinicId: state.selectedClinicId || null };
            const routeAction = firstEmptyOrUnmigratedClinic ? 'migrate' : 'profile';
            dispatch(push(`${routes.clinicDetails}/${routeAction}`, routeState));
          } else if (hasClinicianRole && !hasClinicProfile) {
            dispatch(push(`${routes.clinicDetails}/profile`));
          } else if (values.invites?.length) {
            // Redirect user to address clinic invite, or first fill in profile info if missing
            dispatch(push(!hasClinicProfile ? `${routes.clinicDetails}/profile` : routes.workspaces));
          } else if (
            (isClinicUIRoute && !isClinicianAccount) ||
            (isRestrictedClinicUIRoute && !(state.clinicFlowActive || state.selectedClinicId))
          ) {
            // Redirect non clinic members to the patients page if they access a clinic UI page
            dispatch(push(routes.patients));
          }

          cb();
        });
      } else {
        // if we've already fetched clinic information, we can use current state to check
        // for route restriction based on account type and clinic selection
        if (
          !state.working.fetchingClinicsForClinician.inProgress &&
          state.working.fetchingClinicsForClinician.completed &&
          !state.working.fetchingClinicsForClinician.notification
        ) {
          const currentPathname = routerState?.location?.pathname;
          const isClinicianAccount = personUtils.isClinicianAccount(user);
          const hasClinicProfile = !!_.get(user, ['profile', 'clinic'], false);
          const isPatientAccount = _.includes(user.roles, 'patient');
          const hasProfileFullName = !_.isEmpty(user.profile.fullName);

          const unrestrictedClinicUIRoutes = [routes.workspaces];

          const requireSelectedClinicUIRoutes = [
            '/clinic-admin',
            '/clinic-details',
            '/clinic-invite',
            '/clinic-profile',
            '/clinic-workspace',
            '/clinician-edit',
            '/prescriptions',
            routes.dashboard,
          ];

          const isCreateNewClinicRoute = _.startsWith(
            currentPathname,
            '/clinic-details/new'
          );

          const isClinicProfileRoute = _.startsWith(
            currentPathname,
            '/clinic-details/profile'
          );

          const isClinicUIRoute = _.some(
            [...unrestrictedClinicUIRoutes, ...requireSelectedClinicUIRoutes],
            (route) => _.startsWith(currentPathname, route)
          );

          const isRestrictedClinicUIRoute = _.some(
            requireSelectedClinicUIRoutes,
            (route) => _.startsWith(currentPathname, route)
          );

          if (isClinicUIRoute && !isClinicianAccount) {
            dispatch(push(routes.patients));
          } else {
            if (
              isRestrictedClinicUIRoute &&
              !(
                state.clinicFlowActive &&
                (state.selectedClinicId || isCreateNewClinicRoute || (isClinicProfileRoute && !hasClinicProfile))
              )
            ) {
              dispatch(push(routes.workspaces));
            }
          }

          if (isPatientAccount && !hasProfileFullName) {
            dispatch(push(routes.newPatient));
          }
        }
        cb();
      }
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
  const { blip: state, router: routerState } = getState();
  if (routerState?.location?.query?.ssoEnabled === 'true') {
    dispatch(actions.sync.setSSOEnabledDisplay(true));
  }
  if (api.user.isAuthenticated()) {
    const user = _.get(state.allUsersMap, state.loggedInUserId, {});
    const isClinicianAccount = personUtils.isClinicianAccount(user);
    const hasClinicProfile = !!_.get(user, ['profile', 'clinic'], false);
    const firstEmptyOrUnmigratedClinic = _.find(state.clinics, clinic => _.isEmpty(clinic.name) || clinic.canMigrate);

    // We don't want to navigate forward to a workspace if a clinician who needs to set up their
    // profile, or a clinician profile, navigates to the root url with the browser back button
    if (isClinicianAccount && (firstEmptyOrUnmigratedClinic || !hasClinicProfile)) {
      if (firstEmptyOrUnmigratedClinic) dispatch(actions.async.selectClinic(api, firstEmptyOrUnmigratedClinic.id));
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
        if(err.message !== ErrorMessages.ERR_EMAIL_NOT_VERIFIED){
          // we expect a 401 Unauthorized when navigating to /email-verification
          // when not logged in (e.g., in a new tab after initial sign-up)
          if (err.status === 401) {
            return cb();
          }
          const error = new Error('Error getting user at /email-verification');
          error.originalError = err;
          throw error;
        }
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
  cb();
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
  const boundRequireSupportedBrowser = requireSupportedBrowser.bind(null, boundRequireAuth);
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
          <Route path='/clinic-admin' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicAdmin {...routeProps} {...props} /></Gate>)} />
          <Route path='/clinic-details/:action' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicDetails {...routeProps} {...props} /></Gate>)} />
          <Route path='/clinic-invite' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicInvite {...routeProps} {...props} /></Gate>)} />
          <Route path='/clinic-workspace/:tab?' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicWorkspace {...routeProps} {...props} /></Gate>)} />
          <Route path='/dashboard/tide' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><TideDashboard {...routeProps} {...props} /></Gate>)} />
          <Route path='/clinician-edit' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ClinicianEdit {...routeProps} {...props} /></Gate>)} />
          <Route path='/workspaces' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><Workspaces {...routeProps} {...props} /></Gate>)} />
          <Route path='/email-verification' render={routeProps => (<Gate onEnter={boundRequireNotVerified} key={routeProps.match.path}><EmailVerification {...routeProps} {...props} /></Gate>)} />
          <Route path='/profile' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><UserProfile {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><Patients {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients/new' render={routeProps => (<Gate onEnter={boundRequireAuthAndNoPatient} key={routeProps.match.path}><PatientNew {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/prescriptions/new' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><PrescriptionForm {...routeProps} {...props} /></Gate>)} />}
          <Route exact path='/prescriptions/:id' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><PrescriptionForm {...routeProps} {...props} /></Gate>)} />}
          <Route exact path='/patients/:id/profile' render={routeProps => (<Gate onEnter={boundRequireSupportedBrowser} key={routeProps.match.path}><PatientProfile {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients/:id/share' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><AccessManagement {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients/:id/share/invite' render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><ShareInvite {...routeProps} {...props} /></Gate>)} />
          <Route exact path='/patients/:id/data' render={routeProps => (<Gate onEnter={boundRequireSupportedBrowser} key={routeProps.match.path}><PatientData {...routeProps} {...props} /></Gate>)} />
          <Route path='/request-password-reset' render={routeProps => (<Gate onEnter={boundRequireNoAuth} key={routeProps.match.path}><RequestPasswordReset {...routeProps} {...props} /></Gate>)} />
          <Route path='/confirm-password-reset' render={routeProps => (<Gate onEnter={boundEnsureNoAuth} key={routeProps.match.path}><ConfirmPasswordReset {...routeProps} {...props} /></Gate>)} />
          <Route path='/oauth/:providerName/:status' render={routeProps => (<OAuthConnection {...routeProps} {...props} />)} />
          <Route path='/request-password-from-uploader' render={routeProps => (<Gate onEnter={boundOnUploaderPasswordReset} key={routeProps.match.path}><RequestPasswordReset {...routeProps} {...props} /></Gate>)} />
          <Route path='/verification-with-password' render={routeProps => (<Gate onEnter={boundRequireNoAuth} key={routeProps.match.path}><VerificationWithPassword {...routeProps} {...props} /></Gate>)} />
          <Route path='/browser-warning' render={routeProps => (<BrowserWarning {...routeProps} {...props} />)} />
          <Route path="/upload-redirect" render={routeProps => (<Gate onEnter={boundRequireAuth} key={routeProps.match.path}><UploadRedirect {...routeProps} {...props} /></Gate>)} />
          <Route path="/logged-out" render={routeProps => (<LoggedOut {...routeProps} {...props}/>)} />
          <Route>
            { api.user.isAuthenticated() ? <Redirect to={authenticatedFallbackRoute} /> : <Redirect to='/login' /> }
          </Route>
        </Switch>
      </AppComponent>
    )} />
  );
}
