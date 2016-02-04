
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
var ModalOverlay = require('../modaloverlay');

var PatientCard = React.createClass({
  propTypes: {
    href: React.PropTypes.string,
    currentPage: React.PropTypes.string,
    isEditing: React.PropTypes.bool,
    isNavbar: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onRemovePatient: React.PropTypes.func,
    uploadUrl: React.PropTypes.string,
    patient: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      showModalOverlay: false,
      dialog: ''
    };
  },

  render: function() {
    var patient = this.props.patient || {};
    var self = this;
    var classes = cx({
      'patientcard': true,
      'isEditing': this.props.isEditing
    });

    var view = this.renderView(patient);
    var remove = this.renderRemove(patient);
    var upload = this.renderUpload(patient);
    var share = this.renderShare(patient);
    var profile = this.renderProfile(patient);

    
    return (
      <div>
        <div onMouseEnter={this.setHighlight('view')} onMouseLeave={this.setHighlight('')} className={classes}
          onClick={this.onClick}>
          <i className="Navbar-icon icon-face-standin"></i>
          <div className="patientcard-info">
            <div className="patientcard-fullname" title={this.getFullName()}>{this.getFullName()} {profile}</div>
            <div className="patientcard-actions">
              {view}
              {share}
              {upload}
            </div>
          </div>
          <div className="patientcard-leave">
            {remove}
          </div>
          <div className="clear"></div>
        </div>
        {this.renderModalOverlay()}
      </div>
    );
    
  },

  renderView: function() {
    var classes = cx({
      'patientcard-actions-view': true,
      'patientcard-actions--highlight': (!this.props.isNavbar && this.state.highlight === 'view') || this.props.currentPage && this.props.currentPage.match(/(data)$/i)
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked VDF View Data');
      self.props.onClick();
    };

    return (
      
      <Link className={classes} to={this.props.href} onClick={handleClick}>View</Link>
      
    );
  },

  renderProfile: function(patient) {
    if (!this.props.isNavbar) {
      return;
    }

    var url = '';
    if (!_.isEmpty(patient.link)) {
      url = patient.link.slice(0,-5) + '/profile';
    }

    var classes = cx({
      'patientcard-actions-profile': true,
      'patientcard-actions--highlight': (!this.props.isNavbar && this.state.highlight === 'profile') || this.props.currentPage && this.props.currentPage.match(/(profile)$/i)
    });

    var iconClass = cx({
      'patientcard-icon': true,
      'icon-settings': true,
      'patientcard-icon--highlight': this.props.currentPage && this.props.currentPage.match(/(profile)$/i)
    });

    return (
      
      <Link className={classes} onClick={this.stopPropagation} onMouseEnter={this.setHighlight('profile')} onMouseLeave={this.setHighlight('view')} to={url} title="Profile">
        <i className={iconClass}></i>
      </Link>
      
    );
  },

  renderRemove: function(patient) {
    var classes = cx({
      'patientcard-actions--highlight': this.state.highlight === 'remove'
    });

    if (_.isEmpty(patient.permissions) === false && (!patient.permissions.admin && !patient.permissions.root)) {
      var title = 'Remove yourself from ' + this.getFullName() + '\'s care team.';

      return (
        
        <a className={classes} href="" onMouseEnter={this.setHighlight('remove')} onMouseLeave={this.setHighlight('view')} onClick={this.handleRemove(patient)} title={title}>
          <i className="Navbar-icon icon-delete"></i>
        </a>
        
      );
    }
  },

  renderUpload: function(patient) {
    var classes = cx({
      'patientcard-actions-upload': true,
      'patientcard-actions--highlight': this.state.highlight === 'upload'
    });

    var self = this;
    var handleClick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.open(self.props.uploadUrl, '_blank');
      self.props.trackMetric('Clicked VDF Upload Data');
    };

    if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
      return (
        
        <a className={classes} href='' onClick={handleClick} onMouseEnter={this.setHighlight('upload')} onMouseLeave={this.setHighlight('view')} title="Upload data">Upload</a>
        
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
      'patientcard-actions--highlight': (!this.props.isNavbar && this.state.highlight === 'share')  || this.props.currentPage && this.props.currentPage.match(/(share)$/i)
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked VDF Share Data');
    };

    if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
      return (
        
        <Link className={classes} onClick={handleClick} onMouseEnter={this.setHighlight('share')} onMouseLeave={this.setHighlight('view')} to={shareUrl} title="Share data">Share</Link>
        
      );
    }

    return null;
  },

  renderRemoveDialog: function(patient) {
    return (
      
      <div>
        <div className="ModalOverlay-content">{"Are you sure you want to leave this person's Care Team? You will no longer be able to view their data."}</div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.overlayClickHandler}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--warning PatientInfo-button--primary" type="submit" onClick={this.handleRemovePatient(patient)}>{"I'm sure, remove me."}</button>
        </div>
      </div>
      
    );
  },

  renderModalOverlay: function() {
    return (
      
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
      
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

    return function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      self.setState({
        showModalOverlay: true,
        dialog: self.renderRemoveDialog(patient)
      });

      return false;
    };
  },

  overlayClickHandler: function() {
    this.setState({
      showModalOverlay: false
    });
  },

  getFullName: function() {
    return personUtils.patientFullName(this.props.patient);
  },

  setHighlight: function(highlight) {
    var self = this;
    return function() {
      self.setState({
        highlight: highlight
      });
    };
  },

  stopPropagation: function(event) {
    event.stopPropagation();
  },

  onClick: function() {
    this.props.onClick();
  }
});

module.exports = PatientCard;
