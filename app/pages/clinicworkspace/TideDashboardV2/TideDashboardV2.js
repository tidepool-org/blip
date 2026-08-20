import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Table from '../../../components/elements/Table';
import { Flex, Text, Box } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import FilterByTags from './FilterByTags';
import FilterByDataRecency from './FilterByDataRecency';
import FilterBySummaryPeriod from './FilterBySummaryPeriod';

import TableCategoryHeader from './TableCategoryHeader';
import PaginationController from './PaginationController';

import useTideDashboardPatients from './useTideDashboardPatients';
import usePruneInvalidFilters from './usePruneInvalidFilters';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';
import FilterBySites from './FilterBySites';
import AppliedFiltersList from './AppliedFiltersList';

const Gap = () => <Box sx={{ marginLeft: 'auto' }}></Box>;

const TideDashboardV2 = () => {
  const { t } = useTranslation();

  usePruneInvalidFilters();

  const category = useSelector(state => state.blip.tideDashboard.category);

  const { data } = useTideDashboardPatients();

  // Sync category to data fetching resolution; prevents visual glitch due to
  // category updating view before the API call resolves and updates it again
  const resolvedCategory = data?.category || category;

  const tableColumns = useTableColumns(resolvedCategory);

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

      <PaginationController total={total} />
    </>
  );
};

export default TideDashboardV2;
