import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import PatientDrawer from '../../../components/PatientDrawer/PatientDrawer';
import { trackMetric } from '../../../core/metricUtils';

const PatientDrawerController = ({ api }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const { search, pathname } = useLocation();
  const history = useHistory();

  const drawerPatientId = new URLSearchParams(search)?.get('drawerPatientId') || null;

  const handleClose = () => {
    const params = new URLSearchParams(search);
    params.delete('drawerPatientId');
    params.delete('drawerTab');
    history.replace({ pathname, search: params.toString() });
  };

  return (
    <PatientDrawer
      api={api}
      patientId={drawerPatientId}
      onClose={handleClose}
      trackMetric={trackMetric}
      period={summaryPeriod}
    />
  );
};

export default PatientDrawerController;
