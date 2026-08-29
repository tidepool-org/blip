import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPatientTagsFilter, setClinicSitesFilter } from './tideDashboardFiltersSlice';
import { SPECIAL_FILTER_STATES } from '../useClinicPatientsFilters';
import keyBy from 'lodash/keyBy';
import isEqual from 'lodash/isEqual';
import useClinic from '../useClinic';

const usePruneInvalidFilters = () => {
  const dispatch = useDispatch();
  const { clinic } = useClinic();
  const { patientTags, clinicSites } = useSelector(state => state.blip.tideDashboardFilters);

  const clinicId = clinic?.id;

  useEffect(() => {
    if (!patientTags?.length || !clinicId) return;

    if (isEqual(patientTags, SPECIAL_FILTER_STATES.ZERO_TAGS)) return;

    const availableTags = keyBy(clinic.patientTags || [], 'id');
    const prunedTags = patientTags.filter(tagId => !!availableTags[tagId]);

    if (prunedTags.length < patientTags.length) {
      dispatch(setPatientTagsFilter(prunedTags));
    }
  }, [clinicId]);

  useEffect(() => {
    if (!clinicSites?.length || !clinicId) return;

    if (isEqual(clinicSites, SPECIAL_FILTER_STATES.ZERO_SITES)) return;

    const availableSites = keyBy(clinic.sites || [], 'id');
    const prunedSites = clinicSites.filter(siteId => !!availableSites[siteId]);

    if (prunedSites.length < clinicSites.length) {
      dispatch(setClinicSitesFilter(prunedSites));
    }
  }, [clinicId]);
};

export default usePruneInvalidFilters;
