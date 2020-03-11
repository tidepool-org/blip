import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text } from 'rebass/styled-components';
import { Checkbox as Base, Label } from '@rebass/forms';
import styled from 'styled-components';

const StyledCheckbox = styled(Base)``;

export const Checkbox = props => {
  const { disabled, name, label, checked, ...labelProps } = props;

  return (
    <Label {...labelProps}>
      <Flex alignItems='center'>
        <StyledCheckbox
          disabled={disabled}
          id={name}
          name={name}
          checked={checked}
        />
        <Text>{label}</Text>
      </Flex>
    </Label>
  );
};

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
}

Checkbox.defaultProps = {
  width: [1/2, 1/4],
  p: 1,
};

export default Checkbox;
