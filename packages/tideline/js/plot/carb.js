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

module.exports = function(pool, opts) {
  var defaults = {
    r: 14,
    carbPadding: 4
  };

  _.defaults(opts, defaults);

  var xPos = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  function carb(selection) {
    var yPos = opts.r + opts.carbPadding;
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      var filteredData = _.filter(currentData, (data) => {
        return _.get(data, 'nutrition.carbohydrate.net', false);
      });
      var allCarbs = d3
        .select(this)
        .selectAll('circle.d3-carbs-only')
        .data(filteredData, function(d) {
          return d.id;
        });
      var carbGroup = allCarbs.enter()
        .append('g')
        .attr({
          'class': 'd3-carb-group',
          id: function(d) {
            return 'carb_group_' + d.id;
          }
        });

      carbGroup.append('circle').attr({
        cx: xPos,
        cy: yPos,
        r: function(d) {
          return opts.r;
        },
        'stroke-width': 0,
        class: 'd3-circle-rescuecarbs',
        id: function(d) {
          return 'carbs_' + d.id;
        }
      });

      carbGroup
        .append('text')
        .text(function(d) {
          return d.nutrition.carbohydrate.net;
        })
        .attr({
          x: xPos,
          y: yPos,
          class: 'd3-carbs-text'
        });

      allCarbs.exit().remove();

      // tooltips
      selection.selectAll('.d3-carb-group').on('mouseover', function() {        
        var parentContainer = document
          .getElementsByClassName('patient-data')[0]
          .getBoundingClientRect();
        var container = this.getBoundingClientRect();
        container.y = container.top - parentContainer.top;

        carb.addTooltip(d3.select(this).datum(), container);
      });

      selection.selectAll('.d3-carb-group').on('mouseout', function() {
        if (_.get(opts, 'onCarbOut', false)) {
          opts.onCarbOut();
        }
      });
    });
  }

  carb.addTooltip = function(d, rect) {
    if (_.get(opts, 'onCarbHover', false)) {
      opts.onCarbHover({
        data: d,
        rect: rect
      });
    }
  };

  return carb;
};
