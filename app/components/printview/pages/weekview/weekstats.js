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

var bows = require('bows');
var React = require('react');
var ReactDOM = require('react-dom');
var d3WeekStats = require('./d3/weekstats');

var WeekStats = React.createClass({
  log: bows('Print View Week Stats'),
  propTypes: {
    timeRange: React.PropTypes.array.isRequired,
    cbgData: React.PropTypes.array.isRequired,
    smbgData: React.PropTypes.array.isRequired,
    trackMetric: React.PropTypes.func.isRequired
  },

  componentDidMount: function() {
    var el = ReactDOM.findDOMNode(this);
    d3WeekStats.create(el, this.getChartState());
  },

  componentDidUpdate: function() {
    var el = ReactDOM.findDOMNode(this);
    d3WeekStats.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      cbgData: this.props.cbgData,
      smbgData: this.props.smbgData,
      margin: {top: 40, right: 0, bottom: 0, left: 67},
      width: '100%',
      cgmTimeHeight: 41,
      avgBgHeight: 110,
      totCarbsHeight: 20,
      insulinHeight: 20,
      domain: {x: this.props.timeRange, y: [0, 400]}
    };
  },

  componentWillUnmount: function() {
    var el = ReactDOM.findDOMNode(this);
    d3WeekStats.destroy(el);
  },

  render: function() {
    return (
      <div className='print-view-week-stats'></div>
    );
  }
});

module.exports = WeekStats;