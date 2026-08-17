import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';

import ReviewPatientToggle from '../../pages/clinicworkspace/components/ReviewPatientToggle';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';
import { useToasts } from '../../providers/ToastProvider';

export const PatientLastReviewed = ({ api, patientId, recentlyReviewedThresholdDate, onReview = null }) => {
  const dispatch = useDispatch();
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  const {
    settingClinicPatientLastReviewed,
    revertingClinicPatientLastReviewed,
  } = useSelector((state) => state.blip.working);

  const handleAsyncResult = useCallback((workingState, successMessage) => {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        successMessage && setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [isFirstRender, setToast]);

  useEffect(() => {
    handleAsyncResult(settingClinicPatientLastReviewed);
  }, [settingClinicPatientLastReviewed]);

  useEffect(() => {
    handleAsyncResult(revertingClinicPatientLastReviewed);
  }, [revertingClinicPatientLastReviewed]);

  const handleReview = () => {
    dispatch(actions.async.setClinicPatientLastReviewed(api, selectedClinicId, patientId));
    onReview && onReview();
  };

  const handleUndo = () => {
    dispatch(actions.async.revertClinicPatientLastReviewed(api, selectedClinicId, patientId));
  };

  const processing = settingClinicPatientLastReviewed.inProgress || revertingClinicPatientLastReviewed.inProgress;

  return (
    <ReviewPatientToggle
      patient={patient}
      onReview={handleReview}
      onUndo={handleUndo}
      processing={processing}
      recentlyReviewedThresholdDate={recentlyReviewedThresholdDate}
    />
  );
};

PatientLastReviewed.propTypes = {
  api: PropTypes.object.isRequired,
  patientId: PropTypes.string.isRequired,
  recentlyReviewedThresholdDate: PropTypes.string.isRequired,
  onReview: PropTypes.func,
};

export default PatientLastReviewed;
