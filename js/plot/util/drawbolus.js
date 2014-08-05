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
var format = require('../../data/util/format');

module.exports = function(pool, opts) {
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

  var QUARTER = ' ¼', HALF = ' ½', THREE_QUARTER = ' ¾', THIRD = ' ⅓', TWO_THIRDS = ' ⅔';
  var top = opts.yScale.range()[0];
  var bottom = top - opts.bolusStroke / 2;
  var mainGroup = pool.parent();


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

  var timespan = function(d) {
    var dur = Duration.parse(d.duration + 'ms');
    var hours = dur.hours();
    var minutes = dur.minutes() - (hours * 60);

    if (hours !== 0) {
      if (hours === 1) {
        switch(minutes) {
        case 0:
          return 'over ' + hours + ' hr';
        case 15:
          return 'over ' + hours + QUARTER + ' hr';
        case 20:
          return 'over ' + hours + THIRD + ' hr';
        case 30:
          return 'over ' + hours + HALF + ' hr';
        case 40:
          return 'over ' + hours + TWO_THIRDS + ' hr';
        case 45:
          return 'over ' + hours + THREE_QUARTER + ' hr';
        default:
          return 'over ' + hours + ' hr ' + minutes + ' min';
        }
      } else {
        switch(minutes) {
        case 0:
          return 'over ' + hours + ' hrs';
        case 15:
          return 'over ' + hours + QUARTER + ' hrs';
        case 20:
          return 'over ' + hours + THIRD + ' hrs';
        case 30:
          return 'over ' + hours + HALF + ' hrs';
        case 40:
          return 'over ' + hours + TWO_THIRDS + ' hrs';
        case 45:
          return 'over ' + hours + THREE_QUARTER + ' hrs';
        default:
          return 'over ' + hours + ' hrs ' + minutes + ' min';
        }
      }
    } else {
      return 'over ' + minutes + ' min';
    }
  };

  var formatValue = function(x) {
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

  var getRecommendedBolusTooltipText = function(d) {
    return formatValue(d.recommended) + "U recom'd";
  };

  var unknownDeliverySplit = function(d) {
    return d.initialDelivery == null && d.extendedDelivery == null;
  };

  var getExtendedBolusTooltipText = function(d) {
    if (unknownDeliverySplit(d)) {
      return 'Split unknown';
    }
    return format.percentage(d.extendedDelivery / d.value) + ' ' + timespan(d);
  };

  var getTooltipCategory = function(d) {
    var category = '';
    // when there's no 'recommended' field
    if (d.recommended == null) {
      if (d.extended == null) {
        category = 'unspecial';
      } else {
        category = 'two-line';
      }
    } else {
      if ((d.extended == null) && (d.recommended === d.value)) {
        category = 'unspecial';
      } else if ((d.extended == null) && (d.recommended !== d.value)) {
        category = 'two-line';
      } else if ((d.recommended === d.value) && (d.extended != null)) {
        category = 'two-line';
      } else if ((d.recommended !== d.value) && (d.extended != null)) {
        category = 'three-line';
      }
    }
    return category;
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
    suspended: function(suspended) {
      suspended.append('rect')
        .attr({
          x: function(d) {
            d = pluckBolus(d);
            return xPosition(d);
          },
          y: function(d) {
            d = pluckBolus(d);

            if (d.extended && (d.extendedDelivered + (d.initialDelivered || 0) != d.programmed)) {
              return opts.yScale(d.extendedDelivered + (d.initialDelivered || 0));
            }

            return opts.yScale(d.delivered);
          },
          width: opts.width,
          height: 2,
          class: 'd3-rect-suspended d3-bolus'
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
    },
    extendedSuspended: function(suspended) {
      // square- and dual-wave boluses
      suspended.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var suspendedDuration = (d.extendedDelivered * d.duration)/d.extendedDelivery;
            var rightEdge = opts.xScale(Date.parse(d.normalTime) + suspendedDuration) + opts.width;
            var doseHeight = computePathHeight(d);
            var doseEnd = rightEdge + 5;
            return 'M' + rightEdge + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          class: 'd3-path-suspended d3-bolus'
        });
    },
    tooltip: {
      add: function(d) {
        var category = getTooltipCategory(d);
        var tooltipWidth = opts.classes[category].width;
        var tooltipHeight = opts.classes[category].height;

        mainGroup.select('#' + 'tidelineTooltips_bolus')
          .call(pool.tooltips(),
            d,
            // tooltipXPos
            opts.xScale(Date.parse(d.normalTime)),
            'bolus',
            // timestamp
            true,
            opts.classes[category].tooltip,
            tooltipWidth,
            tooltipHeight,
            // imageX
            opts.xScale(Date.parse(d.normalTime)) + opts.width/2,
            // imageY
            function() {
              return pool.height() - tooltipHeight;
            },
            // textX
            opts.xScale(Date.parse(d.normalTime)) + tooltipWidth / 2 + opts.width/2,
            // textY
            function() {
              if (category === 'unspecial') {
                return pool.height() - tooltipHeight * (9/16);
              } else if (category === 'two-line') {
                return pool.height() - tooltipHeight * (3/4);
              } else if (category === 'three-line') {
                return pool.height() - tooltipHeight * (13/16);
              } else {
                return pool.height() - tooltipHeight;
              }

            },
            // customText
            (function() {
              return formatValue(d.value) + 'U';
            }()),
            // tspan
            (function() {
              if (d.extended) {
                return ' total';
              }
            }())
          );

        if (category === 'two-line') {
          var twoLineSelection = mainGroup.select('#tooltip_' + d.id).select('.d3-tooltip-text-group').append('text')
            .attr({
              'class': 'd3-tooltip-text d3-bolus',
              'x': opts.xScale(Date.parse(d.normalTime)) + tooltipWidth / 2  + opts.width/2,
              'y': pool.height() - tooltipHeight / 3
            })
            .append('tspan');

          if ((d.recommended != null) && (d.recommended !== d.value)) {
            twoLineSelection.text(getRecommendedBolusTooltipText(d));
          }
          else if (d.extended != null) {
            twoLineSelection.text(getExtendedBolusTooltipText(d));
          }

          twoLineSelection.attr('class', 'd3-bolus');
        } else if (category === 'three-line') {
          mainGroup.select('#tooltip_' + d.id).select('.d3-tooltip-text-group').append('text')
            .attr({
              'class': 'd3-tooltip-text d3-bolus',
              'x': opts.xScale(Date.parse(d.normalTime)) + tooltipWidth / 2  + opts.width/2,
              'y': pool.height() - tooltipHeight / 2
            })
            .append('tspan')
            .text(getRecommendedBolusTooltipText(d))
            .attr('class', 'd3-bolus');

          mainGroup.select('#tooltip_' + d.id).select('.d3-tooltip-text-group').append('text')
            .attr({
              'class': 'd3-tooltip-text d3-bolus',
              'x': opts.xScale(Date.parse(d.normalTime)) + tooltipWidth / 2 + opts.width/2,
              'y': pool.height() - tooltipHeight / 4
            })
            .append('tspan')
            .text(getExtendedBolusTooltipText(d))
            .attr('class', 'd3-bolus');
        }
      },
      remove: function(d) {
        mainGroup.select('#tooltip_' + d.id).remove();
      }
    },
    annotations: function(data, selection) {
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
    }
  }
};
