import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Table from '../../../components/elements/Table';
import { Box, Text, Flex } from 'theme-ui';
import { DIABETES_TYPES } from '../../../core/constants';

import { RTKQueryApi } from '../../../redux/api/baseApi';
import { TagList } from '../../../components/elements/Tag';
import ActiveFilterCount from '../Filters/ActiveFilterCount';
import TagsFilter from '../Filters/TagsFilter';
import { CategorySelector, CategoryTab } from '../Filters/CategoryFilter';
import useClinicPatientsFilters from '../useClinicPatientsFilters';
import { setPatientTagsFilter } from '../clinicWorkspaceFiltersSlice';

const LIMIT = 50;

const deviceIssuesApi = RTKQueryApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeviceIssuesPatients: builder.query({
      query: ({ clinicId, offset, tags = [] }) => {
        const formattedTags = tags.length > 0 ? tags.join(',') : undefined;

        return {
          url: `/clinics/${clinicId}/patients`,
          params: { offset, tags: formattedTags, limit: LIMIT },
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

const useInitialReduxSetup = () => {
  const dispatch = useDispatch();

  const [activeFiltersInLocalStorage] = useClinicPatientsFilters();
  useEffect(() => {
    dispatch(setPatientTagsFilter(activeFiltersInLocalStorage.patientTags));
  }, []);
};

const DeviceIssues = () => {
  const { t } = useTranslation();

  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const patientTags = useSelector(state => state.blip.clinicWorkspaceFilters.patientTags);
  const [offset, setOffset] = useState(0);

  useInitialReduxSetup();

  const { data } = useGetDeviceIssuesPatientsQuery(
    { clinicId: selectedClinicId, offset, tags: patientTags, limit: LIMIT },
    { skip: !selectedClinicId }
  );

  if (!data) return null;

  const tableData = data?.data || [];

  return (
    <>
      <Flex mb={3}>
        <ActiveFilterCount />
        <TagsFilter />
      </Flex>

      <Flex mb={3} sx={{ justifyContent: 'center' }}>
        <CategorySelector>
          <CategoryTab selected={true}>{t('All Issues')}</CategoryTab>
          <CategoryTab>{t('Missing Data')}</CategoryTab>
          <CategoryTab>{t('Disconnected or Error')}</CategoryTab>
          <CategoryTab>{t('Invite Expired')}</CategoryTab>
          <CategoryTab>{t('Invite Sent')}</CategoryTab>
          <CategoryTab>{t('Hidden Issues')}</CategoryTab>
        </CategorySelector>
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
    </>
  );
};

export default DeviceIssues;
