import { createSlice } from '@reduxjs/toolkit';

import { LOGOUT_REQUEST, SELECT_CLINIC_SUCCESS } from '../constants/actionTypes';

const isFiltersHydratedSlice = createSlice({
  name: 'isFiltersHydrated',
  initialState: false,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // When selectClinic() is called, tideDashboardFilters are hydrated from localStorage
      .addCase(SELECT_CLINIC_SUCCESS, () => true)
      .addCase(LOGOUT_REQUEST, () => false);
  },
});

export default isFiltersHydratedSlice.reducer;
