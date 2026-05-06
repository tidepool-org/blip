import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientTags: [],
};

const deviceIssuesFiltersSlice = createSlice({
  name: 'deviceIssuesFilters',
  initialState,
  reducers: {
    setDeviceIssuesFilters: (_state, action) => action.payload || initialState,
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    resetDeviceIssuesFilters: () => initialState,
  },
});

export const { setPatientTagsFilter, setDeviceIssuesFilters, resetDeviceIssuesFilters } = deviceIssuesFiltersSlice.actions;
export default deviceIssuesFiltersSlice.reducer;
