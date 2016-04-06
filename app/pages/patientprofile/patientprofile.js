import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import Patient from '../patient/';

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchPatient.bind(null, api, ownProps.routeParams.id)
  ];
};

export function mapStateToProps(state) {
  let user = null;
  let patient = null;

  let { 
    allUsersMap, 
    loggedInUserId, 
    currentPatientInViewId,
  } = state.blip;

  if (allUsersMap){
    if (loggedInUserId) {
      user = allUsersMap[loggedInUserId];
    }

    if (currentPatientInViewId){
      patient = allUsersMap[currentPatientInViewId];
    }
  }

  return {
    user: user,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    patient: patient,
    fetchingPatient: state.blip.working.fetchingPatient.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  acknowledgeNotification: actions.sync.acknowledgeNotification,
  fetchPatient: actions.async.fetchPatient,
  updatePatient: actions.async.updatePatient
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, _.pick(dispatchProps, 'acknowledgeNotification'), {
    fetchers: getFetchers(dispatchProps, ownProps, api),
    onUpdatePatient: dispatchProps.updatePatient.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Patient);
