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
var datetime = require('./util/datetime')
var weekChart = {};

weekChart.create = function(el, state) {
  var totalHeight = this._getTotalChartHeight(state)
                    + state.margin.top + state.margin.bottom;

  var svg = d3.select(el).append('svg')
      .attr('class', 'd3')
      .attr('width', state.width)
      .attr('height', totalHeight)
      .append('g')
        .attr('transform', 'translate(' 
            + state.margin.left + ', ' 
            + state.margin.top + ')');

  svg.append('g')
      .attr('class', 'y axis');

  svg.append('g')
      .attr('class', 'x axis major');

  svg.append('g')
      .attr('class', 'x axis minor');

  svg.append('g')
      .attr('class', 'cbg-points');

  svg.append('path')
      .attr('class', 'cbg-line');

  svg.append('g')
      .attr('class', 'smbg-points');

  this.update(el, state);
};

weekChart.update = function(el, state) {
  // Re-compute the scales, and render the data points
  var scales = this._bgScales(el, state);
  this._drawAxes(el, scales, state);
  // this._drawCbgPoints(el, scales, state.cbgData);
  this._drawCbgLine(el, scales, state.cbgData);
  this._drawSmbgPoints(el, scales, state.smbgData);
};

weekChart.destroy = function(el) {
  // Any clean-up would go here
};

weekChart._getTotalChartHeight = function(state) {
  return state.bgHeight + state.bolusHeight + state.basalHeight;
}

weekChart._getTotalChartWidth = function(el, state) {
  return el.offsetWidth - (state.margin.left + state.margin.right);
}

weekChart._drawAxes = function(el, scales, state) {
  this._drawYAxis(el, scales, this._getTotalChartWidth(el, state));
  this._drawXAxisMinor(el, scales, this._getTotalChartHeight(state));
  this._drawXAxisMajor(el, scales);
};

weekChart._drawYAxis = function(el, scales, width) {
  var gy = d3.select(el).selectAll('.axis')
                        .filter('.y');

  var yAxis = d3.svg.axis()
              .scale(scales.y)
              .orient('left')
              .tickValues([50, 80, 180, 300])
              .tickFormat(d3.format('d'))
              .tickSize(-width)
              .tickPadding(8);

  gy.call(yAxis);

  gy.selectAll('.tick')
      .select('text')
      .style('font-size', '15px')
      .style('font-weight', '300');  

  gy.selectAll('line')
      .style('stroke-dasharray', '2,2');

  gy.selectAll('text').data(['BG & CGM', 'mg/dL'], function(d) {
    return d;
  })
      .enter().append('text')
        .attr('text-anchor', 'end')
        .attr('dy', '.71em')
        .attr('x', -4)
        .attr('y', function(d, i) {
          return 4 + 13 * i;
        })
        .style('font-size', '13px')
        .style('font-weight', function(d, i) {
          if (i === 0) return '400';
          return '300';
        })
        .style('color', '#000000')
        .text(function(d) { return d; });    
};

weekChart._drawXAxisMajor = function(el, scales) {
  var gxmajor = d3.select(el).selectAll('.axis')
                        .filter('.x')
                        .filter('.major');

  var xAxisMajor = d3.svg.axis()
                .scale(scales.x)
                .orient('top')
                .ticks(d3.time.days, 1)
                .tickFormat(function(d, i) {
                  if (i === 7) return '';
                  return datetime.formatDateLabel(d);
                })
                .tickSize(0)
                .tickPadding(28);

  gxmajor.call(xAxisMajor);

  gxmajor.selectAll('text')
      .style('text-anchor', 'start')
      .style('font-size', '13px')
      .style('font-weight', '400');
};

weekChart._drawXAxisMinor = function(el, scales, height) {
  const MAJOR_TICKS = 8;

  var gxminor = d3.select(el).selectAll('.axis')
                        .filter('.x')
                        .filter('.minor');
  
  var xAxisMinor = d3.svg.axis()
                .scale(scales.x)
                .orient('top')
                .ticks(d3.time.hours, 3)
                .tickFormat(function(d, i) {
                  if (i === 7 * MAJOR_TICKS) return '';
                  if (i % 2 === 0)
                    return datetime.formatHours(d);
                })
                .tickSize(-height)
                .tickPadding(8);

  gxminor.call(xAxisMinor);

  gxminor.selectAll('text')
      .style('text-anchor', 'start')
      .style('font-size', '15px')
      .style('font-weight', '300');

  gxminor.selectAll('line').filter(function(d, i) {
      if (i % MAJOR_TICKS !== 0) return d;
    })
    .style('stroke-dasharray', '2,2');;
};

weekChart._drawSmbgPoints = function(el, scales, data) {
  var g = d3.select(el).selectAll('.smbg-points');

  var point = g.selectAll('.smbg-point')
    .data(data, function(d) { return d.id; });

  // ENTER
  point.enter().append('circle')
      .attr('class', 'smbg-point');

  // ENTER & UPDATE
  point.attr('cx', function(d) { return scales.x(datetime.formatDate(d)); })
      .attr('cy', function(d) { return scales.y(d.value); })
      .attr('r', function(d) { return 5; });

  // EXIT
  point.exit()
      .remove();
};

weekChart._drawCbgPoints = function(el, scales, data) {
  var g = d3.select(el).selectAll('.cbg-points');

  var point = g.selectAll('.cbg-point')
    .data(data, function(d) { return d.id; });

  // ENTER
  point.enter().append('circle')
      .attr('class', 'cbg-point');

  // ENTER & UPDATE
  point.attr('cx', function(d) { return scales.x(datetime.formatDate(d)); })
      .attr('cy', function(d) { return scales.y(d.value); })
      .attr('r', function(d) { return 1; });

  // EXIT
  point.exit()
      .remove();
};

weekChart._drawCbgLine = function(el, scales, data) {
  var path = d3.select(el).selectAll('.cbg-line');

  var line = d3.svg.line()
      .interpolate('basis')
      .x(function(d) {return scales.x(datetime.formatDate(d));})
      .y(function(d) {return scales.y(d.value);});

  path
      .attr('d', line(data))
      .attr('stroke', '#000000')
      .attr('stroke-width', '1')
      .attr('fill', 'none');
};

weekChart._bgScales = function(el, state) {
  var domain = state.domain;
  if (!domain) {
    return null;
  }

  var width = el.offsetWidth
    - (state.margin.left + state.margin.right);
  var height = state.bgHeight;

  var x = d3.time.scale()
    .range([0, width])
    .domain(domain.x)
    .nice();

  var y = d3.scale.linear()
    .range([height, 0])
    .domain(domain.y);

  return {x: x, y: y};
};

module.exports = weekChart;