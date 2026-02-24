import React from 'react';
import { Flex, Text } from 'theme-ui';
import Pill from '../../../components/elements/Pill';
import without from 'lodash/without';
import { borders } from '../../../themes/baseTheme';
import Icon from '../../../components/elements/Icon';

import FilterIcon from '../../../core/icons/FilterIcon.svg';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const ActiveFilterCount = () => {
  const { t } = useTranslation();
  const patientTags = useSelector(state => state.blip.clinicWorkspaceFilters.patientTags);

  const activeFiltersCount = without([
    patientTags?.length,
  ], null, 0, undefined).length;

  return (
    <Flex
      mr={4}
      sx={{ alignItems: 'center', gap: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }}
      id='summary-dashboard-filters'
    >
      <Flex
        pl={[0, 0, 2]}
        py={1}
        sx={{
          color: activeFiltersCount > 0 ? 'purpleMedium' : 'grays.4',
          alignItems: 'center',
          gap: 1,
          borderLeft: ['none', null, borders.divider],
          flexShrink: 0,
        }}
      >
        {activeFiltersCount > 0 ? (
          <Pill
            id="filter-count"
            label="filter count"
            round
            sx={{ width: '14px', lineHeight: '15px', fontSize: '9px', display: 'flex', justifyContent: 'center' }}
            colorPalette={['purpleMedium', 'white']}
            text={`${activeFiltersCount}`}
          />
        ) : (
          <Icon
            id="filter-icon"
            variant="static"
            iconSrc={FilterIcon}
            label={t('Filter')}
            sx={{ fontSize: 1, width: '14px', color: 'grays.4' }}
          />
        )}
        <Text sx={{ fontSize: 0 }}>{t('Filter By')}</Text>
      </Flex>
    </Flex>
  );
};

export default ActiveFilterCount;
