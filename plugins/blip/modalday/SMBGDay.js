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
var bgBoundaryClass = tideline.plot.util.bgboundary;
var dt = tideline.data.util.datetime;
var format = tideline.data.util.format;
var tooltips = tideline.plot.util.tooltips.generalized;
var shapes = tideline.plot.util.tooltips.shapes;
var { MGDL_UNITS } = require('../../../js/data/util/constants');

var THREE_HRS = 10800000, NINE_HRS = 75600000;

d3.chart('SMBGDay', {
  initialize: function() {
    var chart = this;

    function getMsPer24(d) {
      return dt.getMsPer24(d.normalTime, chart.timezone());
    }

    var xPositionGrouped = function(d) {
      var msPer24 = getMsPer24(d);
      var binSize = THREE_HRS;
      var thresholds = {
        0: binSize,
        3: binSize * 2,
        6: binSize * 3,
        9: binSize * 4,
        12: binSize * 5,
        15: binSize * 6,
        18: binSize * 7,
        21: binSize * 8
      };
      for (var key in thresholds) {
        var val = thresholds[key];
        if (msPer24 < val) {
          msPer24 = val;
          return chart.xScale()(thresholds[key]-(THREE_HRS/2));
        }
      }
    };

    var xPosition = function(d) {
      var msPer24 = getMsPer24(d);
      return chart.xScale()(msPer24);
    };

    var yPosition = function(d) {
      return chart.yScale()(d.value);
    };

    var tooltipHtml = function(foGroup, d) {
      foGroup.append('p')
        .append('span')
        .attr('class', 'secondary')
        .html(format.dayAndDate(d.normalTime, d.displayOffset));
      foGroup.append('p')
        .append('span')
        .attr('class', 'secondary')
        .html('<span class="fromto">at</span> ' + format.timestamp(d.normalTime, d.displayOffset));
      foGroup.append('p')
        .attr('class', 'value')
        .append('span')
        .html(format.tooltipBG(d, chart.smbgOpts().units));
      if (!_.isEmpty(d.subType)) {
        foGroup.append('p')
          .append('span')
          .attr('class', 'secondary')
          .html(format.capitalize(d.subType));
      }
    };

    var tooltipOrientation = function(d) {
      var cssClass = chart.getBgBoundaryClass(d);
      var high = (cssClass.search('d3-bg-high') !== -1);
      var msPer24 = getMsPer24(d);
      var left = msPer24 <= THREE_HRS;
      var right = msPer24 >= NINE_HRS;
      if (high) {
        if (left) {
          return 'rightAndDown';
        }
        else {
          return 'leftAndDown';
        }
      }
      else {
        if (right) {
          return 'leftAndUp';
        }
        else {
          return 'normal';
        }
      }
    };

    var createTooltip = function(d) {
      chart.base.select('.smbgPath').attr('visibility', 'visible');
      var day = chart.base.attr('class').replace('modalDay ', '');
      var tooltip = tooltips.add(d, {
        group: d3.select('#modalHighlightGroup'),
        classes: ['svg-tooltip-smbg', day],
        orientation: tooltipOrientation(d),
        translation: 'translate(' + (chart.grouped() ? xPositionGrouped(d) : xPosition(d)) + ',' + yPosition(d) + ')'
      });
      tooltipHtml(tooltip.foGroup, d);
      tooltip.anchor();
      tooltip.makeShape();
    };

    var removeTooltip = function(d) {
      chart.base.select('.smbgPath').attr('visibility', chart.showingLines() ? 'visible': 'hidden');
      tooltips.remove(d);
    };

    this.layer('smbgInvisibleLines', this.base.append('g').attr('class', 'smbgInvisibleLines'), {
      dataBind: function(data) {
        var xFn = chart.grouped() ? xPositionGrouped : xPosition;
        var pathData = [];
        // only draw a line if there are at least three datapoints
        if (data.length > 2) {
          pathData = _.map(_.sortBy(data, function(d) { return d.normalTime; }), function(d) {
            return [
              xFn(d),
              yPosition(d)
            ];
          });
        }
        return this.selectAll('path')
          .data([pathData]);
      },
      insert: function() {
        return this.append('path')
          .attr({
            fill: 'none',
            'stroke-width': 8,
            opacity: 0
          });
      },
      events: {
        merge: function() {
          var line = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .interpolate('linear');
          this.attr({
            d: function(d) {
              var byX = _.groupBy(d, function(p) { return p[0]; });
              function reduceSameX(sum, num) {
                return sum + num[1];
              }
              for (var key in byX) {
                var haveSameX = byX[key].length;
                if (haveSameX > 1) {
                  var newPoint = [parseFloat(key)];
                  newPoint.push(_.reduce(byX[key], reduceSameX, 0)/haveSameX);
                  byX[key] = [newPoint];
                }
              }
              d = _.map(Object.keys(byX), function(key) { return byX[key][0]; });
              return line(d);
            },
            visibility: chart.showingLines() ? 'visible': 'hidden'
          });
        },
        exit: function() {
          this.remove();
        }
      }
    });

    this.layer('smbgLines', this.base.append('g').attr('class', 'smbgLines'), {
      dataBind: function(data) {
        var xFn = chart.grouped() ? xPositionGrouped : xPosition;
        var pathData = [];
        // only draw a line if there are at least three datapoints
        if (data.length > 2) {
          pathData = _.map(_.sortBy(data, function(d) { return d.normalTime; }), function(d) {
            return [
              xFn(d),
              yPosition(d)
            ];
          });
        }
        return this.selectAll('path')
          .data([pathData]);
      },
      insert: function() {
        return this.append('path')
          .attr({
            'class': 'smbgPath',
            'stroke-width': chart.smbgOpts().stroke
          });
      },
      events: {
        merge: function() {
          var line = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; })
            .interpolate('linear');
          this.attr({
            d: function(d) {
              var byX = _.groupBy(d, function(p) { return p[0]; });
              function reduceSameX(sum, num) {
                return sum + num[1];
              }
              for (var key in byX) {
                var haveSameX = byX[key].length;
                if (haveSameX > 1) {
                  var newPoint = [parseFloat(key)];
                  newPoint.push(_.reduce(byX[key], reduceSameX, 0)/haveSameX);
                  byX[key] = [newPoint];
                }
              }
              d = _.map(Object.keys(byX), function(key) { return byX[key][0]; });
              return line(d);
            },
            visibility: chart.showingLines() ? 'visible': 'hidden'
          });
        },
        exit: function() {
          this.remove();
        }
      }
    });

    this.layer('smbgCircles', this.base.append('g').attr('class', 'smbgCircles'), {
      dataBind: function(data) {
        return this.selectAll('circle')
          .data(data, function(d) { return d.id; });
      },
      insert: function() {
        return this.append('circle')
          .attr('class', 'smbgCircle');
      },
      events: {
        enter: function() {
          var grouped = chart.grouped();
          this.attr({
            cy: yPosition,
            r: chart.smbgOpts().r
          });
        },
        'merge:transition': function() {
          this.attr({
            cx: chart.grouped() ? xPositionGrouped : xPosition
          });
        },
        merge: function() {
          var grouped = chart.grouped();
          this.on('mouseover', createTooltip)
            .on('mouseout', removeTooltip);
        },
        exit: function() {
          this.remove();
        }
      }
    });
  },
  bgClasses: function(bgClasses, bgUnits) {
    if (!arguments.length) { return this._bgClasses; }
    this._bgClasses = bgClasses;
    this.getBgBoundaryClass = bgBoundaryClass(bgClasses, bgUnits);
    return this;
  },
  grouped: function(grouped) {
    if (!arguments.length) { return this._grouped; }
    this._grouped = grouped;
    return this;
  },
  showingLines: function(showingLines) {
    if (!arguments.length) { return this._showingLines; }
    this._showingLines = showingLines;
    return this;
  },
  smbgOpts: function(smbgOpts) {
    if (!arguments.length) { return this._smbgOpts; }
    this._smbgOpts = smbgOpts;
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

module.exports = function() {
  var chart;

  return {
    create: function(el, scales, opts) {
      opts = opts || {};
      var defaults = {
        smbg: {
          r: 5,
          stroke: 1,
          units: MGDL_UNITS
        }
      };
      _.defaults(opts, defaults);

      chart = d3.select(el)
        .chart('SMBGDay')
        .bgClasses(opts.bgClasses, opts.smbg.units)
        .smbgOpts(opts.smbg)
        .timezone(opts.timezone)
        .xScale(scales.x)
        .yScale(scales.y);

      return this;
    },
    render: function(data, opts) {
      opts = opts || {};
      var defaults = {
        grouped: false,
        showingLines: true
      };
      _.defaults(opts, defaults);

      chart.grouped(opts.grouped)
        .showingLines(opts.showingLines)
        .draw(data);

      return this;
    }
  };
};
