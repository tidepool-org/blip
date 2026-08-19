import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import noop from 'lodash/noop';

import ReviewPatientToggle, {
  useMarkPatientReviewedMutation,
  useUndoPatientReviewedMutation,
} from '../../../pages/clinicworkspace/components/ReviewPatientToggle';

import * as ErrorMessages from '../../../redux/constants/errorMessages';
import { useToasts } from '../../../providers/ToastProvider';

const PatientLastReviewed = ({ patient, onReview = noop }) => {
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const patientId = patient?.id;

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  const [reviews, setReviews] = useState(patient?.reviews || []);

  useEffect(() => { // Sync up if prop updates
    setReviews(patient?.reviews || []);
  }, [patientId, patient?.reviews]);

  const [markPatientReviewed, { isLoading: isMarking }] = useMarkPatientReviewedMutation();
  const [undoPatientReviewed, { isLoading: isUndoing }] = useUndoPatientReviewedMutation();

  const handleReview = () => {
    markPatientReviewed({ clinicId: selectedClinicId, patientId })
      .unwrap()
      .then(updatedReviews => {
        setReviews(updatedReviews || []);
        onReview();
      })
      .catch(() => setToast({ message: ErrorMessages.ERR_SETTING_CLINIC_PATIENT_LAST_REVIEWED, variant: 'danger' }));
  };

  const handleUndo = () => {
    undoPatientReviewed({ clinicId: selectedClinicId, patientId })
      .unwrap()
      .then(updatedReviews => setReviews(updatedReviews || []))
      .catch(() => setToast({ message: ErrorMessages.ERR_REVERTING_CLINIC_PATIENT_LAST_REVIEWED, variant: 'danger' }));
  };

  return (
    <ReviewPatientToggle
      patientId={patientId}
      reviews={reviews}
      onReview={handleReview}
      onUndo={handleUndo}
      processing={isMarking || isUndoing}
      recentlyReviewedThresholdDate={recentlyReviewedThresholdDate}
    />
  );
};

PatientLastReviewed.propTypes = {
  patient: PropTypes.object,
  onReview: PropTypes.func,
};

export default PatientLastReviewed;
