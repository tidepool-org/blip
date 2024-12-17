import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import buildGenerateAGPImagesFunction from './buildGenerateAGPImagesFunction';

import getOpts from './getOpts';
import getQueries from './getQueries';

export const STATUS = {  
  // In order of happy path sequence
  CLEARING_STATE: 'CLEARING_STATE',
  INITIALIZED:    'INITIALIZED',
  PATIENT_LOADED: 'PATIENT_LOADED',
  DATA_PROCESSED: 'DATA_PROCESSED',
  SVGS_GENERATED: 'SVGS_GENERATED',
}

const inferLastCompletedStep = (currentPatientId, data, pdf) => {
  const hasOtherPatientPdf  = !!pdf.opts && pdf.opts.patient?.id !== currentPatientId;
  const hasOtherPatientData = !!data.metaData.patientId && data.metaData.patientId !== currentPatientId;

  if (hasOtherPatientPdf || hasOtherPatientData) return STATUS.CLEARING_STATE;

  // If the outputted data for a step in the process exists, we infer that the step was successful.
  // We do the lookup in reverse order to return the LATEST completed step

  const hasImagesInState  = !!pdf?.opts?.svgDataURLS;
  const hasPDFDataInState = !!pdf?.data;
  const hasPatientInState = !!data?.metaData?.patientId;

  if (hasImagesInState)  return STATUS.SVGS_GENERATED;
  if (hasPDFDataInState) return STATUS.DATA_PROCESSED;
  if (hasPatientInState) return STATUS.PATIENT_LOADED;

  return STATUS.INITIALIZED;
}

const FETCH_PATIENT_OPTS = { forceDataWorkerAddDataRequest: true };

export const useGenerateAGPImages = (api, patientId) => {
  const dispatch = useDispatch();
  const generateAGPImages = buildGenerateAGPImagesFunction(dispatch);

  const data   = useSelector(state => state.blip.data);
  const pdf    = useSelector(state => state.blip.pdf);
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  
  const patient = clinic?.patients?.[patientId];

  const lastCompletedStep = inferLastCompletedStep(patientId, data, pdf);
  // TODO: Add error states with another infer() function

  useEffect(() => {
    // Whenever a step is successfully completed, this effect triggers the next step in the sequence.
    console.log(lastCompletedStep);

    switch(lastCompletedStep) {
      case STATUS.CLEARING_STATE:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.sync.resetData());

      case STATUS.INITIALIZED:
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

  const hasCorrectImagesForPatient = pdf.opts?.patient?.id === patientId;

  return { 
    status: lastCompletedStep, 
    svgDataURLS: hasCorrectImagesForPatient ? pdf.opts.svgDataURLS : null
  };
}