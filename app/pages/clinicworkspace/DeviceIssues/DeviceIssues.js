import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text } from 'theme-ui';

import ActiveFilterCount from '../components/ActiveFilterCount';
import FilterByTags from './FilterByTags';
import FilterBySites from './FilterBySites';
import FilterByCategory from './FilterByCategory';
import ResetFilters from '../components/ResetFilters';
import PaginationControls from '../components/PaginationControls';

import { resetDeviceIssuesFilters } from './deviceIssuesFiltersSlice';
import { setOffset, resetDeviceIssuesState } from './deviceIssuesSlice';
import { useGetDeviceIssuesPatientsQuery } from './deviceIssuesApi';
import useActiveFiltersCount from './useActiveFiltersCount';
import EmptyContentNode from './EmptyContentNode';
import usePruneInvalidTags from './usePruneInvalidTags';
import useTableColumns from './useTableColumns';

const LIMIT = 12;

const DeviceIssues = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  usePruneInvalidTags();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const category = useSelector(state => state.blip.deviceIssues.category);
  const offset = useSelector(state => state.blip.deviceIssues.offset);
  const { patientTags, clinicSites } = useSelector(state => state.blip.deviceIssuesFilters);

  const showFilters = clinic?.entitlements?.patientTags && clinic?.entitlements?.clinicSites;

  const columns = useTableColumns();

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, tags: patientTags, sites: clinicSites, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  const activeFiltersCount = useActiveFiltersCount();

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetDeviceIssuesState());
  }, []);

  const handleChangeOffset = (newOffset) => dispatch(setOffset(newOffset));

  const handleResetFilters = () => {
    dispatch(resetDeviceIssuesFilters());
    dispatch(setOffset(0));
  };

  if (!data) return null;

  const tableData = data?.data || [];

  return (
    <>
      <Flex mb={3} sx={{ fontSize: 0, color: vizColors.blueGray50, fontStyle: 'italic' }}>
        <Trans>
          Only patients with active device issues or delayed data from a <Text sx={{ fontWeight: 'bold' }}>cloud-connected device</Text> will be displayed.
        </Trans>
      </Flex>

      { showFilters &&
        <Flex mb={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <ActiveFilterCount count={activeFiltersCount} />
          <FilterByTags />
          <FilterBySites />
          <ResetFilters hidden={activeFiltersCount <= 0} onClick={handleResetFilters} />
        </Flex>
      }

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <Table
        id="deviceIssuesPatientsTable"
        variant="condensed"
        label="deviceIssuesPatientsTable"
        columns={columns}
        data={tableData}
        emptyContentNode={<EmptyContentNode />}
        sx={{
          '&.MuiTable-root': {
            display: tableData?.length > 0 ? 'table' : 'none',
          },
        }}
        // onSort={handleSortChange}
        // order={sort?.substring(0, 1) === '+' ? 'asc' : 'desc'}
        // orderBy={sort?.substring(1)}
        // onClickRow={handleClickPatient}
      />

      <Flex pb={4} sx={{ maxWidth: '640px', justifyContent: 'center', margin: '0 auto' }}>
        <PaginationControls
          limit={LIMIT}
          total={data?.meta?.count || 0}
          offset={offset}
          onOffsetChange={handleChangeOffset}
        />
      </Flex>
    </>
  );
};

export default DeviceIssues;
