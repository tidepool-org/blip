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

import Pool from '../../js/pool';
import oneDay from '../../js/oneday';
import fill from '../../js/plot/util/fill';
import { createYAxisBG, createYAxisBolus, createYAxisBasal } from '../../js/plot/util/scales';
import axesDailyx from '../../js/plot/util/axes/dailyx';
import plotZenModeEvent from '../../js/plot/zenModeEvent';
import plotPhysicalActivity from '../../js/plot/physicalActivity';
import plotReservoirChange from '../../js/plot/reservoir';
import plotDeviceParameterChange from '../../js/plot/deviceParameterChange';
import plotConfidentialModeEvent from '../../js/plot/confidentialModeEvent';
import plotWarmUp from '../../js/plot/warmup';
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
  const poolXAxis = new Pool(chart);
  chart.addPool(poolXAxis);
  poolXAxis.id('poolXAxis', chart.poolGroup)
    .heightRatio(0.65)
    .gutterWeight(0.0);

  // messages pool
  /** @type {Pool} */
  const poolMessages = new Pool(chart);
  chart.addPool(poolMessages);
  poolMessages.id('poolMessages', chart.poolGroup)
    .heightRatio(0.5)
    .gutterWeight(0.0);

  // blood glucose data pool
  /** @type {Pool} */
  const poolBG = new Pool(chart);
  chart.addPool(poolBG);
  poolBG.id('poolBG', chart.poolGroup)
    .labels([{
      spans: [{
        text: t('Glucose'),
        className: 'label-main',
      }, {
        text: ` (${t(chart.options.bgUnits)})`,
        className: 'label-light',
      }, {
        text: ` & ${t('Events')}`,
        className: 'label-main',
      }],
      baseline: options.labelBaseline,
    }])
    .legends([{ name: 'bg', baseline: options.labelBaseline }])
    .heightRatio(2.15)
    .gutterWeight(1.0);

  // carbs and boluses data pool
  /** @type {Pool} */
  const poolBolus = new Pool(chart);
  chart.addPool(poolBolus);
  poolBolus.id('poolBolus', chart.poolGroup)
    .labels([{
      spans: [{
        text: t('Bolus'),
        className: 'label-main',
      }, {
        text: ` (${t('U')})`,
        className: 'label-light',
      }, {
        text: ` & ${t('Carbohydrates')}`,
        className: 'label-main',
      }, {
        text: ` (${t('g')})`,
        className: 'label-light',
      }],
      baseline: options.labelBaseline,
    }])
    .legends([{
      name: 'carbs',
      baseline: options.labelBaseline + 18,
    }, {
      name: 'bolus',
      baseline: options.labelBaseline,
    }])
    .heightRatio(1.5)
    .gutterWeight(1.5);

  // basal data pool
  /** @type {Pool} */
  const poolBasal = new Pool(chart);
  chart.addPool(poolBasal);
  poolBasal.id('poolBasal', chart.poolGroup)
    .labels([{
      main: t('Basal Rates'),
      light: ` (${t('U')}/${t('hr')})`,
      spans: [{
        text: t('Basal Rates'),
        className: 'label-main',
      }, {
        text: ` (${t('U')}/${t('hr')})`,
        className: 'label-light',
      }],
      baseline: options.labelBaseline,
    }])
    .legends([{ name: 'basal', baseline: options.labelBaseline }])
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
    tidelineData,
  }), false, true);

  poolBG.addPlotType('physicalActivity', plotPhysicalActivity(poolBG, {
    onPhysicalHover: options.onPhysicalHover,
    onPhysicalOut: options.onTooltipOut,
    tidelineData,
  }), true, true);

  poolBG.addPlotType('deviceEvent', plotReservoirChange(poolBG, {
    onReservoirHover: options.onReservoirHover,
    onReservoirOut: options.onTooltipOut,
  }), true, true);

  poolBG.addPlotType('deviceEvent', plotDeviceParameterChange(poolBG, {
    tidelineData,
    onParameterHover: options.onParameterHover,
    onParameterOut: options.onTooltipOut,
  }), true, true);

  poolBG.addPlotType('deviceEvent', plotWarmUp(poolBG, {
    tidelineData,
    onWarmUpHover: options.onWarmUpHover,
    onWarmUpOut: options.onTooltipOut,
  }), true, true);

  // add confidential mode to BG pool
  poolBG.addPlotType('deviceEvent', plotConfidentialModeEvent(poolBG, {
    tidelineData,
    onConfidentialHover: options.onConfidentialHover,
    onConfidentialOut: options.onTooltipOut,
  }), true, true);

  // add CBG data to BG pool
  poolBG.addPlotType('cbg', plotCbg(poolBG, {
    bgUnits: chart.options.bgUnits,
    classes: chart.options.bgClasses,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onCBGHover: options.onCBGHover,
    onCBGOut: options.onTooltipOut,
  }), true, true);

  // add SMBG data to BG pool
  poolBG.addPlotType('smbg', plotSmbg(poolBG, {
    bgUnits: chart.options.bgUnits,
    classes: chart.options.bgClasses,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onSMBGHover: options.onSMBGHover,
    onSMBGOut: options.onTooltipOut,
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
    subdueOpacity: 0.4,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onBolusHover: options.onBolusHover,
    onBolusOut: options.onTooltipOut,
  }), true, true);

  poolBolus.addPlotType('food', plotCarb(poolBolus, {
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onCarbHover: options.onCarbHover,
    onCarbOut: options.onTooltipOut,
  }), true, true);

  // quick bolus data to wizard pool
  poolBolus.addPlotType('bolus', plotQuickbolus(poolBolus, {
    subdueOpacity: 0.4,
    timezoneAware: chart.options.timePrefs.timezoneAware,
    onBolusHover: options.onBolusHover,
    onBolusOut: options.onTooltipOut,
  }), true, true);

  // add confidential mode to Bolus pool
  poolBolus.addPlotType('deviceEvent', plotConfidentialModeEvent(poolBolus, {
    tidelineData,
    onConfidentialHover: options.onConfidentialHover,
    onConfidentialOut: options.onTooltipOut,
  }), false, true);

  // setup axis & main y scale
  poolBasal.axisScaleFn(createYAxisBasal);
  // add background fill rectangles to basal pool
  poolBasal.addPlotType('fill', fill(poolBasal, {endpoints: chart.endpoints, isDaily: true}), true, true);

  // add basal data to basal pool
  poolBasal.addPlotType('basal', plotBasal(poolBasal, {
    defaultSource: tidelineData.opts.defaultSource,
  }), true, true);

  // add device suspend data to basal pool
  poolBasal.addPlotType('deviceEvent', plotSuspend(poolBasal, {}), true, true);

  // add confidential mode to Basal pool
  poolBasal.addPlotType('deviceEvent', plotConfidentialModeEvent(poolBasal, {
    tidelineData,
    onConfidentialHover: options.onConfidentialHover,
    onConfidentialOut: options.onTooltipOut,
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
  }), true, true);

  // add timechange images to messages pool
  poolMessages.addPlotType('deviceEvent', plotTimeChange(poolMessages, {
    size: 30,
  }), true, true);

  return chart;
}

export default chartDailyFactory;
