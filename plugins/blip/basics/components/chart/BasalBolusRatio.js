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
var d3 = require('d3');
var React = require('react');

var BasalBolusRatio = React.createClass({
  propTypes: {
    data: React.PropTypes.object.isRequired
  },
  componentDidMount: function() {
    var ratioData = this.props.data.basalBolusRatio;
    var el = this.refs.pie;
    var w = el.offsetWidth, h = el.offsetHeight;
    var svg = d3.select(el)
      .append('svg')
      .attr({
        width: w,
        height: h
      });
    var data = [
      {type: 'basal', value: ratioData.basal, order: 2},
      {type: 'bolus', value: ratioData.bolus, order: 1}
    ];
    var pieRadius = Math.min(w, h)/2;
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
    return (
      <div className='BasalBolusRatio'>
        <div ref="pie" className='BasalBolusRatio-inner BasalBolusRatio-pie'>
        </div>
        <div className='BasalBolusRatio-inner'>
          <p>
            <span className='BasalBolusRatio-percent BasalBolusRatio-percent--basal'>
              {percent(data.basalBolusRatio.basal)}
            </span>
            <span className='BasalBolusRatio-label BasalBolusRatio-label--basal'>
            &nbsp;basal
            </span>
            <span className='BasalBolusRatio-percent BasalBolusRatio-percent--bolus'>
              {' : ' + percent(data.basalBolusRatio.bolus)}
            </span>
            <span className='BasalBolusRatio-label BasalBolusRatio-label--bolus'>
            &nbsp;bolus
            </span>
          </p>
        </div>
      </div>
    );
  }
});

module.exports = BasalBolusRatio;