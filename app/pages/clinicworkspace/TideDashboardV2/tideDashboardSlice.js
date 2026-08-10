import { createSlice } from '@reduxjs/toolkit';

import { CATEGORY } from './FilterByCategory';

const getInitialState = () => ({
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
});

const tideDashboardSlice = createSlice({
  name: 'tideDashboard',
  initialState: getInitialState(),
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
      const { editPatientDialog, dataConnectionsModal } = getInitialState();

      state.editPatientDialog = editPatientDialog;
      state.dataConnectionsModal = dataConnectionsModal;
    },
    resetTideDashboardState: () => getInitialState(),
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
  resetTideDashboardState,
} = tideDashboardSlice.actions;

export default tideDashboardSlice.reducer;
