import React from 'react';
import noop from 'lodash/noop';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/elements/Button';

const ResetFilters = ({ hidden = false, onClick = noop }) => {
  const { t } = useTranslation();

  if (hidden) return null;

  console.log('AYOOO')

  return (
    <Button
      id="reset-all-active-filters"
      variant="textSecondary"
      onClick={onClick}
      sx={{ fontSize: 0, color: 'grays.4', flexShrink: 0 }}
      px={0}
    >
      {t('Reset Filters')}
    </Button>
  );
};

export default ResetFilters;
