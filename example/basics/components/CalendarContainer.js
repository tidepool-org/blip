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

var ADay = React.createClass({
  propTypes: {
    dayAbbrevMask: React.PropTypes.string.isRequired,
    fullDateMask: React.PropTypes.string.isRequired,
    chart: React.PropTypes.func.isRequired,
    data: React.PropTypes.object,
    date: React.PropTypes.string.isRequired
  },
  getDefaultProps: function() {
    return {
      dayAbbrevMask: 'dd',
      fullDateMask: 'ddd, MMM D'
    };
  },
  render: function() {
    return (
      <div className='Calendar-day'>
        <p className='Calendar-weekday'>
          {moment(this.props.date).format(this.props.dayAbbrevMask)}
        </p>
        <this.props.chart data={this.props.data}
          date={this.props.date}
          hover={false} />
      </div>
    );
  }
});

var CalendarContainer = React.createClass({
  propTypes: {
    section: React.PropTypes.string.isRequired,
    component: React.PropTypes.string.isRequired,
    chart: React.PropTypes.func.isRequired,
    data: React.PropTypes.object.isRequired,
    days: React.PropTypes.array.isRequired,
    open: React.PropTypes.bool.isRequired,
    title: React.PropTypes.string.isRequired,
    type: React.PropTypes.string.isRequired
  },
  render: function() {
    var self = this;

    var iconClass = cx({
      'icon-down': this.props.open,
      'icon-right': !this.props.open
    });
    var containerClass = cx({
      'Calendar-container': true,
      'Calendar-container--closed': !this.props.open
    });

    var days = this.renderDays();

    return (
      <div className='Container'>
        <h4>
          {this.props.title}
          <a href='' onClick={this.handleToggleComponent}>
            <i className={iconClass} />
          </a>
        </h4>
        <div className={containerClass} ref='container'>
          <div className='Calendar' ref='content'>
            {days}
          </div>
        </div>
      </div>
    );
  },
  renderDays: function(numWeeks) {
    var self = this;

    return _.map(self.props.days, function(day) {
      return (
        <ADay key={day}
          chart={self.props.chart}
          data={self.props.data[self.props.type]}
          date={day} />
      );
    });
  },
  handleToggleComponent: function(e) {
    debug('Clicked to toggle', this.props.component);
    if (e) {
      e.preventDefault();
    }
    basicsActions.toggleComponent(this.props.section, this.props.component);
  },
  setHeight: function() {
    var content = this.refs.content.getDOMNode();
    var container = this.refs.container.getDOMNode();
    container.style.height = content.offsetHeight + 'px';
  }
});

module.exports = CalendarContainer;