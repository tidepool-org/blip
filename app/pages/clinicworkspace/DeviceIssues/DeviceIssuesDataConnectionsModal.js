import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DataConnectionsModal from '../../../components/datasources/DataConnectionsModal';
import { closeModals } from './deviceIssuesSlice';

const DeviceIssuesDataConnectionsModal = ({ patients }) => {
  const dispatch = useDispatch();

  const dataConnectionsModal = useSelector(state => state.blip.deviceIssues.dataConnectionsModal);
  const { patientId, isOpen } = dataConnectionsModal;

  const patient = patients.find(patient => patient.id === patientId);

  const handleClose = () => dispatch(closeModals());

  return (
    <DataConnectionsModal
      open={isOpen}
      patient={patient}
      onClose={handleClose}
    />
  );
};

export default DeviceIssuesDataConnectionsModal;
