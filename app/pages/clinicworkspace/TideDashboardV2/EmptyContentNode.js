import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import colorPalette from '../../../themes/colorPalette';
import { Flex, Text } from 'theme-ui';
import { resetTideDashboardFilters } from './tideDashboardFiltersSlice';
import { setOffset } from './tideDashboardSlice';
import ClearFilterButtons, { PATIENT_QUERY_STATE } from '../components/ClearFilterButtons';
import noop from 'lodash/noop';
import without from 'lodash/without';

const EmptyContentNode = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { patientTags, clinicSites } = useSelector(state => state.blip.tideDashboardFilters);

  const activeFiltersCount = without([
    patientTags?.length,
    clinicSites?.length,
  ], null, 0, undefined).length;

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
    <Flex data-testid="tide-dashboard-empty-content" sx={{
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
