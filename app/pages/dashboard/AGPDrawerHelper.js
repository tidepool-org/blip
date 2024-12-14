import React from 'react';
import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import generateAGPImages from './generateAGPImages';
import { selectClinicPatient } from '../../core/selectors';

import QUERIES from './queries';
import CHART_QUERY from './chartQuery';
import PRINT_DIALOG_PDF_OPTS from './printDialogPDFOpts';

export const STEPS = {
  // happy path sequence
  INITIALIZED:     'INITIALIZED',
  PATIENT_FETCHED: 'PATIENT_FETCHED',
  DATA_PROCESSED:  'DATA_PROCESSED',
  DATA_FORMATTED:  'DATA_FORMATTED',
  SVGS_GENERATED:  'SVGS_GENERATED',

  // errors
  // TODO: Add error states
}

const inferCurrentStep = (data, pdf) => {
  // TODO: Add error states

  if (pdf.opts?.svgDataURLS)     return STEPS.SVGS_GENERATED;
  if (pdf.data?.agpCGM)          return STEPS.DATA_FORMATTED;
  if (pdf.data?.agpBGM)          return STEPS.DATA_FORMATTED;
  if (data?.query?.metaData)     return STEPS.DATA_PROCESSED;
  if (data?.metaData?.patientId) return STEPS.PATIENT_FETCHED;

  return STEPS.INITIALIZED;
}

const FETCH_PATIENT_OPTS = { forceDataWorkerAddDataRequest: true };

export const useGenerateAGPImages = (api, patientId) => {
  const dispatch = useDispatch();
  const dispatchAGPImagesSuccess = (imgs) => dispatch(actions.sync.generateAGPImagesSuccess(imgs));
  const dispatchAGPImagesFailure = (err) => dispatch(actions.sync.generateAGPImagesFailure(err));

  const data          = useSelector(state => state.blip.data);
  const pdf           = useSelector(state => state.blip.pdf);
  const clinicPatient = useSelector(state => selectClinicPatient(state));
  const svgDataURLS   = useSelector(state => state.blip.pdf?.opts?.svgDataURLS);

  const currentStep = inferCurrentStep(data, pdf);

  // Whenever an step is successfully completed this effect triggers the next action
  // in the sequence. This effect will fire once for each step of image generation 
  // to a total of four times when on the happy path. 
  useEffect(() => {
    if (currentStep === STEPS.INITIALIZED) {
      dispatch(actions.async.fetchPatientData(api, FETCH_PATIENT_OPTS, patientId));
      return;
    }

    if (currentStep === STEPS.PATIENT_FETCHED) {
      dispatch(actions.worker.dataWorkerQueryDataRequest(CHART_QUERY, patientId));
      return;
    }

    if (currentStep === STEPS.DATA_PROCESSED) {
      dispatch(actions.worker.generatePDFRequest(
        'combined',
        QUERIES,
        { ...PRINT_DIALOG_PDF_OPTS, patient: clinicPatient },
        patientId,
        undefined,
      ));
      return;
    }

    if (currentStep === STEPS.DATA_FORMATTED) {
      generateAGPImages(
        pdf, 
        dispatchAGPImagesSuccess,
        dispatchAGPImagesFailure,
        ['agpCGM', 'agpBGM']
      );

      return;
    }

    // if currentStep === STEPS.SVGS_GENERATED do nothing

    return () => {
      console.log('TODO: reset state for pdfs/data in Redux');
    }
  }, [currentStep]);

  return { currentStep, svgDataURLS };
}