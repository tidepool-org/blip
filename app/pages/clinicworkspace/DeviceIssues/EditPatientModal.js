import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { resetEditPatientDialog } from './deviceIssuesSlice';
import EditPatientDialog from '../../../components/modals/EditPatientDialog';

const trackMetric = () => {};

const EditPatientModal = ({ api, patients }) => {
  const dispatch = useDispatch();
  const editPatientDialog = useSelector(state => state.blip.deviceIssues.editPatientDialog);

  const clinicPatient = patients.find(patient => patient.id === editPatientDialog.patientId);

  const handleCloseModal = () => {
    dispatch(resetEditPatientDialog());
  };

  return (
    <>
      <EditPatientDialog
        api={api}
        trackMetric={trackMetric}
        clinicPatient={clinicPatient}
        isOpen={editPatientDialog.isOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default EditPatientModal;
