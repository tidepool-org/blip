import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import Patient from './patient';

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id),
    dispatchProps.fetchPendingSentInvites.bind(null, api)
  ];
};

let mapStateToProps = state => {
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
    changingMemberPermissions: state.blip.working.settingMemberPermissions,
    removingMember: state.blip.working.removingMember,
    invitingMember: state.blip.working.sendingInvite,
    cancellingInvite: state.blip.working.cancellingSentInvite
  }
};

let mapDispatchToProps = dispatch => bindActionCreators({
  updatePatient: actions.async.updatePatient,
  changeMemberPermissions: actions.async.setMemberPermissions,
  removeMember: actions.async.removeMember,
  inviteMember: actions.async.sendInvite,
  cancelInvite: actions.async.cancelSentInvite,
  fetchPatient: actions.async.fetchPatient,
  fetchPendingSentInvites: actions.async.fetchPendingSentInvites
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, ownProps, stateProps, dispatchProps, {
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