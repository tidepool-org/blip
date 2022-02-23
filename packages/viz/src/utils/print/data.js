/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

import _ from "lodash";
import moment from "moment-timezone";
import { extent } from "d3-array";

import { getBasalSequences, getGroupDurations } from "../../utils/basal";
import { getLatestPumpUpload, isAutomatedBasalDevice } from "../../utils/device";
import { commonStats, statFetchMethods, getStatDefinition } from "../../utils/stat";

/**
 * @typedef { import("tideline").TidelineData } TidelineData
 * @typedef { import("../data").default } DataUtil
 */

/**
 * processBgRange
 * @param {object} dataByDate - Array of Tidepool datums
 * @returns {Array} the extent of bg range values
 */
function processBgRange(dataByDate) {
  const bgs = _.reduce(
    dataByDate,
    (all, date) => (
      all.concat(_.get(date, "data.cbg", [])).concat(_.get(date, "data.smbg", []))
    ),
    []
  );
  return extent(bgs, (d) => (d.value));
}

function processBolusRange(dataByDate) {
  const boluses = _.reduce(
    dataByDate,
    (all, date) => (
      all.concat(_.get(date, "data.bolus", []))
    ),
    []
  );
  return extent(boluses, (d) => {
    const bolus = d.bolus ? d.bolus : d;
    return bolus.normal + (bolus.extended ?? 0);
  });
}

function processBasalRange(dataByDate) {
  const basals = _.reduce(
    dataByDate,
    (all, date) => (
      all.concat(_.get(date, "data.basal", []))
    ),
    []
  );
  const rawBasalRange = extent(
    basals,
    (d) => (_.max([_.get(d, "suppressed.rate", 0), d.rate]))
  );
  // multiply the max rate by 1.1 to add a little buffer so the highest basals
  // don't sit at the very top of the basal rendering area and bump into boluses
  return [0, rawBasalRange[1] * 1.1];
}

/**
 * @private Exported for unit tests.
 * @param {{duration:number;epoch:number;epochEnd:number;subType:string;discontinuousEnd:boolean;discontinuousStart:boolean;}[]} basals
 * @param {[number,number]} bounds
 */
export function updateBasalDiscontinuous(basals, bounds) {
  if (basals.length < 1) {
    return;
  }
  let prevBasal = null;
  for (let i=0; i<basals.length; i++) {
    const basal = basals[i];
    // trim the first and last basals to fit within the date's bounds
    if (basal.epoch < bounds[0]) {
      basal.duration = basal.duration - (bounds[0] - basal.epoch);
      basal.epoch = bounds[0];
      basal.utc = basal.epoch;
      basal.normalTime = new Date(basal.epoch).toISOString();
    }
    if (basal.epochEnd > bounds[1]) {
      basal.duration = basal.duration - (basal.epochEnd - bounds[1]);
      basal.epochEnd = basal.epoch + basal.duration;
      basal.normalEnd = new Date(basal.epochEnd).toISOString();
    }

    basal.discontinuousEnd = false;
    basal.discontinuousStart = false;

    if (prevBasal && (prevBasal.epoch + prevBasal.duration) !== basal.epoch) {
      prevBasal.discontinuousEnd = true;
      basal.discontinuousStart = true;
    }

    prevBasal = basal;
  }
}

/**
 * @param {string} type Data type
 * @param {{epoch:number;type:string;wizard?:object;}[]} data Array of data to transform for the PDF daily view
 */
function transformData(type, data) {
  return data.map((v) => {
    const o = { ...v };
    o.utc = o.epoch;
    o.threeHrBin = Math.floor(moment.tz(o.epoch, o.timezone).hours() / 3) * 3;
    if (type === "bolus" && o.wizard) {
      // For some very strange reason, we have to inverse bolus and wizard link...
      const reversed = { ...o.wizard };
      delete o.wizard;
      reversed.bolus = o;
      reversed.utc = reversed.epoch;
      return reversed;
    }
    return o;
  });
}

/**
 *
 * @param {import("tideline").TidelineData} tidelineData
 * @param {moment.Moment} startDate
 * @param {moment.Moment} endDate
 */
export function selectDailyViewData(tidelineData, startDate, endDate) {
  const dailyDataTypes = ["basal", "bolus", "cbg", "food", "message", "smbg", "upload", "physicalActivity"];
  const current = startDate.clone();

  // Partially compute in patient-data.js in blip

  const dataByDate = {};
  const lastDayPlusOne = endDate.clone().add(1, "day").format("YYYY-MM-DD");

  let day;
  while ((day = current.format("YYYY-MM-DD")) !== lastDayPlusOne) {
    const mEnd = current.clone().endOf("day");
    const minEpoch = current.valueOf() - 1;
    const maxEpoch = mEnd.valueOf() + 1;
    const bounds = [current.valueOf(), mEnd.valueOf()]; // Is is exclusive ?
    const data = {};
    for (const type of dailyDataTypes) {
      /** @type {{epoch:number}[]} */
      const filteredData = tidelineData.grouped[type].filter((d) => {
        if (d.epochEnd) {
          return minEpoch < d.epochEnd && d.epoch < maxEpoch;
        }
        return minEpoch < d.epoch && d.epoch < maxEpoch;
      });

      data[type] = transformData(type, filteredData);

      if (type === "basal") {
        updateBasalDiscontinuous(data.basal, bounds);
        data.basalSequences = getBasalSequences(data.basal);
        data.timeInAutoRatio = getGroupDurations(data.basal, bounds[0], bounds[1]);
      }
    }

    dataByDate[day] = {
      bounds,
      data,
      date: day,
      endpoints: [current.toISOString(), mEnd.toISOString()],
    };

    current.add(1, "day");
  }

  return {
    dataByDate,
    basalRange: processBasalRange(dataByDate),
    bgRange: processBgRange(dataByDate),
    bolusRange: processBolusRange(dataByDate),
    dateRange: [startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD")],
    latestPumpUpload: getLatestPumpUpload(tidelineData.grouped.upload),
    timezone: tidelineData.getLastTimezone(),
  };
}

/**
 * Hackish way to have a fake pumpSettings at a date.
 *
 * This is not complete, only valid for the device parameters.
 * Actually we can't get the pumpSettings at a specified date
 * from the API. This need to be addressed later.
 * @param {object} latestPumpSettings
 * @param {moment.Moment} date
 */
export function generatePumpSettings(latestPumpSettings, date) {
  const ps = _.cloneDeep(latestPumpSettings);
  /** @type {{changeDate:string;parameters:{changeType:string;name:string;level:number;unit:string;value:string;}[]}[]} */
  const history = ps?.payload?.history?.filter((h) => (moment.utc(h.changeDate).isBefore(date)));

  // originalDate: hackish way to tell the information displayed do not match the print date
  ps.originalDate = ps.normalTime;

  if (!Array.isArray(history) || history.length < 1) {
    // Invalid result? return the current obj at is
    // Safe guard to avoid a crash
    return ps;
  }
  history.sort((a, b) => a.changeDate.localeCompare(b.changeDate));

  // Rebuild parameters
  /** @type {{[x:string]: {name:string;}}} */
  const parameters = {};
  for (const h of history) {
    for (const p of h.parameters) {
      if (p.changeType === "deleted" && p.name in parameters) {
        delete parameters[p.name];
      } else {
        parameters[p.name] = { name: p.name, level: p.level, unit: p.unit, value: p.value };
      }
    }
  }

  // Update returned object:
  ps.payload.history = history;
  ps.payload.parameters = [];
  _.forOwn(parameters, (p) => {
    ps.payload.parameters.push(p);
  });
  ps.normalTime = date.toISOString();
  ps.epoch = date.valueOf();
  // FIXME: deviceSerialNumber is not available right now
  delete ps.deviceSerialNumber;

  return ps;
}

/**
 * @param {object} data
 * @param {DataUtil} dataUtil
 * @returns data param
 */
export function generatePDFStats(data, dataUtil) {
  const {
    bgBounds,
    bgUnits,
    latestPump: { manufacturer, deviceModel },
  } = dataUtil;

  const isAutomatedDevice = isAutomatedBasalDevice(manufacturer, deviceModel);

  const getStat = (statType) => {
    const { bgSource, days } = dataUtil;
    return getStatDefinition(dataUtil[statFetchMethods[statType]](), statType, {
      bgSource,
      days,
      bgPrefs: {
        bgBounds,
        bgUnits,
      },
      manufacturer,
    });
  };

  if (data.basics) {
    dataUtil.endpoints = data.basics.dateRange;

    data.basics.stats = {
      [commonStats.timeInRange]: getStat(commonStats.timeInRange),
      [commonStats.readingsInRange]: getStat(commonStats.readingsInRange),
      [commonStats.totalInsulin]: getStat(commonStats.totalInsulin),
      [commonStats.timeInAuto]: isAutomatedDevice ? getStat(commonStats.timeInAuto) : undefined,
      [commonStats.carbs]: getStat(commonStats.carbs),
      [commonStats.averageDailyDose]: getStat(commonStats.averageDailyDose),
      [commonStats.averageGlucose]: getStat(commonStats.averageGlucose),
      [commonStats.glucoseManagementIndicator]: getStat(commonStats.glucoseManagementIndicator)
    };
  }

  if (data.daily) {
    _.forOwn(data.daily.dataByDate, (_value, key) => {
      dataUtil.endpoints = data.daily.dataByDate[key].endpoints;

      data.daily.dataByDate[key].stats = {
        [commonStats.timeInRange]: getStat(commonStats.timeInRange),
        [commonStats.averageGlucose]: getStat(commonStats.averageGlucose),
        [commonStats.totalInsulin]: getStat(commonStats.totalInsulin),
        [commonStats.timeInAuto]: isAutomatedDevice ? getStat(commonStats.timeInAuto) : undefined,
        [commonStats.carbs]: getStat(commonStats.carbs),
      };
    });
  }

  return data;
}
