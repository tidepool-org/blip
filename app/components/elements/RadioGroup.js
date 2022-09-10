import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex, Text } from 'rebass/styled-components';
import { Radio as Base, RadioProps, Label } from '@rebass/forms';
import styled from 'styled-components';
import map from 'lodash/map';
import cx from 'classnames';

import { Caption } from './FontStyles';
import {
  default as baseTheme,
  colors,
  transitions,
} from '../../themes/baseTheme';

const StyledRadio = styled(Base)`
  color: ${colors.border.default};
  width: 1.5em;
  height: 1.5em;
  margin-right: 0.5em;

  cursor: pointer;
  transition: ${transitions.easeOut};
  position: relative;

  &.checked {
    color: ${colors.purpleMedium};
  }

  &.disabled {
    pointer-events: none;
    color: ${colors.text.primaryDisabled};
  }

  &.error {
    color: ${colors.feedback.danger};
  }
`;

const StyledRadioLabel = styled(Text)`
  margin-right: 2em;
  margin-top: .15em;

  &.disabled {
    color: ${colors.text.primaryDisabled};
  }

  &.error {
    color: ${colors.feedback.danger};
  }
`;

const Radio = (props) => {
  const { error, label, innerRef, ...radioProps } = props;

  const classNames = cx({
    checked: props.checked,
    disabled: props.disabled,
    error,
  });

  return (
    <Label width="auto" mb={2} alignItems="flex-start">
      <Box minWidth="auto">
        <StyledRadio ref={innerRef} className={classNames} {...radioProps} />
      </Box>
      <StyledRadioLabel className={classNames} as="span">
        {label}
      </StyledRadioLabel>
    </Label>
  );
};

Radio.propTypes = {
  ...RadioProps,
  label: PropTypes.string.isRequired,
};

export const RadioGroup = (props) => {
  const {
    disabled,
    id,
    label,
    name,
    options,
    value,
    variant,
    required,
    onChange,
    error,
    ...wrapperProps
  } = props;

  const labelId = `${id}-label`;
  const ariaLabelledBy = label ? labelId : undefined;
  const inputClasses = cx({
    required,
    error,
  });

  return (
    <Box
      role="radiogroup"
      id={id}
      aria-labelledby={ariaLabelledBy}
      {...wrapperProps}
    >
      {label && (
        <Label mb={2} id={labelId}>
          <Caption className={inputClasses}>{label}</Caption>
        </Label>
      )}
      <Flex
        justifyContent="flex-start"
        theme={baseTheme}
        variant={`inputs.radios.${variant}`}
      >
        {map(options, (option, i) => (
          <Radio
            disabled={disabled}
            id={`${name}-${i}`}
            key={option.value}
            name={name}
            value={String(option.value)}
            checked={String(value) === String(option.value)}
            onChange={onChange}
            label={option.label}
            error={error}
            innerRef={i === 0 ? props.innerRef : undefined}
          />
        ))}
      </Flex>
      {error && (
        <Caption ml={2} mt={2} className={inputClasses}>
          {error}
        </Caption>
      )}
    </Box>
  );
};

RadioGroup.propTypes = {
  id: PropTypes.string.isRequired,
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onChange: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['horizontal', 'vertical', 'verticalBordered']),
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    }),
  ).isRequired,
  required: PropTypes.bool,
  error: PropTypes.string,
};

RadioGroup.defaultProps = {
  variant: 'vertical',
  color: colors.text.default,
  fontSize: 1,
};

export default RadioGroup;
