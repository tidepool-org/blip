import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, BoxProps } from 'rebass/styled-components';

const Chip = (props) => {
  const { label, variant, text, ...themeProps } = props;

  return (
    <Box
      m={1}
      variant={`chips.${variant}`}
      aria-label={label}
      {...themeProps}
    >
      <Text className="text">{text}</Text>
    </Box>
  );
};

Chip.propTypes = {
  text: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'hover', 'active', 'focus', 'selected', 'disabled']),
  label: PropTypes.string.isRequired,
};

Chip.defaultProps = {
  ...BoxProps,
  variant: 'default',
  label: 'chip',
};

export default Chip;
