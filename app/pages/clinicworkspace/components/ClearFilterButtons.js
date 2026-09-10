import React from 'react';
import PropTypes from 'prop-types';
import { Trans, useTranslation } from 'react-i18next';
import { Box } from 'theme-ui';
import styled from '@emotion/styled';
import { colors as vizColors } from '@tidepool/viz';
import noop from 'lodash/noop';

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

const ClearFilterButtons = ({ patientQueryState, onClearSearch = noop, onResetFilters = noop }) => {
  const { t } = useTranslation();

  const { FILTER_AND_SEARCH, FILTER_ONLY, SEARCH_ONLY, NONE } = PATIENT_QUERY_STATE;

  switch(patientQueryState) {
    case SEARCH_ONLY:
      return <Box>
        <ClearButton className='clear-search-button' onClick={onClearSearch}>
          {t('Clear Search')}
        </ClearButton>
      </Box>;

    case FILTER_ONLY:
      return <Box>
        <ClearButton className='reset-filters-button' onClick={onResetFilters}>
          {t('Reset All Filters')}
        </ClearButton>
      </Box>;

    case FILTER_AND_SEARCH:
      return <Box>
        <Trans t={t}>
          <ClearButton className='reset-filters-button' onClick={onResetFilters}>Reset All Filters</ClearButton>
          {' '}or{' '}
          <ClearButton className='clear-search-button' onClick={onClearSearch}>Clear Search</ClearButton>
        </Trans>
      </Box>;

    case NONE:
    default:
      return null;
  }
};

ClearFilterButtons.propTypes = {
  patientQueryState: PropTypes.oneOf(Object.values(PATIENT_QUERY_STATE)).isRequired,
  onClearSearch: PropTypes.func,
  onResetFilters: PropTypes.func,
};

export default ClearFilterButtons;
