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

fixtures.push({'name': 'template', 'json': require('./basal-template.json')});
fixtures.push({'name': 'contained', 'json': require('./basal-contained.json')});
fixtures.push({'name': 'temp-start', 'json': require('./basal-temp-start.json')});
fixtures.push({'name': 'temp-end', 'json': require('./basal-temp-end.json')});
fixtures.push({'name': 'two-scheduled', 'json': require('./basal-temp-two-scheduled.json')});
fixtures.push({'name': 'many-scheduled', 'json': require('./basal-temp-many-scheduled.json')});
fixtures.push({'name': 'both-ends', 'json': require('./basal-temp-both-ends.json')});
fixtures.push({'name': 'overlapping', 'json': require('./basal-overlapping.json')});
fixtures.push({'name': 'temp-final', 'json': require('./basal-temp-final.json')});
fixtures.push({'name': 'gap', 'json': require('./basal-gap.json')});
fixtures.push({'name': 'two-days', 'json': require('./basal-two-days.json')});
fixtures.push({'name': 'current-demo', 'json': require('../../example/data/device-data.json')});
// fixtures.push({'name': 'blip-output', 'json': require('../../example/data/blip-output.json')});
module.exports = fixtures;
