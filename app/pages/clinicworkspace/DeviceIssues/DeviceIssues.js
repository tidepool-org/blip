import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/elements/Table';
import { Box, Text, Flex } from 'theme-ui';
import { DIABETES_TYPES } from '../../../core/constants';

import { RTKQueryApi } from '../../../redux/api/baseApi';
import { TagList } from '../../../components/elements/Tag';
import FilterByCategory, { CATEGORY_TAB } from './FilterByCategory';
import DashboardPagination from '../DashboardPagination';

const LIMIT = 12;

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, category, limit }) => {
        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, category, limit },
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
  const tags = tagIds.map(tag => patientTags.find(ptTag => ptTag.id === tag)); // TODO: index

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

export const useRequireSummaryDashboardEntitlement = () => {
  const history = useHistory();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const isEntitlementsLoaded = !!clinic?.entitlements;
  const hasSummaryDashboard = clinic?.entitlements?.summaryDashboard || false;

  useEffect(() => {
    if (isEntitlementsLoaded && !hasSummaryDashboard) {
      history.push('/clinic-workspace/patients');
    }
  }, [isEntitlementsLoaded, hasSummaryDashboard]);

  const isAuthorized = isEntitlementsLoaded && hasSummaryDashboard;

  return isAuthorized;
};

const DeviceIssues = () => {
  const { t } = useTranslation();

  const isAuthorized = useRequireSummaryDashboardEntitlement();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const [category, setCategory] = useState(CATEGORY_TAB.DEFAULT);
  const [offset, setOffset] = useState(0);

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  if (!data || !isAuthorized) return null;

  const tableData = data?.data || [];

  return (
    <>
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
