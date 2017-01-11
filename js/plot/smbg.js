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

var log = require('bows')('SMBG');
var format = require('../data/util/format');
var scales = require('./util/scales')();
var bgBoundaryClass = require('./util/bgboundary');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {
    bgUnits: 'mg/dL',
    classes: {
      'very-low': { boundary: 55 },
      low: { boundary: 70 },
      target: { boundary: 180 },
      high: { boundary: 300 },
    },
    size: 16,
    timezoneAware: false,
    tooltipPadding: 20
  };

  _.defaults(opts, defaults);

  var mainGroup = pool.parent();
  var getBgBoundaryClass = bgBoundaryClass(opts.classes);

  function smbg(selection) {
    opts.xScale = pool.xScale().copy();
    selection.each(function(currentData) {

      smbg.addAnnotations(_.filter(currentData, function(d) { return d.annotations; }));

      var circles = d3.select(this)
        .selectAll('circle.d3-smbg')
        .data(currentData, function(d) {
          return d.id;
        });
      circles.enter()
        .append('circle')
        .attr({
          cx: smbg.xPosition,
          cy: smbg.yPosition,
          r: smbg.radius,
          id: smbg.id,
          'class': getBgBoundaryClass
        })
        .classed({'d3-smbg': true, 'd3-circle-smbg': true});

      circles.exit().remove();

      var highlight = pool.highlight(circles);

      // tooltips
      selection.selectAll('.d3-circle-smbg').on('mouseover', function() {
        highlight.on(d3.select(this));
        smbg.addTooltip(d3.select(this).datum());
      });
      selection.selectAll('.d3-circle-smbg').on('mouseout', function() {
        highlight.off();
        var id = d3.select(this).attr('id').replace('smbg_', 'tooltip_');
        mainGroup.select('#' + id).remove();
      });
    });
  }

  smbg.radius = function() {
    // size is the total diameter of an smbg
    // radius is half that, minus one because of the 1px stroke for open circles
    return opts.size/2 - 1;
  };

  smbg.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  smbg.yPosition = function(d) {
    return opts.yScale(d.value);
  };

  smbg.id = function(d) {
    return 'smbg_' + d.id;
  };

  smbg.orientation = function(cssClass) {
    if (cssClass.search('d3-bg-high') !== -1) {
      return 'leftAndDown';
    }
    else {
      return 'normal';
    }
  };

  smbg.tooltipHtml = function(group, datum) {
    group.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html('<span class="fromto">at</span> ' + format.timestamp(datum.normalTime, datum.displayOffset));
    group.append('p')
      .attr('class', 'value')
      .append('span')
      .html(format.tooltipBG(datum, opts.bgUnits));
    if (!_.isEmpty(datum.subType)) {
      group.append('p')
        .append('span')
        .attr('class', 'secondary')
        .html(format.capitalize(datum.subType));
    }
  };

  smbg.addTooltip = function(d) {
    var tooltips = pool.tooltips();
    var getBgBoundaryClass = bgBoundaryClass(opts.classes);
    var cssClass = getBgBoundaryClass(d);
    var res = tooltips.addForeignObjTooltip({
      cssClass: cssClass,
      datum: d,
      shape: 'smbg',
      xPosition: smbg.xPosition,
      yPosition: smbg.yPosition
    });
    var foGroup = res.foGroup;
    smbg.tooltipHtml(foGroup, d);
    var dims = tooltips.foreignObjDimensions(foGroup);
    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      y: -dims.height,
      orientation: {
        'default': smbg.orientation(cssClass),
        leftEdge: smbg.orientation(cssClass) === 'leftAndDown' ? 'rightAndDown': 'normal',
        rightEdge: smbg.orientation(cssClass) === 'normal' ? 'leftAndUp': 'leftAndDown'
      },
      shape: 'smbg',
      edge: res.edge
    });
  };

  smbg.addAnnotations = function(data) {
    for (var i = 0; i < data.length; ++i) {
      var d = data[i];
      var annotationOpts = {
        x: smbg.xPosition(d),
        y: opts.yScale(d.value),
        xMultiplier: 0,
        yMultiplier: 2,
        orientation: {
          down: true
        },
        d: d
      };
      if (mainGroup.select('#annotation_for_' + d.id)[0][0] == null) {
        mainGroup.select('#tidelineAnnotations_smbg')
          .call(pool.annotations(), annotationOpts);
      }
    }
  };

  return smbg;
};
