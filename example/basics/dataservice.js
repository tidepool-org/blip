/** @jsx React.DOM */
/* 
 * == BSD2 LICENSE ==
 * Copyright (c) 2015 Tidepool Project
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
var crossfilter = require('crossfilter');

var sundial = require('sundial');

module.exports = function(data) {
	var basicsTypes = ['basal', 'bolus', 'cbg', 'smbg', 'deviceMeta'];

	var grouped = _.groupBy(data, 'type');

	function getLocalDate(d) {
		return sundial.applyOffset(d.time, d.timezoneOffset).toISOString().slice(0,10);
	}

	for (var key in grouped) {
		if (!_.includes(basicsTypes, key)) {
			delete grouped[key];
		}
		else {
			var groupData = grouped[key];
			grouped[key] = {};
			grouped[key].cf = crossfilter(groupData);
			grouped[key].byLocalDate = grouped[key].cf.dimension(getLocalDate);
			grouped[key].countByDate = grouped[key].byLocalDate.group().reduceCount().top(Infinity);
		}
	}

	return grouped;
};
