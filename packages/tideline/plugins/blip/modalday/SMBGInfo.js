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

window.d3 = window.d3 || require('d3/d3.min.js');
window.d3.chart = window.d3.chart || require('d3.chart/d3.chart.min.js');

var _ = require('lodash');
var d3 = window.d3;

var tideline = require('../../../js/index');
var dt = tideline.data.util.datetime;
var format = tideline.data.util.format;
var { MGDL_UNITS } = require('../../../js/data/util/constants');

d3.chart('SMBGInfo', {
  initialize: function() {
    var chart = this;

    var xPosition = function(d) {
      var msPer24Pos = dt.getMsPer24(d.normalTime, chart.timezone());
      return chart.xScale()(msPer24Pos);
    };

    var yPosition = function(d) {
      return chart.yScale()(d.value);
    };

    this.layer('smbgInfo', this.base.append('g').attr('class', 'smbgInfo'), {
      dataBind: function(data) {
        return this.selectAll('g')
          .data(data, function(d) { return d.id; });
      },
      insert: function() {
        return this.append('g').attr('class', 'smbgInfoGroup');
      },
      events: {
        enter: function() {
          var rectOpts = chart.opts().infoRects;
          var toEnter = this;
          toEnter.append('rect')
            .attr({
              x: function(d) {
                return xPosition(d) - rectOpts.width/2;
              },
              y: function(d) {
                return yPosition(d) + rectOpts.height/2;
              },
              width: rectOpts.width,
              height: rectOpts.height
            });
          toEnter.append('text')
            .attr({
              x: xPosition,
              y: function(d) {
                return yPosition(d) + chart.opts().textShift.y;
              }
            })
            .text(function(d) { return format.tooltipBG(d, chart.bgUnits()); });
        }
      }
    });
  },
  bgUnits: function(bgUnits) {
    if (!arguments.length) { return this._bgUnits; }
    this._bgUnits = bgUnits;
    return this;
  },
  opts: function(opts) {
    if (!arguments.length) { return this._opts; }
    this._opts = opts;
    return this;
  },
  timezone: function(timezone) {
    if (!arguments.length) { return this._timezone; }
    this._timezone = timezone;
    return this;
  },
  xScale: function(xScale) {
    if (!arguments.length) { return this._xScale; }
    this._xScale = xScale;
    return this;
  },
  yScale: function(yScale) {
    if (!arguments.length) { return this._yScale; }
    this._yScale = yScale;
    return this;
  }
});

var chart;

module.exports = {
  create: function(el, scales, opts) {
    opts = opts || {};
    var defaults = {
      bgUnits: MGDL_UNITS,
      opts: {
        infoRects: {
          height: 20,
          width: 30
        },
        textShift: {
          y: 25
        }
      }
    };
    _.defaults(opts, defaults);

    chart = d3.select(el)
      .chart('SMBGInfo')
      .bgUnits(opts.bgUnits)
      .opts(opts.opts)
      .timezone(opts.timezone)
      .xScale(scales.x)
      .yScale(scales.y);

    return this;
  },
  render: function(data, opts) {
    opts = opts || {};
    var defaults = {};
    _.defaults(opts, defaults);

    chart.draw(data);

    return this;
  }
};
