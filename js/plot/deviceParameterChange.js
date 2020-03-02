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
    padding: 4
  };

  _.defaults(opts, defaults);

  var picto = require('../../img/parameter.png');
  var offset = pool.height() / 5 ;
  var width = 40;
  var xPos = function(d) {
    return opts.xScale(Date.parse(d.normalTime)) - (width / 2) ;
  };

  function parameter(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function() {
      var data = opts.data;
      var allParameters = d3
        .select(this)
        .selectAll('circle.d3-param-only')
        .data(data, function(d) {
          return d.id;
        });
      var parameterGroup = allParameters.enter()
        .append('g')
        .attr({
          'class': 'd3-param-group',
          id: function(d) {
            return 'param_group_' + d.id;
          }
        });

      parameterGroup.append('image')
        .attr({
          x: function(d) {
            return xPos(d);
          },
          y: function(d) {
            return 0;
          },
          width, 
          height: function() {
            return offset;
          },
          'xlink:href': picto,
        });


      allParameters.exit().remove();

      // tooltips
      selection.selectAll('.d3-param-group').on('mouseover', function() {
        var parentContainer = document
          .getElementsByClassName('patient-data')[0]
          .getBoundingClientRect();
        var container = this.getBoundingClientRect();
        container.y = container.top - parentContainer.top;

        parameter.addTooltip(d3.select(this).datum(), container);
      });

      selection.selectAll('.d3-param-group').on('mouseout', function() {
        if (_.get(opts, 'onParameterOut', false)) {
          opts.onParameterOut();
        }
      });
    });
  }

  parameter.addTooltip = function(d, rect) {
    if (_.get(opts, 'onParameterHover', false)) {
      opts.onParameterHover({
        data: d,
        rect: rect
      });
    }
  };

  return parameter;
};
