import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../../redux/actions';
import moment from 'moment';
import usePrintWindow from './usePrintWindow';

import { utils as vizUtils } from '@tidepool/viz';
const { getTimezoneFromTimePrefs } = vizUtils.datetime;
import utils from '../../../../core/utils';

import getQueries from './getQueries';

import noop from 'lodash/noop';
import filter from 'lodash/filter';
import min from 'lodash/min';
import at from 'lodash/at';
import map from 'lodash/map';
import keys from 'lodash/keys';
import { useGenerateAGPImages } from '../../../../core/agpUtils';
import { selectPatient } from '../../../../core/selectors';

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
const inferLastCompletedStep = (patientId, data, patient, pdf, hasClickedPrint, isSecondSkipped) => {
  // If the outputted data for a step in the process exists, we infer that the step was successful.
  // We do the lookup in reverse order to return the LATEST completed step

  // Incorrect Patient --- (occurs when user switches patient partway through fetching)
  const hasOtherPdfInState  = !!pdf.opts && pdf.opts.patient?.id !== patientId;
  const hasOtherDataInState = !!data.metaData.patientId && data.metaData.patientId !== patientId;

  if (hasOtherPdfInState || hasOtherDataInState) return STATUS.INITIALIZED;

  // Insufficient Data States ---
  const hasNoPatientData    = data.metaData?.size === 0;
  const hasInsufficientData = !!pdf?.opts?.svgDataURLS && !pdf?.opts?.svgDataURLS.agpCGM && !pdf?.opts?.svgDataURLS.agpBGM;
  // const hasNoCGMData        = !!pdf?.combined && !pdf?.data; // TODO: FIX

  if (hasNoPatientData)    return STATUS.NO_PATIENT_DATA;
  if (hasInsufficientData) return STATUS.INSUFFICIENT_DATA;
  // if (hasNoCGMData)        return STATUS.INSUFFICIENT_DATA;

  // Happy Path States ---
  const hasPDFUrlInState  = !!pdf?.combined?.url;
  const hasImagesInState  = !!pdf?.opts?.svgDataURLS;
  const hasPDFDataInState = !!pdf?.data;

  const hasAllData = data?.metaData?.initial === false || isSecondSkipped;
  const hasSecondData = !!data?.metaData?.patientId && hasAllData;
  const hasFirstData = !!data?.metaData?.patientId && patient?.userid;

  if (hasPDFUrlInState)                return STATUS.PDF_GENERATED;
  if (hasImagesInState)                return STATUS.SVGS_GENERATED;
  if (hasPDFDataInState)               return STATUS.DATA_PROCESSED;
  if (hasSecondData)                   return STATUS.SECOND_LOADED;
  if (hasFirstData && hasClickedPrint) return STATUS.PRINT_STARTED;
  if (hasFirstData)                    return STATUS.FIRST_LOADED;

  return STATUS.STATE_CLEARED;
};

const getInitialFetchOpts = () => ({
  initial: true,
  forceDataWorkerAddDataRequest: true,
  returnData: false,
  useCache: false,
});

const getMainFetchOpts = (timePrefs, opts, fetchedUntil) => {
  const enabledOpts = filter(opts, { disabled: false });
  const earliestPrintDate = min(at(enabledOpts, map(keys(enabledOpts), key => `${key}.endpoints.0`)));

  const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(timePrefs)).toISOString();

  const endDate = fetchedUntil
    ? moment.utc(fetchedUntil).subtract(1, 'milliseconds').toISOString()
    : moment.utc().add(1, 'days').toISOString();

  return {
    initial: false,
    startDate: startDate,
    endDate: endDate,
    returnData: false,
    forceDataWorkerAddDataRequest: true,
    useCache: false,
  };
};

const getEarliestPrintDate = (printOpts, timePrefs) => {
  const enabledOpts = filter(printOpts, { disabled: false });
  const earliestPrintDate = min(at(enabledOpts, map(keys(enabledOpts), key => `${key}.endpoints.0`)));
  const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(timePrefs)).toISOString();

  return startDate;
};

const getPdfOpts = (printOpts, clinicPatient, patient) => {
  const patientSettings = patient?.settings || {};
  const siteChangeSource = patient?.settings?.siteChangeSource;

  const pdfPatient = { ...clinicPatient, settings: { ...patientSettings, siteChangeSource } };

  return { ...printOpts, patient: pdfPatient };
};

const usePrintPDF = (
  api,
  patientId,
  onPrintTriggered = noop,
) => {
  const dispatch = useDispatch();
  const generateAGPImages = useGenerateAGPImages();
  const { openPrintWindow, triggerPrint } = usePrintWindow();

  const data   = useSelector(state => state.blip.data);
  const pdf    = useSelector(state => state.blip.pdf);
  const patient = useSelector(state => selectPatient(state));
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const clinicPatient = clinic?.patients?.[patientId];
  const fetchedUntil = data?.fetchedUntil;

  const [canPrint, setCanPrint] = useState(false);
  const [hasClickedPrint, setHasClickedPrint] = useState(false);
  const [isSecondSkipped, setIsSecondSkipped] = useState(false);

  const printOptsRef = useRef(null);
  const timePrefsRef = useRef(null);

  const getPrintOpts = () => printOptsRef.current;
  const getTimePrefs = () => timePrefsRef.current;

  const lastCompletedStep = inferLastCompletedStep(patientId, data, patient, pdf, hasClickedPrint, isSecondSkipped);

  useEffect(() => {
    // Whenever a step is successfully completed, this effect triggers the next step in the sequence.

    switch(lastCompletedStep) {
      case STATUS.INITIALIZED:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
        break;

      case STATUS.STATE_CLEARED:
        const initialFetchOpts = getInitialFetchOpts();
        dispatch(actions.async.fetchPatientData(api, initialFetchOpts, patientId));
        dispatch(actions.async.fetchPatient(api, patientId));
        break;

      case STATUS.FIRST_LOADED:
        const latestTimeZone = data?.metaData?.latestTimeZone || {};
        timePrefsRef.current = utils.getTimePrefsForDataProcessing(latestTimeZone, {});
        setCanPrint(true);
        break;

      case STATUS.PRINT_STARTED:
        const startDate = getEarliestPrintDate(getPrintOpts(), getTimePrefs());
        const isSecondFetchRequired = startDate < fetchedUntil || !fetchedUntil;

        if (isSecondFetchRequired) {
          const fetchPatientOpts = getMainFetchOpts(getTimePrefs(), getPrintOpts(), fetchedUntil);
          dispatch(actions.async.fetchPatientData(api, fetchPatientOpts, patientId));
        } else {
          setIsSecondSkipped(true);
        }

        openPrintWindow();
        break;

      case STATUS.SECOND_LOADED:
        const queries = getQueries(data, patient, clinicPatient, clinic, getTimePrefs(), getPrintOpts());
        const pdfOpts = getPdfOpts(getPrintOpts(), clinicPatient, patient);
        dispatch(actions.worker.generatePDFRequest('combined', queries, pdfOpts, patientId));
        break;

      case STATUS.DATA_PROCESSED:
        const hasAgpBGM = pdf?.opts?.agpBGM?.disabled === false;
        const hasAgpCGM = pdf?.opts?.agpCGM?.disabled === false;
        const reportTypes = [(hasAgpBGM && 'agpBGM'), (hasAgpCGM && 'agpCGM')].filter(s => s);
        generateAGPImages(pdf, reportTypes);
        break;

      case STATUS.SVGS_GENERATED:
        printOptsRef.current = pdf.opts;
        const agpQueries = getQueries(data, patient, clinicPatient, clinic, getTimePrefs(), getPrintOpts());
        const agpPdfOpts = getPdfOpts(getPrintOpts(), clinicPatient, patient);
        dispatch(actions.worker.generatePDFRequest('combined', agpQueries, agpPdfOpts, patientId));
        break;

      case STATUS.PDF_GENERATED:
        triggerPrint(pdf);
        onPrintTriggered();

      default:
        break;
    }
  }, [lastCompletedStep]);

  useEffect(() => {
    // Clear state on component dismount

    return () => {
      dispatch(actions.sync.clearPatientInView());
      dispatch(actions.worker.removeGeneratedPDFS());
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
    };
  }, []);

  // Note: probably unnecessary; failsafe to ensure that data is being returned for correct patient
  const isCorrectPatientInState = pdf.opts?.patient?.id === patientId; // TODO: FIX

  const onPrintPDF = (opts = {}) => {
    printOptsRef.current = opts;
    setHasClickedPrint(true);
  };

  return {
    status: lastCompletedStep,
    canPrint,
    timePrefs: timePrefsRef.current,
    latestDatumByType: canPrint ? data?.metaData?.latestDatumByType : null,
    onPrintPDF: canPrint ? onPrintPDF : noop,
  };
};

export default usePrintPDF;
