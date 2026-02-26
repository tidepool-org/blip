import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setEditPatientDialogIsOpen, setEditPatientDialogPatientId } from './deviceIssuesSlice';
import EditPatientDialog from '../../../components/modals/EditPatientDialog';

const trackMetric = () => {};

const EditPatientModal = ({ api, patients }) => {
  const dispatch = useDispatch();
  const editPatientDialog = useSelector(state => state.blip.deviceIssues.editPatientDialog);

  const clinicPatient = patients.find(patient => patient.id === editPatientDialog.patientId);

  const handleCloseModal = () => {
    dispatch(setEditPatientDialogIsOpen(false));
    dispatch(setEditPatientDialogPatientId(null));
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
