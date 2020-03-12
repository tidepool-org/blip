import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text } from 'rebass/styled-components';
import { Checkbox as Base, Label } from '@rebass/forms';
import styled from 'styled-components';

import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
} from '../../themes/baseTheme';


const StyledCheckbox = styled(Base)`
  color: ${colors.purpleMedium};
`;

const StyledLabel = styled(Label)`
  font-size: ${fontSizes[1]}px;
  font-weight: ${fontWeights.medium};
  font-family: ${fonts.default};
  padding: 0 0 0 8px;
  color: ${props => (props.color ? props.color : colors.text.primary)};
`;

export const Checkbox = props => {
  const { disabled, name, label, checked, ...labelProps } = props;

  return (
    <Label {...labelProps}>
      <Flex alignItems="center">
        <StyledCheckbox
          disabled={disabled}
          id={name}
          name={name}
          checked={checked}
        />
        <StyledLabel>{label}</StyledLabel>
      </Flex>
    </Label>
  );
};

Checkbox.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
};

Checkbox.defaultProps = {
  width: [1/2, 1/4], // eslint-disable-line space-infix-ops
  p: 1,
};

export default Checkbox;
