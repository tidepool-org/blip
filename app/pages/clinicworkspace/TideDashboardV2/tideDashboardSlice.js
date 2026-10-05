import { createSlice } from '@reduxjs/toolkit';

export const CATEGORY = {
  DEFAULT: 'DEFAULT',
  VERY_LOW: 'VERY_LOW',
  ANY_LOW: 'ANY_LOW',
  DROP_IN_TIR: 'DROP_IN_TIR',
  ANY_HIGH: 'ANY_HIGH',
  VERY_HIGH: 'VERY_HIGH',
  LOW_CGM_WEAR: 'LOW_CGM_WEAR',
  TARGET: 'TARGET',
};

const getInitialState = () => ({
  category: CATEGORY.DEFAULT,
  offset: 0,
});

const tideDashboardSlice = createSlice({
  name: 'tideDashboard',
  initialState: getInitialState(),
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setOffset: (state, action) => {
      state.offset = action.payload;
    },
    resetTideDashboardState: () => getInitialState(),
  },
});

export const {
  setCategory,
  setOffset,
  resetTideDashboardState,
} = tideDashboardSlice.actions;

export default tideDashboardSlice.reducer;
