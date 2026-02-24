import React from 'react';
import { colors as vizColors } from '@tidepool/viz';
import { Box, Flex } from 'theme-ui';
import noop from 'lodash/noop';

export const CategorySelector = ({ children }) => (
  <Flex
    sx={{
      border: `1px solid ${ vizColors.gray10 }`,
      borderRadius: 3,
      backgroundColor: vizColors.white,
      padding: 1,
    }}>
    {children}
  </Flex>
);

export const CategoryTab = ({
  children,
  selected = false,
  onClick = noop,
}) => {
  return (
    <Box
      onClick={onClick}
      onKeyDown={(evt) => {
        if (evt.key === 'Enter' || evt.key === ' ') {
          onClick();
        }
      }}
      tabIndex="0"
      px={4}
      sx={{
        borderRadius: 3,
        minWidth: '24px',
        fontWeight: selected ? 'medium' : 'normal',
        color: selected ? vizColors.blue60 : vizColors.blue50,
        backgroundColor: selected ? vizColors.blue05 : vizColors.white,
        '&:hover': { cursor: 'pointer' },
      }}>

      {children}
    </Box>
  );
};

export default {
  CategorySelector,
  CategoryTab,
};
