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

var PatientCard = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
    onClick: React.PropTypes.func,
    patient: React.PropTypes.object
  },

  render: function() {
    var patient = this.props.patient;

    var classes = cx({
      'patientcard': true,
      'patientcard-owner': this.props.patient.permissions.admin || this.props.patient.permissions.root
    });

    var remove = (function(patient) {
        if (!patient.permissions.admin && !patient.permissions.root) {

          var title = 'Remove yourself from ' + patient.profile.fullName + "'s care team.";

          return (
            /* jshint ignore:start */
            <i className="Navbar-icon icon-remove" title={title}></i>
            /* jshint ignore:end */
          );
        }
    })(patient);

    var permissions = (function(patient) {
      var classes = {
        'Navbar-icon': true,
        'patientcard-permissions-icon': true
      };
      var title = '';

      if(patient.permissions.admin) {
        classes['icon-permissions-own'] = true;
        title = "You own this data. You can change who else can see and upload data in " + patient.profile.fullName + "'s profile page.";
      } else if(patient.permissions.upload) {
        classes['icon-permissions-upload'] = true;
        title = "You are allowed to upload data to " + patient.profile.fullName + "'s account.";
      } else if(patient.permissions.view) {
        classes['icon-permissions-view'] = true;
        title = "You are allowed to see " + patient.profile.fullName + "'s data.";
      } else {
        return null;
      }

      classes = cx(classes);

      return (
        /* jshint ignore:start */
        <i className={classes} title={title}></i>
        /* jshint ignore:end */
      );
    })(patient);

    /* jshint ignore:start */
    return (
      <a className={classes}
        href={this.props.href}
        onClick={this.props.onClick}>
        <i className="Navbar-icon icon-face-standin"></i>
        <div className="patientcard-fullname">{patient.profile.fullName}</div>
        <div className="patientcard-controls">
          {remove}
          {permissions}
        </div>
        <div className='clear'></div>
      </a>
    );
    /* jshint ignore:end */
  }
});

module.exports = PatientCard;
