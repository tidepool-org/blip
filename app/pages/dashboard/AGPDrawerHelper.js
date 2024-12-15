import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import buildGenerateAGPImagesFunction from './buildGenerateAGPImagesFunction';

import getOpts from './getOpts';
import getQueries from './getQueries';

export const STATUS = {
  // In order of happy path sequence
  INITIALIZED:    'INITIALIZED',
  PATIENT_LOADED: 'PATIENT_LOADED',
  DATA_PROCESSED: 'DATA_PROCESSED',
  SVGS_GENERATED: 'SVGS_GENERATED',

  // TODO: Add error states
}

const inferLastCompletedStep = (data, pdf) => {
  // If the outputted data for a step in the process exists, we infer that the step was successful. 

  // TODO: Add error states

  if (pdf?.opts?.svgDataURLS)    return STATUS.SVGS_GENERATED;
  if (pdf?.data)                 return STATUS.DATA_PROCESSED;
  if (data?.metaData?.patientId) return STATUS.PATIENT_LOADED;

  return STATUS.INITIALIZED;
}

const FETCH_PATIENT_OPTS = { forceDataWorkerAddDataRequest: true };

export const useGenerateAGPImages = (api, patientId) => {
  const dispatch = useDispatch();
  const generateAGPImages = buildGenerateAGPImagesFunction(dispatch);

  const data        = useSelector(state => state.blip.data);
  const pdf         = useSelector(state => state.blip.pdf);
  const clinic      = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const svgDataURLS = useSelector(state => state.blip.pdf?.opts?.svgDataURLS);

  const patient = clinic?.patients?.[patientId];

  const lastCompletedStep = inferLastCompletedStep(data, pdf);

  useEffect(() => {
    // Whenever a step is successfully completed, this effect triggers the next step
    // in the sequence. This effect will fire once for each step of image generation 
    // to a total of three times when on the happy path. 

    switch(lastCompletedStep) {
      case STATUS.INITIALIZED:
        dispatch(actions.async.fetchPatientData(api, FETCH_PATIENT_OPTS, patientId));
        return;

      case STATUS.PATIENT_LOADED:
        const opts    = getOpts(data);
        const queries = getQueries(data, patient, clinic, opts);
        const requestOpts = { ...opts, patient };

        dispatch(actions.worker.generatePDFRequest('combined', queries, requestOpts, patientId));
        return;

      case STATUS.DATA_PROCESSED:
        generateAGPImages(pdf, ['agpCGM', 'agpBGM']);
        return;
      
      // no default, so that return function can be fired on dismount
    }

    return () => {
      console.log('TODO: reset state for pdfs/data in Redux');
    }
  }, [lastCompletedStep]);

  return { 
    status: lastCompletedStep, 
    svgDataURLS 
  };
}