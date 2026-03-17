import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import PatientDrawer from '../../../components/PatientDrawer/PatientDrawer';
import { useFlags } from 'launchdarkly-react-client-sdk';

const trackMetric = () => {};

const PatientDrawerController = ({ api }) => {
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const { showTideDashboardPatientDrawer } = useFlags();
  const { search, pathname } = useLocation();
  const history = useHistory();

  const drawerPatientId = new URLSearchParams(search)?.get('drawerPatientId') || null;

  const handleClose = () => {
    const params = new URLSearchParams(search);
    params.delete('drawerPatientId');
    params.delete('drawerTab');
    history.replace({ pathname, search: params.toString() });
  };

  if (!showTideDashboardPatientDrawer) return null;

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
