import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'theme-ui';

export const COMPACT = '@container (max-width: 1200px)';

export const PatientCell = ({ patient }) => {
  const { t } = useTranslation();

  const { fullName, birthDate, mrn } = patient || {};

  return <Box sx={{ gap: 0, marginRight: -2 }}>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap', fontWeight: 'medium' }}>{fullName}</Box>
    <Box sx={{ fontSize: 0, whiteSpace: 'nowrap' }}>{t('DOB:')} {birthDate}</Box>
    {mrn && <Box sx={{ fontSize: 0, whiteSpace: 'nowrap' }}>{t('MRN: {{mrn}}', { mrn: mrn })}</Box>}
  </Box>;
};

export default {
  PatientCell,
};
