import React, { useEffect } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { utils as vizUtils } from '@tidepool/viz';
const { commonStats } = vizUtils.stat;
const { GLYCEMIC_RANGES_PRESET } = vizUtils.constants;
const { getTimezoneFromTimePrefs } = vizUtils.datetime;
import * as actions from '../../../redux/actions';
import { DEFAULT_CGM_SAMPLE_INTERVAL, DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '../../../core/constants';
import personUtils from '../../../core/personutils';
import PrintDateRangeModal from '../../../components/PrintDateRangeModal';

import { noop } from 'lodash';
import { useState } from 'react';
import { selectClinicPatient, selectPatient, selectUser } from '../../../core/selectors';
import utils from '../../../core/utils';
import { usePrevious } from '../../../core/hooks';

const trackMetric = noop; // this.props.trackMetric

const getMostRecentDatumTimeByChartType = (latestDatumByType, chartType) => {
  let latestDatums;
  const getLatestDatums = types => _.pick(latestDatumByType, types);

  switch (chartType) {
    case 'basics':
      latestDatums = getLatestDatums([
        'basal',
        'bolus',
        'cbg',
        'deviceEvent',
        'smbg',
        'wizard',
      ]);
      break

    case 'daily':
      latestDatums = getLatestDatums([
        'basal',
        'bolus',
        'insulin',
        'cbg',
        'deviceEvent',
        'food',
        'message',
        'smbg',
        'wizard',
        'reportedState',
        'physicalActivity',
      ]);
      break;

    case 'bgLog':
      latestDatums = getLatestDatums([
        'smbg',
      ]);
      break;

    case 'agpBGM':
      latestDatums = getLatestDatums([
        'smbg',
      ]);
      break;

    case 'agpCGM':
      latestDatums = getLatestDatums([
        'cbg',
      ]);
      break;

    case 'trends':
      latestDatums = getLatestDatums([
        'cbg',
        'smbg',
      ]);
      break;

    default:
      latestDatums = [];
      break;
  }

  return _.max(_.map(latestDatums, d => (d.normalEnd || d.normalTime)));
};

const getStatsByChartType = (chartType, _bgSource) => {
  const currentBgSource = 'cgm'; // TODO: FIX // bgSource || _.get(this.state.chartPrefs, [chartType, 'bgSource']);

  const cbgSelected =  currentBgSource === 'cbg';
  const smbgSelected = currentBgSource === 'smbg';

  const isAutomatedBasalDevice = false; // TODO: FIX
  const isSettingsOverrideDevice = false; // TODO: FIX

  // const isAutomatedBasalDevice = _.get(this.props.data, 'metaData.latestPumpUpload.isAutomatedBasalDevice');
  // const isSettingsOverrideDevice = _.get(this.props.data, 'metaData.latestPumpUpload.isSettingsOverrideDevice');

  let stats = [];

  switch (chartType) {
    case 'basics':
      cbgSelected && stats.push(commonStats.timeInRange);
      smbgSelected && stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      cbgSelected && stats.push(commonStats.sensorUsage);
      stats.push(commonStats.totalInsulin);
      isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
      isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
      stats.push(commonStats.carbs);
      stats.push(commonStats.averageDailyDose);
      cbgSelected && stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.standardDev);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.bgExtents);
      break;

    case 'daily':
      cbgSelected && stats.push(commonStats.timeInRange);
      smbgSelected && stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.totalInsulin);
      isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
      isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
      stats.push(commonStats.carbs);
      cbgSelected && stats.push(commonStats.standardDev);
      cbgSelected && stats.push(commonStats.coefficientOfVariation);
      break;

    case 'bgLog':
      stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.standardDev);
      stats.push(commonStats.coefficientOfVariation);
      break;

    case 'agpBGM':
      stats.push(commonStats.averageGlucose,);
      stats.push(commonStats.bgExtents,);
      stats.push(commonStats.coefficientOfVariation,);
      stats.push(commonStats.glucoseManagementIndicator,);
      stats.push(commonStats.readingsInRange,);
      break;

    case 'agpCGM':
      stats.push(commonStats.averageGlucose);
      stats.push(commonStats.bgExtents);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.sensorUsage);
      stats.push(commonStats.timeInRange);
      break;

    case 'trends':
      cbgSelected && stats.push(commonStats.timeInRange);
      smbgSelected && stats.push(commonStats.readingsInRange);
      stats.push(commonStats.averageGlucose);
      cbgSelected && stats.push(commonStats.sensorUsage);
      stats.push(commonStats.totalInsulin);
      stats.push(commonStats.averageDailyDose);
      isAutomatedBasalDevice && stats.push(commonStats.timeInAuto);
      isSettingsOverrideDevice && stats.push(commonStats.timeInOverride);
      cbgSelected && stats.push(commonStats.glucoseManagementIndicator);
      stats.push(commonStats.standardDev);
      stats.push(commonStats.coefficientOfVariation);
      stats.push(commonStats.bgExtents);
      break;
  }

  return stats;
};

const getQueries = (patient, clinicPatient, clinic, data, opts = {}) => {
  const printDialogPDFOpts = opts;

  const glycemicRanges = clinicPatient?.glycemicRanges || GLYCEMIC_RANGES_PRESET.ADA_STANDARD;

  const cgmSampleIntervalRange = DEFAULT_CGM_SAMPLE_INTERVAL_RANGE; // TODO: FIX

  const excludedDevices = [];

  const bgPrefs = (() => {
    const patientSettings = _.get(patient, 'settings', {});

    const bgUnitsOverride = {
      units: clinic?.preferredBgUnits,
      source: 'preferred clinic units',
    };

    const localBgPrefs = utils.getBGPrefsForDataProcessing(patientSettings, clinicPatient, bgUnitsOverride);
    localBgPrefs.bgBounds = vizUtils.bg.reshapeBgClassesToBgBounds(localBgPrefs);

    return localBgPrefs;
  })();

  const tempTimePrefs = { timezoneName: 'Etc/GMT+4', timezoneAware: true }; // TODO: Fix

  const commonQueries = {
    bgPrefs: bgPrefs,
    metaData: 'latestPumpUpload, bgSources',
    timePrefs: tempTimePrefs,
    excludedDevices: excludedDevices,
  };

  const queries = {};

  const bgSource = 'cgm'; // TODO: FIX

  if (!printDialogPDFOpts.basics?.disabled) {
    queries.basics = {
      endpoints: printDialogPDFOpts.basics?.endpoints,
      aggregationsByDate: 'basals, boluses, fingersticks, siteChanges',
      bgSource: bgSource,
      stats: getStatsByChartType('basics'),
      ...commonQueries,
    };
  }

  if (!printDialogPDFOpts.bgLog?.disabled) {
    queries.bgLog = {
      endpoints: printDialogPDFOpts.bgLog?.endpoints,
      aggregationsByDate: 'dataByDate',
      stats: getStatsByChartType('bgLog'),
      types: { smbg: {} },
      bgSource: bgSource,
      ...commonQueries,
    };
  }

  if (!printDialogPDFOpts.daily?.disabled) {
    queries.daily = {
      endpoints: printDialogPDFOpts.daily?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      stats: getStatsByChartType('daily'),
      types: {
        basal: {},
        bolus: {},
        insulin: {},
        cbg: {},
        deviceEvent: {},
        food: {},
        message: {},
        smbg: {},
        wizard: {},
        physicalActivity: {},
        reportedState: {},
      },
      bgSource: bgSource,
      cgmSampleIntervalRange: cgmSampleIntervalRange,
      ...commonQueries,
    };
  }

  if (!printDialogPDFOpts.agpBGM?.disabled) {
    queries.agpBGM = {
      endpoints: printDialogPDFOpts.agpBGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: bgSource,
      stats: getStatsByChartType('agpBGM'),
      types: { smbg: {} },
      glycemicRanges,
      ...commonQueries,
    };
  }

  if (!printDialogPDFOpts.agpCGM?.disabled) {
    queries.agpCGM = {
      endpoints: printDialogPDFOpts.agpCGM?.endpoints,
      aggregationsByDate: 'dataByDate, statsByDate',
      bgSource: bgSource,
      stats: getStatsByChartType('agpCGM'),
      types: { cbg: {} },
      glycemicRanges,
      ...commonQueries,
    };
  }

  if (!printDialogPDFOpts.settings?.disabled) {
    queries.settings = {
      ...commonQueries,
    };
  }

  return queries;
};

const getPDFPatient = (user, patient, clinicPatient) => {
  const patientSettings = _.get(patient, 'settings', {});
  const siteChangeSource = undefined; // TODO: FIX // state.updatedSiteChangeSource || _.get(props, 'patient.settings.siteChangeSource');
  const combinedPatient = clinicPatient ? personUtils.combinedAccountAndClinicPatient(patient, clinicPatient) : null;
  const sourcePatient = personUtils.isClinicianAccount(user) && !!combinedPatient ? combinedPatient : patient;

  const pdfPatient = _.assign({}, sourcePatient, {
    settings: _.assign({}, patientSettings, { siteChangeSource }),
  });

  return pdfPatient;
};

const ClinicPatientsPrintModal = ({
  onClose = noop, // this.closePrintDialog
  api,
  patientId,
}) => {
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const pdf = useSelector(state => state.blip.pdf);
  const fetchingPatientData = useSelector(state => state.blip.working.fetchingPatientData.inProgress);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const data = useSelector((state) => state.blip.data);
  // const timePrefs = useSelector((state) => state.blip.timePrefs);

  const patient = useSelector(state => selectPatient(state));
  const clinicPatient = useSelector(state => selectClinicPatient(state));
  const user = useSelector(state => selectUser(state));

  const addingData = useSelector(state => state.blip.working.addingData);

  const latestDatumByType = useSelector(state => state.blip.data?.metaData?.latestDatumByType);

  const [isProcessing, setIsProcessing] = useState(false);
  const [printDialogPDFOpts, setPrintDialogPDFOpts] = useState(null);
  const dispatch = useDispatch();

  const tempTimePrefs = { timezoneName: 'Etc/GMT+4', timezoneAware: true }; // TODO: Fix

  // const newDataAdded = this.props.addingData.inProgress && nextProps.addingData.completed;

  const previousAddingData = usePrevious(addingData);
  const newDataAdded = previousAddingData?.inProgress && addingData?.completed;


  // Initial Fetch
  useEffect(() => {
    const fetchPatientOpts = {
      initial: true,
      // startDate: moment.utc().subtract(daysToFetch, 'days').toISOString(),
      // endDate: moment.utc().add(1, 'days').toISOString(),
      forceDataWorkerAddDataRequest: true,
      useCache: false,
    };

    dispatch(actions.async.fetchPatientData(api, fetchPatientOpts, patientId));
  }, []);

  // handle data loaded on
  useEffect(() => {
    if (!printDialogPDFOpts || !newDataAdded) return;

    setPrintDialogPDFOpts(null);

    const queries = getQueries(patient, clinicPatient, clinic, data, printDialogPDFOpts);
    const pdfPatient = getPDFPatient(user, patient, clinicPatient);

    dispatch(actions.worker.generatePDFRequest(
      'combined',
      queries,
      { ...printDialogPDFOpts, patient: pdfPatient },
      patientId,
      pdf?.data,
    ));
  }, [printDialogPDFOpts, newDataAdded]);

  const fetchAdditionalData = (options = {}) => {
    // Return if we are currently fetching data
    if (fetchingPatientData) {
      return;
    }

    // No data has ever been fetched in this context, so the "latest fetched data" is effectively the current time.
    const earliestRequestedData = moment.utc().toISOString();

    const fetchOpts = _.defaults(options, {
      showLoading: true,
      startDate: moment.utc(earliestRequestedData).tz(getTimezoneFromTimePrefs(tempTimePrefs)).subtract(16, 'weeks').toISOString(),
      endDate: moment.utc(earliestRequestedData).subtract(1, 'milliseconds').toISOString(),
      useCache: false,
      initial: false,
      noDates: false,
      sampleIntervalMinimum: DEFAULT_CGM_SAMPLE_INTERVAL,
      forceDataWorkerAddDataRequest: true,
    });

    if (fetchOpts.noDates) {
      fetchOpts.startDate = undefined;
      fetchOpts.endDate = undefined;
    }

    dispatch(actions.async.fetchPatientData(api, fetchOpts, patientId));
  };

  useEffect(() => {
    if (!pdf?.combined?.url) return;

    const printWindowRef = window.open(pdf.combined.url);
    printWindowRef.focus();
    printWindowRef.print();
  }, [pdf?.combined?.url]);

  const handleClickPrint = opts => {
    setIsProcessing(true);

    // Determine the earliest startDate needed to fetch data to.
    const enabledOpts = _.filter(opts, { disabled: false });
    const earliestPrintDate = _.min(_.at(enabledOpts, _.map(_.keys(enabledOpts), key => `${key}.endpoints.0`)));
    const startDate = moment.utc(earliestPrintDate).tz(getTimezoneFromTimePrefs(tempTimePrefs)).toISOString();

    setPrintDialogPDFOpts(opts);

    fetchAdditionalData({
      returnData: false,
      showLoading: false,
      startDate,
    });

    // // In cases where we need to fetch data via an async backend call, we need to pre-open
    // // the PDF tab ahead of time. Otherwise, it will be treated as a popup, and likely blocked.
    // if (!this.printWindowRef || this.printWindowRef.closed) {
    //   const waitMessage = this.props.t('Please wait while Tidepool generates your PDF report.');
    //   const printWindowRef = window.open();
    //   printWindowRef.document.write(`<p align="center" style="margin-top:20px;font-size:16px;font-family:sans-serif">${waitMessage}</p>`);
    // }
  };

  if (!latestDatumByType) return null;

  return (
    <PrintDateRangeModal
      open
      id="print-dialog"
      loggedInUserId={loggedInUserId}
      mostRecentDatumDates={{
        agpBGM: getMostRecentDatumTimeByChartType(latestDatumByType, 'agpBGM'),
        agpCGM: getMostRecentDatumTimeByChartType(latestDatumByType, 'agpCGM'),
        basics: getMostRecentDatumTimeByChartType(latestDatumByType, 'basics'),
        bgLog: getMostRecentDatumTimeByChartType(latestDatumByType, 'bgLog'),
        daily: getMostRecentDatumTimeByChartType(latestDatumByType, 'daily'),
      }}
      onClose={onClose}
      onClickPrint={handleClickPrint}
      processing={isProcessing}
      timePrefs={tempTimePrefs}
      trackMetric={trackMetric}
    />
  );
};

export default ClinicPatientsPrintModal;
