import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { Flex, Box, BoxProps, Text, Label, Input as Base, InputProps } from 'theme-ui';
import cx from 'classnames';

import { Caption } from './FontStyles';
import { Icon } from './Icon';
import { fontWeights, shadows, breakpoints } from '../../themes/baseTheme';

const MOBILE_BREAKPOINT = breakpoints[1];

const StyledWrapper = styled(Flex)`
  position: relative;
  align-items: center;

  > input {
    flex: 1;

    // Below 16px, iOS will zoom in when focusing an input field, which is unwanted behaviour
    @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
      font-size: 16px;
    }
  }

  .MuiSvgIcon-root {
    color: inherit;
    pointer-events: inherit;
  }
`;

export function TextInput(props) {
  const {
    label,
    hideLabel,
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
    description,
    captionProps,
    className = {},
    sx = {},
    ...inputProps
  } = props;

  const inputClasses = cx({
    ...className,
    error,
    required,
    warning: !error && warning,
  });

  return (
    <Box sx={{ width, ...sx }} {...themeProps}>
      {label && (
        <Label
          htmlFor={name}
          sx={{
            visibility: hideLabel ? 'hidden' : 'visible',
            display: hideLabel ? ['none !important', 'block !important'] : 'block',
          }}
        >
          <Caption
            sx={{
              fontWeight: fontWeights.medium,
              fontSize: 1
            }}
            className={inputClasses}
          >
            {label}
          </Caption>
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

      {(error || warning || description) && (
        <Caption ml={2} mt={2} className={inputClasses} {...captionProps}>
          {error || warning || description}
        </Caption>
      )}
    </Box>
  );
}

TextInput.propTypes = {
  ...InputProps,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  hideLabel: PropTypes.bool,
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
  error: PropTypes.node,
  warning: PropTypes.string,
};

TextInput.defaultProps = {
  placeholder: '',
  type: 'text',
  themeProps: {},
  variant: 'default',
};

export default TextInput;
