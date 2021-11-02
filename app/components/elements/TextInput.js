import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Flex, Box, Text, BoxProps } from 'rebass/styled-components';
import { Label, Input as Base, InputProps } from '@rebass/forms/styled-components';
import cx from 'classnames';

import { Caption } from './FontStyles';
import { Icon } from './Icon';
import { shadows } from '../../themes/baseTheme';


const StyledWrapper = styled(Flex)`
  position: relative;
  align-items: center;

  > input {
    flex: 1;
  }

  .MuiSvgIcon-root {
    color: inherit;
    pointer-events: inherit;
  }
`;

export const TextInput = (props) => {
  const {
    label,
    name,
    width = ['100%', '75%', '50%'],
    icon,
    iconLabel,
    innerRef,
    onClickIcon,
    prefix,
    suffix,
    themeProps,
    variant,
    required,
    placeholder,
    error,
    warning,
    ...inputProps
  } = props;

  const inputClasses = cx({
    error,
    required,
    warning: !error && warning,
  });
  return (
    <Box width={width} {...themeProps}>
      {label && (
        <Label htmlFor={name}>
          <Caption className={inputClasses}>{label}</Caption>
        </Label>
      )}
      <StyledWrapper variant={`inputs.text.${variant}`}>
        {prefix && <Text className="prefix">{prefix}</Text>}
        <Base
          id={name}
          name={name}
          placeholder={placeholder}
          className={inputClasses}
          ref={innerRef}
          {...inputProps}
        />
        {icon && (
          <Icon
            className="icon"
            icon={icon}
            label={iconLabel || label}
            cursor={onClickIcon ? 'pointer' : 'auto'}
            tabIndex={onClickIcon ? 0 : -1}
            onClick={onClickIcon}
            sx={{ '&:focus': { boxShadow: onClickIcon ? shadows.focus : 'none' } }}
          />
        )}
        {suffix && <Text className="suffix">{suffix}</Text>}
      </StyledWrapper>
      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
      {!error && warning && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {warning}
        </Caption>
      )}
    </Box>
  );
};

TextInput.propTypes = {
  ...InputProps,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  onClickIcon: PropTypes.func,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  space: PropTypes.number,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  iconLabel: PropTypes.string,
  themeProps: PropTypes.shape(BoxProps),
  variant: PropTypes.oneOf(['default', 'condensed']),
  required: PropTypes.bool,
  error: PropTypes.string,
  warning: PropTypes.string,
};

TextInput.defaultProps = {
  placeholder: '',
  type: 'text',
  themeProps: {},
  variant: 'default',
};

export default TextInput;
