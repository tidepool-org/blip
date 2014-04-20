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
    width: 12,
    bolusStroke: 2,
    triangleSize: 6,
    carbTooltipCatcher: 5
  };

  _.defaults(opts, defaults);

  var carbTooltipBuffer = opts.carbTooltipCatcher * MS_IN_ONE;

  // catch bolus tooltips events
  opts.emitter.on('carbTooltipOn', function(t) {
    var b = _.find(opts.data, function(d) {
      var bolusT = Date.parse(d.normalTime);
      if (bolusT >= (t - carbTooltipBuffer) && (bolusT <= (t + carbTooltipBuffer))) {
        return d;
      }
    });
    if (b) {
      bolus.addTooltip(b, bolus.getTooltipCategory(b));
      opts.emitter.emit('noCarbTimestamp', true);
    }
  });
  opts.emitter.on('carbTooltipOff', function(t) {
    var b = _.find(opts.data, function(d) {
      var bolusT = Date.parse(d.normalTime);
      if (bolusT >= (t - carbTooltipBuffer) && (bolusT <= (t + carbTooltipBuffer))) {
        return d;
      }
    });
    if (b) {
      d3.select('#tooltip_' + b._id).remove();
      opts.emitter.emit('noCarbTimestamp', false);
    }
  });

  function unknownDeliverySplit(d) {
    return d.initialDelivery == null && d.extendedDelivery == null;
  }

  function computePathHeight(d) {
    if (unknownDeliverySplit(d)) {
      return opts.yScale(d.value) + opts.bolusStroke / 2;
    } else {
      return opts.yScale(d.extendedDelivery) + opts.bolusStroke / 2;
    }
  }

  function bolus(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {
      bolus.addAnnotations(_.filter(currentData, function(d) { return d.annotations; }));
      
      var boluses = d3.select(this)
        .selectAll('g')
        .data(currentData, function(d) {
          return d._id;
        });
      var bolusGroups = boluses.enter()
        .append('g')
        .attr({
          'class': 'd3-bolus-group'
        });
      var top = opts.yScale.range()[0];
      // boluses where delivered = recommended
      bolusGroups.append('rect')
        .attr({
          'x': function(d) {
            return bolus.x(d);
          },
          'y': function(d) {
            return opts.yScale(d.value);
          },
          'width': opts.width,
          'height': function(d) {
            return top - opts.yScale(d.value);
          },
          'class': 'd3-rect-bolus d3-bolus',
          'id': function(d) {
            return 'bolus_' + d._id;
          }
        });
      // boluses where recommendation and delivery differ
      var bottom = top - opts.bolusStroke / 2;
      // boluses where recommended > delivered
      var underride = bolusGroups.filter(function(d) {
        if (d.recommended > d.value) {
          return d;
        }
      });
      underride.append('rect')
        .attr({
          'x': function(d) {
            return bolus.x(d);
          },
          'y': function(d) {
            return opts.yScale(d.recommended);
          },
          'width': opts.width,
          'height': function(d) {
            return opts.yScale(d.value) - opts.yScale(d.recommended);
          },
          'class': 'd3-rect-recommended d3-bolus',
          'id': function(d) {
            return 'bolus_' + d._id;
          }
        });
      // boluses where delivered > recommended
      var override = bolusGroups.filter(function(d) {
        if (d.value > d.recommended) {
          return d;
        }
      });
      override.append('rect')
        .attr({
          'x': function(d) {
            return bolus.x(d);
          },
          'y': function(d) {
            return opts.yScale(d.recommended);
          },
          'width': opts.width,
          'height': function(d) {
            return top - opts.yScale(d.recommended);
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-rect-recommended d3-bolus',
          'id': function(d) {
            return 'bolus_' + d._id;
          }
        });
      override.append('path')
        .attr({
          'd': function(d) {
            var leftEdge = bolus.x(d) + opts.bolusStroke / 2;
            var rightEdge = leftEdge + opts.width - opts.bolusStroke;
            var bolusHeight = opts.yScale(d.value) + opts.bolusStroke / 2;
            return 'M' + leftEdge + ' ' + bottom + 'L' + rightEdge + ' ' + bottom + 'L' + rightEdge + ' ' + bolusHeight + 'L' + leftEdge + ' ' + bolusHeight + 'Z';
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-bolus d3-bolus',
          'id': function(d) {
            return 'bolus_' + d._id;
          }
        });

      // square- and dual-wave boluses
      var extendedBoluses = bolusGroups.filter(function(d) {
        if (d.extended) {
          return d;
        }
      });
      extendedBoluses.append('path')
        .attr({
          'd': function(d) {
            var rightEdge = bolus.x(d) + opts.width;
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) - opts.triangleSize / 2;
            return 'M' + rightEdge + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          'class': function(d){
            if (unknownDeliverySplit(d)) {
              return 'd3-path-extended d3-bolus d3-unknown-delivery-split';
            } else {
              return 'd3-path-extended d3-bolus';
            }
          },
          'id': function(d) {
            return 'bolus_' + d._id;
          }
        });
      extendedBoluses.append('path')
        .attr({
          'd': function(d) {
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) - opts.triangleSize;
            return bolus.triangle(doseEnd, doseHeight);
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-extended-triangle d3-bolus',
          'id': function(d) {
            return 'bolus_' + d._id;
          }
        });
      boluses.exit().remove();

      // tooltips
      d3.selectAll('.d3-rect-bolus, .d3-rect-recommended').on('mouseover', function(d) {
        bolus.addTooltip(d, bolus.getTooltipCategory(d));
        opts.emitter.emit('bolusTooltipOn', Date.parse(d.normalTime));
      });
      d3.selectAll('.d3-rect-bolus, .d3-rect-recommended').on('mouseout', function(d) {
        d3.select('#tooltip_' + d._id).remove();
        opts.emitter.emit('bolusTooltipOff', Date.parse(d.normalTime));
      });
    });
  }

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
  }

  bolus.getRecommendedBolusTooltipText = function(datum) {
    return formatValue(datum.recommended) + "U recom'd";
  };

  bolus.getExtendedBolusTooltipText = function(datum) {
    if (unknownDeliverySplit(datum)) {
      return 'Split unknown';
    }
    return format.percentage(datum.extendedDelivery / datum.value) + ' ' + bolus.timespan(datum);
  };

  bolus.getTooltipCategory = function(datum) {
    var category;
    // when there's no 'recommended' field
    if (datum.recommended == null) {
      if (datum.extended == null) {
        category = 'unspecial';
      } else {
        category = 'two-line';
      }
    } else {
      if ((datum.extended == null) && (datum.recommended === datum.value)) {
        category = 'unspecial';
      } else if ((datum.extended == null) && (datum.recommended !== datum.value)) {
        category = 'two-line';
      } else if ((datum.recommended === datum.value) && (datum.extended != null)) {
        category = 'two-line';
      } else if ((datum.recommended !== datum.value) && (datum.extended != null)) {
        category = 'three-line';
      }
    }
    return category;
  };

  bolus.addTooltip = function(datum, category) {
    var tooltipWidth = opts.classes[category].width;
    var tooltipHeight = opts.classes[category].height;
    
    d3.select('#' + 'tidelineTooltips_bolus')
      .call(pool.tooltips(),
        datum,
        // tooltipXPos
        opts.xScale(Date.parse(datum.normalTime)),
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
        opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2,
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
          return formatValue(datum.value) + 'U';
        }()),
        // tspan
        (function() {
          if (datum.extended) {
            return ' total';
          }
        }())
      );

    if (category === 'two-line') {
      var twoLineSelection = d3.select('#tooltip_' + datum._id).select('.d3-tooltip-text-group').append('text')
        .attr({
          'class': 'd3-tooltip-text d3-bolus',
          'x': opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2,
          'y': pool.height() - tooltipHeight / 3
        })
        .append('tspan');

      if ((datum.recommended != null) && (datum.recommended !== datum.value)) {
        twoLineSelection.text(bolus.getRecommendedBolusTooltipText(datum));
      }
      else if (datum.extended != null) {
        twoLineSelection.text(bolus.getExtendedBolusTooltipText(datum));
      }

      twoLineSelection.attr('class', 'd3-bolus');
    } else if (category === 'three-line') {
      d3.select('#tooltip_' + datum._id).select('.d3-tooltip-text-group').append('text')
        .attr({
          'class': 'd3-tooltip-text d3-bolus',
          'x': opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2,
          'y': pool.height() - tooltipHeight / 2
        })
        .append('tspan')
        .text(bolus.getRecommendedBolusTooltipText(datum))
        .attr('class', 'd3-bolus');

      d3.select('#tooltip_' + datum._id).select('.d3-tooltip-text-group').append('text')
        .attr({
          'class': 'd3-tooltip-text d3-bolus',
          'x': opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2,
          'y': pool.height() - tooltipHeight / 4
        })
        .append('tspan')
        .text(bolus.getExtendedBolusTooltipText(datum))
        .attr('class', 'd3-bolus');
    }
  };

  bolus.timespan = function(datum) {
    var dur = Duration.parse(datum.duration + 'ms');
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
  
  bolus.x = function(datum) {
    return opts.xScale(Date.parse(datum.normalTime)) - opts.width/2;
  };

  bolus.triangle = function(x, y) {
    var top = (x + opts.triangleSize) + ' ' + (y + opts.triangleSize/2);
    var bottom = (x + opts.triangleSize) + ' ' + (y - opts.triangleSize/2);
    var point = x + ' ' + y;
    return 'M' + top + 'L' + bottom + 'L' + point + 'Z';
  };

  bolus.addAnnotations = function(data, selection) {
    _.each(data, function(d) {
      var annotationOpts = {
        'x': opts.xScale(Date.parse(d.normalTime)),
        'y': opts.yScale(d.value),
        'xMultiplier': -2,
        'yMultiplier': 1,
        'd': d
      };
      if (d3.select('#annotation_for_' + d._id)[0][0] == null) {
        d3.select('#tidelineAnnotations_bolus').call(pool.annotations(), annotationOpts);
      }
    });
  };

  return bolus;
};
