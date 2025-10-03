import React from 'react';
import { Flex, Box } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { Body1 } from '../elements/FontStyles';

export const BgLegend = () => {
  const { t } = useTranslation();

  const bgClasses = [
    'veryLow',
    'low',
    'target',
    'high',
    'veryHigh',
  ];

  return (
    <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
      <Body1 sx={{ fontWeight: 'medium'}}>{t('Low')}</Body1>

      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        {bgClasses.map((bgClass) => (
          <Box key={bgClass} sx={{ backgroundColor: bgClass, padding: '5px', borderRadius: 5 }} />
        ))}
      </Flex>

      <Body1 sx={{ fontWeight: 'medium'}}>{t('High')}</Body1>
    </Flex>
  );
};

export default BgLegend;
