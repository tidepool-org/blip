import crossfilter from 'crossfilter'; // eslint-disable-line import/no-unresolved
import moment from 'moment-timezone';
import _ from 'lodash';
import { getTotalBasalFromEndpoints, getBasalGroupDurationsFromEndpoints } from './basal';
import { getTotalBolus } from './bolus';
import { classifyBgValue, reshapeBgClassesToBgBounds, cgmSampleFrequency } from './bloodglucose';
import { addDuration } from './datetime';
import { getLatestPumpUpload } from './device';
import { MGDL_UNITS, MGDL_PER_MMOLL, MS_IN_DAY } from './constants';


/* eslint-disable lodash/prefer-lodash-method, no-underscore-dangle, no-param-reassign */

export class DataUtil {
  /**
   * @param {Object} bgBounds - object describing boundaries for blood glucose categories
   * @param {Array} data Unfiltered tideline data
   * @param {Array} endpoints Array ISO strings [start, end]
   */
  constructor(data, opts = {}) {
    this.data = crossfilter(data);
    this._endpoints = opts.endpoints || [];
    this._chartPrefs = opts.chartPrefs || {};
    this.bgBounds = reshapeBgClassesToBgBounds(opts.bgPrefs);
    this.timeZoneName = _.get(opts, 'timePrefs.timezoneName', 'UTC');
    this.bgUnits = _.get(opts, 'bgPrefs.bgUnits');
    this.days = this.getDayCountFromEndpoints();
    this.dimension = {};
    this.filter = {};
    this.sort = {};

    this.buildDimensions();
    this.buildFilters();
    this.buildSorts();

    this.bgSources = this.getBgSources();
    this.defaultBgSource = this.getDefaultBgSource();
    this.latestPump = this.getLatestPump();
  }

  get bgSource() {
    return _.get(this._chartPrefs, ['bgSource'], this.defaultBgSource);
  }

  set chartPrefs(chartPrefs = {}) {
    this._chartPrefs = chartPrefs;
  }

  set endpoints(endpoints = []) {
    this._endpoints = endpoints;
  }

  addData = data => {
    this.data.add(data);
    this.bgSources = this.getBgSources();
    this.defaultBgSource = this.getDefaultBgSource();
  };

  applyDateFilters = () => {
    this.filter.byEndpoints(this._endpoints);

    this.dimension.byDayOfWeek.filterAll();

    const daysInRange = this.getDayCountFromEndpoints();
    this.days = daysInRange;

    if (this._chartPrefs.activeDays) {
      const activeDays = _.reduce(this._chartPrefs.activeDays, (result, active, day) => {
        if (active) {
          result.push(this.getDayIndex(day));
        }
        return result;
      }, []);

      this.filter.byActiveDays(activeDays);

      this.days = daysInRange / 7 * activeDays.length;
    }
  }

  applyBasalOverlappingStart = (basalData) => {
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

  buildDimensions = () => {
    this.dimension.byDate = this.data.dimension(d => d.normalTime);

    this.dimension.byDayOfWeek = this.data.dimension(
      d => moment.utc(d.normalTime).tz(this.timeZoneName).day()
    );

    this.dimension.byType = this.data.dimension(d => d.type);
  };

  buildFilters = () => {
    this.filter.byActiveDays = activeDays => this.dimension.byDayOfWeek
      .filterFunction(d => _.includes(activeDays, d));

    this.filter.byEndpoints = endpoints => this.dimension.byDate.filterRange(endpoints);
    this.filter.byType = type => this.dimension.byType.filterExact(type);
  };

  buildSorts = () => {
    this.sort.byDate = array => (
      crossfilter.quicksort.by(d => d.normalTime)(array, 0, array.length)
    );
  };

  getAverageGlucoseData = (returnBgData = false) => {
    this.applyDateFilters();

    const bgData = this.filter.byType(this.bgSource).top(Infinity);

    const data = {
      averageGlucose: _.meanBy(bgData, 'value'),
      total: bgData.length,
    };

    if (returnBgData) {
      data.bgData = bgData;
    }

    return data;
  };

  getAverageDailyCarbsData = () => {
    this.applyDateFilters();

    const wizardData = this.filter.byType('wizard').top(Infinity);

    const totalCarbs = _.reduce(
      wizardData,
      (result, datum) => result + _.get(datum, 'carbInput', 0),
      0
    );

    return { averageDailyCarbs: totalCarbs / this.days };
  };

  getBgSources = () => ({
    cbg: this.filter.byType('cbg').top(Infinity).length > 0,
    smbg: this.filter.byType('smbg').top(Infinity).length > 0,
  });

  getCoefficientOfVariationData = () => {
    const { averageGlucose, standardDeviation, total } = this.getStandardDevData();

    return {
      coefficientOfVariation: standardDeviation / averageGlucose * 100,
      total,
    };
  };

  getDailyAverageSums = data => {
    const clone = _.clone(data);

    _.each(clone, (value, key) => {
      if (key !== 'total') {
        clone[key] = value / this.days;
      }
    });

    return clone;
  };

  getDailyAverageDurations = data => {
    const clone = _.clone(data);
    const total = data.total || _.sum(_.values(data));

    _.each(clone, (value, key) => {
      if (key !== 'total') {
        clone[key] = (value / total) * MS_IN_DAY;
      }
    });

    return clone;
  };

  getDefaultBgSource = () => {
    let source;
    if (this.bgSources.cbg) {
      source = 'cbg';
    } else if (this.bgSources.smbg) {
      source = 'smbg';
    }
    return source;
  };

  getDayCountFromEndpoints = () => moment.utc(this._endpoints[1])
    .diff(moment.utc(this._endpoints[0])) / MS_IN_DAY;

  getDayIndex = day => {
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return dayMap[day];
  };

  getGlucoseManagementIndicatorData = () => {
    const { averageGlucose, bgData, total } = this.getAverageGlucoseData(true);

    const getTotalCbgDuration = () => _.reduce(
      bgData,
      (result, datum) => {
        result += cgmSampleFrequency(datum);
        return result;
      },
      0
    );

    const insufficientData = this.bgSource === 'smbg'
      || this.getDayCountFromEndpoints() < 14
      || getTotalCbgDuration() < 14 * MS_IN_DAY * 0.7;

    if (insufficientData) {
      return {
        glucoseManagementIndicator: NaN,
      };
    }

    const meanInMGDL = this.bgUnits === MGDL_UNITS
      ? averageGlucose
      : averageGlucose * MGDL_PER_MMOLL;

    const glucoseManagementIndicator = (3.31 + 0.02392 * meanInMGDL);

    return {
      glucoseManagementIndicator,
      total,
    };
  };

  getLatestPump = () => {
    const uploadData = this.sort.byDate(this.filter.byType('upload').top(Infinity));
    const latestPumpUpload = getLatestPumpUpload(uploadData);
    const latestUploadSource = _.get(latestPumpUpload, 'source', '').toLowerCase();
    return {
      deviceModel: _.get(latestPumpUpload, 'deviceModel', ''),
      manufacturer: latestUploadSource === 'carelink' ? 'medtronic' : latestUploadSource,
    };
  };

  getReadingsInRangeData = () => {
    this.applyDateFilters();

    let smbgData = _.reduce(
      this.filter.byType('smbg').top(Infinity),
      (result, datum) => {
        const classification = classifyBgValue(this.bgBounds, datum.value, 'fiveWay');
        result[classification]++;
        result.total++;
        return result;
      },
      {
        veryLow: 0,
        low: 0,
        high: 0,
        veryHigh: 0,
        target: 0,
        total: 0,
      }
    );

    if (this.days > 1) {
      smbgData = this.getDailyAverageSums(smbgData);
    }

    return smbgData;
  };

  getSensorUsage = () => {
    this.applyDateFilters();
    const cbgData = this.filter.byType('cbg').top(Infinity);

    const duration = _.reduce(
      cbgData,
      (result, datum) => {
        result += cgmSampleFrequency(datum);
        return result;
      },
      0
    );

    const total = this.days * MS_IN_DAY;

    return {
      sensorUsage: duration,
      total,
    };
  };

  getStandardDevData = () => {
    const { averageGlucose, bgData, total } = this.getAverageGlucoseData(true);

    if (bgData.length < 3) {
      return {
        averageGlucose,
        standardDeviation: NaN,
        total,
      };
    }

    const squaredDiffs = _.map(bgData, d => (d.value - averageGlucose) ** 2);
    const standardDeviation = Math.sqrt(_.sum(squaredDiffs) / (bgData.length - 1));

    return {
      averageGlucose,
      standardDeviation,
      total,
    };
  };

  getTimeInAutoData = () => {
    this.applyDateFilters();

    let basalData = this.sort.byDate(this.filter.byType('basal').top(Infinity));
    basalData = this.applyBasalOverlappingStart(basalData);

    let durations = basalData.length
      ? _.transform(
        getBasalGroupDurationsFromEndpoints(basalData, this._endpoints),
        (result, value, key) => {
          result[key] = value;
          return result;
        },
        {},
      )
      : NaN;

    if (this.days > 1 && !_.isNaN(durations)) {
      durations = this.getDailyAverageDurations(durations);
    }

    return durations;
  };

  getTimeInRangeData = () => {
    this.applyDateFilters();
    const cbgData = this.filter.byType('cbg').top(Infinity);

    let durations = _.reduce(
      cbgData,
      (result, datum) => {
        const classification = classifyBgValue(this.bgBounds, datum.value, 'fiveWay');
        const duration = cgmSampleFrequency(datum);
        result[classification] += duration;
        result.total += duration;
        return result;
      },
      {
        veryLow: 0,
        low: 0,
        high: 0,
        veryHigh: 0,
        target: 0,
        total: 0,
      }
    );

    if (this.days > 1) {
      durations = this.getDailyAverageDurations(durations);
    }

    return durations;
  };

  getTotalInsulinData = () => {
    this.applyDateFilters();

    const bolusData = this.filter.byType('bolus').top(Infinity);
    let basalData = this.sort.byDate(this.filter.byType('basal').top(Infinity).reverse());
    basalData = this.applyBasalOverlappingStart(basalData);

    const totalInsulin = {
      totalBasal: basalData.length
        ? parseFloat(getTotalBasalFromEndpoints(basalData, this._endpoints))
        : NaN,
      totalBolus: bolusData.length ? getTotalBolus(bolusData) : NaN,
    };

    if (this.days > 1) {
      totalInsulin.totalBasal = totalInsulin.totalBasal / this.days;
      totalInsulin.totalBolus = totalInsulin.totalBolus / this.days;
    }

    return totalInsulin;
  };
}

export default DataUtil;
