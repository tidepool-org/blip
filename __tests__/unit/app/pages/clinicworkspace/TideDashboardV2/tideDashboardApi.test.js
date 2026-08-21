import { tideDashboardExclusionQuery } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardApi';
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
});
