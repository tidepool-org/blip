import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PatientDrawer from '../../../components/PatientDrawer/PatientDrawer';
import { setPatientDrawerPatientId } from './tideDashboardSlice';
import { useFlags } from 'launchdarkly-react-client-sdk';

const trackMetric = () => {};

const PatientDrawerController = ({ api }) => {
  const dispatch = useDispatch();
  const patientId = useSelector(state => state.blip.tideDashboard.patientDrawer.patientId);
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);

  const { showTideDashboardPatientDrawer } = useFlags();

  const handleClose = () => {
    dispatch(setPatientDrawerPatientId(null));
  };

  if (!showTideDashboardPatientDrawer) return null;

  return (
    <PatientDrawer
      api={api}
      patientId={patientId}
      onClose={handleClose}
      trackMetric={trackMetric}
      period={summaryPeriod}
    />
  );
};

export default PatientDrawerController;
