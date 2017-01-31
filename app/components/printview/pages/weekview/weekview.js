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
var WeekChart = require('./weekchart');
var WeekStats = require('./weekstats');

var WeekView = React.createClass({
  log: bows('Print View Week View'),
  propTypes: {
    bgPrefs: React.PropTypes.object.isRequired,
    timePrefs: React.PropTypes.object.isRequired,
    timeRange: React.PropTypes.array.isRequired,
    patient: React.PropTypes.object.isRequired,
    patientData: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  render: function() {
    var cbgData = this.sortByTime(
                    this.filterInTimeRange(
                      this.props.patientData.grouped.cbg));
    var smbgData = this.sortByTime(
                    this.filterInTimeRange(
                      this.props.patientData.grouped.smbg));

    return (
      <div className='print-view-week-view-content'>
        <WeekChart
          timeRange={this.props.timeRange}
          cbgData={cbgData}
          smbgData={smbgData}
          trackMetric={this.props.trackMetric} />
        <WeekStats
          timeRange={this.props.timeRange}
          cbgData={cbgData}
          smbgData={smbgData}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  },

  filterInTimeRange: function(data) {
    var timeRange = this.props.timeRange;
    return _.filter(data, function(d) {
      var date = new Date(d.time).getTime(),
          start = timeRange[0].getTime(),
          end = timeRange[1].getTime();
      return date >= start
              && date < end;
    });
  },

  sortByTime: function(data) {
    return _.sortBy(data, function(d) {
      return new Date(d.time);
    });
  }

});

module.exports = WeekView;