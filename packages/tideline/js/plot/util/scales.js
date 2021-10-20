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
 * @typedef { import('d3').ScaleLinear<number, number> } ScaleLinear
 * @typedef { import('d3').ScalePower<number, number> } ScalePower
 * @typedef { import('d3').Axis } Axis
 * @typedef { import('../../../js/tidelinedata').default } TidelineData
 * @typedef { import('../../../js/tidelinedata').Datum } Datum
 * @typedef { import('../../pool').default} Pool
 */

import _ from "lodash";

import commonbolus from "./commonbolus";
import { MGDL_UNITS, DEFAULT_BG_BOUNDS } from "../../data/util/constants";
import format from "../../data/util/format";

/**
 * @param {TidelineData} tidelineData
 * @param {"mg/dL" | "mmol/L"} bgUnits
 * @return {number}
 */
function getTargetBoundary(tidelineData, bgUnits = MGDL_UNITS) {
  const defaultTarget = DEFAULT_BG_BOUNDS[bgUnits].targetUpper;
  return _.get(tidelineData, "opts.bgClasses.target.boundary", defaultTarget);
}

/**
 * Create a d3.scale
 * @param {TidelineData} tidelineData
 * @param {Pool} pool Parent pool
 * @param {[number, number]} extent
 * @param {number} pad padding
 * @returns {ScaleLinear}
 */
function createScaleBG(tidelineData, pool, extent, pad) {
  const MAX_CBG_MGDL = 401;
  const MAX_CBG_MMOLL = format.convertBG(MAX_CBG_MGDL, MGDL_UNITS);

  const d3 = window.d3;
  /** @type {"mg/dL" | "mmol/L"} */
  const bgUnits = _.get(tidelineData, "opts.bgUnits", MGDL_UNITS);
  /** @type {number} */
  const targetBoundary = getTargetBoundary(tidelineData, bgUnits);
  const maxCBG = bgUnits === MGDL_UNITS ? MAX_CBG_MGDL : MAX_CBG_MMOLL;

  // We need to ensure that the top of the bgScale is at least at the the target upper bound
  // for proper rendering of datasets with no BG values above this mark.
  extent[1] = _.max([extent[1], targetBoundary]);

  const range = [pool.height() - pad, pad];
  const domain = [0, Math.min(extent[1], maxCBG)];
  const scale = d3.scale.linear();

  scale.domain(domain).range(range);

  if (extent[1] > maxCBG || extent[0] === extent[1]) {
    scale.clamp(true);
  }

  if (!Number.isFinite(scale(70))) {
    console.warn("createScaleBG: scale is not well initialized", { extent, maxCBG, bgUnits, range, domain });
  }

  return scale;
}

/**
 * @param {TidelineData} tidelineData
 * @param {[number, number]} extent
 * @returns {string[]} The displayed ticks
 */
function createTicksBG(tidelineData, extent) {
  /** @type {"mg/dL" | "mmol/L"} */
  const bgUnits = _.get(tidelineData, "opts.bgUnits", MGDL_UNITS);
  const bgValues = _.values(_.omit(tidelineData.opts.bgClasses, ["very-high", "very-low"]));
  const ticks = _.map(bgValues, (n) => format.tooltipBGValue(_.get(n, "boundary"), bgUnits));
  ticks.sort((a, b) => a - b);
  const targetBoundary = getTargetBoundary(tidelineData, bgUnits);

  if (extent[0] === extent[1]) {
    extent[1] = _.max([extent[1], targetBoundary]);
  }
  // if the min of our data is greater than any of the defaultTicks, remove that tick
  ticks.forEach((tick) => {
    if (extent[1] < tick) {
      ticks.pop();
    }
  });
  return ticks;
}

/**
 * Create the Y-Axis SVG and scale for BG graph
 * @param {TidelineData} tidelineData
 * @param {Pool} pool Parent pool
 * @returns {{ axis: Axis, scale: ScaleLinear }}
 */
export function createYAxisBG(tidelineData, pool) {
  const d3 = window.d3;
  const SMBG_SIZE = 16;

  const allBG = tidelineData.grouped.cbg.concat(tidelineData.grouped.smbg);
  /** @type {[number, number]} */
  const extent = d3.extent(allBG, (d) => d.value);
  const scale = createScaleBG(tidelineData, pool, Array.from(extent), SMBG_SIZE/2);
  const ticks = createTicksBG(tidelineData, Array.from(extent));
  const bgTickFormat = tidelineData.opts.bgUnits === MGDL_UNITS ? "d" : ".1f";

  const axis = d3.svg.axis()
    .scale(scale)
    .orient("left")
    .outerTickSize(0)
    .tickValues(ticks)
    .tickFormat(d3.format(bgTickFormat));
  return { axis, scale };
}

/**
 * @param {Datum[]} data
 * @param {Pool} pool
 * @returns {ScalePower}
 */
function createScaleBolus(data, pool) {
  const bolusRatio = 0.35;
  const d3 = window.d3;
  const poolHeight = pool.height();
  // for boluses the recommended can exceed the value
  /** @type {number} */
  const maxValue = data.reduce((p, c) => {
    /** @type{number} */
    const v = commonbolus.getProgrammed(c);
    return Math.max(p, (Number.isFinite(v) ? v : 0));
  }, 0);
  const bolusDomain = [0, maxValue];
  const bolusRange = [poolHeight, bolusRatio * poolHeight];
  return d3.scale.sqrt().domain(bolusDomain).range(bolusRange);
}

/**
 * Create the Y-Axis scale for bolus & carbs graph
 * @param {TidelineData} tidelineData
 * @param {Pool} pool Parent pool
 * @returns {{ axis: Axis, scale: ScalePower }}
 */
export function createYAxisBolus(tidelineData, pool) {
  const d3 = window.d3;

  const allBolus = tidelineData.grouped.bolus.concat(tidelineData.grouped.wizard);
  const scale = createScaleBolus(allBolus, pool);
  // set up y-axis for bolus
  const bolusTickValues = [0, 1, 5, 10];
  const maxBolusValue = scale.domain()[1];
  // Add additional legends
  while (maxBolusValue > bolusTickValues[bolusTickValues.length - 1] && bolusTickValues.length < 7) {
    const currentMax = bolusTickValues[bolusTickValues.length - 1];
    const bolusTick = currentMax < 20 ? 5 : 10;
    // [0, 5, 10, 15, 20, 30, 40]
    bolusTickValues.push(currentMax + bolusTick);
  }

  const axis = d3.svg.axis()
    .scale(scale)
    .orient("left")
    .outerTickSize(0)
    .ticks(2)
    .tickValues(bolusTickValues);

  return { axis, scale };
}

/**
 * @param {Datum[]} data
 * @param {Pool} pool
 * @returns {ScaleLinear}
 */
function createScaleBasal(data, pool) {
  const d3 = window.d3;
  const scale = d3.scale.linear();
  scale.domain([0, d3.max(data, (d) => d.rate) * 1.1]);
  scale.rangeRound([pool.height(), 0]);
  return scale;
}

/**
 * Create the Y-Axis SVG and scale for basal graph
 * @param {TidelineData} tidelineData
 * @param {Pool} pool Parent pool
 * @returns {{ axis: Axis, scale: ScaleLinear }}
 */
export function createYAxisBasal(tidelineData, pool) {
  const d3 = window.d3;
  const scale = createScaleBasal(tidelineData.grouped.basal, pool);
  const axis = d3.svg.axis()
    .scale(scale)
    .orient("left")
    .outerTickSize(0)
    .ticks(2);

  return { axis, scale };
}
