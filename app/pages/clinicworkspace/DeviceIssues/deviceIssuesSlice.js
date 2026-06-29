import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './FilterByCategory';

const initialState = {
  category: CATEGORY.DEFAULT,
  offset: 0,
};

const deviceIssuesSlice = createSlice({
  name: 'deviceIssues',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setOffset: (state, action) => {
      state.offset = action.payload;
    },
    resetDeviceIssuesState: () => initialState,
  },
});

export const { setCategory, setOffset, resetDeviceIssuesState } = deviceIssuesSlice.actions;
export default deviceIssuesSlice.reducer;
