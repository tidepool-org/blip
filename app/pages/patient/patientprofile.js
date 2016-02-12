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
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id)
  ];
};

let mapStateToProps = state => ({
  user: state.blip.loggedInUser,
  fetchingUser: state.blip.working.fetchingUser.inProgress,
  patient: state.blip.currentPatientInView,
  fetchingPatient: state.blip.working.fetchingPatient.inProgress,
  pendingInvites: state.blip.pendingInvites,
  changingMemberPermissions: state.working.settingMemberPermissions,
  removingMember: state.working.removingMember,
  invitingMember: state.working.invitingMember,
  cancellingInvite: state.working.cancellingInvite
});

let mapDispatchToProps = dispatch => bindActionCreators({
  updatePatient: actions.async.updatePatient,
  changeMemberPermissions: actions.async.setMemberPermissions,
  removeMember: actions.async.removeMember,
  inviteMember: actions.async.sendInvitation,
  cancelInvite: actions.async.cancelInvitation
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return _.merge({}, ownProps, stateProps, dispatchProps, {
    fetchers: getFetchers(dispatchProps, ownProps, api),
    onUpdatePatient: dispatchProps.updatePatient.bind(null, api),
    onChangeMemberPermissions: dispatchProps.changeMemberPermissions.bind(null, api),
    onRemoveMember: dispatchProps.removeMember.bind(null, api),
    onInviteMember: dispatchProps.inviteMember.bind(null, api),
    onCancelInvite: dispatchProps.cancelInvite.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric,
    shareOnly: false
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Patient);