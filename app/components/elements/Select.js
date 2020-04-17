import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'rebass/styled-components';
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
    padding: ${space[2]}px;
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
  const { disabled, name, label, value, options, onChange, ...selectProps } = props;
  const classNames = cx({ disabled });

  return (
    <Box>
      {label && (
        <Label htmlFor={name}>
          <Caption>{label}</Caption>
        </Label>
      )}
      <StyledSelect alignItems="center" className={classNames} {...selectProps}>
        <Base
          id={name}
          name={name}
          disabled={disabled}
          value={value}
          onChange={onChange}
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
    </Box>
  );
};

Select.propTypes = {
  ...SelectProps,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
};

Select.defaultProps = {
  variant: 'inputs.select',
};

export default Select;
