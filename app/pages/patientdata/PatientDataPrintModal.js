import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import PrintDateRangeModal from '../../components/PrintDateRangeModal';
import noop from 'lodash/noop';
import { getMostRecentDatumTimeByChartType } from '../../core/dataViewUtils';
import * as actions from '../../redux/actions';

import usePrintPDF from './../../pages/clinicworkspace/ClinicPatientsPrintModal/usePrintPDF';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '../../core/constants';
import { trackMetric } from '../../core/metricUtils';

const PatientDataPrintModal = ({ api, patientId, chartPrefs = {}, onClose = noop }) => {
  const dispatch = useDispatch();
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    return () => dispatch(actions.worker.removeGeneratedPDFS());
  }, []);

  const { status, modalData, canPrint, print } = usePrintPDF(api, patientId, onClose);

  const handleClickPrint = (opts) => {
    const enrichedOpts = _.cloneDeep(opts);

    // Inject cgmSampleIntervalRange from patient data view into printOptions
    if (!!enrichedOpts.daily) {
      const rangeFromChartPrefs = chartPrefs?.daily?.cgmSampleIntervalRange;
      enrichedOpts.daily.cgmSampleIntervalRange = rangeFromChartPrefs || DEFAULT_CGM_SAMPLE_INTERVAL_RANGE;
    }

    setIsProcessing(true);
    print(enrichedOpts);
  };

  const { latestDatumByType, timePrefs } = modalData;

  const isLoading = !latestDatumByType || !timePrefs;

  return (
    <PrintDateRangeModal
      open
      isLoading={isLoading}
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
      timePrefs={timePrefs}
      trackMetric={trackMetric}
    />
  );
};

export default PatientDataPrintModal;
