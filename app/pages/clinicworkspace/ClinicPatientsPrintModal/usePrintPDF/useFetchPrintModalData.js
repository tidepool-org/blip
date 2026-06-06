import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import noop from 'lodash/noop';

import * as actions from '../../../../redux/actions';
import utils from '../../../../core/utils';
import { selectPatient } from '../../../../core/selectors';
import { buildPrintWindowUrl } from './helpers';

export const MODAL_STATUS = {
  CLEARING_CACHE: 'CLEARING_CACHE',
  FETCHING_MODAL_DATA: 'FETCHING_MODAL_DATA',
  AWAITING_INPUT: 'AWAITING_INPUT',
  NO_PATIENT_DATA: 'NO_PATIENT_DATA',
};

const inferModalStep = (patientId, data, patient) => {
  // Stale data from a previous patient — wipe before proceeding.
  const hasOtherDataInState = !!data.metaData.patientId && data.metaData.patientId !== patientId;
  if (hasOtherDataInState) return MODAL_STATUS.CLEARING_CACHE;

  const hasNoPatientData = data.metaData?.size === 0;
  if (hasNoPatientData) return MODAL_STATUS.NO_PATIENT_DATA;

  const hasModalDataInState = !!data?.metaData?.patientId && patient?.userid;
  if (hasModalDataInState) return MODAL_STATUS.AWAITING_INPUT;

  return MODAL_STATUS.FETCHING_MODAL_DATA;
};

/**
 * Loads the patient's latest-datum metadata and computes timePrefs so the print date-range modal
 * can render. Returns a `print(opts)` that opens a new window at `/print?...`, where
 * {@link usePrintPDFProcess} runs in a fresh redux store — so multiple patients can be printed
 * concurrently in separate windows.
 */
const useFetchPrintModalData = (api, patientId) => {
  const dispatch = useDispatch();

  const data = useSelector(state => state.blip.data);
  const patient = useSelector(state => selectPatient(state));
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const timePrefsRef = useRef(null);
  const [canPrint, setCanPrint] = useState(false);

  const status = inferModalStep(patientId, data, patient);

  useEffect(() => {
    switch (status) {
      case MODAL_STATUS.CLEARING_CACHE:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
        break;

      case MODAL_STATUS.FETCHING_MODAL_DATA:
        dispatch(actions.async.fetchPatientLatestDatums(api, patientId));
        dispatch(actions.async.fetchPatient(api, patientId));
        break;

      case MODAL_STATUS.AWAITING_INPUT:
        timePrefsRef.current = utils.getTimePrefsForDataProcessing(
          data?.metaData?.latestTimeZone || {},
          {},
        );
        setCanPrint(true);
        break;

      default:
        break;
    }
  }, [status]);

  const openPrintInNewWindow = (opts = {}) => {
    window.open(buildPrintWindowUrl(patientId, opts, selectedClinicId), '_blank');
  };

  return {
    status,
    canPrint,
    print: canPrint ? openPrintInNewWindow : noop,
    modalData: {
      timePrefs: timePrefsRef.current,
      latestDatumByType: canPrint ? data?.metaData?.latestDatumByType : null,
    },
  };
};

export default useFetchPrintModalData;
