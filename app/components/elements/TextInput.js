import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Flex } from 'rebass/styled-components';
import { Label, Input, InputProps } from '@rebass/forms';
import { Caption } from './FontStyles';
import { Icon } from './Icon';
import { fonts, fontSizes, colors, borders, radii, space } from '../../themes/baseTheme';

const StyledWrapper = styled(Flex)`
  position: relative;
  flex-wrap: wrap;

  > input {
    flex-grow: 1;
  }

.MuiSvgIcon-root {
    position: absolute;
    right: ${space[2]}px;
    top: 12px;
    color: inherit;
    /* Disable pointer events so click actually applies to the dropdown menu underneath */
    pointer-events: none;
  }
`;

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
  const { label, name, width, icon, ...inputProps } = props;
  return (
    <React.Fragment>
      {label &&
        <Label htmlFor={name}>
          <Caption>{label}</Caption>
        </Label>
      }
      <StyledWrapper
        sx={{
          width,
        }}
      >
        <StyledInput id={name} name={name} {...inputProps} />
        {icon &&
          <Icon icon={icon} label={label} />
        }
      </StyledWrapper>
    </React.Fragment>
  );
};

TextInput.propTypes = {
  ...InputProps,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  space: PropTypes.number,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
};

TextInput.defaultProps = {
  placeholder: '',
  width: ['100%', '75%', '50%'],
};

export default TextInput;
