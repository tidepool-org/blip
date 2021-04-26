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

/**
 * @typedef {import('./tidelinedata').Datum} Datum
 * @typedef {{ trackMetric: (s: string, p: object) => void }} OneDayOptions
 * @typedef {import('./pool').default} Pool
 */

import _ from 'lodash';
import bows from 'bows';
import moment from 'moment-timezone';

import { MS_IN_DAY } from './data/util/constants';
import mkAnnotation from './plot/util/annotations/annotation';
import Tooltips from './plot/util/tooltips/tooltip';
import TidelineData from './tidelinedata';

/**
 *
 * @param {import('events').EventEmitter} emitter
 * @param {OneDayOptions} options
 * @returns {function} The chart manager displaying one day of diabetes data.
 */
function oneDay(emitter, options = {}) {
  const d3 = window.d3;
  /** @type {Console} */
  const log = bows('OneDay');

  _.defaults(options, { trackMetric: _.noop });

  // basic attributes
  const nav = {
    scrollNav: true,
    scrollNavHeight: 50,
    scrollGutterHeight: 20,
    scrollThumbRadius: 24,
    currentTranslation: 0,
    latestTranslation: 0,
    maxTranslation: 0,
    /** @type {d3.AxisScale<Date>} */
    scrollScale: null,
    /** @type {d3.ZoomBehavior} */
    pan: null,
    /** @type {d3.DragBehavior} */
    drag: null,
  };
  /** How much time a click on pan back/forward takes (in ms): For 1 day */
  const transitionDelayFast = 500;
  /** How much time a click on pan back/forward takes (in ms): For more than 1 day */
  const transitionDelaySlow = 1000;
  /** How much time we delay the update of the date title + viz widgets (in ms) */
  const navigatedDelay = 200;
  const minHeight = 400;
  const minWidth = 300;
  const axisGutter = 40;
  /** The number of days we pre-render the SVG */
  const renderDaysBuffer = 2;

  /** @type {Datum[]} The currently rendered data */
  let renderedData = [];
  /**
   * The dates (in ms) we asked data for from TidelineData.
   *
   * Used to know if we need to re-fetch new data from it, and
   * perform a new SVG render.
   */
  const renderedDataRange = {
    start: Number.MAX_SAFE_INTEGER,
    end: Number.MIN_SAFE_INTEGER,
  };
  /** true when click on pan back/forward a day, during the translation */
  let inTransition = false;
  let width = minWidth;
  let height = minHeight;
  let poolScaleHeight = 0;
  let gutter = 40;
  let id = 'tidelineSVGOneDay';
  let scrollHandleTrigger = true;

  function container(selection) {
    container.mainSVG = selection.append('svg');
    container.mainGroup = container.mainSVG.append('g').attr('id', 'tidelineMainSVG');
    // update SVG dimenions and ID
    container.mainSVG.attr({
      'id': id,
      'width': width,
      'height': height
    });

    container.poolGroup = container.mainGroup.append('g').attr('id', 'tidelinePools').attr('clip-path', 'url(#mainClipPath)');
    container.mainGroup.append('g').attr('id', 'tidelineLabels');
    container.mainGroup.append('g').attr('id', 'tidelineYAxes');

    if (nav.scrollNav) {
      container.scrollNav = container.mainGroup.append('g')
        .attr('class', 'x scroll')
        .attr('id', 'tidelineScrollNav');
    }
    container.mainSVG.insert('clipPath', '#tidelineMainSVG')
      .attr('id', 'mainClipPath')
      .append('rect')
      .attr({
        'x': axisGutter,
        'y': 0,
        'width': container.width() - axisGutter,
        'height': container.height()
      });
    log.debug('Container initialized');
  }

  /** @type {Pool[]} */
  container.pools = [];
  /** @type {Date[]} */
  container.endpoints = [];
  /** @type {Date[]} */
  container.initialEndpoints = [];
  /** @type {{[x: string]: boolean}} For each pool, what type of data it accept */
  container.dataFill = {};
  container.emitter = emitter;
  container.options = options;
  container.type = 'daily';
  // container.axisGutter = axisGutter;
  /** @type {SVGElement} */
  container.mainSVG = null;
  /** @type {SVGGElement} */
  container.mainGroup = null;
  /** @type {SVGGElement} */
  container.poolGroup = null;
  /** @type {SVGGElement} */
  container.scrollNav = null;
  /** @type {Tooltips|null} */
  container.tooltips = null;
  container.annotations = null;
  /** @type {d3.AxisScale<Date>} */
  container.xScale = d3.time.scale.utc();
  /** @type {TidelineData} */
  container.tidelineData = null;

  /**
   * To be updated by the daily view.
   * If true, we won't perform the 'zoom' -> scroll the view
   * while loading.
   */
  container.loadingInProgress = false;

  container.emitter.on('clickInPool', ({ offsetX /*, datum */ }) => {
    // Event use when we want to add a message (note)
    /** @type {Date} */
    const date = container.xScale.invert(offsetX - axisGutter);
    // For some reason, d3 seems to apply the current locale date offset
    // to this date, so we need to substract it.
    const now = new Date();
    const m = moment.utc(date).subtract(now.getTimezoneOffset(), 'minutes');
    container.emitter.emit('clickToDate', m);
  });

  /**
   * Throttle the navigated event, we do not need so much updates.
   * It also slow everything too much.
   * Blip chart view (daily/trends) listen to this event.
   */
  container.throttleNavigated = _.debounce(() => {
    const { center } = container.getCurrentDomain();
    container.emitter.emit('navigated', center.valueOf());
  }, navigatedDelay);

  /**
   * Use to:
   * - Disable the ← → buttons on the nav bar (blip/Header)
   * - DailyX sticky label transparency
   * @param {boolean} value true if in transition
   */
  container.inTransition = (value) => {
    inTransition = value;
    container.emitter.emit('inTransition', value);
  };

  /**
   * Scroll the daily view to a specific date
   * @param {Date} date The date to translate
   * @param {number} transitionDelay In ms the time to do the translation
   */
  container.panToDate = function panToDate(date, transitionDelay = transitionDelayFast) {
    if (container.loadingInProgress) {
      return;
    }

    const domain = container.getCurrentDomain();
    const nDays = Math.round(10 * (date.valueOf() - domain.center.valueOf()) / MS_IN_DAY) / 10.0;
    options.trackMetric('Daily - pan to date', { direction: nDays > 0 ? 'forward': 'back', nDays: Math.abs(nDays) });

    const currentPosition = container.xScale(domain.center);
    const wantedPosition = container.xScale(date);
    let translationAmount = wantedPosition - currentPosition;
    if (nav.currentTranslation - translationAmount < 0) {
      translationAmount = nav.currentTranslation;
    } else if (nav.currentTranslation - translationAmount > nav.maxTranslation) {
      translationAmount = nav.currentTranslation - nav.maxTranslation;
    }

    let nUgly = 0;
    nav.currentTranslation -= translationAmount;
    container.inTransition(true);
    container.mainGroup.transition()
      .duration(transitionDelay)
      .tween('zoom', () => {
        const ix = d3.interpolate(nav.currentTranslation + translationAmount, nav.currentTranslation);
        return (t) => {
          nav.pan.translate([ix(t), 0]);
          // Trigger the zoom events on nav.pan
          nav.pan.event(container.mainGroup);
        };
      })
      .each(() => ++nUgly)
      .each('end', () => {
        // this ugly solution courtesy of the man himself:
        // https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ
        if (!--nUgly) {
          container.navString(true);
          container.inTransition(false);
        }
      });
  };

  container.panForward = function() {
    const domain = container.getCurrentDomain();
    container.panToDate(new Date(domain.center.valueOf() + MS_IN_DAY));
  };

  container.panBack = function() {
    const domain = container.getCurrentDomain();
    container.panToDate(new Date(domain.center.valueOf() - MS_IN_DAY));
  };

  /**
   *
   * @param {Pool} pool
   * @returns {number} Pool index position
   */
  container.addPool = function addPool(pool) {
    const idx = container.pools.length;
    container.pools.push(pool);
    return idx;
  };

  container.poolScaleHeight = function(pools) {
    if (!arguments.length) return poolScaleHeight;

    let cumHeightRatio = 0;
    let cumGutterWeight = 0;
    pools.forEach((pool) => {
      cumHeightRatio += pool.heightRatio();
      cumGutterWeight += pool.gutterWeight();
    });
    gutter = 0.25 * (container.height() / cumHeightRatio);
    const totalPoolsHeight = container.height() - nav.scrollNavHeight - (cumGutterWeight * gutter);
    poolScaleHeight = totalPoolsHeight / cumHeightRatio;
    return container;
  };

  container.arrangePools = function() {
    const visiblePools = container.pools.filter((pool) => !pool.hidden());
    container.poolScaleHeight(visiblePools);
    visiblePools.forEach((pool) => {
      pool.height(poolScaleHeight);
    });
    let currentYPosition = 0;
    visiblePools.forEach((pool) => {
      currentYPosition += gutter * pool.gutterWeight();
      pool.yPosition(currentYPosition);
      currentYPosition += pool.height();
      pool.group().attr('transform', 'translate(0,' + pool.yPosition() + ')');
      if (pool.hidden()) {
        pool.group().attr('display', 'none');
      }
    });
  };

  container.getCurrentDomain = function() {
    /** @type {Date[]} */
    const currentDomain = container.xScale.domain();
    const start = currentDomain[0];
    const end = currentDomain[1];
    const center = new Date(start.valueOf() + MS_IN_DAY / 2);
    return { start, end, center };
  };

  /**
   * Update the navigation datetime & button back/forth day
   * in blip daily view
   * @param {boolean} force Emit 'navigated' event without delay
   */
  container.navString = function navString(force = false) {
    const domain = container.getCurrentDomain();

    if (force) {
      container.emitter.emit('navigated', domain.center.valueOf());
    } else if (!inTransition) {
      container.throttleNavigated();
    }
    // else {
      // - Pan back/forward in progress
      // - Manual scrolling with the bar
      // If true, it will be done at the transition end, we do not want
      // to do it now, because is slow the scrolling too much
    // }
  };

  // getters only
  container.svg = () => container.mainSVG;
  container.axisGutter = () => axisGutter;

  container.isUpdateRenderedDataRangeNeeded = function() {
    if (renderedData.length > 0) {
      /** @type {[Date, Date]} */
      const displayedDomain = container.xScale.domain();
      const startDisplayDate = displayedDomain[0].valueOf();
      const endDisplayDate = displayedDomain[1].valueOf();

      const isNeeded =
        renderedDataRange.start > startDisplayDate
        || startDisplayDate > renderedDataRange.end
        || renderedDataRange.start > endDisplayDate
        || endDisplayDate > renderedDataRange.end;

      return isNeeded;
    }

    return true;
  };

  // chainable methods
  container.setAxes = function() {
    const { xScale } = container;
    // set the domain and range for the main tideline x-scale
    xScale.domain([container.initialEndpoints[0], container.initialEndpoints[1]]);
    xScale.range([axisGutter, width]);

    nav.maxTranslation = -xScale(container.endpoints[0]) + axisGutter;
    if (nav.scrollNav) {
      nav.scrollScale = d3.time.scale.utc()
        .domain([container.endpoints[0], container.initialEndpoints[0]])
        .range([axisGutter + nav.scrollThumbRadius, width - nav.scrollThumbRadius]);
    }

    container.pools.forEach((pool) => {
      pool.xScale(xScale.copy());
    });

    return container;
  };

  /**
   * Render the data to the SVG.
   * @param {boolean} force True to force a re-render after new data where loaded from the API
   */
  container.renderPoolsData = function(force = false) {
    if (force || container.isUpdateRenderedDataRangeNeeded()) {
      container.updateRenderedData();
      if (renderedData.length > 0) {
        const pools = container.pools;
        for (let i = 0; i < pools.length; i++) {
          pools[i].render(container.poolGroup, renderedData, force);
        }
      }
    }
  };

  /**
   * 'zoomstart' & 'zoomend' events used by dailyX to change the transparency
   * of the sticky date.
   */
  container.onZoomStart = () => container.emitter.emit('zoomstart');

  container.onZoom = () => {
    const { xScale, pools, mainGroup, loadingInProgress } = container;

    if (loadingInProgress) {
      return;
    }

    const { maxTranslation } = nav;
    /** @type {d3.D3ZoomEvent} */
    const e = d3.event;
    /** @type {number} */
    let translateX = e.translate[0];

    if (translateX < 0) {
      translateX = 0;
    } else if (translateX > maxTranslation) {
      translateX = maxTranslation;
    }

    nav.latestTranslation = translateX;
    nav.pan.translate([translateX, 0]);
    for (let i = 0; i < pools.length; i++) {
      pools[i].pan(translateX);
    }

    /** @type {[Date, Date]} Get the new domain (scroll date position) */
    const domain = xScale.domain();

    mainGroup.select('#tidelineTooltips').attr('transform', `translate(${translateX},0)`);
    mainGroup.select('#tidelineAnnotations').attr('transform', `translate(${translateX},0)`);
    if (scrollHandleTrigger) {
      mainGroup.select('.scrollThumb').transition().ease('linear').attr('x', (d) => {
        d.x = nav.scrollScale(domain[0]);
        return d.x - nav.scrollThumbRadius;
      });
    } else {
      mainGroup.select('.scrollThumb').attr('x', (d) => {
        d.x = nav.scrollScale(domain[0]);
        return d.x - nav.scrollThumbRadius;
      });
    }

    container.renderPoolsData();

    // Update the dailyX sticky label
    emitter.emit('dailyx-navigated', domain[0].valueOf());
  };

  container.onZoomEnd = () => {
    const { xScale, emitter } = container;
    emitter.emit('zoomend');
    nav.currentTranslation = nav.latestTranslation;

    container.navString();

    if (!scrollHandleTrigger) {
      container.mainGroup.select('.scrollThumb').attr('x', (/* d */) => {
        return nav.scrollScale(xScale.domain()[0]) - nav.scrollThumbRadius;
      });
    }
    scrollHandleTrigger = true;
  };

  container.setNav = function() {
    const { xScale } = container;
    nav.pan = d3.behavior.zoom();
    nav.pan.scaleExtent([1, 1]);
    nav.pan.x(xScale);
    nav.pan.on('zoomstart', container.onZoomStart);
    nav.pan.on('zoom', container.onZoom);
    nav.pan.on('zoomend', container.onZoomEnd);
    container.mainGroup.call(nav.pan);

    return container;
  };

  /** Drag on the scrollbar below the daily graph */
  container.onDragStart = () => {
    // silence the click-and-drag listener
    d3.event.sourceEvent.stopPropagation();
    // Used by dailyX to make the 'stickyLabel' (previous day date) transparent:
    container.inTransition(true);
  };
  container.onDrag = function(/** @type {{x: Number, y: number}} */ dragValues) {
    if (container.loadingInProgress) {
      return;
    }

    // Must be kept as a function(): 'this' is use here
    const dxLeftest = nav.scrollScale.range()[0];
    const dxRightest = nav.scrollScale.range()[1];

    dragValues.x += d3.event.dx;
    if (dragValues.x > dxRightest) {
      dragValues.x = dxRightest;
    } else if (dragValues.x < dxLeftest) {
      dragValues.x = dxLeftest;
    }
    // Here 'this' is the scrollThumb (<rect class="scrollThumb" />)
    // The drag 'line' on the scrollbar
    d3.select(this).attr('x', (d) => d.x - nav.scrollThumbRadius);
    const date = nav.scrollScale.invert(dragValues.x);
    nav.currentTranslation += -container.xScale(date) + axisGutter;
    scrollHandleTrigger = false;
    nav.pan.translate([nav.currentTranslation, 0]);
    nav.pan.event(container.mainGroup);
  };

  container.onDragEnd = () => {
    container.navString(true);
    container.inTransition(false);
  };

  container.setScrollNav = function() {
    container.scrollNav.selectAll('line').remove();
    container.scrollNav.attr('transform', 'translate(0,' + (height - (nav.scrollNavHeight * 2/5)) + ')')
      .insert('line', '.scrollThumb')
      .attr({
        'stroke-width': nav.scrollGutterHeight,
        // add and subtract 1/2 of scrollGutterHeight because radius of linecap is 1/2 of stroke-width
        'x1': axisGutter + nav.scrollGutterHeight/2,
        'x2': width - nav.scrollGutterHeight/2,
        'y1': 0,
        'y2': 0
      });

    nav.drag = d3.behavior.drag()
      .origin((d) => d)
      .on('dragstart', container.onDragStart)
      .on('drag', container.onDrag)
      .on('dragend', container.onDragEnd);

    container.scrollNav.selectAll('rect')
      .data([{'x': nav.scrollScale(container.initialEndpoints[0]), 'y': 0}])
      .enter()
      .append('rect')
      .attr({
        'x': (d) => d.x - nav.scrollThumbRadius,
        'y': -nav.scrollThumbRadius/3,
        'width': nav.scrollThumbRadius * 2,
        'height': nav.scrollThumbRadius/3 * 2,
        'rx': nav.scrollThumbRadius/3,
        'class': 'scrollThumb'
      })
      .call(nav.drag);

    return container;
  };

  container.setAnnotation = function() {
    const annotationGroup = container.mainGroup.append('g')
      .attr({
        id: 'tidelineAnnotationsOuter',
        'clip-path': 'url(#mainClipPath)'
      })
      .append('g')
      .attr('id', 'tidelineAnnotations');

    container.annotations = mkAnnotation(container, annotationGroup).id(annotationGroup.attr('id'));
    container.pools.forEach((pool) => pool.annotations(container.annotations));
    return container;
  };

  container.setTooltip = function() {
    const tooltipGroup = container.mainGroup.append('g');
    tooltipGroup.attr('id', 'tidelineTooltips');
    container.tooltips = new Tooltips(container, tooltipGroup).id(tooltipGroup.attr('id'));
    return container;
  };

  /**
   *
   * @param {number | null} epochLocation The date to display (center of view)
   * @param {boolean} toMostRecent true if we want to jump to the most recent date
   */
  container.setAtDate = function setAtDate(epochLocation, toMostRecent = false) {
    scrollHandleTrigger = toMostRecent;
    if (toMostRecent) {
      if (epochLocation === null) {
        // Click on the most recent button
        // do a smooth
        const domain = container.getCurrentDomain();
        const newDateMS = container.initialEndpoints[1].valueOf() - MS_IN_DAY / 2;
        const transitionDelay = Math.abs(domain.center.valueOf() - newDateMS) > MS_IN_DAY ? transitionDelaySlow : transitionDelayFast;
        container.panToDate(new Date(newDateMS), transitionDelay);
      } else {
        nav.pan.translate([0,0]);
        nav.pan.event(container.mainGroup);
      }
    } else {
      // This may look counter intuitive at first
      // But it is needed in the following case:
      // We have scroll far enough in the past
      // to require a renderPoolsData(), then we switch
      // to another view (basics, trends whatever)
      // and come back.
      // Almost nothing is render.
      // We need to perform a pre-rendering, to be sure
      // everything is in place
      container.renderPoolsData();

      const start = new Date(epochLocation - MS_IN_DAY/2);
      nav.currentTranslation = -container.xScale(start) + axisGutter;
      nav.pan.translate([nav.currentTranslation, 0]);
      nav.pan.event(container.mainGroup);
    }
  };

  container.destroy = function() {
    log.info('Destroying chart container...');
    container.emitter.removeAllListeners();
    container.mainSVG.remove();
    container.pools.forEach(pool => pool.destroy());
    // Help the garbage collector
    // we leak too much memory already
    emitter = null;
    options = null;
    renderedData = null;
    nav.pan = null;
    nav.scrollScale = null;
    nav.drag = null;
    container.xScale = null;
    container.annotations = null;
    container.tooltips = null;
    container.mainSVG = null;
    container.mainGroup = null;
    container.poolGroup = null;
    container.scrollNav = null;
    container.dataFill = null;
    container.endpoints = null;
    container.initialEndpoints = null;
    container.emitter = null;
    container.options = null;
    container.pools = null;
    container.throttleNavigated = null;
    container.tidelineData = null;
  };

  // getters and setters
  container.id = function(x) {
    if (!arguments.length) return id;
    if (x.search('tideline') !== -1) {
      id = x.replace('tideline', 'tidelineSVGOneDay');
    } else {
      id = 'tidelineSVGOneDay';
    }
    return container;
  };

  container.width = function(x) {
    if (!arguments.length) return width;
    if (x >= minWidth) {
      width = x;
    } else {
      width = minWidth;
    }
    return container;
  };

  container.height = function(x) {
    if (!arguments.length) return height;
    let totalHeight = x;
    if (nav.scrollNav) {
      totalHeight += nav.scrollNavHeight;
    }
    if (totalHeight >= minHeight) {
      height = x;
    } else {
      height = minHeight;
    }
    return container;
  };

  container.latestTranslation = function(x) {
    log.debug('latestTranslation', { x, latestTranslation: nav.latestTranslation });
    if (!arguments.length) return nav.latestTranslation;
    nav.latestTranslation = x;
    return container;
  };

  container.currentTranslation = function(x) {
    if (!arguments.length) return nav.currentTranslation;
    nav.currentTranslation = x;
    return container;
  };

  container.data = function(/** @type {TidelineData} */ td) {
    if (td instanceof TidelineData) {
      container.tidelineData = td;
    } else if (container.tidelineData === null) {
      return [];
    } else {
      return container.tidelineData.data;
    }

    if (_.isEmpty(td.data)) {
      throw new Error("Sorry, I can't render anything without /some/ data.");
    } else if (td.data.length < 2) {
      throw new Error("Sorry, I can't render anything with only *one* datapoint.");
    }

    const lastTimezone = td.getLastTimezone();
    const first = moment.utc(td.endpoints[0]);
    const last = moment.utc(td.endpoints[1]);

    if (last.valueOf() - first.valueOf() < MS_IN_DAY) {
      log.error("The endpoints of your data are less than 24 hours apart.");
    }

    const minusOne = moment.utc(last).tz(lastTimezone);
    minusOne.subtract(1, 'day');
    // initialEndpoints ~= set the zoom (time axis) value of the displayed chart
    container.initialEndpoints = [minusOne.toDate(), last.toDate()];
    container.endpoints = [first.toDate(), last.toDate()];

    return container;
  };

  container.updateRenderedData = function rData() {
    if (container.tidelineData.dataByDate === null) {
      // FIXME: We may have some nasty callback here
      // We are currently fetching&processing data from the API
      log.warn('FIXME: updateRenderedData: tidelineData.dataByDate is null');
      renderedData = [];
      renderedDataRange.start = Number.MAX_SAFE_INTEGER;
      renderedDataRange.end = Number.MIN_SAFE_INTEGER;
    } else {
      const domain = container.xScale.domain();
      const start = moment.utc(domain[0]).subtract(renderDaysBuffer, 'day');
      const end = moment.utc(domain[1]).add(renderDaysBuffer, 'day');
      renderedDataRange.start = start.valueOf();
      renderedDataRange.end = end.valueOf();
      start.subtract(this.tidelineData.maxDuration + 1, 'milliseconds');
      end.add(1, 'millisecond'); // +1ms to be sure we have them
      const filtered = container.tidelineData.dataByDate.filter([start.toISOString(), end.toISOString()]);
      renderedData = filtered.top(Infinity).reverse();
      const rangeStart = renderedDataRange.start - 1; // -1ms to be sure we have them
      // Only keep data which ends after our range
      renderedData = renderedData.filter((d) => d.epoch > rangeStart || (Number.isInteger(d.epochEnd) && d.epochEnd > rangeStart));
    }
  };

  container.createMessage = async (message) => {
    const nAdded = await container.tidelineData.addData([message]);
    if (nAdded > 0) {
      // We can assume chart.tidelineData.grouped.message is an array
      const tdMessage = container.tidelineData.grouped.message.find((d) => d.id === message.id);
      if (typeof tdMessage === 'object') {
        container.emitter.emit('messageCreated', tdMessage);
        return true;
      }
    }
    return false;
  };

  container.editMessage = (message) => {
    const updateMessage = container.tidelineData.editMessage(message);
    if (updateMessage !== null) {
      container.emitter.emit('messageEdited', updateMessage);
      return true;
    }
    return false;
  };

  return container;
}

export default oneDay;
