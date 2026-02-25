import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/elements/Table';
import { Box, Text, Flex } from 'theme-ui';
import { DIABETES_TYPES } from '../../../core/constants';

import { RTKQueryApi } from '../../../redux/api/baseApi';
import { TagList } from '../../../components/elements/Tag';

import useClinicPatientsFilters, { defaultFilterState } from '../hooks/useClinicPatientsFilters';
import ActiveFilterCount from '../ActiveFilterCount';
import FilterByTags from './FilterByTags';
import FilterByCategory, { CATEGORY_TAB } from './FilterByCategory';
import DashboardPagination from '../components/DashboardPagination';
import useRequireSummaryDashboardEntitlement from '../hooks/useRequireSummaryDashboardEntitlement';
import ResetFilters from '../components/ResetFilters';

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

const RenderTags = ({ patient }) => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const patientTags = clinic?.patientTags || [];

  const tagIds = patient?.tags || [];
  const tags = tagIds.map(tag => patientTags.find(patientTag => patientTag.id === tag)); // TODO: index

  return <TagList tags={tags} />;
};

const RenderPatient = ({ patient }) => {
  const { t } = useTranslation();

  const { fullName, birthDate, mrn, diagnosisType } = patient || {};

  return <Box>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{fullName}</Text>
    <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Text>
    {mrn && <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>, {t('MRN: {{mrn}}', { mrn: mrn })}</Text>}
    {diagnosisType &&
      <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>{
        `, ${t(DIABETES_TYPES().find(type => type.value === diagnosisType)?.label || '')}` // eslint-disable-line new-cap
      }</Text>
    }
  </Box>;
};

const DeviceIssues = () => {
  const { t } = useTranslation();

  const isAuthorized = useRequireSummaryDashboardEntitlement();
  const [activeFilters, setActiveFilters, activeFiltersCount] = useClinicPatientsFilters();
  const { patientTags } = activeFilters;

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const [category, setCategory] = useState(CATEGORY_TAB.DEFAULT);
  const [offset, setOffset] = useState(0);

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, tags: patientTags, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  if (!data || !isAuthorized) return null;

  const tableData = data?.data || [];

  const handleActiveFilterChange = (payload) => {
    setActiveFilters({ ...activeFilters, ...payload });
  };

  return (
    <>
      <Flex mb={3} sx={{ gap: 2, alignItems: 'center' }}>
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
        <FilterByCategory value={category} onChange={setCategory} />
      </Flex>

      <Table
        id="deviceIssuesPatientsTable"
        variant="condensed"
        label="deviceIssuesPatientsTable"
        columns={[
          { title: t('Patient Details'), field: 'fullName', align: 'left', render: patient => <RenderPatient patient={patient} /> },
          { title: t('Device'), field: 'fullName', align: 'left' },
          { title: t('Connection Status'), field: 'fullName', align: 'left' },
          { title: t('Last Update'), field: 'fullName', align: 'left' },
          { title: t('Tags'), field: 'tags', align: 'left', render: patient => <RenderTags patient={patient} /> },
          { title: t('Last Outreach'), field: 'fullName', align: 'left' },
          { title: t(''), field: 'fullName', align: 'left' }, // More
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
