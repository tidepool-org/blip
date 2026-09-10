import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './filters/FilterByCategory';

const initialState = {
  category: CATEGORY.DEFAULT,
  offset: 0,
};

const connectionIssuesSlice = createSlice({
  name: 'connectionIssues',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setOffset: (state, action) => {
      state.offset = action.payload;
    },
    resetConnectionIssuesState: () => initialState,
  },
});

export const { setCategory, setOffset, resetConnectionIssuesState } = connectionIssuesSlice.actions;
export default connectionIssuesSlice.reducer;
