import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment-timezone';
import { Box, Text } from 'theme-ui';
import { resolveConnectState } from '../../../../components/datasources/DataConnections';
import includes from 'lodash/includes';

import Pill from '../../../../components/elements/Pill';
import HoverButton from '../../../../components/elements/HoverButton';
import PopoverMenu from '../../../../components/elements/PopoverMenu';
import { colors, fontWeights } from '../../../../themes/baseTheme';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DataInIcon from '../../../../core/icons/DataInIcon.svg';

export const DexcomConnectionStatusCell = ({ patient, onOpenDataConnectionsModal }) => {
  const { t } = useTranslation();

  const dexcomConnectStateUI = useMemo(() => ({
    noPendingConnections: { colorPalette: 'neutral', icon: null, text: t('No Pending Connections') },
    inviteJustSent: { colorPalette: 'info', icon: null, text: t('Invite Sent') },
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

  const handleOpenDataConnectionsModal = () => onOpenDataConnectionsModal(patient.id);

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

export const DaysSinceLastDataCell = ({ patient }) => {
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

export const MoreMenuCell = ({ patient, onOpenEditPatientDialog, onOpenDataConnectionsModal }) => {
  const { t } = useTranslation();

  return (
    <PopoverMenu
      id={`action-menu-${patient?.id}`}
      items={[{
        icon: EditIcon,
        iconLabel: t('Edit Patient Details'),
        iconPosition: 'left',
        id: `edit-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          onOpenEditPatientDialog(patient.id);
        },
        text: t('Edit Patient Details'),
      }, {
        iconSrc: DataInIcon,
        iconLabel: t('Bring Data into Tidepool'),
        iconPosition: 'left',
        id: `edit-data-connections-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          onOpenDataConnectionsModal(patient.id);
        },
        text: t('Bring Data into Tidepool'),
      }]}
      sx={{ position: 'relative', left: '-2px' }}
    />
  );
};

export default {
  DexcomConnectionStatusCell,
  DaysSinceLastDataCell,
  MoreMenuCell,
};
