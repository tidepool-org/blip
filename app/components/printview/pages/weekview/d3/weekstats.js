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
var _ = require('lodash');
var datetime = require('./util/datetime');
const DAYS_IN_WEEK = 7;

var weekStats = {};

weekStats.create = function(el, state) {
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
      .attr('class', 'dividers');

  var cgmTimes = svg.append('g')
        .attr('class', 'cgm-times');

  var avgBgs = svg.append('g')
        .attr('class', 'avg-bgs')
        .attr('transform', 'translate(0, ' 
            + state.cgmTimeHeight + ')');

  this.update(el, state);
};

weekStats.update = function(el, state) {
  // Re-compute the scales, and render the data points
  var horizSpacing = this._getColumnWidth(el, state);
  var vertHeight = this._getTotalChartHeight(state);
  this._drawVerticalDividers(el, 
        horizSpacing, vertHeight);
  this._drawCgmTimes(el, state,
        horizSpacing, state.cgmTimeHeight);
  this._drawAvgBg(el, state,
        horizSpacing, state.avgBgHeight);
};

weekStats.destroy = function(el) {
  // Any clean-up would go here
};

weekStats._getTotalChartHeight = function(state) {
  return state.cgmTimeHeight + state.avgBgHeight 
          + state.totCarbsHeight + state.insulinHeight;
}

weekStats._getColumnWidth = function(el, state) {
  return (el.offsetWidth
      - state.margin.left - state.margin.right) / DAYS_IN_WEEK;
};

weekStats._drawVerticalDividers = function(el, horizSpacing, height) {
  var dividers = d3.select(el).select('.dividers');

  for (var i = 1; i < DAYS_IN_WEEK; i++) {
    var x = i * horizSpacing;
    dividers.append('line')
              .attr('x1', x)
              .attr('y1', 0)
              .attr('x2', x)
              .attr('y2', height)
              .attr('stroke-width', 1)
              .attr('stroke', '#000000')
              .attr('stroke-dasharray', '2,2');
  }
};

weekStats._drawCgmTimes = function(el, state, horizSpacing, height) {
  var cgmTimes = d3.select(el).select('.cgm-times');

  var barHeight = (height - 2) / 3;

  cgmTimes.selectAll('text').data(['% CGM', 'Time', '>180', '80-180', '<180'],
    function (d) {
      return d;
    })
      .enter().append('text')
        .attr('text-anchor', 'end')
        .attr('dy', function(d, i) {
          if (i < 2)
            return '';
          return '.35em';
        })
        .attr('x', -4)
        .attr('y', function(d, i) {
          if (i < 2)
            return -4 + 13 * (i - 1);
          return barHeight / 2 * (2 * (i - 1) - 1) + (i - 2);
        })
        .style('font-size', '13px')
        .style('font-weight', function(d, i) {
          if (i < 2) return '400';
          return '300';
        })
        .style('color', '#000000')
        .text(function(d) { return d; });

  var cbgData = state.cbgData,
      start = new Date(state.domain.x[0]),
      bgRanges = { low: 80, high: 180 },
      cgmTimesSizes = [];

  for (var i = 0; i < DAYS_IN_WEEK; i++) {
    var dayStart = new Date(start);
    dayStart.setDate(dayStart.getDate() + i);

    var dayCbgData = this._getCbgDataForDayStart(cbgData, dayStart);
    var rangeCounts = this._getCbgCountsForRanges(dayCbgData, bgRanges);

    var x = i * horizSpacing + 2,
        barWidthRatio = (horizSpacing - 4) / dayCbgData.length;


    var barSizes = [];
    for (var j = 0; j < rangeCounts.length; j++) {
      if (isFinite(barWidthRatio))
        barSizes.push({
          x: x,
          y: j * barHeight + j,
          width: rangeCounts[j] * barWidthRatio,
          height: barHeight,
          fill: '#000000'
        });
    }
    cgmTimesSizes.push(barSizes);
  }

  cgmTimes.selectAll('.cgm-time').data(cgmTimesSizes)
    .enter().append('g').attr('class', 'cgm-time')
      .selectAll('rect').data(function(d)
        {
          return d;
        })
          .enter().append('rect')
            .attr({
              x: function(d) {return d.x;},
              y: function(d) {return d.y;},
              width: function(d) {return d.width;},
              height: function(d) {return d.height;},
              fill: function(d) {return d.fill;}
            });
}

weekStats._drawAvgBg = function(el, state, horizSpacing, height) {
  var avgBgs = d3.select(el).select('.avg-bgs');

  avgBgs.selectAll('text').data(['Avg BG'],
    function (d) {
      return d;
    })
      .enter().append('text')
        .attr('text-anchor', 'end')
        .attr('dy', '.35em')
        .attr('x', -4)
        .attr('y', height / 2)
        .style('font-size', '13px')
        .style('font-weight', '400')
        .style('color', '#000000')
        .text(function(d) { return d; });

  var cbgData = state.cbgData,
      start = new Date(state.domain.x[0]),
      avgBgsValues = [];

  for (var i = 0; i < DAYS_IN_WEEK; i++) {
    var dayStart = new Date(start);
    dayStart.setDate(dayStart.getDate() + i);

    var dayCbgData = this._getCbgDataForDayStart(cbgData, dayStart);
    var avgCbgValue = this._getAverageBg(dayCbgData);
    if (!isNaN(avgCbgValue))
      avgBgsValues.push({
        valid: true,
        text: Math.round(avgCbgValue) + ' mg/dL',
        textX: (i + 0.5) * horizSpacing,
        lineX1: i * horizSpacing + 2,
        lineX2: (i + 1) * horizSpacing - 2,
        lineY: height - avgCbgValue / 400 * height,
        circleX: (i + 0.5) * horizSpacing,
        circleY: height - avgCbgValue / 400 * height
      });
    else
      avgBgsValues.push({
        valid: false,
        text: 'No CBG Data',
        textX: (i + 0.5) * horizSpacing
      });      
  }

  var avgBg = avgBgs.selectAll('.avg-bg').data(avgBgsValues)
                .enter().append('g').attr('class', 'avg-bg');

  avgBg.append('text')
      .attr({
              'x': function(d) {return d.textX;},
              'y': height - 18,
              'text-anchor': 'middle',
              'font-size': '15px',
              'font-weight': '300',
              'color': '#000000'
            })
      .text(function(d) {return d.text;});

  var avgBgArt = avgBg.append('g').attr('class', 'avg-bg-art')
                  .filter(function(d) { return d.valid });

  avgBgArt.append('line')
            .attr({
                  'x1': function(d) {return d.lineX1;},
                  'x2': function(d) {return d.lineX2;},
                  'y1': function(d) {return d.lineY;},
                  'y2': function(d) {return d.lineY;},
                  'stroke-width': 1,
                  'stroke': '#B2B2B2'
                });

  avgBgArt.append('circle')
            .attr({
                  'cx': function(d) {return d.circleX;},
                  'cy': function(d) {return d.circleY;},
                  'r': 5,
                  'fill': '#000000'
                });
}

weekStats._getCbgDataForDayStart = function(cbgData, dayStart) {
    var dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    var startTime = dayStart.getTime();
    var endTime = dayEnd.getTime();

    return _.filter(cbgData, function(d) {
      var date = new Date(d.time).getTime();
      return date >= startTime
              && date < endTime;
    });
};

weekStats._getCbgCountsForRanges = function(cbgData, bgRanges) {
  return [
    _.filter(cbgData, function(d) {
      return d.value > bgRanges.high;
    }).length,

    _.filter(cbgData, function(d) {
      return d.value >= bgRanges.low && d.value <= bgRanges.high;
    }).length,

    _.filter(cbgData, function(d) {
      return d.value < bgRanges.low;
    }).length
  ];
};

weekStats._getAverageBg = function(cbgData) {
  var sum    = 0;
  for (var i = 0; i < cbgData.length; ++i) {
    sum += cbgData[i].value;
  }
  return sum/cbgData.length;
}

module.exports = weekStats;