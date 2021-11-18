import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import Patient from '../patient/';
import { selectedClinicId } from '../../redux/reducers/misc';

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function getFetchers(dispatchProps, ownProps, stateProps, api) {
  const fetchers = [
    dispatchProps.fetchPatient.bind(null, api, ownProps.match.params.id),
  ];

  if (!stateProps.fetchingPendingSentInvites.inProgress && !stateProps.fetchingPendingSentInvites.completed) {
    fetchers.push(dispatchProps.fetchPendingSentInvites.bind(null, api));
  }

  if (!stateProps.fetchingAssociatedAccounts.inProgress && !stateProps.fetchingAssociatedAccounts.completed) {
    // Need fetchAssociatedAccounts here because the result includes of data donation accounts sharing info
    // and permissions for the patients in a care team
    fetchers.push(dispatchProps.fetchAssociatedAccounts.bind(null, api));
  }

  if (stateProps.selectedClinicId && !_.get(stateProps, [
    'clinics',
    stateProps.selectedClinicId,
    'patients',
    ownProps.match.params.id,
    'permissions',
  ])) {
    // Need to fetch the patient for the clinic in order to have the permissions provided. Normally
    // these would be here after navigating from the patients list, but they will not upon reload.
    // We need to search for the patient via the current patient id.
    fetchers.push(dispatchProps.fetchPatientFromClinic.bind(null, api, stateProps.selectedClinicId, ownProps.match.params.id));
  }

  return fetchers;
};

export function mapStateToProps(state) {
  let user = null;
  let patient = null;
  let permissions = {};
  let permsOfLoggedInUser = {};

  const {
    allUsersMap,
    loggedInUserId,
    currentPatientInViewId,
    working,
  } = state.blip;

  const {
    fetchingUser,
    fetchingPatient,
    fetchingPendingSentInvites,
    fetchingAssociatedAccounts,
    updatingDataDonationAccounts,
    updatingPatientBgUnits,
  } = working;

  if (allUsersMap){
    if (loggedInUserId) {
      user = allUsersMap[loggedInUserId];
    }

    if (currentPatientInViewId){
      patient = allUsersMap[currentPatientInViewId];

      permissions = _.get(
        state.blip.permissionsOfMembersInTargetCareTeam,
        state.blip.currentPatientInViewId,
        {}
      );
      // if the logged-in user is viewing own data, we pass through their own permissions as permsOfLoggedInUser
      if (state.blip.currentPatientInViewId === state.blip.loggedInUserId) {
        permsOfLoggedInUser = permissions;
      }
      // otherwise, we need to pull the perms of the loggedInUser wrt the patient in view from membershipPermissionsInOtherCareTeams
      else {
        permsOfLoggedInUser = state.blip.selectedClinicId
        ? _.get(
          state.blip.clinics,
          [
            state.blip.selectedClinicId,
            'patients',
            state.blip.currentPatientInViewId,
            'permissions',
          ],
          {}
        ) : _.get(
          state.blip.membershipPermissionsInOtherCareTeams,
          state.blip.currentPatientInViewId,
          {}
        );
      }
    }
  }

  return {
    user: user,
    fetchingUser: fetchingUser.inProgress,
    patient: { permissions, ...patient },
    permsOfLoggedInUser: permsOfLoggedInUser,
    fetchingPatient: fetchingPatient.inProgress,
    fetchingPendingSentInvites: fetchingPendingSentInvites,
    fetchingAssociatedAccounts: fetchingAssociatedAccounts,
    dataDonationAccounts: state.blip.dataDonationAccounts,
    dataDonationAccountsFetched: fetchingPendingSentInvites.completed && fetchingAssociatedAccounts.completed,
    updatingDataDonationAccounts: updatingDataDonationAccounts.inProgress,
    updatingPatientBgUnits: updatingPatientBgUnits.inProgress,
    dataSources: state.blip.dataSources || [],
    authorizedDataSource: state.blip.authorizedDataSource,
    selectedClinicId: state.blip.selectedClinicId,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  fetchAssociatedAccounts: actions.async.fetchAssociatedAccounts,
  fetchPatient: actions.async.fetchPatient,
  fetchPendingSentInvites: actions.async.fetchPendingSentInvites,
  fetchDataSources: actions.async.fetchDataSources,
  updateDataDonationAccounts: actions.async.updateDataDonationAccounts,
  updatePatient: actions.async.updatePatient,
  updatePatientSettings: actions.async.updateSettings,
  connectDataSource: actions.async.connectDataSource,
  disconnectDataSource: actions.async.disconnectDataSource,
  fetchPatientFromClinic: actions.async.fetchPatientFromClinic,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return Object.assign({}, stateProps, _.pick(dispatchProps, 'acknowledgeNotification'), {
    fetchers: getFetchers(dispatchProps, ownProps, stateProps, api),
    onUpdateDataDonationAccounts: dispatchProps.updateDataDonationAccounts.bind(null, api),
    onUpdatePatient: dispatchProps.updatePatient.bind(null, api),
    onUpdatePatientSettings: dispatchProps.updatePatientSettings.bind(null, api),
    fetchDataSources: dispatchProps.fetchDataSources.bind(null, api),
    connectDataSource: dispatchProps.connectDataSource.bind(null, api),
    disconnectDataSource: dispatchProps.disconnectDataSource.bind(null, api),
    trackMetric: ownProps.trackMetric,
    queryParams: ownProps.location.query,
    api: api
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Patient);
