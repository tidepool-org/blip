import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import * as actions from '../../../../redux/actions';
import moment from 'moment';

import { utils as vizUtils } from '@tidepool/viz';
const { getTimezoneFromTimePrefs } = vizUtils.datetime;
import utils from '../../../../core/utils';
import personUtils from '../../../../core/personutils';

import noop from 'lodash/noop';
import get from 'lodash/get';
import filter from 'lodash/filter';
import min from 'lodash/min';
import max from 'lodash/max';
import map from 'lodash/map';
import keys from 'lodash/keys';
import omit from 'lodash/omit';

import { selectPatient, selectUser } from '../../../../core/selectors';
import { useToasts } from '../../../../providers/ToastProvider';
import { useGenerateReportMutation } from '../../../../redux/api/reportApi';
import usePrintWindow from './usePrintWindow';

export const STATUS = {
  // States in order of happy path sequence, up to the point the request is handed
  // off to the export service.
  CLEARING_CACHE: 'CLEARING_CACHE',
  FETCHING_MODAL_DATA: 'FETCHING_MODAL_DATA',
  AWAITING_INPUT: 'AWAITING_INPUT',

  // Other states
  NO_PATIENT_DATA: 'NO_PATIENT_DATA',
};

// TODO: Revisit best way to listen for progress when we move away from blip.working
const inferLastCompletedStep = (requestId, patientId, data, patient, pdf) => {
  // If the outputted data for a step in the process exists, we infer that the step was successful.
  // We do the lookup in reverse order to return the LATEST completed step

  // Incorrect Patient --- (occurs when user switches patient partway through fetching)
  const hasOtherPdfInState = !!pdf.opts?.requestId && pdf.opts.requestId !== requestId;
  const hasOtherDataInState = !!data.metaData.patientId && data.metaData.patientId !== patientId;

  if (hasOtherPdfInState || hasOtherDataInState) return STATUS.CLEARING_CACHE;

  // Insufficient Data States ---
  const hasNoPatientData = data.metaData?.size === 0;

  if (hasNoPatientData) return STATUS.NO_PATIENT_DATA;

  // Happy Path States ---
  const hasModalDataInState = !!data?.metaData?.patientId && patient?.userid;

  if (hasModalDataInState) return STATUS.AWAITING_INPUT;

  return STATUS.FETCHING_MODAL_DATA;
};

// JS `Infinity` is not valid JSON (it serializes to `null`). Number.MAX_VALUE
// survives JSON serialization and is treated as an effectively-unbounded upper
// limit by the export service / Viz.
const JSON_SAFE_INFINITY = Number.MAX_VALUE;

const normalizePrintOpts = (printOpts) => {
  const opts = omit(printOpts, 'requestId');
  const cgmSampleIntervalRange = opts.daily?.cgmSampleIntervalRange;

  if (cgmSampleIntervalRange) {
    opts.daily = {
      ...opts.daily,
      cgmSampleIntervalRange: map(cgmSampleIntervalRange, value => (value === Infinity ? JSON_SAFE_INFINITY : value)),
    };
  }

  return opts;
};

// The enabled report keys double as the export service's `reports` filter (its
// report type names match the printOpts keys). Sending only the enabled reports
// keeps the service from fetching/querying data for charts the user disabled.
const getEnabledReports = (printOpts) =>
  keys(printOpts).filter(key => printOpts[key]?.disabled === false);

const getReportDateRange = (printOpts) => {
  const enabledOpts = filter(printOpts, { disabled: false });
  const startDates = map(enabledOpts, opt => opt.endpoints?.[0]).filter(ms => ms != null);
  const endDates = map(enabledOpts, opt => opt.endpoints?.[1]).filter(ms => ms != null);

  return {
    startDate: startDates.length ? moment.utc(min(startDates)).toISOString() : null,
    endDate: endDates.length ? moment.utc(max(endDates)).toISOString() : null,
  };
};

const getReportBgUnits = (patient, clinicPatient, clinic) => {
  const settings = patient?.settings || {};
  const bgUnitsOverride = { units: clinic?.preferredBgUnits, source: 'preferred clinic units' };

  return utils.getBGPrefsForDataProcessing(settings, clinicPatient, bgUnitsOverride).bgUnits;
};

const getUserDetail = (user, patient, clinicPatient) => {
  const combinedPatient = clinicPatient ? personUtils.combinedAccountAndClinicPatient(patient, clinicPatient) : null;
  const sourcePatient = personUtils.isClinicianAccount(user) && !!combinedPatient ? combinedPatient : patient;

  return {
    userId: clinicPatient?.id || patient?.userid,
    fullName: personUtils.patientFullName(sourcePatient),
    dob: get(sourcePatient, 'profile.patient.birthday'),
    mrn: get(sourcePatient, 'profile.patient.mrn'),
  };
};

const usePrintPDF = (
  api,
  patientId,
  onPrintTriggered = noop,
) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const [generateReport] = useGenerateReportMutation();
  const [requestId] = useState(crypto.randomUUID());

  const data = useSelector(state => state.blip.data);
  const pdf = useSelector(state => state.blip.pdf);
  const patient = useSelector(state => selectPatient(state));
  const user = useSelector(state => selectUser(state));
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const clinicPatient = clinic?.patients?.[patientId];

  const timePrefsRef = useRef(null);
  const getTimePrefs = () => timePrefsRef.current;

  const { openWindow, closeWindow, openPDF } = usePrintWindow();

  const [canPrint, setCanPrint] = useState(false);

  const lastCompletedStep = inferLastCompletedStep(requestId, patientId, data, patient, pdf);

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

      default:
        break;
    }
  }, [lastCompletedStep]);

  const onPrintPDF = async (opts = {}) => {
    openWindow();

    const printOpts = normalizePrintOpts(opts);

    const body = {
      userDetail: getUserDetail(user, patient, clinicPatient),
      reportDetail: {
        tzName: getTimezoneFromTimePrefs(getTimePrefs()),
        bgUnits: getReportBgUnits(patient, clinicPatient, clinic),
        reports: getEnabledReports(printOpts),
        ...getReportDateRange(printOpts),
      },
      printOpts,
    };

    try {
      onPrintTriggered();
      const blob = await generateReport({ patientId, body }).unwrap();
      const url = URL.createObjectURL(blob.slice(0, blob.size, 'application/pdf'));
      openPDF(url);
    } catch (error) {
      closeWindow();

      setToast({
        message: t('Something went wrong while generating your report.'),
        variant: 'danger',
      });
    }
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
