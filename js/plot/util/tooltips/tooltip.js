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

var _ = require('../../../lib/')._;
var d3 = require('../../../lib/').d3;

var shapes = require('./shapes');
var shapeutil = require('../shapeutil');

function Tooltips(container, tooltipsGroup) {

  var id, tooltipGroups = {}, defs = {};

  var HOURS_IN_DAY = 24, EDGE_THRESHOLD = 3;

  var tooltipDefs = tooltipsGroup.append('defs');
  var currentTranslation, width = container.width(), vizWidth = width - container.axisGutter();

  function defineShape(shape, cssClass) {
    // add an SVG <defs> at the root of the tooltipsGroup for later <use>
    var shapeGroup = tooltipDefs.append('g')
      .attr({
        'class': shape.mainClass + ' ' + cssClass,
        id: shape.id + '_' + cssClass,
        viewBox: shape.viewBox
      });
    _.each(shape.els, function(el) {
      shapeGroup.append(el.el)
        .attr(el.attrs);
    });
  }

  function defineLeftEdge() {
    // have to add axisGutter back *after* finding the pixel width of the three-hour span
    // there's probably a better way to do this...
    return vizWidth / HOURS_IN_DAY * EDGE_THRESHOLD + container.axisGutter();
  }

  function defineRightEdge() {
    return width - (vizWidth / HOURS_IN_DAY * EDGE_THRESHOLD);
  }

  function isAtLeftEdge(position) {
    if (position < defineLeftEdge()) {
      return true;
    }
    else {
      return false;
    }
  }

  function isAtRightEdge(position) {
    if (position > defineRightEdge()) {
      return true;
    }
    else {
      return false;
    }
  }

  function locationInWindow(xPosition) {
    return currentTranslation + xPosition;
  }

  this.addTooltip = function(opts) {
    opts = opts || {};
    currentTranslation = container.currentTranslation();
    var atLeftEdge = isAtLeftEdge(locationInWindow(opts.xPosition(opts.datum)));
    var atRightEdge = isAtRightEdge(locationInWindow(opts.xPosition(opts.datum)));

    var shape = opts.shape;
    if (shape) {
      var group = tooltipGroups[shape].append('g')
        .attr({
          id: 'tooltip_' + opts.datum.id,
          'class': 'd3-tooltip d3-' + opts.shape,
          transform: 'translate(' + opts.xPosition(opts.datum) + ',' + opts.yPosition(opts.datum) + ')',
        });
      var tooltipShape = group.append('use')
        .attr({
          x: 0,
          y: 0,
          'xlink:href': '#' + shapes[shape].id + '_' + opts.cssClass
        });
      if (opts.orientation) {
        if (atLeftEdge) {
          shapes[shape].orientations[opts.orientation.leftEdge](tooltipShape);
        }
        else if (atRightEdge) {
          shapes[shape].orientations[opts.orientation.rightEdge](tooltipShape);
        }
        else {
          shapes[shape].orientations[opts.orientation['default']](tooltipShape);
        }
      }
      else {
        shapes[shape].orientations.normal(tooltipShape);
      }
      shapes[shape].addText(group, opts);
    }
  };

  this.addGroup = function(pool, opts) {
    var type = opts.type;
    var poolGroup = container.poolGroup().select('#' + pool.id());
    tooltipGroups[type] = tooltipsGroup.append('g')
      .attr('id', this.id() + '_' + type)
      .attr('transform', poolGroup.attr('transform'));
    pool.nativeTooltips(this);
    _.each(opts.classes, function(cl) {
      if (shapes[type]) {
        defineShape(shapes[type], cl);
        defs[type + '_' + cl] = true;
      }
    });
  };

  // getters & setters
  this.id = function(x) {
    if (!arguments.length) return id;
    id = tooltipsGroup.attr('id');
    return this;
  };
}

module.exports = Tooltips;