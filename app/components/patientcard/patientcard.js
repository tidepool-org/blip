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
var cx = require('react/lib/cx');

var ModalOverlay = require('../ModalOverlay');

var PatientCard = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
    onClick: React.PropTypes.func,
    onRemovePatient: React.PropTypes.func,
    patient: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      showModalOverlay: false
    };
  },

  render: function() {
    var patient = this.props.patient;
    var self = this;
    var classes = cx({
      'patientcard': true
    });

    var remove = (function(patient) {
        if (!patient.permissions.admin && !patient.permissions.root) {
          var title = 'Remove yourself from ' + patient.profile.fullName + "'s care team.";

          return (
            /* jshint ignore:start */
            <i className="Navbar-icon icon-remove" onClick={self.handleRemove(patient)} title={title}></i>
            /* jshint ignore:end */
          );
        }
    })(patient);

    var permissions = (function(patient) {
      var classes = {
        'Navbar-icon': true,
        'patientcard-permissions-icon': true
      };

      if(patient.permissions.root || patient.permissions.admin || patient.permissions.upload) {
        classes['icon-permissions-upload'] = true;
      } else {
        return null;
      }

      classes = cx(classes);

      return (
        /* jshint ignore:start */
        <i className={classes}></i>
        /* jshint ignore:end */
      );
    })(patient);

    /* jshint ignore:start */
    return (
      <div>
        <a className={classes}
          href={this.props.href}
          onClick={this.props.onClick}>
          <i className="Navbar-icon icon-face-standin"><span className="patientcard-fullname">{patient.profile.fullName}</span></i>
        </a>
        <div className="patientcard-controls">
          {remove}
          {permissions}
        </div>
        {this.renderModalOverlay()}
      </div>
    );
    /* jshint ignore:end */
  },

  renderRemoveDialog: function(patient) {
    return (
      /* jshint ignore:start */
      <div>
        <div className="ModalOverlay-content">{"Are you sure you want to leave this person's Care Team? You will no longer be able to view their data."}</div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.overlayClickHandler}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--primary" type="submit" onClick={this.handleRemovePatient(patient)}>{"I'm sure, remove me."}</button>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  handleRemovePatient: function(patient) {
    var self = this;

    return function() {
      self.props.onRemovePatient(patient.userid, function(err) {
          self.setState({
            showModalOverlay: false,
          });
        }
      );
    };
  },


  handleRemove: function(patient) {
    var self = this;

    return function() {
      self.setState({
        showModalOverlay: true,
        dialog: self.renderRemoveDialog(patient)
      });
    };
  },

  overlayClickHandler: function() {
    this.setState({
      showModalOverlay: false
    });
  },

  renderModalOverlay: function() {

    return (
      /* jshint ignore:start */
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
      /* jshint ignore:end */
    );

  }
});

module.exports = PatientCard;
