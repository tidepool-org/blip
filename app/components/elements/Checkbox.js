import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text } from 'rebass/styled-components';
import { Checkbox as Base, Label, LabelProps, CheckboxProps } from '@rebass/forms';
import styled from 'styled-components';
import cx from 'classnames';
import { Caption } from './FontStyles';

import {
  default as baseTheme,
  colors,
} from '../../themes/baseTheme';

const StyledCheckbox = styled(Base)`
  color: ${props => props.sx?.color || colors.border.default};
  height: 1.25em;
  width: 1.25em;
  padding: 0;
  margin-right: 0.5em;
  cursor: pointer;

  &.checked {
    color: ${colors.purpleMedium};
    background-color: ${colors.white};
  }

  &.disabled {
    pointer-events: none;
    color: ${colors.text.primaryDisabled};
  }

  &.error {
    color: ${colors.feedback.danger};
  }
`;

const StyledCheckboxLabel = styled(Text)`
  &.disabled {
    color: ${colors.text.primaryDisabled};
  }

  &.error {
    color: ${colors.feedback.danger};
  }

  &.required::after {
    content: ' *';
    display: inline;
  }
`;

export const Checkbox = (props) => {
  const { error, required, label, themeProps, variant, ...checkboxProps } = props;

  const classNames = cx({
    checked: props.checked,
    disabled: props.disabled,
    error,
    required,
  });

  return (
    <>
      <Box
        as={Label}
        theme={baseTheme}
        variant={`inputs.checkboxes.${variant}`}
        sx={{
          backgroundColor: 'inherit',
          display: 'inline-flex !important',
          lineHeight: '1em',
        }}
        width="auto"
        {...themeProps}
      >
        <StyledCheckbox className={classNames} {...checkboxProps} />
        <StyledCheckboxLabel className={classNames} as="span">
          {label}
        </StyledCheckboxLabel>
      </Box>
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
  themeProps: PropTypes.shape(LabelProps),
  label: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'enlarged']),
};

Checkbox.defaultProps = {
  variant: 'default',
  themeProps: {},
};

export default Checkbox;
