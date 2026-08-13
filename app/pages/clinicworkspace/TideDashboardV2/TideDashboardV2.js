import React from 'react';
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

import { setOffset } from './tideDashboardSlice';
import useTideDashboardPatients, { LIMIT } from './useTideDashboardPatients';
import usePruneInvalidFilters from './usePruneInvalidFilters';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';
import FilterBySites from './FilterBySites';
import PatientCount from '../components/PatientCount';
import AppliedFiltersList from './AppliedFiltersList';
import EditPatientDialogController from './EditPatientDialogController';
import DataConnectionsModalController from './DataConnectionsModalController';

const Gap = () => <Box sx={{ marginLeft: 'auto' }}></Box>;

const TideDashboard = ({ api, trackMetric }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  usePruneInvalidFilters();

  const category = useSelector(state => state.blip.tideDashboard.category);
  const offset = useSelector(state => state.blip.tideDashboard.offset);

  const { data } = useTideDashboardPatients();

  // Sync category to data fetching resolution; prevents visual glitch due to
  // category updating view before the API call resolves and updates it again
  const resolvedCategory = data?.category || category;

  const tableColumns = useTableColumns(resolvedCategory);

  const handleChangeOffset = (newOffset) => dispatch(setOffset(newOffset));

  if (!data) return null;

  const patients = data?.data || [];

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

      <TableCategoryHeader category={resolvedCategory} />

      <AppliedFiltersList patientCount={total} />
      <Table
        id="tideDashboardPatientsTable"
        variant="condensed"
        label="tideDashboardPatientsTable"
        columns={tableColumns}
        data={patients}
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

      <EditPatientDialogController api={api} patients={patients} />
      <DataConnectionsModalController patients={patients}/>
      <PatientDrawerController api={api} />
    </>
  );
};

export default TideDashboard;
