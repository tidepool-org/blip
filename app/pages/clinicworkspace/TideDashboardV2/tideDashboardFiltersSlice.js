import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientTags: [],
  clinicSites: [],
};

const tideDashboardFiltersSlice = createSlice({
  name: 'tideDashboardFilters',
  initialState,
  reducers: {
    setTideDashboardFilters: (_state, action) => action.payload || initialState,
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    setClinicSitesFilter: (state, action) => {
      state.clinicSites = action.payload;
    },
    resetTideDashboardFilters: () => initialState,
  },
});

export const {
  setPatientTagsFilter,
  setClinicSitesFilter,
  setTideDashboardFilters,
  resetTideDashboardFilters
} = tideDashboardFiltersSlice.actions;

export default tideDashboardFiltersSlice.reducer;
