import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Table from '../../../components/elements/Table';
import { Flex } from 'theme-ui';

import FilterByCategory from './FilterByCategory';

import TableCategoryHeader from './TableCategoryHeader';
import PaginationController from './PaginationController';

import useTideDashboardPatients from './useTideDashboardPatients';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';
import { Redirect, useLocation } from 'react-router-dom';
import useAuthorizationGate from './useAuthorizationGate';
import FetchError from './FetchError';

const tableContainerProps = { sx: { containerType: 'inline-size', transition: 'all 0.1s' } };

const TideDashboardV2 = () => {
  const { search } = useLocation();
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

  if (isUnauthorized) return <Redirect to={{ pathname: '/clinic-workspace/patients', search }} />;

  if (!isAuthorized) return null;

  if (isError) return <FetchError />;

  if (!data) return null;

  const patients = data?.data || [];
  const total = data?.meta?.count || 0;

  const isDataStale = isFetching && !currentData;
  const containerProps = { sx: { ...tableContainerProps.sx, opacity: isDataStale ? 0.25 : 1 } };

  return (
    <>
      <FilterByCategory />

      <TableCategoryHeader category={resolvedCategory} />
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
    </>
  );
};

export default TideDashboardV2;
