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

var datetime = {};

datetime.applyOffsetToDate = function(d, offset) {
  var date = new Date(d);
  date.setUTCMinutes(date.getUTCMinutes() + offset);
  return new Date(date).toISOString();
};

datetime.formatDate = function(d) {
  return d3.time.format('%Y-%m-%dT%H:%M:%S.%LZ').parse(
      this.applyOffsetToDate(d.time, d.timezoneOffset)
    );
};

datetime.formatDateLabel = d3.time.format('%a %e');

datetime.formatHours = function(d) {
  var hours = d.getHours();
  if (hours === 0)
    return '12a';
  if (hours < 12)
    return hours + 'a';
  if (hours === 12)
    return '12p';
  return (hours - 12) + 'p';
};

module.exports = datetime;