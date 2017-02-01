
/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import utils from '../../core/utils';
import personUtils from '../../core/personutils';

import tidepoolpng from './img/bw-tidepool-logo.png';

import * as viz from '@tidepool/viz';
const PumpSettingsContainer = viz.containers.PumpSettingsContainer;

var tideline = {
  log: bows('SettingsPrintView')
};

var SettingsPrintView = React.createClass({
  chartType: 'settings',
  log: bows('Settings View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    patient: React.PropTypes.object,
    trackMetric: React.PropTypes.func.isRequired,
  },
  render: function() {
    return (
      <div className="print-view-content">
        <div className="print-view-page print-view-page-title">
        </div>
        <div className="print-view-page print-view-page-device-settings">
          {this.renderHeader()}
          {this.isMissingSettings() ? null : this.renderChart()}
        </div>
      </div>
    );
  },
  renderHeader: function() {
    var patientName = personUtils.patientFullName(this.props.patient);
    return (
      <div className="print-view-header">
        <p className="print-view-header-name">{ patientName }</p>
        <p className="print-view-header-title">'Device Settings'</p>
        <div className="print-view-header-logos">
          <img className='print-view-logo' src={tidepoolpng} alt="Tidepool logo" />
        </div>
      </div>
    );
  },
  renderChart: function() {
    const mostRecentSettings = _.last(this.props.patientData.grouped.pumpSettings);
    return (
      <PumpSettingsContainer
        currentPatientInViewId={this.props.currentPatientInViewId}
        bgUnits={this.props.bgPrefs.bgUnits}
        manufacturerKey={_.get(mostRecentSettings, 'source').toLowerCase()}
        pumpSettings={mostRecentSettings}
        timePrefs={this.props.timePrefs}
      />
    );
  },
  isMissingSettings: function() {
    var data = this.props.patientData;
    var pumpSettings = utils.getIn(data, ['grouped', 'pumpSettings'], false);
    if (pumpSettings === false) {
      return true;
    }
    // the TidelineData constructor currently replaces missing data with
    // an empty array, so we also have to check for content
    else if (_.isEmpty(pumpSettings)) {
      return true;
    }
    return false;
  }
});

module.exports = SettingsPrintView;
