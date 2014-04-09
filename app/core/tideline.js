/**
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
 */

// Expose Tideline library on global `window` object
// Deprecate when Tideline introduces a distribution bundle

var _ = window._;
var bows = window.bows;

var tideline = require('../../bower_components/tideline/js');
window.tideline = tideline;

tideline.watson = require('../../bower_components/tideline/plugins/data/watson');
window.tideline.watson = tideline.watson;

tideline.preprocess = require('../../bower_components/tideline/plugins/data/preprocess');
window.tideline.preprocess = tideline.preprocess;

tideline.blip = require('../../bower_components/tideline/plugins/blip');
window.tideline.blip = tideline.blip;

module.exports = tideline;
