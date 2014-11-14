/** @jsx React.DOM */
/**
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
 */

var React = require('react');
var _ = require('lodash');

var DATE_FORMAT = 'YYYY-MM-DD';
var MONTHS = [
  {value: '', label: 'Month'},
  {value: '0', label: 'January'},
  {value: '1', label: 'February'},
  {value: '2', label: 'March'},
  {value: '3', label: 'April'},
  {value: '4', label: 'May'},
  {value: '5', label: 'June'},
  {value: '6', label: 'July'},
  {value: '7', label: 'August'},
  {value: '8', label: 'September'},
  {value: '9', label: 'October'},
  {value: '10', label: 'November'},
  {value: '11', label: 'December'}
];

var DatePicker = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    value: React.PropTypes.object,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      value: this.props.value || {}
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      value: nextProps.value || {}
    });
  },

  render: function() {
    return (
      <div className="DatePicker">
        {this.renderMonth()}
        {this.renderDay()}
        {this.renderYear()}
      </div>
    );
  },

  renderMonth: function() {
    var options = _.map(MONTHS, function(item) {
      return <option key={item.value} value={item.value}>{item.label}</option>;
    });
    return (
      <select
        className="DatePicker-control DatePicker-control--month"
        name="month"
        value={this.state.value.month}
        disabled={this.props.disabled}
        onChange={this.handleChange}>
        {options}
      </select>
    );
  },

  renderDay: function() {
    return <input
      className="DatePicker-control DatePicker-control--day"
      name="day"
      value={this.state.value.day}
      placeholder="Day"
      disabled={this.props.disabled}
      onChange={this.handleChange} />;
  },

  renderYear: function() {
    return <input
      className="DatePicker-control DatePicker-control--year"
      name="year"
      value={this.state.value.year}
      placeholder="Year"
      disabled={this.props.disabled}
      onChange={this.handleChange} />;
  },

  handleChange: function(e) {
    var target = e.target;
    var value = this.state.value;
    value[target.name] = target.value;

    if (this.props.onChange) {
      this.props.onChange({
        name: this.props.name,
        value: value
      });
    }
  }
});

module.exports = DatePicker;
