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
// things common to one-day and two-week views
// common event emitter
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter;
emitter.on('navigated', function(navString) {
  $('#tidelineNavString').html(navString); 
});
var twoWeek = require('../js/two-week')(emitter);

// common pool modules
var fill = require('../js/plot/fill');
var scales = require('../js/plot/scales');

// dear old Watson
var watson = require('./watson')();
d3.select('#tidelineContainer').call(watson);

// set up one-day view
var oneDay = oneDayChart('#tidelineContainer');

// set up two-week view
var twoWeek = twoWeekChart('#tidelineContainer');

// load data and draw charts
d3.json('device-data.json', function(data) {
  // Watson the data
  var data = watson.normalize(data);
  data = _.sortBy(data, 'normalTime');
  oneDay.initialize(data)
    .setUpPools(data)
    .locate('2014-03-06T06:23:45Z');
  // twoWeek.initialize(data);
});

// attach click handlers to set up programmatic pan
$('#tidelineNavForward').on('click', oneDay.panForward);
$('#tidelineNavBack').on('click', oneDay.panBack);

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

  chart.setUpPools = function(data) {
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
    // var poolStats = chart.newPool().defaults()
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
    poolBG.addPlotType('fill', fill(poolBG, {endpoints: chart.endpoints}));

    // add CBG data to BG pool
    poolBG.addPlotType('cbg', require('../js/plot/cbg')(poolBG, {yScale: scaleBG}));

    // add SMBG data to BG pool
    poolBG.addPlotType('smbg', require('../js/plot/smbg')(poolBG, {yScale: scaleBG}));

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
    poolBolus.addPlotType('fill', fill(poolBolus, {endpoints: chart.endpoints}));

    // add carbs data to bolus pool
    poolBolus.addPlotType('carbs', require('../js/plot/carbs')(poolBolus, {yScale: scaleCarbs}));

    // add bolus data to bolus pool
    poolBolus.addPlotType('bolus', require('../js/plot/bolus')(poolBolus, {yScale: scaleBolus}));

    // basal pool
    // add background fill rectangles to basal pool
    poolBasal.addPlotType('fill', fill(poolBasal, {endpoints: chart.endpoints}));

    // messages pool
    // add background fill rectangles to messages pool
    poolMessages.addPlotType('fill', fill(poolMessages, {endpoints: chart.endpoints}));

    // add message images to messages pool
    poolMessages.addPlotType('message', require('../js/plot/message')(poolMessages, {size: 30}));

    return chart;    
  }

  chart.initialize = function(data) {

    // initialize chart with data
    chart.data(data);
    d3.select(el).datum([null]).call(chart);
    chart.setTooltip();

    return chart;
  };

  // locate the chart around a certain datetime
  // if called without an argument, locates the chart at the most recent 24 hours of data
  chart.locate = function(datetime) {

    var start, localData;

    if (!arguments.length) {
      start = chart.initialEndpoints[0];
      localData = chart.getData(chart.initialEndpoints, 'both');
    }
    else {
      start = new Date(datetime);
      var end = new Date(start);
      start.setUTCHours(start.getUTCHours() - 12);
      end.setUTCHours(end.getUTCHours() + 12);

      localData = chart.getData([start, end], 'both');
      chart.beginningOfData(start).endOfData(end);
    }

    chart.allData(localData, [start, end]);

    // set up click-and-drag and scroll navigation
    chart.setNav().setScrollNav().setAtDate(start);

    // render BG pool
    poolBG(chart.poolGroup, localData);

    // render bolus pool
    poolBolus(chart.poolGroup, localData);

    // render basal pool
    poolBasal(chart.poolGroup, localData);

    //render messages pool
    poolMessages(chart.poolGroup, localData);

    // add tooltips
    chart.tooltips.addGroup(d3.select('#' + poolBG.id()), 'cbg');
    chart.tooltips.addGroup(d3.select('#' + poolBG.id()), 'smbg');
    chart.tooltips.addGroup(d3.select('#' + poolBolus.id()), 'carbs');
    chart.tooltips.addGroup(d3.select('#' + poolBolus.id()), 'bolus');
    chart.tooltips.addGroup(d3.select('#' + poolBasal.id()), 'basal');

    return chart;
  };

  return create(el);
};

// // two-week visualization
// // =====================
// // create a 'twoWeek' object that is a wrapper around tideline components
// // for blip's (two-week) data visualization
function twoWeekChart(el) {

  var chart = require('../js/two-week')(emitter);

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

    var days = twoWeek.days;
    // make pools for each day
    days.forEach(function(day, i) {
      var newPool = twoWeek.newPool().defaults()
        .id('poolBG_' + day)
        .index(twoWeek.pools().indexOf(newPool))
        .weight(1.0);
    });

    twoWeek.arrangePools();

    var fillEndpoints = [new Date('2014-01-01T00:00:00Z'), new Date('2014-01-02T00:00:00Z')];
    var fillScale = d3.time.scale.utc()
      .domain(fillEndpoints)
      .range([twoWeek.axisGutter(), twoWeek.width() - twoWeek.navGutter()]);

    twoWeek.pools().forEach(function(pool, i) {
      pool.addPlotType('fill', fill(pool, {
        endpoints: fillEndpoints,
        scale: fillScale,
        gutter: 0.5
      }));
      pool.addPlotType('smbg', require('../js/plot/smbg-time')(pool));
      pool(twoWeek.daysGroup, twoWeek.dataPerDay[i]);
    });

    return chart;
  };

  return create(el);
};