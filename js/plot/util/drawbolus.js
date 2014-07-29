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

var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

module.exports = function(opts) {
  opts = opts || {};

  var defaults = {
    width: 12,
    r: 14,
    bolusStroke: 2,
    triangleSize: 6,
    carbPadding: 4,
    carbTooltipCatcher: 5
  };

  _.defaults(opts, defaults);

  var top = opts.yScale.range()[0];
  var bottom = top - opts.bolusStroke / 2;

  var pluckBolus = function(d) {
    return d.bolus ? d.bolus : d;
  };

  var xPosition = function(d) {
    var x = opts.xScale(Date.parse(d.normalTime)) - opts.width/2;
    return x;
  };

  var unknownDeliverySplit = function(d) {
    return d.initialDelivery == null && d.extendedDelivery == null;
  };

  var computePathHeight = function(d) {
    if (unknownDeliverySplit(d)) {
      return opts.yScale(d.value) + opts.bolusStroke / 2;
    } else {
      return opts.yScale(d.extendedDelivery) + opts.bolusStroke / 2;
    }
  };

  var triangle = function(x, y) {
    var top = (x + opts.triangleSize) + ' ' + (y + opts.triangleSize/2);
    var bottom = (x + opts.triangleSize) + ' ' + (y - opts.triangleSize/2);
    var point = x + ' ' + y;
    return 'M' + top + 'L' + bottom + 'L' + point + 'Z';
  };

  return {
    carb: function(carbs) {
      var xPos = function(d) {
        return xPosition(d) + opts.width/2;
      };
      var yPos = function(d) {
        var r = opts.yScaleCarbs ? opts.yScaleCarbs(d.carbs.value) : opts.r;

        var bolusValue = d.bolus ? ((d.bolus.recommended && d.bolus.recommended > d.bolus.value) ? d.bolus.recommended : d.bolus.value) : 0;

        return opts.yScale(bolusValue) - r - (bolusValue ? opts.carbPadding : 0);
      };

      carbs.append('circle')
        .attr({
          cx: xPos,
          cy: yPos,
          r: function(d) {
            return opts.yScaleCarbs ? opts.yScaleCarbs(d.carbs.value) : opts.r;
          },
          'stroke-width': 0,
          class: 'd3-circle-carbs d3-carbs',
          id: function(d) {
            return 'carbs_' + d.id;
          }
        });

      carbs.append('text')
        .text(function(d) {
          if(d.carbs) {
            return d.carbs.value;
          }
        })
        .attr({
          x: xPos,
          y: yPos,
          class: 'd3-carbs-text'
        });
    },
    bolus: function(boluses) {
      // boluses where delivered = recommended
      boluses.append('rect')
        .attr({
          x: function(d) {
            d = pluckBolus(d);
            return xPosition(d);
          },
          y: function(d) {
            d = pluckBolus(d);
            return opts.yScale(d.value);
          },
          width: opts.width,
          height: function(d) {
            d = pluckBolus(d);
            return top - opts.yScale(d.value);
          },
          class: 'd3-rect-bolus d3-bolus',
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    underride: function(underride) {
      underride.append('rect')
        .attr({
          x: function(d) {
            d = pluckBolus(d);
            return xPosition(d);
          },
          y: function(d) {
            d = pluckBolus(d);
            return opts.yScale(d.recommended);
          },
          width: opts.width,
          height: function(d) {
            d = pluckBolus(d);
            return opts.yScale(d.value) - opts.yScale(d.recommended);
          },
          class: 'd3-rect-recommended d3-bolus',
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    override: function(override) {
      override.append('rect')
        .attr({
          x: function(d) {
            d = pluckBolus(d);
            return xPosition(d);
          },
          y: function(d) {
            d = pluckBolus(d);
            return opts.yScale(d.recommended);
          },
          width: opts.width,
          height: function(d) {
            d = pluckBolus(d);
            return top - opts.yScale(d.recommended);
          },
          'stroke-width': opts.bolusStroke,
          class: 'd3-rect-recommended d3-bolus',
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
      override.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var leftEdge = xPosition(d) + opts.bolusStroke / 2;
            var rightEdge = leftEdge + opts.width - opts.bolusStroke;
            var bolusHeight = opts.yScale(d.value) + opts.bolusStroke / 2;
            return 'M' + leftEdge + ' ' + bottom + 'L' + rightEdge + ' ' + bottom + 'L' + rightEdge + ' ' + bolusHeight + 'L' + leftEdge + ' ' + bolusHeight + 'Z';
          },
          'stroke-width': opts.bolusStroke,
          class: 'd3-path-bolus d3-bolus',
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    extended: function(extended) {
      // square- and dual-wave boluses
      extended.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var rightEdge = xPosition(d) + opts.width;
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) - opts.triangleSize / 2;
            return 'M' + rightEdge + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          class: function(d){
            d = pluckBolus(d);
            if (unknownDeliverySplit(d)) {
              return 'd3-path-extended d3-bolus d3-unknown-delivery-split';
            } else {
              return 'd3-path-extended d3-bolus';
            }
          },
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
      extended.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) - opts.triangleSize;
            return triangle(doseEnd, doseHeight);
          },
          'stroke-width': opts.bolusStroke,
          class: 'd3-path-extended-triangle d3-bolus',
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
    }
  }
};
