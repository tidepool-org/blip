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

// Usage:
// node munge-basals.js | json > result.json
var _ = require('../js/lib/underscore');
var BolusUtil = require('../js/data/bolusutil');

var filename = process.argv[2];

var data = require(filename);

var b = new BolusUtil(_.where(data, {'type': 'bolus'}));

var start = new Date("2014-02-14T00:00:00");
var end = new Date("2014-02-15T00:00:00");

console.log(b.totalBolus(start, end));