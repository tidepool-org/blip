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

var log = require('bows')('Example');
// things common to one-day and two-week views
// common event emitter
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter;
emitter.setMaxListeners(100);
emitter.on('navigated', function(navString) {
  $('#tidelineNavString').html(navString);
});

// common pool modules
var fill = require('../js/plot/fill');
var scales = require('../js/plot/scales');
var BasalUtil = require('../js/data/basalutil');

var el = '#tidelineContainer';

// dear old Watson
var watson = require('./watson')();
d3.select(el).call(watson);

// set up one-day view
var oneDay = new oneDayChart(el), twoWeek = twoWeekChart(el);


// Note to Nico: this (all the code within d3.json() below) is all rough-and-ready...
// obviously a lot of it could be refactored
// but it should be a decent demo of how the interaction between one-day and two-week views could work
// the TODO issue noted appears to be a thorny one, so I'd like to avoid it for now since there's so much else to do

// load data and draw charts
d3.json('device-data.json', function(data) {
  log('Data loaded.');
  // munge basal segments
  var vizReadyBasals = new BasalUtil(data);
  data = _.reject(data, function(d) {
    return d.type === 'basal-rate-segment';
  });
  data = data.concat(vizReadyBasals.actual.concat(vizReadyBasals.undelivered));
  // Watson the data
  data = watson.normalize(data);
  // ensure the data is properly sorted
  data = _.sortBy(data, function(d) {
    return new Date(d.normalTime).valueOf();
  });

  log('Initial one-day view.');
  oneDay.initialize(data).locate('2014-03-06T12:00:00Z');
  // attach click handlers to set up programmatic pan
  $('#tidelineNavForward').on('click', oneDay.panForward);
  $('#tidelineNavBack').on('click', oneDay.panBack);

  $('#twoWeekView').on('click', function() {
    log('Navigated to two-week view from nav bar.');
    var date = oneDay.getCurrentDay();
    // remove click handlers for programmatic pan
    $('#tidelineNavForward').off('click');
    $('#tidelineNavBack').off('click');
    oneDay.stopListening().destroy();
    $(this).parent().addClass('active');
    $('#oneDayView').parent().removeClass('active');
    $('.one-day').css('visibility', 'hidden');
    $('.two-week').css('visibility', 'visible');
    // TODO: this shouldn't be necessary, but I've screwed something up with the global two-week.js variables
    // such that its necessary to create a new twoWeek object every time you want to rerender
    twoWeek = new twoWeekChart(el);
    // takes user to two-week view with day user was viewing in one-day view at the end of the two-week view window
    twoWeek.initialize(data, date);
  });

  $('#oneDayView').on('click', function() {
    log('Navigated to one-day view from nav bar.');
    twoWeek.destroy();
    $(this).parent().addClass('active');
    $('#twoWeekView').parent().removeClass('active');
    $('#oneDayMostRecent').parent().addClass('active');
    $('.one-day').css('visibility', 'visible');
    $('.two-week').css('visibility', 'hidden');
    // TODO: this shouldn't be necessary, but I've screwed something up with the global one-day.js variables
    // such that its necessary to create a new oneDay object every time you want to rerender
    oneDay = new oneDayChart(el);
    // takes user to one-day view of most recent data
    oneDay.initialize(data).locate();
    // attach click handlers to set up programmatic pan
    $('#tidelineNavForward').on('click', oneDay.panForward);
    $('#tidelineNavBack').on('click', oneDay.panBack);
  });

  $('#oneDayMostRecent').on('click', function() {
    log('Navigated to most recent one-day view.');
    twoWeek.destroy();
    oneDay.stopListening();
    $(this).parent().addClass('active');
    $('#twoWeekView').parent().removeClass('active');
    $('#oneDayMostRecent').parent().addClass('active');
    $('.one-day').css('visibility', 'visible');
    $('.two-week').css('visibility', 'hidden');
    // TODO: this shouldn't be necessary, but I've screwed something up with the global one-day.js variables
    // such that its necessary to create a new oneDay object every time you want to rerender
    oneDay = new oneDayChart(el);
    // takes user to one-day view of most recent data
    oneDay.initialize(data).locate();
    // attach click handlers to set up programmatic pan
    $('#tidelineNavForward').on('click', oneDay.panForward);
    $('#tidelineNavBack').on('click', oneDay.panBack);
  });

  emitter.on('selectSMBG', function(date) {
    log('Navigated to one-day view from double clicking a two-week view SMBG.');
    twoWeek.destroy();
    $('#oneDayView').parent().addClass('active');
    $('#twoWeekView').parent().removeClass('active');
    $('#oneDayMostRecent').parent().removeClass('active');
    $('.one-day').css('visibility', 'visible');
    $('.two-week').css('visibility', 'hidden');
    // TODO: this shouldn't be necessary, but I've screwed something up with the global one-day.js variables
    // such that its necessary to create a new oneDay object every time you want to rerender
    oneDay = new oneDayChart(el);
    // takes user to one-day view of date given by the .d3-smbg-time emitter
    oneDay.initialize(data).locate(date);
    // attach click handlers to set up programmatic pan
    $('#tidelineNavForward').on('click', oneDay.panForward);
    $('#tidelineNavBack').on('click', oneDay.panBack);
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

// // one-day visualization
// // =====================
// // create a 'oneDay' object that is a wrapper around tideline components
// // for blip's (one-day) data visualization
function oneDayChart(el) {

  var chart = require('../js/one-day')(emitter);

  var poolMessages, poolBG, poolBolus, poolBasal, poolStats;

  var create = function(el) {

    if (!el) {
      throw new Error('Sorry, you must provide a DOM element! :(');
    }

    // basic chart set up
    chart.defaults().width($(el).width()).height($(el).height());

    return chart;
  };

  chart.initialize = function(data) {

    // initialize chart with data
    chart.data(data);
    d3.select(el).datum([null]).call(chart);
    chart.setTooltip();

    // messages pool
    poolMessages = chart.newPool().defaults()
      .id('poolMessages')
      .label('')
      .index(chart.pools().indexOf(poolMessages))
      .weight(0.5);

    // blood glucose data pool
    poolBG = chart.newPool().defaults()
      .id('poolBG')
      .label('Blood Glucose')
      .index(chart.pools().indexOf(poolBG))
      .weight(1.5);

    // carbs and boluses data pool
    poolBolus = chart.newPool().defaults()
      .id('poolBolus')
      .label('Bolus & Carbohydrates')
      .index(chart.pools().indexOf(poolBolus))
      .weight(1.5);
    
    // basal data pool
    poolBasal = chart.newPool().defaults()
      .id('poolBasal')
      .label('Basal Rates')
      .index(chart.pools().indexOf(poolBasal))
      .weight(1.0);

    // stats widget
    // poolStats = chart.newPool().defaults()
    //   .id('poolStats')
    //   .index(chart.pools().indexOf(poolStats))
    //   .weight(1.0);

    chart.arrangePools();

    // BG pool
    var scaleBG = scales.bg(_.where(data, {'type': 'cbg'}), poolBG);
    // set up y-axis
    poolBG.yAxis(d3.svg.axis()
      .scale(scaleBG)
      .orient('left')
      .outerTickSize(0)
      .tickValues([40, 80, 120, 180, 300]));
    // add background fill rectangles to BG pool
    poolBG.addPlotType('fill', fill(poolBG, {endpoints: chart.endpoints}), false);

    // add CBG data to BG pool
    poolBG.addPlotType('cbg', require('../js/plot/cbg')(poolBG, {yScale: scaleBG}), true);

    // add SMBG data to BG pool
    poolBG.addPlotType('smbg', require('../js/plot/smbg')(poolBG, {yScale: scaleBG}), true);

    // bolus & carbs pool
    var scaleBolus = scales.bolus(_.where(data, {'type': 'bolus'}), poolBolus);
    var scaleCarbs = scales.carbs(_.where(data, {'type': 'carbs'}), poolBolus);
    // set up y-axis for bolus
    poolBolus.yAxis(d3.svg.axis()
      .scale(scaleBolus)
      .orient('left')
      .outerTickSize(0)
      .ticks(3));
    // set up y-axis for carbs
    poolBolus.yAxis(d3.svg.axis()
      .scale(scaleCarbs)
      .orient('left')
      .outerTickSize(0)
      .ticks(3));
    // add background fill rectangles to bolus pool
    poolBolus.addPlotType('fill', fill(poolBolus, {endpoints: chart.endpoints}), false);

    // add carbs data to bolus pool
    poolBolus.addPlotType('carbs',require('../js/plot/carbs')(poolBolus, {
      yScale: scaleCarbs,
      emitter: emitter,
      data: _.where(data, {'type': 'carbs'})
    }), true);

    // add bolus data to bolus pool
    poolBolus.addPlotType('bolus', require('../js/plot/bolus')(poolBolus, {
      yScale: scaleBolus,
      emitter: emitter,
      data: _.where(data, {'type': 'bolus'})
    }), true);

    // basal pool
    var scaleBasal = scales.basal(_.where(data, {'type': 'basal-rate-segment'}), poolBasal);
    // set up y-axis
    poolBasal.yAxis(d3.svg.axis()
      .scale(scaleBasal)
      .orient('left')
      .outerTickSize(0)
      .ticks(4));
    // add background fill rectangles to basal pool
    poolBasal.addPlotType('fill', fill(poolBasal, {endpoints: chart.endpoints}), false);

    // add basal data to basal pool
    poolBasal.addPlotType('basal-rate-segment', require('../js/plot/basal')(poolBasal, {yScale: scaleBasal, data: _.where(data, {'type': 'basal-rate-segment'}) }), true);

    // messages pool
    // add background fill rectangles to messages pool
    poolMessages.addPlotType('fill', fill(poolMessages, {endpoints: chart.endpoints}), false);

    // add message images to messages pool
    poolMessages.addPlotType('message', require('../js/plot/message')(poolMessages, {size: 30}), true);

    return chart;
  };

  // locate the chart around a certain datetime
  // if called without an argument, locates the chart at the most recent 24 hours of data
  chart.locate = function(datetime) {

    var start, end, localData;

    if (!arguments.length) {
      start = chart.initialEndpoints[0];
      end = chart.initialEndpoints[1];
      localData = chart.getData(chart.initialEndpoints, 'both');
    }
    else {
      start = new Date(datetime);
      end = new Date(start);
      start.setUTCHours(start.getUTCHours() - 12);
      end.setUTCHours(end.getUTCHours() + 12);

      localData = chart.getData([start, end], 'both');
      chart.beginningOfData(start).endOfData(end);
    }

    chart.allData(localData, [start, end]);

    // set up click-and-drag and scroll navigation
    chart.setNav().setScrollNav().setAtDate(start);

    // render pools
    chart.pools().forEach(function(pool) {
      pool(chart.poolGroup, localData);
    });

    // add tooltips
    chart.tooltips.addGroup(d3.select('#' + poolBG.id()), 'cbg');
    chart.tooltips.addGroup(d3.select('#' + poolBG.id()), 'smbg');
    chart.tooltips.addGroup(d3.select('#' + poolBolus.id()), 'carbs');
    chart.tooltips.addGroup(d3.select('#' + poolBolus.id()), 'bolus');
    chart.tooltips.addGroup(d3.select('#' + poolBasal.id()), 'basal');

    return chart;
  };

  chart.getCurrentDay = function() {
    return chart.date();
  };

  return create(el);
}

// // two-week visualization
// // =====================
// // create a 'twoWeek' object that is a wrapper around tideline components
// // for blip's (two-week) data visualization
function twoWeekChart(el) {

  var chart = require('../js/two-week')(emitter);

  var pools = [];

  var create = function(el) {
    if (!el) {
      throw new Error('Sorry, you must provide a DOM element! :(');
    }

    // basic chart set up
    chart.defaults().width($(el).width()).height($(el).height());

    return chart;
  };

  chart.initialize = function(data, datetime) {

    if (!datetime) {
      chart.data(_.where(data, {'type': 'smbg'}));
    }
    else {
      chart.data(_.where(data, {'type': 'smbg'}), datetime);
    }

    // initialize chart
    d3.select(el).datum([null]).call(chart);
    chart.setNav().setScrollNav();

    days = chart.days;
    // make pools for each day
    days.forEach(function(day, i) {
      var newPool = chart.newPool().defaults()
        .id('poolBG_' + day)
        .index(chart.pools().indexOf(newPool))
        .weight(1.0);
    });
    chart.arrangePools();

    var fillEndpoints = [new Date('2014-01-01T00:00:00Z'), new Date('2014-01-02T00:00:00Z')];
    var fillScale = d3.time.scale.utc()
      .domain(fillEndpoints)
      .range([chart.axisGutter(), chart.width() - chart.navGutter()]);

    chart.pools().forEach(function(pool, i) {
      pool.addPlotType('fill', fill(pool, {
        endpoints: fillEndpoints,
        scale: fillScale,
        gutter: 0.5
      }), false);
      pool.addPlotType('smbg', require('../js/plot/smbg-time')(pool, {emitter: emitter}), true);
      pool(chart.daysGroup, chart.dataPerDay[i]);
    });

    return chart;
  };

  return create(el);
}