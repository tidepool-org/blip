import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import Patient from '../patient';

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id),
    dispatchProps.fetchPendingSentInvites.bind(null, api)
  ];
};

export function mapStateToProps(state) {
  let user = null;
  let patient = null;

  let { 
    allUsersMap, 
    loggedInUserId, 
    targetUserId,
    currentPatientInViewId,
    membersOfTargetCareTeam,
    permissionsOfMembersInTargetCareTeam
  } = state.blip;

  if (allUsersMap){
    if (loggedInUserId) {
      user = allUsersMap[loggedInUserId];
    }

    if (currentPatientInViewId){
      patient = allUsersMap[currentPatientInViewId];

      if (currentPatientInViewId === targetUserId && membersOfTargetCareTeam) {
        patient.team = [];
        membersOfTargetCareTeam.forEach((memberId) => {
          let member = allUsersMap[memberId];
          member.permissions = permissionsOfMembersInTargetCareTeam[memberId];
          patient.team.push(member);
        });
      }
    }
  }

  return {
    user: user,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    patient: patient,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress,
    pendingSentInvites: state.blip.pendingSentInvites,
    changingMemberPermissions: state.blip.working.settingMemberPermissions.inProgress,
    removingMember: state.blip.working.removingMemberFromTargetCareTeam.inProgress,
    invitingMemberInfo: state.blip.working.sendingInvite,
    cancellingInvite: state.blip.working.cancellingSentInvite.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  updatePatient: actions.async.updatePatient,
  changeMemberPermissions: actions.async.setMemberPermissions,
  removeMember: actions.async.removeMemberFromTargetCareTeam,
  inviteMember: actions.async.sendInvite,
  cancelInvite: actions.async.cancelSentInvite,
  fetchPatient: actions.async.fetchPatient,
  fetchPendingSentInvites: actions.async.fetchPendingSentInvites
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, _.pick(dispatchProps, 'acknowledgeNotification'), stateProps, {
    fetchers: getFetchers(dispatchProps, ownProps, api),
    onUpdatePatient: dispatchProps.updatePatient.bind(null, api),
    onChangeMemberPermissions: dispatchProps.changeMemberPermissions.bind(null, api),
    onRemoveMember: dispatchProps.removeMember.bind(null, api),
    onInviteMember: dispatchProps.inviteMember.bind(null, api),
    onCancelInvite: dispatchProps.cancelInvite.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric,
    shareOnly: true
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Patient);