import React from 'react';
import { useSelector } from 'react-redux';
import get from 'lodash/get';
import includes from 'lodash/includes';

const useIsClinicAdmin = () => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');

  return isClinicAdmin;
};

export default useIsClinicAdmin;
