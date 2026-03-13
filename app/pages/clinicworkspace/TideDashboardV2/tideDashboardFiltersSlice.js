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

export const selectPeriod = (state) => {
  switch(state.blip.tideDashboardFilters?.lastData) {
    case 1: return '1d';
    case 2: return '2d';
    case 7: return '7d';
    case 14: return '14d';
    case 30: return '30d';
    case 90: return '90d';
    default: return null;
  }
};
