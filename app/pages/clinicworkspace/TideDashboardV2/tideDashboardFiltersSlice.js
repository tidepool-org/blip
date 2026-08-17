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
  },
});

export const {
  setTideDashboardFilters,
} = tideDashboardFiltersSlice.actions;

export default tideDashboardFiltersSlice.reducer;
