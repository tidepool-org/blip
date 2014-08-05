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

var Duration = require('duration-js');
var format = require('../data/util/format');
var log = require('bows')('Bolus');

var drawbolus = require('./util/drawbolus');

module.exports = function(pool, opts) {
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

  var drawBolus = drawbolus(pool, opts);
  var mainGroup = pool.parent();

  function bolus(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      // filter out boluses with wizard (assumption that boluses with joinKey are wizard)
      currentData = _.filter(currentData, function(d) { if(!d.joinKey) { return d; }});

      drawBolus.annotations(_.filter(currentData, function(d) { return d.annotations; }));

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

      //Sort by size so smaller boluses are drawn last.
      bolusGroups = bolusGroups.sort(function(a,b){
        return d3.descending(a.value, b.value);
      });

      drawBolus.bolus(bolusGroups);

      var extended = boluses.filter(function(d) {
        if (d.extended == true) {
          return d;
        }
      });

      drawBolus.extended(extended);

      boluses.exit().remove();

      var highlight = pool.highlight('.d3-wizard-group, .d3-bolus-group', opts);

      // tooltips
      selection.selectAll('.d3-bolus-group').on('mouseover', function(d) {
        highlight.on(d3.select(this));
        drawBolus.tooltip.add(d);
      });
      selection.selectAll('.d3-bolus-group').on('mouseout', function(d) {
        highlight.off();
        drawBolus.tooltip.remove(d);
      });
    });
  }


  return bolus;
};
