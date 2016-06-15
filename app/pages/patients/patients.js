/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import React from 'react';
import { browserHistory, Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';
import utils from '../../core/utils';

import _ from 'lodash';
import cx from 'classnames';

import config from '../../config';

import personUtils from '../../core/personutils';
import PeopleList from '../../components/peoplelist';
import Invitation from '../../components/invitation';
import BrowserWarning from '../../components/browserwarning';

export let Patients = React.createClass({
  propTypes: {
    clearPatientInView: React.PropTypes.func.isRequired,
    fetchers: React.PropTypes.array.isRequired,
    fetchingUser: React.PropTypes.bool.isRequired,
    invites: React.PropTypes.array.isRequired,
    loading: React.PropTypes.bool.isRequired,
    location: React.PropTypes.object.isRequired,
    loggedInUserId: React.PropTypes.string,
    onAcceptInvitation: React.PropTypes.func.isRequired,
    onDismissInvitation: React.PropTypes.func.isRequired,
    onHideWelcomeSetup: React.PropTypes.func.isRequired,
    onRemovePatient: React.PropTypes.func.isRequired,
    patients: React.PropTypes.array.isRequired,
    showWelcomeMessage: React.PropTypes.func.isRequired,
    showingWelcomeMessage: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired,
    user: React.PropTypes.object
  },

  render: function() {
    var welcomeTitle = this.renderWelcomeTitle();

    if (this.props.loading) {
      if (this.props.location.query.justLoggedIn) {
        return (
          <div>
            {welcomeTitle}
            {this.renderLoadingIndicator()}
          </div>
        );
      } else {
        return (
          <div className="container-box-outer">
            <div className="patients js-patients-page">
              {this.renderLoadingIndicator()}
            </div>
          </div>
        );
      }
    }

    var welcomeSetup = this.renderWelcomeSetup();
    var noPatientsOrInvites = this.renderNoPatientsOrInvitationsMessage();
    var invites = this.renderInvitations();
    var noPatientsSetupStorage = this.renderNoPatientsSetupStorageLink();
    var patients = this.renderPatients();

    var backgroundClasses = cx({
      'patients js-patients-page': true,
      'patients-welcome js-patients-page': this.isShowingWelcomeTitle()
    });

    return (
      <div className="container-box-outer">
        <div className={backgroundClasses}>
          {welcomeTitle}
          {welcomeSetup}
          {noPatientsOrInvites}
          {invites}
          {noPatientsSetupStorage}
          {patients}
        </div>
      </div>
    );
  },

  renderWelcomeSetup: function() {
    if (!this.isShowingWelcomeSetup()) {
      return null;
    }

    var self = this;
    var handleClickYes = function(e) {
      e.preventDefault();
      self.props.onHideWelcomeSetup();
      browserHistory.push('/patients/new');
    };
    var handleClickNo = function(e) {
      e.preventDefault();
      self.props.onHideWelcomeSetup();
    };

    return (
      <div className="patients-message">
        <div>
          {"Tidepool provides free, secure data storage for diabetes data."}
          <br />
          {"Would you like to set up data storage for someone’s diabetes data?"}
        </div>
        <div className="patients-welcomesetup-actions">
          <button className="btn btn-tertiary" onClick={handleClickNo}>{"No, not now"}</button>
          <button className="btn btn-primary" onClick={handleClickYes}>{"Yes, let's set it up"}</button>
        </div>
      </div>
    );
  },

  renderInvitation: function(invitation, index) {
    
    return (
      <Invitation
        key={invitation.key}
        invitation={invitation}
        onAcceptInvitation={this.props.onAcceptInvitation}
        onDismissInvitation={this.props.onDismissInvitation}
        trackMetric={this.props.trackMetric}
      ></Invitation>);
    
  },
  renderInvitations: function() {
    if (!this.hasInvites()) {
      return null;
    }

    var invitations = _.map(this.props.invites, this.renderInvitation);

    
    return (
      <ul className='invitations'>
        {invitations}
      </ul>
    );
    
  },

  renderNoPatientsOrInvitationsMessage: function() {
    if (this.isShowingWelcomeSetup() || this.hasPatients() || this.hasInvites()) {
      return null;
    }

    return (
      <div className="patients-message">
        {"Looks like you don’t have access to any data yet."}
        <br />
        {"Please ask people to invite you to see their data in Blip."}
      </div>
    );
  },

  renderNoPatientsSetupStorageLink: function() {
    if (this.isShowingWelcomeSetup() || this.hasPatients()) {
      return null;
    }

    return (
      <div className="patients-message">
        {"You can also "}
        <Link to="/patients/new">{"setup data storage"}</Link>
        {" for someone’s diabetes data."}
      </div>
    );
  },

  renderPatients: function() {
    if (!this.hasPatients()) {
      return null;
    }

    if (!utils.isChrome()) {
      return <BrowserWarning />;
    }

    var patients = this.props.patients;
    patients = this.addLinkToPatients(patients);

    var addDataStorage = this.renderAddDataStorage();

    return (
      <div className="container-box-inner patients-section js-patients-shared">
        <div className="patients-section-title-wrapper">
          <div className="patients-section-title">{"View data for:"}</div>
        </div>
        <div className="patients-section-content">
          {addDataStorage}
          <div className='clear'></div>
          <PeopleList
            people={patients}
            uploadUrl={this.props.uploadUrl}
            onClickPerson={this.handleClickPatient}
            onRemovePatient= {this.props.onRemovePatient}
            trackMetric={this.props.trackMetric} />
        </div>
      </div>
    );
  },

  renderAddDataStorage: function() {
    // Until the "child accounts" feature,
    // don't allow additional data accounts once the primary one has been setup
    if (personUtils.isPatient(this.props.user)) {
      return null;
    }

    return (
      <Link
        className="patients-new-account"
        to="/patients/new"
        onClick={this.handleClickCreateProfile}>
        Setup data storage
        <i className="icon-add"></i>
      </Link>
    );
  },

  renderWelcomeTitle: function() {
    if (!this.isShowingWelcomeTitle()) {
      return null;
    }

    return (
      <div className="patients-welcome-title">
        {'Welcome to Blip!'}
      </div>
    );
  },

  renderLoadingIndicator: function() {
    return (
      <div className="patients-message patients-message-loading">
        Loading...
      </div>
    );
  },

  handleClickCreateProfile: function() {
    this.props.trackMetric('Clicked Create Profile');
  },

  addLinkToPatients: function(patients) {
    return _.map(patients, function(patient) {
      patient = _.cloneDeep(patient);
      if (patient.userid) {
        patient.link = '/patients/' + patient.userid + '/data';
      }
      return patient;
    });
  },

  handleClickPatient: function(patient) {
    if (personUtils.isSame(this.props.user, patient)) {
      this.props.trackMetric('Clicked Own Care Team');
    }
    else {
      this.props.trackMetric('Clicked Other Care Team');
    }
  },

  isShowingWelcomeTitle: function() {
    return this.props.showingWelcomeMessage;
  },

  hasInvites: function() {
    return !_.isEmpty(this.props.invites);
  },

  isShowingWelcomeSetup: function() {
    return this.props.showingWelcomeMessage && !this.hasInvites();
  },

  hasPatients: function() {
    return !_.isEmpty(this.props.patients) || personUtils.isPatient(this.props.user);
  },

  doFetching: function(nextProps) {

    if (!nextProps.fetchers) {
      return
    }

    nextProps.fetchers.forEach(fetcher => { 
      fetcher();
    });
  },
  componentWillMount: function() {
    if (this.props.clearPatientInView) {
      this.props.clearPatientInView();
    }
  },

  /**
   * After rendering for first time
   * begin fetching any required data
   */
  componentDidMount: function() {
    if (this.props.trackMetric) {
      this.props.trackMetric('Viewed Care Team List');
    }
    
    this.doFetching(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    let { loading, loggedInUserId, patients, invites, location, showingWelcomeMessage } = nextProps;
    
    if (!loading && loggedInUserId && location.query.justLoggedIn) {
      if (patients.length === 1 && invites.length === 0) {
        let patient = patients[0];
        browserHistory.push(`/patients/${patient.userid}/data`);
      } else if (patients.length === 0 && invites.length === 0 && showingWelcomeMessage === null) {
        this.props.showWelcomeMessage();
      }
    }
  }
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

let getFetchers = (dispatchProps, ownProps, api) => {
  return [
    dispatchProps.fetchPendingReceivedInvites.bind(null, api),
    dispatchProps.fetchPatients.bind(null, api)
  ];
};


export function mapStateToProps(state) {
  var user = null;
  let patientMap = {};

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (state.blip.targetUserId) {
      patientMap[state.blip.targetUserId] = state.blip.allUsersMap[state.blip.targetUserId];
      // to pass through the permissions of the logged-in user on the target (usually self)
      if (state.blip.permissionsOfMembersInTargetCareTeam[state.blip.targetUserId]) {
        patientMap[state.blip.targetUserId].permissions = state.blip.permissionsOfMembersInTargetCareTeam[state.blip.targetUserId];
      }
    }

    if (state.blip.membershipInOtherCareTeams) {
      state.blip.membershipInOtherCareTeams.forEach((key) => {
        patientMap[key] = state.blip.allUsersMap[key];
      });
    }

    if (state.blip.membershipPermissionsInOtherCareTeams) {
      var permissions = state.blip.membershipPermissionsInOtherCareTeams;
      var keys = Object.keys(state.blip.membershipPermissionsInOtherCareTeams);
      keys.forEach((key) => {
        if (!patientMap[key]) {
          patientMap[key] = state.blip.allUsersMap[key];
        }
        patientMap[key].permissions = permissions[key];
      });
    }
  }

  let { 
    fetchingUser: { inProgress: fetchingUser },
    fetchingPatients: { inProgress: fetchingPatients },
    fetchingPendingReceivedInvites: { inProgress: fetchingInvites },
  } = state.blip.working;

  return {
    user: user,
    loading: fetchingUser || fetchingPatients || fetchingInvites,
    loggedInUserId: state.blip.loggedInUserId,
    fetchingUser: fetchingUser,
    patients: Object.keys(patientMap).map((key) => patientMap[key]),
    invites: state.blip.pendingReceivedInvites,
    showingWelcomeMessage: state.blip.showingWelcomeMessage
  }
};

let mapDispatchToProps = dispatch => bindActionCreators({
  acceptReceivedInvite: actions.async.acceptReceivedInvite,
  rejectReceivedInvite: actions.async.rejectReceivedInvite,
  removePatient: actions.async.removeMembershipInOtherCareTeam,
  fetchPendingReceivedInvites: actions.async.fetchPendingReceivedInvites,
  fetchPatients: actions.async.fetchPatients,
  clearPatientInView: actions.sync.clearPatientInView,
  showWelcomeMessage: actions.sync.showWelcomeMessage,
  onHideWelcomeSetup: actions.sync.hideWelcomeMessage
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign(
    {},
    _.pick(dispatchProps, ['clearPatientInView', 'showWelcomeMessage', 'onHideWelcomeSetup']),
    stateProps,
    {
      fetchers: getFetchers(dispatchProps, ownProps, api),
      location: ownProps.location,
      uploadUrl: api.getUploadUrl(),
      onAcceptInvitation: dispatchProps.acceptReceivedInvite.bind(null, api),
      onDismissInvitation: dispatchProps.rejectReceivedInvite.bind(null, api),
      onRemovePatient: dispatchProps.removePatient.bind(null, api),
      trackMetric: ownProps.routes[0].trackMetric
    }
  );
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Patients);