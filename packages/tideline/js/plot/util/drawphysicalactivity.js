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

var dt = require('../../data/util/datetime');

var picto = require('../../../img/physicalactivity.png');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {
    width: 12,
    r: 14,
    suspendMarkerWidth: 5,
    markerHeight: 2,
    triangleHeight: 4,
    triangleOffset: 4,
    triangleSize: 6,
    timezoneAware: false,
    tooltipHeightAddition: 3,
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

  var height = pool.height() - 20;

  var calculateWidth = function(d) {
    var s = Date.parse(d.normalTime);
    var units = d.duration.units;
    var msfactor = 1000;
    switch (units) {
      case 'seconds':
        msfactor = msfactor;
        break;
      case 'minutes': 
        msfactor = msfactor * 60;
        break;
      case 'hours':
        msfactor = msfactor * 60 * 60;
        break;
      default:
        msfactor = msfactor;
        break;
    }
    var e = Date.parse(dt.addDuration(s, d.duration.value * msfactor)); 
    return opts.xScale(e) - opts.xScale(s);
  };

  var xPosition = function(d) {
    var x = opts.xScale(Date.parse(d.normalTime));
    return x;
  };

  var offset = height / 5;

  return {

    picto: function(pa) {
      pa.append('rect')
        .attr({
          x: function(d) {
            return xPosition(d);
          },
          y: function(d) {
            return 0;
          },
          width: function(d) {
            return calculateWidth(d);
          }, 
          height: function() {
            return offset;
          },
          class: 'd3-rect-pa d3-pa',
          id: function(d) {
            return 'pa_' + d.id;
          }
        });
      pa.append('image')
        .attr({
          x: function(d) {
            return xPosition(d);
          },
          y: function(d) {
            return 0;
          },
          width: function(d) {
            return calculateWidth(d);
          }, 
          height: function() {
            return offset;
          },
          'xlink:href' : picto,
        });

    },
    activity: function(pa) {
      pa.append('rect')
        .attr({
          x: function(d) {
            return xPosition(d);
          },
          y: function(d) {
            return offset;
          },
          width: function(d) {
            return calculateWidth(d);
          }, 
          height: function() {
            return pool.height() - offset;
          },
          class: 'd3-rect-pa d3-pa',
          id: function(d) {
            return 'pa_' + d.id;
          }
        });
    },
    tooltip: {
      add: function(d, rect) {
        if (_.get(opts, 'onPhysicalHover', false)) {
          opts.onPhysicalHover({
            data: d, 
            rect: rect
          });
        }
      },
      remove: function(d) {
        if (_.get(opts, 'onPhysicalOut', false)){
          opts.onPhysicalOut({
            data: d
          });
        }
      }
    },
  };
};
