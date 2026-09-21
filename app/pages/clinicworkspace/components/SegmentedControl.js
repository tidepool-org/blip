import React from 'react';
import { colors as vizColors } from '@tidepool/viz';
import { Flex } from 'theme-ui';
import noop from 'lodash/noop';

export const SegmentedControl = ({ children }) => (
  <Flex
    role="radiogroup"
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

export const Segment = ({
  children,
  selected = false,
  onClick = noop,
}) => {
  return (
    <Flex
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      onKeyDown={(evt) => {
        evt.preventDefault();
        if (evt.key === 'Enter' || evt.key === ' ') onClick();
      }}
      tabIndex="0"
      px={4}
      sx={{
        alignItems: 'center',
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
    </Flex>
  );
};

export default {
  SegmentedControl,
  Segment,
};
