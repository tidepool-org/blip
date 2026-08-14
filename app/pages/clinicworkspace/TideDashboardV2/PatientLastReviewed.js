import React from 'react';
import { useSelector } from 'react-redux';

import ReviewPatientToggle from '../components/ReviewPatientToggle';
import { useSetClinicPatientLastReviewedMutation, useRevertClinicPatientLastReviewedMutation } from './tideDashboardApi';
import useTideDashboardPatients from './useTideDashboardPatients';

const PatientLastReviewed = ({ patient }) => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const patientId = patient?.id;

  const { isFetching } = useTideDashboardPatients();

  const [setClinicPatientLastReviewed, { isLoading: isSetting }] = useSetClinicPatientLastReviewedMutation();
  const [revertClinicPatientLastReviewed, { isLoading: isReverting }] = useRevertClinicPatientLastReviewedMutation();

  const handleReview = () => setClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId });

  const handleUndo = () => revertClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId });

  return (
    <ReviewPatientToggle
      patient={patient}
      onReview={handleReview}
      onUndo={handleUndo}
      disabled={isSetting || isReverting || isFetching}
    />
  );
};

export default PatientLastReviewed;
