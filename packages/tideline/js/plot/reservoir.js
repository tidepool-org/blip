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

  var picto = require('../../img/sitechange-diabeloop.png');
  var height = pool.height();
  var offset = height / 5 ;
  var width = 40;
  var xPos = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - (width / 2) ;
  };

  function reservoir(selection) {
    var yPos = opts.r + opts.carbPadding;
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      // console.log("reservoir");
      var filteredData = _.filter(currentData, {
          subType: 'reservoirChange'
        });
      // console.log(filteredData);
      var allReservoirs = d3
        .select(this)
        .selectAll('circle.d3-reservoir-only')
        .data(filteredData, function(d) {
          return d.id;
        });
      var reservoirGroup = allReservoirs.enter()
        .append('g')
        .attr({
          'class': 'd3-reservoir-group',
          id: function(d) {
            return 'reservoir_group_' + d.id;
          }
        });
        
      reservoirGroup.append('image')
        .attr({
          x: function(d) {
            return xPos(d);
          },
          y: function(d) {
            return 0;
          },
          width: width, 
          height: function() {
            return offset;
          },
          'xlink:href': picto,
        });

      allReservoirs.exit().remove();

      // tooltips
      selection.selectAll('.d3-reservoir-group').on('mouseover', function() {        
        var parentContainer = document
          .getElementsByClassName('patient-data')[0]
          .getBoundingClientRect();
        var container = this.getBoundingClientRect();
        container.y = container.top - parentContainer.top;

        reservoir.addTooltip(d3.select(this).datum(), container);
      });

      selection.selectAll('.d3-reservoir-group').on('mouseout', function() {
        if (_.get(opts, 'onReservoirOut', false)) {
          opts.onReservoirOut();
        }
      });
    });
  }

  reservoir.addTooltip = function(d, rect) {
    if (_.get(opts, 'onReservoirHover', false)) {
      opts.onReservoirHover({
        data: d,
        rect: rect
      });
    }
  };

  return reservoir;
};
