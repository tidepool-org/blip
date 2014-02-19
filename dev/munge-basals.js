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
// node munge-basals.js <path-to-file> | json > output.json

var BasalUtil = require('../js/data/basalutil');

var filename = process.argv[2];

var data = require(filename);

var b = new BasalUtil(data);

console.log(JSON.stringify({
    'actual': b.actual,
    'undelivered': b.undelivered
}));