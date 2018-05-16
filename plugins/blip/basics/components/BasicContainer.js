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
var React = require('react');

var BasicContainer = React.createClass({
  propTypes: {
    bgClasses: React.PropTypes.object.isRequired,
    bgUnits: React.PropTypes.string.isRequired,
    chart: React.PropTypes.func.isRequired,
    data: React.PropTypes.object.isRequired,
    labels: React.PropTypes.object.isRequired,
    title: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.func ]).isRequired
  },
  render: function() {
    return (
      <div className='BasicContainer'>
        {this.props.chart({
          bgClasses: this.props.bgClasses,
          bgUnits: this.props.bgUnits,
          data: this.props.data,
          labels: this.props.labels,
        })}
      </div>
    );
  }
});

module.exports = BasicContainer;
