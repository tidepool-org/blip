import React from 'react';
import { Box, Text, Flex } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import { useTranslation } from 'react-i18next';

export const CATEGORY = {
  DEFAULT: 'DEFAULT', // 'All Categories'
  LOWS: 'LOWS',       // 'Lows'
  HIGHS: 'HIGHS',     // 'Highs'
  OTHER: 'OTHER',     // 'Other'
  TARGET: 'TARGET',   // 'Meeting Targets'
};

const Category = ({
  label,
  selected,
  onClick,
  indicatorColor,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'inline-block',
        padding: '0 12px',
        background: selected ? vizColors.blue05 : vizColors.white,
        borderRadius: '2px',
        '&:hover': { cursor: 'pointer' },
      }}
    >
      {indicatorColor && (
        <Box sx={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          background: indicatorColor,
          borderRadius: '50%',
          marginRight: '4px',
        }}></Box>
      )}

      <Text sx={{
        fontSize: 1,
        color: vizColors.blue50,
        fontWeight: selected ? 'medium' : 'normal',
      }}>{label}</Text>
    </Box>
  );
};

const CategorySelector = ({
  value,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <Flex
      sx={{
        padding: '4px',
        maxWidth: '640px',
        margin: '0px auto 24px',
        border: `1px solid ${vizColors.blue30}`,
        borderRadius: '4px',
        backgroundColor: vizColors.white,
        justifyContent: 'space-between',
      }}>
      <Category
        label={t('All Categories')}
        selected={value === CATEGORY.DEFAULT}
        onClick={() => onChange(CATEGORY.DEFAULT)}
      />
      <Category
        label={t('Lows')}
        selected={value === CATEGORY.LOWS}
        onClick={() => onChange(CATEGORY.LOWS)}
        indicatorColor={vizColors.low}
      />
      <Category
        label={t('Highs')}
        selected={value === CATEGORY.HIGHS}
        onClick={() => onChange(CATEGORY.HIGHS)}
        indicatorColor={vizColors.high}
      />
      <Category
        label={t('Other')}
        selected={value === CATEGORY.OTHER}
        onClick={() => onChange(CATEGORY.OTHER)}
        indicatorColor={vizColors.gold05}
      />
      <Category
        label={t('Meeting Targets')}
        selected={value === CATEGORY.TARGET}
        onClick={() => onChange(CATEGORY.TARGET)}
        indicatorColor={vizColors.target}
      />
    </Flex>
  );
};

export default CategorySelector;
