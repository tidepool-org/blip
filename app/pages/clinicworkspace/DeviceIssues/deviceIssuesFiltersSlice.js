import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  patientTags: [],
};

const deviceIssuesFiltersSlice = createSlice({
  name: 'deviceIssuesFilters',
  initialState,
  reducers: {
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
    resetDeviceIssuesFilters: () => initialState,
  },
});

export const { setPatientTagsFilter, resetDeviceIssuesFilters } = deviceIssuesFiltersSlice.actions;
export default deviceIssuesFiltersSlice.reducer;
