import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientTags: [],
  clinicSites: [],
};

const deviceIssuesFiltersSlice = createSlice({
  name: 'deviceIssuesFilters',
  initialState,
  reducers: {
    setDeviceIssuesFilters: (_state, action) => action.payload || initialState,
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    setClinicSitesFilter: (state, action) => {
      state.clinicSites = action.payload;
    },
    resetDeviceIssuesFilters: () => initialState,
  },
});

export const {
  setDeviceIssuesFilters,
  setClinicSitesFilter,
  setPatientTagsFilter,
  resetDeviceIssuesFilters
} = deviceIssuesFiltersSlice.actions;

export default deviceIssuesFiltersSlice.reducer;
