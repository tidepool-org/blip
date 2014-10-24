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
    showingWelcomeTitle: React.PropTypes.bool,
    showingWelcomeSetup: React.PropTypes.bool,
    onHideWelcomeSetup: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired,
    onAcceptInvitation: React.PropTypes.func,
    onDismissInvitation: React.PropTypes.func,
    onRemovePatient: React.PropTypes.func,
    uploadUrl: React.PropTypes.string
  },

  render: function() {
    var welcomeTitle = this.renderWelcomeTitle();

    if (this.isLoading()) {
      return (
        <div className="container-box-outer">
          <div className="patients js-patients-page">
            {welcomeTitle}
            {this.renderLoadingIndicator()}
          </div>
        </div>
      );
    }

    var welcomeSetup = this.renderWelcomeSetup();
    var noPatientsOrInvites = this.renderNoPatientsOrInvitationsMessage();
    var invites = this.renderInvitations();
    var noPatientsSetupStorage = this.renderNoPatientsSetupStorageLink();
    var patients = this.renderPatients();

    return (
      <div className="container-box-outer">
        <div className="patients js-patients-page">
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
      self.props.onHideWelcomeSetup({route: '/patients/new'});
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
          <div><button className="btn btn-primary" onClick={handleClickYes}>{"Yes, let's set it up"}</button></div>
          <div><button className="btn btn-secondary" onClick={handleClickNo}>{"No, not now"}</button></div>
          <div className="patients-welcomesetup-actions-help">{"(You can always create one later)"}</div>
        </div>
      </div>
    );
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
    if (!this.hasInvites()) {
      return null;
    }

    var invitations = _.map(this.props.invites, this.renderInvitation);

    /* jshint ignore:start */
    return (
      <ul className='invitations'>
        {invitations}
      </ul>
    );
    /* jshint ignore:end */
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
        <a href="#/patients/new">{"setup data storage"}</a>
        {" for someone’s diabetes data."}
      </div>
    );
  },

  renderPatients: function() {
    if (!this.hasPatients()) {
      return null;
    }

    var patients = this.getPatients();
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
            isPatientList={true}
            uploadUrl={this.props.uploadUrl}
            onClickPerson={this.handleClickPatient}
            onRemovePatient= {this.props.onRemovePatient} />
        </div>
      </div>
    );
  },

  getPatients: function() {
    var user = _.cloneDeep(this.props.user);
    var patients = _.clone(this.props.patients) || [];

    if(personUtils.isPatient(user)) {
      user.permissions = {
        root: {}
      };
      patients.push(user);
    }

    return patients;
  },

  renderAddDataStorage: function() {
    // Until the "child accounts" feature,
    // don't allow additional data accounts once the primary one has been setup
    if (personUtils.isPatient(this.props.user)) {
      return null;
    }

    return (
      <a
        className="patients-new-account"
        href="#/patients/new"
        onClick={this.handleClickCreateProfile}>
        Setup data storage
        <i className="icon-add"></i>
      </a>
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
        patient.link = '#/patients/' + patient.userid + '/data';
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

  isLoading: function() {
    return (
      this.props.fetchingUser ||
      this.props.fetchingInvites ||
      this.props.fetchingPatients
    );
  },

  isShowingWelcomeTitle: function() {
    return this.props.showingWelcomeTitle;
  },

  hasInvites: function() {
    return !_.isEmpty(this.props.invites);
  },

  isShowingWelcomeSetup: function() {
    return this.props.showingWelcomeSetup && !this.hasInvites();
  },

  hasPatients: function() {
    return !_.isEmpty(this.props.patients) || personUtils.isPatient(this.props.user);
  }
});

module.exports = Patients;
