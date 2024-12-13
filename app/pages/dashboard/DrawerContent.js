import React from 'react';
import { useEffect, useState } from 'react';
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

  const agpCGMpercentInRanges = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.percentInRanges);
  const agpCGMambulatoryGlucoseProfile = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile);
  const agpCGMdailyGlucoseProfileTop = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0]);
  const agpCGMdailyGlucoseProfileBottom = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1]);

  const agpBGMpercentInRanges = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.percentInRanges);
  const agpBGMambulatoryGlucoseProfile = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.ambulatoryGlucoseProfile);
  const agpBGMdailyGlucoseProfileTop = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[0]);
  const agpBGMdailyGlucoseProfileBottom = useSelector(state => state.blip.pdf?.opts?.svgDataURLS?.agpCGM?.dailyGlucoseProfiles?.[1]);

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
  }, [pdf.opts?.svgDataURLS])

  return <div style={{ minWidth: 600 }}>

    {[ 
      // CGM 
      agpCGMpercentInRanges,
      agpCGMambulatoryGlucoseProfile,
      agpCGMdailyGlucoseProfileTop,
      agpCGMdailyGlucoseProfileBottom,

      // BGM
      agpBGMpercentInRanges,
      agpBGMambulatoryGlucoseProfile,
      agpBGMdailyGlucoseProfileTop,
      agpBGMdailyGlucoseProfileBottom,
    ].map(dataURI => {
      
      return (
        <div style={{ 
          background: `url("${dataURI}")`,
          minHeight: '300px',
          minWidth: '500px',
        }}>
        </div>
      )
    })
    }
  </div>;
}

export default DrawerContent;