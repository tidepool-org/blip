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

var _ = require('lodash');
var bows = require('bows');
var d3 = require('d3');

var EventEmitter = require('events').EventEmitter;

var tideline = require('../../js/index');
var fill = tideline.plot.util.fill;
var dt = tideline.data.util.datetime;

// Create a 'Two Weeks' chart object that is a wrapper around Tideline components
function chartWeeklyFactory(el, options) {
  var log = bows('Weekly Factory');
  options = options || {};
  var defaults = {
    'bgUnits': 'mg/dL'
  };
  _.defaults(options, defaults);

  var emitter = new EventEmitter();
  var chart = tideline.twoWeek(emitter);
  chart.options = options;
  chart.emitter = emitter;

  var pools = [];

  var smbgTime;

  var create = function(el) {
    if (!el) {
      throw new Error('Sorry, you must provide a DOM element! :(');
    }

    var width = el.offsetWidth;
    var height = el.offsetHeight;
    if (!(width && height)) {
      throw new Error('Chart element must have a set width and height ' +
                      '(got: ' + width + ', ' + height + ')');
    }

    // basic chart set up
    chart.id(el.id).width(width).height(height);

    chart.dataGutter(8);

    d3.select(el).call(chart);

    return chart;
  };

  chart.load = function(tidelineData, datetime) {
    var basalUtil = tidelineData.basalUtil;
    var bolusUtil = tidelineData.bolusUtil;
    var cbgUtil = tidelineData.cbgUtil;
    var smbgUtil = tidelineData.smbgUtil;

    var twoWeekData = tidelineData.twoWeekData || [];

    if (!datetime) {
      chart.data(twoWeekData);
    }
    else {
      if (twoWeekData.length &&
          Date.parse(datetime) > Date.parse(twoWeekData[twoWeekData.length - 1].normalTime)) {
        datetime = twoWeekData[twoWeekData.length - 1].normalTime;
      }
      chart.data(twoWeekData, datetime);
    }

    chart.setup();
    chart.legend({
      main: 'Blood Glucose',
      light: ' ' + chart.options.bgUnits
    });

    var days = chart.days;

    // make pools for each day
    days.forEach(function(day, i) {
      var newPool = chart.newPool()
        .id('poolBG_' + day, chart.daysGroup())
        .index(chart.pools().indexOf(newPool))
        .weight(1.0)
        .gutterWeight(0.0);
    });

    chart.arrangePools();
    chart.setTooltip().setAnnotation();

    chart.setAxes().setNav().setScrollNav();

    var fillEndpoints = [new Date('2014-01-01T00:00:00Z'), new Date('2014-01-02T00:00:00Z')];
    var fillScale = d3.time.scale.utc()
      .domain(fillEndpoints)
      .range([chart.axisGutter() + chart.dataGutter(), chart.width() - chart.navGutter() - chart.dataGutter()]);

    smbgTime = new tideline.plot.SMBGTime({emitter: emitter, bgUnits: chart.options.bgUnits, classes: chart.options.bgClasses});

    chart.pools().forEach(function(pool, i) {
      var d = new Date(pool.id().replace('poolBG_', ''));
      var dayOfTheWeek = d.getUTCDay();
      var weekend = ((dayOfTheWeek === 0) || (dayOfTheWeek === 6));

      pool.addPlotType('fill', fill(pool, {
        gutter: {'top': 0.5, 'bottom': 0.5},
        dataGutter: chart.dataGutter(),
        fillClass: weekend ? 'd3-pool-weekend' : '',
        x: function(t) { return dt.getMsFromMidnight(t); }
      }), true, true);
      pool.addPlotType('smbg', smbgTime.draw(pool), true, true);
      chart.tooltips().addGroup(pool, {
        type: 'smbg'
      });
      pool.render(chart.daysGroup(), chart.dataPerDay[i]);
    });

    chart.poolStats.addPlotType('stats', tideline.plot.stats.widget(chart.poolStats, {
      classes: chart.options.bgClasses,
      bgUnits: chart.options.bgUnits,
      cbg: cbgUtil,
      smbg: smbgUtil,
      bolus: bolusUtil,
      basal: basalUtil,
      xPosition: 0,
      yPosition: chart.poolStats.height() / 10,
      emitter: emitter,
      averageLabel: 'These two weeks',
      puddleWeights : {
        ratio: 1.1,
        range: 1.2,
        average: 1.0
      }
    }), false, false);

    chart.poolStats.render(chart.poolGroup());

    chart.annotations().addGroup(chart.svg().select('#' + chart.poolStats.id()), 'stats');

    chart.navString();

    return chart;
  };

  chart.showValues = function() {
    smbgTime.showValues();
  };

  chart.hideValues = function() {
    smbgTime.hideValues();
  };

  chart.type = 'weekly';

  return create(el, options);
}

module.exports = chartWeeklyFactory;
