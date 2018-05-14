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

var d3 = require('d3');
var _ = require('lodash');

var log = require('bows')('Two-Week SMBG');
var dt = require('../data/util/datetime');
var format = require('../data/util/format');
var bgBoundaryClass = require('./util/bgboundary');
var { MGDL_UNITS, DEFAULT_BG_BOUNDS } = require('../data/util/constants');

function SMBGTime (opts) {
  var MS_IN_HOUR = 3600000;

  var MS_IN_MIN = 60 * 1000;

  opts = opts || {};

  var defaults = {
    bgUnits: MGDL_UNITS,
    classes: {
      'very-low': { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryLow },
      low: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetLower },
      target: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetUpper },
      high: { boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryHigh },
    },
    size: 16,
    rectWidth: 32,
    timezoneAware: false,
    tooltipPadding: 20
  };

  opts = _.defaults(opts, defaults);

  var getBgBoundaryClass = bgBoundaryClass(opts.classes, opts.bgUnits), mainGroup, poolDaysGroup;

  var pools = [];

  this.draw = function(pool) {
    opts.pool = pool;
    mainGroup = pool.parent();
    // if you don't use poolDaysGroup to subset selection of smbg circles
    // can end up selecting circles in the legend D:
    poolDaysGroup = mainGroup.select('#daysGroup');

    pools.push(pool);

    var smbg = this;
    return function(selection) {
      selection.each(function(currentData) {
        // pool-dependent variables
        var xScale = opts.pool.xScale().copy();
        opts.xScale = xScale;

        var circles = d3.select(this)
          .selectAll('g.d3-smbg-time')
          .data(currentData, function(d) {
            return d.id;
          });

        var circleGroups = circles.enter()
          .append('g')
          .attr('class', 'd3-smbg-time-group');

        circleGroups.append('circle')
          .attr({
            cx: smbg.xPosition,
            cy: smbg.yPosition,
            r: smbg.radius,
            id: smbg.id,
            class: getBgBoundaryClass
          })
          .classed({'d3-smbg-time': true, 'd3-circle-smbg': true})
          .on('dblclick', function(d) {
            d3.event.stopPropagation(); // silence the click-and-drag listener
            opts.emitter.emit('selectSMBG', d.normalTime);
          });

        circleGroups.append('rect')
          .style('display', 'none')
          .attr({
            x: function(d) {
              return smbg.xPosition(d) - opts.rectWidth/2;
            },
            y: 0,
            // text background rect is twice an smbg wide
            width: opts.rectWidth,
            // text background rect is half a pool high
            height: pool.height() / 2,
            'class': 'd3-smbg-numbers d3-rect-smbg d3-smbg-time'
          });

        // NB: cannot do same display: none strategy because dominant-baseline attribute cannot be applied
        circleGroups.append('text')
          .attr({
            x: smbg.xPosition,
            // text is centered vertically in the top half of each day pool (i.e., 1/4 way down)
            y: pool.height() / 4,
            opacity: '0',
            'class': 'd3-smbg-numbers d3-text-smbg d3-smbg-time'
          })
          .text(function(d) {
            return format.tooltipBG(d, opts.bgUnits);
          });

        circles.exit().remove();

        // tooltips
        smbg.bindMouseEvents(selection, circles, pool, mainGroup);
      });
    };
  };

  this.bindMouseEvents = function(selection, circles, pool) {
    var highlight = pool.highlight(circles);
    var smbg = this;
    selection.selectAll('.d3-circle-smbg').on('mouseover', function() {
      highlight.on(d3.select(d3.select(this).node().parentNode));
      smbg.addTooltip(d3.select(this).datum(), pool);
    });
    selection.selectAll('.d3-circle-smbg').on('mouseout', function() {
      highlight.off();
      var id = d3.select(this).attr('id').replace('smbg_time_', 'tooltip_');
      mainGroup.select('#' + id).remove();
    });
  };

  this.showValues = function() {
    var that = this;
    poolDaysGroup.selectAll('.d3-rect-smbg')
      .style('display', 'inline');
    poolDaysGroup.selectAll('.d3-text-smbg')
      .transition()
      .duration(500)
      .attr('opacity', 1);
    poolDaysGroup.selectAll('.d3-circle-smbg')
      .on('mouseover', null)
      .on('mouseout', null)
      .transition()
      .duration(500)
      .attr({
        r: that.radius(true),
        cy: that.yPosition(true)
      });
  };

  this.hideValues = function() {
    var that = this;
    poolDaysGroup.selectAll('.d3-rect-smbg')
      .style('display', 'none');
    poolDaysGroup.selectAll('.d3-text-smbg')
      .transition()
      .duration(500)
      .attr('opacity', 0);
    poolDaysGroup.selectAll('.d3-circle-smbg')
      .transition()
      .duration(500)
      .attr({
        r: that.radius,
        cy: that.yPosition
      });
    for (var i = 0; i < pools.length; ++i) {
      var pool = pools[i];
      var selection = poolDaysGroup.select('#' + pool.id() + '_smbg');
      var circles = selection.selectAll('g.d3-smbg-time');
      that.bindMouseEvents(selection, circles, pool);
    }
  };

  this.xPosition = function(d) {
    var t = d.normalTime;
    if (opts.timezoneAware) {
      t = dt.applyOffset(d.normalTime, d.displayOffset);
    }
    return opts.xScale(dt.getMsFromMidnight(t));
  };

  this.yPosition = function(valuesShown) {
    if (valuesShown === true) {
      // shift circles down (1/3 from bottom of pool) when displaying all smbg values
      return opts.pool.height() * 2 / 3;
    }
    // default is smbgs vertically center within each day's pool
    return opts.pool.height() / 2;
  };

  this.radius = function(valuesShown) {
    if (valuesShown === true) {
      // smaller radius when displaying all smbg values
      return opts.size/3;
    }
    // size is the total diameter of an smbg
    // radius is half that, minus one because of the 1px stroke for open circles
    return opts.size/2 - 1;
  };

  this.id = function(d) {
    return 'smbg_time_' + d.id;
  };

  this.orientation = function(cssClass) {
    if (cssClass.search('d3-bg-high') !== -1) {
      return 'leftAndDown';
    }
    else {
      return 'normal';
    }
  };

  this.tooltipHtml = function(group, datum) {
    var value = format.tooltipBG(datum, opts.bgUnits);

    group.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html('<span class="fromto">at</span> ' + format.timestamp(datum.normalTime, datum.displayOffset));
    group.append('p')
      .attr('class', 'value')
      .append('span')
      .html(datum.tooltipText ? datum.tooltipText : value);
    if (!_.isEmpty(datum.subType)) {
      group.append('p')
        .append('span')
        .attr('class', 'secondary')
        .html(format.capitalize(datum.subType));
    }
  };

  this.addTooltip = function(d, pool) {
    var tooltips = opts.pool.tooltips();
    var getBgBoundaryClass = bgBoundaryClass(opts.classes, opts.bgUnits);
    var cssClass = getBgBoundaryClass(d);
    var smbg = this;
    // can't use a simple select(#daysGroup) because of a Safari bug
    // helpful! https://gist.github.com/enjalot/1473597
    var days = mainGroup.selectAll('#daysGroup')[0][0].childNodes;
    var lastDay = d3.select(days[days.length - 1]);
    var translation = parseInt(lastDay.attr('transform').replace('translate(0,', '').replace(')',''),10);
    var res = tooltips.addForeignObjTooltip({
      cssClass: cssClass,
      datum: d,
      shape: 'smbg',
      xPosition: smbg.xPosition,
      yPosition: function() {
        return smbg.yPosition() + pool.yPosition() - translation;
      }
    });
    var foGroup = res.foGroup;
    this.tooltipHtml(foGroup, d);
    var dims = tooltips.foreignObjDimensions(foGroup);
    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      y: -dims.height,
      orientation: {
        'default': this.orientation(cssClass),
        leftEdge: this.orientation(cssClass) === 'leftAndDown' ? 'rightAndDown': 'normal',
        rightEdge: this.orientation(cssClass) === 'normal' ? 'leftAndUp': 'leftAndDown'
      },
      shape: 'smbg',
      edge: dt.smbgEdge(d.normalTime, d.displayOffset)
    });
  };
}

module.exports = SMBGTime;
