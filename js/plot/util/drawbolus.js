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
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

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
    },
    tooltip: {
      add: function(d) {
        var tooltips = pool.nativeTooltips();
        var res = tooltips.addFOTooltip({
          cssClass: 'd3-bolus',
          datum: d,
          div: 'bolus-wizard',
          shape: 'generic',
          xPosition: function() { return xPosition(d) + opts.width/2; },
          yPosition: function() { return pool.height() - 1; }
        });
        var foGroup = res.foGroup;
        this.html(foGroup, d);
        var dims = tooltips.foDimensions(foGroup);
        tooltips.anchorFO(d3.select(foGroup.node().parentNode), {
          w: dims.width + opts.tooltipPadding,
          h: dims.height,
          y: -dims.height,
          orientation: {
            'default': 'leftAndUp',
            leftEdge: 'normal',
            rightEdge: 'leftAndUp'
          },
          shape: 'generic',
          edge: res.edge
        });
      },
      html: function(group, d) {
        var bolus = pluckBolus(d);
        var justBolus = !(bolus.programmed && bolus.programmed !== bolus.value) &&
          !(bolus.recommended && bolus.recommended !== bolus.value) &&
          !(bolus.extended && bolus.extendedDelivery) &&
          !(d.carbs);
        // interrupted boluses get priority on special headline
        if (bolus.programmed != null && bolus.programmed !== bolus.value) {
          group.append('p')
            .attr('class', 'title')
            .append('span')
            .attr('class', 'interrupted')
            .text('Bolus');
          group.append('p')
            .attr('class', 'title')
            .append('span')
            .attr('class', 'interrupted')
            .text('interrupted');
        }
        // if not interrupted, then extended boluses get a headline
        else if (bolus.extended === true) {
          group.append('p')
            .attr('class', 'title')
            .append('span')
            .text('Extended');
        }

        group.append('p')
          .classed('background', !justBolus)
          .append('span')
          .attr('class', 'secondary')
          .html('<span class="fromto">at</span> ' + format.timestamp(bolus.normalTime) + '<br/>');

        var tbl = group.append('table');
        // carbs
        if (d.type === 'wizard' && d.carbs != null) {
          var carbRow = tbl.append('tr');
          carbRow.append('td')
            .attr('class', 'label')
            .text('Carbs');
          carbRow.append('td')
            .attr('class', 'right')
            .text(d.carbs.value + 'g');
        }
        // actual delivered bolus
        var delRow = tbl.append('tr');
        delRow.append('td')
            .attr('class', function() {
              return justBolus ? '' : 'del';
            })
          .text('Delivered');
        delRow.append('td')
          .attr('class', 'big')
          .text(format.tooltipValue(bolus.value));

        // extended bolus
        if (bolus.extended) {
          var extRow = tbl.append('tr');
          // square bolus
          if (!bolus.initialDelivery) {
            extRow.append('td')
              .attr('class', 'dual')
              .text(format.timespan(bolus));

          }
          else {
            extRow.append('td')
              .attr('class', 'dual')
              .text('Up front: ');
            extRow.append('td')
              .attr('class', 'secondary')
              .text(format.percentage(bolus.initialDelivery/bolus.value) +
                ' (' + format.tooltipValue(bolus.initialDelivery) + ')');
            var extRow2 = tbl.append('tr');
            extRow2.append('td')
              .attr('class', 'dual')
              .text(format.timespan(bolus) + ':');
            extRow2.append('td')
              .attr('class', 'secondary')
              .text(format.percentage(bolus.extendedDelivery/bolus.value) +
                ' (' + format.tooltipValue(bolus.extendedDelivery) + ')');
          }
        }
        // only show recommendation when different from delivery
        if (bolus.recommended != null && bolus.recommended !== bolus.value) {
          // but only show recommendation if bolus not interrupted
          if (bolus.programmed != null &&
            bolus.programmed === bolus.value) {
            // wizard-suggested bolus
            var sugRow = tbl.append('tr');
            sugRow.append('td')
              .attr('class', 'label')
              .text('Suggested');
            sugRow.append('td')
              .attr('class', 'right')
              .text(format.tooltipValue(bolus.recommended));
          }
        }
        // only show programmed when different from delivery
        if (bolus.programmed != null && bolus.programmed !== bolus.value) {
          var intRow = tbl.append('tr');
          intRow.append('td')
            .attr('class', 'label interrupted')
            .text('Programmed');
          intRow.append('td')
            .attr('class', 'right interrupted')
            .text(format.tooltipValue(bolus.programmed));
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
  };
};
