import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';

import Table from '../../../../components/elements/Table';

import { PatientCell } from '../Cells';
import { DexcomConnectionStatusCell, DaysSinceLastDataCell, MoreMenuCell } from './Cells';
import TagListCell from '../../components/TagListCell';
import EmptyContentNode from '../EmptyContentNode';
import useTideReportNoDataPatients from './useTideReportNoDataPatients';
import EditPatientDialogController from './EditPatientDialogController';
import DataConnectionsModalController from './DataConnectionsModalController';
import { useGetPatientFromClinicQuery } from './tideDashboardLegacyApi';

const usePatientFromClinic = (patientId) => {
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const { data: patient } = useGetPatientFromClinicQuery(
    { clinicId: selectedClinicId, patientId },
    { skip: !selectedClinicId || !patientId }
  );

  return patient;
};

const DataIssues = ({ api }) => {
  const { t } = useTranslation();
  const { patients } = useTideReportNoDataPatients();

  const [activePatientId, setActivePatientId] = useState(null);
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false);
  const [isDataConnectionsModalOpen, setIsDataConnectionsModalOpen] = useState(false);

  const activePatient = usePatientFromClinic(activePatientId);

  const handleOpenEditPatientDialog = useCallback((patientId) => {
    setActivePatientId(patientId);
    setIsEditPatientDialogOpen(true);
  }, []);

  const handleOpenDataConnectionsModal = (patientId) => {
    setActivePatientId(patientId);
    setIsDataConnectionsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditPatientDialogOpen(false);
    setIsDataConnectionsModalOpen(false);
    setActivePatientId(null);
  };

  const columns = useMemo(() => ([
    {
      title: t('Patient Details'),
      field: 'fullName',
      align: 'left',
      render: patient => <PatientCell patient={patient} />,
    },
    {
      title: t('Dexcom Connection Status'),
      field: 'dexcomConnectionStatus',
      align: 'left',
      render: patient => <DexcomConnectionStatusCell patient={patient} onOpenDataConnectionsModal={handleOpenDataConnectionsModal} />,
    },
    {
      title: t('Days Since Last Data'),
      field: 'daysSinceLastData',
      align: 'center',
      render: patient => <DaysSinceLastDataCell patient={patient} />,
    },
    {
      title: t('Tags'),
      field: 'tags',
      align: 'center',
      render: patient => <TagListCell patient={patient} />,
    },
    {
      title: '',
      field: 'moreMenu',
      align: 'center',
      render: patient => (
        <MoreMenuCell
          patient={patient}
          onOpenEditPatientDialog={handleOpenEditPatientDialog}
          onOpenDataConnectionsModal={handleOpenDataConnectionsModal}
        />
      ),
    },
  ]), [t, handleOpenEditPatientDialog, handleOpenDataConnectionsModal]);

  return (
    <Box id="tide-dashboard-data-issues" mt={4}>
      <Flex className="data-issues-section-label" sx={{ color: 'purples.9', gap: 1 }} mb={2}>
        <Text sx={{ fontSize: 1, fontWeight: 'medium' }}>{t('Data Issues')}</Text>
      </Flex>

      <Table
        id="tideDashboardDataIssuesTable"
        variant="condensed"
        label="tideDashboardDataIssuesTable"
        columns={columns}
        data={patients}
        emptyContentNode={<EmptyContentNode />}
        containerProps={{ sx: { containerType: 'inline-size' } }}
      />

      <EditPatientDialogController
        api={api}
        isOpen={isEditPatientDialogOpen}
        patient={activePatient}
        onClose={handleCloseModals}
      />

      <DataConnectionsModalController
        isOpen={isDataConnectionsModalOpen}
        patient={activePatient}
        onClose={handleCloseModals}
      />
    </Box>
  );
};

export default DataIssues;
