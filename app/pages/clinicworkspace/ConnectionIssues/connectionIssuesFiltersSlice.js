import { createSlice } from '@reduxjs/toolkit';
import { SELECT_CLINIC_SUCCESS } from '../../../redux/constants/actionTypes';

const getInitialState = () => ({
  patientTags: [],
  clinicSites: [],
});

const connectionIssuesFiltersSlice = createSlice({
  name: 'connectionIssuesFilters',
  initialState: getInitialState(),
  reducers: {
    setConnectionIssuesFilters: (_state, action) => action.payload || getInitialState(),
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    setClinicSitesFilter: (state, action) => {
      state.clinicSites = action.payload;
    },
    resetConnectionIssuesFilters: () => getInitialState(),
  },
  extraReducers: (builder) => {
    builder.addCase(SELECT_CLINIC_SUCCESS, (_state, action) => {
      return action.payload?.connectionIssuesFilters || getInitialState();
    });
  },
});

export const {
  setConnectionIssuesFilters,
  setClinicSitesFilter,
  setPatientTagsFilter,
  resetConnectionIssuesFilters,
} = connectionIssuesFiltersSlice.actions;

export default connectionIssuesFiltersSlice.reducer;
