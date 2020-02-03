
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
import createReactClass from 'create-react-class';
import { Trans, translate } from 'react-i18next';

import * as viz from '@tidepool/viz';
const PumpSettingsContainer = viz.containers.PumpSettingsContainer;

import Header from './header';
import Footer from './footer';

const Settings = translate()(createReactClass({
  displayName: 'Settings',
  chartType: 'settings',
  log: bows('Settings View'),

  propTypes: {
    chartPrefs: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onClickNoDataRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onSwitchToBgLog: PropTypes.func.isRequired,
    onClickPrint: PropTypes.func.isRequired,
    patient: PropTypes.object,
    pdf: PropTypes.object.isRequired,
    trackMetric: PropTypes.func.isRequired,
    updateChartPrefs: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired
  },

  getInitialState: function() {
    return {
      atMostRecent: true,
      inTransition: false,
      title: ''
    };
  },

  render: function() {
    return (
      <div id="tidelineMain">
        <Header
          chartType={this.chartType}
          patient={this.props.patient}
          printReady={!!this.props.pdf.url}
          atMostRecent={true}
          inTransition={this.state.inTransition}
          title={this.state.title}
          onClickMostRecent={this.handleClickMostRecent}
          onClickBasics={this.props.onSwitchToBasics}
          onClickOneDay={this.handleClickOneDay}
          onClickTrends={this.handleClickTrends}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.handleClickSettings}
          onClickBgLog={this.handleClickBgLog}
          onClickPrint={this.handleClickPrint}
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
  },

  renderChart: function() {
    const latestPumpUpload = _.get(this.props, 'data.metaData.latestPumpUpload', {});
    const latestPumpSettings = _.get(latestPumpUpload, 'settings', {});

    return (
      <PumpSettingsContainer
        currentPatientInViewId={this.props.currentPatientInViewId}
        copySettingsClicked={this.handleCopySettingsClicked}
        bgUnits={_.get(this.props, 'data.bgPrefs', {}).bgUnits}
        manufacturerKey={latestPumpUpload.manufacturer}
        toggleSettingsSection={this.toggleSettingsSection}
        settingsState={_.get(this.props, ['chartPrefs', this.chartType])}
        pumpSettings={latestPumpSettings}
        timePrefs={_.get(this.props, 'data.timePrefs', {})}
        view='display'
      />
    );
  },

  renderMissingSettingsMessage: function() {
    const self = this;
    const handleClickUpload = function() {
      self.props.trackMetric('Clicked Partial Data Upload, No Settings');
    };

    return (
      <Trans className="patient-data-message patient-data-message-loading" i18nKey="html.setting-no-uploaded-data">
        <p>The Device Settings view shows your basal rates, carb ratios, sensitivity factors and more, but it looks like you haven't uploaded pump data yet.</p>
        <p>To see your Device Settings, <a
            href={this.props.uploadUrl}
            target="_blank"
            onClick={handleClickUpload}>upload</a> your pump.</p>
        <p>
          If you just uploaded, try <a href="" onClick={this.props.onClickNoDataRefresh}>refreshing</a>.
        </p>
      </Trans>
    );

  },

  isMissingSettings: function() {
    return !_.get(this.props, 'data.metaData.latestPumpUpload.settings');
  },

  // handlers
  handleCopySettingsClicked: function() {
    this.props.trackMetric('Clicked Copy Settings', { source: 'Device Settings' });
  },

  handleClickTrends: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToTrends();
  },

  handleClickMostRecent: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },

  handleClickOneDay: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToDaily();
  },

  handleClickSettings: function(e) {
    if (e) {
      e.preventDefault();
    }
    return;
  },

  handleClickPrint: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.props.onClickPrint(this.props.pdf);
  },

  handleClickBgLog: function(e) {
    if (e) {
      e.preventDefault();
    }
    this.props.onSwitchToBgLog();
  },

  toggleSettingsSection: function(deviceKey, scheduleOrProfileKey) {
    const prefs = _.cloneDeep(this.props.chartPrefs);

    if (!prefs.settings[deviceKey]) {
      prefs.settings[deviceKey] = { [scheduleOrProfileKey]: true };
    } else {
      prefs.settings[deviceKey][scheduleOrProfileKey] = !prefs.settings[deviceKey][scheduleOrProfileKey];
    }

    prefs.settings.touched = true;

    this.props.updateChartPrefs(prefs, false);
  },
}));

module.exports = Settings;
