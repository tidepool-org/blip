import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PatientDrawer from '../../../components/PatientDrawer/PatientDrawer';
import { setPatientDrawerPatientId } from './tideDashboardSlice';

const trackMetric = () => {};

const PatientDrawerController = ({ api }) => {
  const dispatch = useDispatch();
  const patientId = useSelector(state => state.blip.tideDashboard.patientDrawer.patientId);
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);

  const handleClose = () => {
    dispatch(setPatientDrawerPatientId(null));
  };

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
