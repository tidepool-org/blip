import React from 'react';
import DataConnectionsDialog from '../../../../components/datasources/DataConnectionsDialog';

const DataConnectionsDialogController = ({ isOpen, patient, onClose }) => (
  <DataConnectionsDialog
    open={isOpen && !!patient}
    patient={patient}
    onClose={onClose}
  />
);

export default DataConnectionsDialogController;
