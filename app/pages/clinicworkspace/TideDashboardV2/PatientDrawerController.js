import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import PatientDrawer from '../../../components/PatientDrawer';

const PatientDrawerController = ({ api, patients }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const { search, pathname } = useLocation();
  const history = useHistory();

  const drawerPatientId = new URLSearchParams(search)?.get('drawerPatientId') || null;

  const patient = patients.find(patient => patient.id === drawerPatientId);

  const handleClose = () => {
    const params = new URLSearchParams(search);
    params.delete('drawerPatientId');
    params.delete('drawerTab');
    history.replace({ pathname, search: params.toString() });
  };

  return (
    <PatientDrawer
      api={api}
      patient={patient}
      onClose={handleClose}
      period={summaryPeriod}
    />
  );
};

export default PatientDrawerController;
