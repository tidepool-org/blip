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
 
// DOM required
// ====================================
require('../css/tideline.less');
require('./less/test.less');

// TODO: rewrite
// require('./viz/oneday_test');

// DOM not required
// ====================================

/* js/data/ */
require('./datetime_test');
require('./basalutil_test');
require('./bgutil_test');
require('./bolusutil_test');
// TODO: rewrite
// require('./settingsutil_test');

/* js/ */
// TODO: rewrite
// require('./tidelinedata_test');

/* js/plot/ */
require('./annotations_test');
require('./commonbolus_test');

/* plugins/ */
require('./nurseshark_test');

