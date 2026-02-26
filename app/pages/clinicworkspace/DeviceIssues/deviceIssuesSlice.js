import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY_TAB } from './FilterByCategory';

const initialState = {
  category: CATEGORY_TAB.DEFAULT,
};

const deviceIssuesSlice = createSlice({
  name: 'deviceIssues',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    resetDeviceIssuesState: () => initialState,
  },
});

export const { setCategory, resetDeviceIssuesState } = deviceIssuesSlice.actions;
export default deviceIssuesSlice.reducer;
