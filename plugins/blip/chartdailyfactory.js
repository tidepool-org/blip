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

var _ = window._;
var bows = window.bows;
var d3 = window.d3;

var EventEmitter = require('events').EventEmitter;

var tideline = window.tideline;
var fill = tideline.plot.util.fill;
var scalesutil = tideline.plot.util.scales;

// Create a 'One Day' chart object that is a wrapper around Tideline components
function chartDailyFactory(el, options) {
  var log = bows('Daily Factory');
  options = options || {};
  var defaults = {
    bgUnits: 'mg/dL',
    bolusRatio: 0.35,
    dynamicCarbs: false,
    hiddenPools: {
      basalSettings: null
    }
  };
  _.defaults(options, defaults);

  var scales = scalesutil(options);
  var emitter = new EventEmitter();
  var chart = tideline.oneDay(emitter);
  chart.emitter = emitter;
  chart.options = options;

  var poolXAxis, poolMessages, poolBG, poolBolus, poolBasal, poolBasalSettings, poolStats;

  var SMBG_SIZE = 16;

  var create = function(el, options) {

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

    if (options.imagesBaseUrl) {
      chart.imagesBaseUrl(options.imagesBaseUrl);
    }

    d3.select(el).call(chart);

    return chart;
  };

  chart.setupPools = function() {
    // top x-axis pool
    poolXAxis = chart.newPool()
      .id('poolXAxis', chart.poolGroup())
      .label('')
      .index(chart.pools().indexOf(poolXAxis))
      .weight(0.55)
      .gutterWeight(0.0);

    // messages pool
    poolMessages = chart.newPool()
      .id('poolMessages', chart.poolGroup())
      .label('')
      .index(chart.pools().indexOf(poolMessages))
      .weight(0.5)
      .gutterWeight(0.0);

    // blood glucose data pool
    poolBG = chart.newPool()
      .id('poolBG', chart.poolGroup())
      .label([{
        'main': 'Blood Glucose',
        'light': ' (' + chart.options.bgUnits + ')'
      }])
      .legend(['bg'])
      .index(chart.pools().indexOf(poolBG))
      .weight(1.5)
      .gutterWeight(1.0);

    // carbs and boluses data pool
    poolBolus = chart.newPool()
      .id('poolBolus', chart.poolGroup())
      .label([{
        'main': 'Bolus',
        'light': ' (U)'
      },
      {
        'main': ' & Carbohydrates',
        'light': ' (g)'
      }])
      .legend(['bolus', 'carbs'])
      .index(chart.pools().indexOf(poolBolus))
      .weight(1.5)
      .gutterWeight(1.0);

    var basalSettingsBool = chart.options.hiddenPools.basalSettings;

    if (basalSettingsBool === null) {
      // basal data pool
      poolBasal = chart.newPool()
        .id('poolBasal', chart.poolGroup())
        .label([{
          'main': 'Basal Rates',
          'light': ' (U/hr)'
        }])
        .legend(['basal'])
        .index(chart.pools().indexOf(poolBasal))
        .weight(1.0)
        .gutterWeight(1.0);
    }
    else if (basalSettingsBool) {
      // basal settings pool, bare
      poolBasalSettings = chart.newPool()
        .id('poolBasalSettings', chart.poolGroup())
        .label('')
        .index(chart.pools().indexOf(poolBasal))
        .weight(1.0)
        .gutterWeight(1.0)
        .hidden(chart.options.hiddenPools.basalSettings);

      // basal data pool with label, legend, and gutter
      poolBasal = chart.newPool()
        .id('poolBasal', chart.poolGroup())
        .label([{
          'main': 'Basal Rates',
          'light': ' (U/hr)'
        }])
        .legend(['basal'])
        .index(chart.pools().indexOf(poolBasal))
        .weight(1.0)
        .gutterWeight(1.0);
    }
    else if (basalSettingsBool === false) {
      // basal settings pool with label, legend, and gutter
      poolBasalSettings = chart.newPool()
        .id('poolBasalSettings', chart.poolGroup())
        .label([{
          'main': 'Basal Rates',
          'light': ' (U/hr)'
        }])
        .legend(['basal'])
        .index(chart.pools().indexOf(poolBasal))
        .weight(1.0)
        .gutterWeight(1.0)
        .hidden(chart.options.hiddenPools.basalSettings);

      // basal data pool, bare
      poolBasal = chart.newPool()
        .id('poolBasal', chart.poolGroup())
        .label('')
        .index(chart.pools().indexOf(poolBasal))
        .weight(1.0)
        .gutterWeight(0.1);
    }

    // stats data pool
    poolStats = chart.newPool()
      .id('poolStats', chart.poolGroup())
      .index(chart.pools().indexOf(poolStats))
      .weight(1.0)
      .gutterWeight(1.0);

    chart.arrangePools();

    chart.setAnnotation().setTooltip();

    // add annotations
    chart.annotations().addGroup(chart.svg().select('#' + poolBolus.id()), 'bolus');
    chart.annotations().addGroup(chart.svg().select('#' + poolBasal.id()), 'basal-rate-segment');
    chart.annotations().addGroup(chart.svg().select('#' + poolStats.id()), 'stats');

    // add tooltips
    chart.tooltips().addGroup(chart.svg().select('#' + poolBG.id()), 'cbg');
    chart.tooltips().addGroup(chart.svg().select('#' + poolBG.id()), 'smbg');
    chart.tooltips().addGroup(chart.svg().select('#' + poolBolus.id()), 'bolus');
    chart.tooltips().addGroup(chart.svg().select('#' + poolBasal.id()), 'basal');

    return chart;
  };

  chart.load = function(tidelineData) {
    var data = tidelineData.data;
    chart.tidelineData = tidelineData;

    var basalUtil = tidelineData.basalUtil;
    var bolusUtil = tidelineData.bolusUtil;
    var cbgUtil = tidelineData.cbgUtil;
    var settingsUtil = tidelineData.settingsUtil;
    var smbgUtil = tidelineData.smbgUtil;

    // initialize chart with data
    chart.data(tidelineData).setAxes().setNav().setScrollNav();

    // x-axis pools
    // add ticks to top x-axis pool
    poolXAxis.addPlotType('fill', tideline.plot.util.axes.dailyx(poolXAxis, {
      'class': 'd3-top',
      emitter: emitter,
      leftEdge: chart.axisGutter()
    }), true, true);

    // BG pool
    var allBG = _.filter(data, function(d) {
      if ((d.type === 'cbg') || (d.type === 'smbg')) {
        return d;
      }
    });
    var scaleBG = scales.bgLog(allBG, poolBG, SMBG_SIZE/2);
    // set up y-axis
    poolBG.yAxis(d3.svg.axis()
      .scale(scaleBG)
      .orient('left')
      .outerTickSize(0)
      .tickValues(scales.bgTicks(allBG))
      .tickFormat(d3.format('g')));
    // add background fill rectangles to BG pool
    poolBG.addPlotType('fill', fill(poolBG, {
      endpoints: chart.endpoints,
      guidelines: [
        {
          'class': 'd3-line-bg-threshold',
          'height': 80
        },
        {
          'class': 'd3-line-bg-threshold',
          'height': 180
        }
      ],
      yScale: scaleBG
    }), true, true);

    // add CBG data to BG pool
    poolBG.addPlotType('cbg', tideline.plot.cbg(poolBG, {yScale: scaleBG}), true, true);

    // add SMBG data to BG pool
    poolBG.addPlotType('smbg', tideline.plot.smbg(poolBG, {yScale: scaleBG}), true, true);

    // TODO: when we bring responsiveness in
    // decide number of ticks for these scales based on container height?
    // bolus & carbs pool
    var scaleBolus = scales.bolus(tidelineData.grouped.bolus, poolBolus);
    var scaleCarbs = options.dynamicCarbs ? scales.carbs(tidelineData.grouped.wizard, poolBolus) : null;
    // set up y-axis for bolus
    poolBolus.yAxis(d3.svg.axis()
      .scale(scaleBolus)
      .orient('left')
      .outerTickSize(0)
      .ticks(2));

    // add background fill rectangles to bolus pool
    var scaleHeight = d3.scale.linear()
      .domain([0, poolBolus.height()])
      .range([0, poolBolus.height()]);

    poolBolus.addPlotType('fill', fill(poolBolus, {
      endpoints: chart.endpoints,
      yScale: scaleHeight
    }), true, true);

    // add wizard data to wizard pool
    poolBolus.addPlotType('wizard', tideline.plot.wizard(poolBolus, {
      yScale: scaleBolus,
      yScaleCarbs: scaleCarbs,
      emitter: emitter,
      data: tidelineData.grouped.wizard,
      subdueOpacity: 0.4
    }), true, true);

    // add bolus data to bolus pool
    poolBolus.addPlotType('bolus', tideline.plot.wizard(poolBolus, {
      yScale: scaleBolus,
      emitter: emitter,
      data: tidelineData.grouped.bolus,
      subdueOpacity: 0.4
    }), true, true);

    // quick bolus data to wizard pool
    poolBolus.addPlotType('bolus', tideline.plot.wizard(poolBolus, {
      yScale: scaleBolus,
      emitter: emitter,
      data: _.filter(tidelineData.grouped.bolus, function(d) {
        if (d.type === 'bolus' && !d.joinKey) {
          return d;
        }
      }),
      subdueOpacity: 0.4
    }), true, true);

    // basal pool
    var scaleBasal = scales.basal(tidelineData.grouped['basal-rate-segment'], poolBasal);
    // set up y-axis
    poolBasal.yAxis(d3.svg.axis()
      .scale(scaleBasal)
      .orient('left')
      .outerTickSize(0)
      .ticks(4));
    // add background fill rectangles to basal pool
    poolBasal.addPlotType('fill', fill(poolBasal, {endpoints: chart.endpoints}), true, true);

    // add basal data to basal pool
    poolBasal.addPlotType('basal-rate-segment', tideline.plot.basal(poolBasal, {
      yScale: scaleBasal,
      emitter: emitter,
      data: tidelineData.grouped['basal-rate-segment']
    }), true, true);

    if (poolBasalSettings !== undefined) {
      poolBasalSettings.addPlotType('basal-settings-segment', tideline.plot.basaltab(poolBasalSettings, {
        data: tidelineData.grouped['basal-settings-segment']
      }), true, true);
    }

    // messages pool
    // add background fill rectangles to messages pool
    poolMessages.addPlotType('fill', fill(poolMessages, {
      emitter: emitter,
      cursor: 'cell'
    }), true, true);

    // add message images to messages pool
    poolMessages.addPlotType('message', tideline.plot.message(poolMessages, {
      size: 30,
      emitter: emitter
    }), true, true);

    // stats pool
    poolStats.addPlotType('stats', tideline.plot.stats.widget(poolStats, {
      cbg: cbgUtil,
      smbg: smbgUtil,
      bolus: bolusUtil,
      basal: basalUtil,
      xPosition: chart.axisGutter(),
      yPosition: 0,
      emitter: emitter,
      averageLabel: 'These 24 hours',
      puddleWeights: {
        ratio: 1.0,
        range: 1.2,
        average: 0.9
      }
    }), false, false);

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
        log('Please don\'t ask tideline to locate at a date that\'s outside of your data!');
        log('Rendering most recent data instead.');
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
    _.each(chart.pools(), function(pool) {
      pool.render(chart.poolGroup(), chart.renderedData());
    });

    if (poolBasalSettings !== undefined) {
      chart.drawBasalSettingsButton();
    }

    chart.setAtDate(start, atMostRecent);

    return chart;
  };

  chart.getCurrentDay = function() {
    return chart.getCurrentDomain().center;
  };

  chart.createMessage = function(message) {
    log('New message created:', message);
    chart.tidelineData.addDatum(message);
    chart.data(chart.tidelineData);
    chart.emitter.emit('messageCreated', message);
    return chart.tidelineData;
  };

  chart.editMessage = function(message) {
    log('Message timestamp edited:', message);
    // tideline only cares if the edited message was a top-level note
    // not a comment
    if (_.isEmpty(message.parentMessage)) {
      chart.tidelineData.editDatum(message, 'utcTime');
      chart.data(chart.tidelineData);
      chart.emitter.emit('messageTimestampEdited', message);
    }
    return chart.tidelineData;
  };

  chart.closeMessage = function() {
    chart.poolGroup().selectAll('.d3-rect-message').classed('hidden', true);
  };

  chart.drawBasalSettingsButton = function() {
    var labelGroup = chart.svg().select('#tidelineLabels');
    var labelTextBox = chart.options.hiddenPools.basalSettings ?
      labelGroup.select('text#poolBasal_label_0')[0][0].getBBox() :
      labelGroup.select('text#poolBasalSettings_label_0')[0][0].getBBox();
    var verticalTranslation = chart.options.hiddenPools.basalSettings ?
      poolBasal.yPosition() - labelTextBox.height :
      poolBasalSettings.yPosition() - labelTextBox.height;
    var fo = labelGroup.append('foreignObject')
      .attr({
        transform: 'translate(' + (chart.axisGutter() + labelTextBox.width) + ',' + verticalTranslation + ')'
      });

    var div = fo.append('xhtml:div')
      .attr('class', 'd3-tabular-ui');

    var icon = div.append('p')
      .html(chart.options.hiddenPools.basalSettings ?
        '<i class="icon-right"></i>' : '<i class="icon-down"></i>');

    var iconWidth = icon.select('i')[0][0].getBoundingClientRect().width;

    fo.attr({
      width: icon.select('i')[0][0].getBoundingClientRect().width,
      height: div[0][0].getBoundingClientRect().height
    });

    labelGroup.append('text')
      .attr({
        x: chart.axisGutter() + labelTextBox.width + iconWidth,
        y: verticalTranslation + labelTextBox.height,
        'class': 'd3-tabular-ui'
      })
      .text(chart.options.hiddenPools.basalSettings ? 'show rates' : 'hide rates');

    if (chart.options.hiddenPools.basalSettings) {
      labelGroup.selectAll('.d3-tabular-ui')
        .on('click', function() {
          chart.emitter.emit('showBasalSettings');
        });
    }
    else {
      labelGroup.selectAll('.d3-tabular-ui')
        .on('click', function() {
          chart.emitter.emit('hideBasalSettings');
        });
    }
  };

  chart.type = 'daily';

  return create(el, options);
}

module.exports = chartDailyFactory;
