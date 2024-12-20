import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../../../redux/actions';
import buildGenerateAGPImagesFunction from './buildGenerateAGPImagesFunction';

import getOpts from './getOpts';
import getQueries from './getQueries';

export const STATUS = {  
  // States in order of happy path AGP generation sequence
  INITIALIZED:    'INITIALIZED',
  STATE_CLEARED:  'STATE_CLEARED',
  PATIENT_LOADED: 'PATIENT_LOADED',
  DATA_PROCESSED: 'DATA_PROCESSED',
  SVGS_GENERATED: 'SVGS_GENERATED',

  // Other states
  NO_PATIENT_DATA:   'NO_PATIENT_DATA',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
}

const inferLastCompletedStep = (patientId, data, pdf) => {
  // If data already exists in Redux but for another patient, we need to wait for it to clear it first
  const hasOtherUserPdfInState  = !!pdf.opts && pdf.opts.patient?.id !== patientId;
  const hasOtherUserDataInState = !!data.metaData.patientId && data.metaData.patientId !== patientId;

  if (hasOtherUserPdfInState || hasOtherUserDataInState) return STATUS.INITIALIZED;

  // Patient has no data
  const hasNoData = data.metaData?.size === 0;

  if (hasNoData) return STATUS.NO_PATIENT_DATA;

  // Insufficient data to generate AGP Report - PDF worker succeeded but all fields are empty
  const isDataInsufficient = !!pdf?.opts?.svgDataURLS && !pdf?.opts?.svgDataURLS.agpCGM;

  if (isDataInsufficient) return STATUS.INSUFFICIENT_DATA;

  // Happy Path:
  // If the outputted data for a step in the process exists, we infer that the step was successful.
  // We do the lookup in reverse order to return the LATEST completed step

  const hasImagesInState   = !!pdf?.opts?.svgDataURLS;
  const hasPDFDataInState  = !!pdf?.data;
  const hasPatientInState  = !!data?.metaData?.patientId;

  if (hasImagesInState)  return STATUS.SVGS_GENERATED;
  if (hasPDFDataInState) return STATUS.DATA_PROCESSED;
  if (hasPatientInState) return STATUS.PATIENT_LOADED;

  return STATUS.STATE_CLEARED;
}

const FETCH_PATIENT_OPTS = { forceDataWorkerAddDataRequest: true, useCache: false };

const useAGPImages = (api, patientId) => {
  const dispatch = useDispatch();
  const generateAGPImages = buildGenerateAGPImagesFunction(dispatch);

  const data   = useSelector(state => state.blip.data);
  const pdf    = useSelector(state => state.blip.pdf);
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  
  const patient = clinic?.patients?.[patientId];

  const lastCompletedStep = inferLastCompletedStep(patientId, data, pdf);

  useEffect(() => {
    // Whenever a step is successfully completed, this effect triggers the next step in the sequence.

    switch(lastCompletedStep) {
      case STATUS.INITIALIZED:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
        break;

      case STATUS.STATE_CLEARED:
        dispatch(actions.async.fetchPatientData(api, FETCH_PATIENT_OPTS, patientId));
        break;

      case STATUS.PATIENT_LOADED:
        const opts    = getOpts(data);
        const queries = getQueries(data, patient, clinic, opts);

        dispatch(actions.worker.generatePDFRequest('combined', queries, { ...opts, patient }, patientId));
        break;

      case STATUS.DATA_PROCESSED:
        generateAGPImages(pdf, ['agpCGM', 'agpBGM']);
        break;

      case STATUS.SVGS_GENERATED: // image generation complete, no further steps necessary
      default:
        break; 
    }
  }, [lastCompletedStep]);

  useEffect(() => {
    return () => {
      dispatch(actions.worker.removeGeneratedPDFS());
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
    };
  }, [])

  // Final check to guarantee that correct data is being returned
  const hasCorrectImagesForPatient = pdf.opts?.svgDataURLS && pdf.opts?.patient?.id === patientId;

  return { 
    status: lastCompletedStep, 
    svgDataURLS: hasCorrectImagesForPatient ? pdf.opts?.svgDataURLS : null
  };
}

export default useAGPImages;