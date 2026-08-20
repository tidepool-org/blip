import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../../components/elements/Table';
import { Flex, Grid } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

import FilterByCategory from './FilterByCategory';

import TableCategoryHeader from './TableCategoryHeader';
import PaginationControls from '../components/PaginationControls';

import { setOffset } from './tideDashboardSlice';
import useTideDashboardPatients, { LIMIT } from './useTideDashboardPatients';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';
import PatientCount from '../components/PatientCount';

const TideDashboardV2 = ({ api, trackMetric }) => {
  const dispatch = useDispatch();

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
        emptyContentNode={<EmptyContentNode />}
        containerProps={{ sx: { containerType: 'inline-size' } }}
      />

      <Grid sx={{ gridTemplateColumns: '1fr 2fr 1fr', borderBottom: `1px solid ${vizColors.gray10}` }}>
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
      </Grid>

    </>
  );
};

export default TideDashboardV2;
