import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Trans } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text } from 'theme-ui';

import FilterByCategory from './filters/FilterByCategory';
import PaginationController from './PaginationController';

import { resetConnectionIssuesState } from './connectionIssuesSlice';
import { useGetConnectionIssuesPatientsQuery } from './connectionIssuesApi';
import useTableColumns from './useTableColumns';

const LIMIT = 12;

const ConnectionIssues = () => {
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.connectionIssues.category);
  const offset = useSelector(state => state.blip.connectionIssues.offset);

  const columns = useTableColumns();

  const { data } = useGetConnectionIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetConnectionIssuesState());
  }, []);

  if (!data) return null;

  const patients = data?.data || [];

  const total = data?.meta?.count || 0;

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
        data={patients}
        // emptyContentNode={}
      />

      <PaginationController total={total} />
    </>
  );
};

export default ConnectionIssues;
