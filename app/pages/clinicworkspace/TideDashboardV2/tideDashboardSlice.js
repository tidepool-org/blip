import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './FilterByCategory';

const initialState = {
  category: CATEGORY.DEFAULT,
  offset: 0,
  patientDrawer: {
    patientId: null,
  },
};

const tideDashboardSlice = createSlice({
  name: 'tideDashboard',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setOffset: (state, action) => {
      state.offset = action.payload;
    },
    setPatientDrawerPatientId: (state, action) => {
      state.patientDrawer.patientId = action.payload;
    },
    resetTideDashboardState: () => initialState,
  },
});

export const {
  setCategory,
  setOffset,
  setPatientDrawerPatientId,
  resetTideDashboardState,
} = tideDashboardSlice.actions;
export default tideDashboardSlice.reducer;
