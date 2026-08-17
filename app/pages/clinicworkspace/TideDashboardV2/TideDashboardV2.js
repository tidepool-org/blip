import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
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

import PatientDrawerController from './PatientDrawerController';
import EditPatientDialogController from './modals/EditPatientDialogController';
import DataConnectionsModalController from './modals/DataConnectionsModalController';
import { OVERVIEW_TAB_INDEX } from '../../../components/PatientDrawer/MenuBar';
import DataIssues from './DataIssues/DataIssues';

const Gap = () => <Box sx={{ marginLeft: 'auto' }}></Box>;

const tableContainerProps = { sx: { containerType: 'inline-size' } };

const TideDashboardV2 = ({ api }) => {
  const { t } = useTranslation();
  const { search, pathname } = useLocation();
  const history = useHistory();

  usePruneInvalidFilters();

  const category = useSelector(state => state.blip.tideDashboard.category);

  const { data } = useTideDashboardPatients();

  // Sync category to data fetching resolution; prevents visual glitch due to
  // category updating view before the API call resolves and updates it again
  const resolvedCategory = data?.category || category;

  const tableColumns = useTableColumns(resolvedCategory);
  const emptyContentNode = useMemo(() => <EmptyContentNode />, []);

  const handleClickRow = (patient) => {
    if (!patient.id) return;

    const params = new URLSearchParams(search);
    params.set('drawerPatientId', patient.id);
    params.set('drawerTab', OVERVIEW_TAB_INDEX);
    history.replace({ pathname, search: params.toString() });
  };

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
        emptyContentNode={emptyContentNode}
        containerProps={tableContainerProps}
        onClickRow={handleClickRow}
      />

      <PaginationController total={total} />

      <DataIssues api={api} />

      <PatientDrawerController api={api} patients={patients} />
      <EditPatientDialogController api={api} patients={patients} />
      <DataConnectionsModalController patients={patients}/>
    </>
  );
};

export default TideDashboardV2;
