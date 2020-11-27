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

var log = require('bows')('ShapeUtil');

var shapeutil = {
  // for polygons
  mirrorImageY: function(pointsString) {
    var points = pointsString.split(' ');
    points = _.map(points, function(point) {
      var values = point.split(',');
      var x = parseInt(values[0], 10);
      return -x + ',' + values[1] + ' ';
    });
    return _.reduce(points, function(x,y) { return x + y; }).trim();
  },
  mirrorImageX: function(pointsString) {
    var points = pointsString.split(' ');
    points = _.map(points, function(point) {
      var values = point.split(',');
      var y = parseInt(values[1], 10);
      return values[0] + ',' + -y + ' ';
    });
    return _.reduce(points, function(x,y) { return x + y; }).trim();
  },
  // for paths
  pathMirrorY: function(group) {
    var transform = group.attr('transform');
    return group.attr('transform', transform + ' scale(-1,1)');
  },
  pathMirrorX: function(group) {
    var transform = group.attr('transform');
    return group.attr('transform', transform + ' scale(1,-1)');
  },
  getViewBoxCoords: function(str) {
    var a = str.split(' ');
    return {x: a[2], y: a[3]};
  },
  pointString: function(x,y) {
    return x + ',' + y + ' ';
  },
  translationFromViewBox: function(group, opts) {
    var def = group.attr('xlink:href');
    var coords = this.getViewBoxCoords(d3.select(def).attr('viewBox'));
    var x, y;
    switch(opts.horizontal) {
      case 'left':
        x = -coords.x;
        break;
      case 'right':
        x = coords.x;
        break;
      default:
        x = 0;
    }
    switch(opts.vertical) {
      case 'up':
        y = -coords.y;
        break;
      case 'down':
        y = coords.y;
        break;
      default:
        y = 0;
    }
    return group.attr('transform', 'translate(' + x + ',' + y + ')');
  }
};

module.exports = shapeutil;