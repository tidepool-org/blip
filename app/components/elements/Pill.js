import React from 'react';
import PropTypes from 'prop-types';
import { Text, TextProps } from 'rebass/styled-components';
import isString from 'lodash/isString';

const namedPalletMap = {
  blues: ['blues.0', 'blues.9'],
  cyans: ['cyans.0', 'cyans.9'],
  grays: ['grays.0', 'grays.9'],
  greens: ['greens.0', 'greens.9'],
  indigos: ['indigos.0', 'indigos.9'],
  oranges: ['oranges.0', 'oranges.8'],
  pinks: ['pinks.0', 'pinks.9'],
  purples: ['purples.0', 'purples.9'],
};

const Pill = (props) => {
  const { variant, colorPalette, label, text, round, width, sx = {}, ...themeProps } = props;
  const palette = isString(colorPalette) ? namedPalletMap[colorPalette] : colorPalette;
  const darkShade = palette[palette.length - 1];
  const lightShade = palette[0];
  const color = variant === 'inverse' ? lightShade : darkShade;
  const bg = variant === 'inverse' ? darkShade : lightShade;
  const borderRadius = round ? '100%' : 4;
  const height = round ? width : 'auto';
  const lineHeight = round ? width : 'inherit';

  return (
    <Text
      aria-label={label}
      fontFamily="default"
      fontSize={0}
      fontWeight="medium"
      as="span"
      px={round ? 0 : 2}
      py={round ? 0 : 1}
      sx={{ borderRadius, textTransform: 'upperCase', ...sx }}
      color={color}
      bg={bg}
      width={width}
      height={height}
      lineHeight={lineHeight}
      textAlign="center"
      {...themeProps}
    >
      {text}
    </Text>
  );
};

Pill.propTypes = {
  ...TextProps,
  round: PropTypes.bool,
  colorPalette: PropTypes.oneOfType([
    PropTypes.oneOf([
      'blues',
      'cyans',
      'grays',
      'greens',
      'indigos',
      'oranges',
      'pinks',
      'purples',
    ]),
    PropTypes.arrayOf(PropTypes.string),
  ]),
  label: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['default', 'inverse']),
};

Pill.defaultProps = {
  colorPalette: 'purples',
  width: 'auto',
  variant: 'default',
};

export default Pill;
