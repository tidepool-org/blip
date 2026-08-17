import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';

const PatientCount = ({ total = 0, offset = 0, limit }) => {
  const { t } = useTranslation();

  if (total === 0) return null;

  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + limit, total);

  return (
    <Text sx={{ fontSize: 0, color: vizColors.gray30 }}>
      {t('Showing patients {{start}} - {{end}} of {{total}}', { start, end, total })}
    </Text>
  );
};

export default PatientCount;
