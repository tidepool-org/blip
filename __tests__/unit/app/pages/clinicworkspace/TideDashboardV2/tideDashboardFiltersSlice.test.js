/* global describe */
/* global it */
/* global expect */

import reducer from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardFiltersSlice';

describe('tideDashboardFiltersSlice', () => {
  const defaultFilters = { lastData: 7, patientTags: [], clinicSites: [], summaryPeriod: '14d' };
  const appliedFilters = { lastData: 30, patientTags: ['tag1'], clinicSites: ['site1'], summaryPeriod: '30d' };

  describe('SELECT_CLINIC_SUCCESS', () => {
    it('should hydrate the filters carried on the clinic selection', () => {
      const persistedFilters = { lastData: 14, patientTags: ['tag2'], clinicSites: [], summaryPeriod: '7d' };

      const state = reducer(appliedFilters, {
        type: 'SELECT_CLINIC_SUCCESS',
        payload: { clinicId: 'clinic123', tideDashboardFilters: persistedFilters },
      });

      expect(state).toStrictEqual(persistedFilters);
    });

    it('should reset to the default filters when the clinic selection carries none', () => {
      // Selecting a clinic with nothing persisted
      let state = reducer(appliedFilters, {
        type: 'SELECT_CLINIC_SUCCESS',
        payload: { clinicId: 'clinic123', tideDashboardFilters: undefined },
      });

      expect(state).toStrictEqual(defaultFilters);

      // Unsetting the clinic
      state = reducer(appliedFilters, {
        type: 'SELECT_CLINIC_SUCCESS',
        payload: { clinicId: null },
      });

      expect(state).toStrictEqual(defaultFilters);
    });
  });
});
