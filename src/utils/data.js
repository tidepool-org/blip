import crossfilter from 'crossfilter'; // eslint-disable-line import/no-unresolved
import moment from 'moment';
import _ from 'lodash';
import { getTotalBasalFromEndpoints, getBasalGroupDurationsFromEndpoints } from './basal';
import { getTotalBolus } from './bolus';
import { classifyBgValue, reshapeBgClassesToBgBounds, cgmSampleFrequency } from './bloodglucose';
import { addDuration } from './datetime';
import { MGDL_UNITS, MGDL_PER_MMOLL, MS_IN_DAY } from './constants';


/* eslint-disable lodash/prefer-lodash-method, no-underscore-dangle, no-param-reassign */

export class DataUtil {
  /**
   * @param {Object} bgBounds - object describing boundaries for blood glucose categories
   * @param {Array} data Unfiltered tideline data
   * @param {Array} endpoints Array ISO strings [start, end]
   */
  constructor(data, endpoints, opts = {}) {
    this.data = crossfilter(data);
    this._endpoints = endpoints;
    this._bgSource = opts.bgSource;
    this.bgBounds = reshapeBgClassesToBgBounds(opts.bgPrefs);
    this.bgUnits = opts.bgPrefs.bgUnits;
    this.dimension = {};
    this.filter = {};
    this.sort = {};

    this.buildDimensions();
    this.buildFilters();
    this.buildSorts();
  }

  set endpoints(endpoints) {
    if (endpoints) {
      this._endpoints = endpoints;
    }
  }

  set bgSource(bgSource) {
    if (bgSource) {
      this._bgSource = bgSource;
    }
  }

  addData = data => {
    this.data.add(data);
  };

  buildDimensions = () => {
    this.dimension.byDate = this.data.dimension(d => d.normalTime);
    this.dimension.byType = this.data.dimension(d => d.type);
  };

  buildFilters = () => {
    this.filter.byEndpoints = endpoints => this.dimension.byDate.filterRange(endpoints);
    this.filter.byType = type => this.dimension.byType.filterExact(type);
  };

  buildSorts = () => {
    this.sort.byDate = array => (
      crossfilter.quicksort.by(d => d.normalTime)(array, 0, array.length)
    );
  };

  includeBasalOverlappingStart = (basalData) => {
    if (basalData.length && basalData[0].normalTime > this._endpoints[0]) {
      // Fetch last basal from previous day
      this.filter.byEndpoints([
        addDuration(this._endpoints[0], -MS_IN_DAY),
        this._endpoints[0],
      ]);

      const previousBasalDatum = this.sort
        .byDate(this.filter.byType('basal').top(Infinity))
        .reverse()[0];

      // Add to top of basal data array if it overlaps the start endpoint
      const datumOverlapsStart = previousBasalDatum
        && previousBasalDatum.normalTime < this._endpoints[0]
        && previousBasalDatum.normalEnd > this._endpoints[0];

      if (datumOverlapsStart) {
        basalData.unshift(previousBasalDatum);
      }
    }
    return basalData;
  };

  getAverageBgData = (returnBgData = false) => {
    this.filter.byEndpoints(this._endpoints);

    const cbgData = this.filter.byType('cbg').top(Infinity);
    const smbgData = this.filter.byType('smbg').top(Infinity);
    const combinedBgData = cbgData.concat(smbgData);

    const data = {
      averageBg: _.meanBy(combinedBgData, 'value'),
    };

    if (returnBgData) {
      data.bgData = combinedBgData;
    }

    return data;
  };

  getAverageDailyCarbsData = () => {
    this.filter.byEndpoints(this._endpoints);

    const wizardData = this.filter.byType('wizard').top(Infinity);
    const days = this.getDayCountFromEndpoints();

    const totalCarbs = _.reduce(
      wizardData,
      (result, datum) => result + _.get(datum, 'carbInput', 0),
      0
    );

    return { averageDailyCarbs: totalCarbs / days };
  };

  getCoefficientOfVariationData = () => {
    const { averageBg, standardDeviation } = this.getStandardDevData();

    return {
      coefficientOfVariation: standardDeviation / averageBg,
    };
  };

  getDayCountFromEndpoints = () => moment.utc(this._endpoints[1])
    .diff(moment.utc(this._endpoints[0])) / MS_IN_DAY;

  getGlucoseManagementIndexData = () => {
    const { averageBg } = this.getAverageBgData();
    const meanInMGDL = this.bgUnits === MGDL_UNITS ? averageBg : averageBg * MGDL_PER_MMOLL;

    const glucoseManagementIndex = (3.31 + 0.02392 * meanInMGDL) / 100;

    return {
      glucoseManagementIndex,
    };
  };

  getReadingsInRangeData = () => {
    this.filter.byEndpoints(this._endpoints);

    // TODO: move to bloodglucose util?
    const smbgData = _.reduce(
      this.filter.byType('smbg').top(Infinity),
      (result, datum) => {
        const classification = classifyBgValue(this.bgBounds, datum.value, 'fiveWay');
        result[classification]++;
        return result;
      },
      {
        veryLow: 0,
        low: 0,
        high: 0,
        veryHigh: 0,
        target: 0,
      }
    );

    return smbgData;
  };

  getStandardDevData = () => {
    const { averageBg, bgData } = this.getAverageBgData(true);

    const squaredDiffs = _.map(bgData, d => (d.value - averageBg) ** 2);
    const avgSquaredDiff = _.mean(squaredDiffs);
    const standardDeviation = Math.sqrt(avgSquaredDiff);

    return {
      averageBg,
      standardDeviation,
    };
  };

  getTimeInAutoData = () => {
    this.filter.byEndpoints(this._endpoints);

    let basalData = this.sort.byDate(this.filter.byType('basal').top(Infinity));
    basalData = this.includeBasalOverlappingStart(basalData);

    const days = this.getDayCountFromEndpoints();
    const averageDailyDurations = basalData.length
      ? _.transform(
        getBasalGroupDurationsFromEndpoints(basalData, this._endpoints),
        (result, value, key) => {
          result[key] = value / days;
          return result;
        },
        {},
      )
      : NaN;

    return averageDailyDurations;
  };

  getTimeInRangeData = () => {
    this.filter.byEndpoints(this._endpoints);
    const cbgData = this.filter.byType('cbg').top(Infinity);

    const days = this.getDayCountFromEndpoints();
    // TODO: move to bloodglucose util?
    const averageDailyDurations = _.reduce(
      cbgData,
      (result, datum) => {
        const classification = classifyBgValue(this.bgBounds, datum.value, 'fiveWay');
        // TODO: dividing by days doesn't cut it, as there could be many days without cgm data
        result[classification] += cgmSampleFrequency(datum) / days;
        return result;
      },
      {
        veryLow: 0,
        low: 0,
        high: 0,
        veryHigh: 0,
        target: 0,
      }
    );

    return averageDailyDurations;
  };

  getTotalInsulinData = () => {
    this.filter.byEndpoints(this._endpoints);

    const bolusData = this.filter.byType('bolus').top(Infinity);
    let basalData = this.sort.byDate(this.filter.byType('basal').top(Infinity).reverse());
    basalData = this.includeBasalOverlappingStart(basalData);

    return {
      totalBasal: basalData.length ? getTotalBasalFromEndpoints(basalData, this._endpoints) : NaN,
      totalBolus: bolusData.length ? getTotalBolus(bolusData) : NaN,
    };
  };
}

export default DataUtil;
