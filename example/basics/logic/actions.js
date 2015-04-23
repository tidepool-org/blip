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
var bows = require('bows');
var moment = require('moment-timezone');

var sundial = require('sundial');

var debug = bows('basicsActions');

var dataservice = require('../dataservice');

var basicsActions = {};

var offsetsInDays = {
  '1 week': 7,
  '2 weeks': 14,
  '4 weeks': 28
};

basicsActions.bindApp = function(app) {
  this.app = app;
  return this;
};

basicsActions.initialDataMunge = function(data) {
  debug('Munging data...');
  this.app.setState({
    data: dataservice(data)
  }, function() { debug('Initial data munge results:', this.app.state.data); }.bind(this));
};

basicsActions.getCurrentDays = function(range, timezone) {
  var currentDate = range[0], days = [];
  while (currentDate < range[1]) {
    days.push(sundial.applyTimezone(currentDate.toISOString().slice(0,-5), timezone).toISOString().slice(0,10));
    currentDate = moment(currentDate).tz(timezone).add(1, 'days').toDate();
  }
  debug('Days:', days);
  return days;
};

basicsActions.shiftDomainForward = function(dateRange) {
  var tz = this.app.state.timezone, offset = offsetsInDays[this.app.state.domain];
  var s = dateRange[0], e = dateRange[1];
  var begOfRange = moment(s).tz(tz).add(offset, 'days').toDate();
  var endOfRange = moment(e).tz(tz).add(offset, 'days').toDate();
  var newState = {
    dateRange: [begOfRange, endOfRange]
  };
  newState.days = this.getCurrentDays(newState.dateRange, tz);
  this.app.setState(newState, function() { debug('Shifted domain forward', newState); });
};

basicsActions.shiftDomainBack = function(dateRange) {
  var tz = this.app.state.timezone, offset = offsetsInDays[this.app.state.domain];
  var s = dateRange[0], e = dateRange[1];
  var begOfRange = moment(s).tz(tz).subtract(offset, 'days').toDate();
  var endOfRange = moment(e).tz(tz).subtract(offset, 'days').toDate();
  var newState = {
    dateRange: [begOfRange, endOfRange]
  };
  newState.days = this.getCurrentDays(newState.dateRange, tz);
  this.app.setState(newState, function() { debug('Shifted domain back', newState); });
};

basicsActions.switchDomain = function(newDomain) {
  var tz = this.app.state.timezone;
  var endOfRange = new Date(this.app.state.dateRange[1].valueOf() + 1);
  var begOfRange = moment(endOfRange).tz(tz).subtract(offsetsInDays[newDomain], 'days').toDate();
  var newState = {
    dateRange: [
      begOfRange,
      new Date(endOfRange - 1)
    ],
    domain: newDomain
  };
  newState.days = this.getCurrentDays(newState.dateRange, tz);
  this.app.setState(newState, function() { debug('Changed domain', newState); });
};

basicsActions.toggleSection = function(sectionName) {
  var state = _.cloneDeep(this.app.state);
  state.sections[sectionName].open = !state.sections[sectionName].open;
  this.app.setState(state);
};

basicsActions.toggleComponent = function(sectionName, componentName) {
  var state = _.cloneDeep(this.app.state);
  state.sections[sectionName].components[componentName].open = !state.sections[sectionName].components[componentName].open;
  this.app.setState(state);
};

module.exports = basicsActions;