import { getStatsByChartType, getMostRecentDatumTimeByChartType } from '../../../../app/core/dataViewUtils';

describe('getStatsByChartType', () => {
  context('basics', () => {
    it('should add appropriate stats when cbg is selected', () => {
      expect(getStatsByChartType('basics', 'cbg')).toEqual([
        'timeInRange',
        'averageGlucose',
        'sensorUsage',
        'totalInsulin',
        'carbs',
        'averageDailyDose',
        'glucoseManagementIndicator',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });

    it('should add appropriate stats when smbg is selected', () => {
      expect(getStatsByChartType('basics', 'smbg')).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'carbs',
        'averageDailyDose',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });

    it('should add appropriate stats when automated basal device is detected', () => {
      expect(getStatsByChartType('basics', 'smbg', { isAutomatedBasalDevice: true })).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'timeInAuto',
        'carbs',
        'averageDailyDose',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });

    it('should add appropriate stats when a settings-overridable device is detected', () => {
      expect(getStatsByChartType('basics', 'smbg', { isSettingsOverrideDevice: true })).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'timeInOverride',
        'carbs',
        'averageDailyDose',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });
  });

  context('daily', () => {
    it('should add appropriate stats when cbg is selected', () => {
      expect(getStatsByChartType('daily', 'cbg')).toEqual([
        'timeInRange',
        'averageGlucose',
        'totalInsulin',
        'carbs',
        'standardDev',
        'coefficientOfVariation',
      ]);
    });

    it('should add appropriate stats when smbg is selected', () => {
      expect(getStatsByChartType('daily', 'smbg')).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'carbs',
      ]);
    });

    it('should add appropriate stats when automated basal device is detected', () => {
      expect(getStatsByChartType('daily', 'smbg', { isAutomatedBasalDevice: true })).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'timeInAuto',
        'carbs',
      ]);
    });

    it('should add appropriate stats when settings-overridable device is detected', () => {
      expect(getStatsByChartType('daily', 'smbg', { isSettingsOverrideDevice: true })).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'timeInOverride',
        'carbs',
      ]);
    });
  });

  context('bgLog', () => {
    it('should add appropriate stats', () => {
      expect(getStatsByChartType('bgLog')).toEqual([
        'readingsInRange',
        'averageGlucose',
        'standardDev',
        'coefficientOfVariation',
      ]);
    });
  });

  context('trends', () => {
    it('should add appropriate stats when cbg is selected', () => {
      expect(getStatsByChartType('trends', 'cbg')).toEqual([
        'timeInRange',
        'averageGlucose',
        'sensorUsage',
        'totalInsulin',
        'averageDailyDose',
        'glucoseManagementIndicator',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });

    it('should add appropriate stats when smbg is selected', () => {
      expect(getStatsByChartType('trends', 'smbg')).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'averageDailyDose',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });

    it('should add appropriate stats when automated basal device is detected', () => {
      expect(getStatsByChartType('trends', 'smbg', { isAutomatedBasalDevice: true })).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'averageDailyDose',
        'timeInAuto',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });

    it('should add appropriate stats when settings-overridable device is detected', () => {
      expect(getStatsByChartType('trends', 'smbg', { isSettingsOverrideDevice: true })).toEqual([
        'readingsInRange',
        'averageGlucose',
        'totalInsulin',
        'averageDailyDose',
        'timeInOverride',
        'standardDev',
        'coefficientOfVariation',
        'bgExtents',
      ]);
    });
  });

  context('chartType undefined', () => {
    it('should return an empty array', () => {
      expect(getStatsByChartType(undefined)).toEqual([]);
    });
  });

  context('bgSource chartPref state missing', () => {
    it('should add appropriate stats when no bgSource is available', () => {
      expect(getStatsByChartType('daily', undefined)).toEqual([
        'averageGlucose',
        'totalInsulin',
        'carbs',
      ]);
    });

    it('should add appropriate stats when cbg is provided via arg', () => {
      expect(getStatsByChartType('daily', 'cbg')).toEqual([
        'timeInRange',
        'averageGlucose',
        'totalInsulin',
        'carbs',
        'standardDev',
        'coefficientOfVariation',
      ]);
    });
  });
});

describe('getMostRecentDatumTimeByChartType', () => {
  const latestDatumByType = {
    basal: { type: 'basal', normalTime: 1, normalEnd: 10 },
    bolus: { type: 'bolus', normalTime: 2 },
    smbg: { type: 'cbg', normalTime: 3 },
    deviceEvent: { type: 'deviceEvent', normalTime: 4 },
    food: { type: 'food', normalTime: 5 },
    message: { type: 'message', normalTime: 6 },
    pumpSettings: { type: 'pumpSettings', normalTime: 7 },
    cbg: { type: 'smbg', normalTime: 8 },
    wizard: { type: 'wizard', normalTime: 9 },
  };

  it('should return the latest datum time for basics', () => {
    // should return the basal normalEnd
    expect(getMostRecentDatumTimeByChartType(latestDatumByType, 'basics')).toBe(10);
  });

  it('should return the latest datum time for daily', () => {
    // should return the basal normalEnd
    expect(getMostRecentDatumTimeByChartType(latestDatumByType, 'daily')).toBe(10);
  });

  it('should return the latest datum time for bgLog', () => {
    // should return the smbg normalTime
    expect(getMostRecentDatumTimeByChartType(latestDatumByType, 'bgLog')).toBe(3);
  });

  it('should return the latest datum time for trends', () => {
    // should return the cbg normalTime
    expect(getMostRecentDatumTimeByChartType(latestDatumByType, 'trends')).toBe(8);
  });
});
