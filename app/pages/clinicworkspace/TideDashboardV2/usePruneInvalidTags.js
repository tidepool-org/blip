import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPatientTagsFilter } from './tideDashboardFiltersSlice';
import keyBy from 'lodash/keyBy';

const usePruneInvalidTags = () => {
  const dispatch = useDispatch();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientTags = useSelector(state => state.blip.tideDashboardFilters.patientTags);

  useEffect(() => {
    if (!patientTags?.length || !clinic) return;

    const availableTags = keyBy(clinic.patientTags || [], 'id');
    const prunedTags = patientTags.filter(tagId => !!availableTags[tagId]);

    if (prunedTags.length < patientTags.length) {
      dispatch(setPatientTagsFilter(prunedTags));
    }
  }, []);
};

export default usePruneInvalidTags;
