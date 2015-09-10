/** @jsx React.DOM */
/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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
var cx = require('classnames');
var moment = require('moment');
var React = require('react');

var debug = bows('Calendar');
var basicsActions = require('../logic/actions');

var ADay = require('./day/ADay');
var WrapCount = require('./chart/WrapCount');

var CalendarContainer = React.createClass({
  propTypes: {
    section: React.PropTypes.string.isRequired,
    component: React.PropTypes.string.isRequired,
    chart: React.PropTypes.func.isRequired,
    data: React.PropTypes.object.isRequired,
    days: React.PropTypes.array.isRequired,
    title: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  },
  render: function() {
    var self = this;

    var containerClass = cx({
      'Calendar-container': true
    });

    var days = this.renderDays();

    return (
      <div className='Container'>
        <div className={containerClass} ref='container'>
          <div className='Calendar' ref='content'>
            {days}
          </div>
        </div>
      </div>
    );
  },
  renderDays: function() {
    var self = this;

    return this.props.days.map(function(day) {
      return (
        <ADay key={day.date}
          chart={self.props.chart}
          data={self.props.data[self.props.type]}
          date={day.date}
          future={day.type === 'future'} />
      );
    });
  }
});

module.exports = CalendarContainer;