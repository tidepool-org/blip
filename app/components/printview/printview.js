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
var _ = require('lodash');
var bows = require('bows');
var React = require('react');
var ReactDOM = require('react-dom');

import bw_tidepoolpng from './img/bw-tidepool-logo.png';
import bw_blippng from './img/bw-blip-logo.png';

import personUtils from '../../core/personutils';
import utils from '../../core/utils';

import DeviceSettings from './pages/settings';
import WeekView from './pages/weekview/weekview';

var PrintView = React.createClass({
  log: bows('Print View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    weekViewTimeRanges: React.PropTypes.array.isRequired,
    patient: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <div>{ this.renderPrintView() }</div>
    );

  },

  renderPrintView: function() {
    var renderWeekView = this.renderWeekView;
    return (
      <div className="print-view-content">
        <div className="print-view-page print-view-page-title">
          { this.renderTitlePage() }
        </div>
        <div className="print-view-page print-view-page-device-settings">
          { this.isMissingSettings() ? null : this.renderDeviceSettings() }
        </div>
        { this.props.weekViewTimeRanges.map(function(period) {
          return (
            <div key={period[0].toUTCString()} className="print-view-page print-view-page-week-view">
              { renderWeekView(period) }
            </div>
          );
        }) }
      </div>
    );
  },

  renderTitlePage: function() {
    return null;
  },

  renderDeviceSettings: function() {
    return (
      <div>
        { this.renderPageHeader('Device Settings') }
        <DeviceSettings
          bgPrefs={this.props.bgPrefs}
          timePrefs={this.props.timePrefs}
          patient={this.props.patient}
          patientData={this.props.patientData}
          updateDatetimeLocation={this.updateDatetimeLocation}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  },

  renderWeekView: function(period) {
    return (
      <div key={period[0].toUTCString()}>
        { this.renderPageHeader(getDateRangeString(period)) }
        <WeekView
            bgPrefs={this.props.bgPrefs}
            timePrefs={this.props.timePrefs}
            timeRange={period}
            patient={this.props.patient}
            patientData={this.props.patientData}
            updateDatetimeLocation={this.updateDatetimeLocation}
            trackMetric={this.props.trackMetric} />
      </div>
    );
  },

  renderPageHeader: function(title) {
    var patientName = personUtils.patientFullName(this.props.patient);
    return (
      <div className="print-view-header">
        <p className="print-view-header-name">{ patientName }</p>
        <p className="print-view-header-title">{ title }</p>
        <div className="print-view-header-logos">
          <img className='print-view-logo' src={bw_tidepoolpng} alt="Tidepool logo" />
          <img className='print-view-logo' src={bw_blippng} alt="Blip logo" />
        </div>
      </div>
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

module.exports = PrintView;

var getDateRangeString = function(period) {
  var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return monthNames[period[0].getMonth()] + ' ' + period[0].getDate()
          + ', ' + period[0].getFullYear() + ' - '
          + monthNames[period[1].getMonth()] + ' ' + period[1].getDate()
          + ', ' + period[1].getFullYear();
}