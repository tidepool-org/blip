import { createSlice } from '@reduxjs/toolkit';

export const CATEGORY = {
  VERY_LOW: 'VERY_LOW',
  ANY_LOW: 'ANY_LOW',
  DROP_IN_TIR: 'DROP_IN_TIR',
  ANY_HIGH: 'ANY_HIGH',
  VERY_HIGH: 'VERY_HIGH',
  LOW_CGM_WEAR: 'LOW_CGM_WEAR',
  TARGET: 'TARGET',
};

const { VERY_LOW, ANY_LOW, DROP_IN_TIR, ANY_HIGH, VERY_HIGH, LOW_CGM_WEAR, TARGET } = CATEGORY;

// Each category sorts by the metric that defines it, in the direction that
// surfaces the most at-risk patients first.
export const getDefaultSort = (category) => {
  switch(category) {
    case VERY_LOW: return '-timeInVeryLowPercent';
    case ANY_LOW: return '-timeInAnyLowPercent';
    case DROP_IN_TIR: return '+timeInTargetPercentDelta';
    case ANY_HIGH: return '-timeInAnyHighPercent';
    case VERY_HIGH: return '-timeInVeryHighPercent';
    case LOW_CGM_WEAR: return '+timeCGMUsePercent';
    case TARGET: return '-timeInTargetPercent';
    default: return '+fullName';
  }
};

const getInitialState = () => ({
  category: VERY_LOW,
  sort: getDefaultSort(VERY_LOW),
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
    setSort: (state, action) => {
      state.sort = action.payload;
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
  setSort,
  setOffset,
  setEditPatientDialogPatientId,
  setEditPatientDialogIsOpen,
  setDataConnectionsModalPatientId,
  setDataConnectionsModalIsOpen,
  closeModals,
  resetTideDashboardState,
} = tideDashboardSlice.actions;

export default tideDashboardSlice.reducer;
