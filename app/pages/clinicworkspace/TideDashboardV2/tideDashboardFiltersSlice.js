import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => ({
  lastData: 7,
  patientTags: [],
  clinicSites: [],
  summaryPeriod: '14d',
});

const tideDashboardFiltersSlice = createSlice({
  name: 'tideDashboardFilters',
  initialState: getInitialState(),
  reducers: {
    setTideDashboardFilters: (_state, action) => action.payload || getInitialState(),
    setLastDataFilter: (state, action) => {
      state.lastData = action.payload;
    },
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    setClinicSitesFilter: (state, action) => {
      state.clinicSites = action.payload;
    },
    setSummaryPeriodFilter: (state, action) => {
      state.summaryPeriod = action.payload;
    },
    resetTideDashboardFilters: () => getInitialState(),
  },
});

export const {
  setLastDataFilter,
  setPatientTagsFilter,
  setClinicSitesFilter,
  setSummaryPeriodFilter,
  setTideDashboardFilters,
  resetTideDashboardFilters,
} = tideDashboardFiltersSlice.actions;

export default tideDashboardFiltersSlice.reducer;
