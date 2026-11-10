import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import isEmpty from 'lodash/isEmpty';
import isFinite from 'lodash/isFinite';
import PatientDrawer from '../../../components/PatientDrawer';
import * as actions from '../../../redux/actions';

const PatientDrawerController = ({ api, patients }) => {
  const dispatch = useDispatch();
  const summaryPeriod = useSelector(state => state.blip.tideDashboardFilters.summaryPeriod);
  const pdf = useSelector(state => state.blip.pdf);
  const dataSize = useSelector(state => state.blip.data?.metaData?.size);
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

  // Clear drawer-related GET params if patient does not exist
  useEffect(() => {
    if (drawerPatientId && !patient) handleClose();
  }, [drawerPatientId, patient]);

  // Failsafe to ensure blip.pdf and blip.data are always cleared out after the drawer is closed
  useEffect(() => {
    if (!drawerPatientId && (!isEmpty(pdf) || isFinite(dataSize))) {
      dispatch(actions.worker.removeGeneratedPDFS());
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null));
    }
  }, [drawerPatientId, pdf, dataSize, dispatch]);

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
