import React from 'react';
import { useDispatch } from 'react-redux';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import EditPatientDialog from '../../../../components/clinic/EditPatientDialog';
import { tagTypes } from '../tideDashboardApi';
import { useTranslation } from 'react-i18next';
import { ERR_UPDATING_CLINIC_PATIENT } from '../../../../redux/constants/errorMessages';

import { useToasts } from '../../../../providers/ToastProvider';

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const EditPatientDialogController = ({ api, isOpen, patient, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();

  const handleEditSuccess = () => {
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
    setToast({ variant: 'success', message: t('You have successfully updated a patient.') });
  };

  const handleEditFailure = () => {
    setToast({ variant: 'danger', message: ERR_UPDATING_CLINIC_PATIENT });
  };

  if (!isOpen || !patient) return null;

  return (
    <EditPatientDialog
      api={api}
      clinicPatient={patient}
      isOpen={isOpen && !!patient}
      onClose={onClose}
      onEditSuccess={handleEditSuccess}
      onEditFailure={handleEditFailure}
    />
  );
};

export default EditPatientDialogController;
