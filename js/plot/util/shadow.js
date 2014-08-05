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

module.exports = function(chart) {
  var defs = chart.append('defs');
  // black drop shadow

  var filter = defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('filterUnits', 'userSpaceOnUse')
      .attr('color-interpolation-filters', 'sRGB');

  var feComponentTransfer = filter.append('feComponentTransfer')
    .attr('in', 'SourceAlpha');

  feComponentTransfer.append('feFuncR')
      .attr('type', 'discrete')
      .attr('tableValues', 0.8);
  feComponentTransfer.append('feFuncG')
      .attr('type', 'discrete')
      .attr('tableValues', 0.8);
  feComponentTransfer.append('feFuncB')
      .attr('type', 'discrete')
      .attr('tableValues', 0.8);

  filter.append('feGaussianBlur')
    .attr('stdDeviation', 1);

  filter.append('feOffset')
      .attr('dx', 1)
      .attr('dy', 0)
      .attr('result', 'shadow');

  filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'shadow')
      .attr('operator', 'over');
};
