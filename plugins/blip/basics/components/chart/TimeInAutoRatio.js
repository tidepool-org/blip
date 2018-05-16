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
var cx = require('classnames');
var d3 = require('d3');
var React = require('react');

var UnknownStatistic = require('../misc/UnknownStatistic');

var TimeInAutoRatio = React.createClass({
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
    var ratioData = _.get(this.props.data, 'timeInAutoRatio', null);
    if (ratioData === null) {
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
      {type: 'manual', value: ratioData.manual, order: 2},
      {type: 'automated', value: ratioData.automated, order: 1}
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
            return 'd3-arc-manual';
          }
          else {
            return 'd3-arc-automated';
          }
        }
      });
  },
  render: function() {
    var data = this.props.data;
    var percent = d3.format('%');
    var manual = _.get(data, ['timeInAutoRatio', 'manual'], null);
    var automated = _.get(data, ['timeInAutoRatio', 'automated'], null);

    var manualPercentClasses = cx({
      'TimeInAutoRatio-percent': true,
      'TimeInAutoRatio-percent--manual': manual,
      'TimeInAutoRatio--nodata': !manual
    });
    var manualLabelClasses = cx({
      'TimeInAutoRatio-label': true,
      'TimeInAutoRatio-label--manual': manual,
      'TimeInAutoRatio--nodata': !manual
    });
    var automatedPercentClasses = cx({
      'TimeInAutoRatio-percent': true,
      'TimeInAutoRatio-percent--automated': automated,
      'TimeInAutoRatio--nodata': !automated
    });
    var automatedLabelClasses = cx({
      'TimeInAutoRatio-label': true,
      'TimeInAutoRatio-label--automated': automated,
      'TimeInAutoRatio--nodata': !automated
    });

    return (
      <div className='TimeInAutoRatio'>
        <div className='TimeInAutoRatio-manual'>
            <p className={manualLabelClasses}>
              {this.props.labels.manual}
            </p>
            <p className={manualPercentClasses}>
              {manual ? percent(manual) : '-- %'}
            </p>
        </div>
        <div ref="pie" className='TimeInAutoRatio-pie'>
        </div>
        <div className='TimeInAutoRatio-automated'>
          <p className={automatedLabelClasses}>
            {this.props.labels.automated}
          </p>
          <p className={automatedPercentClasses}>
            {automated ? percent(automated) : '-- %'}
          </p>
        </div>
        {(manual && automated) ? null : (<UnknownStatistic />)}
      </div>
    );
  }
});

module.exports = TimeInAutoRatio;
