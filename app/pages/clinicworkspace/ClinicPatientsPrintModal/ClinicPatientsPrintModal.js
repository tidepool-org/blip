import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import PrintDateRangeModal from '../../../components/PrintDateRangeModal';
import noop from 'lodash/noop';
import { Dialog, DialogTitle, DialogContent } from '../../../components/elements/Dialog';
import { MediumTitle } from '../../../components/elements/FontStyles';
import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;
import { getMostRecentDatumTimeByChartType } from '../../../core/dataViewUtils';
import * as actions from '../../../redux/actions';

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
  const dispatch = useDispatch();
  const loggedInUserId = useSelector(state => state.blip.loggedInUserId);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!patientId) {
      dispatch(actions.sync.clearPatientInView());
      dispatch(actions.worker.removeGeneratedPDFS());
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null, patientId));
    }
  }, [patientId]);

  const { status, timePrefs, latestDatumByType, canPrint, onPrintPDF } = usePrintPDF(api, patientId, onClose);

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
