import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetEditPatientDialog } from './deviceIssuesSlice';
import { RTKQueryApi } from '../../../redux/api/baseApi';
import EditPatientDialog from '../../../components/modals/EditPatientDialog';
import { CACHE_TAGS } from './DeviceIssues';

const trackMetric = () => {};

const EditPatientModal = ({ api, patients }) => {
  const dispatch = useDispatch();
  const editPatientDialog = useSelector(state => state.blip.deviceIssues.editPatientDialog);

  const clinicPatient = patients.find(patient => patient.id === editPatientDialog.patientId);

  const handleCloseModal = () => {
    dispatch(resetEditPatientDialog());
  };

  const handleEditSuccess = () => {
    dispatch(RTKQueryApi.util.invalidateTags([CACHE_TAGS.DEVICE_ISSUES_PATIENTS]));
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

export default EditPatientModal;
