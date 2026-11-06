import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DataConnectionsDialog from '../../../../components/datasources/DataConnectionsDialog';
import { RTKQueryApi } from '../../../../redux/api/baseApi';
import { closeModals } from '../tideDashboardSlice';
import { tagTypes } from '../tideDashboardApi';
const { TIDE_DASHBOARD_PATIENTS } = tagTypes;

const DataConnectionsDialogController = ({ patients }) => {
  const dispatch = useDispatch();

  const dataConnectionsModal = useSelector(state => state.blip.tideDashboard.dataConnectionsModal);
  const { patientId, isOpen } = dataConnectionsModal;

  const patient = patients.find(patient => patient.id === patientId);

  const handleClose = () => dispatch(closeModals());

  const handlePatientUpdated = useCallback(() => {
    dispatch(RTKQueryApi.util.invalidateTags([TIDE_DASHBOARD_PATIENTS]));
  }, [dispatch]);

  if (!isOpen || !patient) return null;

  return (
    <DataConnectionsDialog
      open={isOpen}
      patient={patient}
      onClose={handleClose}
      onPatientUpdated={handlePatientUpdated}
    />
  );
};

export default DataConnectionsDialogController;
