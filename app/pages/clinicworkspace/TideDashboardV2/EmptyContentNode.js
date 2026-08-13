import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import colorPalette from '../../../themes/colorPalette';
import { Flex, Text } from 'theme-ui';
import useActiveFiltersCount from './useActiveFiltersCount';
import { resetTideDashboardFilters } from './tideDashboardFiltersSlice';
import { setOffset } from './tideDashboardSlice';
import ClearFilterButtons, { PATIENT_QUERY_STATE } from '../components/ClearFilterButtons';
import noop from 'lodash/noop';

const EmptyContentNode = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const activeFiltersCount = useActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    dispatch(resetTideDashboardFilters());
    dispatch(setOffset(0));
  };

  const emptyContentCopy = hasActiveFilters
    ? t('There are no patients with the current filter(s)')
    : t('There are no results to show');

  const patientQueryState = hasActiveFilters ? PATIENT_QUERY_STATE.FILTER_ONLY : PATIENT_QUERY_STATE.NONE;

  return (
    <Flex sx={{
      backgroundColor: colorPalette.primary.bluePrimary00,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '90px',
      flexDirection: 'column',
      gap: 2,
      marginBottom: 4,
      borderBottom: '1px solid #D1D6E1',
    }}>
      <Text className="table-empty-text" sx={{ fontWeight: 'medium' }}>
        {emptyContentCopy}
      </Text>

      { hasActiveFilters &&
        <ClearFilterButtons
          patientQueryState={patientQueryState}
          onResetFilters={handleResetFilters}
          onClearSearch={noop}
        />
      }
    </Flex>
  );
};

export default EmptyContentNode;
