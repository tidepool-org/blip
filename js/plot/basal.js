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

var dt = require('../data/util/datetime');
var format = require('../data/util/format');
var log = require('bows')('Basal');

module.exports = function(pool, opts) {
  opts = opts || {};

  var defaults = {
    opacity: 0.3,
    opacityDelta: 0.1,
    pathStroke: 1.5,
    tooltipPadding: 20
  };

  opts = _.defaults(opts, defaults);

  var mainGroup = pool.parent();

  function getScheduledSuppressed(supp) {
    if (supp.deliveryType === 'scheduled') {
      return supp;
    }
    else if (supp.suppressed) {
      return getScheduledSuppressed(supp.suppressed);
    }
    else {
      return;
    }
  }

  function getUndelivereds(data) {
    var undelivereds = [];

    for (var i = 0; i < data.length; ++i) {
      var d = data[i];
      if (d.suppressed) {
        var scheduled = getScheduledSuppressed(d.suppressed);
        if (scheduled) {
          undelivereds.push(scheduled);
        }
      }
    }
    return undelivereds;
  }

  function basal(selection) {
    opts.xScale = pool.xScale().copy();

    selection.each(function(currentData) {

      basal.addAnnotations(_.filter(currentData, function(d) { return d.annotations; }));

      var basalSegments = d3.select(this)
        .selectAll('.d3-basal-group')
        .data(currentData, function(d) {
          return d.id;
        });

      var basalSegmentGroups = basalSegments.enter()
        .append('g')
        .attr({
          'class': 'd3-basal-group',
          id: function(d) {
            return 'basal_group_' + d.id;
          }
        });

      var nonZero = basalSegmentGroups.filter(function(d) {
        return d.rate !== 0;
      });

      basal.addRectToPool(nonZero);

      // add invisible rects as hover targets for all basals
      basal.addRectToPool(basalSegmentGroups, true);

      var basalPathsGroup = selection.selectAll('.d3-basal-path-group').data(['d3-basal-path-group']);
      basalPathsGroup.enter().append('g').attr('class', 'd3-basal-path-group');
      var paths = basalPathsGroup.selectAll('.d3-basal.d3-path-basal')
        .data(['d3-basal d3-path-basal', 'd3-basal d3-path-basal d3-path-basal-undelivered']);
      paths.enter().append('path').attr({
        'class': function(d) { return d; }
      });

      // d3.selects are OK here because `paths` is a chained selection
      var actualpath = d3.select(paths[0][0]);
      var undeliveredPath = d3.select(paths[0][1]);

      basal.updatePath(actualpath, currentData);

      basal.updatePath(undeliveredPath, getUndelivereds(currentData));

      basalSegments.exit().remove();

      // tooltips
      basalSegmentGroups.on('mouseover', function() {
        basal.addTooltip(d3.select(this).datum());
        d3.select(this).selectAll('.d3-basal.d3-rect-basal')
          .attr('opacity', opts.opacity + opts.opacityDelta);
      });
      basalSegmentGroups.on('mouseout', function() {
        var id = d3.select(this).attr('id').replace('basal_group_', 'tooltip_');
        mainGroup.select('#' + id).remove();
        d3.select(this).selectAll('.d3-basal.d3-rect-basal').attr('opacity', opts.opacity);
      });
    });
  }

  basal.addRectToPool = function(selection, invisible) {
    opts.xScale = pool.xScale().copy();

    var rectClass = invisible ? 'd3-basal d3-basal-invisible' : 'd3-basal d3-rect-basal';

    var heightFn = invisible ? basal.invisibleRectHeight : basal.height;

    var yPosFn = invisible ? basal.invisibleRectYPosition : basal.yPosition;

    selection.append('rect')
      .attr({
        x: basal.xPosition,
        y: yPosFn,
        opacity: opts.opacity,
        width: basal.width,
        height: heightFn,
        'class': rectClass
      });
  };

  basal.updatePath = function(selection, data) {
    opts.xScale = pool.xScale().copy();

    var pathDef = basal.pathData(data);

    if (pathDef !== '') {
      selection.attr({
        d: basal.pathData(data)
      });
    }
  };

  basal.pathData = function(data) {
    opts.xScale = pool.xScale().copy();

    function stringCoords(datum) {
      return basal.xPosition(data[i]) + ',' + basal.pathYPosition(data[i]) + ' ';
    }
    var d = '';
    for (var i = 0; i < data.length; ++i) {
      if (i === 0) {
        // start with a moveto command
        d += 'M' + stringCoords(data[i]);
      }
      else if (data[i].normalTime === data[i - 1].normalEnd) {
        // if segment is contiguous with previous, draw a vertical line connecting their values
        d += 'V' + basal.pathYPosition(data[i]) + ' ';
      }
      // TODO: maybe a robust check for a gap in time here instead of just !==?
      else if (data[i].normalTime !== data[i - 1].normalEnd) {
        // if segment is not contiguous with previous, skip to beginning of segment
        d += 'M' + stringCoords(data[i]);
      }
      // always add a horizontal line corresponding to current segment
      d += 'H' + basal.segmentEndXPosition(data[i]) + ' ';
    }
    return d;
  };

  basal.xPosition = function(d) {
    return opts.xScale(Date.parse(d.normalTime));
  };

  basal.segmentEndXPosition = function(d) {
    return opts.xScale(Date.parse(d.normalEnd));
  };

  basal.tooltipXPosition = function(d) {
    return basal.xPosition(d) + (basal.segmentEndXPosition(d) - basal.xPosition(d))/2;
  };

  basal.yPosition = function(d) {
    return opts.yScale(d.rate);
  };

  basal.pathYPosition = function(d) {
    return opts.yScale(d.rate) - opts.pathStroke/2;
  };

  basal.invisibleRectYPosition = function(d) {
    return 0;
  };

  basal.width = function(d) {
    return opts.xScale(Date.parse(d.normalEnd)) - opts.xScale(Date.parse(d.normalTime));
  };

  basal.height = function(d) {
    return pool.height() - opts.yScale(d.rate);
  };

  basal.invisibleRectHeight = function(d) {
    return pool.height();
  };

  basal.rateString = function(d, cssClass) {
    return format.tooltipValue(d.rate) + ' <span class="' + cssClass + '">u/hr</span>';
  };

  basal.tempPercentage = function(d) {
    if (d.percent != null) {
      return format.percentage(d.percent);
    }
    else {
      return format.tooltipValue(d.rate) + ' <span class="plain">u/hr</span>';
    }
  };

  basal.tooltipHtml = function(group, datum) {
    switch (datum.deliveryType) {
      case 'temp':
        group.append('p')
          .append('span')
          .html('<span class="plain">Temp basal of</span> ' + basal.tempPercentage(datum));
        if (datum.suppressed) {
          group.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html(basal.rateString(getScheduledSuppressed(datum.suppressed), 'secondary') + ' scheduled'); 
        }
        break;
      case 'suspend':
        group.append('p')
          .append('span')
          .html('<span class="plain">Pump suspended</span>');
        if (datum.suppressed) {
          group.append('p')
            .append('span')
            .attr('class', 'secondary')
            .html(basal.rateString(getScheduledSuppressed(datum.suppressed), 'secondary') + ' scheduled'); 
        }
        break;
      default:
        group.append('p')
          .append('span')
          .html(basal.rateString(datum, 'plain'));
    }
    group.append('p')
      .append('span')
      .attr('class', 'secondary')
      .html('<span class="fromto">from</span> ' +
        format.timestamp(datum.normalTime) +
        ' <span class="fromto">to</span> ' +
        format.timestamp(datum.normalEnd));
  };

  basal.addTooltip = function(d) {
    var datum = _.clone(d);
    datum.type = 'basal';
    var tooltips = pool.tooltips();
    var cssClass = (d.deliveryType === 'temp' || d.deliveryType === 'suspend') ? 'd3-basal-undelivered' : '';
    var res = tooltips.addForeignObjTooltip({
      cssClass: cssClass,
      datum: datum,
      shape: 'basal',
      xPosition: basal.tooltipXPosition,
      yPosition: function() { return 0; }
    });
    var foGroup = res.foGroup;
    basal.tooltipHtml(foGroup, d);
    var dims = tooltips.foreignObjDimensions(foGroup);
    // foGroup.node().parentNode is the <foreignObject> itself
    // because foGroup is actually the top-level <xhtml:div> element
    tooltips.anchorForeignObj(d3.select(foGroup.node().parentNode), {
      w: dims.width + opts.tooltipPadding,
      h: dims.height,
      shape: 'basal',
      edge: res.edge
    });
  };

  basal.addAnnotations = function(data) {
    for (var i = 0; i < data.length; ++i) {
      var d = data[i];
      var annotationOpts = {
        x: basal.xPosition(d),
        y: opts.yScale(0),
        xMultiplier: 2,
        yMultiplier: 1,
        orientation: {
          up: true
        },
        d: d
      };
      if (mainGroup.select('#annotation_for_' + d.id)[0][0] == null) {
        mainGroup.select('#tidelineAnnotations_basal')
          .call(pool.annotations(), annotationOpts);
      }
    }
  };

  return basal;
};
