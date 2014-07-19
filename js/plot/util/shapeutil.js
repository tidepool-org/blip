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

var d3 = require('../../lib/').d3;
var _ = require('../../lib/')._;

var log = require('../../lib/').bows('ShapeUtil');

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
    str.split(' ');
    return {x: str[2], y: str[3]};
  },
  translateRight: function(group) {
    // this time not getting transform first
    // because translation needs to apply first, so this method
    // will always reset transform
    var coords = this.getViewBoxCoords(group.attr('viewBox'));
    return group.attr('transform', 'translate(' + coords.x + ',0)');
  },
  translateDown: function(group) {
    // again not getting transform first
    // because translation needs to apply first, so this method
    // will always reset transform
    var coords = this.getViewBoxCoords(group.attr('viewBox'));
    return group.attr('transform', 'translate(0,' + coords.y + ')');
  }
};

module.exports = shapeutil;