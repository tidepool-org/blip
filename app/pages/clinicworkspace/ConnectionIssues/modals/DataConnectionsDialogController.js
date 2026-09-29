import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DataConnectionsDialog from '../../../../components/datasources/DataConnectionsDialog';
import { closeModals } from '../connectionIssuesSlice';

const DataConnectionsDialogController = ({ patients }) => {
  const dispatch = useDispatch();

  const dataConnectionsModal = useSelector(state => state.blip.connectionIssues.dataConnectionsModal);
  const { patientId, isOpen } = dataConnectionsModal;

  const patient = patients.find(patient => patient.id === patientId);

  const handleClose = () => dispatch(closeModals());

  return (
    <DataConnectionsDialog
      open={isOpen}
      patient={patient}
      onClose={handleClose}
    />
  );
};

export default DataConnectionsDialogController;
