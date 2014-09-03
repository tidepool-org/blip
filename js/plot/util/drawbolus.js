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
var Duration = require('duration-js');
var dt = require('../../data/util/datetime');
var format = require('../../data/util/format');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {
    width: 12,
    r: 14,
    suspendMarkerWidth: 5,
    markerHeight: 2,
    triangleHeight: 4,
    triangleOffset: 4,
    bolusStroke: 2,
    triangleSize: 6,
    carbPadding: 4,
    tooltipHeightAddition: 3,
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

  var top = opts.yScale.range()[0];
  var bottom = top - opts.bolusStroke / 2;
  var mainGroup = pool.parent();

  var getValue = function(bolus) {
    if (bolus.programmed && bolus.programmed !== bolus.value) {
      return bolus.programmed;
    }
    return bolus.value;
  };

  var getDuration = function(bolus) {
    if (bolus.programmed && bolus.programmed !== bolus.value && bolus.suspendedAt) {
      return dt.getDuration(bolus.normalTime, bolus.suspendedAt);
    }
    else if (bolus.extended) {
      return bolus.duration;
    }
    else {
      return 0;
    }
  };

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

  var triangleLeft = function(x) { return x + opts.width/2 - opts.triangleOffset; };
  var triangleRight = function(x) { return x + opts.width/2 + opts.triangleOffset; };
  var triangleMiddle = function(x) { return x + opts.width/2; };

  var extendedTriangle = function(x, y) {
    var top = (x + opts.triangleSize) + ' ' + (y + opts.triangleSize/2);
    var bottom = (x + opts.triangleSize) + ' ' + (y - opts.triangleSize/2);
    var point = x + ' ' + y;
    return 'M' + top + 'L' + bottom + 'L' + point + 'Z';
  };

  var underrideTriangle = function(x, y) {
    return triangleLeft(x) + ',' + (y + opts.markerHeight/2) + ' ' +
      triangleMiddle(x) + ',' + (y + opts.markerHeight/2 + opts.triangleHeight) + ' ' +
      triangleRight(x) + ',' + (y + opts.markerHeight/2);
  };

  var overrideTriangle = function(x, y) {
    return triangleLeft(x) + ',' + (y + opts.markerHeight/2) + ' ' +
      triangleMiddle(x) + ',' + (y + opts.markerHeight/2 - opts.triangleHeight) + ' ' +
      triangleRight(x) + ',' + (y + opts.markerHeight/2);
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
          'class': 'd3-circle-carbs d3-carbs',
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
          'class': 'd3-carbs-text'
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
            return opts.yScale(getValue(d));
          },
          width: opts.width,
          height: function(d) {
            d = pluckBolus(d);
            return top - opts.yScale(getValue(d));
          },
          'class': 'd3-rect-bolus d3-bolus',
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    suspended: function(suspended) {
      // draw the line
      suspended.append('rect')
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
          height: opts.markerHeight,
          'class': 'd3-rect-suspended d3-bolus'
        });

      // draw color in the suspended portion
      suspended.append('rect')
        .attr({
          x: function(d) {
            d = pluckBolus(d);
            return xPosition(d);
          },
          y: function(d) {
            d = pluckBolus(d);
            return opts.yScale(getValue(d));
          },
          width: opts.width,
          height: function(d) {
            d = pluckBolus(d);
            return opts.yScale(d.value) - opts.yScale(getValue(d)) - 1;
          },
          'class': 'd3-rect-suspended-bolus d3-bolus'
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
            return opts.yScale(getValue(d)) - opts.yScale(d.recommended);
          },
          'class': 'd3-rect-recommended d3-bolus',
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });

      // draw the line iff the programmed and delivered are the same
      // to avoid too much confusing clutter
      // tooltip still exposes fact that suggested and programmed differed
      var uninterrupted = underride.filter(function(d) {
        d = pluckBolus(d);
        if (d.programmed != null) {
          return d.programmed === d.value;
        }
        return true;
      });
      uninterrupted.append('rect')
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
          height: opts.markerHeight,
          'class': 'd3-rect-override d3-bolus'
        });

      uninterrupted.append('polygon')
        .attr({
          x: function(d) {
            d = pluckBolus(d);
            return xPosition(d);
          },
          y: function(d) {
            d = pluckBolus(d);
            return opts.yScale(d.value);
          },
          points: function(d) {
            d = pluckBolus(d);
            return underrideTriangle(xPosition(d), opts.yScale(d.value));
          },
          'class': 'd3-polygon-override d3-bolus'
        });
    },
    override: function(override) {
      // draw the line iff the programmed and delivered are the same
      // to avoid too much confusing clutter
      // tooltip still exposes fact that suggested and programmed differed
      var uninterrupted = override.filter(function(d) {
        d = pluckBolus(d);
        if (d.programmed != null) {
          return d.programmed === d.value;
        }
        return true;
      });
      uninterrupted.append('rect')
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
          height: opts.markerHeight,
          'class': 'd3-rect-override d3-bolus'
        });

      uninterrupted.append('polygon')
        .attr({
          x: function(d) {
            d = pluckBolus(d);
            return xPosition(d);
          },
          y: function(d) {
            d = pluckBolus(d);
            return opts.yScale(d.recommended);
          },
          points: function(d) {
            d = pluckBolus(d);
            return overrideTriangle(xPosition(d), opts.yScale(d.recommended));
          },
          'class': 'd3-polygon-override d3-bolus'
        });
    },
    extended: function(extended) {
      // square- and dual-wave boluses
      var actualExtended = extended.filter(function(d) {
        d = pluckBolus(d);
        return d.extendedDelivery > 0;
      });

      actualExtended.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var rightEdge = xPosition(d) + opts.width;
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration);
            return 'M' + rightEdge + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          'class': function(d){
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

      // triangle
      actualExtended.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) - opts.triangleSize;
            return extendedTriangle(doseEnd, doseHeight);
          },
          'stroke-width': opts.bolusStroke,
          'class': function(d) {
            d = pluckBolus(d);

            if (d.suspendedAt) {
              return 'd3-path-extended-triangle-suspended d3-bolus';
            }

            return 'd3-path-extended-triangle d3-bolus';
          },
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    extendedSuspended: function(suspended) {
      // square- and dual-wave boluses
      var actualExtended = suspended.filter(function(d) {
        if (d.bolus) {
          return d.bolus.extendedDelivery > 0;
        }
        return d.extendedDelivery > 0;
      });
      // red marker indicating where suspend happened
      actualExtended.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var rightEdge = opts.xScale(Date.parse(d.suspendedAt));
            var doseHeight = computePathHeight(d);
            var expectedEnd = opts.xScale(Date.parse(d.normalTime) + d.duration);
            var doseEnd = rightEdge + opts.suspendMarkerWidth;

            return 'M' + rightEdge + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-suspended d3-bolus'
        });

      // now, light-blue path representing undelivered extended bolus
      actualExtended.append('path')
        .attr({
          d: function(d) {
            d = pluckBolus(d);
            var rightEdge = opts.xScale(Date.parse(d.suspendedAt)) + opts.suspendMarkerWidth;
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.duration);
            var suspendedEnd = opts.xScale(Date.parse(d.suspendedAt || 0)) + opts.suspendMarkerWidth;

            if(suspendedEnd < (doseEnd - opts.triangleSize)) {
              return 'M' + rightEdge + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
            }
          },
          'stroke-width': opts.bolusStroke,
          'class': function(d){
            d = pluckBolus(d);
            if (unknownDeliverySplit(d)) {
              return 'd3-path-extended-suspended d3-bolus d3-unknown-delivery-split';
            } else {
              return 'd3-path-extended-suspended d3-bolus';
            }
          },
          id: function(d) {
            d = pluckBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    tooltip: {
      add: function(d) {
        var tooltips = pool.tooltips();
        var res = tooltips.addForeignObjTooltip({
          cssClass: 'd3-bolus',
          datum: d,
          div: 'bolus-wizard',
          shape: 'generic',
          xPosition: function() { return xPosition(d) + opts.width/2; },
          yPosition: function() { return pool.height() - opts.tooltipHeightAddition; }
        });
        var foGroup = res.foGroup;
        this.html(foGroup, d);
        var dims = tooltips.foreignObjDimensions(foGroup);
        // foGroup.node().parentNode is the <foreignObject> itself
        // because foGroup is actually the top-level <xhtml:div> element
        tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
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

        var title = group.append('div')
          .attr('class', 'title');
        // timestamp goes in title
        title.append('p')
          .attr('class', 'timestamp left')
          .html(format.timestamp(bolus.normalTime));
        // interrupted boluses get priority on special headline
        if (bolus.programmed != null && bolus.programmed !== bolus.value) {
          title.append('p')
            .attr('class', 'interrupted plain right')
            .text('interrupted');
          title.classed('wider', true);
        }
        // if not interrupted, then extended boluses get a headline
        else if (bolus.extended === true) {
          title.append('p')
            .attr('class', 'plain right')
            .text('Extended');
        }

        var tbl = group.append('table');
        // carbs
        if (d.type === 'wizard' && d.carbs != null) {
          var carbRow = tbl.append('tr');
          carbRow.append('td')
            .attr('class', 'label')
            .text('Carbs');
          carbRow.append('td')
            .attr('class', 'right')
            .text(d.carbs.value + ' g');
        }

        // only show recommendation when different from delivery
        if (bolus.recommended != null && bolus.recommended !== getValue(bolus)) {
          // wizard-suggested bolus
          var sugRow = tbl.append('tr');
          sugRow.append('td')
            .attr('class', 'label')
            .text('Suggested');
          sugRow.append('td')
            .attr('class', 'right')
            .text(format.tooltipValue(bolus.recommended));
        }
        // only show programmed when different from delivery
        if (bolus.programmed != null && bolus.programmed !== bolus.value) {
          var intRow = tbl.append('tr');
          intRow.append('td')
            .attr('class', 'label')
            .text('Programmed');
          intRow.append('td')
            .attr('class', 'right')
            .text(format.tooltipValue(bolus.programmed));
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
              .text(format.timespan({duration: getDuration(bolus)}) + ':');
            extRow.append('td')
              .attr('class', 'secondary')
              .text(format.percentage(bolus.extendedDelivery/getValue(bolus)) +
                ' (' + format.tooltipValue(bolus.extendedDelivery) + ')');
          }
          else {
            extRow.append('td')
              .attr('class', 'dual')
              .text('Up front: ');
            extRow.append('td')
              .attr('class', 'secondary')
              .text(format.percentage(bolus.initialDelivery/getValue(bolus)) +
                ' (' + format.tooltipValue(bolus.initialDelivery) + ')');
            var extRow2 = tbl.append('tr');
            extRow2.append('td')
              .attr('class', 'dual')
              .text(format.timespan({duration: getDuration(bolus)}) + ':');
            extRow2.append('td')
              .attr('class', 'secondary')
              .text(format.percentage(bolus.extendedDelivery/getValue(bolus)) +
                ' (' + format.tooltipValue(bolus.extendedDelivery) + ')');
          }
        }
      },
      remove: function(d) {
        mainGroup.select('#tooltip_' + d.id).remove();
      }
    },
    annotations: function(data, selection) {
      _.each(data, function(d) {
        var annotationOpts = {
          x: opts.xScale(Date.parse(d.normalTime)),
          y: opts.yScale(d.value),
          xMultiplier: -2,
          yMultiplier: 1,
          d: d,
          orientation: {
            up: true
          }
        };
        if (mainGroup.select('#annotation_for_' + d.id)[0][0] == null) {
          mainGroup.select('#tidelineAnnotations_bolus').call(pool.annotations(), annotationOpts);
        }
      });
    }
  };
};
