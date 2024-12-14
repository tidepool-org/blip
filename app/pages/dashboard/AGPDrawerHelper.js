import React from 'react';
import { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import generateAGPImages from './generateAGPImages';
import { selectClinicPatient } from '../../core/selectors';

import QUERIES from './queries';
import CHART_QUERY from './chartQuery';
import PRINT_DIALOG_PDF_OPTS from './printDialogPDFOpts';

export const STATUS = {
  // happy path sequence
  INITIALIZED:    'INITIALIZED',
  PATIENT_LOADED: 'PATIENT_LOADED',
  DATA_PROCESSED: 'DATA_PROCESSED',
  DATA_FORMATTED: 'DATA_FORMATTED',
  SVGS_GENERATED: 'SVGS_GENERATED',

  // TODO: Add error states
}

const inferLastCompletedStep = (data, pdf) => {
  // If the outputted data for a step in the process exists, we infer that
  // the step was successful. e.g. if data.query.metaData exists,
  // we can infer that the DataWorker successfully queried the data.

  // TODO: Add error states

  if (pdf.opts?.svgDataURLS)     return STATUS.SVGS_GENERATED;
  if (pdf.data?.agpCGM)          return STATUS.DATA_FORMATTED;
  if (pdf.data?.agpBGM)          return STATUS.DATA_FORMATTED;
  if (data?.query?.metaData)     return STATUS.DATA_PROCESSED;
  if (data?.metaData?.patientId) return STATUS.PATIENT_LOADED;

  return STATUS.INITIALIZED;
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

  const lastCompletedStep = inferLastCompletedStep(data, pdf);

  // Whenever an step is successfully completed, this effect triggers the next action
  // in the sequence. This effect will fire once for each step of image generation 
  // to a total of four times when on the happy path. 
  useEffect(() => {
    if (lastCompletedStep === STATUS.INITIALIZED) {
      dispatch(actions.async.fetchPatientData(api, FETCH_PATIENT_OPTS, patientId));
      return;
    }

    if (lastCompletedStep === STATUS.PATIENT_LOADED) {
      dispatch(actions.worker.dataWorkerQueryDataRequest(CHART_QUERY, patientId));
      return;
    }

    if (lastCompletedStep === STATUS.DATA_PROCESSED) {
      dispatch(actions.worker.generatePDFRequest(
        'combined',
        QUERIES,
        { ...PRINT_DIALOG_PDF_OPTS, patient: clinicPatient },
        patientId,
        undefined,
      ));
      return;
    }

    if (lastCompletedStep === STATUS.DATA_FORMATTED) {
      generateAGPImages(
        pdf, 
        dispatchAGPImagesSuccess,
        dispatchAGPImagesFailure,
        ['agpCGM', 'agpBGM']
      );

      return;
    }

    // if lastCompletedStep === STATUS.SVGS_GENERATED do nothing

    return () => {
      console.log('TODO: reset state for pdfs/data in Redux');
    }
  }, [lastCompletedStep]);

  return { 
    status: lastCompletedStep, 
    svgDataURLS 
  };
}