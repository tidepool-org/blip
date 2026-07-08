import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModals } from './tideDashboardSlice';
import { RTKQueryApi } from '../../../redux/api/baseApi';
import EditPatientDialog from '../../../components/modals/EditPatientDialog';
import { tagTypes } from './tideDashboardApi';

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const trackMetric = () => {};

const EditPatientDialogController = ({ api, patients }) => {
  const dispatch = useDispatch();
  const editPatientDialog = useSelector(state => state.blip.tideDashboard.editPatientDialog);

  const clinicPatient = patients.find(patient => patient.id === editPatientDialog.patientId);

  const handleCloseModal = () => {
    dispatch(closeModals());
  };

  const handleEditSuccess = () => {
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
  };

  return (
    <>
      <EditPatientDialog
        api={api}
        trackMetric={trackMetric}
        clinicPatient={clinicPatient}
        isOpen={editPatientDialog.isOpen}
        onClose={handleCloseModal}
        onEditSuccess={handleEditSuccess}
      />
    </>
  );
};

export default EditPatientDialogController;
