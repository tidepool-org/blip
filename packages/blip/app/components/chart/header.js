/*
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */
import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import i18n from '../../core/language';
import config from '../../config';

import Link from '@material-ui/core/Link';
import Timeline from '@material-ui/icons/Timeline';
import StayCurrentPortrait from '@material-ui/icons/StayCurrentPortrait';

const t = i18n.t.bind(i18n);

class TidelineHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isDialogOpen: false };
  }

  static propTypes = {
    patient: PropTypes.object,
    title: PropTypes.node.isRequired,
    chartType: PropTypes.string.isRequired,
    inTransition: PropTypes.bool,
    atMostRecent: PropTypes.bool.isRequired,
    iconBack: PropTypes.string,
    iconNext: PropTypes.string,
    iconMostRecent: PropTypes.string,
    trackMetric: PropTypes.func.isRequired,
    canPrint: PropTypes.bool.isRequired,
    permsOfLoggedInUser: PropTypes.object,
    onClickBack: PropTypes.func,
    onClickBasics: PropTypes.func,
    onClickTrends: PropTypes.func,
    onClickMostRecent: PropTypes.func,
    onClickNext: PropTypes.func,
    onClickOneDay: PropTypes.func,
    onClickBgLog: PropTypes.func,
    onClickSettings: PropTypes.func,
    onClickPrint: PropTypes.func,
    ProfileDialog: PropTypes.func,
  };

  static defaultProps = {
    inTransition: false,
  };

  getPatientLink() {
    const { patient } = this.props;
    if (!patient || !patient.userid) {
      return '/hcp/patients';
    }
    return `/hcp/profile/${patient.userid}`;
  }

  renderStandard() {
    const { canPrint } = this.props;

    const printViews = ['basics', 'daily', 'bgLog', 'settings'];
    const showPrintLink = _.includes(printViews, this.props.chartType);
    const showHome = _.has(this.props.permsOfLoggedInUser, 'view');
    const homeValue = _.get(this.props.patient, 'profile.fullName', t('Home'));
    const patientLink = this.getPatientLink();

    const home = cx({
      'js-home': true,
      'patient-data-subnav-active': showHome,
      'patient-data-subnav-hidden': !showHome,
    });

    const basicsLinkClass = cx({
      'js-basics': true,
      'patient-data-subnav-active': this.props.chartType === 'basics',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const dayLinkClass = cx({
      'js-daily': true,
      'patient-data-subnav-active': this.props.chartType === 'daily',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const trendsLinkClass = cx({
      'js-trends': true,
      'patient-data-subnav-active': this.props.chartType === 'trends',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const bgLogLinkClass = cx({
      'js-bgLog': true,
      'd-none': config.BRANDING === 'diabeloop',
      'patient-data-subnav-active': this.props.chartType === 'bgLog',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const dateLinkClass = cx({
      'js-date': true,
      'patient-data-subnav-text':
        this.props.chartType === 'basics' ||
        this.props.chartType === 'daily' ||
        this.props.chartType === 'bgLog' ||
        this.props.chartType === 'trends',
      'patient-data-subnav-dates-basics': this.props.chartType === 'basics',
      'patient-data-subnav-dates-daily': this.props.chartType === 'daily',
      'patient-data-subnav-dates-bgLog': this.props.chartType === 'bgLog',
      'patient-data-subnav-dates-trends': this.props.chartType === 'trends',
    });

    const mostRecentClass = cx({
      'js-most-recent': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const backClass = cx({
      'js-back': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' || this.props.chartType === 'no-data',
    });

    const nextClass = cx({
      'js-next': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' || this.props.chartType === 'no-data',
    });

    const settingsLinkClass = cx({
      'patient-data-subnav-button': true,
      'js-settings': true,
      'patient-data-subnav-right': true,
      'patient-data-subnav-right-label': true,
      'patient-data-subnav-active': this.props.chartType === 'settings',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    let printLink = null;
    if (canPrint && showPrintLink) {
      const printLinkClass = cx({
        'patient-data-subnav-button': true,
        'printview-print-icon': true,
        'patient-data-subnav-active': true,
      });

      printLink = (
        <button className={printLinkClass} onClick={this.onClickPrint}>
          <Timeline className='print-icon' />
          {t('Print')}
        </button>
      );
    }

    /** @type {(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void} */
    const handleClick = (/* e */) => {
      // e.preventDefault();
      // FIXME: Find a way to use the react-router-dom
      this.props.trackMetric('Clicked Navbar Name');
      this.setState({ isDialogOpen: true });
    };

    const handleDialogClose = () => {
      this.setState({ isDialogOpen: false });
    };

    let profileDialog = null;
    if (this.props.ProfileDialog) {
      const ProfileDialog = this.props.ProfileDialog;
      profileDialog = (
        <ProfileDialog user={this.props.patient} isOpen={this.state.isDialogOpen} handleClose={handleDialogClose} />
      );
    }

    return (
      <div className='grid patient-data-subnav'>
        <div className='app-no-print patient-data-subnav-left'>
          {/* Here we can add the home icon */}
          <Link className={home} to={patientLink} onClick={handleClick} title={t('Profile')}>
            <div>{homeValue}</div>
          </Link>
          {profileDialog}
        </div>
        <div className='app-no-print patient-data-subnav-left'>
          <a href='' className={basicsLinkClass} onClick={this.props.onClickBasics}>
            {t('Basics')}
          </a>
          <a href='' className={dayLinkClass} onClick={this.props.onClickOneDay}>
            {t('Daily')}
          </a>
          <a href='' className={bgLogLinkClass} onClick={this.props.onClickBgLog}>
            {t('BG Log')}
          </a>
          <a href='' className={trendsLinkClass} onClick={this.props.onClickTrends}>
            {t('Trends')}
          </a>
        </div>
        <div className='patient-data-subnav-center' id='tidelineLabel'>
          {this.renderNavButton(backClass, this.props.onClickBack, this.props.iconBack)}
          <div className={dateLinkClass}>{this.props.title}</div>
          {this.renderNavButton(nextClass, this.props.onClickNext, this.props.iconNext)}
          {this.renderNavButton(mostRecentClass, this.props.onClickMostRecent, this.props.iconMostRecent)}
        </div>
        <div className='app-no-print patient-data-subnav-right'>
          {printLink}
          <button className={settingsLinkClass} onClick={this.props.onClickSettings}>
            <StayCurrentPortrait />
            {t('Device settings')}
          </button>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className='container-box-outer patient-data-subnav-outer'>
        <div className='container-box-inner patient-data-subnav-inner'>{this.renderStandard()}</div>
      </div>
    );
  }

  /**
   * Helper function for rendering the various navigation buttons in the header.
   * It accounts for the transition state and disables the button if it is currently processing.
   *
   * @param  {String} buttonClass
   * @param  {Function} clickAction
   * @param  {String} icon
   *
   * @return {JSX.Element}
   */
  renderNavButton(buttonClass, clickAction, icon) {
    const nullAction = function (e) {
      if (e) {
        e.preventDefault();
      }
    };
    if (this.props.inTransition) {
      return (
        <a href='' className={buttonClass} onClick={nullAction}>
          <i className={icon} />
        </a>
      );
    } else {
      return (
        <a href='' className={buttonClass} onClick={clickAction}>
          <i className={icon} />
        </a>
      );
    }
  }

  /**
   * @param {React.MouseEvent<HTMLButtonElement, MouseEvent>} event The DOM/React event
   */
  onClickPrint = (event) => {
    event.preventDefault();
    this.props.onClickPrint();
  };
}

export default TidelineHeader;
