import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation, Trans } from 'react-i18next';
import { colors as vizColors } from '@tidepool/viz';
import Table from '../../../components/elements/Table';
import { Flex, Text } from 'theme-ui';

import FilterByCategory from './FilterByCategory';
import EditPatientDialogController from './EditPatientDialogController';
import DataConnectionsModalController from './DataConnectionsModalController';
import ClinicWorkspacePagination from '../components/ClinicWorkspacePagination';

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

      <Flex pb={4} sx={{ maxWidth: '640px', justifyContent: 'center', margin: '0 auto' }}>
        <ClinicWorkspacePagination
          limit={LIMIT}
          total={data?.meta?.count || 0}
          offset={offset}
          onOffsetChange={newOffset => setOffset(newOffset)}
        />
      </Flex>

      <EditPatientDialogController
        api={api}
        trackMetric={trackMetric}
        patients={patients}
      />

      <DataConnectionsModalController
        patients={patients}
      />
    </>
  );
};

export default DeviceIssues;
