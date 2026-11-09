import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import DataConnectionsDialog from '../../../../components/datasources/DataConnectionsDialog';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import { tagTypes } from '../tideDashboardApi';

const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const DataConnectionsDialogController = ({ isOpen, patient, onClose }) => {
  const dispatch = useDispatch();

  const handlePatientUpdated = useCallback(() => {
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
  }, [dispatch]);

  if (!isOpen || !patient) return null;

  return (
    <DataConnectionsDialog
      open={isOpen && !!patient}
      patient={patient}
      onClose={onClose}
      onPatientUpdated={handlePatientUpdated}
    />
  );
};

export default DataConnectionsDialogController;
