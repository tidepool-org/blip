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
var log = require('../lib/').bows('Wizard');

var DrawBolus = require('./util/drawbolus');

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

  var drawBolus = DrawBolus(opts);
  var tideline = window.tideline;
  var mainGroup = pool.parent();

  var timespan = function(datum) {
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

  // tooltip
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
  }

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

  var getTooltipCategory = function(datum) {
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

  var addTooltip = function(datum, category) {
    var tooltipWidth = opts.classes[category].width;
    var tooltipHeight = opts.classes[category].height;

    mainGroup.select('#' + 'tidelineTooltips_bolus')
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
        opts.xScale(Date.parse(datum.normalTime)) + opts.width/2,
        // imageY
        function() {
          return pool.height() - tooltipHeight;
        },
        // textX
        opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2 + opts.width/2,
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
      var twoLineSelection = mainGroup.select('#tooltip_' + datum.id).select('.d3-tooltip-text-group').append('text')
        .attr({
          'class': 'd3-tooltip-text d3-bolus',
          'x': opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2  + opts.width/2,
          'y': pool.height() - tooltipHeight / 3
        })
        .append('tspan');

      if ((datum.recommended != null) && (datum.recommended !== datum.value)) {
        twoLineSelection.text(getRecommendedBolusTooltipText(datum));
      }
      else if (datum.extended != null) {
        twoLineSelection.text(getExtendedBolusTooltipText(datum));
      }

      twoLineSelection.attr('class', 'd3-bolus');
    } else if (category === 'three-line') {
      mainGroup.select('#tooltip_' + datum.id).select('.d3-tooltip-text-group').append('text')
        .attr({
          'class': 'd3-tooltip-text d3-bolus',
          'x': opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2  + opts.width/2,
          'y': pool.height() - tooltipHeight / 2
        })
        .append('tspan')
        .text(getRecommendedBolusTooltipText(datum))
        .attr('class', 'd3-bolus');

      mainGroup.select('#tooltip_' + datum.id).select('.d3-tooltip-text-group').append('text')
        .attr({
          'class': 'd3-tooltip-text d3-bolus',
          'x': opts.xScale(Date.parse(datum.normalTime)) + tooltipWidth / 2,
          'y': pool.height() - tooltipHeight / 4
        })
        .append('tspan')
        .text(getExtendedBolusTooltipText(datum))
        .attr('class', 'd3-bolus');
    }
  };

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
          return d.bolus;
        }
      });

      drawBolus.bolus(boluses);

      // boluses where recommended > delivered
      var underride = boluses.filter(function(d) {
        if (d.bolus.recommended > d.bolus.value) {
          return d.bolus;
        }
      });

      drawBolus.underride(underride);

      // boluses where delivered > recommended
      var override = boluses.filter(function(d) {
        if (d.bolus.value > d.bolus.recommended) {
          return d.bolus;
        }
      });

      drawBolus.override(override);

      var extended = boluses.filter(function(d) {
        if (d.bolus.extended == true) {
          return d.bolus;
        }
      });
      
      drawBolus.extended(extended)

      wizards.exit().remove();

      var highlight = pool.highlight(wizards, opts);

      // tooltips
      selection.selectAll('.d3-wizard-group').on('mouseover', function(d) {
        addTooltip(d.bolus, getTooltipCategory(d.bolus));
        highlight.on(d3.select(this));
      });
      selection.selectAll('.d3-wizard-group').on('mouseout', function(d) {
        mainGroup.select('#tooltip_' + d.bolus.id).remove();
        highlight.off();
      });
    });
  };
};
