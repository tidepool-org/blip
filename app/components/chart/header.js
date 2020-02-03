
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
import Loading from 'react-loading';
import { translate } from 'react-i18next';

import printPng from './img/print-icon-2x.png';

const TidelineHeader = translate()(class TidelineHeader extends React.Component {
  static propTypes = {
    patient: PropTypes.object,
    printReady: PropTypes.bool,
    title: PropTypes.node.isRequired,
    chartType: PropTypes.string.isRequired,
    inTransition: PropTypes.bool,
    atMostRecent: PropTypes.bool.isRequired,
    iconBack: PropTypes.string,
    iconNext: PropTypes.string,
    iconMostRecent: PropTypes.string,
    onClickBack: PropTypes.func,
    onClickBasics: PropTypes.func,
    onClickTrends: PropTypes.func,
    onClickMostRecent: PropTypes.func,
    onClickNext: PropTypes.func,
    onClickOneDay: PropTypes.func,
    onClickBgLog: PropTypes.func,
    onClickSettings: PropTypes.func,
    onClickPrint: PropTypes.func,
  };

  static defaultProps = {
    inTransition: false,
    printReady: true,
  };

  renderStandard = () => {
    const { t } = this.props;

    const printViews = ['basics', 'daily', 'bgLog', 'settings'];
    const showPrintLink = _.includes(printViews, this.props.chartType);

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
      'patient-data-subnav-active': this.props.chartType === 'bgLog',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const dateLinkClass = cx({
      'js-date': true,
      'patient-data-subnav-text' : this.props.chartType === 'basics' ||
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
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data',
    });

    const nextClass = cx({
      'js-next': true,
      'patient-data-icon': true,
      'patient-data-subnav-active': !this.props.atMostRecent && !this.props.inTransition,
      'patient-data-subnav-disabled': this.props.atMostRecent || this.props.inTransition,
      'patient-data-subnav-hidden': this.props.chartType === 'settings' ||
        this.props.chartType === 'no-data',
    });

    const settingsLinkClass = cx({
      'js-settings': true,
      'patient-data-subnav-right': true,
      'patient-data-subnav-right-label': true,
      'patient-data-subnav-active': this.props.chartType === 'settings',
      'patient-data-subnav-hidden': this.props.chartType === 'no-data',
    });

    const printLinkClass = cx({
      'js-print-settings': this.props.chartType === 'settings',
      'printview-print-icon': true,
      'patient-data-subnav-right': true,
      'patient-data-subnav-right-label': true,
      'patient-data-subnav-active': showPrintLink,
      'patient-data-subnav-hidden': !showPrintLink,
      'patient-data-subnav-disabled': !this.props.printReady,
    });

    return (
      <div className="grid patient-data-subnav">
        <div className="app-no-print patient-data-subnav-left">
            <a href="" className={basicsLinkClass} onClick={this.props.onClickBasics}>{t('Basics')}</a>
            <a href="" className={dayLinkClass} onClick={this.props.onClickOneDay}>{t('Daily')}</a>
            <a href="" className={bgLogLinkClass} onClick={this.props.onClickBgLog}>{t('BG Log')}</a>
            <a href="" className={trendsLinkClass} onClick={this.props.onClickTrends}>{t('Trends')}</a>
        </div>
        <div className="patient-data-subnav-center" id="tidelineLabel">
          {this.renderNavButton(backClass, this.props.onClickBack, this.props.iconBack)}
          <div className={dateLinkClass}>
            {this.props.title}
          </div>
          {this.renderNavButton(nextClass, this.props.onClickNext, this.props.iconNext)}
          {this.renderNavButton(mostRecentClass, this.props.onClickMostRecent, this.props.iconMostRecent)}
        </div>
        <div className="app-no-print patient-data-subnav-right">
          <a href="" className={settingsLinkClass} onClick={this.props.onClickSettings}>{t('Device settings')}</a>
          <a href="" className={printLinkClass} onClick={this.props.onClickPrint}>
            {this.props.printReady && <img className="print-icon" src={printPng} alt="Print" />}
            {!this.props.printReady && <Loading className="print-loading-spinner" width={16} height={16} delay={0} type="spin" color="#fff" />}
            {t('Print')}
          </a>
        </div>
      </div>
    );
  };

  printTitle = () => {
    const { t } = this.props;
    switch (this.props.chartType) {
      case 'basics':
        return t('Basics');
      case 'daily':
        return t('Daily');
      case 'bgLog':
        return t('BG Log');
      case 'trends':
        return t('Trends');
      case 'settings':
        return t('Pump Settings');
      case 'no-data':
      default:
        return '';
    }
  };

  render = () => {
    return (
      <div className="container-box-outer patient-data-subnav-outer">
        <div className="container-box-inner patient-data-subnav-inner">
          {this.renderStandard()}
        </div>
      </div>
    );
  };

  /**
   * Helper function for rendering the various navigation buttons in the header.
   * It accounts for the transition state and disables the button if it is currently processing.
   *
   * @param  {String} buttonClass
   * @param  {Function} clickAction
   * @param  {String} icon
   *
   * @return {ReactElement}
   */
  renderNavButton = (buttonClass, clickAction, icon) => {
    const nullAction = function(e) {
      if (e) {
        e.preventDefault();
      }
    };
    if (this.props.inTransition) {
      return (<a href="" className={buttonClass} onClick={nullAction}><i className={icon}/></a>);
    } else {
      return (<a href="" className={buttonClass} onClick={clickAction}><i className={icon}/></a>);
    }
  };
});

export default TidelineHeader;
