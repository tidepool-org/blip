import { createSlice } from '@reduxjs/toolkit';

const clinicWorkspaceFiltersSlice = createSlice({
  name: 'clinicWorkspaceFilters',
  initialState: {
    patientTags: [],
  },
  reducers: {
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
  },
});

export const { setPatientTagsFilter } = clinicWorkspaceFiltersSlice.actions;
export default clinicWorkspaceFiltersSlice.reducer;
