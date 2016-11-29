/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016 Tidepool Project
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

/* global d3 */

var _ = require('lodash');
var cx = require('classnames');
var d3 = require('d3');
var React = require('react');

var UnknownStatistic = require('../misc/UnknownStatistic');

var DailyCarbs = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  componentDidMount: function() {
    var el = this.refs.carbsCircle;
    var w = el.offsetWidth, h = el.offsetHeight;
    var svg = d3.select(el)
      .append('svg')
      .attr({
        width: w,
        height: h
      });

    var radius = Math.min(w, h)/2;
    var averageDailyCarbs = _.get(this.props.data, 'averageDailyCarbs', null);
    var circleClassName = 'd3-circle-data';
    if (averageDailyCarbs === null) {
      circleClassName = 'd3-circle-nodata';
    }

    var decimal = d3.format('.0f');

    svg.append('circle')
      .attr({
        'class': circleClassName,
        cx: w/2,
        cy: h/2,
        // subtract half of the stroke-width from the radius to avoid cut-off
        r: radius - 1.5,
      });

    svg.append('text')
      .text(decimal(averageDailyCarbs) + ' g')
      .attr({
        'class': 'd3-circle-amount',
        dx: w/2,
        dy: h/2,
        'text-anchor': 'middle',
      });

  },
  render: function() {
    var averageDailyCarbs = _.get(this.props.data, 'averageDailyCarbs', null);
    var headerClasses = cx({
      DailyCarbs: true,
      'SectionHeader--nodata': !averageDailyCarbs,
      'selectable': false,
    });
    return (
      <h3 className="DailyCarbs" className={headerClasses}>
        <span className="DailyCarbs-label">Avg daily carbs</span>
        <div ref="carbsCircle" className="DailyCarbs-circle">
        </div>
        {averageDailyCarbs ? null : (<UnknownStatistic />)}
      </h3>
    );
  }
});

module.exports = DailyCarbs;
