import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/elements/Table';
import { Flex, Text, Box, Grid } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import FilterByTags from './FilterByTags';
import FilterByDataRecency from './FilterByDataRecency';
import FilterBySummaryPeriod from './FilterBySummaryPeriod';

import TableCategoryHeader from './TableCategoryHeader';
import PaginationControls from '../components/PaginationControls';
import PatientDrawerController from './PatientDrawerController';

import { resetTideDashboardState, setOffset } from './tideDashboardSlice';
import { useGetTideDashboardPatientsQuery } from './tideDashboardApi';
import useDerivedDataRecencyEndpoints from './useDerivedDataRecencyEndpoints';
import usePruneInvalidFilters from './usePruneInvalidFilters';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';
import FilterBySites from './FilterBySites';
import PatientCount from '../components/PatientCount';
import AppliedFiltersList from './AppliedFiltersList';

const LIMIT = 12;

const Gap = () => <Box sx={{ marginLeft: 'auto' }}></Box>;

const TideDashboard = ({ api }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  usePruneInvalidFilters();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.tideDashboard.category);
  const offset = useSelector(state => state.blip.tideDashboard.offset);
  const { patientTags, clinicSites, summaryPeriod } = useSelector(state => state.blip.tideDashboardFilters);

  const [lastDataFrom, lastDataTo] = useDerivedDataRecencyEndpoints();

  const { data } = useGetTideDashboardPatientsQuery(
    { clinicId: selectedClinicId, offset, category, summaryPeriod, lastDataTo, lastDataFrom, tags: patientTags, sites: clinicSites, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  // Sync category to data fetching resolution; prevents visual glitch due to
  // category updating view before the API call resolves and updates it again
  const resolvedCategory = data?.category || category;

  const tableColumns = useTableColumns(resolvedCategory);

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetTideDashboardState());
  }, []);

  const handleChangeOffset = (newOffset) => dispatch(setOffset(newOffset));

  if (!data) return null;

  const tableData = data?.data || [];

  const total = data?.meta?.count || 0;

  return (
    <>
      <Flex id="tide-dashboard-filters" mb={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Text sx={{ fontSize: 0, color: 'grays.4' }}>{t('Filter By')}</Text>
        <FilterByTags />
        <FilterBySites />
        <FilterByDataRecency />
        <Gap />
        <FilterBySummaryPeriod />
      </Flex>

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <TableCategoryHeader />

      <AppliedFiltersList patientCount={total} />
      <Table
        id="tideDashboardPatientsTable"
        variant="condensed"
        label="tideDashboardPatientsTable"
        columns={tableColumns}
        data={tableData}
        emptyContentNode={<EmptyContentNode />}
        containerProps={{ sx: { containerType: 'inline-size' } }}
      />

      <Grid sx={{ gridTemplateColumns: '1fr 2fr 1fr' }}>
        <Flex sx={{ alignItems: 'flex-end', padding: '0 0 24px 12px' }}>
          <PatientCount offset={offset} limit={LIMIT} total={total} />
        </Flex>
        <Flex pb={4} sx={{ maxWidth: '640px', justifyContent: 'center', margin: '0 auto' }}>
          <PaginationControls
            limit={LIMIT}
            total={total}
            offset={offset}
            onOffsetChange={handleChangeOffset}
          />
        </Flex>
        <Box></Box>
      </Grid>

      <PatientDrawerController api={api} />
    </>
  );
};

export default TideDashboard;
