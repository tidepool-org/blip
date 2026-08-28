import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

import Table from '../../../../components/elements/Table';

import { PatientCell } from '../Cells';
import TagListCell from '../../components/TagListCell';

import {
  DexcomConnectionStatusCell,
  DaysSinceLastDataCell,
  PatientLastReviewedCell,
  MoreMenuCell,
} from './Cells';

import EmptyContentNode from '../EmptyContentNode';
import useTideReportNoDataPatients from './useTideReportNoDataPatients';
import EditPatientDialogController from './EditPatientDialogController';
import DataConnectionsModalController from './DataConnectionsModalController';
import { useGetPatientFromClinicQuery } from './tideDashboardLegacyApi';
import Icon from '../../../../components/elements/Icon';

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
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
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
      title: t('Last Reviewed'),
      field: 'lastReviewed',
      align: 'center',
      render: patient => <PatientLastReviewedCell patient={patient} />,
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

  if (!patients?.length) return null;

  return (
    <Box id="tide-dashboard-data-issues" my={5}>
      <Flex
        onClick={() => setIsAccordionOpen(isOpen => !isOpen)}
        className="data-issues-section-label"
        sx={{
          justifyContent: 'space-between',
          transition: 'all 0.2s ease',
          borderBottom: '1px solid',
          borderColor: isAccordionOpen ? vizColors.white : vizColors.gray10,
          padding: 3,
          color: vizColors.blueGray50,
          '&:hover': { cursor: 'pointer', borderColor: vizColors.gray30 },
        }}
      >
        <Text sx={{ fontSize: 2 }}>{t('Device Issues ({{count}})', { count: patients.length })}</Text>

        <Icon
          variant="static"
          icon={isAccordionOpen ? KeyboardArrowDownIcon : KeyboardArrowLeftIcon}
          label={isAccordionOpen ? t('Data Issues Close Icon') : t('Data Issues Open Icon')}
          title={isAccordionOpen ? t('Data Issues Close Icon') : t('Data Issues Open Icon')}
          sx={{ fontSize: 4 }}
        />
      </Flex>

      <Box sx={{
        display: 'grid',
        gridTemplateRows: isAccordionOpen ? 'minmax(0, 1fr)' : 'minmax(0, 0fr)',
        transition: 'grid-template-rows 0.5s ease',
      }}>
        <Box sx={{ minHeight: 0, overflow: 'hidden' }}>
          <Table
            id="tideDashboardDataIssuesTable"
            variant="condensed"
            label="tideDashboardDataIssuesTable"
            columns={columns}
            data={patients}
            emptyContentNode={<EmptyContentNode />}
            containerProps={{ sx: { containerType: 'inline-size' } }}
          />
        </Box>
      </Box>

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
