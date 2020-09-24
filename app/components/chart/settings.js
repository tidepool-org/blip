
import _ from 'lodash';
import bows from 'bows';

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
import PropTypes from 'prop-types';

import React from 'react';
import ReactDOM from 'react-dom';
import { Trans, translate } from 'react-i18next';

import utils from '../../core/utils';

import * as viz from '@tidepool/viz';
const PumpSettingsContainer = viz.containers.PumpSettingsContainer;

import Header from './header';
import Footer from './footer';

const tideline = {
  log: bows('Settings')
};

const Settings = translate()(class extends React.Component {
  static propTypes = {
    bgPrefs: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    timePrefs: PropTypes.object.isRequired,
    patient: PropTypes.object,
    patientData: PropTypes.object.isRequired,
    canPrint: PropTypes.bool.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onClickNoDataRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToBgLog: PropTypes.func.isRequired,
    onClickPrint: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired
  };

  state = {
    atMostRecent: true,
    inTransition: false,
    title: ''
  };
  log = bows('Settings View');
  chartType = 'settings';

  render() {
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          patient={this.props.patient}
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          canPrint={this.props.canPrint}
          onClickMostRecent={this.handleClickMostRecent}
          onClickBasics={this.props.onSwitchToBasics}
          onClickOneDay={this.handleClickOneDay}
          onClickTrends={this.handleClickTrends}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.handleClickSettings}
          onClickBgLog={this.handleClickBgLog}
          onClickPrint={this.props.onClickPrint}
        ref="header" />
        <div className="container-box-outer patient-data-content-outer">
          <div className="container-box-inner patient-data-content-inner">
            <div className="patient-data-content">
              {this.isMissingSettings() ? this.renderMissingSettingsMessage() : this.renderChart()}
            </div>
          </div>
        </div>
        <Footer
         chartType={this.chartType}
         onClickRefresh={this.props.onClickRefresh}
         onClickSettings={this.props.onSwitchToSettings}
        ref="footer" />
      </div>
      );
  }

  renderChart = () => {
    const mostRecentSettings = _.last(this.props.patientData.grouped.pumpSettings);

    const self = this;
    const handleCopySettings = function() {
      self.props.trackMetric('Clicked Copy Settings');
    };

    return (
      <PumpSettingsContainer
        currentPatientInViewId={this.props.currentPatientInViewId}
        copySettingsClicked={handleCopySettings}
        bgUnits={this.props.bgPrefs.bgUnits}
        manufacturerKey={_.get(mostRecentSettings, 'source', '').toLowerCase()}
        pumpSettings={mostRecentSettings}
        onSwitchToDaily={this.props.onSwitchToDaily}
        timePrefs={this.props.timePrefs}
        view='display'
      />
    );
  };

  renderMissingSettingsMessage = () => {
    const self = this;
    const handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No Settings');
    };

    return (
      <Trans className="patient-data-message patient-data-message-loading" i18nKey="html.setting-no-uploaded-data">
        <p>
          The System Settings view shows your basal rates, carb ratios, sensitivity factors and more, but it looks like your system hasn't sent data yet.
        </p>
        <p>
          If you just checked it, try <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>.
        </p>
      </Trans>
    );

  };

  isMissingSettings = () => {
    const data = this.props.patientData;
    const pumpSettings = utils.getIn(data, ['grouped', 'pumpSettings'], false);
    if (pumpSettings === false) {
      return true;
    }
    // the TidelineData constructor currently replaces missing data with
    // an empty array, so we also have to check for content
    else if (_.isEmpty(pumpSettings)) {
      return true;
    }

    return false;
  };

  // handlers
  handleClickTrends = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToTrends();
  };

  handleClickMostRecent = (e) => {
    if (e) {
      e.preventDefault();
    }
    return;
  };

  handleClickOneDay = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily();
  };

  handleClickSettings = (e) => {
    if (e) {
      e.preventDefault();
    }
    return;
  };

  handleClickBgLog = (e) => {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToBgLog();
  };
});

module.exports = Settings;
