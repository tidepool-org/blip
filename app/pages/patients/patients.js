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

var React = window.React;
var _ = window._;
var config = window.config;

var personUtils = require('../../core/personutils');
var PeopleList = require('../../components/peoplelist');
var PersonCard = require('../../components/personcard');

var Patients = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patients: React.PropTypes.array,
    fetchingPatients: React.PropTypes.bool,
    showingWelcomeMessage: React.PropTypes.bool,
    onSetAsCareGiver: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    var welcomeTitle = this.renderWelcomeTitle();
    var loadingIndicator = this.renderLoadingIndicator();
    var userPatient = this.renderUserPatient();
    var sharedPatients = this.renderSharedPatients();

    /* jshint ignore:start */
    return (
      <div className="patients js-patients-page">
        {welcomeTitle}
        {loadingIndicator}
        {userPatient}
        {sharedPatients}
      </div>
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

  renderLoadingIndicator: function() {
    if (this.isResettingUserData() && this.isResettingPatientsData()) {
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

  renderUserPatient: function() {
    var user = this.props.user;

    if (this.isResettingUserData() || personUtils.isOnlyCareGiver(user)) {
      return null;
    }

    var content;
    if (!personUtils.isPatient(user)) {
      /* jshint ignore:start */
      content = (
        <PersonCard
          href="#/patients/new"
          onClick={this.handleClickCreateProfile}>
          <i className="icon-add patients-icon-link"></i>
          {' ' + 'Create a Care Team'}
        </PersonCard>
      );
      /* jshint ignore:end */
    }
    else {
      content = this.renderPatientList([user]);
    }

    var title = this.renderSectionTitle('YOUR CARE TEAM');
    var welcome = this.renderUserPatientWelcome();

    /* jshint ignore:start */
    return (
      <div className="patients-section js-patients-user">
        {title}
        <div className="patients-section-content">
          {welcome}
          {content}
        </div>
      </div>
    );
    /* jshint ignore:end */
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

  renderUserPatientWelcome: function() {
    if (!this.props.showingWelcomeMessage) {
      return null;
    }

    /* jshint ignore:start */
    return (
      <div className="patients-welcome-message">
        {'If you have type 1 diabetes or are the person responsible for'}
        {' getting data into Blip, you need to...'}
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

  renderSharedPatients: function() {
    if (this.isResettingPatientsData()) {
      return null;
    }

    var patients = this.props.patients;
    var content;

    if (_.isEmpty(patients)) {
      /* jshint ignore:start */
      content = (
        <div>
          <PersonCard>
            {'Looks like you\'re not part of anyone\'s Care Team yet.'}
          </PersonCard>
          <div className="patients-message patients-message-small">
            {'Want to join a team? The owner of the Care Team should email us at '}
            <a href="mailto:support@tidepool.org?Subject=Blip - Add to Care Team">
              {'support@tidepool.org'}
            </a>
            {' with your email address and we\'ll take it from there!'}
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
    else {
      content = this.renderPatientList(patients);
    }

    var title = this.renderSectionTitle('CARE TEAMS YOU BELONG TO');
    var welcome = this.renderSharedPatientsWelcome();

    /* jshint ignore:start */
    return (
      <div className="patients-section js-patients-shared">
        {title}
        <div className="patients-section-content">
          {welcome}
          {content}
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  renderPatientList: function(patients) {
    if (patients) {
      patients = this.addLinkToPatients(patients);
    }

    /* jshint ignore:start */
    return (
      <PeopleList
        people={patients}
        isPatientList={true}
        onClickPerson={this.handleClickPatient}/>
    );
    /* jshint ignore:end */
  },

  renderSharedPatientsWelcome: function() {
    if (!this.props.showingWelcomeMessage) {
      return null;
    }

    /* jshint ignore:start */
    return (
      <div className="patients-welcome-message">
        {'If you are a health care provider, friend or relative of someone'}
        {' with type 1 diabetes, their Care Team will show up here.'}
      </div>
    );
    /* jshint ignore:end */
  },

  isResettingPatientsData: function() {
    return (this.props.fetchingPatients && !this.props.patients);
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
  }
});

module.exports = Patients;
