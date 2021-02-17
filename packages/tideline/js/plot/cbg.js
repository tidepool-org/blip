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

/* jshint esversion:6 */

var d3 = require('d3');
var _ = require('lodash');

const utils = require('./util/utils');
var categorizer = require('../../js/data/util/categorize');
var { MGDL_UNITS, DEFAULT_BG_BOUNDS } = require('../../js/data/util/constants');

module.exports = function(pool, opts) {

  opts = opts || {};

  var defaults = {
    bgUnits: MGDL_UNITS,
    classes: {
      low: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetLower },
      target: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetUpper },
      high: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryHigh },
    },
    radius: 2.5,
  };

  var classes = opts.classes;
  classes = _.omit(classes, ['very-low', 'very-high']);
  opts.classes = classes;
  _.defaults(opts, defaults);

  var categorize = categorizer(opts.classes, opts.bgUnits);
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
      var cbgVeryLow = cbgGroups.filter(function(d) {
        if (categorize(d) === "verylow") {
          return d;
        }
      });
      var cbgLow = cbgGroups.filter(function(d) {
        if (categorize(d) === "low") {
          return d;
        }
      });
      var cbgTarget = cbgGroups.filter(function(d) {
        if (categorize(d) === "target") {
          return d;
        }
      });
      var cbgHigh = cbgGroups.filter(function(d) {
        if (categorize(d) === "high") {
          return d;
        }
      });
      var cbgVeryHigh = cbgGroups.filter(function(d) {
        if (categorize(d) === "veryhigh") {
          return d;
        }
      });
      cbgVeryLow.classed({'d3-circle-cbg': true, 'd3-bg-very-low': true});
      cbgLow.classed({'d3-circle-cbg': true, 'd3-bg-low': true});
      cbgTarget.classed({'d3-circle-cbg': true, 'd3-bg-target': true});
      cbgHigh.classed({'d3-circle-cbg': true, 'd3-bg-high': true});
      cbgVeryHigh.classed({'d3-circle-cbg': true, 'd3-bg-very-high': true});
      allCBG.exit().remove();

      var highlight = pool.highlight(allCBG);

      // tooltips
      selection.selectAll('.d3-circle-cbg').on('mouseover', function () {
        var d3Select = d3.select(this);
        highlight.on(d3Select);
        d3Select.attr({ r: opts.radius + 1 });
        switch (categorize(d3Select.datum())) {
          case 'low':
          case 'verylow':
            d3Select.classed({ 'd3-bg-low-focus': true });
            break;
          case 'target':
            d3Select.classed({ 'd3-bg-target-focus': true });
            break;
          case 'high':
          case 'veryhigh':
            d3Select.classed({ 'd3-bg-high-focus': true });
            break;
          default:
            break;
        }
        cbg.addTooltip(d3.select(this).datum(), utils.getTooltipContainer(this));
      });
      selection.selectAll('.d3-circle-cbg').on('mouseout', function () {
        highlight.off();
        d3.select(this).attr({ r: opts.radius });
        d3.select(this).classed({
          'd3-bg-low-focus': false,
          'd3-bg-target-focus': false,
          'd3-bg-high-focus': false
        });
        if (_.get(opts, 'onCBGOut', false)) {
          opts.onCBGOut();
        }
      });
    });
  }

  cbg.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  cbg.yPosition = function(d) {
    return opts.yScale(d.value);
  };

  cbg.addTooltip = function(d, rect) {
    if (_.get(opts, 'onCBGHover', false)) {
      opts.onCBGHover({
        data: d,
        rect: rect,
        class: categorizer(opts.classes, opts.bgUnits)(d)
      });
    }
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
