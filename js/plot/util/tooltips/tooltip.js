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

var _ = require('lodash');
var d3 = require('d3');

var shapes = require('./shapes');
var shapeutil = require('../shapeutil');

function Tooltips(container, tooltipsGroup) {

  var id, tooltipGroups = {}, defs = {};

  var HOURS_IN_DAY = 24, EDGE_THRESHOLD = 5;

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

  this.addForeignObjTooltip = function(opts) {
    opts = opts || {};
    currentTranslation = container.currentTranslation();
    var atLeftEdge = isAtLeftEdge(locationInWindow(opts.xPosition(opts.datum)));
    var atRightEdge = isAtRightEdge(locationInWindow(opts.xPosition(opts.datum)));
    var shape = opts.shape;
    var translation;

    if (shape) {
      var defaultTranslation = 'translate(' + opts.xPosition(opts.datum) +
        ',' + opts.yPosition(opts.datum) + ')';
      // applies to shapes without orientation (e.g., basal)
      if (!shapes[shape].orientations) {
        if (atLeftEdge) {
          translation = 'translate(' + (-currentTranslation + container.axisGutter() + shapes[shape].extensions.left) + ',' + opts.yPosition(opts.datum) + ')';
        }
        else if (atRightEdge) {
          translation = 'translate(' + (-currentTranslation + width - shapes[shape].extensions.right) + ',' + opts.yPosition(opts.datum) + ')';
        }
        else {
          translation = defaultTranslation;
        }
      }
      // applies to shapes with orientation
      else {
        translation = defaultTranslation;
      }
      var group = tooltipGroups[opts.datum.type].append('g')
        .attr({
          id: 'tooltip_' + opts.datum.id,
          'class': 'd3-tooltip d3-' + opts.datum.type + ' ' + shapes[shape].mainClass + ' ' + opts.cssClass,
          transform: translation
        });
      var foGroup = group.append('foreignObject')
        .attr({
          // need to set an initial width to give the HTML something to shape itself in relation to
          width: 200,
          // hide the foreignObject initially so that the resizing isn't visible
          visibility: 'hidden',
          'class': 'svg-tooltip-fo'
        })
        .append('xhtml:div')
        .attr({
          // bolus(/wizard) tooltips use completely different CSS
          // with a different main div class passed as an opt
          'class': opts.div ? opts.div : 'tooltip-div'
        });
      return {
        foGroup: foGroup,
        edge: atLeftEdge ? 'left': atRightEdge ? 'right': null
      };
    }
  };

  this.anchorForeignObjNoOrienation = function(selection, opts) {
    // applies to shapes without orientation (e.g., basal)
    var atRightEdge = opts.edge === 'right';
    opts.widthTranslation = 'translate(' + (-opts.w/2) + ',0)';
    opts.rightEdgeTranslation = 'translate(' + (-opts.w) + ',0)';
    if (!opts.edge) {
      selection.attr('transform', opts.widthTranslation);
    }
    else if (atRightEdge) {
      selection.attr('transform', opts.rightEdgeTranslation);
    }
    // no need for an else if atLeftEdge because translation at left edge
    // would just be zero, which has the same effect as no translation
    this.setForeignObjDimensions(selection, opts);
    this.makeShape(selection, opts);
  };

  this.makeShape = function(selection, opts) {
    var shape = opts.shape;
    var atRightEdge = opts.edge === 'right';
    var atLeftEdge = opts.edge === 'left';
    var tooltipGroup = d3.select(selection.node().parentNode);
    _.each(shapes[shape].els, function(el) {
      var attrs = _.clone(el.attrs);
      for (var prop in attrs) {
        // polygons have a pointsFn to generate the proper size polygon given the input dimensions
        if (typeof attrs[prop] === 'function') {
          var res = attrs[prop](opts);
          if (shapes[shape].orientations) {
            if (atRightEdge) {
              res = shapes[shape].orientations[opts.orientation.rightEdge](res);
            }
            else if (atLeftEdge) {
              res = shapes[shape].orientations[opts.orientation.leftEdge](res);
            }
            else {
              res = shapes[shape].orientations[opts.orientation['default']](res);
            }
          }
          // pointsFn isn't a proper SVG attribute, of course, so must be deleted
          delete attrs[prop];
          attrs[prop.replace('Fn', '')] = res;
        }
      }
      // this if/else block applies to shapes without orientation (e.g., basal)
      if (!opts.edge && opts.widthTranslation) {
        attrs.transform = opts.widthTranslation;
      }
      else if (atRightEdge && opts.rightEdgeTranslation) {
        attrs.transform = opts.rightEdgeTranslation;
      }
      tooltipGroup.insert(el.el, '.svg-tooltip-fo')
        .attr(attrs);
    });
  };

  this.setForeignObjDimensions = function(selection, opts) {
    selection.attr({
      width: opts.w,
      height: opts.h,
      visibility: 'visible'
    });
  };

  this.anchorForeignObj = function(selection, opts) {
    var shape = opts.shape;
    // if the tooltip doesn't come in multiple orientations (e.g., basal tooltip)
    // then use a different anchor method
    if (!shapes[shape].orientations) {
      this.anchorForeignObjNoOrienation(selection, opts);
      return;
    }
    var atRightEdge = opts.edge === 'right';
    var atLeftEdge = opts.edge === 'left';
    var thisOrientation = !(atLeftEdge || atRightEdge) ? 'default' : atLeftEdge ? 'leftEdge' : 'rightEdge';
    // isDefaultNormal catches low and target smbg tooltips
    // (but not high, which default to down orientations)
    var isDefaultNormal = opts.orientation && opts.orientation['default'] === 'normal';
    // isDefaultLeftNormal catches bolus(/wizard) tooltips
    var isDefaultLeftNormal = opts.orientation && opts.orientation['default'] === 'leftAndUp';

    // moving the foreign object into place depending on orientation
    // see wiki page (https://github.com/tidepool-org/tideline/wiki/SVGTooltips) for definition of offset
    if (opts.y) {
      var offsetValX = shapes[shape].offset();
      var offsetValY = (shapes[shape].offsetY) ? shapes[shape].offsetY() : offsetValX;

      if (isDefaultNormal || (isDefaultLeftNormal && atLeftEdge)) {
        shapes[shape].offset(selection, {x: offsetValX, y: opts.y - offsetValY});
      }
      else if (atLeftEdge) {
        shapes[shape].offset(selection, {x: offsetValX, y: offsetValY});
      }
      else if ((!opts.edge) || atRightEdge) {
        var y = isDefaultLeftNormal ? opts.y - offsetValY : offsetValY;
        shapes[shape].offset(selection, {x: -opts.w - offsetValX, y: y});
      }
    }
    // isDefaultNormal tooltips get caught in the first `if` above
    // so we need an additional if to shift them when atRightEdge
    if (atRightEdge) {
      selection.attr('x', -opts.w - shapes[shape].offset());
    }
    this.setForeignObjDimensions(selection, opts);
    if (shape) {
      this.makeShape(selection, opts);
    }
  };

  this.foreignObjDimensions = function(foGroup) {
    // when content is centered, can't use getBoundingClientRect to get width on div
    // need to get it on components instead, and use widest one
    var widths = [];
    foGroup.selectAll('span')
      .each(function() {
        widths.push(d3.select(this)[0][0].getBoundingClientRect().width);
      });
    foGroup.selectAll('table')
      .each(function() {
        widths.push(d3.select(this)[0][0].getBoundingClientRect().width);
      });
    foGroup.selectAll('div.title.wider')
      .each(function() {
        widths.push(d3.select(this)[0][0].getBoundingClientRect().width - 20);
      });
    return {
      width: d3.max(widths),
      // getBoundingClientRect returns a larger height than the div
      // not sure why, but offsetHeight is perfect
      height: foGroup[0][0].offsetHeight
    };
  };

  this.addFixedTooltip = function(opts) {
    opts = opts || {};
    currentTranslation = container.currentTranslation();
    var atLeftEdge = isAtLeftEdge(locationInWindow(opts.xPosition(opts.datum)));
    var atRightEdge = isAtRightEdge(locationInWindow(opts.xPosition(opts.datum)));

    var shape = opts.shape;
    if (shape) {
      var group = tooltipGroups[opts.datum.type].append('g')
        .attr({
          id: 'tooltip_' + opts.datum.id,
          'class': 'd3-tooltip d3-' + opts.datum.type,
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
      if (shapes[shape].addText) {
        shapes[shape].addText(group, opts);
      }
    }
  };

  this.addGroup = function(pool, opts) {
    var type = opts.type, shape;
    if (opts.shape) {
      shape = opts.shape;
    }
    else {
      shape = type;
    }
    var poolGroup = container.poolGroup().select('#' + pool.id());
    tooltipGroups[type] = tooltipsGroup.append('g')
      .attr('id', this.id() + '_' + type)
      .attr('transform', poolGroup.attr('transform'));
    pool.tooltips(this);
    if (shapes[shape].fixed) {
      _.each(opts.classes, function(cl) {
        if (shapes[shape]) {
          defineShape(shapes[shape], cl);
          defs[type + '_' + cl] = true;
        }
      });
    }
  };

  // getters & setters
  this.id = function(x) {
    if (!arguments.length) return id;
    id = tooltipsGroup.attr('id');
    return this;
  };
}

module.exports = Tooltips;