import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import noop from 'lodash/noop';

import ReviewPatientToggle from '../../../pages/clinicworkspace/components/ReviewPatientToggle';
import {
  useSetClinicPatientLastReviewedMutation,
  useRevertClinicPatientLastReviewedMutation,
} from '../../../pages/clinicworkspace/components/ReviewPatientToggle/reviewPatientApi';

const PatientLastReviewed = ({ patient, onReview = noop }) => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const patientId = patient?.id;

  const [setClinicPatientLastReviewed, { isLoading: isSetting }] = useSetClinicPatientLastReviewedMutation();
  const [revertClinicPatientLastReviewed, { isLoading: isReverting }] = useRevertClinicPatientLastReviewedMutation();

  const handleReview = () => {
    setClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId });
    onReview();
  };

  const handleUndo = () => revertClinicPatientLastReviewed({ clinicId: selectedClinicId, patientId });

  const processing = isSetting || isReverting;

  return (
    <ReviewPatientToggle
      patient={patient}
      onReview={handleReview}
      onUndo={handleUndo}
      processing={processing}
    />
  );
};

PatientLastReviewed.propTypes = {
  patient: PropTypes.object,
  onReview: PropTypes.func,
};

export default PatientLastReviewed;
