import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import noop from 'lodash/noop';

import ReviewPatientToggle from './ReviewPatientToggle';

import {
  useMarkPatientReviewedMutation,
  useUndoPatientReviewedMutation,
} from './reviewPatientApi';

import * as ErrorMessages from '../../../../redux/constants/errorMessages';
import { useToasts } from '../../../../providers/ToastProvider';

// This is a generic adapter for the ReviewPatientToggle. Create a different adapter
// if you want to use a different method to call APIs or to set state.

const PatientLastReviewedGenericAdapter = ({
  patient,
  recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString(),
  onReview = noop,
}) => {
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const patientId = patient?.id;

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
      .catch(() => setToast({ message: ErrorMessages.ERR_SETTING_CLINIC_PATIENT_LAST_REVIEWED , variant: 'danger' }));
  };

  const handleUndo = () => {
    undoPatientReviewed({ clinicId: selectedClinicId, patientId })
      .unwrap()
      .then(updatedReviews => setReviews(updatedReviews || []))
      .catch(() => setToast({ message: ErrorMessages.ERR_REVERTING_CLINIC_PATIENT_LAST_REVIEWED , variant: 'danger' }));
  };

  if (!patientId) return null;

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

export default PatientLastReviewedGenericAdapter;
