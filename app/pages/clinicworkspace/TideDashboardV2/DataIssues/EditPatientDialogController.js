import React from 'react';
import { useDispatch } from 'react-redux';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import EditPatientDialog from '../../../../components/modals/EditPatientDialog';
import { tagTypes } from '../tideDashboardApi';

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const trackMetric = () => {};

const EditPatientDialogController = ({ api, isOpen, patient, onClose }) => {
  const dispatch = useDispatch();

  const handleEditSuccess = () => {
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
  };

  return (
    <EditPatientDialog
      api={api}
      trackMetric={trackMetric}
      clinicPatient={patient}
      isOpen={isOpen && !!patient}
      onClose={onClose}
      onEditSuccess={handleEditSuccess}
    />
  );
};

export default EditPatientDialogController;
