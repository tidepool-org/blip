import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './FilterByCategory';

const initialState = {
  category: CATEGORY.DEFAULT,
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
