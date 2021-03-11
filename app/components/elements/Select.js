import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box, BoxProps } from 'rebass/styled-components';
import { Select as Base, Label, SelectProps } from '@rebass/forms';
import styled from 'styled-components';
import cx from 'classnames';
import map from 'lodash/map';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

import { space } from '../../themes/baseTheme';
import { Caption } from './FontStyles';

const StyledSelect = styled(Flex)`
  position: relative;
  flex-wrap: wrap;

  > div {
    flex-grow: 1;
  }

  /* Override browser default styles for selects */
  select {
    appearance: none;
    border: none;
  }

  /* Hide the default dropdown icon */
  select + svg {
    display: none;
  }

  .MuiSvgIcon-root {
    position: absolute;
    right: ${space[2]}px;
    color: inherit;
    /* Disable pointer events so click actually applies to the dropdown menu underneath */
    pointer-events: none;
  }
`;

export const Select = props => {
  const {
    disabled,
    innerRef,
    name,
    label,
    value,
    variant,
    options,
    onChange,
    themeProps,
    width,
    required,
    error,
    ...selectProps
  } = props;

  const classNames = cx({ disabled, error });
  const inputClasses = cx({
    error,
    required,
  });

  return (
    <Box width={['100%', '75%', '50%']} {...themeProps}>
      {label && (
        <Label htmlFor={name}>
          <Caption className={inputClasses}>{label}</Caption>
        </Label>
      )}
      <StyledSelect alignItems="center" className={classNames} variant={`inputs.select.${variant}`} {...selectProps}>
        <Base
          id={name}
          name={name}
          disabled={disabled}
          value={value}
          onChange={onChange}
          ref={innerRef}
        >
          {map(options, option => (
            <option
              id={option.value}
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </Base>
        <KeyboardArrowDownRoundedIcon />
      </StyledSelect>
      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
    </Box>
  );
};

Select.propTypes = {
  ...SelectProps,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'condensed']),
  themeProps: PropTypes.shape(BoxProps),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
};

Select.defaultProps = {
  themeProps: {},
  variant: 'default',
};

export default Select;
