import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Text } from 'theme-ui';
import getMostRecentEvent from './getMostRecentEvent';
import moment from 'moment-timezone';

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
  const { t } = useTranslation();

  const deviceIssue = getMostRecentEvent(patient);

  return <Box>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{deviceIssue?.providerName || '-'}</Text>
  </Box>;
};

export const LastUpdatedCell = ({ patient }) => {
  const { t } = useTranslation();

  const deviceIssue = getMostRecentEvent(patient);

  const daysAgo = deviceIssue?.time
    ? moment().diff(moment(deviceIssue.time), 'days')
    : null;

  const label = daysAgo === null ? '-' : t('{{daysAgo}} days ago', { daysAgo });

  return <Box>
    <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{label}</Text>
  </Box>;
};

export default {
  PatientCell,
  DeviceNameCell,
  LastUpdatedCell,
};
