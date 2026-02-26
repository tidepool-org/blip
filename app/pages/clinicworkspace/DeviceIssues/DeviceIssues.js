import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/elements/Table';
import { Flex } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import DashboardPagination from '../components/DashboardPagination';
import EditPatientModal from './EditPatientModal';

import PatientCell from './PatientCell';
import MoreMenuCell from './MoreMenuCell';
import TagListCell from '../components/TagListCell';
import { resetDeviceIssuesState } from './deviceIssuesSlice';
import { useGetDeviceIssuesPatientsQuery } from './deviceIssuesApi';

const LIMIT = 12;

const DeviceIssues = ({ api, trackMetric }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const category = useSelector(state => state.blip.deviceIssues.category);

  const [offset, setOffset] = useState(0);

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, category, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  // reset state on dismount
  useEffect(() => {
    return () => dispatch(resetDeviceIssuesState());
  }, []);

  if (!data) return null;

  const patients = data?.data || [];

  return (
    <>
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
          { title: t(''), field: '', align: 'left', render: patient => <MoreMenuCell patient={patient} /> }, // More
        ]}
        data={patients}
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

      <EditPatientModal
        api={api}
        trackMetric={trackMetric}
        patients={patients}
      />
    </>
  );
};

export default DeviceIssues;
