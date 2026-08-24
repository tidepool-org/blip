import { buildGetTideDashboardPatientsParams, tideDashboardExclusionQuery } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardApi';
import { CATEGORY } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';

describe ('tideDashboardApi', () => {
  describe('tideDashboardExclusionQuery', () => {
    const { DEFAULT, VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

    it('returns correct query args for DEFAULT category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(DEFAULT)).toStrictEqual({});
    });

    it('returns correct query args for VERY_LOW category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(VERY_LOW)).toStrictEqual({
        'cgm.timeInVeryLowPercent': '>=0.005', // >= 1%
      });
    });

    it('returns correct query args for ANY_LOW category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(ANY_LOW)).toStrictEqual({
        'cgm.timeInVeryLowPercent': '<0.005', // < 1%
        'cgm.timeInAnyLowPercent': '>=0.035', // >= 4%
      });
    });

    it('returns correct query args for DROP_IN_TIR category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(DROP_IN_TIR)).toStrictEqual({
        'cgm.timeInVeryLowPercent': '<0.005', // < 1%
        'cgm.timeInAnyLowPercent': '<0.035', // < 4%
        'cgm.timeInTargetPercentDelta': '<=-0.145', // <= -15%
      });
    });

    it('returns correct query args for ANY_HIGH category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(ANY_HIGH)).toStrictEqual({
        'cgm.timeInVeryLowPercent': '<0.005', // < 1%
        'cgm.timeInAnyLowPercent': '<0.035', // < 4%
        'cgm.timeInTargetPercentDelta': '>-0.145', // > -15%
        'cgm.timeInAnyHighPercent': '>=0.245', // >= 25%
      });
    });

    it('returns correct query args for VERY_HIGH category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(VERY_HIGH)).toStrictEqual({
        'cgm.timeInVeryLowPercent': '<0.005', // < 1%
        'cgm.timeInAnyLowPercent': '<0.035', // < 4%
        'cgm.timeInTargetPercentDelta': '>-0.145', // > -15%
        'cgm.timeInAnyHighPercent': '<0.245', // < 25%
        'cgm.timeInVeryHighPercent': '>=0.045', // >= 5%
      });
    });

    it('returns correct query args for LOW_CGM_WEAR category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(LOW_CGM_WEAR)).toStrictEqual({
        'cgm.timeInVeryLowPercent': '<0.005', // < 1%
        'cgm.timeInAnyLowPercent': '<0.035', // < 4%
        'cgm.timeInTargetPercentDelta': '>-0.145', // > -15%
        'cgm.timeInAnyHighPercent': '<0.245', // < 25%
        'cgm.timeInVeryHighPercent': '<0.045', // < 5%
        'cgm.timeCGMUsePercent': '<0.695', // < 70%
      });
    });

    it('returns correct query args for TARGET category', () => {
      expect(tideDashboardExclusionQuery.getQueryParams(TARGET)).toStrictEqual({
        'cgm.timeInVeryLowPercent': '<0.005', // < 1%
        'cgm.timeInAnyLowPercent': '<0.035', // < 4%
        'cgm.timeInTargetPercentDelta': '>-0.145', // > -15%
        'cgm.timeInAnyHighPercent': '<0.245', // < 25%
        'cgm.timeInVeryHighPercent': '<0.045', // < 5%
        'cgm.timeCGMUsePercent': '>=0.695', // >= 70%
      });
    });
  });

  describe('buildGetTideDashboardPatientsParams', () => {
    const cgmQueryParams = { 'cgm.timeInVeryLowPercent': '<0.005' };

    beforeEach(() => {
      jest.spyOn(tideDashboardExclusionQuery, 'getQueryParams').mockReturnValue(cgmQueryParams);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('joins tags and sites into comma-separated params', () => {
      expect(buildGetTideDashboardPatientsParams(
        50,                      // offset
        10,                      // limit
        CATEGORY.ANY_LOW,        // category
        '14d',                   // summaryPeriod
        '2025-05-15T00:00:00Z',  // lastDataFrom
        '2025-05-29T00:00:00Z',  // lastDataTo
        ['tagId1', 'tagId2'],    // tags
        ['siteId1', 'siteId2'],  // sites
      )).toStrictEqual({
        offset: 50,
        limit: 10,
        category: CATEGORY.ANY_LOW,
        period: '14d',
        'cgm.lastDataFrom': '2025-05-15T00:00:00Z',
        'cgm.lastDataTo': '2025-05-29T00:00:00Z',
        tags: 'tagId1,tagId2',
        sites: 'siteId1,siteId2',
        'cgm.timeInVeryLowPercent': '<0.005',
      });
    });

    it('omits tags and sites when no filters are applied', () => {
      expect(buildGetTideDashboardPatientsParams(
        0,                       // offset
        10,                      // limit
        CATEGORY.ANY_LOW,        // category
        '14d',                   // summaryPeriod
        '2025-05-15T00:00:00Z',  // lastDataFrom
        '2025-05-29T00:00:00Z',  // lastDataTo
        [],                      // tags
        [],                      // sites
      )).toStrictEqual({
        offset: 0,
        limit: 10,
        category: CATEGORY.ANY_LOW,
        period: '14d',
        'cgm.lastDataFrom': '2025-05-15T00:00:00Z',
        'cgm.lastDataTo': '2025-05-29T00:00:00Z',
        tags: undefined,
        sites: undefined,
        'cgm.timeInVeryLowPercent': '<0.005',
      });
    });
  });
});
