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
var ModalOverlay = require('../../components/modaloverlay');
var PatientInfo = require('./patientinfo');
var PatientTeam = require('./patientteam');

var Patient = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    shareOnly: React.PropTypes.bool,
    fetchingUser: React.PropTypes.bool,
    patient: React.PropTypes.object,
    fetchingPatient: React.PropTypes.bool,
    onUpdatePatient: React.PropTypes.func,
    pendingInvites: React.PropTypes.array,
    onChangeMemberPermissions: React.PropTypes.func,
    onRemoveMember: React.PropTypes.func,
    onInviteMember: React.PropTypes.func,
    onCancelInvite: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      showModalOverlay: false
    };
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
      </div>
    );
  },

  renderContent: function() {
    var share;
    var modal;
    var profile = this.renderInfo();

    if (this.props.shareOnly) {
      share = this.renderAccess();
      modal = this.renderModalOverlay();
      profile = null;
    }

    return (
      <div className="PatientPage-content">
        {profile}
        {share}
        {modal}
      </div>
    );
  },

  renderFooter: function() {
    return <div className="PatientPage-footer"></div>;
  },

  renderInfo: function() {
    return (
      <div className="PatientPage-infoSection">
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

  renderDeleteDialog: function() {
    return (
      <div>If you are sure you want to delete your account, <a href="mailto:support@tidepool.org?Subject=Delete%20my%20account" target="_blank">send an email</a> to support@tidepool.org and we take care of it for you.</div>
    );
  },

  renderDelete: function() {
    var self = this;

    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    var handleClick = function() {
      self.setState({
        showModalOverlay: true,
        dialog: self.renderDeleteDialog()
      });
    };

    return (
      <div className="PatientPage-deleteSection">
        <div onClick={handleClick}>Delete my account</div>
      </div>
    );
  },
  overlayClickHandler: function() {
    this.setState({
      showModalOverlay: false
    });
  },
  renderModalOverlay: function() {
    
    return (
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
    );
    
  },

  renderAccess: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    return (
      <div className="PatientPage-teamSection">
        {this.renderPatientTeam()}
      </div>
    );
  },

  renderPatientTeam: function() {
    return this.transferPropsTo(<PatientTeam />);
  },
});

module.exports = Patient;
