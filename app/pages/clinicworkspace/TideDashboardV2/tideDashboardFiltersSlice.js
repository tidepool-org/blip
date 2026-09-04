import { createSlice } from '@reduxjs/toolkit';
import { SELECT_CLINIC_SUCCESS } from '../../../redux/constants/actionTypes';

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
  extraReducers: (builder) => {
    builder.addCase(SELECT_CLINIC_SUCCESS, (_state, action) => {
      return action.payload?.tideDashboardFilters || getInitialState();
    });
  },
});

export const {
  setTideDashboardFilters,
  setLastDataFilter,
  setPatientTagsFilter,
  setClinicSitesFilter,
  setSummaryPeriodFilter,
  resetTideDashboardFilters,
} = tideDashboardFiltersSlice.actions;

export default tideDashboardFiltersSlice.reducer;
