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

import i18next from 'i18next';
import _ from 'lodash';
import { EventEmitter } from 'events';

import { MGDL_UNITS } from '../../js/data/util/constants';

import oneDay from '../../js/oneday';
import fill from '../../js/plot/util/fill';
import { createYAxisBG, createYAxisBolus, createYAxisBasal } from '../../js/plot/util/scales';
import axesDailyx from '../../js/plot/util/axes/dailyx';
import plotZenModeEvent from '../../js/plot/zenModeEvent';
import plotPhysicalActivity from '../../js/plot/physicalActivity';
import plotReservoirChange from '../../js/plot/reservoir';
import plotDeviceParameterChange from '../../js/plot/deviceParameterChange';
import plotConfidentialModeEvent from '../../js/plot/confidentialModeEvent';
import plotCbg from '../../js/plot/cbg';
import plotSmbg from '../../js/plot/smbg';
import plotWizard from '../../js/plot/wizard';
import plotCarb from '../../js/plot/carb';
import plotQuickbolus from '../../js/plot/quickbolus';
import plotBasal from '../../js/plot/basal';
import plotSuspend from '../../js/plot/suspend';
import plotMessage from '../../js/plot/message';
import plotTimeChange from '../../js/plot/timechange';

/**
 * @typedef {import('../../js/tidelinedata').default } TidelineData
 * @typedef {import('../../js/pool').default } Pool
 */


/**
 * Create a 'One Day' chart object that is a wrapper around Tideline components
 * @param {HTMLElement} parentElement The div parent element
 * @param {TidelineData} tidelineData
 * @param {object} options
 * @returns {function}
 */
function chartDailyFactory(parentElement, tidelineData, options = {}) {
  const d3 = window.d3;
  const t = i18next.t.bind(i18next);

  const defaults = {
    bgUnits: MGDL_UNITS,
    labelBaseline: 4,
    timePrefs: {
      timezoneAware: false,
      timezoneName: 'UTC',
    },
    trackMetric: _.noop,
  };
  _.defaults(options, defaults);

  if (!(parentElement instanceof HTMLElement)) {
    throw new Error('Sorry, you must provide a DOM element! :(');
  }

  const width = Math.max(640, parentElement.offsetWidth);
  const height = Math.max(480, parentElement.offsetHeight);
  const emitter = new EventEmitter();
  const chart = oneDay(emitter, options);

  // ***
  // Basic chart set up
  // ***

  chart.id(parentElement.id).width(width).height(height);
  d3.select(parentElement).call(chart);
  // ***
  // Setup Pools
  // ***

  // top x-axis pool
  /** @type {Pool} */
  const poolXAxis = chart.newPool()
    .id('poolXAxis', chart.poolGroup)
    .label('')
    .labelBaseline(options.labelBaseline);
  poolXAxis.index(chart.pools.indexOf(poolXAxis))
    .heightRatio(0.65)
    .gutterWeight(0.0);

  // messages pool
  /** @type {Pool} */
  const poolMessages = chart.newPool()
    .id('poolMessages', chart.poolGroup)
    .label('')
    .labelBaseline(options.labelBaseline);
  poolMessages.index(chart.pools.indexOf(poolMessages))
    .heightRatio(0.5)
    .gutterWeight(0.0);

  // blood glucose data pool
  /** @type {Pool} */
  const poolBG = chart.newPool()
    .id('poolBG', chart.poolGroup)
    .label([{
      'main': t('Glucose'),
      'light': ` (${t(chart.options.bgUnits)})`
    },
    {
      'main': ` & ${t('Events')}`
    }])
    .labelBaseline(options.labelBaseline)
    .legend(['bg']);
  poolBG.index(chart.pools.indexOf(poolBG))
    .heightRatio(2.15)
    .gutterWeight(1.0);

  // carbs and boluses data pool
  /** @type {Pool} */
  const poolBolus = chart.newPool()
    .id('poolBolus', chart.poolGroup)
    .label([{
      'main': t('Bolus'),
      'light': ` (${t('U')})`
    },
    {
      'main': ` & ${t('Carbohydrates')}`,
      'light': ` (${t('g')})`
    }])
    .labelBaseline(options.labelBaseline)
    .legend(['rescuecarbs', 'carbs', 'bolus']);
  poolBolus.index(chart.pools.indexOf(poolBolus))
    .heightRatio(1.35)
    .gutterWeight(1.0);

  // basal data pool
  /** @type {Pool} */
  const poolBasal = chart.newPool()
    .id('poolBasal', chart.poolGroup)
    .label([{
      main: t('Basal Rates'),
      light: ` (${t('U')}/${t('hr')})`
    }])
    .labelBaseline(options.labelBaseline)
    .legend(['basal']);
  poolBasal.index(chart.pools.indexOf(poolBasal))
    .heightRatio(1.0)
    .gutterWeight(1.0);

  chart.arrangePools();
  chart.setAnnotation().setTooltip();

  // add annotations
  chart.annotations.addGroup(chart.svg().select('#' + poolBG.id()), 'smbg');
  chart.annotations.addGroup(chart.svg().select('#' + poolBolus.id()), 'bolus');
  chart.annotations.addGroup(chart.svg().select('#' + poolBolus.id()), 'wizard');
  chart.annotations.addGroup(chart.svg().select('#' + poolBasal.id()), 'basal');

  // add tooltips
  chart.tooltips.addGroup(poolMessages, {
    type: 'deviceEvent',
    shape: 'generic'
  });
  chart.tooltips.addGroup(poolMessages, {
    type: 'message',
    shape: 'generic'
  });
  chart.tooltips.addGroup(poolBG, {
    type: 'cbg',
    classes: ['d3-bg-low', 'd3-bg-target', 'd3-bg-high']
  });
  chart.tooltips.addGroup(poolBG, {
    type: 'smbg'
  });
  chart.tooltips.addGroup(poolBolus, {
    type: 'wizard',
    shape: 'generic'
  });
  chart.tooltips.addGroup(poolBolus, {
    type: 'bolus',
    shape: 'generic'
  });
  chart.tooltips.addGroup(poolBasal, {
    type: 'basal'
  });

  // ***
  // Initialize chart with data
  // ***
  chart.data(tidelineData).setAxes().setNav().setScrollNav();

  // x-axis pools
  // add ticks to top x-axis pool
  poolXAxis.addPlotType('fill', axesDailyx(poolXAxis, {
    'class': 'd3-top',
    emitter,
    leftEdge: chart.axisGutter(),
    timePrefs: chart.options.timePrefs,
    tidelineData,
  }), true, true);

  // setup axis & main y scale
  poolBG.axisScaleFn(createYAxisBG);
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
  }), true, true);

  poolBG.addPlotType('deviceEvent', plotZenModeEvent(poolBG, {
    timezoneAware: chart.options.timePrefs.timezoneAware,
    data: tidelineData.zenEvents,
  }), false, true);

  poolBG.addPlotType('physicalActivity', plotPhysicalActivity(poolBG, {
    bgUnits: chart.options.bgUnits,
    classes: chart.options.bgClasses,
    emitter,
    subdueOpacity: 0.4,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onPhysicalHover: options.onPhysicalHover,
    onPhysicalOut: options.onPhysicalOut,
    data: tidelineData.physicalActivities,
  }), true, true);

  poolBG.addPlotType('deviceEvent', plotReservoirChange(poolBG, {
    bgUnits: chart.options.bgUnits,
    classes: chart.options.bgClasses,
    emitter,
    subdueOpacity: 0.4,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onReservoirHover: options.onReservoirHover,
    onReservoirOut: options.onReservoirOut,
  }), true, true);

  poolBG.addPlotType('deviceEvent', plotDeviceParameterChange(poolBG, {
    bgUnits: chart.options.bgUnits,
    classes: chart.options.bgClasses,
    emitter,
    subdueOpacity: 0.4,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onParameterHover: options.onParameterHover,
    onParameterOut: options.onParameterOut,
    data: tidelineData.deviceParameters,
  }), true, true);

  // add confidential mode to BG pool
  poolBG.addPlotType('deviceEvent', plotConfidentialModeEvent(poolBG, {
    timezoneAware: chart.options.timePrefs.timezoneAware,
    data: tidelineData.confidentialEvents,
    onConfidentialHover: options.onConfidentialHover,
    onConfidentialOut: options.onConfidentialOut,
  }), true, true);

  // add CBG data to BG pool
  poolBG.addPlotType('cbg', plotCbg(poolBG, {
    bgUnits: chart.options.bgUnits,
    classes: chart.options.bgClasses,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onCBGHover: options.onCBGHover,
    onCBGOut: options.onCBGOut,
  }), true, true);

  // add SMBG data to BG pool
  poolBG.addPlotType('smbg', plotSmbg(poolBG, {
    bgUnits: chart.options.bgUnits,
    classes: chart.options.bgClasses,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onSMBGHover: options.onSMBGHover,
    onSMBGOut: options.onSMBGOut,
  }), true, true);

  // setup axis & main y scale
  poolBolus.axisScaleFn(createYAxisBolus);
  // add background fill rectangles to bolus pool
  poolBolus.addPlotType('fill', fill(poolBolus, {
    endpoints: chart.endpoints,
    isDaily: true,
  }), true, true);

  // add wizard data to wizard pool
  poolBolus.addPlotType('wizard', plotWizard(poolBolus, {
    emitter,
    subdueOpacity: 0.4,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onBolusHover: options.onBolusHover,
    onBolusOut: options.onBolusOut,
  }), true, true);

  poolBolus.addPlotType('food', plotCarb(poolBolus, {
    emitter,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onCarbHover: options.onCarbHover,
    onCarbOut: options.onCarbOut,
  }), true, true);

  // quick bolus data to wizard pool
  poolBolus.addPlotType('bolus', plotQuickbolus(poolBolus, {
    emitter,
    subdueOpacity: 0.4,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onBolusHover: options.onBolusHover,
    onBolusOut: options.onBolusOut,
  }), true, true);

  // add confidential mode to Bolus pool
  poolBolus.addPlotType('deviceEvent', plotConfidentialModeEvent(poolBolus, {
    timezoneAware: chart.options.timePrefs.timezoneAware,
    data: tidelineData.confidentialEvents,
    onConfidentialHover: options.onConfidentialHover,
    onConfidentialOut: options.onConfidentialOut,
  }), false, true);

  // setup axis & main y scale
  poolBasal.axisScaleFn(createYAxisBasal);
  // add background fill rectangles to basal pool
  poolBasal.addPlotType('fill', fill(poolBasal, {endpoints: chart.endpoints, isDaily: true}), true, true);

  // add basal data to basal pool
  poolBasal.addPlotType('basal', plotBasal(poolBasal, {
    emitter,
    data: tidelineData.grouped.basal,
    ...tidelineData.opts.timePrefs,
    defaultSource: tidelineData.opts.defaultSource,
  }), true, true);

  // add device suspend data to basal pool
  poolBasal.addPlotType('deviceEvent', plotSuspend(poolBasal, {
    emitter,
    data: tidelineData.grouped.deviceEvent,
    timezoneAware: chart.options.timePrefs.timezoneAware
  }), true, true);

  // add confidential mode to Basal pool
  poolBasal.addPlotType('deviceEvent', plotConfidentialModeEvent(poolBasal, {
    timezoneAware: chart.options.timePrefs.timezoneAware,
    data: tidelineData.confidentialEvents,
    onConfidentialHover: options.onConfidentialHover,
    onConfidentialOut: options.onConfidentialOut,
  }), false, true);

  // messages pool
  // add background fill rectangles to messages pool
  poolMessages.addPlotType('fill', fill(poolMessages, {
    emitter,
    isDaily: true,
    cursor: 'cell'
  }), true, true);

  // add message images to messages pool
  poolMessages.addPlotType('message', plotMessage(poolMessages, {
    size: 30,
    emitter,
    timezoneAware: chart.options.timePrefs.timezoneAware,
  }), true, true);

  // add timechange images to messages pool
  poolMessages.addPlotType('deviceEvent', plotTimeChange(poolMessages, {
    size: 30,
    emitter,
    timezone: chart.options.timePrefs.timezoneName,
  }), true, true);

  return chart;
}

export default chartDailyFactory;
