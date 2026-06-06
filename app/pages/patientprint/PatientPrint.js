import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from 'theme-ui';
import { useTranslation } from 'react-i18next';

import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;

import * as actions from '../../redux/actions';
import {
  MODAL_STATUS,
  useFetchPrintModalData,
  usePrintPDFProcess,
} from '../clinicworkspace/ClinicPatientsPrintModal/usePrintPDF';

const parsePrintOpts = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const PatientPrint = ({ api, location }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { patientId, clinicId, printOpts } = useMemo(() => {
    const params = new URLSearchParams(location?.search || window.location.search);
    return {
      patientId: params.get('patientId'),
      clinicId: params.get('clinicId'),
      printOpts: parsePrintOpts(params.get('opts')),
    };
  }, [location?.search]);

  // Mirror the modal's clinic context into this fresh window so usePrintPDFProcess resolves
  // `state.blip.clinics[selectedClinicId]` correctly. We fetch the clinic first because the
  // FETCH_PATIENT_FROM_CLINIC_SUCCESS reducer assumes `state.blip.clinics[clinicId]` already
  // exists.
  const clinic = useSelector(state => (
    clinicId ? state.blip.clinics?.[clinicId] : null
  ));
  const clinicPatient = clinic?.patients?.[patientId];
  const fetchingClinicPatient = useSelector(state => state.blip.working.fetchingPatientFromClinic);
  const clinicPatientFetchSettled = fetchingClinicPatient?.completed === true
    || fetchingClinicPatient?.completed === false;
  const clinicPatientReady = !clinicId || !!clinicPatient || clinicPatientFetchSettled;

  useEffect(() => {
    if (clinicId) {
      dispatch(actions.sync.selectClinicSuccess(clinicId));
      dispatch(actions.async.fetchClinic(api, clinicId));
    }
  }, [api, clinicId]);

  const clinicLoaded = !!clinic?.id;
  const clinicPatientLoaded = !!clinicPatient;
  useEffect(() => {
    if (clinicId && clinicLoaded && !clinicPatientLoaded) {
      dispatch(actions.async.fetchPatientFromClinic(api, clinicId, patientId));
    }
  }, [api, clinicId, patientId, clinicLoaded, clinicPatientLoaded]);

  // Phase 1: fetch initial patient data + patient record (FETCHING_MODAL_DATA → AWAITING_INPUT).
  const { status: modalStatus, canPrint, modalData } = useFetchPrintModalData(api, patientId);
  const { timePrefs } = modalData;

  // Phase 2: kick off the report-PDF pipeline once prerequisites are ready.
  const processInputs = canPrint && clinicPatientReady && printOpts
    ? { printOpts, timePrefs }
    : { printOpts: null, timePrefs: null };
  const { pdf } = usePrintPDFProcess(api, patientId, processInputs);

  const pdfUrl = pdf?.combined?.url;

  const iframeRef = useRef(null);
  const [hasTriggeredPrint, setHasTriggeredPrint] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!pdfUrl || !iframe || hasTriggeredPrint) return;

    const handleLoad = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Fallback for browsers that don't allow scripting into the PDF viewer.
        window.focus();
        window.print();
      }
      setHasTriggeredPrint(true);
    };

    iframe.addEventListener('load', handleLoad);
    iframe.src = pdfUrl;

    return () => iframe.removeEventListener('load', handleLoad);
  }, [pdfUrl, hasTriggeredPrint]);

  if (!patientId || !printOpts) {
    return (
      <Box p={4}>
        {t('This print link is missing required parameters.')}
      </Box>
    );
  }

  if (modalStatus === MODAL_STATUS.NO_PATIENT_DATA) {
    return (
      <Box p={4}>
        {t('This patient does not have any data.')}
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'fixed', inset: 0 }}>
      {!pdfUrl && <Loader show />}
      <iframe
        ref={iframeRef}
        title="Tidepool report"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          visibility: pdfUrl ? 'visible' : 'hidden',
        }}
      />
    </Box>
  );
};

export default PatientPrint;
