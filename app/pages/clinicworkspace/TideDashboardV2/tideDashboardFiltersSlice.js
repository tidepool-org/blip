import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastData: 14,
  patientTags: [],
  summaryPeriod: '14d',
};

const tideDashboardFiltersSlice = createSlice({
  name: 'tideDashboardFilters',
  initialState,
  reducers: {
    setTideDashboardFilters: (_state, action) => action.payload || initialState,
    setLastDataFilter: (state, action) => {
      state.lastData = action.payload;
    },
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    setSummaryPeriodFilter: (state, action) => {
      state.summaryPeriod = action.payload;
    },
    resetTideDashboardFilters: () => initialState,
  },
});

export const { setLastDataFilter, setPatientTagsFilter, setSummaryPeriodFilter, setTideDashboardFilters, resetTideDashboardFilters } = tideDashboardFiltersSlice.actions;
export default tideDashboardFiltersSlice.reducer;
