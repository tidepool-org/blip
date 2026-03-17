import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import PaginationControls from '../components/PaginationControls';

import { setOffset, resetDeviceIssuesState } from './deviceIssuesSlice';
import { useGetDeviceIssuesPatientsQuery } from './deviceIssuesApi';
import useTableColumns from './useTableColumns';

const LIMIT = 12;

const DeviceIssues = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.deviceIssues.category);
  const offset = useSelector(state => state.blip.deviceIssues.offset);

  const columns = useTableColumns();

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetDeviceIssuesState());
  }, []);

  const handleChangeOffset = (newOffset) => dispatch(setOffset(newOffset));

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

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <Table
        id="deviceIssuesPatientsTable"
        variant="condensed"
        label="deviceIssuesPatientsTable"
        columns={columns}
        data={tableData}
        // sx={tableStyle}
        // onSort={handleSortChange}
        // order={sort?.substring(0, 1) === '+' ? 'asc' : 'desc'}
        // orderBy={sort?.substring(1)}
        // onClickRow={handleClickPatient}
        // emptyContentNode={}
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
