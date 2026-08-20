import { createSlice } from '@reduxjs/toolkit';

// IMPORTANT: This slice is automatically persisted between user sessions via localStorage.
// If you don't want your state variable value persisted, use a different redux slice for it.

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
