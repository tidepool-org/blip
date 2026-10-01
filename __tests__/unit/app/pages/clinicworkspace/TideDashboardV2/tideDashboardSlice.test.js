/* global describe */
/* global it */
/* global expect */

import reducer, { CATEGORY, getDefaultSort } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';

const { VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

describe('tideDashboardSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  describe('getDefaultSort', () => {
    it('sorts each category by the metric that defines it', () => {
      expect(getDefaultSort(VERY_LOW)).toBe('-timeInVeryLowPercent');
      expect(getDefaultSort(ANY_LOW)).toBe('-timeInAnyLowPercent');
      expect(getDefaultSort(DROP_IN_TIR)).toBe('+timeInTargetPercentDelta');
      expect(getDefaultSort(ANY_HIGH)).toBe('-timeInAnyHighPercent');
      expect(getDefaultSort(VERY_HIGH)).toBe('-timeInVeryHighPercent');
      expect(getDefaultSort(LOW_CGM_WEAR)).toBe('+timeCGMUsePercent');
      expect(getDefaultSort(TARGET)).toBe('-timeInTargetPercent');
    });

    it('falls back to sorting by name for an unknown category', () => {
      expect(getDefaultSort('NOT_A_CATEGORY')).toBe('+fullName');
    });
  });

  describe('initial state', () => {
    it('starts on Very Low with its default sort', () => {
      expect(initialState.category).toBe(VERY_LOW);
      expect(initialState.sort).toBe('-timeInVeryLowPercent');
    });
  });

  describe('setCategory', () => {
    it('sets the category and leaves the sort untouched', () => {
      let state = reducer(initialState, { type: 'tideDashboard/setSort', payload: '+averageGlucoseMmol' });

      state = reducer(state, { type: 'tideDashboard/setCategory', payload: LOW_CGM_WEAR });
      expect(state.category).toBe(LOW_CGM_WEAR);
      expect(state.sort).toBe('+averageGlucoseMmol');
    });
  });

  describe('setSort', () => {
    it('stores the given sort string', () => {
      const state = reducer(initialState, { type: 'tideDashboard/setSort', payload: '-glucoseManagementIndicator' });
      expect(state.sort).toBe('-glucoseManagementIndicator');
    });
  });

  describe('resetTideDashboardState', () => {
    it('restores the default category and sort', () => {
      let state = reducer(initialState, { type: 'tideDashboard/setCategory', payload: TARGET });
      state = reducer(state, { type: 'tideDashboard/setSort', payload: '+timeInTargetPercent' });
      expect(state.sort).toBe('+timeInTargetPercent');

      state = reducer(state, { type: 'tideDashboard/resetTideDashboardState' });
      expect(state).toStrictEqual(initialState);
    });
  });
});
