import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import colorPalette from '../../../themes/colorPalette';
import { Flex, Text, Box } from 'theme-ui';
import styled from '@emotion/styled';
import { colors as vizColors } from '@tidepool/viz';
import useActiveFiltersCount from './useActiveFiltersCount';
import { resetTideDashboardFilters } from './tideDashboardFiltersSlice';

const ClearButton = styled.button`
  background: none;
  color: ${vizColors.indigo30};
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  text-underline-offset: 4px;
  text-decoration: underline;
`;

const EmptyContentNode = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const activeFiltersCount = useActiveFiltersCount();
  const hasActiveFilters = activeFiltersCount > 0;

  const emptyContentCopy = hasActiveFilters
    ? t('There are no patients with the current filter(s)')
    : t('There are no results to show');

  const handleResetFilters = () => dispatch(resetTideDashboardFilters());

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

      { hasActiveFilters && (
        <ClearButton className='reset-filters-button' onClick={handleResetFilters}>
          {t('Reset Filter')}
        </ClearButton>
      )}
    </Flex>
  );
};

export default EmptyContentNode;
