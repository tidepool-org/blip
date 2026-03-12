import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import FilterByTags from './FilterByTags';
import PaginationControls from '../components/PaginationControls';
import ActiveFilterCount from '../components/ActiveFilterCount';

import TagListCell from '../components/TagListCell';
import { PatientCell } from './Cells';
import { resetTideDashboardState, setOffset } from './tideDashboardSlice';
import { useGetTideDashboardPatientsQuery } from './tideDashboardApi';
import ResetFilters from '../components/ResetFilters';
import useActiveFiltersCount from './useActiveFiltersCount';
import { resetTideDashboardFilters } from './tideDashboardFiltersSlice';

const LIMIT = 12;

const TideDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.tideDashboard.category);
  const offset = useSelector(state => state.blip.tideDashboard.offset);
  const { patientTags } = useSelector(state => state.blip.tideDashboardFilters);

  const { data } = useGetTideDashboardPatientsQuery(
    { clinicId: selectedClinicId, offset, category, tags: patientTags, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  const activeFiltersCount = useActiveFiltersCount();

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetTideDashboardState());
  }, []);

  const handleChangeOffset = (newOffset) => dispatch(setOffset(newOffset));

  if (!data) return null;

  const tableData = data?.data || [];

  return (
    <>
      <Flex id="tide-dashboard-filters" mb={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ActiveFilterCount count={activeFiltersCount} />
        <FilterByTags />
        <ResetFilters
          hidden={activeFiltersCount <= 0}
          onClick={() => dispatch(resetTideDashboardFilters())}
        />
      </Flex>

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <FilterByCategory />
      </Flex>

      <Table
        id="tideDashboardPatientsTable"
        variant="condensed"
        label="tideDashboardPatientsTable"
        columns={[
          { title: t('Patient Details'), field: 'fullName', align: 'left', render: patient => <PatientCell patient={patient} /> },
          { title: t('Flag'), field: '', align: 'left' },
          { title: t('Avg Glucose'), field: '', align: 'left' },
          { title: t('% TIR'), field: '', align: 'left' },
          { title: t('% Time in Range'), field: '', align: 'left' },
          { title: t('% Change in TIR'), field: '', align: 'left' },
          { title: t('GMI'), field: '', align: 'left' },
          { title: t('CGM Use'), field: '', align: 'left' },
          { title: t('Tags'), field: 'tags', align: 'left', render: patient => <TagListCell patient={patient} /> },
          { title: t('Last Reviewed'), field: '', align: 'left' },
          { title: t(''), field: '', align: 'left' }, // More
        ]}
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

export default TideDashboard;
