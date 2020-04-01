import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'rebass/styled-components';
import { Label } from '@rebass/forms';
import map from 'lodash/map';

import Checkbox from './Checkbox';
import { Caption } from './FontStyles';
import {
  default as baseTheme,
  colors } from '../../themes/baseTheme';

export const CheckboxGroup = props => {
  const { disabled, id, label, name, options, value, variant, ...wrapperProps } = props;

  const labelId = `${id}-label`;
  const ariaLabelledBy = label ? labelId : undefined;
  return (
    <Box
      id={id}
      aria-labelledby={ariaLabelledBy}
      {...wrapperProps}
      theme={baseTheme}
      variant={variant}
    >
      {label && (
        <Label mb={2} id={labelId}>
          <Caption>{label}</Caption>
        </Label>
      )}
      <Flex flexDirection="column">
        {map(options, (option, i) => (
          <Checkbox
            role="checkbox"
            disabled={disabled}
            id={`${name}-${i}`}
            key={option.value}
            name={name}
            value={option.value}
            checked={value === option.value}
            label={option.label}
          />
        ))}
      </Flex>
    </Box>
  );
};

CheckboxGroup.propTypes = {
  id: PropTypes.string.isRequired,
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

CheckboxGroup.defaultProps = {
  color: colors.text.default,
};

export default CheckboxGroup;
