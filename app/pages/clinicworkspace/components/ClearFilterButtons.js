import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'theme-ui';
import styled from '@emotion/styled';
import { colors as vizColors } from '@tidepool/viz';

export const PATIENT_QUERY_STATE = {
  FILTER_AND_SEARCH: 'FILTER_AND_SEARCH',
  FILTER_ONLY: 'FILTER_ONLY',
  SEARCH_ONLY: 'SEARCH_ONLY',
  NONE: 'NONE',
};

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

const ClearFilterButtons = ({ patientListQueryState, onClearSearch, onResetFilters }) => {
  const { t } = useTranslation();

  const { FILTER_AND_SEARCH, FILTER_ONLY, SEARCH_ONLY, NONE } = PATIENT_QUERY_STATE;

  switch(patientListQueryState) {
    case SEARCH_ONLY:
      return <Box>
        <ClearButton className='clear-search-button' onClick={onClearSearch}>
          {t('Clear Search')}
        </ClearButton>
      </Box>;

    case FILTER_ONLY:
      return <Box>
        <ClearButton className='reset-filters-button' onClick={onResetFilters}>
          {t('Reset Filters')}
        </ClearButton>
      </Box>;

    case FILTER_AND_SEARCH:
      return <Box>
        <ClearButton className='reset-filters-button' onClick={onResetFilters}>
          {t('Reset Filters')}
        </ClearButton>
        <>{' '}{t('or')}{' '}</>
        <ClearButton className='clear-search-button' onClick={onClearSearch}>
          {t('Clear Search')}
        </ClearButton>
      </Box>;

    case NONE:
    default:
      return null;
  }
};

export default ClearFilterButtons;
