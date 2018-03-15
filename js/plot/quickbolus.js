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

var log = require('bows')('Bolus');

var commonbolus = require('./util/commonbolus');
var drawbolus = require('./util/drawbolus');
var format = require('../data/util/format');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {
    width: 12
  };

  _.defaults(opts, defaults);

  var drawBolus = drawbolus(pool, opts);
  var mainGroup = pool.parent();

  function bolus(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      // filter out boluses with wizard
      currentData = _.filter(currentData, function(d) { if(!d.wizard) { return d; }});

      drawBolus.annotations(_.filter(currentData, function(d) { return d.annotations; }));

      var boluses = d3.select(this)
        .selectAll('g.d3-bolus-group')
        .data(currentData, function(d) {
          return d.id;
        });

      var bolusGroups = boluses.enter()
        .append('g')
        .attr({
          'class': 'd3-bolus-group',
          id: function(d) { return 'bolus_group_' + d.id; }
        });

      // sort by size so smaller boluses are drawn last
      bolusGroups = bolusGroups.sort(function(a,b){
        return d3.descending(commonbolus.getMaxValue(a), commonbolus.getMaxValue(b));
      });

      drawBolus.bolus(bolusGroups.filter(function(d) {
        return commonbolus.getDelivered(d) || commonbolus.getProgrammed(d);
      }));

      var extended = boluses.filter(function(d) {
        return d.extended || d.expectedExtended;
      });

      drawBolus.extended(extended);

      // boluses where programmed differs from delivered
      var suspended = boluses.filter(function(d) {
        return commonbolus.getDelivered(d) !== commonbolus.getProgrammed(d);
      });

      drawBolus.suspended(suspended);

      var extendedSuspended = boluses.filter(function(d) {
        if (d.expectedExtended) {
          return d.extended !== d.expectedExtended;
        }
        return false;
      });

      drawBolus.extendedSuspended(extendedSuspended);

      boluses.exit().remove();

      var highlight = pool.highlight('.d3-wizard-group, .d3-bolus-group', opts);

      // tooltips
      selection.selectAll('.d3-bolus-group').on('mouseover', function(d) {
        highlight.on(d3.select(this));
        var parentContainer = document.getElementsByClassName('patient-data')[0].getBoundingClientRect();
        var container = this.getBoundingClientRect();
        container.y = container.top - parentContainer.top;

        drawBolus.tooltip.add(d, container);
      });
      selection.selectAll('.d3-bolus-group').on('mouseout', function(d) {
        highlight.off();
        drawBolus.tooltip.remove(d);
      });
    });
  }

  return bolus;
};
