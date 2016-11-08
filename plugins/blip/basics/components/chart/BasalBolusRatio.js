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

var BasalBolusRatio = React.createClass({
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
    var ratioData = _.get(this.props.data, 'basalBolusRatio', null);
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
      {type: 'basal', value: ratioData.basal, order: 2},
      {type: 'bolus', value: ratioData.bolus, order: 1}
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
    var percent = d3.format('%');
    var decimal = d3.format('.1f');
    var basal = _.get(data, ['basalBolusRatio', 'basal'], null);
    var basalAverageDaily = _.get(data, ['basalBolusRatio', 'basalAverageDaily'], null);
    var bolus = _.get(data, ['basalBolusRatio', 'bolus'], null);
    var bolusAverageDaily = _.get(data, ['basalBolusRatio', 'bolusAverageDaily'], null);
    var basalPercentClasses = cx({
      'BasalBolusRatio-percent': true,
      'BasalBolusRatio-percent--basal': !!basal,
      'BasalBolusRatio--nodata': !basal
    });
    var basalLabelClasses = cx({
      'BasalBolusRatio-label': true,
      'BasalBolusRatio-label--basal': !!basal,
      'BasalBolusRatio--nodata': !basal
    });
    var bolusPercentClasses = cx({
      'BasalBolusRatio-percent': true,
      'BasalBolusRatio-percent--bolus': !!bolus,
      'BasalBolusRatio--nodata': !bolus
    });
    var bolusLabelClasses = cx({
      'BasalBolusRatio-label': true,
      'BasalBolusRatio-label--bolus': !!bolus,
      'BasalBolusRatio--nodata': !bolus
    });
    return (
      <div className='BasalBolusRatio'>
        <div className='BasalBolusRatio-inner BasalBolusRatio-text BasalBolusRatio-left'>
          <p>basal</p>
          <p>{basal ? percent(basal) : '-- %'}</p>
          <p>{basal ? decimal(basalAverageDaily) : '--'}</p>
        </div>
        <div ref="pie" className='BasalBolusRatio-inner BasalBolusRatio-pie'>
        </div>
        <div className='BasalBolusRatio-inner BasalBolusRatio-text BasalBolusRatio-right'>
          <p>bolus</p>
          <p>{' : ' + (basal ? percent(bolus) : '-- %')}</p>
          <p>{' : ' + (basal ? decimal(bolusAverageDaily) : '--')}</p>
        </div>
        {(basal && bolus) ? null : (<UnknownStatistic />)}
      </div>
    );
  }
});

module.exports = BasalBolusRatio;