import React from 'react';
import { useSelector } from 'react-redux';
import { useGetClinicQuery, useGetClinicsForClinicianQuery } from './clinicApi';

const useClinic = () => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);

  const { currentData: clinic } = useGetClinicQuery(
    { clinicId: selectedClinicId },
    { skip: !selectedClinicId }
  );

  const { currentData: userClinics } = useGetClinicsForClinicianQuery(
    { userId: loggedInUserId },
    { skip: !loggedInUserId }
  );

  const currentUserClinic = userClinics?.find(userClinic => userClinic.clinic.id === selectedClinicId);

  const isClinicAdmin = currentUserClinic?.clinician?.roles?.includes('CLINIC_ADMIN') || false;

  return { clinic, isClinicAdmin };
};

export default useClinic;
