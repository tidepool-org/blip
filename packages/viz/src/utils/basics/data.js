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
import sundial from "sundial";
import crossfilter from "crossfilter2";
import i18next from "i18next";

import generateClassifiers from "../classifiers";
import { getLatestPumpUpload, isAutomatedBasalDevice, getPumpVocabulary } from "../device";
import {
  generateBgRangeLabels,
  weightedCGMCount,
} from "../bloodglucose";

import {
  BGM_DATA_KEY,
  CGM_DATA_KEY,
  MS_IN_DAY,
  CGM_READINGS_ONE_DAY,
  NOT_ENOUGH_CGM,
  CGM_CALCULATED,
  NO_CGM,
  NO_SITE_CHANGE,
  SITE_CHANGE,
  SITE_CHANGE_RESERVOIR,
  SECTION_TYPE_UNDECLARED,
  AUTOMATED_DELIVERY,
  SCHEDULED_DELIVERY,
  DIABELOOP,
  getPumpVocabularies,
} from "../constants";

const t = i18next.t.bind(i18next);

/**
 * Get the Time in Range source and status
 * source will be one of [cbg | smbg | null]
 * status refers the the availability of cgm data [NO_CGM | NOT_ENOUGH_CGM | CGM_CALCULATED]
 *
 * @export
 * @param {Object} basicsData - the preprocessed basics data object
 * @returns {Object} bgSource - source and status of CGM data
 */
export function determineBgDistributionSource(basicsData) {
  const cgmAvailable = _.get(basicsData, `data.${CGM_DATA_KEY}.data.length`, 0) > 0;
  const bgmAvailable = _.get(basicsData, `data.${BGM_DATA_KEY}.data.length`, 0) > 0;

  const bgSource = {
    source: bgmAvailable ? BGM_DATA_KEY : null,
  };

  if (cgmAvailable) {
    const cbgCount = weightedCGMCount(basicsData.data[CGM_DATA_KEY].data);
    const spanInDays = (Date.parse(basicsData.dateRange[1]) -
      Date.parse(basicsData.dateRange[0])) / MS_IN_DAY;

    if (cbgCount < CGM_READINGS_ONE_DAY / 2 * spanInDays) {
      bgSource.cgmStatus = NOT_ENOUGH_CGM;
    } else {
      bgSource.cgmStatus = CGM_CALCULATED;
      bgSource.source = CGM_DATA_KEY;
    }
  } else {
    bgSource.cgmStatus = NO_CGM;
  }

  return bgSource;
}

/**
 * Return a CGM status message
 *
 * @export
 * @param {String} cgmStatus - cbg | smbg | noCGM
 * @returns {String} status message
 */
export function cgmStatusMessage(cgmStatus) {
  switch (cgmStatus) {
  case NO_CGM:
    return t("Showing BGM data (no CGM)");
  case NOT_ENOUGH_CGM:
    return t("Showing BGM data (not enough CGM)");
  case CGM_CALCULATED:
    return t("Showing CGM data");
  default:
    return "";
  }
}

/**
 * Get latest upload from blip-generated patient data
 *
 * @export
 * @param {Object} basicsData - the preprocessed basics data object
 * @returns {String|Null} - the latest upload source or null
 */
export function getLatestPumpUploaded(basicsData) {
  const latestPump = getLatestPumpUpload(_.get(basicsData, "data.upload.data", []));

  if (latestPump && _.has(latestPump, "source")) {
    return latestPump.source;
  }

  return null;
}

/**
 * Get the infusion site history of a patient
 *
 * @param {Object} basicsData - the preprocessed basics data object
 * @param {String} type - infusion type, coming from the patients `siteChangeSource` setting
 * @returns {Object} infusionSiteHistory
 */
export function getInfusionSiteHistory(basicsData, type) {
  const infusionSitesPerDay = basicsData.data[type].dataByDate;
  const allDays = basicsData.days;
  const infusionSiteHistory = {};
  let hasChangeHistory = false;

  // daysSince does *not* start at zero because we have to look back to the
  // most recent infusion site change prior to the basics-restricted time domain
  const priorSiteChange = _.findLast(_.keys(infusionSitesPerDay), date => date < allDays[0].date);

  let daysSince = (Date.parse(allDays[0].date) - Date.parse(priorSiteChange)) / MS_IN_DAY - 1;
  _.forEach(allDays, day => {
    if (day.type === "future") {
      infusionSiteHistory[day.date] = { type: "future" };
    } else {
      daysSince += 1;
      if (infusionSitesPerDay[day.date] && infusionSitesPerDay[day.date].count >= 1) {
        infusionSiteHistory[day.date] = {
          type: SITE_CHANGE,
          count: infusionSitesPerDay[day.date].count,
          data: infusionSitesPerDay[day.date].data,
          daysSince,
        };
        daysSince = 0;
        hasChangeHistory = true;
      } else {
        infusionSiteHistory[day.date] = { type: NO_SITE_CHANGE };
      }
    }
  });

  infusionSiteHistory.hasChangeHistory = hasChangeHistory;
  return infusionSiteHistory;
}

/**
 * Process the infusion site history of a patient
 *
 * @export
 * @param {Object} data - the preprocessed basics data object
 * @param {Object} patient
 * @returns {Object} basicsData - the revised data object
 */
export function processInfusionSiteHistory(data) {
  const basicsData = data;
  const latestPump = getLatestPumpUploaded(basicsData);

  if (!latestPump) {
    return basicsData;
  }

  if (latestPump === DIABELOOP) {
    basicsData.data.reservoirChange.infusionSiteHistory = getInfusionSiteHistory(
      basicsData,
      SITE_CHANGE_RESERVOIR
    );

    basicsData.sections.siteChanges.type = SITE_CHANGE_RESERVOIR;
    basicsData.sections.siteChanges.selector = null;
  }

  const pumpVocabulary = getPumpVocabularies();
  const fallbackSubtitle = basicsData.sections.siteChanges.type !== SECTION_TYPE_UNDECLARED
    ? pumpVocabulary.default[SITE_CHANGE_RESERVOIR]
    : null;

  basicsData.sections.siteChanges.subTitle = _.get(
    pumpVocabulary,
    `${latestPump}.${basicsData.sections.siteChanges.type}`,
    fallbackSubtitle,
  );

  return basicsData;
}

/**
 * Generate crossfilter reducers for classifying data records
 *
 * @param {Object} dataObj - the data object to reduce
 * @param {String} type - the data type
 * @param {Object} bgPrefs - bgPrefs object containing viz-style bgBounds
 */
function buildCrossfilterUtils(dataObj, type, bgPrefs) {
  /* eslint-disable no-param-reassign */
  const classifiers = generateClassifiers(bgPrefs);

  const getLocalDate = (datum) => (
    sundial.applyOffset(datum.normalTime, datum.displayOffset).toISOString().slice(0, 10)
  );

  const reduceAddMaker = (classifier) => {
    if (classifier) {
      return function reduceAdd(p, v) {
        const tags = classifier(v);
        if (!_.isEmpty(tags)) {
          ++p.total;
          _.forEach(tags, tag => {
            if (p.subtotals[tag]) {
              p.subtotals[tag] += 1;
            } else {
              p.subtotals[tag] = 1;
            }
          });
        }
        p.data.push(v);
        return p;
      };
    }
    return function reduceAdd(p, v) {
      ++p.count;
      p.data.push(v);
      return p;
    };
  };

  const reduceRemoveMaker = (classifier) => {
    if (classifier) {
      return function reduceRemove(p, v) {
        const tags = classifier(v);
        if (!_.isEmpty(tags)) {
          --p.total;
          _.forEach(tags, tag => {
            p.subtotals[tag] -= 1;
          });
        }
        _.remove(p.data, d => (d.id === v.id));
        return p;
      };
    }
    return function reduceRemove(p, v) {
      --p.count;
      _.remove(p.data, d => (d.id === v.id));
      return p;
    };
  };

  const reduceInitialMaker = (classifier) => {
    if (classifier) {
      return function reduceInitial() {
        return {
          total: 0,
          subtotals: {},
          data: [],
        };
      };
    }
    return function reduceInitial() {
      return {
        count: 0,
        data: [],
      };
    };
  };

  dataObj.byLocalDate = dataObj.cf.dimension(getLocalDate);
  const classifier = classifiers[type];

  // eslint-disable-next-line lodash/prefer-lodash-method
  const dataByLocalDate = dataObj.byLocalDate.group().reduce(
    reduceAddMaker(classifier),
    reduceRemoveMaker(classifier),
    reduceInitialMaker(classifier)
  ).all();
  const dataByDateHash = {};
  for (let j = 0; j < dataByLocalDate.length; ++j) {
    const day = dataByLocalDate[j];
    dataByDateHash[day.key] = day.value;
  }
  dataObj.dataByDate = dataByDateHash;
  /* eslint-enable no-param-reassign */
}

/**
 * Generate function to process summary breakdowns for section data
 *
 * @param {Object} dataObj
 * @param {Object} summary
 * @returns {Function}
 */
export function summarizeTagFn(dataObj, summary) {
  /* eslint-disable no-param-reassign */
  return tag => {
    summary[tag] = {
      count: _.reduce(
        _.keys(dataObj.dataByDate),
        (p, date) => (p + (dataObj.dataByDate[date].subtotals[tag] || 0)),
        0,
      ),
    };
    summary[tag].percentage = summary[tag].count / summary.total;
  };
  /* eslint-enable no-param-reassign */
}

/**
 * Get the average number of data events per day excluding the most recent
 *
 * @param {Object} dataObj
 * @param {Number} total
 * @param {String} mostRecentDay
 * @returns
 */
export function averageExcludingMostRecentDay(dataObj, total, mostRecentDay) {
  const mostRecentTotal = dataObj.dataByDate[mostRecentDay] ?
    dataObj.dataByDate[mostRecentDay].total : 0;
  const numDaysExcludingMostRecent = dataObj.dataByDate[mostRecentDay] ?
    _.keys(dataObj.dataByDate).length - 1 : _.keys(dataObj.dataByDate).length;

  // TODO: if we end up using this, do we care that this averages only over # of days that
  // *have* data? e.g., if you have a random day in the middle w/no boluses,
  // that day (that 0) will be excluded from average
  return (total - mostRecentTotal) / numDaysExcludingMostRecent;
}

/**
 * Define sections and dimensions used in the basics view
 *
 * @param {Object} bgPrefs - bgPrefs object containing viz-style bgBounds
 * @returns {Object} sections
 */
export function defineBasicsSections(bgPrefs, manufacturer, deviceModel) {
  const bgLabels = generateBgRangeLabels(bgPrefs);
  bgLabels.veryLow = _.upperFirst(bgLabels.veryLow);
  bgLabels.veryHigh = _.upperFirst(bgLabels.veryHigh);

  const deviceLabels = getPumpVocabulary(manufacturer);

  const sectionNames = [
    "averageDailyCarbs",
    "basalBolusRatio",
    "basals",
    "bgDistribution",
    "boluses",
    "fingersticks",
    "siteChanges",
    "timeInAutoRatio",
    "totalDailyDose",
  ];

  const sections = {};

  _.forEach(sectionNames, section => {
    let type = section;
    let dimensions;
    let title = "";
    let subTitle;
    let summaryTitle;
    let emptyText;
    let active = true;

    switch (section) {
    case "basals":
      type = "basal";
      title = "Basals";
      summaryTitle = t("Total basal events");
      dimensions = [
        { key: "total", label: t("Basal Events"), primary: true },
        { key: "temp", label: t("Temp Basals") },
        { key: "suspend", label: t("Suspends") },
        {
          key: "automatedStop",
          label: t("{{automatedLabel}} Exited", {
            automatedLabel: deviceLabels[AUTOMATED_DELIVERY],
          }),
          hideEmpty: true,
        },
      ];
      break;

    case "boluses":
      type = "bolus";
      title = t("Bolusing");
      summaryTitle = t("Avg boluses / day");
      dimensions = [
        { key: "total", label: t("Avg per day"), average: true, primary: true },
        { key: "wizard", label: t("Calculator"), percentage: true },
        { key: "correction", label: t("Correction"), percentage: true },
        { key: "extended", label: t("Extended"), percentage: true },
        { key: "interrupted", label: t("Interrupted"), percentage: true },
        { key: "override", label: t("Override"), percentage: true },
        { key: "underride", label: t("Underride"), percentage: true },
      ];
      break;

    case "fingersticks":
      type = "fingerstick";
      title = t("BG readings");
      summaryTitle = t("Avg BG readings / day");
      dimensions = [
        { path: "smbg", key: "total", label: t("Avg per day"), average: true, primary: true },
        { path: "smbg", key: "meter", label: t("Meter"), percentage: true },
        { path: "smbg", key: "manual", label: t("Manual"), percentage: true },
        { path: "calibration", key: "total", label: t("Calibrations") },
        { path: "smbg", key: "veryLow", label: bgLabels.veryLow, percentage: true },
        { path: "smbg", key: "veryHigh", label: bgLabels.veryHigh, percentage: true },
      ];
      break;

    case "siteChanges":
      type = null; // Will be set by `processInfusionSiteHistory`
      title = t("Infusion site changes");
      break;

    case "bgDistribution":
      title = t("Time In Range");
      break;

    case "totalDailyDose":
      title = t("Avg total daily dose");
      break;

    case "basalBolusRatio":
      title = t("Insulin ratio");
      dimensions = [
        { key: "basal", label: t("Basal") },
        { key: "bolus", label: t("Bolus") },
      ];
      break;

    case "timeInAutoRatio":
      title = t("Time in {{automatedLabel}} ratio", { automatedLabel: deviceLabels[AUTOMATED_DELIVERY] });
      active = isAutomatedBasalDevice(manufacturer, deviceModel);
      dimensions = [
        { key: "manual", label: deviceLabels[SCHEDULED_DELIVERY] },
        { key: "automated", label: deviceLabels[AUTOMATED_DELIVERY] },
      ];
      break;

    case "averageDailyCarbs":
      title = t("Avg daily carbs");
      break;

    default:
      type = false;
      break;
    }

    sections[section] = {
      active,
      title,
      subTitle,
      summaryTitle,
      emptyText,
      type,
      dimensions,
      disabled: false,
    };
  });

  return sections;
}

/**
 * Set up cross filters by date for all of the data types
 *
 * @export
 * @param {Object} data - the preprocessed basics data object
 * @param {Object} bgPrefs - bgPrefs object containing viz-style bgBounds
 * @returns {Object} basicsData - the revised data object
 */
export function reduceByDay(data, bgPrefs) {
  const basicsData = _.cloneDeep(data);

  _.forEach(basicsData.data, (_value, type) => {
    const typeObj = basicsData.data[type];

    if (_.includes([SITE_CHANGE_RESERVOIR], type)) {
      typeObj.cf = crossfilter(typeObj.data);
      buildCrossfilterUtils(typeObj, type, bgPrefs);
    }

    basicsData.data[type] = typeObj;
  });

  return basicsData;
}

/**
 * Generate the day labels based on the days supplied by the processed basics view data
 *
 * @export
 * @param {Array} days - supplied by the processed basics view data
 * @returns {Array} labels - formatted day labels.  I.E. [Mon, Tues, Wed, ...]
 */
export function generateCalendarDayLabels(days) {
  const firstDay = moment.utc(days[0].date).day();

  return _.map(_.range(firstDay, firstDay + 7), dow => (
    moment.utc().day(dow).format("ddd")
  ));
}

/**
 * Set the availability of basics sections
 *
 * @export
 * @param {any} sections
 */
export function disableEmptySections(data) {
  const basicsData = _.cloneDeep(data);

  const {
    sections,
    data: typeData,
  } = basicsData;

  const hasDataInRange = processedData => (
    processedData && (_.keys(processedData.dataByDate).length > 0)
  );

  const diabetesDataTypes = [
    "basal",
    "bolus",
  ];

  const aggregatedDataTypes = [
    "averageDailyCarbs",
    "basalBolusRatio",
    "bgDistribution",
    "timeInAutoRatio",
    "totalDailyDose",
  ];

  const getEmptyText = (section, sectionKey) => {
    /* eslint-disable max-len */
    let emptyText;

    switch (sectionKey) {
    case "basals":
    case "boluses":
      emptyText = t("This section requires data from an insulin pump, so there's nothing to display.");
      break;

    case "siteChanges":
      emptyText = section.type === SECTION_TYPE_UNDECLARED
        ? t("Please choose a preferred site change source from the 'Basics' web view to view this data.")
        : t("This section requires data from an insulin pump, so there's nothing to display.");
      break;

    case "fingersticks":
      emptyText = t("This section requires data from a blood-glucose meter, so there's nothing to display.");
      break;

    case "bgDistribution":
      emptyText = t("No BG data available");
      break;

    case "averageDailyCarbs":
    case "basalBolusRatio":
    case "timeInAutoRatio":
    case "totalDailyDose":
      emptyText = t("Why is this grey? There is not enough data to show this statistic.");
      break;

    default:
      emptyText = t("Why is this grey? There is not enough data to show this statistic.");
      break;
    }

    return emptyText;
    /* eslint-enable max-len */
  };

  _.forEach(sections, (section, key) => {
    const type = section.type;
    let disabled = false;

    if (_.includes(diabetesDataTypes, type)) {
      disabled = !hasDataInRange(typeData[type]);
    } else if (_.includes(aggregatedDataTypes, key)) {
      disabled = !typeData[key];
    } else if (type === "fingerstick" && typeData[type]) {
      const hasSMBG = hasDataInRange(typeData[type].smbg);
      const hasCalibrations = hasDataInRange(typeData[type].calibration);

      if (!hasCalibrations) {
        _.remove(basicsData.sections[key].dimensions, filter => filter.path === "calibration");
      }

      disabled = !hasSMBG && !hasCalibrations;
    } else if (key === "siteChanges") {
      disabled = (!type || type === SECTION_TYPE_UNDECLARED) || _.isEmpty(_.get(typeData, "reservoirChange.data"));
    }

    if (disabled) {
      basicsData.sections[key].emptyText = getEmptyText(section, key);
    }

    basicsData.sections[key].disabled = disabled;
  });

  return basicsData;
}
