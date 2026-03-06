import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './FilterByCategory';

const initialState = {
  category: CATEGORY.DEFAULT,
  offset: 0,
  editPatientDialog: {
    patientId: null,
    isOpen: false,
  },
  dataConnectionsModal: {
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
    setOffset: (state, action) => {
      state.offset = action.payload;
    },
    setEditPatientDialogPatientId: (state, action) => {
      state.editPatientDialog.patientId = action.payload;
    },
    setEditPatientDialogIsOpen: (state, action) => {
      state.editPatientDialog.isOpen = action.payload;
    },
    setDataConnectionsModalPatientId: (state, action) => {
      state.dataConnectionsModal.patientId = action.payload;
    },
    setDataConnectionsModalIsOpen: (state, action) => {
      state.dataConnectionsModal.isOpen = action.payload;
    },
    closeModals: (state) => {
      state.editPatientDialog = initialState.editPatientDialog;
      state.dataConnectionsModal = initialState.dataConnectionsModal;
    },
    resetDeviceIssuesState: () => initialState,
  },
});

export const {
  setCategory,
  setOffset,
  setEditPatientDialogPatientId,
  setEditPatientDialogIsOpen,
  setDataConnectionsModalPatientId,
  setDataConnectionsModalIsOpen,
  closeModals,
  resetDeviceIssuesState,
} = deviceIssuesSlice.actions;

export default deviceIssuesSlice.reducer;
