import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Table from '../../../components/elements/Table';
import { Flex, Text, Box } from 'theme-ui';

import FilterByCategory from './filters/FilterByCategory';
import FilterByTags from './filters/FilterByTags';
import FilterBySites from './filters/FilterBySites';
import FilterByDataRecency from './filters/FilterByDataRecency';
import FilterBySummaryPeriod from './filters/FilterBySummaryPeriod';
import AppliedFiltersList from './filters/AppliedFiltersList';

import TableCategoryHeader from './TableCategoryHeader';
import PaginationController from './PaginationController';

import useTideDashboardPatients from './useTideDashboardPatients';
import usePruneInvalidFilters from './usePruneInvalidFilters';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';
import { Redirect, useLocation } from 'react-router-dom';
import useAuthorizationGate from './useAuthorizationGate';
import * as ErrorMessages from '../../../redux/constants/errorMessages';

import EditPatientDialogController from './modals/EditPatientDialogController';
import DataConnectionsModalController from './modals/DataConnectionsModalController';

const Gap = () => <Box sx={{ marginLeft: 'auto' }}></Box>;

const TideDashboardV2 = ({ api }) => {
  const { search } = useLocation();
  const { t } = useTranslation();

  usePruneInvalidFilters();

  const category = useSelector(state => state.blip.tideDashboard.category);
  const offset = useSelector(state => state.blip.tideDashboard.offset);

  const { isAuthorized, isUnauthorized } = useAuthorizationGate();
  const { data, currentData, isFetching, isError } = useTideDashboardPatients();

  // Sync category to data fetching resolution; prevents visual glitch due to
  // category updating view before the API call resolves and updates it again
  const resolvedCategory = data?.category || category;
  const resolvedOffset = data?.offset ?? offset;

  const tableColumns = useTableColumns(resolvedCategory);
  const emptyContentNode = useMemo(() => <EmptyContentNode />, []);

  if (isUnauthorized) {
    return <Redirect to={{ pathname: '/clinic-workspace/patients', search }} />;
  }

  if (!isAuthorized || !data) return null;

  if (isError) return (
    <>
      <FilterByCategory />
      <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
        {ErrorMessages.ERR_FETCHING_TIDE_DASHBOARD_PATIENTS}
      </Flex>
    </>
  );

  const patients = data?.data || [];
  const total = data?.meta?.count || 0;

  const isDataStale = isFetching && !currentData;
  const containerProps = { sx: { containerType: 'inline-size', opacity: isDataStale ? 0.25 : 1 } };

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

      <FilterByCategory />

      <TableCategoryHeader category={resolvedCategory} />
      <AppliedFiltersList patientCount={total} />
      <Table
        id="tideDashboardPatientsTable"
        variant="condensed"
        label="tideDashboardPatientsTable"
        columns={tableColumns}
        data={patients}
        emptyContentNode={emptyContentNode}
        containerProps={containerProps}
      />

      <PaginationController total={total} resolvedOffset={resolvedOffset} />

      <EditPatientDialogController api={api} patients={patients} />
      <DataConnectionsModalController patients={patients}/>
    </>
  );
};

export default TideDashboardV2;
