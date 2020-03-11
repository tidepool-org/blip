import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from 'rebass/styled-components';
import { Select as Base, Label } from '@rebass/forms';
import styled from 'styled-components';
import map from 'lodash/map';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';

import { borders, colors, space } from '../../themes/baseTheme';
import { Caption } from './FontStyles';

const StyledSelect = styled(Flex)`
  color: ${colors.text.primary};

  > div {
    background-color: ${colors.white};
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    -o-appearance: none;
    appearance: none;
    border: ${borders.input};
  }

  select::-ms-expand {
    display: none;
  }

  select + svg {
    display: none;
  }

  .MuiSvgIcon-root {
    position: relative;
    right: ${space[5]}px;
    color: inherit;
    /* this is so when you click on the icon, your click actually goes on the dropdown menu */
    pointer-events: none;
  }
`;

export const Select = props => {
  const { disabled, name, label, value, options, ...wrapperProps } = props;

  return (
    <React.Fragment>
      <Label htmlFor={name}>
        <Caption>{label}</Caption>
      </Label>
      <StyledSelect alignItems="center">
        <Box {...wrapperProps}>
          <Base
            id={name}
            name={name}
            disabled={disabled}
            value={value}
            >
            {map(options, ({key, label}) => (
              <option
              id={key}
              key={key}
              value={key}
              >
                {label}
              </option>
            ))}
          </Base>
        </Box>
        <KeyboardArrowDownRoundedIcon />
      </StyledSelect>
    </React.Fragment>
  );
};

Select.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
};

Select.defaultProps = {
  width: [1/2, 1/4], // eslint-disable-line space-infix-ops
};

export default Select;
