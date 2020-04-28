import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Flex, Box, BoxProps } from 'rebass/styled-components';
import { Label, Input as Base, InputProps } from '@rebass/forms';
import { Caption } from './FontStyles';
import { Icon } from './Icon';
import { space } from '../../themes/baseTheme';
import cx from 'classnames';

const StyledWrapper = styled(Flex)`
  position: relative;
  flex-wrap: wrap;

  > input {
    flex-grow: 1;
  }

  .MuiSvgIcon-root {
    position: absolute;
    right: ${space[2]}px;
    top: ${({ variant }) => (variant === 'inputs.text.default' ? 13 : 9)}px;
    color: inherit;
    /* Disable pointer events so click actually applies to the text input underneath */
    pointer-events: none;
  }
`;

export const TextInput = (props) => {
  const {
    label,
    name,
    width = ['100%', '75%', '50%'],
    icon,
    themeProps,
    variant,
    required,
    placeholder,
    error,
    ...inputProps
  } = props;

  const inputClasses = cx({
    error,
    required,
  });
  return (
    <Box width={width} {...themeProps}>
      {label && (
        <Label htmlFor={name}>
          <Caption className={inputClasses}>{label}</Caption>
        </Label>
      )}
      <StyledWrapper variant={`inputs.text.${variant}`}>
        <Base
          id={name}
          name={name}
          placeholder={placeholder}
          className={inputClasses}
          {...inputProps}
        />
        {icon && <Icon icon={icon} label={label} />}
      </StyledWrapper>
      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
    </Box>
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
  themeProps: PropTypes.shape(BoxProps),
  variant: PropTypes.oneOf(['default', 'condensed']),
  required: PropTypes.bool,
  error: PropTypes.string,
};

TextInput.defaultProps = {
  placeholder: '',
  type: 'text',
  themeProps: {},
  variant: 'default',
};

export default TextInput;
