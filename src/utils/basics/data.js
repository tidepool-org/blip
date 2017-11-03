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

import _ from 'lodash';
import moment from 'moment';
import sundial from 'sundial';
import crossfilter from 'crossfilter';

import generateClassifiers from '../classifiers';
import { generateBgRangeLabels } from '../bloodglucose';

import {
  BGM_DATA_KEY,
  CGM_DATA_KEY,
  MS_IN_DAY,
  MS_IN_HOUR,
  CGM_IN_DAY,
  NOT_ENOUGH_CGM,
  CGM_CALCULATED,
  NO_CGM,
  NO_SITE_CHANGE,
  SITE_CHANGE,
  SITE_CHANGE_RESERVOIR,
  SITE_CHANGE_TUBING,
  SITE_CHANGE_CANNULA,
  INSULET,
  TANDEM,
  ANIMAS,
  MEDTRONIC,
  pumpVocabulary,
} from '../constants';

/**
 * Calculate aggregated basal and bolus stats
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
    const count = basicsData.data[CGM_DATA_KEY].data.length;
    const spanInDays = (Date.parse(basicsData.dateRange[1]) -
      Date.parse(basicsData.dateRange[0])) / MS_IN_DAY;

    if (count < (CGM_IN_DAY / 2 * spanInDays)) {
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
  const statusMessages = {
    [NO_CGM]: 'Showing BGM data (no CGM)',
    [NOT_ENOUGH_CGM]: 'Showing BGM data (not enough CGM)',
    [CGM_CALCULATED]: 'Showing CGM data',
  };

  return statusMessages[cgmStatus] || '';
}

/**
 * Calculate aggregated basal and bolus stats
 *
 * @export
 * @param {Object} basicsData - the preprocessed basics data object
 * @returns {Object} stats - Aggregated stats
 */
export function calculateBasalBolusStats(basicsData) {
  const pastDays = _.filter(basicsData.days, { type: 'past' });

  const mostRecent = _.get(
    _.filter(basicsData.days, { type: 'mostRecent' }),
    [0, 'date'],
    ''
  );

  const pastBolusDays = _.reject(
    _.keys(basicsData.data.bolus.dataByDate),
    date => (date === mostRecent)
  );

  // if three or more of the days (excepting most recent) don't have any boluses
  // then don't calculate these stats at all, since may be inaccurate if
  // long-running basals exist
  if (pastDays.length - pastBolusDays.length >= 3) {
    return {
      basalBolusRatio: null,
      averageDailyDose: null,
      totalDailyDose: null,
      averageDailyCarbs: null,
    };
  }

  const boluses = basicsData.data.bolus.data;
  const basals = basicsData.data.basal.data;

  const carbs = _.filter(
    basicsData.data.wizard.data,
    wizardEvent => (wizardEvent.carbInput && wizardEvent.carbInput > 0)
  );

  let start = basals[0].normalTime;
  if (start < basicsData.dateRange[0]) {
    start = basicsData.dateRange[0];
  }

  let end = basals[basals.length - 1].normalEnd;
  if (end > basicsData.dateRange[1]) {
    end = basicsData.dateRange[1];
  }

  // find the duration of a basal segment that falls within the basicsData.dateRange
  const getDurationInRange = datum => {
    if (datum.normalTime >= start && datum.normalEnd <= end) {
      return datum.duration;
    } else if (datum.normalTime < start) {
      if (datum.normalEnd > start) {
        if (datum.normalEnd <= end) {
          return Date.parse(datum.normalEnd) - Date.parse(start);
        }
        return Date.parse(end) - Date.parse(start);
      }
      return 0;
    } else if (datum.normalEnd > end) {
      if (datum.normalTime < end) {
        return Date.parse(end) - Date.parse(datum.normalTime);
      }
      return 0;
    }
    return 0;
  };

  const sumBasalInsulin = _.reduce(
    _.map(basals, datum => (datum.rate * (getDurationInRange(datum) / MS_IN_HOUR))),
    (total, insulin) => (total + insulin)
  );

  const sumBolusInsulin = _.reduce(
    _.map(boluses, datum => {
      if (datum.normalTime >= start && datum.normalTime <= end) {
        return (datum.extended || 0) + (datum.normal || 0);
      }
      return 0;
    }),
    (total, insulin) => (total + insulin)
  );

  const sumCarbs = _.reduce(
    _.map(carbs, datum => {
      if (datum.normalTime >= start && datum.normalTime <= end) {
        return datum.carbInput;
      }
      return 0;
    }),
    (total, carbCount) => (total + carbCount)
  );

  const totalInsulin = sumBasalInsulin + sumBolusInsulin;

  return {
    basalBolusRatio: {
      basal: sumBasalInsulin / totalInsulin,
      bolus: sumBolusInsulin / totalInsulin,
    },
    averageDailyDose: {
      basal: sumBasalInsulin / ((Date.parse(end) - Date.parse(start)) / MS_IN_DAY),
      bolus: sumBolusInsulin / ((Date.parse(end) - Date.parse(start)) / MS_IN_DAY),
    },
    totalDailyDose: totalInsulin / ((Date.parse(end) - Date.parse(start)) / MS_IN_DAY),
    averageDailyCarbs: sumCarbs / ((Date.parse(end) - Date.parse(start)) / MS_IN_DAY),
  };
}

/**
 * Get latest upload from blip-generated patient data
 *
 * @export
 * @param {Object} basicsData - the preprocessed basics data object
 * @returns
 */
export function getLatestPumpUploaded(basicsData) {
  const latestPump = _.findLast(
    _.get(basicsData, 'data.upload.data', []),
    { deviceTags: ['insulin-pump'] }
  );

  if (latestPump && latestPump.hasOwnProperty('source')) {
    return latestPump.source;
  }

  return null;
}

/**
 *
 *
 * @param {Object} basicsData - the preprocessed basics data object
 * @param {any} type
 * @returns {Object} infusionSiteHistory
 */
function getInfusionSiteHistory(basicsData, type) {
  const infusionSitesPerDay = basicsData.data[type].dataByDate;
  const allDays = basicsData.days;
  const infusionSiteHistory = {};
  let hasChangeHistory = false;

  // daysSince does *not* start at zero because we have to look back to the
  // most recent infusion site change prior to the basics-restricted time domain
  const priorSiteChange = _.findLast(_.keys(infusionSitesPerDay), date => date < allDays[0].date);

  let daysSince = (Date.parse(allDays[0].date) - Date.parse(priorSiteChange)) / MS_IN_DAY - 1;
  _.each(allDays, day => {
    if (day.type === 'future') {
      infusionSiteHistory[day.date] = { type: 'future' };
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
 *
 *
 * @export
 * @param {Object} data - the preprocessed basics data object
 * @param {any} latestPump
 * @param {any} patient
 * @param {any} permissions
 */
export function processInfusionSiteHistory(data, patient) {
  const basicsData = _.cloneDeep(data);
  const latestPump = getLatestPumpUploaded(basicsData);

  if (!latestPump) {
    return null;
  }

  const {
    settings,
  } = patient;

  if (latestPump === ANIMAS || latestPump === MEDTRONIC || latestPump === TANDEM) {
    basicsData.data.cannulaPrime.infusionSiteHistory = getInfusionSiteHistory(
      basicsData,
      SITE_CHANGE_CANNULA
    );

    basicsData.data.tubingPrime.infusionSiteHistory = getInfusionSiteHistory(
      basicsData,
      SITE_CHANGE_TUBING
    );

    const siteChangeSource = _.get(settings, 'siteChangeSource');
    const allowedSources = [SITE_CHANGE_CANNULA, SITE_CHANGE_TUBING];

    if (siteChangeSource && _.includes(allowedSources, siteChangeSource)) {
      basicsData.sections.siteChanges.type = settings.siteChangeSource;
    }
  } else if (latestPump === INSULET) {
    basicsData.data.reservoirChange.infusionSiteHistory = getInfusionSiteHistory(
      basicsData,
      SITE_CHANGE_RESERVOIR
    );

    basicsData.sections.siteChanges.type = SITE_CHANGE_RESERVOIR;
    basicsData.sections.siteChanges.selector = null;
  } else {
    // CareLink (Medtronic) or other unsupported pump
    basicsData.data.reservoirChange = {};
    basicsData.sections.siteChanges.type = SITE_CHANGE_RESERVOIR;
    basicsData.sections.siteChanges.selector = null;
  }

  basicsData.sections.siteChanges.subTitle = _.get(
    pumpVocabulary,
    [latestPump, basicsData.sections.siteChanges.type],
    pumpVocabulary.default[SITE_CHANGE_RESERVOIR],
  );

  return basicsData;
}

/**
 * Generate crossfilter reducers for classifying data records
 *
 * @param {any} dataObj
 * @param {any} type
 * @param {any} bgPrefs
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
          _.each(tags, tag => {
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
          _.each(tags, tag => {
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
 *
 *
 * @param {any} dataObj
 * @param {any} summary
 * @returns
 */
function summarizeTagFn(dataObj, summary) {
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
 *
 *
 * @param {any} dataObj
 * @param {any} total
 * @param {any} mostRecentDay
 * @returns
 */
function averageExcludingMostRecentDay(dataObj, total, mostRecentDay) {
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
 * Define sections and filters used in the basics view
 *
 * @param {Object} bgPrefs - bgPrefs object containing viz-style bgBounds
 * @returns {Object} sections
 */
function defineBasicsSections(bgPrefs) {
  const bgLabels = generateBgRangeLabels(bgPrefs);
  bgLabels.veryLow = _.capitalize(bgLabels.veryLow);
  bgLabels.veryHigh = _.capitalize(bgLabels.veryHigh);

  const sectionNames = [
    'basals',
    'basalBolusRatio',
    'bgDistribution',
    'boluses',
    'fingersticks',
    'siteChanges',
    'totalDailyDose',
    'averageDailyCarbs',
  ];

  const sections = {};

  _.each(sectionNames, section => {
    let type;
    let filters;
    let title = '';
    let subTitle;

    switch (section) {
      case 'basals':
        type = 'basal';
        title = 'Basals';
        filters = [
          { key: 'total', label: 'Basal Events', primary: true },
          { key: 'temp', label: 'Temp Basals' },
          { key: 'suspend', label: 'Suspends' },
        ];
        break;

      case 'boluses':
        type = 'bolus';
        title = 'Bolusing';
        filters = [
          { key: 'total', label: 'Avg per day', average: true, primary: true },
          { key: 'wizard', label: 'Calculator', percentage: true },
          { key: 'correction', label: 'Correction', percentage: true },
          { key: 'override', label: 'Override', percentage: true },
          { key: 'manual', label: 'Manual', percentage: true },
          { key: 'extended', label: 'Extended', percentage: true },
          { key: 'interrupted', label: 'Interrupted', percentage: true },
        ];
        break;

      case 'fingersticks':
        type = 'fingerstick';
        title = 'BG readings';
        filters = [
          { path: 'smbg', key: 'total', label: 'Avg per day', average: true, primary: true },
          { path: 'smbg', key: 'meter', label: 'Meter', percentage: true },
          { path: 'smbg', key: 'manual', label: 'Manual', percentage: true },
          { path: 'calibration', key: 'calibration', label: 'Calibrations' },
          { path: 'smbg', key: 'veryLow', label: bgLabels.veryLow, percentage: true },
          { path: 'smbg', key: 'veryHigh', label: bgLabels.veryHigh, percentage: true },
        ];
        break;

      case 'siteChanges':
        type = undefined;
        title = 'Infusion site changes';
        subTitle = 'from something....';
        break;

      case 'bgDistribution':
        title = 'BG distribution';
        break;

      case 'totalDailyDose':
        title = 'Avg total daily dose';
        break;

      case 'basalBolusRatio':
        title = 'Insulin ratio';
        break;

      case 'averageDailyCarbs':
        title = 'Avg daily carbs';
        break;

      default:
        type = false;
        break;
    }

    sections[section] = {
      active: true,
      title,
      subTitle,
      type,
      filters,
    };
  });

  return sections;
}

/**
 *
 *
 * @export
 * @param {any} data
 */
export function reduceByDay(data, bgPrefs) {
  const basicsData = _.cloneDeep(data);

  basicsData.sections = defineBasicsSections(bgPrefs);

  const findSectionContainingType = type => section => {
    if (section.column === 'left') {
      return false;
    }
    return section.type === type;
  };

  const reduceTotalByDate = (typeObj) => (p, date) => (
    p + typeObj.dataByDate[date].total
  );

  const mostRecentDay = _.find(basicsData.days, { type: 'mostRecent' }).date;

  _.each(basicsData.data, (value, type) => {
    const typeObj = basicsData.data[type];

    if (_.includes(
      ['basal', 'bolus', SITE_CHANGE_RESERVOIR, SITE_CHANGE_TUBING, SITE_CHANGE_CANNULA], type)
    ) {
      typeObj.cf = crossfilter(typeObj.data);
      buildCrossfilterUtils(typeObj, type, bgPrefs);
    }

    if (_.includes(['calibration', 'smbg'], type)) {
      if (!basicsData.data.fingerstick) {
        basicsData.data.fingerstick = {};
      }
      basicsData.data.fingerstick[type] = {
        cf: crossfilter(typeObj.data),
      };
      buildCrossfilterUtils(basicsData.data.fingerstick[type], type, bgPrefs);
    }

    // for basal and boluses, summarize tags and find avg events per day
    if (_.includes(['basal', 'bolus'], type)) {
      // NB: for basals, the totals and avgPerDay are basal *events*
      // that is, temps, suspends, & (not now, but someday) schedule changes
      const section = _.find(basicsData.sections, findSectionContainingType(type));
      // wrap this in an if mostly for testing convenience
      if (section) {
        const tags = _.map(_.filter(section.filters, f => !f.primary), row => row.key);

        const summary = {
          total: _.reduce(
            _.keys(typeObj.dataByDate),
            reduceTotalByDate(typeObj), 0
          ),
        };

        _.each(tags, summarizeTagFn(typeObj, summary));
        summary.avgPerDay = averageExcludingMostRecentDay(
          typeObj,
          summary.total,
          mostRecentDay
        );
        typeObj.summary = summary;
      }
    }

    basicsData.data[type] = typeObj;
  });

  const fsSection = _.find(basicsData.sections, findSectionContainingType('fingerstick'));
  // wrap this in an if mostly for testing convenience
  if (fsSection) {
    const fingerstickData = basicsData.data.fingerstick;
    const fsSummary = { total: 0 };

    // calculate the total events for each type that participates in the fingerstick section
    // as well as an overall total
    _.each(['calibration', 'smbg'], fsCategory => {
      fsSummary[fsCategory] = {
        total: _.reduce(
          _.keys(fingerstickData[fsCategory].dataByDate),
          (p, date) => {
            const dateData = fingerstickData[fsCategory].dataByDate[date];
            return p + (dateData.total || dateData.count);
          }, 0
        ),
      };
      fsSummary.total += fsSummary[fsCategory].total;
    });

    fingerstickData.summary = fsSummary;

    const filterTags = filter => (filter.path === 'smbg' && !filter.primary);

    const fsTags = _.map(_.filter(fsSection.filters, filterTags), row => row.key);

    _.each(fsTags, summarizeTagFn(fingerstickData.smbg, fsSummary.smbg));
    const smbgSummary = fingerstickData.summary.smbg;
    smbgSummary.avgPerDay = averageExcludingMostRecentDay(
      fingerstickData.smbg,
      smbgSummary.total,
      mostRecentDay,
    );

    basicsData.data.fingerstick = fingerstickData;
    basicsData.data.fingerstick.summary.smbg = smbgSummary;
  }

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
    moment.utc().day(dow).format('ddd')
  ));
}
