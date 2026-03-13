import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text } from 'theme-ui';

import ActiveFilterCount from '../components/ActiveFilterCount';
import FilterByTags from './FilterByTags';
import FilterByCategory from './FilterByCategory';
import ResetFilters from '../components/ResetFilters';
import PaginationControls from '../components/PaginationControls';

import PatientCell from './PatientCell';
import TagListCell from '../components/TagListCell';
import { resetDeviceIssuesFilters } from './deviceIssuesFiltersSlice';
import { setOffset, resetDeviceIssuesState } from './deviceIssuesSlice';
import { useGetDeviceIssuesPatientsQuery } from './deviceIssuesApi';
import useActiveFiltersCount from './useActiveFiltersCount';
import EmptyContentNode from './EmptyContentNode';

const LIMIT = 12;

const DeviceIssues = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.deviceIssues.category);
  const offset = useSelector(state => state.blip.deviceIssues.offset);
  const { patientTags } = useSelector(state => state.blip.deviceIssuesFilters);

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, tags: patientTags, limit: LIMIT },
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
      <Flex mb={2}>
        <Trans>
          <Text sx={{ fontSize: 0, color: vizColors.blueGray50, fontStyle: 'italic' }}>
            Only patients with active device issues or delayed data from a <Text sx={{ fontWeight: 'bold' }}>cloud-connected device</Text> will be displayed.
          </Text>
        </Trans>
      </Flex>

      <Flex id="device-issues-filters" mb={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ActiveFilterCount count={activeFiltersCount} />
        <FilterByTags />
        <ResetFilters hidden={activeFiltersCount <= 0} onClick={handleResetFilters} />
      </Flex>

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <Table
        id="deviceIssuesPatientsTable"
        variant="condensed"
        label="deviceIssuesPatientsTable"
        columns={[
          { title: t('Patient Details'), field: 'fullName', align: 'left', render: patient => <PatientCell patient={patient} /> },
          { title: t('Device'), field: '', align: 'left' },
          { title: t('Connection Status'), field: '', align: 'left' },
          { title: t('Last Update'), field: '', align: 'left' },
          { title: t('Tags'), field: 'tags', align: 'left', render: patient => <TagListCell patient={patient} /> },
          { title: t('Last Outreach'), field: '', align: 'left' },
          { title: t(''), field: '', align: 'left' }, // More
        ]}
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
