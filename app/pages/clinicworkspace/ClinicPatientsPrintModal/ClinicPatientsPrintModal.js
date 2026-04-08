import React from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import PrintDateRangeModal from '../../../components/PrintDateRangeModal';
import getMostRecentDatumTimeByChartType from './getMostRecentDatumTimeByChartType';
import noop from 'lodash/noop';

import usePrintPDF from './usePrintPDF';

const trackMetric = noop; // this.props.trackMetric

const ClinicPatientsPrintModal = ({ api, patientId, onClose }) => {
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);

  const { status, latestDatumByType, canPrint, onPrintPDF } = usePrintPDF(api, patientId, 14);

  const handleClickPrint = (opts) => {
    onPrintPDF(opts);
  };

  const isProcessing = false;

  const tempTimePrefs = { timezoneName: 'Etc/GMT+4', timezoneAware: true };

  if (!latestDatumByType) return null; // TODO: Placeholder Modal

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
      processing={!canPrint || isProcessing}
      timePrefs={tempTimePrefs}
      trackMetric={trackMetric}
    />
  );
};

export default ClinicPatientsPrintModal;
