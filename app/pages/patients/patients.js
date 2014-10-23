/** @jsx React.DOM */
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

var React = require('react');
var _ = require('lodash');

var config = require('../../config');

var personUtils = require('../../core/personutils');
var PeopleList = require('../../components/peoplelist');
var PersonCard = require('../../components/personcard');
var Invitation = require('../../components/invitation');

var Patients = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patients: React.PropTypes.array,
    fetchingPatients: React.PropTypes.bool,
    invites: React.PropTypes.array,
    fetchingInvites: React.PropTypes.bool,
    showingWelcomeMessage: React.PropTypes.bool,
    onSetAsCareGiver: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired,
    onAcceptInvitation: React.PropTypes.func,
    onDismissInvitation: React.PropTypes.func,
    onRemovePatient: React.PropTypes.func,
    uploadUrl: React.PropTypes.string
  },

  render: function() {
    var welcomeTitle = this.renderWelcomeTitle();
    var loadingIndicator = this.renderLoadingIndicator();
    var patients = this.renderPatients();
    var invites = this.renderInvitations();

    /* jshint ignore:start */
    return (
      <div className="container-box-outer">
        <div className="patients js-patients-page">
          {welcomeTitle}
          {loadingIndicator}
          {invites}
          {patients}
        </div>
      </div>
    );
    /* jshint ignore:end */
  },
  renderInvitation: function(invitation, index) {
    /* jshint ignore:start */
    return (
      <Invitation
        key={invitation.key}
        invitation={invitation}
        patientsComponent={this}
        onAcceptInvitation={this.props.onAcceptInvitation}
        onDismissInvitation={this.props.onDismissInvitation}
      ></Invitation>);
    /* jshint ignore:end */
  },
  renderInvitations: function() {
    var invites = this.props.invites;

    if (_.isEmpty(invites)) {
       return null;
    }

    var invitations = _.map(invites, this.renderInvitation);

    /* jshint ignore:start */
    return (
      <ul className='invitations'>
        {invitations}
      </ul>
    );
    /* jshint ignore:end */
  },
  renderPatients: function() {
    if (this.isResettingPatientsData() || this.isResettingUserData()) {
      return null;
    }

    var content;
    var user = _.cloneDeep(this.props.user);
    var patients = _.clone(this.props.patients) || [];

    if(personUtils.isPatient(user)) {
      user.permissions = {
        root: {}
      };
      patients.push(user);
    }

    if (_.isEmpty(patients)) {
      /* jshint ignore:start */
      content = (
        <div className="patients-message">
          <p>{"You do not have access to see anyone's data yet."}</p>
          <p>{"You need to ask the people you care for to add you to their team."}</p>
          <p>{"Or "} <a href="#/patients/new">create a new account</a> {" for them."}</p>
        </div>
      );
      /* jshint ignore:end */
    }
    else {
      patients = this.addLinkToPatients(patients);

      content = (
        <PeopleList
          people={patients}
          isPatientList={true}
          uploadUrl={this.props.uploadUrl}
          onClickPerson={this.handleClickPatient}
          onRemovePatient= {this.props.onRemovePatient}
          />
      );
    }

    var title = this.renderSectionTitle('View data for:');
    var welcome = this.renderUserPatientWelcome();
    var addAccount = this.renderAddAccount();

    /* jshint ignore:start */
    return (
      <div className="container-box-inner patients-section js-patients-shared">
        {title}
        <div className="patients-section-content">
          {addAccount}
          <div className='clear'></div>
          {welcome}
          {content}
        </div>
      </div>
    );
    /* jshint ignore:end */
  },
  renderAddAccount: function() {
    if(personUtils.isPatient(this.props.user)) {
      return null;
    }

    return (
      <a
        className="patients-new-account"
        href="#/patients/new"
        onClick={this.handleClickCreateProfile}>
        Add account
        <i className="icon-add"></i>
      </a>
    );
    /* jshint ignore:end */
  },
  renderWelcomeTitle: function() {
    if (!this.props.showingWelcomeMessage) {
      return null;
    }

    /* jshint ignore:start */
    return (
      <div className="patients-welcome-title">
        {'Welcome to Blip!'}
      </div>
    );
    /* jshint ignore:end */
  },
  renderUserPatientWelcome: function() {
    if (!this.props.showingWelcomeMessage) {
      return null;
    }

    /* jshint ignore:start */
    return (
      <div className="patients-welcome-message">
        {'Will you be uploading data from devices at home? If you are an adult with T1D or the'}
        {' mom or dad of a child with T1D, then this is for you. Go ahead and…'}
      </div>
    );
    /* jshint ignore:end */
  },
  renderLoadingIndicator: function() {
    var isResettingPatientList = this.isResettingUserData() ||this.isResettingPatientsData();
    if (isResettingPatientList && this.isResettingInvitesData()) {
      /* jshint ignore:start */
      return (
        <div className="patients-section">
          <div className="patients-message patients-message-center patients-message-loading">
            Loading...
          </div>
        </div>
      );
      /* jshint ignore:end */
    }

    return null;
  },

  renderSectionTitle: function(text) {
    if (this.props.showingWelcomeMessage) {
      return null;
    }

    /* jshint ignore:start */
    return (
      <div className="patients-section-title-wrapper">
        <div className="patients-section-title">{text}</div>
      </div>
    );
    /* jshint ignore:end */
  },

  isResettingUserData: function() {
    return (this.props.fetchingUser && !this.props.user);
  },

  handleClickCreateProfile: function() {
    this.props.trackMetric('Clicked Create Profile');
  },

  handleClickSetAsCareGiver: function(e) {
    if (e) {
      e.preventDefault();
    }
    var action = this.props.onSetAsCareGiver;
    if (action) {
      action();
    }
    this.props.trackMetric('Clicked Care Giver Only');
  },

  addLinkToPatients: function(patients) {
    return _.map(patients, function(patient) {
      patient = _.cloneDeep(patient);
      if (patient.userid) {
        patient.link = '#/patients/' + patient.userid + '/data';
      }
      return patient;
    });
  },

  isResettingPatientsData: function() {
    return (this.props.fetchingPatients && !this.props.patients);
  },

  handleClickPatient: function(patient) {
    if (personUtils.isSame(this.props.user, patient)) {
      this.props.trackMetric('Clicked Own Care Team');
    }
    else {
      this.props.trackMetric('Clicked Other Care Team');
    }
  },

  isResettingInvitesData: function() {
    return (this.props.fetchingInvites && !this.props.invites);
  }
});

module.exports = Patients;
