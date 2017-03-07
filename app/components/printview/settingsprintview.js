
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
import sundial from 'sundial';

import utils from '../../core/utils';
import personUtils from '../../core/personutils';

import tidepoolpng from './img/bw-tidepool-logo.png';

import * as viz from '@tidepool/viz';
const PumpSettingsContainer = viz.containers.PumpSettingsContainer;

const tideline = {
  log: bows('SettingsPrintView')
};

const SettingsPrintView = React.createClass({
  chartType: 'settings',
  log: bows('Settings View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    currentPatientInViewId: React.PropTypes.string.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    patient: React.PropTypes.object,
    trackMetric: React.PropTypes.func.isRequired,
  },
  render: function() {
    return (
      <div className="print-view-content">
        <div className="print-view-page print-view-page-title">
          <div className="print-view-page print-view-page-device-settings">
            {this.renderHeader()}
            {this.renderChart()}
          </div>
        </div>
      </div>
    );
  },
  renderHeader: function() {
    const patientName = personUtils.patientFullName(this.props.patient);
    return (
      <div className="print-view-header">
        <p className="print-view-header-title">Pump Settings</p>
        <p className="print-view-header-name">{ patientName }</p>
        <p className="print-view-header-date">
          { sundial.formatInTimezone(Date.now(), 'UTC', 'MMM D, YYYY') }
        </p>
        <div className="print-view-header-logos">
          <img className='print-view-logo' src={ tidepoolpng } alt="Tidepool logo" />
        </div>
      </div>
    );
  },
  renderChart: function() {
    const mostRecentSettings = _.last(this.props.patientData.grouped.pumpSettings);
    const manufacturer = _.get(mostRecentSettings, 'source').toLowerCase();

    return (
      <PumpSettingsContainer
        currentPatientInViewId={this.props.currentPatientInViewId}
        bgUnits={this.props.bgPrefs.bgUnits}
        manufacturerKey={manufacturer}
        pumpSettings={mostRecentSettings}
        timePrefs={this.props.timePrefs}
        view='print'
      />
    );
  }
});

module.exports = SettingsPrintView;
