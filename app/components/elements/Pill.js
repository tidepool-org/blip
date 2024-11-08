import React from 'react';
import PropTypes from 'prop-types';
import { Text, TextProps } from 'theme-ui';
import isString from 'lodash/isString';

import Icon from './Icon';
import baseTheme from '../../themes/baseTheme';

const namedPalletMap = {
  blues: ['blues.0', 'blues.9'],
  cyans: ['cyans.0', '#15798E'],
  grays: ['grays.0', 'grays.9'],
  greens: ['greens.0', 'greens.9'],
  indigos: ['indigos.0', 'indigos.9'],
  oranges: ['oranges.0', 'oranges.8'],
  pinks: ['pinks.0', 'pinks.9'],
  purples: ['purples.0', 'purples.9'],
  primaryText: ['#F3F7FC', 'text.primary'],
  warning: ['#FFE8CF', 'feedback.warning'],
  success: ['#EBFBF0', 'feedback.success'],
  neutral: ['lightestGrey', '#707070'],
  transparent: ['transparent', 'inherit'],
};

export function Pill(props) {
  const {
    variant,
    colorPalette,
    condensed,
    icon,
    label,
    text,
    round,
    width,
    sx = {},
    ...themeProps
  } = props;

  const palette = isString(colorPalette) ? namedPalletMap[colorPalette] : colorPalette;
  const darkShade = palette[palette.length - 1];
  const lightShade = palette[0];
  const color = variant === 'inverse' ? lightShade : darkShade;
  const bg = variant === 'inverse' ? darkShade : lightShade;
  const px = props.px || condensed ? 1 : 2;
  const pt = props.pt || condensed ? '2px' : 1;
  const pb = props.pb || condensed ? '1px' : 1;

  let borderRadius = condensed ? 3 : 4;
  if (round) borderRadius = '100%';
  const height = round ? width : 'auto';
  const lineHeight = round ? width : '1em';

  return (
    <Text
      aria-label={label}
      as="span"
      px={round ? 0 : px}
      pt={round ? 0 : pt}
      pb={round ? 0 : pb}
      sx={{
        fontFamily: 'default',
        fontSize: 0,
        fontWeight: 'medium',
        borderRadius,
        textAlign: 'center',
        color,
        bg,
        width,
        height,
        lineHeight,
        ...sx
      }}
      {...themeProps}
    >
      {icon && (
        <Icon
          tabIndex={-1}
          className="icon"
          fontSize="1.1em"
          mr="0.35em"
          sx={{ top: pt }}
          theme={baseTheme}
          variant="static"
          icon={icon}
          label={label}
        />
      )}
      {text}
    </Text>
  );
}

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
      'primaryText',
      'warning',
      'success',
      'neutral',
      'transparent',
    ]),
    PropTypes.arrayOf(PropTypes.string),
  ]),
  condensed: PropTypes.bool,
  icon: PropTypes.elementType,
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
