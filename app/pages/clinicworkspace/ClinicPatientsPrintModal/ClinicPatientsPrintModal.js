import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PrintDateRangeModal from '../../../components/PrintDateRangeModal';
import noop from 'lodash/noop';
import { Dialog, DialogTitle, DialogContent } from '../../../components/elements/Dialog';
import { MediumTitle } from '../../../components/elements/FontStyles';
import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;
import { getMostRecentDatumTimeByChartType } from '../../../core/dataViewUtils';

import { useFetchPrintModalData, MODAL_STATUS } from './usePrintPDF';
import { useTranslation } from 'react-i18next';
import { useToasts } from '../../../providers/ToastProvider';
import { trackMetric } from '../../../core/metricUtils';

const LoadingModal = ({ onClose = noop }) => {
  const { t } = useTranslation();

  return (
    <Dialog PaperProps={{ id: 'printDateRangePickerInner'}} maxWidth="md" open onClose={onClose}>
      <DialogTitle divider={true} onClose={onClose}>
        <MediumTitle>{t('Print Report')}</MediumTitle>
      </DialogTitle>
      <DialogContent divider={false} sx={{ minWidth: '768px', minHeight: '360px' }} pt={3} px={3}>
        <Loader show />
      </DialogContent>
    </Dialog>
  );
};

const ClinicPatientsPrintModal = ({ api, patientId, onClose = noop }) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const [isProcessing, setIsProcessing] = useState(false);

  const { status, modalData, canPrint, print } = useFetchPrintModalData(api, patientId);

  useEffect(() => {
    if (status === MODAL_STATUS.NO_PATIENT_DATA) {
      setToast({ message: t('This patient does not have any data'), variant: 'danger' });
      onClose();
    }
  }, [status]);

  const handleClickPrint = (opts) => {
    setIsProcessing(true);
    print(opts);
    onClose();
  };

  const { latestDatumByType, timePrefs } = modalData;

  if (!latestDatumByType || !timePrefs) return <LoadingModal onClose={onClose} />;

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
      timePrefs={timePrefs}
      trackMetric={trackMetric}
    />
  );
};

export default ClinicPatientsPrintModal;
