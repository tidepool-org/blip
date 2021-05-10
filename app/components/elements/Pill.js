import React from 'react';
import PropTypes from 'prop-types';
import { Text, TextProps } from 'rebass/styled-components';

const Pill = (props) => {
  const { variant, colorPalette, label, text, ...themeProps } = props;
  const darkShade = `${colorPalette}.9`;
  const lightShade = `${colorPalette}.0`;
  const color = variant === 'inverse' ? lightShade : darkShade;
  const bg = variant === 'inverse' ? darkShade : lightShade;

  return (
    <Text
      aria-label={label}
      fontFamily="default"
      fontSize={0}
      fontWeight="medium"
      as="span"
      px={2}
      py={1}
      sx={{ borderRadius: 4, textTransform: 'upperCase' }}
      color={color}
      bg={bg}
      {...themeProps}
    >
      {text}
    </Text>
  );
};

Pill.propTypes = {
  colorPalette: PropTypes.oneOf([
    'blues',
    'cyans',
    'grays',
    'greens',
    'indigos',
    'oranges',
    'pinks',
    'purples',
  ]),
  label: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'inverse']),
};

Pill.defaultProps = {
  ...TextProps,
  variant: 'default',
};

export default Pill;
