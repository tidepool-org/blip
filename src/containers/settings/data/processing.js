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

import * as utilities from './utilities';

export function processBasalRateData(scheduleData) {
  const starts = scheduleData.value.map(s => s.start);
  const noData = [{ start: '-', rate: '-' }];

  if (starts.length === 0) {
    return noData;
  } else if (starts.length === 1) {
    if (Number(utilities.getBasalRate(scheduleData.value, starts[0])) === 0) {
      return noData;
    }
  }

  const data = starts.map((startTime) => ({
    start: utilities.getFormattedTime(
      startTime
    ),
    rate: utilities.getBasalRate(
      scheduleData.value,
      startTime
    ),
  }));

  data.push({
    start: 'Total',
    rate: utilities.getTotalBasalRates(scheduleData.value),
  });

  return data;
}

export function processBgTargetData(targetsData, bgUnits, keys) {
  const starts = targetsData.map(s => s.start);

  return starts.map((startTime) => ({
    start: utilities.getFormattedTime(
      startTime
    ),
    columnTwo: utilities.getBloodGlucoseValue(
      targetsData,
      keys.columnTwo,
      startTime,
      bgUnits
    ),
    columnThree: utilities.getBloodGlucoseValue(
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
    start: utilities.getFormattedTime(
      startTime
    ),
    amount: utilities.getValue(
      carbRatioData,
      'amount',
      startTime
    ),
  }));
}

export function processSensitivityData(sensitivityData, bgUnits) {
  const starts = sensitivityData.map(s => s.start);
  return starts.map((startTime) => ({
    start: utilities.getFormattedTime(
      startTime
    ),
    amount: utilities.getBloodGlucoseValue(
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
    start: utilities.getFormattedTime(
      startTime,
    ),
    rate: utilities.getBasalRate(
      pumpSettings.basalSchedules[schedule.position].value,
      startTime,
    ),
    bgTarget: utilities.getBloodGlucoseValue(
      pumpSettings.bgTargets[schedule.name],
      'target',
      startTime,
      bgUnits,
    ),
    carbRatio: utilities.getValue(
      pumpSettings.carbRatios[schedule.name],
      'amount',
      startTime,
    ),
    insulinSensitivity: utilities.getBloodGlucoseValue(
      pumpSettings.insulinSensitivities[schedule.name],
      'amount',
      startTime,
      bgUnits,
    ),
  }));

  data.push({
    start: 'Total',
    rate: utilities.getTotalBasalRates(
      pumpSettings.basalSchedules[schedule.position].value,
    ),
    bgTarget: '',
    carbRatio: '',
    insulinSensitivity: '',
  });

  return data;
}

