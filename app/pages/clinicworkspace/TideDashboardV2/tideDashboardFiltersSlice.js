import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientTags: [],
};

const tideDashboardFiltersSlice = createSlice({
  name: 'tideDashboardFilters',
  initialState,
  reducers: {
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    resetTideDashboardFilters: () => initialState,
  },
});

export const { setPatientTagsFilter, resetTideDashboardFilters } = tideDashboardFiltersSlice.actions;
export default tideDashboardFiltersSlice.reducer;
