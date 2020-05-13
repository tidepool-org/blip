import React from 'react';
import PropTypes from 'prop-types';
import { Text } from 'rebass/styled-components';
import { Checkbox as Base, Label, CheckboxProps } from '@rebass/forms';
import styled from 'styled-components';
import cx from 'classnames';
import { Caption } from './FontStyles';

import { colors, fonts, fontSizes, fontWeights } from '../../themes/baseTheme';

const StyledCheckbox = styled(Base)`
  color: ${colors.border.default};
  height: 1em;
  width: 1em;
  padding: 0;
  margin-right: 0.5em;
  cursor: pointer;

  &.checked {
    color: ${colors.purpleMedium};
    background-color: ${colors.white};
    height: 1em;
    width: 1em;
  }

  &.disabled {
    pointer-events: none;
    color: ${colors.text.primaryDisabled};
  }

  &.error {
    color: ${colors.orange};
  }
`;

const StyledCheckboxLabel = styled(Text)`
  font-size: ${fontSizes[1]}px;
  font-weight: ${fontWeights.medium};
  font-family: ${fonts.default};

  color: ${(props) => (props.color ? props.color : colors.text.primary)};

  &.disabled {
    color: ${colors.text.primaryDisabled};
  }

  &.error {
    color: ${colors.orange};
  }

  &.required::after {
    content: ' *';
    display: inline;
  }
`;

export const Checkbox = (props) => {
  const { error, required, label, ...checkboxProps } = props;

  const classNames = cx({
    checked: props.checked,
    disabled: props.disabled,
    error,
    required,
  });

  return (
    <>
      <Label width="auto" mb={2} alignItems="center">
        <StyledCheckbox className={classNames} {...checkboxProps} />
        <StyledCheckboxLabel className={classNames} as="span">
          {label}
        </StyledCheckboxLabel>
      </Label>
      {error && (
        <Caption ml={2} mt={2} className={classNames}>
          {error}
        </Caption>
      )}
    </>
  );
};

Checkbox.propTypes = {
  ...CheckboxProps,
  label: PropTypes.string,
};

Checkbox.defaultProps = {
  width: ['50%', '25%'], // eslint-disable-line space-infix-ops
  p: 1,
};

export default Checkbox;
