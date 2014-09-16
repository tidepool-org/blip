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
var datetimeUtils = require('../../core/datetimeutils');
var PeopleList = require('../../components/peoplelist');
var PersonCard = require('../../components/personcard');

var Patient = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div className="PatientPage js-patient-page">
        {this.renderSubnav()}
        {this.renderContent()}
        {this.renderFooter()}
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
    if (this.props.fetchingPatient) {
      return this.renderInfoSkeleton();
    }

    var patient = this.props.patient;

    return (
      <div className="PatientPage-infoSection">
        <div className="PatientPage-sectionTitle">Info</div>
        <div className="PatientPage-info">
          <div className="PatientPage-infoHead">
            <div className="PatientPage-infoPicture"></div>
            <div className="PatientPage-infoBlocks">
              <div className="PatientPage-infoBlockRow">
                <div className="PatientPage-infoBlock PatientPage-infoBlock--withArrow">
                  {this.getDisplayName(patient)}
                </div>
              </div>
              <div className="PatientPage-infoBlockRow">
                <div className="PatientPage-infoBlock">
                  {this.getAgeText(patient)}
                </div>
              </div>
              <div className="PatientPage-infoBlockRow">
                <div className="PatientPage-infoBlock">
                  {this.getDiagnosisText(patient)}
                </div>
              </div>
            </div>
          </div>
          <div className="PatientPage-infoBio">
            {this.getAboutText(patient)}
          </div>
        </div>
        <div className="PatientPage-infoEdit">
          {this.renderEditLink()}
        </div>
      </div>
    );
  },

  renderInfoSkeleton: function() {
    return (
      <div className="PatientPage-infoSection">
        <div className="PatientPage-sectionTitle">Info</div>
        <div className="PatientPage-info">
          <div className="PatientPage-infoHead">
            <div className="PatientPage-infoPicture"></div>
            <div className="PatientPage-infoBlocks">
              <div className="PatientPage-infoBlockRow">
                <div className="PatientPage-infoBlock PatientPage-infoBlock--withArrow PatientPage-infoBlock--placeholder">&nbsp;</div>
              </div>
              <div className="PatientPage-infoBlockRow">
                <div className="PatientPage-infoBlock PatientPage-infoBlock--placeholder">&nbsp;</div>
              </div>
              <div className="PatientPage-infoBlockRow">
                <div className="PatientPage-infoBlock PatientPage-infoBlock--placeholder">&nbsp;</div>
              </div>
            </div>
          </div>
          <div className="PatientPage-infoBio PatientPage-infoBio--placeholder">&nbsp;</div>
        </div>
        <div className="PatientPage-infoEdit"></div>
      </div>
    );
  },

  renderEditLink: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    var editUrl = [
      '#/patients',
      this.props.patient.userid,
      'edit'
    ].join('/');

    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Edit Profile');
    };

    return (
      <a href={editUrl} className="js-edit-patient" onClick={handleClick}>
        Edit
      </a>
    );
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  getDisplayName: function(patient) {
    return personUtils.patientFullName(patient);
  },

  getAgeText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    var birthday = patientInfo.birthday;

    if (!birthday) {
      return;
    }

    return datetimeUtils.yearsOldText(birthday);
  },

  getDiagnosisText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    var diagnosisDate = patientInfo.diagnosisDate;

    if (!diagnosisDate) {
      return;
    }

    return 'Diagnosed ' + datetimeUtils.yearsAgoText(diagnosisDate);
  },

  getAboutText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    return patientInfo.about;
  },

  renderAccess: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    // TODO
  }
});

module.exports = Patient;
