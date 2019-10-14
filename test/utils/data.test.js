import _ from 'lodash';

import DataUtil from '../../src/utils/data';
import Types from '../../data/types';
import { MGDL_UNITS, MS_IN_DAY, MS_IN_HOUR, MS_IN_MIN, MMOLL_UNITS } from '../../src/utils/constants';

/* eslint-disable max-len, no-underscore-dangle */

describe('DataUtil', () => {
  let dataUtil;

  const basalDatumOverlappingStart = new Types.Basal({
    duration: MS_IN_HOUR * 2,
    deviceTime: '2018-01-31T23:00:00',
    source: 'Medtronic',
    deviceModel: '1780',
    deliveryType: 'automated',
    rate: 0.5,
  });

  const basalDatumOverlappingEnd = new Types.Basal({
    duration: MS_IN_HOUR * 3,
    deviceTime: '2018-02-01T22:00:00',
    source: 'Medtronic',
    deviceModel: '1780',
    deliveryType: 'automated',
    rate: 0.5,
  });

  const basalData = [
    new Types.Basal({
      duration: MS_IN_HOUR,
      deviceTime: '2018-02-01T01:00:00',
      source: 'Medtronic',
      deviceModel: '1780',
      deliveryType: 'automated',
      rate: 0.25,
    }),
    new Types.Basal({
      duration: MS_IN_HOUR,
      deviceTime: '2018-02-01T02:00:00',
      source: 'Medtronic',
      deviceModel: '1780',
      deliveryType: 'scheduled',
      rate: 0.75,
    }),
    new Types.Basal({
      duration: MS_IN_HOUR,
      deviceTime: '2018-02-01T03:00:00',
      source: 'Medtronic',
      deviceModel: '1780',
      deliveryType: 'scheduled',
      rate: 0.5,
    }),
    new Types.Basal({
      duration: MS_IN_HOUR,
      deviceTime: '2018-02-03T03:00:00',
      source: 'Medtronic',
      deviceModel: '1780',
      deliveryType: 'scheduled',
      rate: 0.5,
    }),
  ];

  const bolusData = [
    new Types.Bolus({
      deviceTime: '2018-02-01T01:00:00',
      value: 4,
    }),
    new Types.Bolus({
      deviceTime: '2018-02-01T02:00:00',
      value: 5,
    }),
    new Types.Bolus({
      deviceTime: '2018-02-01T03:00:00',
      value: 6,
    }),
    new Types.Bolus({
      deviceTime: '2018-02-03T03:00:00',
      value: 4,
    }),
  ];

  const cbgData = [
    new Types.CBG({
      deviceId: 'AbbottFreeStyleLibre-XXX-XXXX',
      value: 50,
      deviceTime: '2018-02-01T00:00:00',
    }),
    new Types.CBG({
      deviceId: 'AbbottFreeStyleLibre-XXX-XXXX',
      value: 60,
      deviceTime: '2018-02-01T00:15:00',
    }),
    new Types.CBG({
      deviceId: 'AbbottFreeStyleLibre-XXX-XXXX',
      value: 100,
      deviceTime: '2018-02-01T00:30:00',
    }),
    new Types.CBG({
      deviceId: 'Dexcom-XXX-XXXX',
      value: 190,
      deviceTime: '2018-02-01T00:45:00',
    }),
    new Types.CBG({
      deviceId: 'Dexcom-XXX-XXXX',
      value: 260,
      deviceTime: '2018-02-01T00:50:00',
    }),
  ];

  const foodData = [
    new Types.Food({
      deviceTime: '2018-02-01T02:00:00',
      nutrition: {
        carbohydrate: {
          net: 7,
        },
      },
    }),
    new Types.Food({
      deviceTime: '2018-02-01T04:00:00',
      nutrition: {
        carbohydrate: {
          net: 9,
        },
      },
    }),
    new Types.Food({
      deviceTime: '2018-02-02T04:00:00',
      nutrition: {
        carbohydrate: {
          net: 13,
        },
      },
    }),
  ];

  const smbgData = [
    new Types.SMBG({
      value: 60,
      deviceTime: '2018-02-01T00:00:00',
    }),
    new Types.SMBG({
      value: 70,
      deviceTime: '2018-02-01T00:15:00',
    }),
    new Types.SMBG({
      value: 80,
      deviceTime: '2018-02-01T00:30:00',
    }),
    new Types.SMBG({
      value: 200,
      deviceTime: '2018-02-01T00:45:00',
    }),
    new Types.SMBG({
      value: 270,
      deviceTime: '2018-02-01T00:50:00',
    }),
  ];

  const uploadData = [
    new Types.Upload({
      deviceTags: ['insulin-pump'],
      source: 'Insulet',
      deviceModel: 'dash',
      deviceTime: '2018-01-02T00:00:00',
    }),
    new Types.Upload({
      deviceTags: ['insulin-pump'],
      source: 'Medtronic',
      deviceModel: '1780',
      deviceTime: '2018-02-02T00:00:00',
    }),
  ];

  const wizardData = [
    new Types.Wizard({
      deviceTime: '2018-02-01T02:00:00',
      carbInput: 4,
    }),
    new Types.Wizard({
      deviceTime: '2018-02-01T03:00:00',
    }),
    new Types.Wizard({
      deviceTime: '2018-02-01T04:00:00',
      carbInput: 2,
    }),
    new Types.Wizard({
      deviceTime: '2018-02-02T04:00:00',
      carbInput: 10,
    }),
  ];

  const data = [
    ...basalData,
    ...bolusData,
    ...cbgData,
    ...foodData,
    ...smbgData,
    ...uploadData,
    ...wizardData,
  ];

  const chartPrefs = {
    bgSource: 'cbg',
    activeDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
  };

  const bgPrefs = {
    bgClasses: {
      'very-low': { boundary: 54 },
      low: { boundary: 70 },
      target: { boundary: 180 },
      high: { boundary: 250 },
    },
    bgUnits: MGDL_UNITS,
  };

  const dayEndpoints = [
    '2018-02-01T00:00:00.000Z',
    '2018-02-02T00:00:00.000Z',
  ];

  const twoDayEndpoints = [
    '2018-02-01T00:00:00.000Z',
    '2018-02-03T00:00:00.000Z',
  ];

  const twoWeekEndpoints = [
    '2018-02-01T00:00:00.000Z',
    '2018-02-15T00:00:00.000Z',
  ];

  const defaultOpts = {
    chartPrefs,
    bgPrefs,
    endpoints: dayEndpoints,
  };

  const opts = overrides => _.assign({}, defaultOpts, overrides);

  beforeEach(() => {
    dataUtil = new DataUtil(data, defaultOpts);
  });

  describe('constructor', () => {
    it('should initialize the data crossfilter', () => {
      expect(dataUtil.data).to.be.an('object');
      expect(dataUtil.data.size()).to.equal(data.length);
    });

    it('should set custom `endpoints` from provided opts', () => {
      expect(dataUtil._endpoints).to.be.an('array');
      expect(dataUtil._endpoints).to.eql(dayEndpoints);
    });

    it('should set default `endpoints` when not provided in opts', () => {
      dataUtil = new DataUtil(data, opts({ endpoints: undefined }));
      expect(dataUtil._endpoints).to.eql([]);
    });

    it('should set custom `chartPrefs` from provided opts', () => {
      expect(dataUtil._chartPrefs).to.include({
        bgSource: 'cbg',
      });
    });

    it('should set default `chartPrefs` when not provided in opts', () => {
      dataUtil = new DataUtil(data, opts({ chartPrefs: undefined }));
      expect(dataUtil._chartPrefs).to.eql({});
    });

    it('should set `bgBounds` from bgPrefs option', () => {
      expect(dataUtil.bgBounds).to.eql({
        veryHighThreshold: 250,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 54,
      });
    });

    it('should set `bgUnits` from bgPrefs option', () => {
      expect(dataUtil.bgUnits).to.eql(MGDL_UNITS);
    });

    it('should set `days` from endpoints', () => {
      expect(dataUtil.days).to.be.a('number');
    });

    it('should set up crossfilter dimensions', () => {
      expect(dataUtil.dimension).to.be.an('object');
    });

    it('should set up crossfilter filters', () => {
      expect(dataUtil.filter).to.be.an('object');
    });

    it('should set up crossfilter sorts', () => {
      expect(dataUtil.sort).to.be.an('object');
    });

    it('should set `bgSources`', () => {
      expect(dataUtil.bgSources).to.have.keys(['cbg', 'smbg']);
    });

    it('should set `defaultBgSource`', () => {
      expect(dataUtil.defaultBgSource).to.be.oneOf(['cbg', 'smbg']);
    });

    it('should set `latestPump`', () => {
      expect(dataUtil.latestPump).to.have.keys(['deviceModel', 'manufacturer']);
    });
  });

  describe('bgSource getter', () => {
    it('should return the `bgSource` from chartPrefs when available', () => {
      dataUtil = new DataUtil(data, opts({ chartPrefs: { bgSource: 'smbg' } }));
      expect(dataUtil.bgSource).to.equal('smbg');
    });

    it('should return the `defaultBgSource` when `bgSource` from chartPrefs is unavailable', () => {
      dataUtil = new DataUtil(data, opts({ chartPrefs: undefined }));
      expect(dataUtil.bgSource).to.equal('cbg');
    });
  });

  describe('bgPrefs setter', () => {
    it('should set the `bgUnits` property as provided', () => {
      expect(dataUtil.bgUnits).to.equal(MGDL_UNITS);

      dataUtil.bgPrefs = {
        bgClasses: {
          'very-low': { boundary: 54 },
          low: { boundary: 70 },
          target: { boundary: 180 },
          high: { boundary: 250 },
        },
        bgUnits: MMOLL_UNITS,
      };

      expect(dataUtil.bgUnits).to.eql(MMOLL_UNITS);
    });

    it('should set the `bgBounds` property from the provided `bgClasses', () => {
      expect(dataUtil.bgBounds).to.eql({
        veryHighThreshold: 250,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 54,
      });

      dataUtil.bgPrefs = {
        bgClasses: {
          'very-low': { boundary: 50 },
          low: { boundary: 60 },
          target: { boundary: 70 },
          high: { boundary: 80 },
        },
        bgUnits: MGDL_UNITS,
      };

      expect(dataUtil.bgBounds).to.eql({
        veryHighThreshold: 80,
        targetUpperBound: 70,
        targetLowerBound: 60,
        veryLowThreshold: 50,
      });
    });
  });

  describe('chartPrefs setter', () => {
    it('should set the `_chartPrefs` property as provided', () => {
      expect(dataUtil._chartPrefs).to.equal(chartPrefs);
      dataUtil.chartPrefs = { foo: 'bar' };
      expect(dataUtil._chartPrefs).to.eql({ foo: 'bar' });
    });

    it('should set the `_chartPrefs` property to empty object when undefined arg given', () => {
      expect(dataUtil._chartPrefs).to.equal(chartPrefs);
      dataUtil.chartPrefs = undefined;
      expect(dataUtil._chartPrefs).to.eql({});
    });
  });

  describe('endpoints setter', () => {
    it('should set the `_endpoints` property as provided', () => {
      expect(dataUtil._endpoints).to.equal(dayEndpoints);
      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil._endpoints).to.eql(twoWeekEndpoints);
    });

    it('should set the `_endpoints` property to empty object when undefined arg given', () => {
      expect(dataUtil._endpoints).to.equal(dayEndpoints);
      dataUtil.endpoints = undefined;
      expect(dataUtil._endpoints).to.eql([]);
    });

    it('should set the `days` property with the endpoints provided', () => {
      expect(dataUtil.days).to.equal(1);
      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil.days).to.eql(14);
    });
  });

  describe('addData', () => {
    it('should add data to the data crossfilter', () => {
      expect(dataUtil.data.size()).to.equal(data.length);
      dataUtil.addData([
        new Types.SMBG({ value: 200 }),
      ]);
      expect(dataUtil.data.size()).to.equal(data.length + 1);
    });

    it('should update `bgSources` and `defaultBgSource` after adding new data', () => {
      dataUtil = new DataUtil(smbgData, defaultOpts);

      expect(dataUtil.bgSources).to.eql({
        cbg: false,
        smbg: true,
      });
      expect(dataUtil.defaultBgSource).to.eql('smbg');

      dataUtil.addData([
        new Types.CBG({ value: 200 }),
      ]);

      expect(dataUtil.bgSources).to.eql({
        cbg: true,
        smbg: true,
      });

      expect(dataUtil.defaultBgSource).to.eql('cbg');
    });
  });

  describe('removeData', () => {
    it('should call the `clearFilters` method', () => {
      const clearFiltersSpy = sinon.spy(dataUtil, 'clearFilters');
      sinon.assert.callCount(clearFiltersSpy, 0);
      dataUtil.removeData();
      sinon.assert.callCount(clearFiltersSpy, 1);
    });

    it('should remove all data from the crossfilter', () => {
      expect(dataUtil.data.size()).to.equal(27);
      dataUtil.removeData();
      expect(dataUtil.data.size()).to.equal(0);
    });
  });

  describe('addBasalOverlappingStart', () => {
    context('basal delivery does not overlap start endpoint', () => {
      it('should return the basal data unchanged', () => {
        expect(dataUtil.addBasalOverlappingStart(_.clone(basalData))).to.eql(basalData);
      });
    });

    context('basal delivery overlaps start endpoint', () => {
      it('should add the overlapping basal datum to the beginning of basalData array and return', () => {
        dataUtil.addData([basalDatumOverlappingStart]);
        expect(dataUtil.addBasalOverlappingStart(_.clone(basalData))).to.eql([
          basalDatumOverlappingStart,
          ...basalData,
        ]);
      });
    });
  });

  describe('applyDateFilters', () => {
    it('should filter the data by the endpoints', () => {
      const byEndpointsSpy = sinon.spy(dataUtil.filter, 'byEndpoints');

      sinon.assert.notCalled(byEndpointsSpy);
      dataUtil.applyDateFilters();

      sinon.assert.calledOnce(byEndpointsSpy);
      sinon.assert.calledWith(byEndpointsSpy, dayEndpoints);

      byEndpointsSpy.restore();
    });

    it('should clear any filters on the `byDayOfWeek` dimension', () => {
      const filterAllSpy = sinon.spy(dataUtil.dimension.byDayOfWeek, 'filterAll');

      sinon.assert.notCalled(filterAllSpy);
      dataUtil.applyDateFilters();

      sinon.assert.calledOnce(filterAllSpy);

      filterAllSpy.restore();
    });

    it('should set the `days` property based on the endpoint range', () => {
      dataUtil = new DataUtil(smbgData, opts({ endpoints: twoWeekEndpoints, chartPrefs: {} }));
      dataUtil.days = 0;
      expect(dataUtil.days).to.equal(0);
      dataUtil.applyDateFilters();
      expect(dataUtil.days).to.equal(14);
    });

    context('`activeDays` defined in `chartPrefs`', () => {
      it('should filter the data by by active days and set the `days` property', () => {
        dataUtil = new DataUtil(smbgData, opts({
          endpoints: twoWeekEndpoints,
          chartPrefs: {
            activeDays: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: false,
              saturday: false,
              sunday: false,
            },
          },
        }));

        const byActiveDaysSpy = sinon.spy(dataUtil.filter, 'byActiveDays');

        sinon.assert.notCalled(byActiveDaysSpy);
        dataUtil.applyDateFilters();

        sinon.assert.calledOnce(byActiveDaysSpy);
        sinon.assert.calledWith(byActiveDaysSpy, [1, 2, 3, 4]);

        expect(dataUtil.days).to.equal(8);

        byActiveDaysSpy.restore();
      });
    });
  });

  describe('buildDimensions', () => {
    it('should build the data dimensions', () => {
      dataUtil.dimension = {};
      dataUtil.buildDimensions();
      expect(dataUtil.dimension.byDate).to.be.an('object');
      expect(dataUtil.dimension.byDayOfWeek).to.be.an('object');
      expect(dataUtil.dimension.byType).to.be.an('object');
    });
  });

  describe('buildFilters', () => {
    it('should build the data filters', () => {
      dataUtil.filter = {};
      dataUtil.buildFilters();
      expect(dataUtil.filter.byActiveDays).to.be.a('function');
      expect(dataUtil.filter.byEndpoints).to.be.a('function');
      expect(dataUtil.filter.byType).to.be.a('function');
    });
  });

  describe('buildSorts', () => {
    it('should build the data sorters', () => {
      dataUtil.sort = {};
      dataUtil.buildSorts();
      expect(dataUtil.sort.byDate).to.be.a('function');
    });
  });

  describe('clearFilters', () => {
    it('should clear all of the dimension filters', () => {
      const clearbyDateSpy = sinon.spy(dataUtil.dimension.byDate, 'filterAll');
      const clearbyDayOfWeekSpy = sinon.spy(dataUtil.dimension.byDayOfWeek, 'filterAll');
      const clearbyTypeSpy = sinon.spy(dataUtil.dimension.byType, 'filterAll');
      sinon.assert.callCount(clearbyDateSpy, 0);
      sinon.assert.callCount(clearbyDayOfWeekSpy, 0);
      sinon.assert.callCount(clearbyTypeSpy, 0);
      dataUtil.clearFilters();
      sinon.assert.callCount(clearbyDateSpy, 1);
      sinon.assert.callCount(clearbyDayOfWeekSpy, 1);
      sinon.assert.callCount(clearbyTypeSpy, 1);
    });
  });

  describe('getAverageGlucoseData', () => {
    it('should return the median glucose for cbg data', () => {
      dataUtil.chartPrefs = { bgSource: 'cbg' };
      expect(dataUtil.getAverageGlucoseData()).to.eql({
        averageGlucose: 132,
        total: 5,
      });
    });

    it('should return the median glucose for smbg data', () => {
      dataUtil.chartPrefs = { bgSource: 'smbg' };
      expect(dataUtil.getAverageGlucoseData()).to.eql({
        averageGlucose: 136,
        total: 5,
      });
    });

    it('should return the filtered bg data when `returnBgData` is true', () => {
      dataUtil.chartPrefs = { bgSource: 'smbg' };
      expect(dataUtil.getAverageGlucoseData(true).bgData).to.be.an('array').and.have.length(5);
    });
  });

  describe('getBasalBolusData', () => {
    it('should return the total basal and bolus insulin delivery when viewing 1 day', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getBasalBolusData()).to.eql({
        basal: 1.5,
        bolus: 15,
      });
    });

    it('should return the avg daily total basal and bolus insulin delivery when viewing more than 1 day', () => {
      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil.getBasalBolusData()).to.eql({
        basal: 1, // (0.25 + 0.75 + 0.5 + 0.5) / 2 days when keeping only days with insulin data
        bolus: 9.5, // (4 + 5 + 6 + 4) / 2
      });
    });

    context('basal delivery overlaps endpoints', () => {
      it('should include the portion of delivery of a basal datum that overlaps the start endpoint', () => {
        dataUtil.endpoints = dayEndpoints;
        dataUtil.addData([basalDatumOverlappingStart]);
        expect(dataUtil.getBasalBolusData()).to.eql({
          basal: 2,
          bolus: 15,
        });
      });

      it('should include the portion of delivery of a basal datum that overlaps the start endpoint', () => {
        dataUtil.endpoints = dayEndpoints;
        dataUtil.addData([basalDatumOverlappingEnd]);
        expect(dataUtil.getBasalBolusData()).to.eql({
          basal: 2.5,
          bolus: 15,
        });
      });
    });
  });

  describe('getBgSources', () => {
    it('should call the `clearFilters` method', () => {
      const clearFiltersSpy = sinon.spy(dataUtil, 'clearFilters');
      sinon.assert.callCount(clearFiltersSpy, 0);
      dataUtil.getBgSources();
      sinon.assert.callCount(clearFiltersSpy, 1);
    });

    it('should return true for `smbg` and false for `cbg` when only smbg data available', () => {
      dataUtil = new DataUtil(smbgData, defaultOpts);

      expect(dataUtil.getBgSources()).to.eql({
        cbg: false,
        smbg: true,
      });
    });

    it('should return false for `smbg` and true for `cbg` when only cbg data available', () => {
      dataUtil = new DataUtil(cbgData, defaultOpts);

      expect(dataUtil.getBgSources()).to.eql({
        cbg: true,
        smbg: false,
      });
    });

    it('should return true for `smbg` and true for `cbg` when both types of bg data available', () => {
      dataUtil = new DataUtil([...cbgData, ...smbgData], defaultOpts);

      expect(dataUtil.getBgSources()).to.eql({
        cbg: true,
        smbg: true,
      });
    });

    it('should return false for `smbg` and false for `cbg` when neither type of bg data available', () => {
      dataUtil = new DataUtil([], defaultOpts);

      expect(dataUtil.getBgSources()).to.eql({
        cbg: false,
        smbg: false,
      });
    });
  });

  describe('getCarbsData', () => {
    it('should return the total carbs from wizard and food data when viewing 1 day', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getCarbsData()).to.eql({
        carbs: 22,
        total: 5,
      });
    });

    it('should return the avg daily carbs from wizard and food data when viewing more than 1 day', () => {
      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getCarbsData()).to.eql({
        carbs: 22.5,
        total: 7,
      });
    });
  });

  describe('getCoefficientOfVariationData', () => {
    it('should return the coefficient of variation for cbg data', () => {
      dataUtil.chartPrefs = { bgSource: 'cbg' };
      expect(dataUtil.getCoefficientOfVariationData()).to.eql({
        coefficientOfVariation: 68.47579720288888,
        total: 5,
      });
    });

    it('should return the coefficient of variation for cbg data', () => {
      dataUtil.chartPrefs = { bgSource: 'smbg' };
      expect(dataUtil.getCoefficientOfVariationData()).to.eql({
        coefficientOfVariation: 69.0941762401971,
        total: 5,
      });
    });

    it('should return `NaN` when less than 3 datums available', () => {
      dataUtil = new DataUtil(smbgData.slice(0, 2), opts({ chartPrefs: { bgSource: 'smbg' } }));
      expect(dataUtil.getCoefficientOfVariationData()).to.eql({
        coefficientOfVariation: NaN,
        insufficientData: true,
        total: 2,
      });
    });
  });

  describe('getDailyAverageSums', () => {
    it('should divide each value in the supplied data object by the number of days in the view', () => {
      const sampleData = {
        basal: 56,
        bolus: 28,
      };

      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getDailyAverageSums(sampleData)).to.eql({
        basal: 28,
        bolus: 14,
      });

      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil.getDailyAverageSums(sampleData)).to.eql({
        basal: 4,
        bolus: 2,
      });
    });

    it('should should not modify the `total` value', () => {
      const sampleData = {
        basal: 56,
        bolus: 28,
        total: 10,
      };

      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getDailyAverageSums(sampleData)).to.eql({
        basal: 28,
        bolus: 14,
        total: 10,
      });

      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil.getDailyAverageSums(sampleData)).to.eql({
        basal: 4,
        bolus: 2,
        total: 10,
      });
    });
  });

  describe('getDailyAverageDurations', () => {
    it('should divide each value in the supplied data object by the provided total, and multiply by `MS_IN_DAY`', () => {
      const sampleData = {
        automated: MS_IN_DAY * 1.5,
        manual: MS_IN_DAY * 0.5,
        total: MS_IN_DAY * 2,
      };

      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getDailyAverageDurations(sampleData)).to.eql({
        automated: MS_IN_DAY * 0.75,
        manual: MS_IN_DAY * 0.25,
        total: MS_IN_DAY * 2,
      });
    });

    it('should divide each value in the supplied data object by the sum of values when total is not provided', () => {
      const sampleData = {
        automated: MS_IN_DAY * 1.0,
        manual: MS_IN_DAY * 0.5,
      };

      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getDailyAverageDurations(sampleData)).to.eql({
        automated: MS_IN_DAY * (2 / 3),
        manual: MS_IN_DAY * (1 / 3),
      });
    });
  });

  describe('getDefaultBgSource', () => {
    it('should return `cbg` when only cbg data is available', () => {
      dataUtil = new DataUtil(cbgData, defaultOpts);
      expect(dataUtil.getDefaultBgSource()).to.equal('cbg');
    });

    it('should return `cbg` when cbg and smbg data is available', () => {
      dataUtil = new DataUtil([...cbgData, ...smbgData], defaultOpts);
      expect(dataUtil.getDefaultBgSource()).to.equal('cbg');
    });

    it('should return `smbg` when cbg data is unavailable and smbg data is available', () => {
      dataUtil = new DataUtil(smbgData, defaultOpts);
      expect(dataUtil.getDefaultBgSource()).to.equal('smbg');
    });

    it('should return `undefined` when neither cbg nor smbg data is available', () => {
      dataUtil = new DataUtil([], defaultOpts);
      expect(dataUtil.getDefaultBgSource()).to.be.undefined;
    });
  });

  describe('getDayCountFromEndpoints', () => {
    it('should return the endpoints range in days', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getDayCountFromEndpoints()).to.equal(1);

      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getDayCountFromEndpoints()).to.equal(2);

      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil.getDayCountFromEndpoints()).to.equal(14);
    });
  });

  describe('getDayIndex', () => {
    it('should return the day index given a day the week string', () => {
      expect(dataUtil.getDayIndex('sunday')).to.equal(0);
      expect(dataUtil.getDayIndex('monday')).to.equal(1);
      expect(dataUtil.getDayIndex('tuesday')).to.equal(2);
      expect(dataUtil.getDayIndex('wednesday')).to.equal(3);
      expect(dataUtil.getDayIndex('thursday')).to.equal(4);
      expect(dataUtil.getDayIndex('friday')).to.equal(5);
      expect(dataUtil.getDayIndex('saturday')).to.equal(6);
    });

    it('should return `undefined` for invalid day of week', () => {
      expect(dataUtil.getDayIndex('foo')).to.be.undefined;
    });
  });

  describe('getGlucoseManagementIndicatorData', () => {
    it('should return the GMI data when viewing at least 14 days of data and 70% coverage', () => {
      const requiredDexcomDatums = 2823; // 288(total daily possible readings) * .7(%required) * 14(days)
      const sufficientData = _.fill(Array(requiredDexcomDatums), cbgData[4], 0, requiredDexcomDatums);

      dataUtil = new DataUtil(sufficientData, defaultOpts);
      dataUtil.endpoints = twoWeekEndpoints;

      expect(dataUtil.getGlucoseManagementIndicatorData()).to.eql({
        glucoseManagementIndicator: 9.5292,
        total: 2823,
      });
    });

    it('should return `NaN` when viewing less than 14 days of data', () => {
      const requiredDexcomDatums = 2823; // 288(total daily possible readings) * .7(%required) * 14(days)
      const insufficientData = _.fill(Array(requiredDexcomDatums), cbgData[4], 0, requiredDexcomDatums);

      dataUtil = new DataUtil(insufficientData, defaultOpts);
      dataUtil.endpoints = [
        '2018-02-01T00:00:00.000Z',
        '2018-02-14T00:00:00.000Z',
      ];

      expect(dataUtil.getGlucoseManagementIndicatorData()).to.eql({
        glucoseManagementIndicator: NaN,
        insufficientData: true,
      });
    });

    it('should return `NaN` when viewing 14 days of data and less than 70% coverage', () => {
      const requiredDexcomDatums = 2823; // 288(total daily possible readings) * .7(%required) * 14(days)
      const count = requiredDexcomDatums - 1;
      const insufficientData = _.fill(Array(count), cbgData[4], 0, count);

      dataUtil = new DataUtil(insufficientData, defaultOpts);
      dataUtil.endpoints = twoWeekEndpoints;

      expect(dataUtil.getGlucoseManagementIndicatorData()).to.eql({
        glucoseManagementIndicator: NaN,
        insufficientData: true,
      });
    });

    it('should return `NaN` when bgSource is `smbg`', () => {
      const requiredDexcomDatums = 2823; // 288(total daily possible readings) * .7(%required) * 14(days)
      const sufficientData = _.fill(Array(requiredDexcomDatums), cbgData[4], 0, requiredDexcomDatums);

      dataUtil = new DataUtil(sufficientData, opts({ chartPrefs: { bgSource: 'smbg' } }));
      dataUtil.endpoints = twoWeekEndpoints;

      expect(dataUtil.getGlucoseManagementIndicatorData()).to.eql({
        glucoseManagementIndicator: NaN,
        insufficientData: true,
      });
    });
  });

  describe('getLatestPump', () => {
    it('should return the make and model of the latest pump uploaded', () => {
      expect(dataUtil.getLatestPump()).to.eql({
        manufacturer: 'medtronic',
        deviceModel: '1780',
      });

      dataUtil = new DataUtil(uploadData.slice(0, 1), defaultOpts);

      expect(dataUtil.getLatestPump()).to.eql({
        manufacturer: 'insulet',
        deviceModel: 'dash',
      });
    });
  });

  describe('getReadingsInRangeData', () => {
    it('should return the readings in range data when viewing 1 day', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getReadingsInRangeData()).to.eql({
        veryLow: 0,
        low: 1,
        target: 2,
        high: 1,
        veryHigh: 1,
        total: 5,
      });
    });

    it('should return the avg daily readings in range data when viewing more than 1 day', () => {
      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getReadingsInRangeData()).to.eql({
        veryLow: 0,
        low: 0.5,
        target: 1,
        high: 0.5,
        veryHigh: 0.5,
        total: 5,
      });
    });
  });

  describe('getSensorUsage', () => {
    it('should return the duration of sensor usage and total duration of the endpoint range', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getSensorUsage()).to.eql({
        sensorUsage: MS_IN_MIN * 55, // 3 * 15m for libre readings, 2 * 5m for dex readings
        total: MS_IN_DAY,
      });

      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil.getSensorUsage()).to.eql({
        sensorUsage: MS_IN_MIN * 55,
        total: MS_IN_DAY * 14,
      });
    });
  });

  describe('getStandardDevData', () => {
    it('should return the average glucose and standard deviation for cbg data', () => {
      dataUtil.chartPrefs = { bgSource: 'cbg' };
      expect(dataUtil.getStandardDevData()).to.eql({
        averageGlucose: 132,
        standardDeviation: 90.38805230781334,
        total: 5,
      });
    });

    it('should return the average glucose and standard deviation for cbg data', () => {
      dataUtil.chartPrefs = { bgSource: 'smbg' };
      expect(dataUtil.getStandardDevData()).to.eql({
        averageGlucose: 136,
        standardDeviation: 93.96807968666806,
        total: 5,
      });
    });

    it('should return `NaN` when less than 3 datums available', () => {
      dataUtil = new DataUtil(smbgData.slice(0, 2), opts({ chartPrefs: { bgSource: 'smbg' } }));
      expect(dataUtil.getStandardDevData()).to.eql({
        averageGlucose: 65,
        standardDeviation: NaN,
        insufficientData: true,
        total: 2,
      });
    });
  });

  describe('getTimeInAutoData', () => {
    it('should return the time spent in automated and manual basal delivery when viewing 1 day', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getTimeInAutoData()).to.eql({
        automated: MS_IN_HOUR,
        manual: MS_IN_HOUR * 2,
      });
    });

    it('should return the avg daily time spent in automated and manual basal delivery when viewing more than 1 day', () => {
      dataUtil.endpoints = twoDayEndpoints;
      expect(dataUtil.getTimeInAutoData()).to.eql({
        automated: MS_IN_DAY * (1 / 3),
        manual: MS_IN_DAY * (2 / 3),
      });
    });

    context('basal delivery overlaps endpoints', () => {
      it('should include the portion of delivery of a basal datum that overlaps the start endpoint', () => {
        dataUtil.endpoints = dayEndpoints;
        dataUtil.addData([basalDatumOverlappingStart]);
        expect(dataUtil.getTimeInAutoData()).to.eql({
          automated: MS_IN_HOUR * 2,
          manual: MS_IN_HOUR * 2,
        });
      });

      it('should include the portion of delivery of a basal datum that overlaps the start endpoint', () => {
        dataUtil.endpoints = dayEndpoints;
        dataUtil.addData([basalDatumOverlappingEnd]);
        expect(dataUtil.getTimeInAutoData()).to.eql({
          automated: MS_IN_HOUR * 3,
          manual: MS_IN_HOUR * 2,
        });
      });
    });
  });

  describe('getTimeInRangeData', () => {
    it('should return the time in range data when viewing 1 day', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getTimeInRangeData()).to.eql({
        veryLow: MS_IN_MIN * 15,
        low: MS_IN_MIN * 15,
        target: MS_IN_MIN * 15,
        high: MS_IN_MIN * 5,
        veryHigh: MS_IN_MIN * 5,
        total: MS_IN_MIN * 55,
      });
    });

    it('should return the avg daily time in range data when viewing more than 1 day', () => {
      dataUtil.endpoints = twoDayEndpoints;

      const result = dataUtil.getTimeInRangeData();
      const totalDuration = result.total;
      expect(result).to.eql({
        veryLow: (MS_IN_MIN * 15) / totalDuration * MS_IN_DAY,
        low: (MS_IN_MIN * 15) / totalDuration * MS_IN_DAY,
        target: (MS_IN_MIN * 15) / totalDuration * MS_IN_DAY,
        high: (MS_IN_MIN * 5) / totalDuration * MS_IN_DAY,
        veryHigh: (MS_IN_MIN * 5) / totalDuration * MS_IN_DAY,
        total: MS_IN_MIN * 55,
      });
    });
  });

  describe('getTotalInsulinData', () => {
    it('should return the total basal and bolus insulin delivery when viewing 1 day', () => {
      dataUtil.endpoints = dayEndpoints;
      expect(dataUtil.getTotalInsulinData()).to.eql({
        totalInsulin: 16.5,
      });
    });

    it('should return the avg daily total basal and bolus insulin delivery when viewing more than 1 day', () => {
      dataUtil.endpoints = twoWeekEndpoints;
      expect(dataUtil.getTotalInsulinData()).to.eql({
        totalInsulin: 10.5, // 9.5 + 1
      });
    });

    context('basal delivery overlaps endpoints', () => {
      it('should include the portion of delivery of a basal datum that overlaps the start endpoint', () => {
        dataUtil.endpoints = dayEndpoints;
        dataUtil.addData([basalDatumOverlappingStart]);
        expect(dataUtil.getTotalInsulinData()).to.eql({
          totalInsulin: 17,
        });
      });

      it('should include the portion of delivery of a basal datum that overlaps the start endpoint', () => {
        dataUtil.endpoints = dayEndpoints;
        dataUtil.addData([basalDatumOverlappingEnd]);
        expect(dataUtil.getTotalInsulinData()).to.eql({
          totalInsulin: 17.5,
        });
      });
    });
  });
});
