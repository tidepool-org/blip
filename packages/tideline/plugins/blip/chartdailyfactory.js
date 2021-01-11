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
// @ts-nocheck

import i18next from 'i18next';
var t = i18next.t.bind(i18next);

var _ = require('lodash');
var bows = require('bows');
var d3 = require('d3');

var EventEmitter = require('events').EventEmitter;

var tideline = require('../../js/index');
var fill = tideline.plot.util.fill;
var scalesutil = tideline.plot.util.scales;
var dt = tideline.data.util.datetime;
var { MGDL_UNITS } = require('../../js/data/util/constants');

// Create a 'One Day' chart object that is a wrapper around Tideline components
function chartDailyFactory(el, options) {
  var log = bows('Daily Factory');
  log.info('Initializing...');

  options = options || {};
  var defaults = {
    bgUnits: MGDL_UNITS,
    labelBaseline: 4,
    timePrefs: {
      timezoneAware: false,
      timezoneName: dt.getBrowserTimezone(),
    }
  };
  _.defaults(options, defaults);

  var scales = scalesutil(options);
  var emitter = new EventEmitter();
  var chart = tideline.oneDay(emitter, options);
  chart.emitter = emitter;
  chart.options = options;

  var poolXAxis, poolMessages, poolBG, poolBolus, poolBasal;

  var SMBG_SIZE = 16;

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

    d3.select(el).call(chart);

    return chart;
  };

  chart.setupPools = function() {
    // top x-axis pool
    poolXAxis = chart.newPool()
      .id('poolXAxis', chart.poolGroup())
      .label('')
      .labelBaseline(options.labelBaseline)
      .index(chart.pools().indexOf(poolXAxis))
      .heightRatio(0.65)
      .gutterWeight(0.0);

    // messages pool
    poolMessages = chart.newPool()
      .id('poolMessages', chart.poolGroup())
      .label('')
      .labelBaseline(options.labelBaseline)
      .index(chart.pools().indexOf(poolMessages))
      .heightRatio(0.5)
      .gutterWeight(0.0);

    // blood glucose data pool
    poolBG = chart.newPool()
      .id('poolBG', chart.poolGroup())
      .label([{
        'main': t('Glucose'),
        'light': ` (${t(chart.options.bgUnits)})`
      },
      {
        'main': ` & ${t('Events')}`
      }])
      .labelBaseline(options.labelBaseline)
      .legend(['bg'])
      .index(chart.pools().indexOf(poolBG))
      .heightRatio(2.15)
      .gutterWeight(1.0);

    // carbs and boluses data pool
    poolBolus = chart.newPool()
      .id('poolBolus', chart.poolGroup())
      .label([{
        'main': t('Bolus'),
        'light': ` (${t('U')})`
      },
      {
        'main': ` & ${t('Carbohydrates')}`,
        'light': ` (${t('g')})`
      }])
      .labelBaseline(options.labelBaseline)
      .legend(['rescuecarbs', 'carbs', 'bolus'])
      .index(chart.pools().indexOf(poolBolus))
      .heightRatio(1.35)
      .gutterWeight(1.0);

    // basal data pool
    poolBasal = chart.newPool()
      .id('poolBasal', chart.poolGroup())
      .label([{
        main: t('Basal Rates'),
        light: ` (${t('U')}/${t('hr')})`
      }])
      .labelBaseline(options.labelBaseline)
      .legend(['basal'])
      .index(chart.pools().indexOf(poolBasal))
      .heightRatio(1.0)
      .gutterWeight(1.0);

    chart.arrangePools();

    chart.setAnnotation().setTooltip();

    // add annotations
    chart.annotations().addGroup(chart.svg().select('#' + poolBG.id()), 'smbg');
    chart.annotations().addGroup(chart.svg().select('#' + poolBolus.id()), 'bolus');
    chart.annotations().addGroup(chart.svg().select('#' + poolBolus.id()), 'wizard');
    chart.annotations().addGroup(chart.svg().select('#' + poolBasal.id()), 'basal');

    // add tooltips
    chart.tooltips().addGroup(poolMessages, {
      type: 'deviceEvent',
      shape: 'generic'
    });
    chart.tooltips().addGroup(poolMessages, {
      type: 'message',
      shape: 'generic'
    });
    chart.tooltips().addGroup(poolBG, {
      type: 'cbg',
      classes: ['d3-bg-low', 'd3-bg-target', 'd3-bg-high']
    });
    chart.tooltips().addGroup(poolBG, {
      type: 'smbg'
    });
    chart.tooltips().addGroup(poolBolus, {
      type: 'wizard',
      shape: 'generic'
    });
    chart.tooltips().addGroup(poolBolus, {
      type: 'bolus',
      shape: 'generic'
    });
    chart.tooltips().addGroup(poolBasal, {
      type: 'basal'
    });

    return chart;
  };

  chart.load = function(tidelineData) {
    var data = tidelineData.data;
    chart.tidelineData = tidelineData;

    // initialize chart with data
    chart.data(tidelineData).setAxes().setNav().setScrollNav();

    // x-axis pools
    // add ticks to top x-axis pool
    poolXAxis.addPlotType('fill', tideline.plot.util.axes.dailyx(poolXAxis, {
      'class': 'd3-top',
      emitter: emitter,
      leftEdge: chart.axisGutter(),
      timePrefs: chart.options.timePrefs
    }), true, true);

    // BG pool
    var allBG = _.filter(data, function(d) {
      if ((d.type === 'cbg') || (d.type === 'smbg')) {
        return d;
      }
    });
    var scaleBG = scales.bg(allBG, poolBG, SMBG_SIZE/2);
    var bgTickFormat = options.bgUnits === MGDL_UNITS ? 'd' : '.1f';

    // set up y-axis
    poolBG.yAxis(d3.svg.axis()
      .scale(scaleBG)
      .orient('left')
      .outerTickSize(0)
      .tickValues(scales.bgTicks(allBG))
      .tickFormat(d3.format(bgTickFormat)));
    // add background fill rectangles to BG pool
    poolBG.addPlotType('fill', fill(poolBG, {
      endpoints: chart.endpoints,
      isDaily: true,
      guidelines: [
        {
          'class': 'd3-line-bg-threshold',
          'height': chart.options.bgClasses.low.boundary
        },
        {
          'class': 'd3-line-bg-threshold',
          'height': chart.options.bgClasses.target.boundary
        }
      ],
      yScale: scaleBG
    }), true, true);

    // add background fill rectangles to BG pool
    var scaleHeightBG = d3.scale.linear()
      .domain([0, poolBG.height()])
      .range([0, poolBG.height()]);

    poolBG.addPlotType('fill', fill(poolBG, {
      endpoints: chart.endpoints,
      isDaily: true,
      yScale: scaleHeightBG
    }), true, true);

    poolBG.addPlotType('deviceEvent', tideline.plot.zenModeEvent(poolBG, {
      yScale: scaleBG,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      data: tidelineData.zenEvents,
    }), false, true);

    poolBG.addPlotType('physicalActivity', tideline.plot.physicalActivity(poolBG, {
      bgUnits: chart.options.bgUnits,
      classes: chart.options.bgClasses,
      yScale: scaleBG,
      emitter: emitter,
      subdueOpacity: 0.4,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onPhysicalHover: options.onPhysicalHover,
      onPhysicalOut: options.onPhysicalOut,
      data: tidelineData.physicalActivities,
    }), true, true);

    poolBG.addPlotType('deviceEvent', tideline.plot.reservoirChange(poolBG, {
      bgUnits: chart.options.bgUnits,
      classes: chart.options.bgClasses,
      yScale: scaleBG,
      emitter: emitter,
      subdueOpacity: 0.4,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onReservoirHover: options.onReservoirHover,
      onReservoirOut: options.onReservoirOut,
    }), true, true);

    poolBG.addPlotType('deviceEvent', tideline.plot.deviceParameterChange(poolBG, {
      bgUnits: chart.options.bgUnits,
      classes: chart.options.bgClasses,
      yScale: scaleBG,
      emitter: emitter,
      subdueOpacity: 0.4,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onParameterHover: options.onParameterHover,
      onParameterOut: options.onParameterOut,
      data: tidelineData.deviceParameters,
    }), true, true);

    // add confidential mode to BG pool
    poolBG.addPlotType('deviceEvent', tideline.plot.confidentialModeEvent(poolBG, {
      yScale: scaleBG,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      data: tidelineData.confidentialEvents,
      onConfidentialHover: options.onConfidentialHover,
      onConfidentialOut: options.onConfidentialOut,
    }), true, true);

    // add CBG data to BG pool
    poolBG.addPlotType('cbg', tideline.plot.cbg(poolBG, {
      bgUnits: chart.options.bgUnits,
      classes: chart.options.bgClasses,
      yScale: scaleBG,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onCBGHover: options.onCBGHover,
      onCBGOut: options.onCBGOut,
    }), true, true);

    // add SMBG data to BG pool
    poolBG.addPlotType('smbg', tideline.plot.smbg(poolBG, {
      bgUnits: chart.options.bgUnits,
      classes: chart.options.bgClasses,
      yScale: scaleBG,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onSMBGHover: options.onSMBGHover,
      onSMBGOut: options.onSMBGOut,
    }), true, true);

    // bolus & carbs pool
    const scaleBolus = scales.bolus(tidelineData.grouped.bolus.concat(tidelineData.grouped.wizard), poolBolus);
    // set up y-axis for bolus
    const bolusTickValues = [0, 1, 5, 10];
    const maxBolusValue = scaleBolus.domain()[1];
    // Add additional legends
    while (maxBolusValue > bolusTickValues[bolusTickValues.length - 1] && bolusTickValues.length < 7) {
      const currentMax = bolusTickValues[bolusTickValues.length - 1];
      const bolusTick = currentMax < 20 ? 5 : 10;
      // [0, 5, 10, 15, 20, 30, 40]
      bolusTickValues.push(currentMax + bolusTick);
    }

    log.debug('scaleBolus domain', scaleBolus.domain(), '=> tick values', bolusTickValues);

    poolBolus.yAxis(d3.svg.axis()
      .scale(scaleBolus)
      .orient('left')
      .outerTickSize(0)
      .ticks(2)
      .tickValues(bolusTickValues));

    // add background fill rectangles to bolus pool
    const poolBolusHeight = [0, poolBolus.height()];
    const scaleHeight = d3.scale.log()
      .domain(poolBolusHeight)
      .range(poolBolusHeight);

    poolBolus.addPlotType('fill', fill(poolBolus, {
      endpoints: chart.endpoints,
      isDaily: true,
      yScale: scaleHeight
    }), true, true);

    // add wizard data to wizard pool
    poolBolus.addPlotType('wizard', tideline.plot.wizard(poolBolus, {
      yScale: scaleBolus,
      emitter: emitter,
      subdueOpacity: 0.4,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onBolusHover: options.onBolusHover,
      onBolusOut: options.onBolusOut,
    }), true, true);

    poolBolus.addPlotType('food', tideline.plot.carb(poolBolus, {
      emitter: emitter,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onCarbHover: options.onCarbHover,
      onCarbOut: options.onCarbOut,
    }), true, true);

    // quick bolus data to wizard pool
    poolBolus.addPlotType('bolus', tideline.plot.quickbolus(poolBolus, {
      yScale: scaleBolus,
      emitter: emitter,
      subdueOpacity: 0.4,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      onBolusHover: options.onBolusHover,
      onBolusOut: options.onBolusOut,
    }), true, true);

    // add confidential mode to Bolus pool
    poolBolus.addPlotType('deviceEvent', tideline.plot.confidentialModeEvent(poolBolus, {
      yScale: scaleBolus,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      data: tidelineData.confidentialEvents,
      onConfidentialHover: options.onConfidentialHover,
      onConfidentialOut: options.onConfidentialOut,
    }), false, true);

    // basal pool
    var scaleBasal = scales.basal(tidelineData.grouped.basal, poolBasal);
    // set up y-axis
    poolBasal.yAxis(d3.svg.axis()
      .scale(scaleBasal)
      .orient('left')
      .outerTickSize(0)
      .ticks(2));
    // add background fill rectangles to basal pool
    poolBasal.addPlotType('fill', fill(poolBasal, {endpoints: chart.endpoints, isDaily: true}), true, true);

    // add basal data to basal pool
    poolBasal.addPlotType('basal', tideline.plot.basal(poolBasal, {
      yScale: scaleBasal,
      emitter: emitter,
      data: tidelineData.grouped.basal,
      ...tidelineData.opts.timePrefs,
    }), true, true);

    // add device suspend data to basal pool
    poolBasal.addPlotType('deviceEvent', tideline.plot.suspend(poolBasal, {
      yScale: scaleBasal,
      emitter: emitter,
      data: tidelineData.grouped.deviceEvent,
      timezoneAware: chart.options.timePrefs.timezoneAware
    }), true, true);

    // add confidential mode to Basal pool
    poolBasal.addPlotType('deviceEvent', tideline.plot.confidentialModeEvent(poolBasal, {
      yScale: scaleBolus,
      timezoneAware: chart.options.timePrefs.timezoneAware,
      data: tidelineData.confidentialEvents,
      onConfidentialHover: options.onConfidentialHover,
      onConfidentialOut: options.onConfidentialOut,
    }), false, true);

    // messages pool
    // add background fill rectangles to messages pool
    poolMessages.addPlotType('fill', fill(poolMessages, {
      emitter: emitter,
      isDaily: true,
      cursor: 'cell'
    }), true, true);

    // add message images to messages pool
    poolMessages.addPlotType('message', tideline.plot.message(poolMessages, {
      size: 30,
      emitter: emitter,
      timezoneAware: chart.options.timePrefs.timezoneAware
    }), true, true);

    // add timechange images to messages pool
    poolMessages.addPlotType('deviceEvent', tideline.plot.timechange(poolMessages, {
      size: 30,
      emitter: emitter,
      timezone: chart.options.timePrefs.timezoneName
    }), true, true);

    return chart;
  };

  // locate the chart around a certain datetime
  // if called without an argument, locates the chart at the most recent 24 hours of data
  chart.locate = function(datetime) {

    var start, end, atMostRecent = false;

    var mostRecent = function() {
      start = chart.initialEndpoints[0];
      end = chart.initialEndpoints[1];
    };

    if (!arguments.length) {
      atMostRecent = true;
      mostRecent();
    }
    else {
      // translate the desired center-of-view datetime into an edgepoint for tideline
      start = new Date(datetime);
      chart.currentCenter(start);
      var plusHalf = new Date(start);
      plusHalf.setUTCHours(plusHalf.getUTCHours() + 12);
      var minusHalf = new Date(start);
      minusHalf.setUTCHours(minusHalf.getUTCHours() - 12);
      if ((start.valueOf() < chart.endpoints[0]) || (start.valueOf() > chart.endpoints[1])) {
        log.error('Please don\'t ask tideline to locate at a date that\'s outside of your data!');
        log.error('Rendering most recent data instead.');
        mostRecent();
      }
      else if (plusHalf.valueOf() > chart.endpoints[1]) {
        mostRecent();
      }
      else if (minusHalf.valueOf() < chart.endpoints[0]) {
        start = chart.endpoints[0];
        var firstEnd = new Date(start);
        firstEnd.setUTCDate(firstEnd.getUTCDate() + 1);
        end = firstEnd;
      }
      else {
        end = new Date(start);
        start.setUTCHours(start.getUTCHours() - 12);
        end.setUTCHours(end.getUTCHours() + 12);
      }
    }

    chart.renderedData([start, end]);

    // render pools
    _.forEach(chart.pools(), function(pool) {
      pool.render(chart.poolGroup(), chart.renderedData());
    });

    chart.setAtDate(start, atMostRecent);

    return chart;
  };

  chart.getCurrentDay = function() {
    return chart.getCurrentDomain().center;
  };

  chart.createMessage = function(message) {
    log.info('New message created:', message);
    chart.tidelineData.addData([message]);
    chart.data(chart.tidelineData);
    chart.emitter.emit('messageCreated', message);
    return chart.tidelineData;
  };

  chart.editMessage = function(message) {
    log.info('Message edited:', message);
    // tideline only cares if the edited message was a top-level note
    // not a comment
    if (_.isEmpty(message.parentMessage)) {
      chart.tidelineData.editDatum(message, 'utcTime');
      chart.data(chart.tidelineData);
      chart.emitter.emit('messageEdited', message);
    }
    return chart.tidelineData;
  };

  chart.closeMessage = function() {
    chart.poolGroup().selectAll('.d3-rect-message').classed('hidden', true);
  };

  chart.type = 'daily';

  return create(el, options);
}

module.exports = chartDailyFactory;
