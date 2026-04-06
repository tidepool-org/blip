import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import Plotly from 'plotly.js-basic-dist-min';

import * as actions from '../../../redux/actions';
import utils from '../../../core/utils';
import { utils as vizUtils } from '@tidepool/viz';
import getPDFQueries from './getPDFQueries';

export const STATUS = {
  IDLE: 'IDLE',
  CLEARING: 'CLEARING',
  NEEDS_FETCH: 'NEEDS_FETCH',
  FETCHING: 'FETCHING',
  DATA_LOADED: 'DATA_LOADED',
  QUERYING: 'QUERYING',
  METADATA_READY: 'METADATA_READY',
  GENERATING: 'GENERATING',
  GENERATING_IMAGES: 'GENERATING_IMAGES',
  IMAGES_READY: 'IMAGES_READY',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
};

const FETCH_OPTS = { forceDataWorkerAddDataRequest: true, useCache: false };

/**
 * Infer status from OUTPUT data only (not working.inProgress flags), following the same
 * pattern as useAgpCGM. This avoids race-condition windows where an inProgress flag has
 * already flipped false but the corresponding output data hasn't been written to Redux yet,
 * which would otherwise cause NEEDS_FETCH to re-trigger mid-flight.
 */
function inferStatus(targetPatientId, data, pdf, working) {
  if (!targetPatientId) return STATUS.IDLE;

  // Another patient's data/PDF is in state — clear it first
  const hasOtherData = !!data.metaData?.patientId && data.metaData.patientId !== targetPatientId;
  const hasOtherPdf = !!pdf.opts?.patient?.id && pdf.opts.patient.id !== targetPatientId;
  if (hasOtherData || hasOtherPdf) return STATUS.CLEARING;

  if (working.fetchingPatientData?.notification?.type === 'error') return STATUS.ERROR;
  if (working.generatingPDF?.notification?.type === 'error') return STATUS.ERROR;
  if (working.addingData?.notification?.type === 'error') return STATUS.ERROR;

  // Infer from OUTPUT data (not inProgress flags) to avoid timing windows.
  // Don't check pdf.opts.patient.id here: a late GENERATE_AGP_IMAGES_FAILURE can clear
  // pdf.opts after GENERATE_PDF_SUCCESS fires, leaving patient.id undefined even though
  // the PDF is valid.  usePrintPDF controls the full pipeline so any combined URL is ours.
  if (pdf.combined?.url) return STATUS.COMPLETE;

  // AGP images generated on main thread — ready to re-fire PDF request with svgDataURLS
  if (pdf.data && pdf.opts?.svgDataURLS) return STATUS.IMAGES_READY;

  // PDFWorker requested AGP image generation from main thread (GENERATE_AGP_IMAGES_REQUEST)
  if (pdf.data && !pdf.opts?.svgDataURLS) return STATUS.GENERATING_IMAGES;

  // PDF being generated (no AGP step required)
  if (working.generatingPDF?.inProgress) return STATUS.GENERATING;

  if (data.metaData?.patientId === targetPatientId) {
    if ((data.metaData?.queryDataCount ?? 0) >= 1) return STATUS.METADATA_READY;
    if (working.queryingData?.inProgress) return STATUS.QUERYING;
    return STATUS.DATA_LOADED;
  }

  // Only return FETCHING if a fetch/add is actually in progress — prevents re-triggering
  // NEEDS_FETCH during the brief window after FETCH_PATIENT_DATA_SUCCESS fires but before
  // DATA_WORKER_ADD_DATA_SUCCESS has written data.metaData.patientId.
  if (working.fetchingPatientData?.inProgress || working.addingData?.inProgress) return STATUS.FETCHING;

  return STATUS.NEEDS_FETCH;
}

/**
 * Drives background PDF generation for a clinic patient without navigating away from the
 * clinic list. Modeled after useAgpCGM; uses the same global DataWorker/PDFWorker
 * infrastructure via Redux actions.
 *
 * Usage:
 *   const { status, triggerPrint, reset } = usePrintPDF(api);
 *   // When user confirms print modal:
 *   triggerPrint(patient.id, printOpts);
 *   // Watch status for loading/error UI feedback.
 *
 * Constraint: DataUtil holds one patient's data at a time. Do not use while the patient
 * data page is open for a different patient — triggerPrint will clear that patient's data.
 */
function usePrintPDF(api) {
  const dispatch = useDispatch();

  const data    = useSelector(state => state.blip.data);
  const pdf     = useSelector(state => state.blip.pdf);
  const working = useSelector(state => state.blip.working);
  const clinic  = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);

  const [targetPatientId, setTargetPatientId] = useState(null);
  const [printOpts, setPrintOpts] = useState(null);
  const pdfWindowRef = useRef(null);
  // Set to true while COMPLETE cleanup dispatches are in flight to suppress the
  // interim render where targetPatientId is still set but Redux state has been cleared.
  // Cleared by triggerPrint so the next print starts fresh.
  const completingRef = useRef(false);
  // Set to true when NEEDS_FETCH dispatches fetchPatientData, cleared once data.metaData
  // arrives. Suppresses the spurious NEEDS_FETCH that fires during the ~1s gap between
  // FETCH_PATIENT_DATA_SUCCESS and DATA_WORKER_ADD_DATA_REQUEST (caolan/async deferral).
  const fetchingRef = useRef(false);

  // Clear fetchingRef as soon as the patient's data lands in Redux.
  if (data.metaData?.patientId === targetPatientId && targetPatientId) {
    fetchingRef.current = false;
  }

  const rawStatus = completingRef.current ? STATUS.IDLE : inferStatus(targetPatientId, data, pdf, working);
  const status = (fetchingRef.current && rawStatus === STATUS.NEEDS_FETCH)
    ? STATUS.FETCHING
    : rawStatus;

  // eslint-disable-next-line no-console
  if (targetPatientId) console.log('[usePrintPDF] status', status, { rawStatus, fetchingRef: fetchingRef.current, completingRef: completingRef.current, patientId: data.metaData?.patientId, pdfOptsId: pdf.opts?.patient?.id, pdfData: !!pdf.data, svgDataURLS: !!pdf.opts?.svgDataURLS, generatingInProgress: working.generatingPDF?.inProgress });

  useEffect(() => {
    if (status === STATUS.IDLE) return;

    const clinicPatient = clinic?.patients?.[targetPatientId];

    switch (status) {
      case STATUS.CLEARING:
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, targetPatientId));
        break;

      case STATUS.NEEDS_FETCH:
        fetchingRef.current = true;
        dispatch(actions.async.fetchPatientData(api, { ...FETCH_OPTS }, targetPatientId));
        break;

      case STATUS.DATA_LOADED: {
        const timePrefs = utils.getTimePrefsForDataProcessing(data.metaData?.latestTimeZone, {});
        const patientSettings = clinicPatient?.settings || {};
        const localBgPrefs = utils.getBGPrefsForDataProcessing(patientSettings, {
          units: clinic?.preferredBgUnits,
          source: 'preferred clinic units',
        });
        localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);

        dispatch(actions.worker.dataWorkerQueryDataRequest({
          types: { upload: { select: 'id,deviceId,deviceTags' } },
          metaData: 'latestDatumByType,latestPumpUpload,size,bgSources,devices,excludedDevices,queryDataCount',
          timePrefs,
          bgPrefs: localBgPrefs,
        }, targetPatientId));
        break;
      }

      case STATUS.METADATA_READY: {
        const { queries, pdfPatient } = getPDFQueries(data, clinicPatient, clinic, printOpts);
        dispatch(actions.worker.generatePDFRequest(
          'combined',
          queries,
          { ...printOpts, patient: pdfPatient },
          targetPatientId,
          pdf.data,
        ));
        break;
      }

      case STATUS.GENERATING_IMAGES: {
        // PDFWorker fired GENERATE_AGP_IMAGES_REQUEST — generate Plotly SVGs on the main
        // thread, then GENERATE_AGP_IMAGES_SUCCESS will flip status to IMAGES_READY.
        // NOTE: buildGenerateAGPImages uses `await _.each(...)` which does NOT await async
        // callbacks, causing it to dispatch SUCCESS with empty images before Plotly renders.
        // We use for...of here to correctly await each step.
        const bgSources = data.metaData?.bgSources || {};
        const reportTypes = [];
        if (pdf.opts?.agpBGM?.disabled === false && bgSources.smbg) reportTypes.push('agpBGM');
        if (pdf.opts?.agpCGM?.disabled === false && bgSources.cbg) reportTypes.push('agpCGM');
        // eslint-disable-next-line no-console
        console.log('[usePrintPDF] GENERATING_IMAGES', { reportTypes, agpBGMDisabled: pdf.opts?.agpBGM?.disabled, agpCGMDisabled: pdf.opts?.agpCGM?.disabled });
        const pdfSnapshot = pdf;
        (async () => {
          const promises = [];
          for (const reportType of reportTypes) {
            // Skip report types for which the PDFWorker produced no data (patient may lack
            // the necessary data source, e.g. no BGM readings for agpBGM).
            if (!pdfSnapshot.data?.[reportType]) continue;
            let images;
            // Override metaData.bgSources.current to match the report type: the patient's
            // primary bg source (from metadata) is not always the same as the source the
            // query was run against, so generateAGPFigureDefinitions would use the wrong
            // BGM/CGM branch without this correction.
            const bgSourceForType = reportType === 'agpCGM' ? 'cbg' : 'smbg';
            const reportData = {
              ...pdfSnapshot.data[reportType],
              metaData: {
                ...pdfSnapshot.data[reportType]?.metaData,
                bgSources: {
                  ...pdfSnapshot.data[reportType]?.metaData?.bgSources,
                  current: bgSourceForType,
                },
              },
            };
            try {
              images = await vizUtils.agp.generateAGPFigureDefinitions(reportData);
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error('[usePrintPDF] generateAGPFigureDefinitions threw, skipping reportType:', reportType, e);
              continue; // Skip this chart; PDF will generate without it
            }
            if (!images || !Object.keys(images).length) continue;
            for (const [key, image] of Object.entries(images)) {
              promises.push((async () => {
                if (_.isArray(image)) {
                  const processedArray = await Promise.all(
                    _.map(image, img => Plotly.toImage(img, { format: 'svg' }))
                  );
                  return [reportType, [key, processedArray]];
                }
                const processedValue = await Plotly.toImage(image, { format: 'svg' });
                return [reportType, [key, processedValue]];
              })());
            }
          }
          const results = await Promise.all(promises);
          const processedImages = _.reduce(results, (res, entry) => {
            res[entry[0]] = { ...res[entry[0]], ..._.fromPairs(entry.slice(1)) };
            return res;
          }, {});
          dispatch(actions.sync.generateAGPImagesSuccess(processedImages));
        })().catch(e => {
          // eslint-disable-next-line no-console
          console.error('[usePrintPDF] AGP image generation threw:', e);
          // Dispatch SUCCESS with empty images so the PDF still generates (without AGP charts)
          // rather than dispatching FAILURE which clears pdf state and loops back to METADATA_READY.
          dispatch(actions.sync.generateAGPImagesSuccess({}));
        });
        break;
      }

      case STATUS.IMAGES_READY: {
        // SVGs ready — re-fire PDF generation with svgDataURLS so the PDFWorker skips the
        // AGP images step and proceeds directly to createPrintPDFPackage.
        const { queries, pdfPatient } = getPDFQueries(data, clinicPatient, clinic, printOpts);
        dispatch(actions.worker.generatePDFRequest(
          'combined',
          queries,
          { ...printOpts, patient: pdfPatient, svgDataURLS: pdf.opts.svgDataURLS },
          targetPatientId,
          pdf.data,
        ));
        break;
      }

      case STATUS.COMPLETE: {
        const url = pdf.combined.url;
        if (pdfWindowRef.current && !pdfWindowRef.current.closed) {
          pdfWindowRef.current.location.href = url;
        } else {
          pdfWindowRef.current = window.open(url);
        }
        setTimeout(() => {
          if (pdfWindowRef.current) {
            pdfWindowRef.current.focus();
            pdfWindowRef.current.print();
          }
        });

        // Set the completing flag synchronously before dispatching cleanup so that any
        // intermediate render (targetPatientId still set, Redux state already cleared)
        // returns IDLE instead of looping back to NEEDS_FETCH.
        completingRef.current = true;
        dispatch(actions.worker.removeGeneratedPDFS());
        dispatch(actions.worker.dataWorkerRemoveDataRequest(null, targetPatientId));
        setTargetPatientId(null);
        setPrintOpts(null);
        pdfWindowRef.current = null;
        break;
      }

      default:
        break;
    }
  }, [status]);

  function triggerPrint(patientId, opts) {
    completingRef.current = false;
    fetchingRef.current = false;
    setPrintOpts(opts);
    setTargetPatientId(patientId);
  }

  function reset() {
    completingRef.current = false;
    fetchingRef.current = false;
    if (targetPatientId) {
      dispatch(actions.worker.removeGeneratedPDFS());
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null, targetPatientId));
    }
    setTargetPatientId(null);
    setPrintOpts(null);
    pdfWindowRef.current = null;
  }

  return { status, triggerPrint, reset };
}

export default usePrintPDF;
