import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModals } from '../tideDashboardSlice';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import EditPatientDialog from '../../../../components/clinic/EditPatientDialog';
import { tagTypes } from '../tideDashboardApi';
import { useToasts } from '../../../../providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { ERR_UPDATING_CLINIC_PATIENT } from '../../../../redux/constants/errorMessages';

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const EditPatientDialogController = ({ api, patients }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const editPatientDialog = useSelector(state => state.blip.tideDashboard.editPatientDialog);
  const { patientId, isOpen } = editPatientDialog;

  const clinicPatient = patients.find(patient => patient.id === patientId);

  const handleCloseModal = () => dispatch(closeModals());

  const handleEditSuccess = () => {
    dispatch(closeModals());
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
    setToast({ variant: 'success', message: t('You have successfully updated a patient.') });
  };

  const handleEditFailure = () => {
    setToast({ variant: 'danger', message: ERR_UPDATING_CLINIC_PATIENT });
  };

  if (!isOpen || !clinicPatient) return null;

  return (
    <>
      <EditPatientDialog
        api={api}
        clinicPatient={clinicPatient}
        isOpen={isOpen}
        onClose={handleCloseModal}
        onEditSuccess={handleEditSuccess}
        onEditFailure={handleEditFailure}
      />
    </>
  );
};

export default EditPatientDialogController;
