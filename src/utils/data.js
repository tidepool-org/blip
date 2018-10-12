import crossfilter from 'crossfilter'; // eslint-disable-line import/no-unresolved
import _ from 'lodash';
import { getTotalBasalFromEndpoints, getBasalGroupDurationsFromEndpoints } from './basal';
import { getTotalBolus } from './bolus';
import { classifyBgValue, reshapeBgClassesToBgBounds, cgmSampleFrequency } from './bloodglucose';
import { addDuration, TWENTY_FOUR_HRS } from './datetime';


/* eslint-disable lodash/prefer-lodash-method, no-underscore-dangle, no-param-reassign */

export class DataUtil {
  /**
   * @param {Object} bgBounds - object describing boundaries for blood glucose categories
   * @param {Array} data Unfiltered tideline data
   * @param {Array} endpoints Array ISO strings [start, end]
   */
  constructor(data, endpoints, bgPrefs) {
    this.data = crossfilter(data);
    this._endpoints = endpoints;
    this.bgBounds = reshapeBgClassesToBgBounds(bgPrefs);
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
        addDuration(this._endpoints[0], -TWENTY_FOUR_HRS),
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

  getAverageBgData = () => {
    this.filter.byEndpoints(this._endpoints);

    const cbgData = this.filter.byType('cbg').top(Infinity);
    const smbgData = this.filter.byType('smbg').top(Infinity);

    return { averageBg: _.meanBy(cbgData.concat(smbgData), 'value') };
  };

  getReadingsInRangeData = () => {
    this.filter.byEndpoints(this._endpoints);

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

  getTimeInAutoData = () => {
    this.filter.byEndpoints(this._endpoints);

    let basalData = this.sort.byDate(this.filter.byType('basal').top(Infinity));
    basalData = this.includeBasalOverlappingStart(basalData);

    return basalData.length ? getBasalGroupDurationsFromEndpoints(basalData, this._endpoints) : NaN;
  };

  getTimeInRangeData = () => {
    this.filter.byEndpoints(this._endpoints);
    const cbgData = this.filter.byType('cbg').top(Infinity);
    const timeInRangeData = _.reduce(
      cbgData,
      (result, datum) => {
        const classification = classifyBgValue(this.bgBounds, datum.value, 'fiveWay');
        result[classification] += cgmSampleFrequency(datum);
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

    return timeInRangeData;
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
  }
}

export default DataUtil;
