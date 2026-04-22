/* global jest */
/* global expect */
/* global describe */
/* global it */
/* global beforeEach */
/* global context */

import getQueries from '@app/pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF/getQueries';
import utils from '@app/core/utils';
import { getStatsByChartType } from '@app/core/dataViewUtils';
import { DEFAULT_GLYCEMIC_RANGES } from '@app/core/glycemicRangesUtils';
import { utils as vizUtils } from '@tidepool/viz';

jest.mock('@app/core/utils', () => ({
  __esModule: true,
  default: {
    getBGPrefsForDataProcessing: jest.fn().mockReturnValue({ units: 'mg/dL' }),
  },
}));

jest.mock('@tidepool/viz', () => {
  const actual = jest.requireActual('@tidepool/viz');
  return {
    ...actual,
    utils: {
      ...actual.utils,
      bg: {
        ...actual.utils.bg,
        reshapeBgClassesToBgBounds: jest.fn().mockReturnValue('stubbed bgBounds'),
      },
    },
  };
});

jest.mock('@app/core/dataViewUtils', () => ({
  getStatsByChartType: jest.fn((chartType) => `${chartType} stats`),
}));

describe('getQueries', () => {
  const timePrefs = { timezoneAware: true, timezoneName: 'US/Eastern' };

  const opts = {
    agpBGM: { endpoints: 'agpBGM endpoints' },
    agpCGM: { endpoints: 'agpCGM endpoints' },
    basics: { endpoints: 'basics endpoints' },
    bgLog: { endpoints: 'bgLog endpoints' },
    daily: { endpoints: 'daily endpoints' },
    settings: { endpoints: 'settings endpoints' },
  };

  const bgPrefs = { units: 'mg/dL', bgBounds: 'stubbed bgBounds' };

  const commonQueries = {
    bgPrefs,
    metaData: 'latestPumpUpload, bgSources',
    timePrefs,
  };

  const data = {};
  const patient = {};
  const clinicPatient = {};
  const clinic = {};

  beforeEach(() => {
    jest.clearAllMocks();
    utils.getBGPrefsForDataProcessing.mockReturnValue({ units: 'mg/dL' });
    vizUtils.bg.reshapeBgClassesToBgBounds.mockReturnValue('stubbed bgBounds');

    getStatsByChartType.mockImplementation((chartType) => `${chartType} stats`);
  });

  it('should return queries for all chart types when none are disabled', () => {
    const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
    expect(queries).toMatchObject({
      agpBGM: expect.any(Object),
      agpCGM: expect.any(Object),
      basics: expect.any(Object),
      daily: expect.any(Object),
      bgLog: expect.any(Object),
      settings: expect.any(Object),
    });
  });

  it('should omit queries for disabled chart types', () => {
    const disabledOpts = {
      ...opts,
      bgLog: { disabled: true },
      daily: { disabled: true },
      settings: { disabled: true },
    };

    const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, disabledOpts);
    expect(queries).toMatchObject({
      agpBGM: expect.any(Object),
      agpCGM: expect.any(Object),
      basics: expect.any(Object),
    });
    expect(queries.bgLog).toBeUndefined();
    expect(queries.daily).toBeUndefined();
    expect(queries.settings).toBeUndefined();
  });

  it('should omit queries for disabled agpBGM, agpCGM, and basics', () => {
    const disabledOpts = {
      ...opts,
      agpBGM: { disabled: true },
      agpCGM: { disabled: true },
      basics: { disabled: true },
    };

    const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, disabledOpts);
    expect(queries).toMatchObject({
      daily: expect.any(Object),
      bgLog: expect.any(Object),
      settings: expect.any(Object),
    });
    expect(queries.agpBGM).toBeUndefined();
    expect(queries.agpCGM).toBeUndefined();
    expect(queries.basics).toBeUndefined();
  });

  context('generating agpCGM query', () => {
    it('should set the `endpoints` query from the `opts` arg', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpCGM.endpoints).toEqual('agpCGM endpoints');
    });

    it('should query the required `aggregationsByDate`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpCGM.aggregationsByDate).toEqual('dataByDate, statsByDate');
    });

    it('should query the required `types`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpCGM.types).toEqual({ cbg: {} });
    });

    it('should query the required `stats`', () => {
      getStatsByChartType.mockReturnValue('agpCGM stats');

      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);

      expect(getStatsByChartType).toHaveBeenCalledWith('agpCGM', expect.any(String), expect.any(Object));
      expect(queries.agpCGM.stats).toEqual('agpCGM stats');
    });

    it('should set `bgSource` to `cbg`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpCGM.bgSource).toEqual('cbg');
    });

    it('should include the required `glycemicRanges`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpCGM.glycemicRanges).toEqual(DEFAULT_GLYCEMIC_RANGES);
    });

    it('should query the required `commonQueries`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpCGM.bgPrefs).toEqual(commonQueries.bgPrefs);
      expect(queries.agpCGM.metaData).toEqual(commonQueries.metaData);
      expect(queries.agpCGM.timePrefs).toEqual(commonQueries.timePrefs);
    });
  });

  context('generating agpBGM query', () => {
    it('should set the `endpoints` query from the `opts` arg', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpBGM.endpoints).toEqual('agpBGM endpoints');
    });

    it('should query the required `aggregationsByDate`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpBGM.aggregationsByDate).toEqual('dataByDate, statsByDate');
    });

    it('should query the required `types`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpBGM.types).toEqual({ smbg: {} });
    });

    it('should query the required `stats`', () => {
      getStatsByChartType.mockReturnValue('agpBGM stats');

      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);

      expect(getStatsByChartType).toHaveBeenCalledWith('agpBGM', expect.any(String), expect.any(Object));
      expect(queries.agpBGM.stats).toEqual('agpBGM stats');
    });

    it('should set `bgSource` to `smbg`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpBGM.bgSource).toEqual('smbg');
    });

    it('should include the required `glycemicRanges`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpBGM.glycemicRanges).toEqual(DEFAULT_GLYCEMIC_RANGES);
    });

    it('should query the required `commonQueries`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.agpBGM.bgPrefs).toEqual(commonQueries.bgPrefs);
      expect(queries.agpBGM.metaData).toEqual(commonQueries.metaData);
      expect(queries.agpBGM.timePrefs).toEqual(commonQueries.timePrefs);
    });
  });

  context('generating basics query', () => {
    it('should set the `endpoints` query from the `opts` arg', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.basics.endpoints).toEqual('basics endpoints');
    });

    it('should query the required `aggregationsByDate`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.basics.aggregationsByDate).toEqual('basals, boluses, fingersticks, siteChanges');
    });

    it('should query the required `stats`', () => {
      getStatsByChartType.mockReturnValue('basics stats');

      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);

      expect(getStatsByChartType).toHaveBeenCalledWith('basics', expect.any(String), expect.any(Object));
      expect(queries.basics.stats).toEqual('basics stats');
    });

    it('should query the required `bgSource` from `data.metaData.bgSources.current`', () => {
      const dataWithBgSource = { metaData: { bgSources: { current: 'basics bgSource' } } };
      const queries = getQueries(dataWithBgSource, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.basics.bgSource).toEqual('basics bgSource');
    });

    it('should query the required `commonQueries`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.basics.bgPrefs).toEqual(commonQueries.bgPrefs);
      expect(queries.basics.metaData).toEqual(commonQueries.metaData);
      expect(queries.basics.timePrefs).toEqual(commonQueries.timePrefs);
    });
  });

  context('generating daily query', () => {
    it('should set the `endpoints` query from the `opts` arg', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.daily.endpoints).toEqual('daily endpoints');
    });

    it('should query the required `aggregationsByDate`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.daily.aggregationsByDate).toEqual('dataByDate, statsByDate');
    });

    it('should query the required `types`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.daily.types).toEqual({
        basal: {},
        bolus: {},
        cbg: {},
        deviceEvent: {},
        food: {},
        insulin: {},
        message: {},
        physicalActivity: {},
        reportedState: {},
        smbg: {},
        wizard: {},
      });
    });

    it('should query the required `stats`', () => {
      getStatsByChartType.mockReturnValue('daily stats');

      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);

      expect(getStatsByChartType).toHaveBeenCalledWith('daily', expect.any(String), expect.any(Object));
      expect(queries.daily.stats).toEqual('daily stats');
    });

    it('should query the required `bgSource` from `data.metaData.bgSources.current`', () => {
      const dataWithBgSource = { metaData: { bgSources: { current: 'daily bgSource' } } };
      const queries = getQueries(dataWithBgSource, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.daily.bgSource).toEqual('daily bgSource');
    });

    it('should query the required `commonQueries`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.daily.bgPrefs).toEqual(commonQueries.bgPrefs);
      expect(queries.daily.metaData).toEqual(commonQueries.metaData);
      expect(queries.daily.timePrefs).toEqual(commonQueries.timePrefs);
    });
  });

  context('generating bgLog query', () => {
    it('should set the `endpoints` query from the `opts` arg', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.bgLog.endpoints).toEqual('bgLog endpoints');
    });

    it('should query the required `aggregationsByDate`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.bgLog.aggregationsByDate).toEqual('dataByDate');
    });

    it('should query the required `types`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.bgLog.types).toEqual({ smbg: {} });
    });

    it('should query the required `stats`', () => {
      getStatsByChartType.mockReturnValue('bgLog stats');

      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);

      expect(getStatsByChartType).toHaveBeenCalledWith('bgLog', expect.any(String), expect.any(Object));
      expect(queries.bgLog.stats).toEqual('bgLog stats');
    });

    it('should set `bgSource` to `smbg`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.bgLog.bgSource).toEqual('smbg');
    });

    it('should query the required `commonQueries`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.bgLog.bgPrefs).toEqual(commonQueries.bgPrefs);
      expect(queries.bgLog.metaData).toEqual(commonQueries.metaData);
      expect(queries.bgLog.timePrefs).toEqual(commonQueries.timePrefs);
    });
  });

  context('generating settings query', () => {
    it('should query the required `commonQueries`', () => {
      const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, opts);
      expect(queries.settings.bgPrefs).toEqual(commonQueries.bgPrefs);
      expect(queries.settings.metaData).toEqual(commonQueries.metaData);
      expect(queries.settings.timePrefs).toEqual(commonQueries.timePrefs);
    });
  });
});
