import { useSelector } from 'react-redux';
import { useGetTideDashboardPatientsQuery } from './tideDashboardApi';
import useDerivedDataRecencyEndpoints from './useDerivedDataRecencyEndpoints';

const LIMIT = 12;

const useTideDashboardPatients = () => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.tideDashboard.category);
  const offset = useSelector(state => state.blip.tideDashboard.offset);
  const patientTags = useSelector(state => state.blip.tideDashboardFilters.patientTags);
  const [lastDataFrom, lastDataTo] = useDerivedDataRecencyEndpoints();

  return useGetTideDashboardPatientsQuery(
    { clinicId: selectedClinicId, offset, category, lastDataTo, lastDataFrom, tags: patientTags, limit: LIMIT },
    { skip: !selectedClinicId }
  );
};

export { LIMIT };
export default useTideDashboardPatients;
