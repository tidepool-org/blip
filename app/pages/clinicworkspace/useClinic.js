import React from 'react';
import { useSelector } from 'react-redux';
import { useGetClinicQuery } from './clinicApi';

const useClinic = () => {
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const { currentData: clinic } = useGetClinicQuery({ clinicId: selectedClinicId });

  return clinic;
};

export default useClinic;
