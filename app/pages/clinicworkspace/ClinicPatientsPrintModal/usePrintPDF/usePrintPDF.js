import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../../redux/actions';
import moment from 'moment';
import usePrintWindow from './usePrintWindow';

import { utils as vizUtils } from '@tidepool/viz';
const { getTimezoneFromTimePrefs } = vizUtils.datetime;
import utils from '../../../../core/utils';
import personUtils from '../../../../core/personutils';

import getQueries from './getQueries';

import noop from 'lodash/noop';
import get from 'lodash/get';
import filter from 'lodash/filter';
import min from 'lodash/min';
import at from 'lodash/at';
import map from 'lodash/map';
import keys from 'lodash/keys';
import isNil from 'lodash/isNil';
import { useGenerateAGPImages } from '../../../../core/agpUtils';
import { selectPatient, selectUser } from '../../../../core/selectors';
import { DEFAULT_CGM_SAMPLE_INTERVAL, MS_IN_MIN } from '../../../../core/constants';

export const STATUS = {
  // States in order of happy path AGP generation sequence
  CLEARING_CACHE: 'CLEARING_CACHE',
  FETCHING_MODAL_DATA: 'FETCHING_MODAL_DATA',
  AWAITING_INPUT: 'AWAITING_INPUT',
  FETCHING_PDF_DATA: 'FETCHING_PDF_DATA',
  GENERATING_PDF: 'GENERATING_PDF',
  GENERATING_AGP: 'GENERATING_AGP',
  ATTACHING_SVGS: 'ATTACHING_SVGS',
  TRIGGERING_PRINT: 'TRIGGERING_PRINT',

  // Other states
  NO_PATIENT_DATA: 'NO_PATIENT_DATA',
};

// TODO: Revisit best way to listen for progress when we move away from blip.working
const inferLastCompletedStep = (requestId, patientId, data, patient, pdf, hasClickedPrint, hasFetchedPDFData) => {
  // If the outputted data for a step in the process exists, we infer that the step was successful.
  // We do the lookup in reverse order to return the LATEST completed step

  // Incorrect Patient --- (occurs when user switches patient partway through fetching)
  const hasOtherPdfInState = !!pdf.opts?.requestId && pdf.opts.requestId !== requestId;
  const hasOtherDataInState = !!data.metaData.patientId && data.metaData.patientId !== patientId;

  if (hasOtherPdfInState || hasOtherDataInState) return STATUS.CLEARING_CACHE;

  // Insufficient Data States ---
  const hasNoPatientData    = data.metaData?.size === 0;
  const hasInsufficientData = !!pdf?.opts?.svgDataURLS && !pdf?.opts?.svgDataURLS.agpCGM && !pdf?.opts?.svgDataURLS.agpBGM;

  if (hasNoPatientData)    return STATUS.NO_PATIENT_DATA;
  if (hasInsufficientData) return STATUS.INSUFFICIENT_DATA;

  // Happy Path States ---
  const hasPDFUrlInState  = !!pdf?.combined?.url;
  const hasImagesInState  = !!pdf?.opts?.svgDataURLS;
  const hasPDFDataInState = !!pdf?.data;

  const hasPatientDataInState = !!data?.metaData?.patientId && hasFetchedPDFData;
  const hasPrintTriggered = !!data?.metaData?.patientId && patient?.userid && hasClickedPrint;
  const hasModalDataInState = !!data?.metaData?.patientId && patient?.userid;

  if (hasPDFUrlInState)      return STATUS.TRIGGERING_PRINT;
  if (hasImagesInState)      return STATUS.ATTACHING_SVGS;
  if (hasPDFDataInState)     return STATUS.GENERATING_AGP;
  if (hasPatientDataInState) return STATUS.GENERATING_PDF;
  if (hasPrintTriggered)     return STATUS.FETCHING_PDF_DATA;
  if (hasModalDataInState)   return STATUS.AWAITING_INPUT;

  return STATUS.FETCHING_MODAL_DATA;
};

const getMainFetchOpts = (timePrefs, opts, fetchedUntil) => {
  const enabledOpts = filter(opts, { disabled: false });
  const earliestPrintDate = min(at(enabledOpts, map(keys(enabledOpts), key => `${key}.endpoints.0`)));

  const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(timePrefs)).toISOString();

  const endDate = fetchedUntil
    ? moment.utc(fetchedUntil).subtract(1, 'milliseconds').toISOString()
    : moment.utc().add(1, 'days').toISOString();

  const sampleIntervalMinimum = opts.daily?.cgmSampleIntervalRange?.[0] || DEFAULT_CGM_SAMPLE_INTERVAL;

  return {
    initial: false,
    startDate,
    endDate,
    returnData: false,
    forceDataWorkerAddDataRequest: true,
    useCache: false,
    sampleIntervalMinimum,
  };
};

const getEarliestPrintDate = (printOpts, timePrefs) => {
  const enabledOpts = filter(printOpts, { disabled: false });
  const earliestPrintDate = min(at(enabledOpts, map(keys(enabledOpts), key => `${key}.endpoints.0`)));
  const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(timePrefs)).toISOString();

  return startDate;
};

const getPdfOpts = (printOpts, user, patient, clinicPatient) => {
  const combinedPatient = clinicPatient ? personUtils.combinedAccountAndClinicPatient(patient, clinicPatient) : null;
  const sourcePatient = personUtils.isClinicianAccount(user) && !!combinedPatient ? combinedPatient : patient;
  const patientSettings = patient?.settings || {};
  const siteChangeSource = patient?.settings?.siteChangeSource;

  const pdfPatient = {
    ...sourcePatient,
    id: clinicPatient?.id || patient?.id,
    settings: { ...patientSettings, siteChangeSource },
  };

  return { ...printOpts, patient: pdfPatient };
};

const getFetchedUntil = (data, printOpts) => {
  return printOpts?.daily?.cgmSampleIntervalRange?.[0] === MS_IN_MIN
    ? get(data, 'oneMinCgmFetchedUntil') || moment.utc().toISOString()
    : get(data, 'fetchedUntil');
};

const usePrintPDF = (
  api,
  patientId,
  onPrintTriggered = noop,
) => {
  const dispatch = useDispatch();
  const generateAGPImages = useGenerateAGPImages();
  const { openPrintWindow, triggerPrint } = usePrintWindow();
  const [requestId] = useState(crypto.randomUUID());

  const data = useSelector(state => state.blip.data);
  const pdf = useSelector(state => state.blip.pdf);
  const patient = useSelector(state => selectPatient(state));
  const user = useSelector(state => selectUser(state));
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const clinicPatient = clinic?.patients?.[patientId];

  const printOptsRef = useRef(null);
  const timePrefsRef = useRef(null);
  const pdfStartDateRef = useRef(null);

  const getPrintOpts = () => printOptsRef.current;
  const getTimePrefs = () => timePrefsRef.current;
  const getPdfStartDate = () => pdfStartDateRef.current;

  const [canPrint, setCanPrint] = useState(false);
  const [hasClickedPrint, setHasClickedPrint] = useState(false);

  const fetchedUntil = getFetchedUntil(data, getPrintOpts());
  const hasFetchedPDFData = !!fetchedUntil && !!getPdfStartDate() && fetchedUntil <= getPdfStartDate();

  const lastCompletedStep = inferLastCompletedStep(requestId, patientId, data, patient, pdf, hasClickedPrint, hasFetchedPDFData);

  useEffect(() => {
    // Whenever a step is successfully completed, this effect triggers the next step in the sequence.

    switch(lastCompletedStep) {
      case STATUS.CLEARING_CACHE:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
        break;

      case STATUS.FETCHING_MODAL_DATA:
        dispatch(actions.async.fetchPatientLatestDatums(api, patientId));
        dispatch(actions.async.fetchPatient(api, patientId));
        break;

      case STATUS.AWAITING_INPUT:
        const latestTimeZone = data?.metaData?.latestTimeZone || {};
        timePrefsRef.current = utils.getTimePrefsForDataProcessing(latestTimeZone, {});
        setCanPrint(true);
        break;

      case STATUS.FETCHING_PDF_DATA:
        const fetchPatientOpts = getMainFetchOpts(getTimePrefs(), getPrintOpts(), fetchedUntil);
        dispatch(actions.async.fetchPatientData(api, fetchPatientOpts, patientId));
        break;

      case STATUS.GENERATING_PDF:
        const queries = getQueries(data, patient, clinicPatient, clinic, getTimePrefs(), getPrintOpts());
        const pdfOpts = getPdfOpts(getPrintOpts(), user, patient, clinicPatient);
        dispatch(actions.worker.generatePDFRequest('combined', queries, pdfOpts, patientId));
        break;

      case STATUS.GENERATING_AGP:
        const hasAgpBGM = pdf?.opts?.agpBGM?.disabled === false;
        const hasAgpCGM = pdf?.opts?.agpCGM?.disabled === false;
        const reportTypes = [(hasAgpBGM && 'agpBGM'), (hasAgpCGM && 'agpCGM')].filter(s => s);
        generateAGPImages(pdf, reportTypes);
        break;

      case STATUS.ATTACHING_SVGS:
        printOptsRef.current = pdf.opts;
        // Call generatePDFRequest a second time with SVGs in args to attach them to the PDF
        const agpQueries = getQueries(data, patient, clinicPatient, clinic, getTimePrefs(), getPrintOpts());
        const agpPdfOpts = getPdfOpts(getPrintOpts(), user, patient, clinicPatient);
        dispatch(actions.worker.generatePDFRequest('combined', agpQueries, agpPdfOpts, patientId));
        break;

      case STATUS.TRIGGERING_PRINT:
        if (pdf?.opts?.requestId === requestId) {
          triggerPrint(pdf);
        }
        setTimeout(() => {
          onPrintTriggered();
        }, 100);

      default:
        break;
    }
  }, [lastCompletedStep]);

  const onPrintPDF = (opts = {}) => {
    printOptsRef.current = { ...opts, requestId };
    pdfStartDateRef.current = getEarliestPrintDate(getPrintOpts(), getTimePrefs());

    openPrintWindow();
    setHasClickedPrint(true);
  };

  return {
    status: lastCompletedStep,
    canPrint,
    print: canPrint ? onPrintPDF : noop,
    modalData: {
      timePrefs: getTimePrefs(),
      latestDatumByType: canPrint ? data?.metaData?.latestDatumByType : null,
    },
  };
};

export default usePrintPDF;
