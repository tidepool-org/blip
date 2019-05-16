
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
import bows from 'bows';
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

const Settings = translate()(React.createClass({
  chartType: 'settings',
  log: bows('Settings View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    chartPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    patient: React.PropTypes.object,
    patientData: React.PropTypes.object.isRequired,
    pdf: React.PropTypes.object.isRequired,
    onClickRefresh: React.PropTypes.func.isRequired,
    onClickNoDataRefresh: React.PropTypes.func.isRequired,
    onSwitchToBasics: React.PropTypes.func.isRequired,
    onSwitchToDaily: React.PropTypes.func.isRequired,
    onSwitchToTrends: React.PropTypes.func.isRequired,
    onSwitchToSettings: React.PropTypes.func.isRequired,
    onSwitchToBgLog: React.PropTypes.func.isRequired,
    onClickPrint: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    uploadUrl: React.PropTypes.string.isRequired
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
        timePrefs={this.props.timePrefs}
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
  },

  // handlers
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
  }
}));

module.exports = Settings;
