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

module.exports = {
  annotations_test: require('./annotations_test'),
  basalutil_test: require('./basalutil_test'),
  bgutil_test: require('./bgutil_test'),
  bolusutil_test: require('./bolusutil_test'),
  datetime_test: require('./datetime_test'),
  preprocess_test: require('./preprocess_test'),
  segmentutil_test: require('./segmentutil_test'),
  tidelinedata_test: require('./tidelinedata_test'),
  timeline_test: require('./timeline_test'),
  watson_test: require('./watson_test'),
  viz: {
    oneday_test: require('./viz/oneday_test')
  }
};