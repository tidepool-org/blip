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

var $ = window.$;
var d3 = window.d3;
var _ = window._;

var tideline = require('../js/index');
var chartDailyFactory = require('./chartdailyfactory');
var chartWeeklyFactory = require('./chartweeklyfactory');
var log = window.bows('Example');

// things common to one-day and two-week views
// common event emitter
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
emitter.on('navigated', function(navString) {
  if (navString.length === 1) {
    var d = new Date(navString);
    var formatDate = d3.time.format.utc('%A, %B %-d');
    $('#tidelineNavString').html(formatDate(d));
  }
  else {
    var beg = new Date(navString[0]);
    var end = new Date(navString[1]);
    var monthDay = d3.time.format.utc('%B %-d');
    $('#tidelineNavString').html(monthDay(beg) + ' - ' + monthDay(end));
  }
});

emitter.on('mostRecent', function(mostRecent) {
  if (mostRecent) {
    $('#oneDayMostRecent').parent().addClass('active');
  }
  else {
    $('#oneDayMostRecent').parent().removeClass('active');
  }
});

var BasalUtil = tideline.data.BasalUtil;

var el = '#tidelineContainer';
var imagesBaseUrl = '../img';

// dear old Watson
var watson = require('./watson');

var oneDay = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl}, emitter).setupPools();

var twoWeek = chartWeeklyFactory(el, {imagesBaseUrl: imagesBaseUrl}, emitter);

// load data and draw charts
d3.json('data/device-data.json', function(data) {
  log('Data loaded.');
  // munge basal segments
  var segments = new tideline.data.SegmentUtil(_.where(data, {'type': 'basal-rate-segment'}));
  data = _.reject(data, function(d) {
    return d.type === 'basal-rate-segment';
  });
  data = data.concat(segments.actual.concat(segments.undelivered));
  // Watson the data
  data = watson.normalize(data);
  // ensure the data is properly sorted
  data = _.sortBy(data, function(d) {
    return new Date(d.normalTime).valueOf();
  });
  // load blip output data
  // comment this out when you don't want to do this
  // data = require('./data/blip-output.json');

  log('Initial one-day view.');
  oneDay.load(data).locate('2014-03-06T09:00:00');
  // attach click handlers to set up programmatic pan
  $('#tidelineNavForward').on('click', oneDay.panForward);
  $('#tidelineNavBack').on('click', oneDay.panBack);

  $('#twoWeekView').on('click', function() {
    log('Navigated to two-week view from nav bar.');
    var date = oneDay.getCurrentDay();
    oneDay.clear().hide();
    twoWeek.clear();

    $(this).parent().addClass('active');
    $('#oneDayView').parent().removeClass('active');
    $('.one-day').css('visibility', 'hidden');
    $('.two-week').css('visibility', 'visible');

    $('.tideline-nav').off('click');
    // attach click handlers to set up programmatic pan
    $('#tidelineNavForward').on('click', twoWeek.panForward);
    $('#tidelineNavBack').on('click', twoWeek.panBack);
    
    // takes user to two-week view with day user was viewing in one-day view at the end of the two-week view window
    twoWeek.show().load(data, date);
  });

  $('#oneDayView').on('click', function() {
    log('Navigated to one-day view from nav bar.');
    twoWeek.clear().hide();
    
    $('.tideline-nav').off('click');
    // attach click handlers to set up programmatic pan
    $('#tidelineNavForward').on('click', oneDay.panForward);
    $('#tidelineNavBack').on('click', oneDay.panBack);

    $(this).parent().addClass('active');
    
    $('#twoWeekView').parent().removeClass('active');
    $('.one-day').css('visibility', 'visible');
    $('.two-week').css('visibility', 'hidden');
    
    // takes user to one-day view of most recent data
    oneDay.show().locate();
  });

  $('#oneDayMostRecent').on('click', function() {
    log('Navigated to most recent one-day view.');
    oneDay.clear().locate();

    $(this).parent().addClass('active');

    $('#twoWeekView').parent().removeClass('active');
    $('#oneDayMostRecent').parent().addClass('active');
    $('.one-day').css('visibility', 'visible');
    $('.two-week').css('visibility', 'hidden');
  });

  emitter.on('selectSMBG', function(date) {
    log('Navigated to one-day view from double clicking a two-week view SMBG.');
    twoWeek.clear().hide();
    
    $('.tideline-nav').off('click');
    // attach click handlers to set up programmatic pan
    $('#tidelineNavForward').on('click', oneDay.panForward);
    $('#tidelineNavBack').on('click', oneDay.panBack);

    $('#oneDayView').parent().addClass('active');
    $('#twoWeekView').parent().removeClass('active');
    $('#oneDayMostRecent').parent().removeClass('active');
    $('.one-day').css('visibility', 'visible');
    $('.two-week').css('visibility', 'hidden');

    // takes user to one-day view of date given by the .d3-smbg-time emitter
    oneDay.show().load(data).locate(date);
  });

  $('#showHideNumbers').on('click', function() {
    if ($(this).parent().hasClass('active')) {
      emitter.emit('numbers', 'hide');
      $(this).parent().removeClass('active');
      $(this).html('Show Values');
    }
    else {
      emitter.emit('numbers', 'show');
      $(this).parent().addClass('active');
      $(this).html('Hide Values');
    }
  });
});
