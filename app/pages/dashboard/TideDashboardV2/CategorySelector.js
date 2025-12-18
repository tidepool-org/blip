import React from 'react';
import { Box, Text, Flex } from 'theme-ui';
import { colors as vizColors } from '@tidepool/viz';
import { useTranslation } from 'react-i18next';

export const CATEGORY = {
  DEFAULT: 'DEFAULT', // 'All Categories'
  ANY_LOW: 'ANY_LOW',       // 'Lows'
  VERY_LOW: 'VERY_LOW',
  ANY_HIGH: 'ANY_HIGH',     // 'Highs'
  VERY_HIGH: 'VERY_HIGH',
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
        maxWidth: '800px',
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
        label={t('Very Low')}
        selected={value === CATEGORY.VERY_LOW}
        onClick={() => onChange(CATEGORY.VERY_LOW)}
        indicatorColor={vizColors.low}
      />
      <Category
        label={t('Low')}
        selected={value === CATEGORY.ANY_LOW}
        onClick={() => onChange(CATEGORY.ANY_LOW)}
        indicatorColor={vizColors.low}
      />
      <Category
        label={t('High')}
        selected={value === CATEGORY.ANY_HIGH}
        onClick={() => onChange(CATEGORY.ANY_HIGH)}
        indicatorColor={vizColors.high}
      />
      <Category
        label={t('Very High')}
        selected={value === CATEGORY.VERY_HIGH}
        onClick={() => onChange(CATEGORY.VERY_HIGH)}
        indicatorColor={vizColors.low}
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
