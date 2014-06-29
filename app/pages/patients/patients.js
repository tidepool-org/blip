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

var Person = require('../../core/person');
var PeopleList = require('../../components/peoplelist');

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

    if (this.isResettingUserData() || Person.isOnlyCareGiver(user)) {
      return null;
    }

    var content;
    if (!Person.isPatient(user)) {
      /* jshint ignore:start */
      content = (
        <div className="patients-message">
          <div>
            <a
              className="patients-message-button js-create-patient-profile"
              href="#/patients/new"
              onClick={this.handleClickCreateProfile}>
              <i className="icon-add"></i>{' ' + 'Create a Care Team'}
            </a>
          </div>
          <div className="patients-message-separator">{'or'}</div>
          <div>
            <a
              className="patients-message-button patients-message-button-secondary js-only-caregiver"
              href=""
              onClick={this.handleClickSetAsCareGiver}>
              {'I won\'t be uploading data'}
            </a>
          </div>
          <div className="patients-message-small">(hides this prompt)</div>
        </div>
      );
      /* jshint ignore:end */
    }
    else {
      content = this.renderPatientList([user]);
    }

    var welcome = this.renderUserPatientWelcome();

    /* jshint ignore:start */
    return (
      <div className="patients-section js-patients-user">
        <div className="patients-section-title-wrapper">
          <div className="patients-section-title">YOUR CARE TEAM</div>
        </div>
        <div className="patients-section-content">
          {welcome}
          {content}
        </div>
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
        {' getting data into Blip, you\'ll first need to...'}
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
          <div className="patients-message">
            {'Looks like you\'re not part of anyone\'s Care Team yet.'}
          </div>
          <div className="patients-message patients-message-small">
            {'Want to join a team? The owner of the Care Team should email us at '}
            <strong>{'support@tidepool.org'}</strong>
            {' with your email address and we\'ll take it from there!'}
          </div>
        </div>
      );
      /* jshint ignore:end */
    }
    else {
      content = this.renderPatientList(patients);
    }

    var welcome = this.renderSharedPatientsWelcome();

    /* jshint ignore:start */
    return (
      <div className="patients-section js-patients-shared">
        <div className="patients-section-title-wrapper">
          <div className="patients-section-title">CARE TEAMS YOU BELONG TO</div>
        </div>
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
    if (Person.isSame(this.props.user, patient)) {
      this.props.trackMetric('Clicked Own Care Team');
    }
    else {
      this.props.trackMetric('Clicked Other Care Team');
    }
  }
});

module.exports = Patients;
