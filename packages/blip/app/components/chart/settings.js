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

/**
 * @typedef { import("tideline").TidelineData } TidelineData
 */

import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import i18next from "i18next";
import { Trans } from "react-i18next";
import bows from "bows";

import * as viz from "tidepool-viz";

import Header from "./header";
import Footer from "./footer";

const PumpSettingsContainer = viz.containers.PumpSettingsContainer;

class Settings extends React.Component {
  static propTypes = {
    bgPrefs: PropTypes.object.isRequired,
    chartPrefs: PropTypes.object.isRequired,
    timePrefs: PropTypes.object.isRequired,
    patient: PropTypes.object,
    patientData: PropTypes.object.isRequired,
    permsOfLoggedInUser: PropTypes.object.isRequired,
    currentPatientInViewId: PropTypes.string.isRequired,
    canPrint: PropTypes.bool.isRequired,
    onClickRefresh: PropTypes.func.isRequired,
    onClickNoDataRefresh: PropTypes.func.isRequired,
    onSwitchToBasics: PropTypes.func.isRequired,
    onSwitchToDaily: PropTypes.func.isRequired,
    onSwitchToTrends: PropTypes.func.isRequired,
    onSwitchToSettings: PropTypes.func.isRequired,
    onClickPrint: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    prefixURL: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      atMostRecent: true,
      inTransition: false,
      title: ""
    };
    this.chartType = "settings";

    /** @type {Console} */
    this.log = bows("ChartSettings");
  }

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
          prefixURL={this.props.prefixURL}
          trackMetric={this.props.trackMetric}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          onClickMostRecent={this.handleClickMostRecent}
          onClickBasics={this.props.onSwitchToBasics}
          onClickOneDay={this.handleClickOneDay}
          onClickTrends={this.handleClickTrends}
          onClickRefresh={this.props.onClickRefresh}
          onClickSettings={this.handleClickSettings}
          onClickPrint={this.props.onClickPrint} />
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
          onClickSettings={this.props.onSwitchToSettings} />
      </div>
    );
  }

  renderChart() {
    /** @type {{patientData: TidelineData}} */
    const { patientData } = this.props;
    const mostRecentSettings = _.last(patientData.grouped.pumpSettings);
    this.log.debug("Settings.renderChart()", mostRecentSettings);
    const handleCopySettings = (success, useClipboardAPI, error ) => {
      this.log.info("handleCopySettings", { success, useClipboardAPI, error });
      this.props.trackMetric("export_data", "copy_as_text", "settings");
    };

    return (
      <PumpSettingsContainer
        copySettingsClicked={handleCopySettings}
        manufacturerKey={_.get(mostRecentSettings, "source", patientData.opts.defaultSource).toLowerCase()}
        pumpSettings={mostRecentSettings}
        timePrefs={this.props.timePrefs}
        onSwitchToDaily={this.props.onSwitchToDaily}
        bgUnits={this.props.bgPrefs.bgUnits}
      />
    );
  }

  renderMissingSettingsMessage() {
    const t = i18next.t.bind(i18next);
    return (
      <Trans className="patient-data-message patient-data-message-loading" i18nKey="html.setting-no-uploaded-data" t={t}>
        <p>
          The System Settings view shows your basal rates, carb ratios, sensitivity factors and more, but it looks like your system hasn't sent data yet.
        </p>
        <p>
          If you just checked it, try <button type="button" onClick={this.props.onClickNoDataRefresh}>refreshing</button>.
        </p>
      </Trans>
    );
  }

  isMissingSettings() {
    const pumpSettings = _.get(this.props, "patientData.grouped.pumpSettings", []);
    return _.isEmpty(pumpSettings);
  }

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
}

export default Settings;
