
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

import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import cx from 'classnames';
import launchCustomProtocol from 'custom-protocol-detection';
import utils from '../../core/utils';

var personUtils = require('../../core/personutils');
var ModalOverlay = require('../modaloverlay');
var UploadLaunchOverlay = require('../uploadlaunchoverlay');

var PatientCard = withTranslation()(class extends React.Component {
  static propTypes = {
    href: PropTypes.string.isRequired,
    currentPage: PropTypes.string,
    isEditing: PropTypes.bool,
    isNavbar: PropTypes.bool,
    onClick: PropTypes.func,
    onRemovePatient: PropTypes.func,
    uploadUrl: PropTypes.string,
    patient: PropTypes.object.isRequired,
    trackMetric: PropTypes.func.isRequired,
    isSmartOnFhirMode: PropTypes.bool.isRequired,
  };

  state = {
    showModalOverlay: false,
    dialog: '',
    showUploadOverlay: false,
  };

  render() {
    var patient = this.props.patient || {};
    var self = this;
    var classes = cx({
      'patientcard': true,
      'isEditing': this.props.isEditing,
      'patientcard-actions--highlight': (!this.props.isNavbar && this.state.highlight === 'view'),
    });

    var view = this.renderView(patient);
    var remove = this.renderRemove(patient);
    var upload = this.renderUpload(patient);
    var share = this.renderShare(patient);
    var profile = this.renderProfile(patient);
    var uploadLaunchOverlay = this.state.showUploadOverlay && !this.props.isSmartOnFhirMode ? this.renderUploadOverlay() : null;

    return (
      <div>
        <div className={classes} onClick={this.onClick}>
          <Link className="patientcard-icon" to={this.props.href} onMouseEnter={this.setHighlight('view')} onMouseLeave={this.setHighlight('')} onClick={self.handleViewClick}>
            <i className="Navbar-icon icon-face-standin"></i>
          </Link>
          <div className="patientcard-info">
            <Link className="patientcard-fullname-link" to={this.props.href} onMouseEnter={this.setHighlight('view')} onMouseLeave={this.setHighlight('')} onClick={self.handleViewClick}>
              <div className="patientcard-fullname" title={this.getFullName()}>{this.getFullName()} {profile}</div>
            </Link>
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
        {uploadLaunchOverlay}
      </div>
    );

  }

  renderView = () => {
    const { t } = this.props;
    var classes = cx({
      'patientcard-actions-view': true,
      'patientcard-actions--highlight': (!this.props.isNavbar && this.state.highlight === 'view') || this.props.currentPage && this.props.currentPage.match(/(data)$/i),
    });

    var self = this;

    return (
      <Link className={classes} to={this.props.href} onMouseEnter={this.setHighlight('view')} onMouseLeave={this.setHighlight('')} onClick={self.handleViewClick}>{t('View')}</Link>
    );
  };

  renderProfile = (patient) => {
    if (!this.props.isNavbar) {
      return;
    }

    var url = '';
    if (!_.isEmpty(patient.link)) {
      url = patient.link.slice(0,-5) + '/profile';
    }

    var classes = cx({
      'patientcard-actions-profile': true,
      'patientcard-actions--highlight': (!this.props.isNavbar && this.state.highlight === 'profile') || this.props.currentPage && this.props.currentPage.match(/(profile)$/i),
    });

    var iconClass = cx({
      'patientcard-icon': true,
      'icon-settings': true,
      'patientcard-icon--highlight': this.props.currentPage && this.props.currentPage.match(/(profile)$/i),
    });

    return (
      <Link className={classes} onClick={this.stopPropagation} onMouseEnter={this.setHighlight('profile')} onMouseLeave={this.setHighlight('view')} to={url} title="Profile">
        <i className={iconClass}></i>
      </Link>
    );
  };

  renderRemove = (patient) => {
    var classes = cx({
      'patientcard-actions-remove': true,
      'patientcard-actions--highlight': this.state.highlight === 'remove',
    });

    if (_.isEmpty(patient.permissions) === false && !patient.permissions.root) {
      var title = 'Remove yourself from ' + this.getFullName() + '\'s care team.';
      var getHighlight = () => this.state.showModalOverlay ? 'view' : '';

      return (
        <a className={classes} href="" onMouseEnter={this.setHighlight('remove')} onMouseLeave={this.setHighlight(getHighlight())} onClick={this.handleRemove(patient)} title={title}>
          <i className="Navbar-icon icon-delete"></i>
        </a>
      );
    }
  };

  renderUpload = (patient) => {
    const { t } = this.props;
    var classes = cx({
      'patientcard-actions-upload': true,
      'patientcard-actions--highlight': this.state.highlight === 'upload',
    });

    var self = this;
    var handleClick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      self.setState({showUploadOverlay: true});
      launchCustomProtocol('tidepoolupload://open');
      self.props.trackMetric('Clicked VDF Upload Data');
    };

    const hasPermission = _.isEmpty(patient.permissions) === false && patient.permissions.root || _.has(patient.permissions, ['upload']);

    if (hasPermission && !utils.isMobile()) {
      return (
        <a className={classes} href='' onClick={handleClick} onMouseEnter={this.setHighlight('upload')} onMouseLeave={this.setHighlight('')} title={t('Upload data')}>{t('Upload')}</a>
      );
    }

    return null;
  };

  renderShare = (patient) => {
    const { t } = this.props;
    var shareUrl = '';
    if (!_.isEmpty(patient.link)) {
      shareUrl = patient.link.slice(0,-5) + '/share';
    }

    var classes = cx({
      'patientcard-actions-share': true,
      'patientcard-actions--highlight': (!this.props.isNavbar && this.state.highlight === 'share')  || this.props.currentPage && this.props.currentPage.match(/(share)$/i),
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked VDF Share Data');
    };

    if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
      return (
        <Link className={classes} onClick={handleClick} onMouseEnter={this.setHighlight('share')} onMouseLeave={this.setHighlight('')} to={shareUrl} title={t('Share data')}>{t('Share')}</Link>
      );
    }

    return null;
  };

  renderRemoveDialog = (patient) => {
    const { t } = this.props;
    return (
      <div>
        <div className="ModalOverlay-content">{t('Are you sure you want to leave this person\'s Care Team? You will no longer be able to view their data.')}</div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.modalDismissHandler}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--warning PatientInfo-button--primary" type="submit" onClick={this.handleRemovePatient(patient)}>{t('I\'m sure, remove me.')}</button>
        </div>
      </div>
    );
  };

  renderModalOverlay = () => {
    return (
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.modalDismissHandler}/>
    );
  };

  renderUploadOverlay = () => {
    return <UploadLaunchOverlay modalDismissHandler={this.modalDismissHandler}/>
  };

  handleRemovePatient = (patient) => {
    var self = this;

    return function() {
      self.props.onRemovePatient(patient.userid, function(err) {
          self.setState({
            showModalOverlay: false,
          });
        }
      );
    };
  };

  handleRemove = (patient) => {
    var self = this;

    return function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      self.setState({
        showModalOverlay: true,
        dialog: self.renderRemoveDialog(patient),
      });

      return false;
    };
  };

  modalDismissHandler = () => {
    this.setState({
      showModalOverlay: false,
      showUploadOverlay: false,
      highlight: '',
    });
  };

  getFullName = () => {
    return personUtils.patientFullName(this.props.patient);
  };

  setHighlight = (highlight) => {
    var self = this;
    return function() {
      self.setState({
        highlight: highlight,
      });
    };
  };

  stopPropagation = (event) => {
    event.stopPropagation();
  };

  onClick = () => {
    this.props.onClick();
  };

  handleViewClick = () => {
    this.props.trackMetric('Clicked VDF View Data');
  };
});

module.exports = PatientCard;
