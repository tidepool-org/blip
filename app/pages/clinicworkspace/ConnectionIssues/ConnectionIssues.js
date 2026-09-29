import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text } from 'theme-ui';

import AppliedFiltersList from './filters/AppliedFiltersList';
import FilterByCategory from './filters/FilterByCategory';
import FilterByTags from './filters/FilterByTags';
import FilterBySites from './filters/FilterBySites';
import PaginationController from './PaginationController';
import EmptyContentNode from './EmptyNodeContent';

import { resetConnectionIssuesState } from './connectionIssuesSlice';
import useTableColumns from './useTableColumns';
import useConnectionIssuesPatients from './useConnectionIssuesPatients';

const tableContainerProps = { sx: { containerType: 'inline-size' } };

const ConnectionIssues = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { data } = useConnectionIssuesPatients();

  const columns = useTableColumns();

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetConnectionIssuesState());
  }, []);

  const emptyContentNode = useMemo(() => <EmptyContentNode />, []);

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

      <Flex id="connection-issues-filters" mb={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Text sx={{ fontSize: 0, color: 'grays.4' }}>{t('Filter By')}</Text>
        <FilterByTags />
        <FilterBySites />
      </Flex>

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <AppliedFiltersList patientCount={total} />
      <Table
        id="deviceIssuesPatientsTable"
        variant="condensed"
        label="deviceIssuesPatientsTable"
        columns={columns}
        data={patients}
        containerProps={tableContainerProps}
        emptyContentNode={emptyContentNode}
      />

      <PaginationController total={total} />
    </>
  );
};

export default ConnectionIssues;
