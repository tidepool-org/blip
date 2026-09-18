import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Flex } from 'theme-ui';
import { providers, getCurrentDataSourceForProvider } from '../../../components/datasources/DataConnections';
import { colors as vizColors } from '@tidepool/viz';
import { useDispatch, useSelector } from 'react-redux';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DataInIcon from '../../../core/icons/DataInIcon.svg';
import Icon from '../../../components/elements/Icon';
import { getActiveDeviceIssue, getDaysAgo } from './helpers';

import { ISSUE_TYPE } from './connectionIssuesApi';
const { STALE_DATA, DISCONNECTED, ERRORING,  EXPIRED_CONNECTION_INVITATION, STALE_CONNECTION_INVITATION } = ISSUE_TYPE;

import {
  setDataConnectionsModalIsOpen,
  setDataConnectionsModalPatientId,
  setEditPatientDialogIsOpen,
  setEditPatientDialogPatientId,
} from './connectionIssuesSlice';
import PopoverMenu from '../../../components/elements/PopoverMenu';

export const PatientCell = ({ patient }) => {
  const { t } = useTranslation();

  const { fullName, birthDate, mrn } = patient || {};

  return <Box sx={{ gap: 0, marginRight: -2 }}>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap', fontWeight: 'medium' }}>{fullName}</Box>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Box>
    <Box sx={{ minHeight: '18px', fontSize: 0, whiteSpace: 'nowrap' }}>
      {mrn ? t('MRN: {{mrn}}', { mrn: mrn }) : ''}
    </Box>
  </Box>;
};

export const DeviceNameCell = ({ patient }) => {
  const category = useSelector(state => state.blip.connectionIssues.category);

  const providerName = getActiveDeviceIssue(patient, category)?.providerId;
  const displayName = providerName ? providers[providerName].displayName : '-';

  return <Box>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{displayName}</Text>
  </Box>;
};

export const ConnectionStatusCell = ({ patient }) => {
  const { t } = useTranslation();
  const category = useSelector(state => state.blip.connectionIssues.category);

  const activeDeviceIssue = getActiveDeviceIssue(patient, category);

  if (!activeDeviceIssue) return null;

  const connectionStatus = (() => {
    switch(activeDeviceIssue._type) {
      case STALE_DATA: return t('Stale Data');
      case DISCONNECTED: return t('Patient Disconnected');
      case ERRORING: return t('Error Connecting');
      case EXPIRED_CONNECTION_INVITATION: return t('Invite Expired');
      case STALE_CONNECTION_INVITATION: return t('Invite Sent');
    }

    return null;
  })();

  return (
    <Flex className='device-issues-connection-status-cell'>
      <Flex
        className='device-issues-connection-status-pill'
        px={2} py={1} sx={{
        backgroundColor: vizColors.gold05,
        borderRadius: 4,
        alignItems: 'center',
      }}>
          <Icon label="warning" icon={ErrorRoundedIcon} sx={{ fontSize: 1, color: vizColors.gold50 }} mr={1} />
          <Text sx={{ fontSize: 0, color: vizColors.gold50, fontWeight: 'medium', whiteSpace: 'nowrap' }}>
            {connectionStatus || ''}
          </Text>
      </Flex>
    </Flex>
  );
};

export const StatusSummaryCell = ({ patient }) => {
  const { t } = useTranslation();
  const category = useSelector(state => state.blip.connectionIssues.category);

  const deviceIssue = getActiveDeviceIssue(patient, category);

  if (!deviceIssue?._type) return null;

  let label;
  let color;

  switch(deviceIssue._type) {
    case STALE_DATA: {
      const dataSource = getCurrentDataSourceForProvider(patient, deviceIssue.providerId);
      const daysAgo = getDaysAgo(dataSource?.latestDataTime);

      label = daysAgo === null ? '-' : t('Last data sync {{daysAgo}} days ago', { daysAgo });
      color = vizColors.red50;
      break;
    }

    case DISCONNECTED: {
      const daysAgo = getDaysAgo(deviceIssue?.effectiveTime);

      label = daysAgo === null ? '-' : t('Disconnected {{daysAgo}} days ago', { daysAgo });
      color = vizColors.red50;
      break;
    }

    case ERRORING: {
      const daysAgo = getDaysAgo(deviceIssue?.effectiveTime);

      label = daysAgo === null ? '-' : t('Connection Error {{daysAgo}} days ago', { daysAgo });
      color = vizColors.gold50;
      break;
    }

    case EXPIRED_CONNECTION_INVITATION: {
      const { providerId } = deviceIssue;
      const lastInvitedAt = patient?.connectionRequests?.[providerId]?.[0]?.createdTime;
      const daysAgo = getDaysAgo(lastInvitedAt);

      label = daysAgo === null ? '-' : t('Invited {{daysAgo}} days ago', { daysAgo });
      color = vizColors.red50;
      break;
    }

    case STALE_CONNECTION_INVITATION: {
      const { providerId } = deviceIssue;
      const lastInvitedAt = patient?.connectionRequests?.[providerId]?.[0]?.createdTime;
      const daysAgo = getDaysAgo(lastInvitedAt);

      label = daysAgo === null ? '-' : t('Invited {{daysAgo}} days ago', { daysAgo });
      color = vizColors.gold50;
      break;
    }

    default:
      return null;
  }

  return <Box sx={{ color }}>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>
      {label}
    </Text>
  </Box>;
};

export const MoreMenuCell = ({ patient }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleOpenEditPatientDialog = () => {
    dispatch(setEditPatientDialogIsOpen(true));
    dispatch(setEditPatientDialogPatientId(patient.id));
  };

  const handleOpenDataConnectionsModal = () => {
    dispatch(setDataConnectionsModalIsOpen(true));
    dispatch(setDataConnectionsModalPatientId(patient.id));
  };

  return (
    <PopoverMenu
      id={`action-menu-${patient?.id}`}
      data-testid={`action-menu-${patient?.id}-icon`}
      items={[{
        icon: EditIcon,
        iconLabel: t('Edit Patient Details'),
        iconPosition: 'left',
        id: `edit-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          handleOpenEditPatientDialog();
        },
        text: t('Edit Patient Details'),
      }, {
        iconSrc: DataInIcon,
        iconLabel: t('Manage Device Connections'),
        iconPosition: 'left',
        id: `edit-data-connections-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          handleOpenDataConnectionsModal();
        },
        text: t('Manage Device Connections'),
      }]}
      sx={{ position: 'relative', left: '-2px' }}
    />
  );
};

export default {
  PatientCell,
  DeviceNameCell,
  StatusSummaryCell,
  MoreMenuCell,
};
