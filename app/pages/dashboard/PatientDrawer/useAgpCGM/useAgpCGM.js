import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../../redux/actions';
import buildGenerateAGPImages from './buildGenerateAGPImages';
import moment from 'moment';

import getOpts from './getOpts';
import getQueries from './getQueries';
import { cloneDeep } from 'lodash';

export const STATUS = {
  // States in order of happy path AGP generation sequence
  INITIALIZED:    'INITIALIZED',
  STATE_CLEARED:  'STATE_CLEARED',
  PATIENT_LOADED: 'PATIENT_LOADED',
  DATA_PROCESSED: 'DATA_PROCESSED',
  SVGS_GENERATED: 'SVGS_GENERATED',

  // Other states
  NO_PATIENT:  'NO_PATIENT',
  NO_PATIENT_DATA:   'NO_PATIENT_DATA',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
};

// TODO: Revisit best way to listen for progress when we move away from blip.working
const inferLastCompletedStep = (patientId, data, pdf) => {
  // If the outputted data for a step in the process exists, we infer that the step was successful.
  // We do the lookup in reverse order to return the LATEST completed step

  // No Patient Selected
  if (!patientId) return STATUS.NO_PATIENT;

  // Incorrect Patient --- (occurs when user switches patient partway through fetching)
  const hasOtherPdfInState  = !!pdf.opts && pdf.opts.patient?.id !== patientId;
  const hasOtherDataInState = !!data.metaData.patientId && data.metaData.patientId !== patientId;

  if (hasOtherPdfInState || hasOtherDataInState) return STATUS.INITIALIZED;

  // Insufficient Data States ---
  const hasNoPatientData    = data.metaData?.size === 0;
  const hasInsufficientData = !!pdf?.opts?.svgDataURLS && !pdf?.opts?.svgDataURLS.agpCGM;
  const hasNoCGMData        = !!pdf?.combined && !pdf?.data;

  if (hasNoPatientData)    return STATUS.NO_PATIENT_DATA;
  if (hasInsufficientData) return STATUS.INSUFFICIENT_DATA;
  if (hasNoCGMData)        return STATUS.INSUFFICIENT_DATA;

  // Happy Path States ---
  const hasImagesInState  = !!pdf?.opts?.svgDataURLS;
  const hasPDFDataInState = !!pdf?.data;
  const hasPatientInState = !!data?.metaData?.patientId;

  if (hasImagesInState)  return STATUS.SVGS_GENERATED;
  if (hasPDFDataInState) return STATUS.DATA_PROCESSED;
  if (hasPatientInState) return STATUS.PATIENT_LOADED;

  return STATUS.STATE_CLEARED;
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

const useAgpCGM = (
  api,
  patientId,
  agpPeriodInDays = DEFAULT_AGP_PERIOD_IN_DAYS,
) => {
  const dispatch = useDispatch();
  const generateAGPImages = buildGenerateAGPImages(dispatch);

  const {
    removingGeneratedPDFS,
    removingData,
    fetchingPatientData,
    generatingPDF,
  } = useSelector(state => state.blip.working);

  const data   = useSelector(state => state.blip.data);
  const pdf    = useSelector(state => state.blip.pdf);
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const clinicPatient = clinic?.patients?.[patientId];
  const lastCompletedStep = inferLastCompletedStep(patientId, data, pdf);

  useEffect(() => {
    // Whenever a step is successfully completed, this effect triggers the next step in the sequence.

    switch(lastCompletedStep) {
      case STATUS.INITIALIZED:
        if (!removingGeneratedPDFS?.inProgress) dispatch(actions.worker.removeGeneratedPDFS());
        if (!removingData?.inProgress) dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
        break;

      case STATUS.STATE_CLEARED:
        const fetchPatientOpts = getFetchPatientOpts(agpPeriodInDays);
        if (!fetchingPatientData?.inProgress) dispatch(actions.async.fetchPatientData(api, fetchPatientOpts, patientId));
        break;

      case STATUS.PATIENT_LOADED:
        const opts    = getOpts(data, agpPeriodInDays);
        const queries = getQueries(data, clinicPatient, clinic, opts);
        const pdfOpts = { ...opts, patient: clinicPatient };
        if (!generatingPDF?.inProgress) dispatch(actions.worker.generatePDFRequest('combined', queries, pdfOpts, patientId));
        break;

      case STATUS.DATA_PROCESSED:
        generateAGPImages(pdf, ['agpCGM']);
        break;

      case STATUS.SVGS_GENERATED: // image generation complete, no further steps necessary
      case STATUS.NO_PATIENT: // no patient is loaded, no further steps necessary
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
  const isCorrectPatientInState = pdf.opts?.patient?.id === patientId;

  return {
    status:       lastCompletedStep,
    svgDataURLS:  isCorrectPatientInState ? pdf.opts?.svgDataURLS : null,
    agpCGM:       isCorrectPatientInState ? cloneDeep(pdf.data?.agpCGM) : null,
    offsetAgpCGM: isCorrectPatientInState ? cloneDeep(pdf.data?.offsetAgpCGM) : null,
  };
};

export default useAgpCGM;
