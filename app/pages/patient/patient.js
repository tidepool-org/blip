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

var personUtils = require('../../core/personutils');
var PatientInfo = require('./patientinfo');
var PeopleList = require('../../components/peoplelist');
var PersonCard = require('../../components/personcard');

var Patient = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    onUpdatePatient: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired,
    patientTeam: React.PropTypes.component
  },

  render: function() {
    return (
      <div className="PatientPage js-patient-page">
        <div className="PatientPage-layer">
          {this.renderSubnav()}
          {this.renderContent()}
          {this.renderFooter()}
        </div>
      </div>
    );
  },

  renderSubnav: function() {
    return (
      <div className="PatientPage-subnav grid">
        <div className="grid-item one-whole medium-one-third">
          {this.renderBackButton()}
        </div>
        <div className="grid-item one-whole medium-one-third">
          <div className="PatientPage-subnavTitle">{this.renderTitle()}</div>
        </div>
      </div>
    );
  },

  renderContent: function() {
    return (
      <div className="PatientPage-content">
        {this.renderInfo()}
        {this.renderAccess()}
        {this.renderDelete()}
      </div>
    );
  },

  renderFooter: function() {
    return <div className="PatientPage-footer"></div>;
  },

  renderBackButton: function() {
    var patient = this.props.patient;
    if (this.props.fetchingPatient || !(patient && patient.userid)) {
      return null;
    }

    var text = 'Data';
    var url = '#/patients/' + patient.userid + '/data';

    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Back To Data');
    };

    return (
      <a className="js-back" href={url} onClick={handleClick}>
        <i className="icon-back"></i>
        {' ' + text}
      </a>
    );
  },

  renderTitle: function() {
    var text = 'Profile';

    if (!this.props.fetchingPatient) {
      text = personUtils.patientFullName(this.props.patient) + '\'s Profile';
    }

    return text;
  },

  renderInfo: function() {
    return (
      <div className="PatientPage-infoSection">
        <div className="PatientPage-sectionTitle">Info</div>
        <PatientInfo
          user={this.props.user}
          fetchingUser={this.props.fetchingUser}
          patient={this.props.patient}
          fetchingPatient={this.props.fetchingPatient}
          onUpdatePatient={this.props.onUpdatePatient}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  renderDelete: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    return (
      <div className="PatientPage-deleteSection">
        <div><a href='mailto:'>Delete my account</a></div>
      </div>
    );
  },

  renderAccess: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    return (
      <div className="PatientPage-teamSection">
        <div className="PatientPage-sectionTitle">Care Team</div>
        {this.props.patientTeam}
      </div>
    );
  }
});

module.exports = Patient;
