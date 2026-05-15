import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientTags: [],
};

const tideDashboardFiltersSlice = createSlice({
  name: 'tideDashboardFilters',
  initialState,
  reducers: {
    setTideDashboardFilters: (_state, action) => action.payload || initialState,
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    resetTideDashboardFilters: () => initialState,
  },
});

export const { setPatientTagsFilter, setTideDashboardFilters, resetTideDashboardFilters } = tideDashboardFiltersSlice.actions;
export default tideDashboardFiltersSlice.reducer;
