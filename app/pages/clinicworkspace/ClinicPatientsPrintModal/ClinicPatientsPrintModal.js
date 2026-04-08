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

import usePrintPDF from './usePrintPDF';

const trackMetric = noop; // this.props.trackMetric

const ClinicPatientsPrintModal = ({ api, patientId, onClose }) => {
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);

  const { status, canPrint, onPrintPDF } = usePrintPDF(api, patientId, 14);

  const handleClickPrint = (opts) => {
    onPrintPDF(opts);
  };

  const isProcessing = false;

  const tempTimePrefs = { timezoneName: 'Etc/GMT+4', timezoneAware: true };

  return (
    <PrintDateRangeModal
      open
      id="print-dialog"
      loggedInUserId={loggedInUserId}
      mostRecentDatumDates={{
        // agpBGM: getMostRecentDatumTimeByChartType(latestDatumByType, 'agpBGM'),
        // agpCGM: getMostRecentDatumTimeByChartType(latestDatumByType, 'agpCGM'),
        // basics: getMostRecentDatumTimeByChartType(latestDatumByType, 'basics'),
        // bgLog: getMostRecentDatumTimeByChartType(latestDatumByType, 'bgLog'),
        // daily: getMostRecentDatumTimeByChartType(latestDatumByType, 'daily'),
      }}
      onClose={onClose}
      onClickPrint={handleClickPrint}
      processing={!canPrint || isProcessing}
      timePrefs={tempTimePrefs}
      trackMetric={trackMetric}
    />
  );
};

export default ClinicPatientsPrintModal;
