
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
import { noop } from 'node-noop';

import PrintHeader from '../printheader';

import utils from '../../core/utils';

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
  },
  renderHeader: function() {
    return (
      <PrintHeader
        title="Pump Settings"
        patient={this.props.patient}
      />
    );
  },
  render: function() {
    const mostRecentSettings = _.last(this.props.patientData.grouped.pumpSettings) || {};
    const manufacturer = _.get(mostRecentSettings, 'source', '').toLowerCase();

    return (
      <div id="app-print" className="print-view-content">
        {this.renderHeader()}
        <div className="print-view-page print-view-page-device-settings">
          <PumpSettingsContainer
            currentPatientInViewId={this.props.currentPatientInViewId}
            copySettingsClicked={noop}
            bgUnits={this.props.bgPrefs.bgUnits}
            manufacturerKey={manufacturer}
            pumpSettings={mostRecentSettings}
            timePrefs={this.props.timePrefs}
            view='print'
          />
        </div>
      </div>
    );
  }
});

module.exports = SettingsPrintView;
