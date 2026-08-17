import React from 'react';
import DataConnectionsModal from '../../../../components/datasources/DataConnectionsModal';

const DataConnectionsModalController = ({ isOpen, patient, onClose }) => (
  <DataConnectionsModal
    open={isOpen && !!patient}
    patient={patient}
    onClose={onClose}
  />
);

export default DataConnectionsModalController;
