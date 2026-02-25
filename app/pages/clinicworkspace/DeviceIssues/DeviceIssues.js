import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/elements/Table';
import { Flex } from 'theme-ui';

import { RTKQueryApi } from '../../../redux/api/baseApi';
import FilterByCategory, { CATEGORY_TAB } from './FilterByCategory';
import DashboardPagination from '../components/DashboardPagination';

import PatientCell from './PatientCell';
import TagListCell from '../components/TagListCell';

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

const DeviceIssues = () => {
  const { t } = useTranslation();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const [category, setCategory] = useState(CATEGORY_TAB.DEFAULT);
  const [offset, setOffset] = useState(0);

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  if (!data) return null;

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
