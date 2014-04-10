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

// tideline dependencies & plugins
var tideline = window.tideline;
var preprocess = window.tideline.preprocess;
var blip = window.tideline.blip;
var chartDailyFactory = blip.oneday;
var chartWeeklyFactory = blip.twoweek;

var log = window.bows('Example');

var el = document.getElementById('tidelineContainer');
var imagesBaseUrl = '../img';

var oneDay = chartDailyFactory(el, {imagesBaseUrl: imagesBaseUrl}).setupPools();
var twoWeek = chartWeeklyFactory(el, {imagesBaseUrl: imagesBaseUrl});

// things common to one-day and two-week views
oneDay.emitter.on('navigated', function(navString) {
  var d = new Date(navString[0]);
  var formatDate = d3.time.format.utc('%A, %B %-d');
  $('#tidelineNavString').html(formatDate(d));
});

twoWeek.emitter.on('navigated', function(navString) {
  var beg = new Date(navString[0]);
  var end = new Date(navString[1]);
  var monthDay = d3.time.format.utc('%B %-d');
  $('#tidelineNavString').html(monthDay(beg) + ' - ' + monthDay(end));
});

oneDay.emitter.on('mostRecent', function(mostRecent) {
  if (mostRecent) {
    $('#mostRecent').parent().addClass('active');
  }
  else {
    $('#mostRecent').parent().removeClass('active');
  }
});

twoWeek.emitter.on('mostRecent', function(mostRecent) {
  if (mostRecent) {
    $('#mostRecent').parent().addClass('active');
  }
  else {
    $('#mostRecent').parent().removeClass('active');
  }
});

// load data and draw charts
d3.json('data/device-data.json', function(data) {
  log('Data loaded.');
  data = preprocess.processData(data);

  log('Initial one-day view.');
  oneDay.load(data).locate('2014-03-06T09:00:00.000Z');
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

  $('#mostRecent').on('click', function() {
    log('Navigated to most recent data.');
    if ($('#twoWeekView').parent().hasClass('active')) {
      twoWeek.clear().load(data);
    }
    else {
      oneDay.clear().locate();
    }
    $('#mostRecent').parent().addClass('active');
  });

  twoWeek.emitter.on('selectSMBG', function(date) {
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
      twoWeek.emitter.emit('numbers', 'hide');
      $(this).parent().removeClass('active');
      $(this).html('Show Values');
    }
    else {
      twoWeek.emitter.emit('numbers', 'show');
      $(this).parent().addClass('active');
      $(this).html('Hide Values');
    }
  });
});
