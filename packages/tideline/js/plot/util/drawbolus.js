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

const _ = require('lodash');

const commonbolus = require('./commonbolus');

const BolusTypes = {
  meal: 1,
  micro: 2,
  manual: 3,
};

/**
 * @param {object} b The bolus or wizard
 * @returns {number} The type of bolus
 */
function bolusToLegend(b) {
  if (b.type === 'wizard') {
    return BolusTypes.meal;
  }
  const bolus = commonbolus.getBolus(b);
  if (bolus.subType === 'pen' || bolus.prescriptor === 'manual') {
    return BolusTypes.manual;
  }
  if (bolus.subType === 'biphasic') {
    return BolusTypes.meal;
  }
  return BolusTypes.micro;
}

/**
 * @param {object} b The bolus or wizard
 * @param {string} baseClass default/prepend class
 * @return {string} The SVG class
 */
function bolusClass(b, baseClass) {
  switch (bolusToLegend(b)) {
    case BolusTypes.manual:
      return `${baseClass} d3-bolus-manual`;
    case BolusTypes.meal:
      return `${baseClass} d3-bolus-meal`;
    case BolusTypes.micro:
      return `${baseClass} d3-bolus-micro`;
    }
    return baseClass;
}

module.exports = function(pool, opts = {}) {
  const defaults = {
    width: 12,
    r: 14,
    suspendMarkerWidth: 5,
    markerHeight: 2,
    triangleHeight: 4,
    triangleOffset: 4,
    bolusStroke: 2,
    triangleSize: 6,
    carbPadding: 4,
    timezoneAware: false,
    tooltipHeightAddition: 3,
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

  const halfWidth = opts.width / 2;
  const top = opts.yScale.range()[0];
  const mainGroup = pool.parent();

  const xPosition = (d) => opts.xScale(Date.parse(d.normalTime)) - halfWidth;
  const computePathHeight = (d) => {
    const base = opts.yScale(d.extended) + opts.bolusStroke / 2;
    if (d.extended === 0) {
      return base - opts.bolusStroke;
    }
    return base;
  };

  const triangleLeft = (x) => { return x + halfWidth - opts.triangleOffset; };
  const triangleRight = (x) => { return x + halfWidth + opts.triangleOffset; };
  const triangleMiddle = (x) => { return x + halfWidth; };

  const extendedTriangle = (x, y) => {
    const top = (x + opts.triangleSize) + ' ' + (y + opts.triangleSize/2);
    const bottom = (x + opts.triangleSize) + ' ' + (y - opts.triangleSize/2);
    const point = x + ' ' + y;
    return 'M' + top + 'L' + bottom + 'L' + point + 'Z';
  };

  const underrideTriangle = (x, y) =>
    triangleLeft(x) + ',' + (y + opts.markerHeight/2) + ' ' +
    triangleMiddle(x) + ',' + (y + opts.markerHeight/2 + opts.triangleHeight) + ' ' +
    triangleRight(x) + ',' + (y + opts.markerHeight/2);

  const overrideTriangle = (x, y) =>
    triangleLeft(x) + ',' + (y + opts.markerHeight/2) + ' ' +
    triangleMiddle(x) + ',' + (y + opts.markerHeight/2 - opts.triangleHeight) + ' ' +
    triangleRight(x) + ',' + (y + opts.markerHeight/2);

  return {
    carb: function(carbs) {
      const xPos = (d) => xPosition(d) + halfWidth;
      const yScaleCarbs = (ci) => opts.yScaleCarbs ? opts.yScaleCarbs(ci) : opts.r;
      const yPos = (d) => {
        const r = yScaleCarbs(d.carbInput);
        const bolusValue = d.bolus ? commonbolus.getProgrammed(d) : 0;
        return opts.yScale(bolusValue) - r - (bolusValue ? opts.carbPadding : 0);
      };

      carbs.append('circle')
        .attr({
          cx: xPos,
          cy: yPos,
          r: (d) => yScaleCarbs(d.carbInput),
          'stroke-width': 0,
          'class': 'd3-circle-carbs d3-carbs',
          id: function(d) {
            return 'carbs_' + d.id;
          }
        });

      carbs.append('text')
        .text((d) => d.carbInput)
        .attr({
          x: xPos,
          y: yPos,
          'class': 'd3-carbs-text'
        });
    },
    bolus: function(boluses) {
      // delivered amount of bolus
      boluses.append('rect')
        .attr({
          x: (d) => xPosition(commonbolus.getBolus(d)),
          y: (d) => opts.yScale(commonbolus.getDelivered(d)),
          width: (d) => {
            if (bolusToLegend(d) === BolusTypes.micro) {
              return opts.width / 2;
            }
            return opts.width;
          },
          height: (d) => top - opts.yScale(commonbolus.getDelivered(d)),
          'class': (b) => bolusClass(b, 'd3-bolus d3-rect-bolus'),
          id: (d) => `bolus_${commonbolus.getBolus(d)}`,
        });
    },
    undelivered: function(undelivered) {
      // draw color in the undelivered portion
      undelivered.append('rect')
        .attr({
          x: (d) => xPosition(commonbolus.getBolus(d)),
          y: (d) => opts.yScale(commonbolus.getProgrammed(d)),
          width: (d) => {
            if (bolusToLegend(d) === BolusTypes.micro) {
              return opts.width / 2;
            }
            return opts.width;
          },
          height: (b) => {
            const d = commonbolus.getDelivered(b);
            const m = commonbolus.getProgrammed(b);
            return opts.yScale(d) - opts.yScale(m);
          },
          'class': 'd3-rect-undelivered d3-bolus',
          'id': (b) => `${b.type}_undelivered_${b.id}`,
        });
    },
    underride: function(underride) {
      underride.append('polygon')
        .attr({
          x: (d) => xPosition(commonbolus.getBolus(d)),
          y: (d) => opts.yScale(commonbolus.getProgrammed(d)),
          points: function(d) {
            const bolus = commonbolus.getBolus(d);
            return underrideTriangle(xPosition(bolus), opts.yScale(commonbolus.getProgrammed(d)));
          },
          'class': 'd3-polygon-ride d3-bolus',
          id: (d) => `bolus_ride_polygon_${commonbolus.getBolus(d).id}`,
        });
    },
    override: function(override) {
      override.append('polygon')
        .attr({
          x: (d) => xPosition(commonbolus.getBolus(d)),
          y: function(d) {
            return opts.yScale(commonbolus.getRecommended(d)) - opts.markerHeight;
          },
          points: function(d) {
            const bolus = commonbolus.getBolus(d);
            return overrideTriangle(xPosition(bolus), opts.yScale(commonbolus.getRecommended(d)) - opts.markerHeight);
          },
          'class': 'd3-polygon-ride d3-bolus',
          id: (d) => `bolus_override_polygon_${commonbolus.getBolus(d).id}`,
        });
    },
    extended: function(extended) {
      // extended "arm" of square- and dual-wave boluses
      extended.append('path')
        .attr({
          d: function(d) {
            d = commonbolus.getBolus(d);
            var rightEdge = xPosition(d) + opts.width;
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + commonbolus.getMaxDuration(d));
            return 'M' + rightEdge + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-extended d3-bolus',
          id: function(d) {
            d = commonbolus.getBolus(d);
            return 'bolus_' + d.id;
          }
        });

      // triangle
      extended.append('path')
        .attr({
          d: function(d) {
            d = commonbolus.getBolus(d);
            var doseHeight = computePathHeight(d);
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + commonbolus.getMaxDuration(d)) - opts.triangleSize;
            return extendedTriangle(doseEnd, doseHeight);
          },
          'stroke-width': opts.bolusStroke,
          'class': function(d) {
            d = commonbolus.getBolus(d);

            if (d.expectedExtended) {
              return 'd3-path-extended-triangle-suspended d3-bolus';
            }

            return 'd3-path-extended-triangle d3-bolus';
          },
          id: function(d) {
            d = commonbolus.getBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    extendedSuspended: function(suspended) {
      // red marker indicating where suspend happened
      suspended.append('path')
        .attr({
          d: function(d) {
            d = commonbolus.getBolus(d);
            var doseHeight = computePathHeight(d);
            var rightEdge = opts.xScale(Date.parse(d.normalTime) + d.duration);
            var pathEnd = rightEdge + opts.suspendMarkerWidth;

            return 'M' + rightEdge + ' ' + doseHeight + 'L' + pathEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-suspended d3-bolus'
        });

      // now, light-blue path representing undelivered extended bolus
      suspended.append('path')
        .attr({
          d: function(d) {
            d = commonbolus.getBolus(d);
            var doseHeight = computePathHeight(d);
            var pathEnd = opts.xScale(Date.parse(d.normalTime) + d.duration) + opts.suspendMarkerWidth;
            var doseEnd = opts.xScale(Date.parse(d.normalTime) + d.expectedDuration);

            return 'M' + pathEnd + ' ' + doseHeight + 'L' + doseEnd + ' ' + doseHeight;
          },
          'stroke-width': opts.bolusStroke,
          'class': 'd3-path-extended-suspended d3-bolus',
          id: function(d) {
            d = commonbolus.getBolus(d);
            return 'bolus_' + d.id;
          }
        });
    },
    tooltip: {
      add: function(d, rect) {
        if (_.get(opts, 'onBolusHover', false)) {
          opts.onBolusHover({
            data: d,
            rect: rect
          });
        }
      },
      remove: function(d) {
        if (_.get(opts, 'onBolusOut', false)){
          opts.onBolusOut({
            data: d
          });
        }
      }
    },
    annotations: function(data /*, selection */) {
      _.forEach(data, function(d) {
        var annotationOpts = {
          x: opts.xScale(Date.parse(d.normalTime)),
          y: opts.yScale(commonbolus.getMaxValue(d)),
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
