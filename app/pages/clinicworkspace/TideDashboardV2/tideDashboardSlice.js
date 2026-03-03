import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY_TAB } from './FilterByCategory';

const initialState = {
  category: CATEGORY_TAB.DEFAULT,
};

const tideDashboardSlice = createSlice({
  name: 'tideDashboard',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    resetTideDashboardState: () => initialState,
  },
});

export const { setCategory, resetTideDashboardState } = tideDashboardSlice.actions;
export default tideDashboardSlice.reducer;
