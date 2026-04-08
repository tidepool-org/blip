import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../../redux/actions';
import buildGenerateAGPImages from './buildGenerateAGPImages';
import moment from 'moment';

import getOpts from './getOpts';
import getQueries from './getQueries';
import noop from 'lodash/noop';

export const STATUS = {
  // States in order of happy path AGP generation sequence
  INITIALIZED:    'INITIALIZED',
  STATE_CLEARED:  'STATE_CLEARED',
  FIRST_LOADED:   'FIRST_LOADED',
  PRINT_STARTED:  'PRINT_STARTED',
  SECOND_LOADED:  'SECOND_LOADED',
  DATA_PROCESSED: 'DATA_PROCESSED',
  SVGS_GENERATED: 'SVGS_GENERATED',
  PDF_GENERATED:  'PDF_GENERATED',

  // Other states
  NO_PATIENT_DATA:   'NO_PATIENT_DATA',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
};

// TODO: Revisit best way to listen for progress when we move away from blip.working
const inferLastCompletedStep = (patientId, data, pdf, hasPrintStarted) => {
  // If the outputted data for a step in the process exists, we infer that the step was successful.
  // We do the lookup in reverse order to return the LATEST completed step

  // Incorrect Patient --- (occurs when user switches patient partway through fetching)
  const hasOtherPdfInState  = !!pdf.opts && pdf.opts.patient?.id !== patientId;
  const hasOtherDataInState = !!data.metaData.patientId && data.metaData.patientId !== patientId;

  if (hasOtherPdfInState || hasOtherDataInState) return STATUS.INITIALIZED;

  // Insufficient Data States ---
  const hasNoPatientData    = data.metaData?.size === 0;
  const hasInsufficientData = !!pdf?.opts?.svgDataURLS && !pdf?.opts?.svgDataURLS.agpCGM;




  // const hasNoCGMData        = !!pdf?.combined && !pdf?.data; // TODO: FIX




  if (hasNoPatientData)    return STATUS.NO_PATIENT_DATA;
  if (hasInsufficientData) return STATUS.INSUFFICIENT_DATA;
  // if (hasNoCGMData)        return STATUS.INSUFFICIENT_DATA;

  // Happy Path States ---
  const hasPDFUrlInState  = !!pdf?.combined?.url;
  const hasImagesInState  = !!pdf?.opts?.svgDataURLS;
  const hasPDFDataInState = !!pdf?.data;
  const hasSecondData = !!data?.metaData?.patientId && data?.metaData?.initial === false;
  const hasFirstData = !!data?.metaData?.patientId;

  if (hasPDFUrlInState)                return STATUS.PDF_GENERATED;
  if (hasImagesInState)                return STATUS.SVGS_GENERATED;
  if (hasPDFDataInState)               return STATUS.DATA_PROCESSED;
  if (hasSecondData)                   return STATUS.SECOND_LOADED;
  if (hasFirstData && hasPrintStarted) return STATUS.PRINT_STARTED;
  if (hasFirstData)                    return STATUS.FIRST_LOADED;

  return STATUS.STATE_CLEARED;
};

const getFetchLatestDatumPatientOpts = (
) => {
  return {
    initial: true,
    forceDataWorkerAddDataRequest: true,
    useCache: false,
  };
};

const getFetchPatientOpts = (
  agpPeriodInDays,
  safetyFactorDays = 3,
) => {
  let daysToFetch = agpPeriodInDays * 2; // Fetch enough data for current AND past-period AGP (ie. double)
  daysToFetch += safetyFactorDays;       // Request a few extra days in case of timezone mismatch.

  return {
    initial: false,
    startDate: moment.utc().subtract(daysToFetch, 'days').toISOString(),
    endDate: moment.utc().add(1, 'days').toISOString(),
    forceDataWorkerAddDataRequest: true,
    useCache: false,
  };
};

const DEFAULT_AGP_PERIOD_IN_DAYS = 14;

const usePrintPDF = (
  api,
  patientId,
  agpPeriodInDays = DEFAULT_AGP_PERIOD_IN_DAYS,
) => {
  const dispatch = useDispatch();
  const generateAGPImages = buildGenerateAGPImages(dispatch);

  const data   = useSelector(state => state.blip.data);
  const pdf    = useSelector(state => state.blip.pdf);
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const clinicPatient = clinic?.patients?.[patientId];

  const [canPrint, setCanPrint] = useState(false);
  const [hasPrintStarted, setHasPrintStarted] = useState(false);
  const printOptsRef = useRef(null);

  const lastCompletedStep = inferLastCompletedStep(patientId, data, pdf, hasPrintStarted);

  useEffect(() => {
    // Whenever a step is successfully completed, this effect triggers the next step in the sequence.

    switch(lastCompletedStep) {
      case STATUS.INITIALIZED:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
        break;

      case STATUS.STATE_CLEARED:
        const latestDatumFetchOpts = getFetchLatestDatumPatientOpts();
        dispatch(actions.async.fetchPatientData(api, latestDatumFetchOpts, patientId));
        break;

      case STATUS.FIRST_LOADED:
        setCanPrint(true);
        break;

      case STATUS.PRINT_STARTED:
        const fetchPatientOpts = getFetchPatientOpts(agpPeriodInDays);
        dispatch(actions.async.fetchPatientData(api, fetchPatientOpts, patientId));
        break;

      case STATUS.SECOND_LOADED:
        // const opts    = getOpts(data, agpPeriodInDays);
        const opts = printOptsRef.current;
        const queries = getQueries(data, clinicPatient, clinic, opts);
        const pdfOpts = { ...opts, patient: clinicPatient };
        dispatch(actions.worker.generatePDFRequest('combined', queries, pdfOpts, patientId));
        break;

      case STATUS.DATA_PROCESSED:
        generateAGPImages(pdf, ['agpCGM']);
        break;

      case STATUS.SVGS_GENERATED:
        // TODO: Fix AGP mounting
        break;

      case STATUS.PDF_GENERATED:
        const printWindowRef = window.open(pdf.combined.url);
        printWindowRef.focus();
        printWindowRef.print();

      default:
        break;
    }
  }, [lastCompletedStep]);

  useEffect(() => {
    // Clear state on component dismount

    return () => {
      dispatch(actions.worker.removeGeneratedPDFS());
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
    };
  }, []);

  // Note: probably unnecessary; failsafe to ensure that data is being returned for correct patient
  const isCorrectPatientInState = pdf.opts?.patient?.id === patientId; // TODO: FIX

  const onPrintPDF = (opts = {}) => {
    printOptsRef.current = opts;
    setHasPrintStarted(true);
  };

  return {
    status: lastCompletedStep,
    canPrint,
    onPrintPDF: canPrint ? onPrintPDF : noop,
  };
};

export default usePrintPDF;
