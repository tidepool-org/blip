import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import Patient from '../patient/';
import { clinicPatientFromAccountInfo } from '../../core/personutils';
import { DATA_DONATION_CONSENT_TYPE } from '../../core/constants';

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function getFetchers(dispatchProps, ownProps, stateProps, api) {
  const isUserPatient = ownProps.match.params.id === stateProps.user?.userid;

  const fetchers = [
    dispatchProps.fetchPatient.bind(null, api, ownProps.match.params.id),
  ];

  // Need fetchAssociatedAccounts here because the result includes permissions for the patients in a care team
  if (!stateProps.fetchingAssociatedAccounts.inProgress && !stateProps.fetchingAssociatedAccounts.completed) {
    fetchers.push(dispatchProps.fetchAssociatedAccounts.bind(null, api));
  }

  // If the logged-in user is viewing their own profile, fetch their data donation consent records
  if (isUserPatient && !stateProps.fetchingUserConsentRecords.inProgress && !stateProps.fetchingUserConsentRecords.completed) {
    fetchers.push(dispatchProps.fetchUserConsentRecords.bind(null, api, DATA_DONATION_CONSENT_TYPE));
  }

  // Need to fetch the patient for the clinic in order to have the permissions provided. Normally
  // these would be here after navigating from the patients list, but they will not upon reload.
  // We need to search for the patient via the current patient id.
  if (stateProps.selectedClinicId && !_.get(stateProps, [
    'clinics',
    stateProps.selectedClinicId,
    'patients',
    ownProps.match.params.id,
    'permissions',
  ])) {
    fetchers.push(dispatchProps.fetchPatientFromClinic.bind(null, api, stateProps.selectedClinicId, ownProps.match.params.id));
  }

  return fetchers;
};

export function mapStateToProps(state) {
  let user = null;
  let patient = null;
  let clinicPatient;
  let permissions = {};
  let permsOfLoggedInUser = {};

  const {
    allUsersMap,
    clinics,
    currentPatientInViewId,
    loggedInUserId,
    membershipPermissionsInOtherCareTeams,
    permissionsOfMembersInTargetCareTeam,
    selectedClinicId,
    working,
  } = state.blip;

  const {
    fetchingUser,
    fetchingPatient,
    fetchingPendingSentInvites,
    fetchingAssociatedAccounts,
    fetchingUserConsentRecords,
    updatingPatientBgUnits,
    updatingPatient,
    updatingClinicPatient,
  } = working;

  if (allUsersMap){
    if (loggedInUserId) {
      user = allUsersMap[loggedInUserId];
    }

    if (currentPatientInViewId) {

      patient = allUsersMap[currentPatientInViewId];
      if (selectedClinicId) clinicPatient = _.get(clinics, [selectedClinicId, 'patients', currentPatientInViewId]);

      permissions = _.get(
        permissionsOfMembersInTargetCareTeam,
        currentPatientInViewId,
        {}
      );
      // if the logged-in user is viewing own data, we pass through their own permissions as permsOfLoggedInUser
      if (currentPatientInViewId === loggedInUserId) {
        permsOfLoggedInUser = permissions;
      }
      // otherwise, we need to pull the perms of the loggedInUser wrt the patient in view from membershipPermissionsInOtherCareTeams
      else {
        permsOfLoggedInUser = clinicPatient?.permissions || _.get(
          membershipPermissionsInOtherCareTeams,
          currentPatientInViewId,
          {}
        );
      }
    }
  }

  return {
    user: user,
    fetchingUser: fetchingUser.inProgress,
    patient: { permissions, ...patient },
    clinicPatient,
    permsOfLoggedInUser: permsOfLoggedInUser,
    fetchingPatient: fetchingPatient.inProgress,
    fetchingPendingSentInvites: fetchingPendingSentInvites,
    fetchingAssociatedAccounts: fetchingAssociatedAccounts,
    fetchingUserConsentRecords: fetchingUserConsentRecords,
    updatingPatientBgUnits: updatingPatientBgUnits.inProgress,
    updatingPatient: updatingPatient.inProgress || updatingClinicPatient.inProgress,
    dataSources: state.blip.dataSources || [],
    authorizedDataSource: state.blip.authorizedDataSource,
    selectedClinicId,
    loggedInUserId,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  fetchAssociatedAccounts: actions.async.fetchAssociatedAccounts,
  fetchPatient: actions.async.fetchPatient,
  fetchPendingSentInvites: actions.async.fetchPendingSentInvites,
  fetchDataSources: actions.async.fetchDataSources,
  updatePatient: actions.async.updatePatient,
  updatePatientSettings: actions.async.updateSettings,
  connectDataSource: actions.async.connectDataSource,
  fetchPatientFromClinic: actions.async.fetchPatientFromClinic,
  updateClinicPatient: actions.async.updateClinicPatient,
  fetchUserConsentRecords: actions.async.fetchUserConsentRecords,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;

  const patientUpdateAction = patient => {
    dispatchProps.updatePatient(api, patient);
    if (stateProps.selectedClinicId) {
      dispatchProps.updateClinicPatient(api, stateProps.selectedClinicId, patient.userid, clinicPatientFromAccountInfo(patient));
    }
  }

  return Object.assign({}, stateProps, _.pick(dispatchProps, 'acknowledgeNotification'), {
    fetchers: getFetchers(dispatchProps, ownProps, stateProps, api),
    onUpdatePatient: patientUpdateAction,
    onUpdatePatientSettings: dispatchProps.updatePatientSettings.bind(null, api),
    fetchDataSources: dispatchProps.fetchDataSources.bind(null, api),
    connectDataSource: dispatchProps.connectDataSource.bind(null, api),
    trackMetric: ownProps.trackMetric,
    queryParams: ownProps.location.query,
    api: api
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Patient);
