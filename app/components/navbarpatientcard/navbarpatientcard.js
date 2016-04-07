
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
var Link = require('react-router').Link;
var _ = require('lodash');
var cx = require('classnames');

var personUtils = require('../../core/personutils');
var utils = require('../../core/utils');

var NavbarPatientCard = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
    currentPage: React.PropTypes.string,
    uploadUrl: React.PropTypes.string,
    patient: React.PropTypes.object,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    var patient = this.props.patient || {};
    var self = this;

    var classes = cx({
      'patientcard': true
    });

    var view = this.renderView(patient);
    var upload = this.renderUpload(patient);
    var share = this.renderShare(patient);
    var profile = this.renderProfile(patient);

    
    return (
      <div className={classes}>
        <i className="Navbar-icon icon-face-standin"></i>
        <div className="patientcard-info">
          {profile}
          <div className="patientcard-actions">
            {view}
            {share}
            {upload}
          </div>
        </div>
        <div className="clear"></div>
      </div>
    );
    
  },

  renderView: function() {
    var classes = cx({
      'patientcard-actions-view': true,
      'patientcard-actions--highlight': this.props.currentPage && this.props.currentPage.match(/(data)$/i)
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked Navbar View Data');
    };

    return (
      
      <Link className={classes} onClick={handleClick} to={this.props.href}>View</Link>
      
    );
  },

  renderProfile: function(patient) {
    var url = '';
    if (!_.isEmpty(patient.link)) {
      url = patient.link.slice(0,-5) + '/profile';
    }

    var classes = cx({
      'patientcard-actions-profile': true,
      'navbarpatientcard-profile': true,
      'patientcard-actions--highlight': this.props.currentPage && this.props.currentPage.match(/(profile)$/i)
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked Navbar Name');
    };

    return (
      
      <Link className={classes} to={url} onClick={handleClick} title="Profile">
        <div className="patientcard-fullname" title={this.getFullName()}>
          {this.getFullName()}
          <i className="patientcard-icon icon-settings"></i>
        </div>
      </Link>
      
    );
  },

  renderUpload: function(patient) {
    var classes = cx({
      'patientcard-actions-upload': true
    });

    var self = this;
    var handleClick = function(e) {
      if (e) {
        e.preventDefault();
      }
      window.open(self.props.uploadUrl, '_blank');
      self.props.trackMetric('Clicked Navbar Upload Data');
    };

    if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
      return (
        
        <a href="" onClick={handleClick} className={classes} title="Upload data">Upload</a>
        
      );
    }

    return null;
  },

  renderShare: function(patient) {
    var shareUrl = '';
    if (!_.isEmpty(patient.link)) {
      shareUrl = patient.link.slice(0,-5) + '/share';
    }

    var classes = cx({
      'patientcard-actions-share': true,
      'patientcard-actions--highlight': this.props.currentPage && this.props.currentPage.match(/(share)$/i)
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked Navbar Share Data');
    };

    if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
      return (
        
        <Link className={classes} onClick={handleClick} to={shareUrl} title="Share data">Share</Link>
        
      );
    }

    return null;
  },

  getFullName: function() {
    return personUtils.patientFullName(this.props.patient);
  }
});

module.exports = NavbarPatientCard;
