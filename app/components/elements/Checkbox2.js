import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Text } from 'rebass/styled-components';
import { Checkbox as Base, Label } from '@rebass/forms';
import styled from 'styled-components';
import cx from 'classnames';

import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
} from '../../themes/baseTheme';

const StyledCheckbox = styled(Base)`
  color: ${colors.border.default};

  &.checked {
    color: ${colors.purpleMedium};
    background-color: ${colors.white};
  }
`;

const StyledLabel = styled(Text)`
  font-size: ${fontSizes[1]}px;
  font-weight: ${fontWeights.medium};
  font-family: ${fonts.default};

  color: ${props => (props.color ? props.color : colors.text.primary)};

  &.disabled {
    color: ${colors.text.primaryDisabled};
  }
`;

export const Checkbox = props => {
  const { disabled, name, label, checked, ...labelProps } = props;

  const classNames = cx({
    checked: props.checked,
    disabled: props.disabled,
  });

  return (
    <Label {...labelProps}>
      <Flex alignItems="center">
        <StyledCheckbox
          className={classNames}
          disabled={disabled}
          id={name}
          name={name}
          checked={checked}
        />
        <StyledLabel className={classNames}>{label}</StyledLabel>
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
