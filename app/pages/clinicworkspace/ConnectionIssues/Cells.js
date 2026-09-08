import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text, Flex } from 'theme-ui';
import moment from 'moment-timezone';
import { providers } from '../../../components/datasources/DataConnections';
import { colors as vizColors } from '@tidepool/viz';
import { useDispatch, useSelector } from 'react-redux';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DataInIcon from '../../../core/icons/DataInIcon.svg';
import Icon from '../../../components/elements/Icon';
import { getActiveDeviceIssue } from './helpers';

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

  return <Box>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{fullName}</Text>
    <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Text>
    {mrn && <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>, {t('MRN: {{mrn}}', { mrn: mrn })}</Text>}
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
      case 'staleData': return t('Stale Data');
      case 'erroring': return t('Error Connecting');
      case 'disconnected': return t('Patient Disconnected');
      case 'expiredConnectionInvitation': return t('Invite Expired');
      case 'staleConnectionInvitation': return t('Invite Sent');
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

export const LastUpdatedCell = ({ patient }) => {
  const { t } = useTranslation();

  const deviceIssue = {};

  const daysAgo = deviceIssue?.time
    ? moment().diff(moment(deviceIssue.time), 'days')
    : null;

  const label = daysAgo === null ? '-' : t('{{daysAgo}} days ago', { daysAgo });

  return <Box>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{label}</Text>
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
  LastUpdatedCell,
  MoreMenuCell,
};
