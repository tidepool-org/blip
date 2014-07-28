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

var d3 = require('../lib/').d3;
var _ = require('../lib/')._;

var Duration = require('../lib/').Duration;
var format = require('../data/util/format');
var log = require('../lib/').bows('Bolus');

var DrawBolus = require('./util/drawbolus');

module.exports = function(pool, opts) {

  var QUARTER = ' ¼', HALF = ' ½', THREE_QUARTER = ' ¾', THIRD = ' ⅓', TWO_THIRDS = ' ⅔';
  var MS_IN_ONE = 60000;

  opts = opts || {};

  var defaults = {
    classes: {
      'unspecial': {'tooltip': 'tooltip_bolus_small.svg', 'width': 70, 'height': 24},
      'two-line': {'tooltip': 'tooltip_bolus_large.svg', 'width': 98, 'height': 39},
      'three-line': {'tooltip': 'tooltip_bolus_extralarge.svg', 'width': 98, 'height': 58}
    },
    width: 12
  };

  _.defaults(opts, defaults);

  var drawBolus = DrawBolus(opts);
  var mainGroup = pool.parent();

  function bolus(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      bolus.addAnnotations(_.filter(currentData, function(d) { return d.annotations; }));

      var boluses = d3.select(this)
        .selectAll('g.d3-bolus-group')
        .data(currentData, function(d) {
          return d.id;
        });

      var bolusGroups = boluses.enter()
        .append('g')
        .attr({
          'clip-path': 'url(#mainClipPath)',
          'class': 'd3-bolus-group',
          id: function(d) { return 'bolus_group_' + d.id; }
        });

      var boluses = wizardGroups.filter(function(d) {
        if (d.bolus) {
          return d.bolus;
        }
      });

      drawBolus.bolus(bolusGroups);

      boluses.exit().remove();

      //figure out what to do with highlihgts for quick bolus

      var highlight = pool.highlight(boluses, opts);

      // tooltips
      selection.selectAll('.d3-bolus-group').on('mouseover', function(d) {
        highlight.on(d3.select(this));
        bolus.addTooltip(d, 'unspecial');
      });
      selection.selectAll('.d3-bolus-group').on('mouseout', function(d) {
        highlight.off();
        mainGroup.select('#tooltip_' + d.id).remove();
      });
    });
  }

  //tooltip
  function formatValue(x) {
    var formatted = d3.format('.3f')(x);
    // remove zero-padding on the right
    while (formatted[formatted.length - 1] === '0') {
      formatted = formatted.slice(0, formatted.length - 1);
    }
    if (formatted[formatted.length - 1] === '.') {
      formatted = formatted + '0';
    }
    return formatted;
  };

  bolus.addTooltip = function(datum, category) {
    var tooltipWidth = opts.classes[category].width;
    var tooltipHeight = opts.classes[category].height;

    mainGroup.select('#' + 'tidelineTooltips_bolus')
      .call(pool.tooltips(),
        datum,
        // tooltipXPos
        opts.xScale(Date.parse(datum.normalTime) + (opts.width/2)),
        'bolus',
        // timestamp
        true,
        opts.classes[category].tooltip,
        tooltipWidth,
        tooltipHeight,
        // imageX
        opts.xScale(Date.parse(datum.normalTime)),
        // imageY
        function() {
          return pool.height() - tooltipHeight;
        },
        // textX
        opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2 + opts.width/2,
        // textY
        function() {
          return pool.height() - tooltipHeight * (9/16);
        },
        // customText
        (function() {
          return formatValue(datum.value) + 'U';
        }()),
        // tspan
        (function() {
          if (datum.extended) {
            return ' total';
          }
        }())
      );
  };

  bolus.addAnnotations = function(data, selection) {
    _.each(data, function(d) {
      var annotationOpts = {
        'x': opts.xScale(Date.parse(d.normalTime)),
        'y': opts.yScale(d.value),
        'xMultiplier': -2,
        'yMultiplier': 1,
        'd': d,
        'orientation': {
          'up': true
        }
      };
      if (mainGroup.select('#annotation_for_' + d.id)[0][0] == null) {
        mainGroup.select('#tidelineAnnotations_bolus').call(pool.annotations(), annotationOpts);
      }
    });
  };

  return bolus;
};
