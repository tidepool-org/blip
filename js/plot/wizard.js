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
var log = require('../lib/').bows('Wizard');

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
  var tideline = window.tideline;
  var mainGroup = pool.parent();

  return function(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {
      var wizards = d3.select(this)
        .selectAll('g.d3-wizard-group')
        .data(currentData, function(d) {
          return d.id;
        });

      var wizardGroups = wizards.enter()
        .append('g')
        .attr({
          'clip-path': 'url(#mainClipPath)',
          class: 'd3-wizard-group',
          id: function(d) {
            return 'wizard_group_' + d.id;
          }
        });

      //Sort by size so smaller boluses are drawn last.
      wizardGroups = wizardGroups.sort(function(a,b){
        return d3.descending(a.bolus ? a.bolus.value : 0, b.bolus ? b.bolus.value : 0);
      });

      var carbs = wizardGroups.filter(function(d) {
        if (d.carbs) {
          return d;
        }
      });

      drawBolus.carb(carbs);

      var boluses = wizardGroups.filter(function(d) {
        if (d.bolus) {
          return d;
        }
      });

      drawBolus.bolus(boluses);

      // boluses where recommended > delivered
      var underride = boluses.filter(function(d) {
        if (d.bolus.recommended > d.bolus.value) {
          return d;
        }
      });

      drawBolus.underride(underride);

      // boluses where delivered > recommended
      var override = boluses.filter(function(d) {
        if (d.bolus.value > d.bolus.recommended) {
          return d;
        }
      });

      drawBolus.override(override);

      var extended = boluses.filter(function(d) {
        if (d.bolus.extended == true) {
          return d;
        }
      });

      drawBolus.extended(extended);

      wizards.exit().remove();

      var highlight = pool.highlight('.d3-wizard-group, .d3-bolus-group', opts);

      // tooltips
      selection.selectAll('.d3-wizard-group').on('mouseover', function(d) {
        if (d.bolus) {
          drawBolus.tooltip.add(d);
        }

        highlight.on(d3.select(this));
      });
      selection.selectAll('.d3-wizard-group').on('mouseout', function(d) {
        if (d.bolus) {
          drawBolus.tooltip.remove(d);
        }

        highlight.off();
      });
    });
  };
};
