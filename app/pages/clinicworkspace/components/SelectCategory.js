import React from 'react';
import { colors as vizColors } from '@tidepool/viz';
import { Box, Flex } from 'theme-ui';
import noop from 'lodash/noop';

export const SelectCategory = ({ children }) => (
  <Flex
    sx={{
      border: `1px solid ${ vizColors.gray10 }`,
      borderRadius: 3,
      backgroundColor: vizColors.white,
      padding: 1,
      gap: 1,
    }}
  >
    {children}
  </Flex>
);

export const Tab = ({
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
        textAlign: 'center',
        borderRadius: 3,
        minWidth: '24px',
        fontWeight: 'medium',
        color: selected ? vizColors.blue60 : vizColors.blue50,
        backgroundColor: selected ? vizColors.blue05 : vizColors.white,
        transition: 'background-color 0.2s ease, color 0.2s ease, font-weight 0.2s ease',
        '&:hover': selected
            ? { cursor: 'default' }
            : { cursor: 'pointer', backgroundColor: vizColors.gray05 },
      }}
    >
      {children}
    </Box>
  );
};

export default {
  SelectCategory,
  Tab,
};
