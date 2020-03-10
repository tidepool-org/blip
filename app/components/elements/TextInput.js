import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';
import { Label, Input } from '@rebass/forms';
import { Caption } from './FontStyles';
import { fonts, fontSizes, colors, borders, radii, space } from '../../themes/baseTheme';

const StyledInput = styled(Input)`
  border: ${borders.input};
  box-shadow: none;
  border-radius: ${radii.input}px;
  padding: ${styleprops => (styleprops.space ? space[styleprops.space] : 12)}px;
  caret-color: ${colors.mediumPurple};
  font-size: ${fontSizes[1]}px;
  font-family: ${fonts.default};
  color: ${colors.mediumPurple};

  &::placeholder {
    color: ${colors.text.primaryTextSubdued};
  }

  &.active {
    color: ${colors.text.primaryTextSubdued};
    box-shadow: none;
  }

  &:focus {
    box-shadow: none;
  }

  &:disabled {
    background: ${colors.grays[0]};
    color: ${colors.text.primaryDisabled};
  }
`;

export const TextInput = props => {
  const { label, name, width, ...inputProps } = props;
  return (
    <Box
      sx={{
        width,
      }}
    >
      {props.label &&
        <Label htmlFor={name}>
          <Caption>{label}</Caption>
        </Label>
      }
      <StyledInput id={name} name={name} {...inputProps} />
    </Box>
  );
};

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  space: PropTypes.number,
  disabled: PropTypes.bool,
};

TextInput.defaultProps = {
  placeholder: '',
  width: ['100%', '75%', '50%'],
};

export default TextInput;
