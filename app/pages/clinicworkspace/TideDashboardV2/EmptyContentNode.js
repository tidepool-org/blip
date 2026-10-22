import React from 'react';
import { useTranslation } from 'react-i18next';
import colorPalette from '../../../themes/colorPalette';
import { Flex, Text } from 'theme-ui';

const EmptyContentNode = () => {
  const { t } = useTranslation();

  const emptyContentCopy = t('There are no results to show');

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
    </Flex>
  );
};

export default EmptyContentNode;
