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

var shapeutil = require('../shapeutil');
var log = require('bows')('AnnotationShapes');

var shapes = {
  tooltipPolygon: function(opts) {
      opts = opts || {};
      if (!((opts.w != null) && (opts.h != null) && (opts.t != null) && (opts.k != null))) {
        log('Sorry, I need w, h, t, and k variables to generate a tooltip polygon.');
      }

      var w = opts.w, h = opts.h, t = opts.t, k = opts.k;

      return shapeutil.pointString(0,0) +
        shapeutil.pointString((t/2), k) +
        shapeutil.pointString((w-(3/2*t)), k) +
        shapeutil.pointString((w-(3/2*t)), (k+h)) +
        shapeutil.pointString((0-(3/2*t)), (k+h)) +
        shapeutil.pointString((0-(3/2*t)), k) +
        shapeutil.pointString((0-(t/2)), k) + '0,0';
    }
};

module.exports = shapes;