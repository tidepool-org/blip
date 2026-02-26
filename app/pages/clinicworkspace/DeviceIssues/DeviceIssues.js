import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/elements/Table';
import { Flex } from 'theme-ui';

import { RTKQueryApi } from '../../../redux/api/baseApi';

import useClinicPatientsFilters, { defaultFilterState } from '../useClinicPatientsFilters';
import ActiveFilterCount from '../components/ActiveFilterCount';
import FilterByTags from '../components/FilterByTags';
import FilterByCategory from './FilterByCategory';
import DashboardPagination from '../components/DashboardPagination';
import ResetFilters from '../components/ResetFilters';

import PatientCell from './PatientCell';
import TagListCell from '../components/TagListCell';

const LIMIT = 12;

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, tags, limit }) => {
        const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, category, tags: formattedTags, limit },
        };
      },
    }),
  }),
});

export const { useGetDeviceIssuesPatientsQuery } = deviceIssuesApi;

const DeviceIssues = () => {
  const { t } = useTranslation();

  const [activeFilters, setActiveFilters, activeFiltersCount] = useClinicPatientsFilters();
  const { patientTags } = activeFilters;

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.deviceIssues.category);

  const [offset, setOffset] = useState(0);

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, tags: patientTags, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  if (!data) return null;

  const tableData = data?.data || [];

  const handleActiveFilterChange = (payload) => {
    setActiveFilters({ ...activeFilters, ...payload });
  };

  return (
    <>
      <Flex id="device-issues-filters" mb={3} sx={{ gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <ActiveFilterCount count={activeFiltersCount} />
        <FilterByTags
          patientTags={patientTags}
          onChange={handleActiveFilterChange}
        />
        <ResetFilters
          hidden={activeFiltersCount <= 0}
          onClick={() => handleActiveFilterChange(defaultFilterState)}
        />
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
        // sx={tableStyle}
        // onSort={handleSortChange}
        // order={sort?.substring(0, 1) === '+' ? 'asc' : 'desc'}
        // orderBy={sort?.substring(1)}
        // onClickRow={handleClickPatient}
        // emptyContentNode={}
      />

      <Flex pb={4}>
        <DashboardPagination
          limit={LIMIT}
          total={data?.meta?.count || 0}
          offset={offset}
          onOffsetChange={newOffset => setOffset(newOffset)}
        />
      </Flex>
    </>
  );
};

export default DeviceIssues;
