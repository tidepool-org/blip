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

var _ = require('lodash');
var cx = require('classnames');
var d3 = require('d3');
var React = require('react');

var DailyCarbs = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  componentDidMount: function() {
    var el = this.refs.pie;
    var w = el.offsetWidth, h = el.offsetHeight;
    var svg = d3.select(el)
      .append('svg')
      .attr({
        width: w,
        height: h
      });
    var pieRadius = Math.min(w, h)/2;
    var averageDailyCarbs = _.get(this.props.data, 'averageDailyCarbs', null);
    if (averageDailyCarbs === null) {
      svg.append('circle')
        .attr({
          'class': 'd3-circle-nodata',
          cx: w/2,
          cy: h/2,
          // subtract half of the stroke-width from the radius to avoid cut-off
          r: pieRadius - 1.5,
        });
      return;
    }
    var data = [
      {type: 'carbs', value: averageDailyCarbs, order: 1}
    ];
    var pie = d3.layout.pie()
      .value(function(d) { return d.value; })
      .sort(function(d) { return d.order; });
    svg.append('g')
      .attr('transform', 'translate(' + (w/2) + ',' + (h/2) + ')')
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr({
        d: d3.svg.arc().outerRadius(pieRadius),
        class: function(d, i) {
          if (i === 0) {
            return 'd3-arc-basal';
          }
          else {
            return 'd3-arc-bolus';
          }
        }
      });
  },
  render: function() {
    var data = this.props.data;
    var decimal = d3.format('.1f');
    var averageDailyCarbs = _.get(data, ['averageDailyDose', 'basal'], null);
    return (
      <div className='BasalBolusRatio'>
        <div className='BasalBolusRatio-basal'>
            <p className='BasalBolusRatio-label BasalBolusRatio-label--basal'>
              Avg Daily Carbs
            </p>
            <p className='BasalBolusRatio-units BasalBolusRatio-units--bolus'>
              {decimal(averageDailyCarbs)} g
            </p>
        </div>
        <div ref="pie" className='BasalBolusRatio-pie'>
        </div>
      </div>
    );
  }
});

module.exports = DailyCarbs;