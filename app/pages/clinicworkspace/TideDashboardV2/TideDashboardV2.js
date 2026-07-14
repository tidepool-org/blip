import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text, Box, Grid } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import FilterByTags from './FilterByTags';
import FilterByDataRecency from './FilterByDataRecency';
import FilterBySummaryPeriod from './FilterBySummaryPeriod';

import TableCategoryHeader from './TableCategoryHeader';
import PaginationControls from '../components/PaginationControls';
import ActiveFilterCount from '../components/ActiveFilterCount';

import { resetTideDashboardState, setOffset } from './tideDashboardSlice';
import { useGetTideDashboardPatientsQuery } from './tideDashboardApi';
import ResetFilters from '../components/ResetFilters';
import useActiveFiltersCount from './useActiveFiltersCount';
import useDerivedDataRecencyEndpoints from './useDerivedDataRecencyEndpoints';
import usePruneInvalidFilters from './usePruneInvalidFilters';
import { resetTideDashboardFilters } from './tideDashboardFiltersSlice';
import useTableColumns from './useTableColumns';
import EmptyContentNode from './EmptyContentNode';
import FilterBySites from './FilterBySites';
import PatientCount from '../components/PatientCount';
import EditPatientDialogController from './EditPatientDialogController';
import DataConnectionsModalController from './DataConnectionsModalController';
import DataIssues from './DataIssues';

const LIMIT = 12;

const Divider = () => <Box id='filter-divider' mx={2} sx={{ border: `1px solid ${vizColors.gray05}`, height: '24px' }}></Box>;

const Gap = () => <Box sx={{ marginLeft: 'auto' }}></Box>;

const TideDashboard = ({ api, trackMetric }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  usePruneInvalidFilters();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.tideDashboard.category);
  const offset = useSelector(state => state.blip.tideDashboard.offset);
  const { patientTags, clinicSites } = useSelector(state => state.blip.tideDashboardFilters);

  const [lastDataFrom, lastDataTo] = useDerivedDataRecencyEndpoints();

  const { data } = useGetTideDashboardPatientsQuery(
    { clinicId: selectedClinicId, offset, category, lastDataTo, lastDataFrom, tags: patientTags, sites: clinicSites, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  // Sync category to data fetching resolution; prevents visual glitch due to
  // category updating view before the API call resolves and updates it again
  const resolvedCategory = data?.category || category;

  const tableColumns = useTableColumns(resolvedCategory);
  const activeFiltersCount = useActiveFiltersCount();

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetTideDashboardState());
  }, []);

  const handleChangeOffset = (newOffset) => dispatch(setOffset(newOffset));

  const handleResetFilters = () => dispatch(resetTideDashboardFilters());

  if (!data) return null;

  const patients = data?.data || [];

  const total = data?.meta?.count || 0;

  return (
    <>
      <Flex id="tide-dashboard-filters" mb={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ActiveFilterCount count={activeFiltersCount} />
        <FilterByTags />
        <FilterBySites />
        <FilterByDataRecency />
        <ResetFilters hidden={activeFiltersCount <= 0} onClick={handleResetFilters} />
        <Gap />
        <FilterBySummaryPeriod />
      </Flex>

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <TableCategoryHeader />
      <Table
        id="tideDashboardPatientsTable"
        variant="condensed"
        label="tideDashboardPatientsTable"
        columns={tableColumns}
        data={patients}
        emptyContentNode={<EmptyContentNode />}
        containerProps={{ sx: { containerType: 'inline-size' } }}
        // sx={tableStyle}
        // onSort={handleSortChange}
        // order={sort?.substring(0, 1) === '+' ? 'asc' : 'desc'}
        // orderBy={sort?.substring(1)}
        // onClickRow={handleClickPatient}
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

      <DataIssues api={api} />

      <EditPatientDialogController
        api={api}
        trackMetric={trackMetric}
        patients={patients}
      />

      <DataConnectionsModalController
        patients={patients}
      />
    </>
  );
};

export default TideDashboard;
