import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModals } from '../tideDashboardSlice';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import EditPatientDialog from '../../../../components/clinic/EditPatientDialog';
import { tagTypes } from '../tideDashboardApi';

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const EditPatientDialogController = ({ api, patients }) => {
  const dispatch = useDispatch();
  const editPatientDialog = useSelector(state => state.blip.tideDashboard.editPatientDialog);
  const { patientId, isOpen } = editPatientDialog;

  const clinicPatient = patients.find(patient => patient.id === patientId);

  const handleCloseModal = () => dispatch(closeModals());

  const handleEditSuccess = () => {
    dispatch(closeModals());
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
  };

  if (!isOpen) return null;

  return (
    <>
      <EditPatientDialog
        api={api}
        clinicPatient={clinicPatient}
        isOpen={editPatientDialog.isOpen}
        onClose={handleCloseModal}
        onEditSuccess={handleEditSuccess}
      />
    </>
  );
};

export default EditPatientDialogController;
