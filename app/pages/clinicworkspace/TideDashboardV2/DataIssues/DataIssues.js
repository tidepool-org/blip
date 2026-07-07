import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';
import { Box, Flex, Text } from 'theme-ui';
import includes from 'lodash/includes';

import Table from '../../../../components/elements/Table';
import Pill from '../../../../components/elements/Pill';
import HoverButton from '../../../../components/elements/HoverButton';
import { resolveConnectState } from '../../../../components/datasources/DataConnections';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import { colors, fontWeights } from '../../../../themes/baseTheme';

import { PatientCell, MoreMenuCell } from '../Cells';
import TagListCell from '../../components/TagListCell';
import EmptyContentNode from '../EmptyContentNode';
import useTideReportNoDataPatients from './useTideReportNoDataPatients';

import {
  setDataConnectionsModalIsOpen,
  setDataConnectionsModalPatientId,
} from '../tideDashboardSlice';

const DexcomConnectionStatusCell = ({ patient }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const dexcomConnectStateUI = useMemo(() => ({
    noPendingConnections: { colorPalette: 'neutral', icon: null, text: t('No Pending Connections') },
    pending: { colorPalette: 'info', icon: null, text: t('Invite Sent') },
    pendingReconnect: { colorPalette: 'info', icon: null, text: t('Invite Sent') },
    pendingExpired: { colorPalette: 'warning', icon: ErrorRoundedIcon, text: t('Invite Expired') },
    connected: { colorPalette: 'info', icon: null, text: t('Connected') },
    disconnected: { colorPalette: 'warning', icon: ErrorRoundedIcon, text: t('Patient Disconnected') },
    error: { colorPalette: 'warning', icon: ErrorRoundedIcon, text: t('Error Connecting') },
    unknown: { colorPalette: 'warning', icon: ErrorRoundedIcon, text: t('Unknown Status') },
  }), [t]);

  const dexcomConnectState = resolveConnectState(patient, 'dexcom');

  if (!dexcomConnectState) return null;

  const showViewButton = includes([
    'disconnected',
    'error',
    'noPendingConnections',
    'pendingExpired',
    'unknown',
  ], dexcomConnectState);

  const handleOpenDataConnectionsModal = () => {
    dispatch(setDataConnectionsModalIsOpen(true));
    dispatch(setDataConnectionsModalPatientId(patient.id));
  };

  const StatusBadge = () => (
    <Pill
      className="patient-dexcom-connection-status"
      icon={dexcomConnectStateUI[dexcomConnectState].icon}
      text={dexcomConnectStateUI[dexcomConnectState].text}
      label={t('dexcom connection status')}
      colorPalette={dexcomConnectStateUI[dexcomConnectState].colorPalette}
      condensed
    />
  );

  if (!showViewButton) return <StatusBadge />;

  return (
    <HoverButton
      buttonText={t('View')}
      buttonProps={{
        onClick: handleOpenDataConnectionsModal,
        variant: 'textSecondary',
        ml: -2,
        sx: {
          fontSize: 0,
          fontWeight: fontWeights.medium,
          textDecoration: 'underline',
          color: colors.purpleMedium,
          ':hover': {
            color: colors.purpleMedium,
            textDecoration: 'underline',
          },
        },
      }}
    >
      <Box sx={{ whiteSpace: 'nowrap' }}>
        <StatusBadge />
      </Box>
    </HoverButton>
  );
};

const DaysSinceLastDataCell = ({ patient }) => {
  const timePrefs = useSelector(state => state.blip.timePrefs);

  const daysSinceLastData = useMemo(() => {
    if (!patient?.lastData) return null;

    const timezone = timePrefs?.timezoneName || new Intl.DateTimeFormat().resolvedOptions().timeZone;
    const startOfLastDataDay = moment.utc(patient.lastData).tz(timezone).startOf('day');
    const startOfCurrentDay = moment.utc().tz(timezone).startOf('day');

    return startOfCurrentDay.diff(startOfLastDataDay, 'days');
  }, [patient?.lastData, timePrefs?.timezoneName]);

  return (
    <Text sx={{ fontWeight: 'medium' }}>{daysSinceLastData ?? '-'}</Text>
  );
};

const DataIssues = () => {
  const { t } = useTranslation();
  const { patients } = useTideReportNoDataPatients();

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
      render: patient => <DexcomConnectionStatusCell patient={patient} />,
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
      render: patient => <MoreMenuCell patient={patient} />,
    },
  ]), [t]);

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
    </Box>
  );
};

export default DataIssues;
