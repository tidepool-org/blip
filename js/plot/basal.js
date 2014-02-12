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

 var log = require('bows')('Basal');

module.exports = function(pool, opts) {

  var opts = opts || {};

  var defaults = {
    xScale: pool.xScale().copy()
  };

  _.defaults(opts, defaults);

  function basal(selection) {
    selection.each(function(currentData) {

      var line = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate('step-after');

      var actual = _.where(currentData, {'vizType': 'actual'});
      var undelivered = _.where(currentData, {'vizType': 'undelivered'});

      var rects = d3.select(this)
        .selectAll('rect')
        .data(actual, function(d) {
          // leveraging the timestamp of each datapoint as the ID for D3's binding
          return d.normalTime;
        });
      rects.enter()
        .append('rect')
        .attr({
          'width': function(d) {
            return basal.width(d);
          },
          'height': function(d) {
            return pool.height() - opts.yScale(d.value);
          },
          'x': function(d) {
            return opts.xScale(new Date(d.normalTime));
          },
          'y': function(d) {
            return opts.yScale(d.value);
          },
          'class': 'd3-basal d3-rect-basal'
        });
      rects.exit().remove();

      var pathGroup = d3.select('#d3-basal-paths');

      if (pathGroup[0].length !== 0) {
        pathGroup = d3.select(this).append('g').attr('id', 'd3-basal-paths');
      }

      var actualPoints = [];

      actual.forEach(function(d) {
        actualPoints.push({
          'x': opts.xScale(new Date(d.normalTime)),
          'y': opts.yScale(d.value),
        },
        {
          'x': opts.xScale(new Date(d.normalEnd)),
          'y': opts.yScale(d.value),
        });
      });

      log(pathGroup);

      pathGroup.append('path')
        .attr({
        'd': line(actualPoints),
        'class': 'd3-basal d3-path-basal'
      });

      if (undelivered.length !== 0) {
        log(undelivered);
        var undeliveredPairs = [];

        undelivered.forEach(function(d) {
          undeliveredPairs.push([{
            'x': opts.xScale(new Date(d.normalTime)),
            'y': opts.yScale(d.value)
          },
          {
            'x': opts.xScale(new Date(d.normalEnd)),
            'y': opts.yScale(d.value)
          }]);
        });

        undeliveredPairs.forEach(function(pair) {
          pathGroup.append('path')
            .attr({
              'd': line(pair),
              'class': 'd3-basal d3-path-basal d3-path-basal-undelivered'
            });
        });
      }
    });
  }

  basal.width = function(d) {
    return opts.xScale(new Date(d.normalEnd)) - opts.xScale(new Date(d.normalTime));
  };

  return basal; 
};