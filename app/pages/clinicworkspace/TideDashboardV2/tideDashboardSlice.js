import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './FilterByCategory';

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
