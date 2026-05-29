import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPatientTagsFilter, setClinicSitesFilter } from './deviceIssuesFiltersSlice';
import keyBy from 'lodash/keyBy';

const usePruneInvalidFilters = () => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const { patientTags, clinicSites } = useSelector(state => state.blip.deviceIssuesFilters);

  useEffect(() => {
    if (!patientTags?.length || !clinic) return;

    const availableTags = keyBy(clinic.patientTags || [], 'id');
    const prunedTags = patientTags.filter(tagId => !!availableTags[tagId]);

    if (prunedTags.length < patientTags.length) {
      dispatch(setPatientTagsFilter(prunedTags));
    }
  }, []);

  useEffect(() => {
    if (!clinicSites?.length || !clinic) return;

    const availableSites = keyBy(clinic.sites || [], 'id');
    const prunedSites = clinicSites.filter(siteId => !!availableSites[siteId]);

    if (prunedSites.length < clinicSites.length) {
      dispatch(setClinicSitesFilter(prunedSites));
    }
  }, []);
};

export default usePruneInvalidFilters;
