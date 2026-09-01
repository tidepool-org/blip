import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Table from '../../../components/elements/Table';
import { Flex} from 'theme-ui';

import FilterByCategory from './FilterByCategory';

import TableCategoryHeader from './TableCategoryHeader';
import PaginationController from './PaginationController';

import useTideDashboardPatients from './useTideDashboardPatients';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';

const tableContainerProps = { sx: { containerType: 'inline-size' } };

const TideDashboardV2 = () => {
  const category = useSelector(state => state.blip.tideDashboard.category);

  const { data } = useTideDashboardPatients();

  // Sync category to data fetching resolution; prevents visual glitch due to
  // category updating view before the API call resolves and updates it again
  const resolvedCategory = data?.category || category;

  const tableColumns = useTableColumns(resolvedCategory);
  const emptyContentNode = useMemo(() => <EmptyContentNode />, []);

  if (!data) return null;

  const patients = data?.data || [];

  const total = data?.meta?.count || 0;

  return (
    <>
      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <TableCategoryHeader category={resolvedCategory} />
      <Table
        id="tideDashboardPatientsTable"
        variant="condensed"
        label="tideDashboardPatientsTable"
        columns={tableColumns}
        data={patients}
        emptyContentNode={emptyContentNode}
        containerProps={tableContainerProps}
      />

      <PaginationController total={total} />
    </>
  );
};

export default TideDashboardV2;
