import React, { useState } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import PrintDateRangeModal from '../../../components/PrintDateRangeModal';
import utils from '../../../core/utils';
import noop from 'lodash/noop';
import { Dialog, DialogTitle, DialogContent } from '../../../components/elements/Dialog';
import { MediumTitle } from '../../../components/elements/FontStyles';
import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;

import usePrintPDF from './usePrintPDF';
import { useTranslation } from 'react-i18next';

const trackMetric = noop; // this.props.trackMetric

const LoadingModal = ({ onClose = noop }) => {
  const { t } = useTranslation();

  return (
    <Dialog PaperProps={{ id: 'printDateRangePickerInner'}} maxWidth="md" open={open} onClose={onClose}>
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
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePrintTriggered = () => onClose();

  const { status, timePrefs, latestDatumByType, canPrint, onPrintPDF } = usePrintPDF(api, patientId, handlePrintTriggered);

  const handleClickPrint = (opts) => {
    setIsProcessing(true);
    onPrintPDF(opts);
  };

  if (!latestDatumByType || !timePrefs) return <LoadingModal onClose={onClose} />;

  return (
    <PrintDateRangeModal
      open
      id="print-dialog"
      loggedInUserId={loggedInUserId}
      mostRecentDatumDates={{
        agpBGM: utils.getMostRecentDatumTimeByChartType(latestDatumByType, 'agpBGM'),
        agpCGM: utils.getMostRecentDatumTimeByChartType(latestDatumByType, 'agpCGM'),
        basics: utils.getMostRecentDatumTimeByChartType(latestDatumByType, 'basics'),
        bgLog: utils.getMostRecentDatumTimeByChartType(latestDatumByType, 'bgLog'),
        daily: utils.getMostRecentDatumTimeByChartType(latestDatumByType, 'daily'),
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
