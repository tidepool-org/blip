import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModals } from '../connectionIssuesSlice';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import EditPatientDialog from '../../../../components/clinic/EditPatientDialog';
import { tagTypes } from '../connectionIssuesApi';

const { CONNECTION_ISSUES_PATIENTS } = tagTypes;

const EditPatientDialogController = ({ api, patients }) => {
  const dispatch = useDispatch();
  const editPatientDialog = useSelector(state => state.blip.connectionIssues.editPatientDialog);

  const clinicPatient = patients.find(patient => patient.id === editPatientDialog.patientId);

  const handleCloseModal = () => dispatch(closeModals());

  const handleEditSuccess = () => {
    dispatch(closeModals());
    dispatch(RTKQueryApi.util.invalidateTags([CONNECTION_ISSUES_PATIENTS]));
  };

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
