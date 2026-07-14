import React, { useState, useEffect } from 'react';
import PrintDateRangeDialog from '../../components/PrintDateRangeDialog';
import noop from 'lodash/noop';
import { getMostRecentDatumTimeByChartType } from '../../core/dataViewUtils';

import usePrintPDF, { STATUS } from '../../core/usePrintPDF';
import { useTranslation } from 'react-i18next';
import { useToasts } from '../../providers/ToastProvider';

const ClinicPatientsPrintDialog = ({ api, patientId, onClose = noop }) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const [isProcessing, setIsProcessing] = useState(false);

  const { status, modalData, canPrint, print } = usePrintPDF(api, patientId, onClose);

  useEffect(() => {
    if (status === STATUS.NO_PATIENT_DATA) {
      onClose();
      setToast({
        message: t('Insufficient data for patient to generate any report.'),
        variant: 'warning'
      });
    }
  }, [status]);

  const handleClickPrint = (opts) => {
    setIsProcessing(true);
    print(opts);
  };

  const { latestDatumByType, timePrefs } = modalData;

  const isLoading = !latestDatumByType || !timePrefs;

  return (
    <PrintDateRangeDialog
      open
      isLoading={isLoading}
      metricSource={'Clinic Patient List View'}
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
    />
  );
};

export default ClinicPatientsPrintDialog;
