import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY_TAB } from './FilterByCategory';

const initialState = {
  category: CATEGORY_TAB.DEFAULT,
  editPatientDialog: {
    patientId: null,
    isOpen: false,
  },
};

const deviceIssuesSlice = createSlice({
  name: 'deviceIssues',
  initialState,
  reducers: {
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setEditPatientDialogPatientId: (state, action) => {
      state.editPatientDialog.patientId = action.payload;
    },
    setEditPatientDialogIsOpen: (state, action) => {
      state.editPatientDialog.isOpen = action.payload;
    },
    resetEditPatientDialog: (state) => {
      state.editPatientDialog = initialState.editPatientDialog;
    },
    resetDeviceIssuesState: () => initialState,
  },
});

export const {
  setCategory,
  setEditPatientDialogPatientId,
  setEditPatientDialogIsOpen,
  resetEditPatientDialog,
  resetDeviceIssuesState,
} = deviceIssuesSlice.actions;
export default deviceIssuesSlice.reducer;
