import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => ({
  patientTags: [],
  clinicSites: [],
});

const tideDashboardFiltersSlice = createSlice({
  name: 'tideDashboardFilters',
  initialState: getInitialState(),
  reducers: {
    setTideDashboardFilters: (_state, action) => action.payload || getInitialState(),
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    setClinicSitesFilter: (state, action) => {
      state.clinicSites = action.payload;
    },
    resetTideDashboardFilters: () => getInitialState(),
  },
});

export const {
  setPatientTagsFilter,
  setClinicSitesFilter,
  setTideDashboardFilters,
  resetTideDashboardFilters,
} = tideDashboardFiltersSlice.actions;

export default tideDashboardFiltersSlice.reducer;
