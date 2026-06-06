import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as actions from '../../../../redux/actions';
import { useGenerateAGPImages } from '../../../../core/agpUtils';
import { selectPatient, selectUser } from '../../../../core/selectors';
import getQueries from './getQueries';
import {
  getEarliestPrintDate,
  getFetchedUntil,
  getMainFetchOpts,
  getPdfOpts,
} from './helpers';

export const PROCESS_STATUS = {
  IDLE: 'IDLE',
  CLEARING_CACHE: 'CLEARING_CACHE',
  FETCHING_PDF_DATA: 'FETCHING_PDF_DATA',
  GENERATING_PDF: 'GENERATING_PDF',
  GENERATING_AGP: 'GENERATING_AGP',
  ATTACHING_SVGS: 'ATTACHING_SVGS',
  TRIGGERING_PRINT: 'TRIGGERING_PRINT',
};

const inferProcessStep = (requestId, hasStarted, pdf, hasFetchedPDFData) => {
  if (!hasStarted) return PROCESS_STATUS.IDLE;

  // Stale pdf state from a different run — wipe before proceeding.
  const hasOtherPdfInState = !!pdf.opts?.requestId && pdf.opts.requestId !== requestId;
  if (hasOtherPdfInState) return PROCESS_STATUS.CLEARING_CACHE;

  if (pdf?.combined?.url)      return PROCESS_STATUS.TRIGGERING_PRINT;
  if (pdf?.opts?.svgDataURLS)  return PROCESS_STATUS.ATTACHING_SVGS;
  if (pdf?.data)               return PROCESS_STATUS.GENERATING_AGP;
  if (hasFetchedPDFData)       return PROCESS_STATUS.GENERATING_PDF;
  return PROCESS_STATUS.FETCHING_PDF_DATA;
};

/**
 * Drives the report-PDF pipeline from FETCHING_PDF_DATA → TRIGGERING_PRINT.
 *
 * Prerequisites — the consumer must ensure these are loaded into the redux store before passing
 * `printOpts` and `timePrefs` (typically by running {@link useFetchPrintModalData} first, plus
 * any clinic + clinic-patient fetches for clinic flows):
 *   - `state.blip.data.metaData.patientId` is set
 *   - `state.blip.allUsersMap[patientId]` (i.e. the patient record) is loaded
 *   - `state.blip.clinics[selectedClinicId].patients[patientId]` is loaded for clinic flows
 *
 * The pipeline auto-starts as soon as both `printOpts` and `timePrefs` are non-null.
 */
const usePrintPDFProcess = (api, patientId, { printOpts, timePrefs }) => {
  const dispatch = useDispatch();
  const generateAGPImages = useGenerateAGPImages();
  const [requestId] = useState(crypto.randomUUID());

  const data = useSelector(state => state.blip.data);
  const pdf = useSelector(state => state.blip.pdf);
  const patient = useSelector(state => selectPatient(state));
  const user = useSelector(state => selectUser(state));
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const clinicPatient = clinic?.patients?.[patientId];

  const printOptsRef = useRef(null);
  const pdfStartDateRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  const fetchedUntil = getFetchedUntil(data, printOptsRef.current);
  const hasFetchedPDFData = !!fetchedUntil
    && !!pdfStartDateRef.current
    && fetchedUntil <= pdfStartDateRef.current;

  const status = inferProcessStep(requestId, hasStarted, pdf, hasFetchedPDFData);

  // Kick off the pipeline as soon as both inputs are available.
  useEffect(() => {
    if (printOpts && timePrefs && !hasStarted) {
      printOptsRef.current = { ...printOpts, requestId };
      pdfStartDateRef.current = getEarliestPrintDate(printOpts, timePrefs);
      setHasStarted(true);
    }
  }, [printOpts, timePrefs, hasStarted]);

  useEffect(() => {
    switch (status) {
      case PROCESS_STATUS.CLEARING_CACHE:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
        break;

      case PROCESS_STATUS.FETCHING_PDF_DATA:
        const fetchPatientOpts = getMainFetchOpts(timePrefs, printOptsRef.current, fetchedUntil);
        dispatch(actions.async.fetchPatientData(api, fetchPatientOpts, patientId));
        break;

      case PROCESS_STATUS.GENERATING_PDF:
        const queries = getQueries(data, patient, clinicPatient, clinic, timePrefs, printOptsRef.current);
        const pdfOpts = getPdfOpts(printOptsRef.current, user, patient, clinicPatient);
        dispatch(actions.worker.generatePDFRequest('combined', queries, pdfOpts, patientId));
        break;

      case PROCESS_STATUS.GENERATING_AGP:
        const hasAgpBGM = pdf?.opts?.agpBGM?.disabled === false;
        const hasAgpCGM = pdf?.opts?.agpCGM?.disabled === false;
        const reportTypes = [(hasAgpBGM && 'agpBGM'), (hasAgpCGM && 'agpCGM')].filter(s => s);
        generateAGPImages(pdf, reportTypes);
        break;

      case PROCESS_STATUS.ATTACHING_SVGS:
        printOptsRef.current = pdf.opts;
        // Call generatePDFRequest a second time with SVGs in args to attach them to the PDF
        const agpQueries = getQueries(data, patient, clinicPatient, clinic, timePrefs, printOptsRef.current);
        const agpPdfOpts = getPdfOpts(printOptsRef.current, user, patient, clinicPatient);
        dispatch(actions.worker.generatePDFRequest('combined', agpQueries, agpPdfOpts, patientId));
        break;

      default:
        break;
    }
  }, [status]);

  return { status, pdf };
};

export default usePrintPDFProcess;
