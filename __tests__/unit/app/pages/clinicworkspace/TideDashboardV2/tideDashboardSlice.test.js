/* global describe */
/* global it */
/* global expect */

import reducer, { CATEGORY } from '@app/pages/clinicworkspace/TideDashboardV2/tideDashboardSlice';

const { VERY_LOW, LOW_CGM_WEAR, TARGET } = CATEGORY;

describe('tideDashboardSlice', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  describe('initial state', () => {
    it('starts on Very Low at the first page', () => {
      expect(initialState.category).toBe(VERY_LOW);
      expect(initialState.offset).toBe(0);
    });
  });

  describe('setCategory', () => {
    it('sets the category', () => {
      const state = reducer(initialState, { type: 'tideDashboard/setCategory', payload: LOW_CGM_WEAR });
      expect(state.category).toBe(LOW_CGM_WEAR);
    });
  });

  describe('resetTideDashboardState', () => {
    it('restores the default category and offset', () => {
      let state = reducer(initialState, { type: 'tideDashboard/setCategory', payload: TARGET });
      state = reducer(state, { type: 'tideDashboard/setOffset', payload: 24 });

      state = reducer(state, { type: 'tideDashboard/resetTideDashboardState' });
      expect(state).toStrictEqual(initialState);
    });
  });
});
