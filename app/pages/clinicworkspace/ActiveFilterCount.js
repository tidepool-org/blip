import React from 'react';
import { Flex, Text } from 'theme-ui';
import Pill from '../../components/elements/Pill';
import { borders } from '../../themes/baseTheme';
import Icon from '../../components/elements/Icon';

import FilterIcon from '../../core/icons/FilterIcon.svg';
import { useTranslation } from 'react-i18next';

const ActiveFilterCount = ({ count }) => {
  const { t } = useTranslation();

  return (
    <Flex
      sx={{ alignItems: 'center', gap: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }}
      id='summary-dashboard-filters'
    >
      <Flex
        pl={[0, 0, 2]}
        py={1}
        sx={{
          color: count > 0 ? 'purpleMedium' : 'grays.4',
          alignItems: 'center',
          gap: 1,
          borderLeft: ['none', null, borders.divider],
          flexShrink: 0,
        }}
      >
        {count > 0 ? (
          <Pill
            id="filter-count"
            label="filter count"
            round
            sx={{ width: '14px', lineHeight: '15px', fontSize: '9px', display: 'flex', justifyContent: 'center' }}
            colorPalette={['purpleMedium', 'white']}
            text={`${count}`}
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
