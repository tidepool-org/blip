/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import * as common from './common';

export function processBasalRateData(scheduleData) {
  const starts = scheduleData.value.map(s => s.start);
  const noData = [{ start: '-', rate: '-' }];

  if (starts.length === 0) {
    return noData;
  } else if (starts.length === 1) {
    if (Number(common.getBasalRate(scheduleData.value, starts[0])) === 0) {
      return noData;
    }
  }

  const data = starts.map((startTime) => ({
    start: common.getFormattedTime(
      startTime
    ),
    rate: common.getBasalRate(
      scheduleData.value,
      startTime
    ),
  }));

  data.push({
    start: 'Total',
    rate: common.getTotalBasalRates(scheduleData.value),
  });

  return data;
}

export function processBgTargetData(targetsData, bgUnits, keys) {
  const starts = targetsData.map(s => s.start);

  return starts.map((startTime) => ({
    start: common.getFormattedTime(
      startTime
    ),
    columnTwo: common.getBloodGlucoseValue(
      targetsData,
      keys.columnTwo,
      startTime,
      bgUnits
    ),
    columnThree: common.getBloodGlucoseValue(
      targetsData,
      keys.columnThree,
      startTime,
      bgUnits
    ),
  }));
}

export function processCarbRatioData(carbRatioData) {
  const starts = carbRatioData.map(s => s.start);
  return starts.map((startTime) => ({
    start: common.getFormattedTime(
      startTime
    ),
    amount: common.getValue(
      carbRatioData,
      'amount',
      startTime
    ),
  }));
}

export function processSensitivityData(sensitivityData, bgUnits) {
  const starts = sensitivityData.map(s => s.start);
  return starts.map((startTime) => ({
    start: common.getFormattedTime(
      startTime
    ),
    amount: common.getBloodGlucoseValue(
      sensitivityData,
      'amount',
      startTime,
      bgUnits
    ),
  }));
}

export function processTimedSettings(pumpSettings, schedule, bgUnits) {
  const starts = pumpSettings.bgTargets[schedule.name].map(s => s.start);

  const data = starts.map((startTime) => ({
    start: common.getFormattedTime(
      startTime,
    ),
    rate: common.getBasalRate(
      pumpSettings.basalSchedules[schedule.position].value,
      startTime,
    ),
    bgTarget: common.getBloodGlucoseValue(
      pumpSettings.bgTargets[schedule.name],
      'target',
      startTime,
      bgUnits,
    ),
    carbRatio: common.getValue(
      pumpSettings.carbRatios[schedule.name],
      'amount',
      startTime,
    ),
    insulinSensitivity: common.getBloodGlucoseValue(
      pumpSettings.insulinSensitivities[schedule.name],
      'amount',
      startTime,
      bgUnits,
    ),
  }));

  data.push({
    start: 'Total',
    rate: common.getTotalBasalRates(
      pumpSettings.basalSchedules[schedule.position].value,
    ),
    bgTarget: '',
    carbRatio: '',
    insulinSensitivity: '',
  });

  return data;
}

