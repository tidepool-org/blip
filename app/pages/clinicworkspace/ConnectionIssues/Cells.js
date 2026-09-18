import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Flex } from 'theme-ui';
import moment from 'moment-timezone';
import { providers } from '../../../components/datasources/DataConnections';
import { colors as vizColors } from '@tidepool/viz';
import { useSelector } from 'react-redux';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import Icon from '../../../components/elements/Icon';
import { getActiveDeviceIssue, getDaysAgo } from './helpers';

import { ISSUE_TYPE } from './connectionIssuesApi';
const { STALE_DATA, DISCONNECTED, ERRORING,  EXPIRED_CONNECTION_INVITATION, STALE_CONNECTION_INVITATION } = ISSUE_TYPE;

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
      const daysAgo = getDaysAgo(patient?.dataSources?.[0]?.latestDataTime);

      label = daysAgo === null ? '-' : t('Disconnected {{daysAgo}} days ago', { daysAgo });
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
