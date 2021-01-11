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

/* jshint esversion:6 */
import i18next from 'i18next';

var t = i18next.t.bind(i18next);

var _ = require('lodash');
// var bows = require('bows');
var d3 = require('d3');

var EventEmitter = require('events').EventEmitter;

var tideline = require('../../js/index');
var { MGDL_UNITS } = require('../../js/data/util/constants');

var fill = tideline.plot.util.fill;
var dt = tideline.data.util.datetime;

// Create a 'Two Weeks' chart object that is a wrapper around Tideline components
function chartWeeklyFactory(el, options) {
  // var log = bows('Weekly Factory');
  options = options || {};
  var defaults = {
    bgUnits: MGDL_UNITS,
    timePrefs: {
      timezoneAware: false,
      timezoneName: dt.getBrowserTimezone(),
    }
  };
  _.defaults(options, defaults);

  var emitter = new EventEmitter();
  var chart = tideline.twoWeek(emitter, options.timePrefs);
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
      chart.data(twoWeekData, chart.options.timePrefs.timezoneAware);
    }
    else {
      if (twoWeekData.length &&
          Date.parse(datetime) > Date.parse(twoWeekData[twoWeekData.length - 1].normalTime)) {
        datetime = twoWeekData[_.findLastIndex(twoWeekData, function(d) {
          return d.twoWeekX === 0;
        })].normalTime;
      }
      chart.data(twoWeekData, chart.options.timePrefs.timezoneAware, datetime);
    }

    chart.setup();
    chart.legend({
      main: t('Glucose'),
      light: ' ' + chart.options.bgUnits
    });

    var days = chart.days;

    // make pools for each day
    days.forEach(function(day, i) {
      var newPool = chart.newPool()
        .id('poolBG_' + day, chart.daysGroup())
        .index(chart.pools().indexOf(newPool))
        .heightRatio(1.0)
        .gutterWeight(0.0);
    });

    chart.arrangePools();
    chart.setTooltip().setAnnotation();

    chart.setAxes().setNav().setScrollNav();

    smbgTime = new tideline.plot.SMBGTime({
      emitter: emitter,
      bgUnits: chart.options.bgUnits,
      classes: chart.options.bgClasses,
      timezoneAware: chart.options.timePrefs.timezoneAware
    });

    chart.pools().forEach(function(pool, i) {
      var d = new Date(pool.id().replace('poolBG_', ''));
      var dayOfTheWeek = d.getUTCDay();
      var weekend = ((dayOfTheWeek === 0) || (dayOfTheWeek === 6));

      pool.addPlotType('fill', fill(pool, {
        gutter: {'top': 0.5, 'bottom': 0.5},
        dataGutter: chart.dataGutter(),
        fillClass: weekend ? 'd3-pool-weekend' : '',
        x: function(t) { return t.twoWeekX; }
      }), true, true);
      pool.addPlotType('smbg', smbgTime.draw(pool), true, true);
      chart.tooltips().addGroup(pool, {
        type: 'smbg'
      });
      pool.render(chart.daysGroup(), chart.dataPerDay[i]);
    });

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
