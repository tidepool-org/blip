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

var basicsActions = {};

basicsActions.bindApp = function(app) {
  this.app = app;
  return this;
};

basicsActions.switchDomain = function(newDomain) {
  var offsetsInHours = {
    '1 week': 7*24,
    '2 weeks': 14*24,
    '4 weeks': 28*24
  };
  this.app.setState({
    domain: newDomain
  });
};

module.exports = basicsActions;