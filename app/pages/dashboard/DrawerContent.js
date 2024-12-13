import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions';
import generateAGPImages from './generateAGPImages';

import QUERIES from './queries';
import CHART_QUERY from './chartQuery';
import PRINT_DIALOG_PDF_OPTS from './printDialogPDFOpts';

const DrawerContent = ({ patientId, api }) => {
  const dispatch = useDispatch();

  const metaDataPatientId = useSelector(state => state.blip.data?.metaData?.patientId);
  const query = useSelector(state => state.blip.data?.query);
  const data = useSelector(state => state.blip.data);
  const pdf = useSelector(state => state.blip.pdf);
  const clinicPatient = useSelector(state => {
    return state.blip.clinics[state.blip.selectedClinicId]['patients'][patientId]
  });

  useEffect(() => {
    if (!patientId) return;

    const opts = {
      "carelink": null,
      "dexcom": null,
      "medtronic": null,
      "returnData": false,
      "useCache": true,
      "initial": true,
      "type": "cbg,smbg,basal,bolus,wizard,food,cgmSettings,deviceEvent,dosingDecision,insulin,physicalActivity,pumpSettings,reportedState,upload,water",
      "startDate": "2024-11-02T00:00:00.000Z",
      "endDate": "2024-12-03T18:34:57.000Z",

      "forceDataWorkerAddDataRequest": true // FORCE FETCH
    }

    dispatch(actions.async.fetchPatientData(api, opts, patientId))
  }, [patientId])

  useEffect(() => {
    if (!metaDataPatientId) return;

    dispatch(actions.worker.dataWorkerQueryDataRequest(CHART_QUERY, metaDataPatientId));
  }, [metaDataPatientId])

  // First Run -----

  useEffect(() => {
    if (!query?.metaData || !clinicPatient) return;

    // type, queries, opts, id, data
    dispatch(actions.worker.generatePDFRequest(
      'combined',
      QUERIES,
      {
        ...PRINT_DIALOG_PDF_OPTS,
        patient: clinicPatient,
      },
      clinicPatient.id,
      undefined,
    ));
  }, [data])

  // Second Run -----

  useEffect(() => {
    if (!pdf.data?.agpCGM) return;

    const dispatchGenerateAGPImagesSuccess = (img) => dispatch(actions.sync.generateAGPImagesSuccess(img));
    const dispatchGenerateAGPImagesFailure = (err) => dispatch(actions.sync.generateAGPImagesFailure(err));

    generateAGPImages(
      pdf, 
      dispatchGenerateAGPImagesSuccess,
      dispatchGenerateAGPImagesFailure,
      ['agpCGM', 'agpBGM']
    )
  }, [pdf.data?.agpCGM])

  useEffect(() => {
    if (!pdf.opts?.svgDataURLS) return;

    // type, queries, opts, id, data
    dispatch(actions.worker.generatePDFRequest(
      'combined',
      QUERIES,
      {
        ...pdf.opts,
        patient: clinicPatient,
      },
      clinicPatient.id,
      pdf.data,
    ));
  }, [pdf.opts?.svgDataURLS])

  useEffect(() => {
    if (!pdf?.combined?.url) return;

    console.log(pdf?.combined?.url);

  }, [pdf?.combined?.url])

  return <div style={{ minWidth: 600 }}>Hello</div>;
}

export default DrawerContent;