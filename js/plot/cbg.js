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

var d3 = require('d3');
var _ = require('lodash');

var log = require('bows')('CBG');
var bgBoundaryClass = require('./util/bgboundary');

module.exports = function(pool, opts) {

  opts = opts || {};

  var defaults = {
    bgUnits: 'mg/dL',
    classes: {
      low: {boundary: 80},
      target: {boundary: 180},
      high: {boundary: 200}
    },
    radius: 2.5,
  };

  var classes = opts.classes;
  classes = _.omit(classes, ['very-low', 'very-high']);
  opts.classes = classes;
  _.defaults(opts, defaults);

  var mainGroup = pool.parent();

  function cbg(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {

      cbg.addAnnotations(_.filter(currentData, function(d) { return d.annotations; }));

      var allCBG = d3.select(this).selectAll('circle.d3-cbg')
        .data(currentData, function(d) {
          return d.id;
        });
      var cbgGroups = allCBG.enter()
        .append('circle')
        .attr('class', 'd3-cbg')
        .attr({
          cx: cbg.xPosition,
          cy: cbg.yPosition,
          r: opts.radius,
          id: function(d) {
            return 'cbg_' + d.id;
          }
        });
      var cbgLow = cbgGroups.filter(function(d) {
        if (d.value < opts.classes.low.boundary) {
          return d;
        }
      });
      var cbgTarget = cbgGroups.filter(function(d) {
        if ((d.value >= opts.classes.low.boundary) && (d.value <= opts.classes.target.boundary)) {
          return d;
        }
      });
      var cbgHigh = cbgGroups.filter(function(d) {
        if (d.value > opts.classes.target.boundary) {
          return d;
        }
      });
      cbgLow.classed({'d3-circle-cbg': true, 'd3-bg-low': true});
      cbgTarget.classed({'d3-circle-cbg': true, 'd3-bg-target': true});
      cbgHigh.classed({'d3-circle-cbg': true, 'd3-bg-high': true});
      allCBG.exit().remove();

      // tooltips
      selection.selectAll('.d3-circle-cbg').on('mouseover', function() {
        cbg.addTooltip(d3.select(this).datum());
      });
      selection.selectAll('.d3-circle-cbg').on('mouseout', function() {
        var id = d3.select(this).attr('id').replace('cbg_', 'tooltip_');
        mainGroup.select('#' + id).remove();
      });
    });
  }

  cbg.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  cbg.yPosition = function(d) {
    return opts.yScale(d.value);
  };

  cbg.orientation = function(cssClass) {
    if (cssClass === 'd3-bg-high') {
      return 'leftAndDown';
    }
    else {
      return 'normal';
    }
  };

  cbg.addTooltip = function(d) {
    var tooltips = pool.tooltips();
    var getBgBoundaryClass = bgBoundaryClass(opts.classes);
    var cssClass = getBgBoundaryClass(d);
    tooltips.addFixedTooltip({
      cssClass: cssClass,
      datum: d,
      orientation: {
        'default': cbg.orientation(cssClass),
        leftEdge: cbg.orientation(cssClass) === 'leftAndDown' ? 'rightAndDown': 'normal',
        rightEdge: cbg.orientation(cssClass) === 'normal' ? 'leftAndUp': 'leftAndDown'
      },
      shape: 'cbg',
      xPosition: cbg.xPosition,
      yPosition: cbg.yPosition
    });
  };

  cbg.addAnnotations = function(data) {
    for (var i = 0; i < data.length; ++i) {
      var d = data[i];
      var annotationOpts = {
        x: cbg.xPosition(d),
        y: opts.yScale(d.value),
        xMultiplier: 0,
        yMultiplier: 2,
        orientation: {
          down: true
        },
        d: d
      };
      if (mainGroup.select('#annotation_for_' + d.id)[0][0] == null) {
        mainGroup.select('#tidelineAnnotations_cbg')
          .call(pool.annotations(), annotationOpts);
      }
    }
  };

  return cbg;
};