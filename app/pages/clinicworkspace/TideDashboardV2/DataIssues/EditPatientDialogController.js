import React from 'react';
import { useDispatch } from 'react-redux';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import EditPatientDialog from '../../../../components/clinic/EditPatientDialog';
import { tagTypes } from '../tideDashboardApi';

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const EditPatientDialogController = ({ api, isOpen, patient, onClose }) => {
  const dispatch = useDispatch();

  const handleEditSuccess = () => {
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
  };

  return (
    <EditPatientDialog
      api={api}
      clinicPatient={patient}
      isOpen={isOpen && !!patient}
      onClose={onClose}
      onEditSuccess={handleEditSuccess}
    />
  );
};

export default EditPatientDialogController;
