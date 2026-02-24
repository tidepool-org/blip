import { createSlice } from '@reduxjs/toolkit';

const clinicWorkspaceFiltersSlice = createSlice({
  name: 'clinicWorkspaceFilters',
  initialState: {
    timeCGMUsePercent: null,
    lastData: null,
    lastDataType: null,
    timeInRange: [],
    meetsGlycemicTargets: true,
    patientTags: [],
    clinicSites: [],
  },
  reducers: {
    setClinicWorkspaceFilters: (state, action) => {
      return { ...state, ...action.payload };
    },
    setPatientTagsFilter: (state, action) => {
      state.patientTags = action.payload;
    },
  },
});

export const { setClinicWorkspaceFilters, setPatientTagsFilter } = clinicWorkspaceFiltersSlice.actions;
export default clinicWorkspaceFiltersSlice.reducer;
