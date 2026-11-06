import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import noop from 'lodash/noop';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { DEFAULT_GLYCEMIC_RANGES } from '../../core/glycemicRangesUtils';
import { useToasts } from '../../providers/ToastProvider';
import * as actions from '../../redux/actions';
import EditPatientDialog from '../clinic/EditPatientDialog';

const EditPatientDialogController = ({
  api,
  clinicPatient,
  isOpen,
  onClose = noop,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const updatingClinicPatient = useSelector((state) => state.blip.working.updatingClinicPatient);
  const { notification } = updatingClinicPatient;

  const hasChartData = useSelector(state => (state.blip.data?.metaData?.size || 0) > 0);

  // Captured at submit time: whether this edit needs the chart data reprocessed.
  const shouldClearDataRef = useRef(false);

  const handleEditSuccess = () => {
    // updatingClinicPatient is global working state, so this fires for any clinic-patient update while
    // the header is mounted. Only react to updates this dialog drove; a foreign update (e.g. adding a
    // data source) would otherwise clear the data worker cache and strand the data view on the loader.
    setToast({
      message: t('You have successfully updated a patient.'),
      variant: 'success',
    });

    if (!isOpen) return;

    onClose();

    if (shouldClearDataRef.current) {
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
      shouldClearDataRef.current = false;
    }
  };

  const handleEditFailure = () => {
    setToast({
      message: get(notification, 'message'),
      variant: 'danger',
    });
  };

  const handleEditConfirm = (formContext) => {
    // Clear the data worker (forcing a reprocess) only when Target Range (glycemicRanges, the only
    // data-affecting field here) changed AND there is chart data to reprocess. Compare against the
    // patient's saved range, not the form's initialValues (frozen at mount, blind to prior saves);
    // fall back to the default range so a patient without one — for whom the form injects the default —
    // doesn't read as a change.
    const savedRange = clinicPatient?.glycemicRanges || DEFAULT_GLYCEMIC_RANGES;
    const targetRangeChanged = !isEqual(formContext?.values?.glycemicRanges, savedRange);
    shouldClearDataRef.current = targetRangeChanged && hasChartData;
  };

  if (!currentPatientInViewId || !selectedClinicId) return null;

  return (
    <EditPatientDialog
      api={api}
      clinicPatient={clinicPatient}
      isOpen={isOpen}
      onClose={onClose}
      onEditConfirm={handleEditConfirm}
      onEditSuccess={handleEditSuccess}
      onEditFailure={handleEditFailure}
    />
  );
};

export default EditPatientDialogController;
