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

  this.addFOTooltip = function(opts) {
    opts = opts || {};
    currentTranslation = container.currentTranslation();
    var atLeftEdge = isAtLeftEdge(locationInWindow(opts.xPosition(opts.datum)));
    var atRightEdge = isAtRightEdge(locationInWindow(opts.xPosition(opts.datum)));
    var shape = opts.shape;
    var translation;

    if (shape) {
      var defaultTranslation = 'translate(' + opts.xPosition(opts.datum) + ',' + opts.yPosition(opts.datum) + ')';
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
          width: 200,
          visibility: 'hidden',
          'class': 'svg-tooltip-fo'
        })
        .append('xhtml:div')
        .attr({
          'class': opts.div ? opts.div : 'tooltip-div'
        });
      return {
        foGroup: foGroup,
        edge: atLeftEdge ? 'left': atRightEdge ? 'right': null
      };
    }
  };

  this.anchorFO = function(selection, opts) {
    var shape = opts.shape;
    var atRightEdge = opts.edge === 'right';
    var atLeftEdge = opts.edge === 'left';
    var isDefaultNormal = opts.orientation && opts.orientation['default'] === 'normal';
    var isDefaultLeftNormal = opts.orientation && opts.orientation['default'] === 'leftAndUp';

    if (opts.y) {
      var offsetVal = shapes[shape].offset();
      if (isDefaultNormal || (isDefaultLeftNormal && atLeftEdge)) {
        shapes[shape].offset(selection, {x: offsetVal, y: opts.y - offsetVal});
      }
      else if (atLeftEdge) {
        shapes[shape].offset(selection, {x: offsetVal, y: offsetVal});
      }
      else if (!opts.edge || atRightEdge) {
        var y = isDefaultLeftNormal ? opts.y - offsetVal : offsetVal;
        shapes[shape].offset(selection, {x: -opts.w - offsetVal, y: y});
      }
    }
    if (!shapes[shape].orientations) {
      var widthTranslation = 'translate(' + (-opts.w/2) + ',0)';
      var rightEdgeTranslation = 'translate(' + (-opts.w) + ',0)';
      if (!opts.edge) {
        selection.attr('transform', widthTranslation);
      }
      else if (atRightEdge) {
        selection.attr('transform', rightEdgeTranslation);
      }
    }
    else {
      if (atRightEdge) {
        selection.attr('x', -opts.w - shapes[shape].offset());
      }
    }
    selection.attr({
      width: opts.w,
      height: opts.h,
      visibility: 'visible'
    });
    if (shape) {
      var tooltipGroup = d3.select(selection.node().parentNode);
      _.each(shapes[shape].els, function(el) {
        var attrs = _.clone(el.attrs);
        for (var prop in attrs) {
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
            delete attrs[prop];
            attrs[prop.replace('Fn', '')] = res;
          }
        }
        if (!opts.edge && widthTranslation) {
          attrs.transform = widthTranslation;
        }
        else if (atRightEdge && rightEdgeTranslation) {
          attrs.transform = rightEdgeTranslation;
        }
        tooltipGroup.insert(el.el, '.svg-tooltip-fo')
          .attr(attrs);
      });
    }
  };

  this.foDimensions = function(foGroup) {
    var widths = [];
    var spans = foGroup.selectAll('span')
      .each(function() {
        widths.push(d3.select(this)[0][0].getBoundingClientRect().width);
      });
    var tables = foGroup.selectAll('table')
      .each(function() {
        widths.push(d3.select(this)[0][0].getBoundingClientRect().width);
      });
    var bbox = foGroup[0][0].getBoundingClientRect();
    return {
      width: d3.max(widths),
      height: bbox.height
    };
  };

  this.addTooltip = function(opts) {
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
    pool.nativeTooltips(this);
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