
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
import moment from 'moment';

import { Flex } from 'theme-ui';

var launchCustomProtocol = require('custom-protocol-detection');
var UploadLaunchOverlay = require('../uploadlaunchoverlay');

var personUtils = require('../../core/personutils');

var NavbarPatientCard = withTranslation()(class extends React.Component {
  static propTypes = {
    href: PropTypes.string.isRequired,
    currentPage: PropTypes.string,
    uploadUrl: PropTypes.string,
    patient: PropTypes.object,
    trackMetric: PropTypes.func.isRequired,
    permsOfLoggedInUser: PropTypes.object,
  };

  state = {
    showUploadOverlay: false,
  };

  render() {
    var patient = this.props.patient || {};
    var self = this;
    const birthday = patient?.profile?.patient?.birthday;

    let formattedBirthday;
    if (moment(birthday, 'YYYY-MM-DD', true).isValid()) {
      formattedBirthday = moment(birthday).format('MMMM D, YYYY');
    }

    var classes = cx({
      patientcard: true,
    });

    var view = this.renderView(patient);
    var upload = this.renderUpload(patient);
    var share = this.renderShare(patient);
    var profile = this.renderProfile(patient);
    var overlay = this.state.showUploadOverlay ? this.renderOverlay() : null;

    return (
      <Flex sx={{ alignItems: 'center' }} className={classes}>
        <i className="Navbar-icon icon-face-standin"></i>
        <div className="patientcard-info">
          {profile}
          {formattedBirthday && (
            <div className="patientcard-dateOfBirth">
              {formattedBirthday}
            </div>
          )}
          <div className="patientcard-actions">
            {view}
            {share}
            {upload}
          </div>
        </div>
        <div className="clear"></div>
        {overlay}
      </Flex>
    );
  }

  renderView = () => {
    const { t } = this.props;
    var classes = cx({
      'patientcard-actions-view': true,
      'patientcard-actions--highlight': this.props.currentPage && this.props.currentPage.match(/(data)$/i),
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked Navbar View Data');
    };

    return (
      <Link className={classes} onClick={handleClick} to={this.props.href}>{t('View')}</Link>
    );
  };

  renderProfile = (patient) => {
    const { t } = this.props;
    var url = '';
    if (!_.isEmpty(patient.link)) {
      url = patient.link.slice(0,-5) + '/profile';
    }

    var classes = cx({
      'patientcard-actions-profile': true,
      'navbarpatientcard-profile': true,
      'patientcard-actions--highlight': this.props.currentPage && this.props.currentPage.match(/(profile)$/i),
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked Navbar Name');
    };

    return (
      <Link className={classes} to={url} onClick={handleClick} title={t('Profile')}>
        <div className="patientcard-fullname" title={this.getFullName()}>
          {this.getFullName()}
          <i className="patientcard-icon icon-settings"></i>
        </div>
      </Link>
    );
  };

  renderUpload = (patient) => {
    const { t } = this.props;
    var classes = cx({
      'patientcard-actions-upload': true,
    });

    var self = this;
    var handleClick = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      self.setState({showUploadOverlay: true});
      launchCustomProtocol('tidepoolupload://open');
      self.props.trackMetric('Clicked Navbar Upload Data');
    };

    if(_.isEmpty(patient.permissions) === false && patient.permissions.root || _.has(this.props.permsOfLoggedInUser, 'upload') ) {
      return (
        <a href="" onClick={handleClick} className={classes} title={t('Upload data')}>{t('Upload')}</a>
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
      'patientcard-actions--highlight': this.props.currentPage && this.props.currentPage.match(/(share)$/i),
    });

    var self = this;
    var handleClick = function(e) {
      self.props.trackMetric('Clicked Navbar Share Data');
    };

    if(_.isEmpty(patient.permissions) === false && patient.permissions.root) {
      return (
        <Link className={classes} onClick={handleClick} to={shareUrl} title={t('Share data')}>{t('Share')}</Link>
      );
    }

    return null;
  };

  renderOverlay = () => {
    return <UploadLaunchOverlay modalDismissHandler={()=>{this.setState({showUploadOverlay: false})}}/>
  };

  getFullName = () => {
    return personUtils.patientFullName(this.props.patient);
  };
});

module.exports = NavbarPatientCard;
