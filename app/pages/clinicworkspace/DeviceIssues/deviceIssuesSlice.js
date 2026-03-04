import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './FilterByCategory';

const initialState = {
  category: CATEGORY.DEFAULT,
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
