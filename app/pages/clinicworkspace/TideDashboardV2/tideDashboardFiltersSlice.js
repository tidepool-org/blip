import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastData: 14,
  patientTags: [],
};

const tideDashboardFiltersSlice = createSlice({
  name: 'tideDashboardFilters',
  initialState,
  reducers: {
    setLastDataFilter: (state, action) => {
      state.lastData = action.payload;
    },
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    resetTideDashboardFilters: () => initialState,
  },
});

export const { setLastDataFilter, setPatientTagsFilter, resetTideDashboardFilters } = tideDashboardFiltersSlice.actions;
export default tideDashboardFiltersSlice.reducer;
