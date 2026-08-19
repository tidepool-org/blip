import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';

import ReviewPatientToggle from '../components/ReviewPatientToggle';
import {
  useSetClinicPatientLastReviewedMutation,
  useRevertClinicPatientLastReviewedMutation,
} from '../components/ReviewPatientToggle/reviewPatientApi';
import * as ErrorMessages from '../../../redux/constants/errorMessages';
import { useToasts } from '../../../providers/ToastProvider';

const PatientLastReviewed = ({ patient }) => {
  const { t } = useTranslation();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const patientId = patient?.id;

  const recentlyReviewedThresholdDate = moment().startOf('isoWeek').toISOString();

  const [reviews, setReviews] = useState(patient?.reviews || []);

  useEffect(() => { // Sync up if prop updates
    setReviews(patient?.reviews || []);
  }, [patientId, patient?.reviews]);

  const [setClinicPatientLastReviewed, { isLoading: isSetting }] = useSetClinicPatientLastReviewedMutation();
  const [revertClinicPatientLastReviewed, { isLoading: isReverting }] = useRevertClinicPatientLastReviewedMutation();

  const handleReview = () => {
    setClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId })
      .unwrap()
      .then(updatedReviews => setReviews(updatedReviews || []))
      .catch(() => setToast({ message: ErrorMessages.ERR_SETTING_CLINIC_PATIENT_LAST_REVIEWED , variant: 'danger' }));
  };

  const handleUndo = () => {
    revertClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId })
      .unwrap()
      .then(updatedReviews => setReviews(updatedReviews || []))
      .catch(() => setToast({ message: ErrorMessages.ERR_REVERTING_CLINIC_PATIENT_LAST_REVIEWED , variant: 'danger' }));
  };

  return (
    <ReviewPatientToggle
      patientId={patient?.id}
      reviews={reviews}
      onReview={handleReview}
      onUndo={handleUndo}
      processing={isSetting || isReverting}
      recentlyReviewedThresholdDate={recentlyReviewedThresholdDate}
    />
  );
};

export default PatientLastReviewed;
