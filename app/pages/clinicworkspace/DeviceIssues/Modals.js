import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setEditPatientDialogIsOpen } from './deviceIssuesSlice';
import EditPatientDialog from '../../../components/modals/EditPatientDialog';

const trackMetric = () => {};

const Modals = ({ api }) => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const editPatientDialog = useSelector(state => state.blip.deviceIssues.editPatientDialog);

  const clinicPatient = useSelector(state => state.blip.clinics[selectedClinicId]?.patients?.[editPatientDialog.patientId]);

  const patients = useSelector(state => state.blip.clinics[selectedClinicId]?.patients);

  // const clinicPatient = useSelector(state => state.blip.clinics?.);

  return null;

  return (
    <>
      <EditPatientDialog
        api={api}
        trackMetric={trackMetric}
        clinicPatient={clinicPatient}
        isOpen={editPatientDialog.isOpen}
        onClose={() => dispatch(setEditPatientDialogIsOpen(false))}
      />
    </>
  );
};

export default Modals;
