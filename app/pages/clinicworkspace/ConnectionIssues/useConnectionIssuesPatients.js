import React from 'react';
import { useSelector } from 'react-redux';
import { useGetConnectionIssuesPatientsQuery } from './connectionIssuesApi';

export const LIMIT = 12;

const useConnectionIssuesPatients = () => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.connectionIssues.category);
  const offset = useSelector(state => state.blip.connectionIssues.offset);
  const patientTags = useSelector(state => state.blip.connectionIssuesFilters.patientTags);
  const clinicSites = useSelector(state => state.blip.connectionIssuesFilters.clinicSites);

  return useGetConnectionIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, limit: LIMIT, tags: patientTags, sites: clinicSites },
    { skip: !selectedClinicId }
  );
};

export default useConnectionIssuesPatients;
