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

var fixtures = [ ];

fixtures.push({'name': 'template', 'json': require('./basal-template')});
fixtures.push({'name': 'contained', 'json': require('./basal-contained')});
fixtures.push({'name': 'temp-start', 'json': require('./basal-temp-start')});
fixtures.push({'name': 'temp-end', 'json': require('./basal-temp-end')});
fixtures.push({'name': 'two-scheduled', 'json': require('./basal-temp-two-scheduled')});
fixtures.push({'name': 'many-scheduled', 'json': require('./basal-temp-many-scheduled')});
fixtures.push({'name': 'both-ends', 'json': require('./basal-temp-both-ends')});
fixtures.push({'name': 'overlapping', 'json': require('./basal-overlapping')});
fixtures.push({'name': 'temp-final', 'json': require('./basal-temp-final')});
fixtures.push({'name': 'current-demo', 'json': require('../../example/data/device-data')});
module.exports = fixtures;